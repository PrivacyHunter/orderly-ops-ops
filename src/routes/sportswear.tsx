import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { PageHero } from "@/components/PageHero";
import { Footer } from "@/components/Footer";
import { getPageSeo } from "@/lib/seo.functions";
import { getSiteBlocks } from "@/lib/site-blocks.functions";
import { getPublicProducts } from "@/lib/banners.functions";
import { CatalogCTA } from "@/components/CatalogCTA";
import { CategoryProducts } from "@/components/CategoryProducts";

export const Route = createFileRoute("/sportswear")({
  validateSearch: (search: Record<string, unknown>) => ({ sub: typeof search.sub === "string" ? search.sub : "" }),
  loader: async ({ context }) => {
    const qc = context.queryClient;
    const [seo] = await Promise.all([
      qc.ensureQueryData({
        queryKey: ["seo", "/sportswear"],
        queryFn: () => getPageSeo({ data: { path: "/sportswear" } }),
      }),
      qc.ensureQueryData({ queryKey: ["site-blocks"], queryFn: () => getSiteBlocks() }),
      qc.ensureQueryData({
        queryKey: ["public-products", "sportswear"],
        queryFn: () => getPublicProducts({ data: { category: "sportswear" } }),
      }),
    ]);
    return seo;
  },
  head: ({ loaderData }) => {
    const seo = loaderData as any;
    const title = seo?.title || "Sportswear | Ambition Sports";
    const description = seo?.description || "Explore our range of professional custom sportswear.";
    return {
      title,
      meta: [
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
        ...(seo?.ogImage ? [{ property: "og:image", content: seo.ogImage }] : []),
      ],
    };
  },
  component: Sportswear,
});

function Sportswear() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      <Navbar />

      <main>
        <PageHero
          pageKey="sportswear"
          accentClass="text-primary"
          ruleClass="bg-primary"
          defaults={{
            eyebrow: "Professional Grade",
            title1: "Performance",
            title2: "Sportswear",
            subtitle: "Custom Sublimation Specialists",
            image: "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?q=80&w=2070&auto=format&fit=crop",
          }}
        />

        <CategoryProducts category="sportswear" accentClass="group-hover:text-primary" />

        {/* Global Catalog CTA */}
        <CatalogCTA />

      </main>

      <Footer />
    </div>
  );
}
