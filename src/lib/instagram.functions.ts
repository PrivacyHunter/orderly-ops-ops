import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";
import { requireAppAuth as requireSupabaseAuth } from "@/lib/auth-middleware";
import { assertStaff } from "./admin.server";

export const getInstagramSettings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertStaff(context.supabase, context.userId);
    const { data } = await context.supabase.from("instagram_settings").select("*").maybeSingle();
    return data;
  });

export const updateInstagramSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({
    access_token: z.string().optional(),
    instagram_user_id: z.string().optional(),
    username: z.string().optional(),
    is_connected: z.boolean().optional(),
    auto_publish: z.boolean().optional(),
    caption_language: z.string().optional(),
    token_expires_at: z.string().optional(),
  }).parse(data))
  .handler(async ({ context, data }) => {
    await assertStaff(context.supabase, context.userId);
    const { data: existing } = await context.supabase.from("instagram_settings").select("id, webhook_verify_token").maybeSingle();
    const patch: Record<string, unknown> = { ...data, updated_at: new Date().toISOString() };
    if (!existing?.webhook_verify_token) patch["webhook_verify_token"] = crypto.randomUUID().replace(/-/g, "");
    if (existing?.id) patch["id"] = existing.id;
    const { error } = await (context.supabase as any).from("instagram_settings").upsert(patch);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const reconnectInstagram = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ access_token: z.string().min(10) }).parse(data))
  .handler(async ({ context, data }) => {
    await assertStaff(context.supabase, context.userId);
    const profileRes = await fetch(`https://graph.instagram.com/me?fields=id,username&access_token=${encodeURIComponent(data.access_token)}`);
    const profile: any = await profileRes.json().catch(() => ({}));
    if (!profileRes.ok || !profile?.id) throw new Error("Instagram rejected this token");
    const { data: existing } = await context.supabase.from("instagram_settings").select("id, webhook_verify_token").maybeSingle();
    const { error } = await (context.supabase as any).from("instagram_settings").upsert({
      ...(existing?.id ? { id: existing.id } : {}),
      access_token: data.access_token,
      instagram_user_id: String(profile.id),
      username: profile.username ?? null,
      is_connected: true,
      last_sync_status: "success",
      last_sync_error: null,
      token_expires_at: new Date(Date.now() + 60 * 24 * 3600 * 1000).toISOString(),
      webhook_verify_token: existing?.webhook_verify_token ?? crypto.randomUUID().replace(/-/g, ""),
      updated_at: new Date().toISOString(),
    });
    if (error) throw new Error(error.message);
    return { ok: true, username: profile.username as string | null };
  });


export const initiateInstagramAuth = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertStaff(context.supabase, context.userId);

    const appId = process.env['INSTAGRAM_APP_ID'];
    if (!appId) throw new Error("Instagram is not configured yet — add INSTAGRAM_APP_ID and INSTAGRAM_APP_SECRET to the project environment variables, then retry.");

    const request = getRequest();
    const origin = new URL(request.url).origin;
    const state = crypto.randomUUID();
    const { data: existing } = await context.supabase
      .from("instagram_settings")
      .select("id, webhook_verify_token")
      .maybeSingle();

    const patch: Record<string, unknown> = {
      oauth_state: state,
      webhook_verify_token: existing?.webhook_verify_token ?? crypto.randomUUID().replace(/-/g, ""),
      updated_at: new Date().toISOString(),
    };
    if (existing?.id) patch["id"] = existing.id;

    const { error } = await (context.supabase as any).from("instagram_settings").upsert(patch);
    if (error) throw new Error(error.message);

    const redirectUri = `${origin}/api/public/instagram-oauth/callback`;
    const authUrl = new URL("https://api.instagram.com/oauth/authorize");
    authUrl.searchParams.set("client_id", appId);
    authUrl.searchParams.set("redirect_uri", redirectUri);
    authUrl.searchParams.set("scope", "user_profile,user_media");
    authUrl.searchParams.set("response_type", "code");
    authUrl.searchParams.set("state", state);

    return { url: authUrl.toString() };
  });

