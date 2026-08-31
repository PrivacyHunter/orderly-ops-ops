import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireAppAuth as requireSupabaseAuth } from "@/lib/auth-middleware";
import { assertStaff, assertDeveloper } from "./admin.server";

export const saveThemeVersion = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({
    name: z.string().min(1),
    config: z.any(),
  }).parse(data))
  .handler(async ({ context, data }) => {
    await assertStaff(context.supabase, context.userId);
    const { error } = await context.supabase
      .from("theme_versions" as any)
      .insert({
        name: data.name,
        config: data.config,
        created_by: context.userId
      } as any);
    if (error) throw error;
    return { success: true };
  });

export const getThemeHistory = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertStaff(context.supabase, context.userId);
    const { data: versions, error } = await context.supabase
      .from("theme_versions" as any)
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20);
    if (error) throw error;

    const rows = (versions ?? []) as any[];
    const userIds = [...new Set(rows.map((v) => v.created_by).filter(Boolean))];
    let emailsById: Record<string, string> = {};
    if (userIds.length > 0) {
      const sb = context.supabase as any;
      const { data: profiles } = await sb
        .from("profiles")
        .select("id, email")
        .in("id", userIds);
      (profiles || []).forEach((p: any) => {
        if (p.id && p.email) emailsById[p.id] = p.email;
      });
    }

    return rows.map((v) => ({
      ...v,
      creator_email: emailsById[v.created_by] || null,
    }));
  });

export const scheduleReport = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({
    name: z.string(),
    frequency: z.enum(["daily", "weekly", "monthly"]),
    recipient_email: z.string().email(),
    columns: z.array(z.string()),
    date_range_type: z.string(),
    format: z.enum(["pdf", "csv"])
  }).parse(data))
  .handler(async ({ context, data }) => {
    await assertStaff(context.supabase, context.userId);
    const { error } = await context.supabase
      .from("scheduled_reports" as any)
      .insert(data as any);
    if (error) throw error;
    return { success: true };
  });
