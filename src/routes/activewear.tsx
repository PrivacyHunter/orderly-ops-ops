import { createFileRoute, Link } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { PageHero } from "@/components/PageHero";
import { Footer } from "@/components/Footer";
import { getPageSeo } from "@/lib/seo.functions";
import { getSiteBlocks } from "@/lib/site-blocks.functions";
import { getPublicProducts } from "@/lib/banners.functions";
import { CategoryProducts } from "@/components/CategoryProducts";


export const Route = createFileRoute("/activewear")({
  validateSearch: (search: Record<string, unknown>): { sub?: string } =>
    typeof search["sub"] === "string" && search["sub"] ? { sub: search["sub"] } : {},
  loader: async ({ context }) => {
    const qc = context.queryClient;
    const [seo] = await Promise.all([
      qc.ensureQueryData({
        queryKey: ["seo", "/activewear"],
        queryFn: () => getPageSeo({ data: { path: "/activewear" } }),
      }),
      qc.ensureQueryData({ queryKey: ["site-blocks"], queryFn: () => getSiteBlocks() }),
      qc.ensureQueryData({
        queryKey: ["public-products", "activewear"],
        queryFn: () => getPublicProducts({ data: { category: "activewear" } }),
      }),
    ]);
    return seo;
  },
  head: ({ loaderData }) => {
    const seo = loaderData as any;
    const title = seo?.title || "Activewear | Ambition Sports";
    const description = seo?.description || "High-performance custom gym and fitness apparel.";
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
  component: Activewear,
});

function Activewear() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-neon-lime selection:text-background">
      <Navbar />

      <main>
        <PageHero
          pageKey="activewear"
          accentClass="text-neon-lime"
          ruleClass="bg-neon-lime"
          defaults={{
            eyebrow: "Engineered For Motion",
            title1: "Custom",
            title2: "Activewear",
            subtitle: "High-Performance Gym & Fitness Gear",
            image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=2070&auto=format&fit=crop",
          }}
        />

        <CategoryProducts category="activewear" accentClass="group-hover:text-neon-lime" />

        {/* Catalog CTA */}
        <section className="py-24 px-4 bg-neon-lime relative overflow-hidden">
           <div className="absolute inset-0 bg-background/5 opacity-10 pointer-events-none">
             <div className="w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
           </div>
           <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-12 relative z-10">
              <div className="text-center lg:text-left">
                <h2 className="text-background font-black section-title uppercase italic tracking-tighter mb-4 break-words">Request Our Activewear Range</h2>
                <p className="text-background/70 font-bold uppercase tracking-wider sm:tracking-widest text-[10px] sm:text-xs break-words">Gym gear, compression wear & fitness apparel</p>
              </div>
              <Link
                to="/quote"
                className="bg-background text-neon-lime hover:text-white px-6 sm:px-12 py-4 sm:py-6 rounded-2xl font-black uppercase tracking-widest text-xs sm:text-sm transition-all shadow-xl"
              >
                Bulk Order Inquiry
              </Link>
           </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
