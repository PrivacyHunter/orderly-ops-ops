import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/tracking")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = await request.json();
          const { path, referrer, userAgent, location } = body;

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
