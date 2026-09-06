import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireAppAuth as requireSupabaseAuth } from "@/lib/auth-middleware";
import { parseCatalogConfig, type CatalogConfig } from "@/lib/catalog";

const SETTINGS_KEY = "catalog_taxonomy";

async function publicClient() {
  const { createClient } = await import("@supabase/supabase-js");
  const url = process.env["SUPABASE_URL"] || process.env["VITE_SUPABASE_URL"];
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"] || process.env["VITE_SUPABASE_PUBLISHABLE_KEY"];
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

/** Public catalog config: categories, sub-categories and product assignments. */
export const getCatalogTaxonomy = createServerFn({ method: "GET" }).handler(async (): Promise<CatalogConfig> => {
  const client = await publicClient();
  if (!client) return parseCatalogConfig(null);
  const { data } = await client.from("site_settings").select("value").eq("key", SETTINGS_KEY).maybeSingle();
  return parseCatalogConfig((data as any)?.value);
});

async function readConfig(supabase: any): Promise<CatalogConfig> {
  const { data } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", SETTINGS_KEY)
    .maybeSingle();
  return parseCatalogConfig((data as any)?.value);
}

async function writeConfig(supabase: any, config: CatalogConfig) {
  const { error } = await supabase
    .from("site_settings")
    .upsert({ key: SETTINGS_KEY, value: JSON.stringify(config) }, { onConflict: "key" });
  if (error) throw new Error(error.message);
}

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

    const config = await readConfig(context.supabase);
    if (data.subcategory) config.assignments[data.slug] = data.subcategory;
    else delete config.assignments[data.slug];

    await writeConfig(context.supabase, config);
    return { ok: true as const };
  });

const subSchema = z.object({
  slug: z.string().min(1).max(80),
  name: z.string().min(1).max(80),
  enabled: z.boolean(),
});

const categorySchema = z.object({
  slug: z.string().min(1).max(60),
  name: z.string().min(1).max(80),
  description: z.string().max(300).default(""),
  enabled: z.boolean(),
  subcategories: z.array(subSchema).max(24),
});

/** Staff-only: replace the category / sub-category structure of the site. */
export const saveCatalogCategories = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z.object({ categories: z.array(categorySchema).max(24) }).parse(data),
  )
  .handler(async ({ context, data }) => {
    const { assertStaff } = await import("./admin.server");
    await assertStaff(context.supabase, context.userId);

    const config = await readConfig(context.supabase);
    await writeConfig(context.supabase, { assignments: config.assignments, categories: data.categories });
    return { ok: true as const };
  });
