import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireAppAuth as requireSupabaseAuth } from "@/lib/auth-middleware";
import {
  ADMIN_PERMISSIONS,
  assertDeveloper,
  assertRoleManager,
  assertStaff,
  listAccounts,
  listPermissionMap,
  listPermissions,
  resolveRole,
} from "./admin.server";

export const getMyRole = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const role = await resolveRole(context.supabase, context.userId);
    return {
      userId: context.userId,
      role,
      permissions: await listPermissions(context.supabase, context.userId, role),
    };
  });

export const getDashboard = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const role = await assertStaff(context.supabase, context.userId);
    const s = context.supabase;
    const [inquiries, quotes, orders, products, tracking] = await Promise.all([
      s.from("inquiries").select("*").order("created_at", { ascending: false }).limit(50),
      s.from("quotes").select("*").order("created_at", { ascending: false }).limit(50),
      s.from("orders").select("*").order("created_at", { ascending: false }).limit(50),
      s.from("products").select("*").order("sort_order", { ascending: true }),
      s.from("user_tracking").select("*").order("created_at", { ascending: false }).limit(1000),
    ]);
    return {
      role,
      inquiries: inquiries.data ?? [],
      quotes: quotes.data ?? [],
      orders: orders.data ?? [],
      products: products.data ?? [],
      tracking: role === "user" ? [] : (tracking.data ?? []),
      accounts: await listAccounts(s, role),
      permissions: await listPermissions(s, context.userId, role),
      permissionKeys: [...ADMIN_PERMISSIONS],
      permissionMap:
        role === "owner" || role === "developer" ? await listPermissionMap(s) : {},
    };
  });

export const setUserRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        userId: z.string().uuid(),
        role: z.enum(["owner", "admin", "developer", "user"]),
      })
      .parse(data),
  )
  .handler(async ({ context, data }) => {
    // Owners and developers may allocate roles; only developers touch developer rows.
    const callerRole = await assertRoleManager(context.supabase, context.userId);
    const s = context.supabase;

    const { data: targetRows } = await s
      .from("user_roles")
      .select("role")
      .eq("user_id", data.userId);
    const targetIsDeveloper = (targetRows ?? []).some((r) => r.role === "developer");

    if (callerRole !== "developer" && (data.role === "developer" || targetIsDeveloper)) {
      throw new Error("Forbidden: only developers can manage developer accounts");
    }

    await s.from("user_roles").delete().eq("user_id", data.userId);
    if (data.role !== "user") {
      const { error } = await s.from("user_roles").insert({ user_id: data.userId, role: data.role });
      if (error) throw new Error(error.message);
    }
    // Rights only apply to admins; clear them whenever the role changes away from admin.
    if (data.role !== "admin") {
      await s.from("admin_permissions" as any).delete().eq("user_id", data.userId);
    }
    return { ok: true as const };
  });

export const setAdminPermissions = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        userId: z.string().uuid(),
        permissions: z.array(z.enum(ADMIN_PERMISSIONS)).max(ADMIN_PERMISSIONS.length),
      })
      .parse(data),
  )
  .handler(async ({ context, data }) => {
    const callerRole = await assertRoleManager(context.supabase, context.userId);
    const s = context.supabase;

    const { data: targetRows } = await s
      .from("user_roles")
      .select("role")
      .eq("user_id", data.userId);
    const roles = (targetRows ?? []).map((r) => r.role);
    if (roles.includes("developer") && callerRole !== "developer") {
      throw new Error("Forbidden: only developers can manage developer accounts");
    }
    if (!roles.includes("admin")) {
      throw new Error("Rights can only be assigned to admin accounts");
    }

    await s.from("admin_permissions" as any).delete().eq("user_id", data.userId);
    if (data.permissions.length) {
      const { error } = await s.from("admin_permissions" as any).insert(
        data.permissions.map((permission) => ({
          user_id: data.userId,
          permission,
          granted_by: context.userId,
        })) as any,
      );
      if (error) throw new Error(error.message);
    }
    return { ok: true as const };
  });

