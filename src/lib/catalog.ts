/** Shared, client-safe catalog taxonomy helpers (categories, sub-categories, pricing). */

export type CategoryKey = "sportswear" | "activewear" | "casualwear";

export const CATEGORY_LABELS: Record<CategoryKey, string> = {
  sportswear: "Sportswear",
  activewear: "Activewear",
  casualwear: "Casual Wear",
};

export const CATEGORY_ROUTES: Record<CategoryKey, "/sportswear" | "/activewear" | "/casual-wear"> = {
  sportswear: "/sportswear",
  activewear: "/activewear",
  casualwear: "/casual-wear",
};

export type Subcategory = {
  category: CategoryKey;
  slug: string;
  name: string;
  keywords: string[];
};

/** Exactly three sub-categories per main category. */
export const SUBCATEGORIES: Subcategory[] = [
  { category: "sportswear", slug: "team-uniforms-match-kits", name: "Team Uniforms & Match Kits", keywords: ["kit", "uniform", "set"] },
  { category: "sportswear", slug: "sublimated-jerseys", name: "Sublimated Jerseys", keywords: ["jersey", "sublimat", "shirt"] },
  { category: "sportswear", slug: "tracksuits-training-sets", name: "Tracksuits & Training Sets", keywords: ["tracksuit", "training", "jacket", "hoodie", "short", "jogger", "pant"] },

  { category: "activewear", slug: "compression-wear", name: "Compression Wear", keywords: ["compression", "base layer"] },
  { category: "activewear", slug: "leggings-tights", name: "Leggings & Tights", keywords: ["legging", "tight"] },
  { category: "activewear", slug: "gym-tees-tank-tops", name: "Gym Tees & Tank Tops", keywords: ["tee", "t-shirt", "tank", "stringer", "top", "gym"] },

  { category: "casualwear", slug: "hoodies-sweatshirts", name: "Hoodies & Sweatshirts", keywords: ["hood", "sweat", "crewneck"] },
  { category: "casualwear", slug: "casual-jackets", name: "Casual Jackets", keywords: ["jacket", "coat", "bomber", "varsity", "windbreaker"] },
  { category: "casualwear", slug: "casual-tees-polos", name: "Casual Tees & Polos", keywords: ["tee", "polo", "shirt", "chino", "short"] },
];

/** Sub-categories of one main category, in display order. */
export function subcategoriesFor(category: CategoryKey): Subcategory[] {
  const order: Record<CategoryKey, string[]> = {
    sportswear: ["team-uniforms-match-kits", "sublimated-jerseys", "tracksuits-training-sets"],
    activewear: ["gym-tees-tank-tops", "leggings-tights", "compression-wear"],
    casualwear: ["hoodies-sweatshirts", "casual-jackets", "casual-tees-polos"],
  };
  return order[category]
    .map((slug) => SUBCATEGORIES.find((s) => s.slug === slug))
    .filter((s): s is Subcategory => Boolean(s));
}

export function subcategoryName(slug: string | null | undefined): string {
  return SUBCATEGORIES.find((s) => s.slug === slug)?.name ?? "";
}

export function isCategoryKey(value: string): value is CategoryKey {
  return value === "sportswear" || value === "activewear" || value === "casualwear";
}

export type ClassifiableProduct = {
  slug?: string | null;
  name?: string | null;
  description?: string | null;
  category?: string | null;
  subcategory?: string | null;
};

/**
 * Resolve a product's sub-category: explicit admin assignment first, then a
 * keyword match on the product name, then the category's first sub-category.
 */
export function resolveSubcategory(
  product: ClassifiableProduct,
  assignments: Record<string, string> = {},
): string {
  const category = (product.category ?? "sportswear") as CategoryKey;
  const subs = subcategoriesFor(isCategoryKey(category) ? category : "sportswear");

  const assigned = product.subcategory || (product.slug ? assignments[product.slug] : undefined);
  if (assigned && subs.some((s) => s.slug === assigned)) return assigned;

  const haystack = `${product.name ?? ""} ${product.description ?? ""}`.toLowerCase();
  const ordered = SUBCATEGORIES.filter((s) => s.category === category);
  for (const sub of ordered) {
    if (sub.keywords.some((k) => haystack.includes(k))) return sub.slug;
  }
  return subs[0]?.slug ?? "";
}

