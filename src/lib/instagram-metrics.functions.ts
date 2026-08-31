import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireAppAuth as requireSupabaseAuth } from "@/lib/auth-middleware";
import { assertStaff } from "./admin.server";

export const getInstagramMetrics = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertStaff(context.supabase, context.userId);
    
    // Recent logs
    const { data: logs } = await (context.supabase as any)
      .from("instagram_sync_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);

    const successful = (logs || []).filter((l: any) => l.status === 'success');
    const failures = (logs || []).filter((l: any) => l.status === 'error');
    
    // Average Latency (seconds between created_at and webhook receive timestamp if logged)
    // For now, simple count metrics
    return {
      total_syncs: logs?.length || 0,
      success_rate: logs?.length ? (successful.length / logs.length) * 100 : 0,
      recent_failures: failures.slice(0, 10),
    };
  });

export const backfillInstagramMedia = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertStaff(context.supabase, context.userId);
    const { fetchMedia, upsertMedia } = await import("./instagram-media.server");
    const { data: settings } = await context.supabase.from("instagram_settings").select("*").maybeSingle();
    if (!settings?.access_token) throw new Error("No token");
    
    const items = await fetchMedia(settings.access_token);
    const count = await upsertMedia(context.supabase as any, items, "backfill");
    
    return { count };
  });
