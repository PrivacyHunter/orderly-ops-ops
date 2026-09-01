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

type ClassifiableProduct = {
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
