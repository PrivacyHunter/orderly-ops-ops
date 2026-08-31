import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/tracking")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = await request.json();
          const { path, referrer, userAgent: bodyUa, location: bodyLocation } = body;
          const userAgent = bodyUa || request.headers.get("user-agent") || "";

          // Edge/CDN geo headers (Vercel + Cloudflare) so visitors resolve even
          // when the browser never shares its precise location.
          const h = request.headers;
          const header = (...names: string[]) => {
            for (const name of names) {
              const value = h.get(name);
              if (value) return decodeURIComponent(value);
            }
            return null;
          };
          const num = (value: string | null) => (value && !Number.isNaN(Number(value)) ? Number(value) : null);
          const edgeLocation = {
            city: header("x-vercel-ip-city", "cf-ipcity"),
            region: header("x-vercel-ip-country-region", "cf-region"),
            country: header("x-vercel-ip-country", "cf-ipcountry", "x-country-code"),
            latitude: num(header("x-vercel-ip-latitude", "cf-iplatitude")),
            longitude: num(header("x-vercel-ip-longitude", "cf-iplongitude")),
          };
          const location = {
            city: bodyLocation?.city ?? edgeLocation.city,
            region: bodyLocation?.region ?? edgeLocation.region,
            country: bodyLocation?.country ?? edgeLocation.country,
            latitude: bodyLocation?.latitude ?? edgeLocation.latitude,
            longitude: bodyLocation?.longitude ?? edgeLocation.longitude,
          };

          // Basic device/browser parsing from UA if not provided
          const browser = userAgent?.includes("Chrome") ? "Chrome" : 
                          userAgent?.includes("Firefox") ? "Firefox" : 
                          userAgent?.includes("Safari") ? "Safari" : "Other";
          
          const os = userAgent?.includes("Windows") ? "Windows" :
                     userAgent?.includes("Mac") ? "MacOS" :
                     userAgent?.includes("Android") ? "Android" :
                     userAgent?.includes("iPhone") ? "iOS" : "Other";

          const device = userAgent?.includes("Mobi") ? "Mobile" : "Desktop";

          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
          const { error } = await supabaseAdmin
            .from("user_tracking")
            .insert({
              page_path: path,
              browser,
              os,
              device,
              city: location?.city,
              region: location?.region,
              country: location?.country,
              latitude: location?.latitude,
              longitude: location?.longitude,
              location_json: location,
              created_at: new Date().toISOString(),
            });

          if (error) throw error;
          return new Response(JSON.stringify({ success: true }), { status: 200 });
        } catch (err) {
          console.error("Tracking error:", err);
          return new Response(JSON.stringify({ success: false }), { status: 500 });
        }
      }
    }
  }
});
