import { createFileRoute } from "@tanstack/react-router";

const ALLOWED_BUCKETS = ["site-media", "studio-assets"] as const;

function fail(status: number, code: string, detail: string) {
  console.error(`[media-proxy] ${code}: ${detail}`);
  const message =
    status === 404
      ? "This file could not be found. It may have been removed or renamed."
      : "Media is temporarily unavailable. Please retry in a moment.";
  return new Response(JSON.stringify({ error: code, message }), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

export const Route = createFileRoute("/api/public/media/$")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const splat = String((params as Record<string, string>)["_splat"] ?? "");
        const [bucket, ...rest] = splat.split("/");
        const path = rest.join("/");

        if (!bucket || !path || !ALLOWED_BUCKETS.includes(bucket as any)) {
          return fail(404, "invalid_path", `splat="${splat}"`);
        }

        const url =
          process.env["SUPABASE_URL"] ||
          process.env["VITE_SUPABASE_URL"] ||
          import.meta.env["VITE_SUPABASE_URL"];
        const key =
          process.env["SUPABASE_PUBLISHABLE_KEY"] ||
          process.env["VITE_SUPABASE_PUBLISHABLE_KEY"] ||
          process.env["SUPABASE_ANON_KEY"] ||
          process.env["VITE_SUPABASE_ANON_KEY"] ||
          import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"] ||
          import.meta.env["VITE_SUPABASE_ANON_KEY"];

        if (!url || !key) {
          return fail(
            503,
            "missing_env",
            `url=${url ? "set" : "missing"} key=${key ? "set" : "missing"} — set SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY on the host`,
          );
        }

        // Private buckets are readable with the publishable key thanks to the
        // public SELECT policy on these two buckets — no service role needed.
        const headers: Record<string, string> = { apikey: key };
        if (key.split(".").length === 3) headers["Authorization"] = `Bearer ${key}`;

        const target = `${url}/storage/v1/object/${bucket}/${path.split("/").map(encodeURIComponent).join("/")}`;

        let upstream: Response;
        try {
          upstream = await fetch(target, { headers });
        } catch (e) {
          return fail(502, "upstream_fetch_failed", `${target} → ${e instanceof Error ? e.message : String(e)}`);
        }

        if (!upstream.ok || !upstream.body) {
          const body = await upstream.text().catch(() => "");
          return fail(
            upstream.status === 404 || upstream.status === 400 ? 404 : 502,
            "upstream_error",
            `${target} → ${upstream.status} ${body.slice(0, 200)}`,
          );
        }

        return new Response(upstream.body, {
          headers: {
            "Content-Type": upstream.headers.get("content-type") || "application/octet-stream",
            "Cache-Control": "public, max-age=31536000, immutable",
          },
        });
      },
    },
  },
});
