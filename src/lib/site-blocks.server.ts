import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { assertStaff } from "./admin.server";

type DB = SupabaseClient<Database>;

export type WorkflowStep = { num: string; title: string; desc: string; image: string };
export type SocialLinks = {
  facebook: string;
  instagram: string;
  twitter: string;
  linkedin: string;
  whatsapp: string;
  threads: string;
};
export type PageBanner = { eyebrow: string; title1: string; title2: string; subtitle: string; image: string };
export type Catalog = { title: string; subtitle: string; buttonLabel: string; fileUrl: string };
export type Facilities = {
  eyebrow: string;
  title1: string;
  title2: string;
  description: string;
  image1: string;
  image2: string;
  fabricImage1: string;
  fabricImage2: string;
  fabricLabel1: string;
  fabricLabel2: string;
  stat1Value: string;
  stat1Label: string;
  stat2Value: string;
  stat2Label: string;
  buttonLabel: string;
  buttonUrl: string;
};
export type CategoryCard = { title: string; desc: string; image: string; url: string };
export type SiteBlocks = {
  workflow: WorkflowStep[];
  social: SocialLinks;
  pageBanners: Record<string, PageBanner>;
  catalog: Catalog;
  facilities: Facilities;
  categories: CategoryCard[];
};

export const DEFAULT_CATEGORIES: CategoryCard[] = [
  { title: "Soccer Kits", desc: "Jerseys, shorts, socks & goalkeeper sets.", image: "", url: "/sportswear" },
  { title: "Basketball", desc: "Reversible jerseys & shooting shirts.", image: "", url: "/sportswear" },
  { title: "Gym / Activewear", desc: "Leggings, tanks, compression & training tees.", image: "", url: "/activewear" },
  { title: "Hoodies & Jackets", desc: "Fleece hoodies, windbreakers & tracksuits.", image: "", url: "/casual-wear" },
  { title: "Accessories", desc: "Caps, bags, socks, gloves & headwear.", image: "", url: "/casual-wear" },
  { title: "Custom Teamwear", desc: "Full club packages built to your spec.", image: "", url: "/quote" },
];

export const PAGE_BANNER_KEYS = [
  "sportswear",
  "activewear",
  "casual-wear",
  "contact",
  "customization",
  "about",
] as const;

export const DEFAULT_SITE_BLOCKS: SiteBlocks = {
  workflow: [
    { num: "01", title: "Design", desc: "Digital mockups & 3D tech packs.", image: "" },
    { num: "02", title: "Material", desc: "Elite performance fabrics selection.", image: "" },
    { num: "03", title: "Stitching", desc: "High-density flatlock precision.", image: "" },
    { num: "04", title: "QC Check", desc: "Rigorous final quality assurance.", image: "" },
    { num: "05", title: "Shipping", desc: "Express global logistics delivery.", image: "" },
  ],
  social: {
    facebook: "",
    instagram: "",
    twitter: "",
    linkedin: "",
    whatsapp: "https://wa.me/923049893054",
    threads: "",
  },
  pageBanners: {},
  catalog: {
    title: "Download Our Latest Catalog",
    subtitle: "Explore 500+ designs across all categories",
    buttonLabel: "Get PDF Catalog",
    fileUrl: "",
  },
  facilities: {
    eyebrow: "Industrial Excellence",
    title1: "Advanced",
    title2: "Facilities",
    description:
      "Operating from Sialkot's industrial hub, our facility integrates vertical production lines. We handle everything from high-tech sublimation to precision tailoring under one roof.",
    image1: "",
    image2: "",
    fabricImage1: "",
    fabricImage2: "",
    fabricLabel1: "220 GSM+",
    fabricLabel2: "Zero Fade",
    stat1Value: "25+",
    stat1Label: "Export Nations",
    stat2Value: "500k",
    stat2Label: "Units Yearly",
    buttonLabel: "Explore Stitching Unit",
    buttonUrl: "/quote",
  },
  categories: DEFAULT_CATEGORIES,
};

function getReadClient(): DB {
  const url = process.env["SUPABASE_URL"] || process.env["VITE_SUPABASE_URL"];
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"] || process.env["VITE_SUPABASE_PUBLISHABLE_KEY"];
  if (!url || !key) return supabaseAdmin as unknown as DB;
  return createClient<Database>(url, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const headers = new Headers(init?.headers);
        if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) headers.delete("Authorization");
        headers.set("apikey", key);
        return fetch(input, { ...init, headers });
      },
    },
  }) as unknown as DB;
}

export async function fetchSiteBlocks(): Promise<SiteBlocks> {
  let value: string | null = null;
  try {
    const { data } = await getReadClient()
      .from("site_settings")
      .select("value")
      .eq("key", "site_blocks")
      .maybeSingle();
    value = data?.value ?? null;
  } catch {
    value = null;
  }

  if (!value) return DEFAULT_SITE_BLOCKS;
  try {
    const parsed = JSON.parse(value) as Partial<SiteBlocks>;
    return {
      workflow: parsed.workflow?.length ? parsed.workflow : DEFAULT_SITE_BLOCKS.workflow,
      social: { ...DEFAULT_SITE_BLOCKS.social, ...(parsed.social ?? {}) },
      pageBanners: parsed.pageBanners ?? {},
      catalog: { ...DEFAULT_SITE_BLOCKS.catalog, ...(parsed.catalog ?? {}) },
      facilities: { ...DEFAULT_SITE_BLOCKS.facilities, ...(parsed.facilities ?? {}) },
      categories: parsed.categories?.length ? parsed.categories : DEFAULT_CATEGORIES,
    };
  } catch {
    return DEFAULT_SITE_BLOCKS;
  }
}

export async function updateSiteBlocks(supabase: DB, userId: string, blocks: SiteBlocks) {
  await assertStaff(supabase, userId);
  const { error } = await supabase.from("site_settings").upsert(
    { key: "site_blocks", value: JSON.stringify(blocks), updated_at: new Date().toISOString() },
    { onConflict: "key" },
  );
  if (error) throw new Error(error.message);
  return { ok: true as const };
}
