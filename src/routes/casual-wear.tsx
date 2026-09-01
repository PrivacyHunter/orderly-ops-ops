import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { PageHero } from "@/components/PageHero";
import { Footer } from "@/components/Footer";
import { getPageSeo } from "@/lib/seo.functions";
import { getSiteBlocks } from "@/lib/site-blocks.functions";
import { getPublicProducts } from "@/lib/banners.functions";
import { CategoryProducts } from "@/components/CategoryProducts";


export const Route = createFileRoute("/casual-wear")({
  validateSearch: (search: Record<string, unknown>): { sub?: string } =>
    typeof search["sub"] === "string" && search["sub"] ? { sub: search["sub"] } : {},
  loader: async ({ context }) => {
    const qc = context.queryClient;
    const [seo] = await Promise.all([
      qc.ensureQueryData({
        queryKey: ["seo", "/casual-wear"],
        queryFn: () => getPageSeo({ data: { path: "/casual-wear" } }),
      }),
      qc.ensureQueryData({ queryKey: ["site-blocks"], queryFn: () => getSiteBlocks() }),
      qc.ensureQueryData({
        queryKey: ["public-products", "casualwear"],
        queryFn: () => getPublicProducts({ data: { category: "casualwear" } }),
      }),
    ]);
    return seo;
  },
  head: ({ loaderData }) => {
    const seo = loaderData as any;
    const title = seo?.title || "Casual Wear | Ambition Sports";
    const description = seo?.description || "Premium custom streetwear and casual apparel.";
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
  component: CasualWear,
});

function CasualWear() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-white selection:text-background">
      <Navbar />

      <main>
        <PageHero
          pageKey="casual-wear"
          accentClass="text-primary"
          ruleClass="bg-primary"
          defaults={{
            eyebrow: "Everyday Essentials",
            title1: "Casual",
            title2: "Wear",
            subtitle: "Street-Ready Premium Basics",
            image: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=2070&auto=format&fit=crop",
          }}
        />

        <CategoryProducts category="casualwear" accentClass="group-hover:text-primary" activeSub={activeSub} />

        {/* Casual CTA */}
        <section className="py-24 px-4 bg-white relative overflow-hidden">
           <div className="absolute inset-0 bg-background/5 opacity-5 pointer-events-none">
             <div className="w-full h-full bg-[url('https://www.transparenttextures.com/patterns/graphy.png')]" />
           </div>
           <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-12 relative z-10">
              <div className="text-center lg:text-left">
                <h2 className="text-background font-black text-4xl md:text-5xl uppercase italic tracking-tighter mb-4">Launch Your Private Label</h2>
                <p className="text-background/70 font-bold uppercase tracking-widest text-xs">Premium streetwear manufacturing for brands & retail</p>
              </div>
              <button className="bg-background text-white hover:text-neon-cyan px-12 py-6 rounded-2xl font-black uppercase tracking-widest text-sm transition-all shadow-xl">
                Start Manufacturing
              </button>
           </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
