import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireAppAuth as requireSupabaseAuth } from "@/lib/auth-middleware";

export const ORDER_STAGES = [
  "pending",
  "designing",
  "sampling",
  "production",
  "quality_check",
  "shipped",
  "delivered",
  "cancelled",
] as const;

export type OrderStage = (typeof ORDER_STAGES)[number];

export const ORDER_STAGE_LABELS: Record<OrderStage, string> = {
  pending: "Order Received",
  designing: "Design & Tech Pack",
  sampling: "Fabric & Sampling",
  production: "Bulk Production",
  quality_check: "Quality Assurance",
  shipped: "Express Shipping",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export const ORDER_STAGE_PROGRESS: Record<OrderStage, number> = {
  pending: 10,
  designing: 25,
  sampling: 40,
  production: 65,
  quality_check: 82,
  shipped: 94,
  delivered: 100,
  cancelled: 100,
};

function publicClientConfig() {
  const url = process.env["SUPABASE_URL"] || process.env["VITE_SUPABASE_URL"];
  const key =
    process.env["SUPABASE_PUBLISHABLE_KEY"] ||
    process.env["VITE_SUPABASE_PUBLISHABLE_KEY"] ||
    process.env["SUPABASE_ANON_KEY"] ||
    process.env["VITE_SUPABASE_ANON_KEY"];
  if (!url || !key) throw new Error("Backend is not configured");
  return { url, key };
}

async function publicClient() {
  const { createClient } = await import("@supabase/supabase-js");
  const { url, key } = publicClientConfig();
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

export const submitCustomOrder = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z
      .object({
        name: z.string().min(2).max(120),
        email: z.string().email(),
        phone: z.string().max(60).default(""),
        company: z.string().max(120).default(""),
        product: z.string().max(160).default(""),
        quantity: z.number().int().nonnegative().default(0),
        moq: z.string().max(60).default(""),
        colors: z.string().max(200).default(""),
        deliveryTime: z.string().max(80).default(""),
        designDetails: z.string().max(4000).default(""),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const trackingId = `AS-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    const client = await publicClient();

    const { error } = await client.from("custom_orders" as any).insert({
      tracking_id: trackingId,
      name: data.name,
      email: data.email,
      phone: data.phone,
      company: data.company,
      product: data.product,
      quantity: data.quantity,
      moq: data.moq,
      colors: data.colors,
      delivery_time: data.deliveryTime,
      design_details: data.designDetails,
      status: "pending",
    } as any);
    if (error) throw new Error(error.message);

    try {
      const { sendInquiryEmail } = await import("./email.server");
      await sendInquiryEmail({
        name: data.name,
        email: data.email,
        subject: `New Custom Order ${trackingId} — ${data.product || "Custom Apparel"}`,
        message: data.designDetails,
        details: {
          "Tracking ID": trackingId,
          Product: data.product,
          Quantity: String(data.quantity),
          MOQ: data.moq,
          Colors: data.colors,
          "Delivery time": data.deliveryTime,
          Phone: data.phone,
          Company: data.company,
        },
      });
    } catch (mailError) {
      console.error("Custom order email failed:", mailError);
    }

    return { success: true as const, trackingId };
  });

export const trackCustomOrder = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => z.object({ trackingId: z.string().min(3).max(40) }).parse(data))
  .handler(async ({ data }) => {
    const client = await publicClient();
    const { data: row } = await client
      .from("custom_orders" as any)
      .select("tracking_id, product, quantity, status, created_at, updated_at")
      .eq("tracking_id", data.trackingId.trim().toUpperCase())
      .maybeSingle();

    if (!row) return null;
    const order = row as any;
    const status = (ORDER_STAGES as readonly string[]).includes(order.status)
      ? (order.status as OrderStage)
      : "pending";
    return {
      trackingId: order.tracking_id as string,
      product: (order.product as string) || "Custom Apparel",
      quantity: (order.quantity as number) ?? 0,
      status,
      label: ORDER_STAGE_LABELS[status],
      progress: ORDER_STAGE_PROGRESS[status],
      updatedAt: (order.updated_at as string) ?? (order.created_at as string),
    };
  });

export const listCustomOrders = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { assertStaff } = await import("./admin.server");
    await assertStaff(context.supabase, context.userId);
    const { data, error } = await context.supabase
      .from("custom_orders" as any)
      .select("*")
      .order("created_at", { ascending: false })
      .limit(300);
    if (error) throw new Error(error.message);
    return (data ?? []) as any[];
  });

export const updateCustomOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        id: z.string().uuid(),
        status: z.enum(ORDER_STAGES).optional(),
        adminNotes: z.string().max(2000).optional(),
      })
      .parse(data),
  )
  .handler(async ({ context, data }) => {
    const { assertStaff } = await import("./admin.server");
    await assertStaff(context.supabase, context.userId);
    const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (data.status) patch["status"] = data.status;
    if (data.adminNotes !== undefined) patch["admin_notes"] = data.adminNotes;
    const { error } = await context.supabase
      .from("custom_orders" as any)
      .update(patch as any)
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const deleteCustomOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ context, data }) => {
    const { assertStaff } = await import("./admin.server");
    await assertStaff(context.supabase, context.userId);
    const { error } = await context.supabase.from("custom_orders" as any).delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });
