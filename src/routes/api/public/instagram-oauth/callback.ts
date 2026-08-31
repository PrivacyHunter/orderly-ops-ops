import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/instagram-oauth/callback")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const code = url.searchParams.get("code");
        const state = url.searchParams.get("state");
        const origin = url.origin;

        if (!code || !state) {
          return new Response(null, { status: 302, headers: { Location: `${origin}/auth?instagram=missing_code` } });
        }

        const appId = process.env['INSTAGRAM_APP_ID'];
        const appSecret = process.env['INSTAGRAM_APP_SECRET'];
        if (!appId || !appSecret) {
          return new Response(null, { status: 302, headers: { Location: `${origin}/auth?instagram=missing_config` } });
        }

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data: settings } = await supabaseAdmin
          .from("instagram_settings")
          .select("id, oauth_state, webhook_verify_token")
          .maybeSingle();

        if (!settings?.id || settings.oauth_state !== state) {
          return new Response(null, { status: 302, headers: { Location: `${origin}/auth?instagram=invalid_state` } });
        }

        const redirectUri = `${origin}/api/public/instagram-oauth/callback`;
        const tokenResponse = await fetch("https://api.instagram.com/oauth/access_token", {
          method: "POST",
          body: new URLSearchParams({
            client_id: appId,
            client_secret: appSecret,
            grant_type: "authorization_code",
            redirect_uri: redirectUri,
            code,
          }),
        });
        const shortToken: any = await tokenResponse.json().catch(() => ({}));

        if (!tokenResponse.ok || !shortToken?.access_token) {
          console.error("Instagram token exchange failed", shortToken);
          return new Response(null, { status: 302, headers: { Location: `${origin}/auth?instagram=token_failed` } });
        }

        const longTokenUrl = new URL("https://graph.instagram.com/access_token");
        longTokenUrl.searchParams.set("grant_type", "ig_exchange_token");
        longTokenUrl.searchParams.set("client_secret", appSecret);
        longTokenUrl.searchParams.set("access_token", shortToken.access_token);
        const longTokenResponse = await fetch(longTokenUrl);
        const longToken: any = await longTokenResponse.json().catch(() => ({}));
        const accessToken = longToken?.access_token || shortToken.access_token;
        const expiresIn = Number(longToken?.expires_in || 60 * 24 * 3600);

        const profileResponse = await fetch(`https://graph.instagram.com/me?fields=id,username&access_token=${encodeURIComponent(accessToken)}`);
        const profile: any = await profileResponse.json().catch(() => ({}));

        if (!profileResponse.ok || !profile?.id) {
          console.error("Instagram profile fetch failed", profile);
          return new Response(null, { status: 302, headers: { Location: `${origin}/auth?instagram=profile_failed` } });
        }

        const { error } = await (supabaseAdmin as any).from("instagram_settings").update({
          access_token: accessToken,
          instagram_user_id: String(profile.id),
          username: profile.username ?? null,
          is_connected: true,
          last_sync_status: "success",
          last_sync_error: null,
          oauth_state: null,
          token_expires_at: new Date(Date.now() + expiresIn * 1000).toISOString(),
          webhook_verify_token: settings.webhook_verify_token ?? crypto.randomUUID().replace(/-/g, ""),
          updated_at: new Date().toISOString(),
        }).eq("id", settings.id);

        if (error) {
          console.error("Instagram settings update failed", error);
          return new Response(null, { status: 302, headers: { Location: `${origin}/auth?instagram=save_failed` } });
        }

        return new Response(null, { status: 302, headers: { Location: `${origin}/panel?instagram=connected` } });
      },
    },
  },
});
