import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireAppAuth as requireSupabaseAuth } from "@/lib/auth-middleware";

const bannerSchema = z.object({
  id: z.string().uuid().optional(),
  title1: z.string().min(1).max(80),
  title2: z.string().max(80).default(""),
  subtitle: z.string().max(160).default(""),
  image_url: z.string().min(1).max(600),
  accent: z.string().max(40).default("text-primary"),
  cta_label: z.string().max(40).default("Shop Now"),
  cta_url: z.string().max(200).default("/sportswear"),
  secondary_label: z.string().max(40).default("Custom Order"),
  secondary_url: z.string().max(200).default("/contact"),
  sort_order: z.number().int().min(0).max(9999).default(10),
  is_active: z.boolean().default(true),
  status: z.enum(["draft", "published", "scheduled"]).default("published"),
  scheduled_publish_at: z.string().nullable().optional(),
});

export const listBanners = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { assertStaff } = await import("./admin.server");
    const { fetchBanners } = await import("./banners.server");
    await assertStaff(context.supabase, context.userId);
    return fetchBanners(context.supabase);
  });

export const upsertBanner = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => bannerSchema.parse(data))
  .handler(async ({ context, data }) => {
    const { assertStaff } = await import("./admin.server");
    const { saveBanner } = await import("./banners.server");
    await assertStaff(context.supabase, context.userId);
    return saveBanner(context.supabase, data);
  });

export const deleteBanner = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ context, data }) => {
    const { assertStaff } = await import("./admin.server");
    const { removeBanner } = await import("./banners.server");
    await assertStaff(context.supabase, context.userId);
    await removeBanner(context.supabase, data.id);
    return { ok: true as const };
  });

export const reorderBanners = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ ids: z.array(z.string().uuid()).max(50) }).parse(data))
  .handler(async ({ context, data }) => {
    const { assertStaff } = await import("./admin.server");
    const { reorderBannerRows } = await import("./banners.server");
    await assertStaff(context.supabase, context.userId);
    await reorderBannerRows(context.supabase, data.ids);
    return { ok: true as const };
  });

export const getPublicBanners = createServerFn({ method: "GET" }).handler(async () => {
  const { fetchPublishedBanners } = await import("./banners.server");
  return fetchPublishedBanners();
});

export const getPublicProducts = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) =>
    z
      .object({
        category: z.string().max(40).optional(),
        featuredOnly: z.boolean().optional(),
      })
      .parse(data ?? {}),
  )
  .handler(async ({ data }) => {
    const { fetchPublishedProducts } = await import("./banners.server");
    return fetchPublishedProducts(data);
  });

export const getPublicProduct = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => z.object({ slug: z.string().min(1).max(200) }).parse(data))
  .handler(async ({ data }) => {
    const { fetchPublishedProduct } = await import("./banners.server");
    return fetchPublishedProduct(data.slug);
  });
