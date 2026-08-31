import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireAppAuth as requireSupabaseAuth } from "@/lib/auth-middleware";
import { assertStaff } from "./admin.server";

/** audit_logs has no FK to profiles, so join emails in code. */
async function attachProfiles(supabase: any, rows: any[]) {
  const ids = [...new Set(rows.map((r) => r.user_id).filter(Boolean))];
  if (!ids.length) return rows;
  const { data: profiles } = await supabase.from("profiles").select("id, email").in("id", ids);
  const map = new Map((profiles ?? []).map((p: any) => [p.id, p.email]));
  return rows.map((r) => ({ ...r, profiles: { email: map.get(r.user_id) ?? null } }));
}

export const logAuditAction = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({
    action: z.string(),
    action_type: z.enum(["theme", "role", "export", "backup", "template", "security"]).optional(),
    details: z.any().optional(),
  }).parse(data))
  .handler(async ({ context, data }) => {
    await assertStaff(context.supabase, context.userId);
    const { error } = await context.supabase
      .from("audit_logs" as any)
      .insert({
        user_id: context.userId,
        action: data.action,
        action_type: data.action_type || "security",
        details: data.details || {},
      } as any);
    if (error) throw new Error(error.message);
    return { success: true };
  });

export const getAuditLogs = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertStaff(context.supabase, context.userId);
    const { data, error } = await context.supabase
      .from("audit_logs" as any)
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) throw new Error(error.message);
    return await attachProfiles(context.supabase, (data ?? []) as any[]);
  });

export const getEmailLogs = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertStaff(context.supabase, context.userId);
    const { data, error } = await context.supabase
      .from("email_logs" as any)
      .select("*" as any)
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) throw new Error(error.message);
    return data as any[];
  });

export const exportAuditLogsCsv = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({
    user_id: z.string().uuid().optional(),
    action_type: z.string().optional(),
    date_from: z.string().optional(),
    date_to: z.string().optional(),
  }).parse(data))
  .handler(async ({ context, data }) => {
    await assertStaff(context.supabase, context.userId);
    let query = context.supabase
      .from("audit_logs" as any)
      .select("*")
      .order("created_at", { ascending: false });

    if (data.user_id) query = query.eq("user_id", data.user_id);
    if (data.action_type && data.action_type !== 'all') query = query.eq("action_type", data.action_type);
    if (data.date_from) query = query.gte("created_at", data.date_from);
    if (data.date_to) query = query.lte("created_at", data.date_to);

    const { data: rawLogs, error } = await query;
    if (error) throw new Error(error.message);
    const logs = await attachProfiles(context.supabase, (rawLogs ?? []) as any[]);

    // Convert to CSV
    const headers = ["ID", "User", "Action", "Type", "Details", "Date"];
    const rows = (logs || []).map((l: any) => [
      l.id,
      l.profiles?.email || l.user_id,
      l.action,
      l.action_type,
      JSON.stringify(l.details),
      l.created_at
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    ].join("\n");

    return csvContent;
  });