export const saveSetting = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z.object({ key: z.string().min(1).max(120), value: z.string().max(20000) }).parse(data),
  )
  .handler(async ({ context, data }) => {
    await assertStaff(context.supabase, context.userId);
    const { error } = await context.supabase
      .from("site_settings")
      .upsert({ key: data.key, value: data.value }, { onConflict: "key" });
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const listSettings = createServerFn({ method: "GET" }).handler(async () => {
  const { createClient } = await import("@supabase/supabase-js");
  const url = process.env["SUPABASE_URL"] || process.env["VITE_SUPABASE_URL"];
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"] || process.env["VITE_SUPABASE_PUBLISHABLE_KEY"];
  if (!url || !key) return {};
  const client = createClient(
    url,
    key,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
  const { data } = await client.from("site_settings").select("key, value");
  return Object.fromEntries((data ?? []).map((r) => [r.key, r.value ?? ""]));
});

export const upsertProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        id: z.string().uuid().optional(),
        name: z.string().min(2).max(160),
        slug: z.string().min(2).max(160).regex(/^[a-z0-9-]+$/),
        category: z.string().min(2).max(60),
        description: z.string().max(4000).optional().default(""),
        price: z.number().nonnegative().optional(),
        stock: z.number().int().nonnegative().default(0),
        images: z.array(z.string().min(1).max(600)).max(12).default([]),
        cover_image: z.string().max(600).nullable().optional(),
        sizes: z.array(z.string().max(12)).max(20).default([]),
        colors: z.array(z.string().max(24)).max(20).default([]),
        is_featured: z.boolean().default(false),
        is_active: z.boolean().default(true),
        status: z.enum(["draft", "published", "scheduled"]).default("published"),
        scheduled_publish_at: z.string().nullable().optional(),
        sort_order: z.number().int().min(0).max(9999).default(0),
      })
      .parse(data),
  )
  .handler(async ({ context, data }) => {
    await assertStaff(context.supabase, context.userId);
    const { id, price, cover_image, scheduled_publish_at, ...rest } = data;
    const row = {
      ...rest,
      cover_image: cover_image || rest.images[0] || null,
      scheduled_publish_at: scheduled_publish_at || null,
      published_at: rest.status === "published" ? new Date().toISOString() : null,
      ...(id ? { id } : {}),
      ...(price === undefined ? {} : { price }),
      updated_at: new Date().toISOString(),
    };
    const { error } = await context.supabase
      .from("products")
      .upsert(row, { onConflict: id ? "id" : "slug" });
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const duplicateProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ context, data }) => {
    await assertStaff(context.supabase, context.userId);
    const { data: original, error: readError } = await context.supabase
      .from("products")
      .select("*")
      .eq("id", data.id)
      .single();
    if (readError || !original) throw new Error(readError?.message ?? "Product not found");

    const { id: _id, created_at: _c, updated_at: _u, ...rest } = original as Record<string, any>;
    const suffix = Date.now().toString(36);
    const { error } = await context.supabase.from("products").insert({
      ...rest,
      name: `${original.name} (Copy)`,
      slug: `${original.slug}-copy-${suffix}`.slice(0, 158),
      status: "draft",
      is_active: false,
      published_at: null,
      updated_at: new Date().toISOString(),
    } as any);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const deleteProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ context, data }) => {
    await assertStaff(context.supabase, context.userId);
    const { error } = await context.supabase.from("products").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });


export const updateStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        table: z.enum(["inquiries", "quotes", "orders"]),
        id: z.string().uuid(),
        status: z.string().min(2).max(40),
      })
      .parse(data),
  )
  .handler(async ({ context, data }) => {
    await assertStaff(context.supabase, context.userId);
    const { error } = await context.supabase
      .from(data.table)
      .update({ status: data.status })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const inviteUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        email: z.string().email(),
        role: z.enum(["owner", "admin", "developer", "user"]),
      })
      .parse(data),
  )
  .handler(async ({ context, data }) => {
    const callerRole = await assertRoleManager(context.supabase, context.userId);
    if (data.role === "developer" && callerRole !== "developer") {
      throw new Error("Forbidden: only developers can manage developer accounts");
    }
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { sendInvitationEmail } = await import("./email.server");

    // Check if user exists in auth
    const { data: { users }, error: fetchError } = await supabaseAdmin.auth.admin.listUsers();
    if (fetchError) throw fetchError;
    
    let targetUser = users.find(u => u.email === data.email);
    let userId = targetUser?.id;

    if (!userId) {
      // Create user if they don't exist
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: data.email,
        email_confirm: true,
      });
      if (createError) throw createError;
      userId = newUser.user.id;
    }

    // Set role
    await context.supabase.from("user_roles").delete().eq("user_id", userId);
    if (data.role !== "user") {
      const { error } = await context.supabase.from("user_roles").insert({ user_id: userId, role: data.role });
      if (error) throw new Error(error.message);
    }

    // Send email
    await sendInvitationEmail({
      email: data.email,
      role: data.role,
    });

    return { ok: true as const };
  });

export const backupSettings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertStaff(context.supabase, context.userId);
    const { data: settings } = await context.supabase.from("site_settings").select("*");
    const { data: seo } = await context.supabase.from("page_content").select("*").eq("section_key", "seo");
    
    return {
      settings: settings || [],
      seo: seo || [],
      timestamp: new Date().toISOString(),
      version: "1.0",
    };
  });

export const restoreSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({
    settings: z.array(z.any()),
    seo: z.array(z.any()),
  }).parse(data))
  .handler(async ({ context, data }) => {
    await assertDeveloper(context.supabase, context.userId);
    const s = context.supabase;

    for (const item of data.settings) {
      await s.from("site_settings").upsert({ key: item.key, value: item.value }, { onConflict: "key" });
    }

    for (const item of data.seo) {
      const { page, section_key, title, body, sort_order } = item;
      await s.from("page_content").upsert({ 
        page, section_key, title, body, sort_order,
        updated_at: new Date().toISOString()
      }, { onConflict: "page, section_key" });
    }

    // Insert audit log directly to avoid circular dependency
    await s.from("audit_logs" as any).insert({
      user_id: context.userId,
      action: "backup_restored",
      details: { timestamp: new Date().toISOString() }
    } as any);

    return { ok: true as const };
  });
