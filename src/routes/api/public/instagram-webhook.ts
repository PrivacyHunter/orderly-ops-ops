import { createFileRoute } from "@tanstack/react-router";

/**
 * Real-time Instagram media webhook.
 * GET  -> Meta subscription handshake (hub.challenge)
 * POST -> new media published; fetched and stored immediately (deduplicated).
 */
export const Route = createFileRoute("/api/public/instagram-webhook")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const mode = url.searchParams.get("hub.mode");
        const token = url.searchParams.get("hub.verify_token");
        const challenge = url.searchParams.get("hub.challenge");

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data: settings } = await supabaseAdmin
          .from("instagram_settings")
          .select("webhook_verify_token")
          .maybeSingle();

        if (mode === "subscribe" && token && token === settings?.webhook_verify_token) {
          return new Response(challenge ?? "", { status: 200 });
        }
        return new Response("Forbidden", { status: 403 });
      },

      POST: async ({ request }) => {
        const raw = await request.text();
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { fetchMedia, upsertMedia } = await import("@/lib/instagram-media.server");

        const { data: settings } = await supabaseAdmin
          .from("instagram_settings")
          .select("*")
          .maybeSingle();

        if (!settings?.access_token || !settings?.is_connected) {
          return new Response("ok", { status: 200 });
        }

        let payload: any = {};
        try {
          payload = JSON.parse(raw);
        } catch {
          return new Response("Bad payload", { status: 400 });
        }

        const mediaIds: string[] = [];
        for (const entry of payload?.entry ?? []) {
          for (const change of entry?.changes ?? []) {
            const id = change?.value?.media_id ?? change?.value?.id;
            if (id) mediaIds.push(String(id));
          }
        }

        let synced = 0;
        for (const mediaId of [...new Set(mediaIds)]) {
          try {
            const items = await fetchMedia(settings.access_token, mediaId);
            synced += await upsertMedia(supabaseAdmin, items, "webhook");
            await (supabaseAdmin as any).from("instagram_sync_logs").insert({
              status: "success",
              message: "Realtime webhook published new media",
              posts_synced: 1,
              media_id: mediaId,
              payload: { mediaId },
              resolved: true,
            });
          } catch (err: any) {
            await (supabaseAdmin as any).from("instagram_sync_logs").insert({
              status: "error",
              message: err?.message ?? "Webhook media fetch failed",
              media_id: mediaId,
              error_code: String(err?.code ?? ""),
              recommended_action: "Use Retry Now on this entry, or reconnect Instagram if the token expired.",
              payload: { mediaId },
            });
          }
        }

        await (supabaseAdmin as any)
          .from("instagram_settings")
          .update({
            last_sync: new Date().toISOString(),
            last_sync_status: "success",
          })
          .eq("id", settings.id);

        return Response.json({ ok: true, synced });
      },
    },
  },
});
