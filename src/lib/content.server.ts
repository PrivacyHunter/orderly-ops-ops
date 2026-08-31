import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/integrations/supabase/types";
import { assertStaff } from "./admin.server";

type DB = SupabaseClient<Database>;

const DEFAULT_LANDING_CONTENT = {
  hero: {
    ctaText: "I have approved the plan",
    title: "Unleash Your Ambition",
  },
};

const DEFAULT_FOOTER_CONTENT = {
  description: "Leading manufacturer of high-performance custom sportswear and activewear. Exporting excellence from Sialkot to the world.",
  copyright: "© 2026 Ambition Sports. All Rights Reserved.",
  newsletterTitle: "Newsletter",
  newsletterDescription: "Subscribe to get latest updates and new product launches.",
};

function getPublicClient() {
  const url = process.env["SUPABASE_URL"] || process.env["VITE_SUPABASE_URL"];
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"] || process.env["VITE_SUPABASE_PUBLISHABLE_KEY"];
  if (!url || !key) return null;

  return createClient<Database>(url, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const headers = new Headers(init?.headers);
        if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) {
          headers.delete("Authorization");
        }
        headers.set("apikey", key);
        return fetch(input, { ...init, headers });
      },
    },
  });
}

export async function fetchLandingPageContent() {
  const client = getPublicClient();
  if (!client) return DEFAULT_LANDING_CONTENT;
  const { data, error } = await client
    .from("site_settings")
    .select("value")
    .eq("key", "landing_page_content")
    .maybeSingle();
  
  if (error || !data?.value) return DEFAULT_LANDING_CONTENT;
  try {
    return JSON.parse(data.value);
  } catch {
    return DEFAULT_LANDING_CONTENT;
  }
}

export async function fetchFooterContent() {
  const client = getPublicClient();
  if (!client) return DEFAULT_FOOTER_CONTENT;
  const { data, error } = await client
    .from("site_settings")
    .select("value")
    .eq("key", "footer_content")
    .maybeSingle();
  
  if (error || !data?.value) return DEFAULT_FOOTER_CONTENT;
  try {
    return JSON.parse(data.value);
  } catch {
    return DEFAULT_FOOTER_CONTENT;
  }
}

export async function updateLandingPageContent(supabase: DB, userId: string, data: any) {
  await assertStaff(supabase, userId);
  const { error } = await supabase
    .from("site_settings")
    .upsert({ 
      key: "landing_page_content", 
      value: JSON.stringify(data),
      updated_at: new Date().toISOString()
    }, { onConflict: "key" });
  if (error) throw new Error(error.message);
  return { ok: true };
}

export async function updateFooterContent(supabase: DB, userId: string, data: any) {
  await assertStaff(supabase, userId);
  const { error } = await supabase
    .from("site_settings")
    .upsert({ 
      key: "footer_content", 
      value: JSON.stringify(data),
      updated_at: new Date().toISOString()
    }, { onConflict: "key" });
  if (error) throw new Error(error.message);
  return { ok: true };
}
