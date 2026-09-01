import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireAppAuth as requireSupabaseAuth } from "@/lib/auth-middleware";

const SETTINGS_KEY = "catalog_taxonomy";

type Taxonomy = { assignments: Record<string, string> };

async function publicClient() {
  const { createClient } = await import("@supabase/supabase-js");
  const url = process.env["SUPABASE_URL"] || process.env["VITE_SUPABASE_URL"];
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"] || process.env["VITE_SUPABASE_PUBLISHABLE_KEY"];
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

function parseTaxonomy(raw: unknown): Taxonomy {
  if (!raw) return { assignments: {} };
  try {
    const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
    const assignments = (parsed as any)?.assignments;
    return { assignments: assignments && typeof assignments === "object" ? assignments : {} };
  } catch {
    return { assignments: {} };
  }
}

/** Public sub-category assignments (product slug -> sub-category slug). */
export const getCatalogTaxonomy = createServerFn({ method: "GET" }).handler(async (): Promise<Taxonomy> => {
  const client = await publicClient();
  if (!client) return { assignments: {} };
  const { data } = await client.from("site_settings").select("value").eq("key", SETTINGS_KEY).maybeSingle();
  return parseTaxonomy((data as any)?.value);
});

/** Staff-only: assign a product to a sub-category. */
export const setProductSubcategory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        slug: z.string().min(1).max(200),
        subcategory: z.string().max(80),
      })
      .parse(data),
  )
  .handler(async ({ context, data }) => {
    const { assertStaff } = await import("./admin.server");
    await assertStaff(context.supabase, context.userId);

    const { data: row } = await context.supabase
      .from("site_settings")
      .select("value")
      .eq("key", SETTINGS_KEY)
      .maybeSingle();
    const taxonomy = parseTaxonomy((row as any)?.value);

    if (data.subcategory) taxonomy.assignments[data.slug] = data.subcategory;
    else delete taxonomy.assignments[data.slug];

    const { error } = await context.supabase
      .from("site_settings")
      .upsert({ key: SETTINGS_KEY, value: JSON.stringify(taxonomy) }, { onConflict: "key" });
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });
