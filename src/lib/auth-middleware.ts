import { createClient } from "@supabase/supabase-js";
import { createMiddleware } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import type { Database } from "@/integrations/supabase/types";

function publicApiFetch(key: string): typeof fetch {
  return (input, init) => {
    const headers = new Headers(input instanceof Request ? input.headers : undefined);
    if (init?.headers) new Headers(init.headers).forEach((value, name) => headers.set(name, value));
    if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) {
      headers.delete("Authorization");
    }
    headers.set("apikey", key);
    return fetch(input, { ...init, headers });
  };
}

/** Validates server-function requests while supporting Vercel's existing VITE_* deployment variables. */
export const requireAppAuth = createMiddleware({ type: "function" }).server(async ({ next }) => {
  const url = process.env["SUPABASE_URL"] || process.env["VITE_SUPABASE_URL"];
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"] || process.env["VITE_SUPABASE_PUBLISHABLE_KEY"];
  if (!url || !key) throw new Error("Server authentication is not configured");

  const authorization = getRequest().headers.get("authorization");
  const token = authorization?.startsWith("Bearer ") ? authorization.slice(7) : "";
  if (!token || token.split(".").length !== 3) throw new Error("Unauthorized");

  const supabase = createClient<Database>(url, key, {
    global: { fetch: publicApiFetch(key), headers: { Authorization: `Bearer ${token}` } },
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await supabase.auth.getClaims(token);
  const userId = data?.claims?.sub;
  if (error || !userId) throw new Error("Unauthorized");

  return next({ context: { supabase, userId, claims: data.claims } });
});