export const syncInstagramPosts = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { mediaId?: string } | undefined) => data ?? {})
  .handler(async ({ context, data }) => {
    await assertStaff(context.supabase, context.userId);
    const { fetchMedia, upsertMedia, adviceFor } = await import("./instagram-media.server");
    const sb = context.supabase as any;
    let settings: any = null;
    try {
      const res = await context.supabase.from("instagram_settings").select("*").maybeSingle();
      settings = res.data;
      if (!settings?.is_connected || !settings?.access_token) throw new Error("Instagram not connected");
      const items = await fetchMedia(settings.access_token, data?.mediaId);
      const count = await upsertMedia(sb, items, data?.mediaId ? "retry" : "manual");
      await sb.from("instagram_settings").update({ last_sync: new Date().toISOString(), last_sync_status: "success", last_sync_error: null }).eq("id", settings.id);
      await sb.from("instagram_sync_logs").insert({ status: "success", message: `Published ${count} media item(s)`, posts_synced: count, media_id: data?.mediaId ?? null, resolved: true, user_id: context.userId });
      return { ok: true, synced: count };
    } catch (err: any) {
      const message = err?.message ?? "Unknown error";
      await sb.from("instagram_sync_logs").insert({ status: "error", message, media_id: data?.mediaId ?? null, error_code: String(err?.code ?? ""), recommended_action: adviceFor(err?.code, message), user_id: context.userId });
      if (settings?.id) await sb.from("instagram_settings").update({ last_sync_status: "error", last_sync_error: message }).eq("id", settings.id);
      throw new Error(message);
    }
  });

export const retrySyncLog = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ logId: z.string() }).parse(data))
  .handler(async ({ context, data }) => {
    await assertStaff(context.supabase, context.userId);
    const { fetchMedia, upsertMedia, adviceFor } = await import("./instagram-media.server");
    const sb = context.supabase as any;
    const { data: log } = await sb.from("instagram_sync_logs").select("*").eq("id", data.logId).maybeSingle();
    if (!log) throw new Error("Log entry not found");
    const { data: settings } = await context.supabase.from("instagram_settings").select("*").maybeSingle();
    if (!settings?.access_token) throw new Error("Instagram not connected");
    try {
      const items = await fetchMedia(settings.access_token, log.media_id ?? undefined);
      const count = await upsertMedia(sb, items, "retry");
      await sb.from("instagram_sync_logs").update({ resolved: true }).eq("id", data.logId);
      await sb.from("instagram_sync_logs").insert({ status: "success", message: `Manual retry recovered ${count} item(s)`, posts_synced: count, media_id: log.media_id, resolved: true, user_id: context.userId });
      return { ok: true, synced: count };
    } catch (err: any) {
      await sb.from("instagram_sync_logs").insert({ status: "error", message: err?.message ?? "Retry failed", media_id: log.media_id, error_code: String(err?.code ?? ""), recommended_action: adviceFor(err?.code, err?.message), user_id: context.userId });
      throw new Error(err?.message);
    }
  });

export const getInstagramMetrics = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertStaff(context.supabase, context.userId);
    const [logsRes, postsRes] = await Promise.all([
      (context.supabase as any).from("instagram_sync_logs").select("*").order("created_at", { ascending: false }).limit(100),
      (context.supabase as any).from("instagram_posts").select("id, timestamp, sync_status, last_sync_error").limit(500)
    ]);
    const logs = logsRes.data || [];
    const successful = logs.filter((l: any) => l.status === 'success');
    const failures = logs.filter((l: any) => l.status === 'error');
    return {
      total_syncs: logs.length,
      success_rate: logs.length ? (successful.length / logs.length) * 100 : 0,
      recent_failures: failures.slice(0, 10),
      posts_status: postsRes.data || []
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

export const getInstagramLogs = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertStaff(context.supabase, context.userId);
    const { data } = await (context.supabase as any).from("instagram_sync_logs").select("*").order("created_at", { ascending: false }).limit(50);
    return data || [];
  });