/** Only prices greater than zero are real prices. */
export function hasPrice(price: number | string | null | undefined): boolean {
  const value = typeof price === "string" ? Number(price) : price;
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

/** Formatted price, or null when the product is quote-only. */
export function formatPrice(
  price: number | string | null | undefined,
  currency: string | null | undefined = "USD",
): string | null {
  if (!hasPrice(price)) return null;
  const value = typeof price === "string" ? Number(price) : (price as number);
  return `${currency || "USD"} ${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}

/* ------------------------------------------------------------------ *
 * Admin-managed catalog configuration
 * ------------------------------------------------------------------ */

export type CatalogSub = { slug: string; name: string; enabled: boolean };

export type CatalogCategory = {
  slug: string;
  name: string;
  description: string;
  enabled: boolean;
  subcategories: CatalogSub[];
};

export type CatalogConfig = {
  assignments: Record<string, string>;
  categories: CatalogCategory[];
};

/** URL-safe slug from any label. */
export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

const CATEGORY_DESCRIPTIONS: Record<CategoryKey, string> = {
  sportswear: "Soccer, basketball & team kits built for match day.",
  activewear: "Leggings, tanks, compression & training tees.",
  casualwear: "Hoodies, jackets, tracksuits & everyday essentials.",
};

/** Sublimation "Hot Items" — headline sport-uniform categories. */
export const HOT_ITEM_CATEGORIES: CatalogCategory[] = [
  {
    slug: "baseball-uniforms",
    name: "Baseball Uniforms",
    description: "Fully sublimated baseball jerseys, pants & caps for clubs and leagues.",
    enabled: true,
    subcategories: [
      { slug: "full-button-jerseys", name: "Full Button Jerseys", enabled: true },
      { slug: "two-button-jerseys", name: "Two Button Jerseys", enabled: true },
      { slug: "baseball-pants", name: "Baseball Pants", enabled: true },
    ],
  },
  {
    slug: "basketball-uniforms",
    name: "Basketball Uniforms",
    description: "Sublimated reversible jerseys, shooting shirts & shorts.",
    enabled: true,
    subcategories: [
      { slug: "reversible-jerseys", name: "Reversible Jerseys", enabled: true },
      { slug: "shooting-shirts", name: "Shooting Shirts", enabled: true },
      { slug: "basketball-shorts", name: "Basketball Shorts", enabled: true },
    ],
  },
  {
    slug: "american-football",
    name: "American Football",
    description: "Sublimated game & practice football jerseys with integrated pants.",
    enabled: true,
    subcategories: [
      { slug: "game-jerseys", name: "Game Jerseys", enabled: true },
      { slug: "practice-jerseys", name: "Practice Jerseys", enabled: true },
      { slug: "football-pants", name: "Football Pants", enabled: true },
    ],
  },
  {
    slug: "volleyball-uniforms",
    name: "Volleyball Uniforms",
    description: "Sublimated volleyball kits for men's and women's teams.",
    enabled: true,
    subcategories: [
      { slug: "mens-volleyball-kits", name: "Men's Volleyball Kits", enabled: true },
      { slug: "womens-volleyball-kits", name: "Women's Volleyball Kits", enabled: true },
      { slug: "volleyball-shorts", name: "Volleyball Shorts", enabled: true },
    ],
  },
  {
    slug: "ice-hockey",
    name: "Ice Hockey",
    description: "Sublimated hockey jerseys, socks & practice sets.",
    enabled: true,
    subcategories: [
      { slug: "hockey-jerseys", name: "Hockey Jerseys", enabled: true },
      { slug: "hockey-socks", name: "Hockey Socks", enabled: true },
      { slug: "hockey-practice-jerseys", name: "Practice Jerseys", enabled: true },
    ],
  },
  {
    slug: "custom-tshirts",
    name: "Custom T-Shirts",
    description: "All-over sublimated tees, dri-fit shirts & tank tops.",
    enabled: true,
    subcategories: [
      { slug: "sublimated-tees", name: "Sublimated Tees", enabled: true },
      { slug: "dri-fit-tees", name: "Dri-Fit Tees", enabled: true },
      { slug: "tank-tops", name: "Tank Tops", enabled: true },
    ],
  },
];

export const HOT_ITEM_SLUGS: string[] = HOT_ITEM_CATEGORIES.map((c) => c.slug);

export function isHotItem(slug: string): boolean {
  return HOT_ITEM_SLUGS.includes(slug);
}

/** The built-in categories, used until an admin edits the catalog. */
export const DEFAULT_CATEGORIES: CatalogCategory[] = [
  ...(["sportswear", "activewear", "casualwear"] as CategoryKey[]).map((key) => ({
    slug: key,
    name: CATEGORY_LABELS[key],
    description: CATEGORY_DESCRIPTIONS[key],
    enabled: true,
    subcategories: subcategoriesFor(key).map((sub) => ({
      slug: sub.slug,
      name: sub.name,
      enabled: true,
    })),
  })),
  ...HOT_ITEM_CATEGORIES,
];


function normalizeCategory(raw: any): CatalogCategory | null {
  const slug = slugify(String(raw?.slug ?? raw?.name ?? ""));
  if (!slug) return null;
  const subsRaw = Array.isArray(raw?.subcategories) ? raw.subcategories : [];
  const subcategories: CatalogSub[] = [];
  for (const sub of subsRaw) {
    const subSlug = slugify(String(sub?.slug ?? sub?.name ?? ""));
    if (!subSlug || subcategories.some((s) => s.slug === subSlug)) continue;
    subcategories.push({
      slug: subSlug,
      name: String(sub?.name ?? subSlug).slice(0, 80) || subSlug,
      enabled: sub?.enabled !== false,
    });
  }
  return {
    slug,
    name: String(raw?.name ?? slug).slice(0, 80) || slug,
    description: String(raw?.description ?? "").slice(0, 300),
    enabled: raw?.enabled !== false,
    subcategories,
  };
}

/** Parse the stored catalog setting, falling back to the built-in categories. */
export function parseCatalogConfig(raw: unknown): CatalogConfig {
  let parsed: any = raw;
  if (typeof raw === "string") {
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = null;
    }
  }
  const assignments =
    parsed?.assignments && typeof parsed.assignments === "object" ? parsed.assignments : {};
  const list = Array.isArray(parsed?.categories) ? parsed.categories : null;
  const categories = list
    ? list.map(normalizeCategory).filter((c: CatalogCategory | null): c is CatalogCategory => Boolean(c))
    : DEFAULT_CATEGORIES;
  return {
    assignments: assignments as Record<string, string>,
    categories: categories.length ? categories : DEFAULT_CATEGORIES,
  };
}

/** Categories that are switched on for the live site. */
export function liveCategories(config: CatalogConfig | undefined | null): CatalogCategory[] {
  return (config?.categories ?? DEFAULT_CATEGORIES).filter((c) => c.enabled);
}

export function findCategory(
  config: CatalogConfig | undefined | null,
  slug: string,
): CatalogCategory | undefined {
  return (config?.categories ?? DEFAULT_CATEGORIES).find((c) => c.slug === slug);
}

/** Enabled sub-categories of one category. */
export function liveSubcategories(
  config: CatalogConfig | undefined | null,
  categorySlug: string,
): CatalogSub[] {
  return (findCategory(config, categorySlug)?.subcategories ?? []).filter((s) => s.enabled);
}

export function subLabel(
  config: CatalogConfig | undefined | null,
  categorySlug: string,
  subSlug: string,
): string {
  return (
    findCategory(config, categorySlug)?.subcategories.find((s) => s.slug === subSlug)?.name ??
    subcategoryName(subSlug)
  );
}

/** Router link props for a category page (built-in route or dynamic page). */
export function categoryLinkProps(categorySlug: string, sub = ""): Record<string, unknown> {
  const builtin = (CATEGORY_ROUTES as Record<string, string>)[categorySlug];
  if (builtin) return { to: builtin, search: { sub } };
  return { to: "/category/$slug", params: { slug: categorySlug }, search: { sub } };
}

/** Sub-category of a product, honouring the admin-managed catalog. */
export function resolveSubForConfig(
  product: ClassifiableProduct,
  config: CatalogConfig | undefined | null,
): string {
  const category = product.category ?? "";
  const subs = liveSubcategories(config, category);
  if (!subs.length) return "";
  const assigned =
    product.subcategory || (product.slug ? (config?.assignments ?? {})[product.slug] : undefined);
  if (assigned && subs.some((s) => s.slug === assigned)) return assigned;

  const haystack = `${product.name ?? ""} ${product.description ?? ""}`.toLowerCase();
  for (const known of SUBCATEGORIES.filter((s) => s.category === category)) {
    if (known.keywords.some((k) => haystack.includes(k)) && subs.some((s) => s.slug === known.slug)) {
      return known.slug;
    }
  }
  return subs[0]?.slug ?? "";
}
