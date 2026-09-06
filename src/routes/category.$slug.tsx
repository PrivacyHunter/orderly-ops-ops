import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Navbar } from "@/components/Navbar";
import { PageHero } from "@/components/PageHero";
import { Footer } from "@/components/Footer";
import { CatalogCTA } from "@/components/CatalogCTA";
import { CategoryProducts } from "@/components/CategoryProducts";
import { getCatalogTaxonomy } from "@/lib/catalog.functions";
import { findCategory } from "@/lib/catalog";

export const Route = createFileRoute("/category/$slug")({
  validateSearch: (search: Record<string, unknown>): { sub?: string } =>
    typeof search["sub"] === "string" && search["sub"] ? { sub: search["sub"] } : {},
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData({
      queryKey: ["catalog-taxonomy"],
      queryFn: () => getCatalogTaxonomy(),
    });
    return null;
  },
  head: ({ params }) => {
    const label = params.slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    const title = `${label} | Custom Manufacturing | Ambition Sports`;
    const description = `Custom ${label.toLowerCase()} manufactured to order for teams, brands and retailers — low minimums, full sublimation and private-label finishing.`;
    return {
      title,
      meta: [
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: DynamicCategoryPage,
});

function DynamicCategoryPage() {
  const { slug } = Route.useParams();
  const { sub } = Route.useSearch();
  const activeSub = sub === "all" ? "" : (sub ?? "");
  const loadTaxonomy = useServerFn(getCatalogTaxonomy);
  const { data: config, isPending } = useQuery({
    queryKey: ["catalog-taxonomy"],
    queryFn: () => loadTaxonomy(),
  });
  const category = findCategory(config, slug);
  const live = category?.enabled ?? false;
  const label = category?.name ?? slug.replace(/-/g, " ");

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      <Navbar />

      <main>
        <PageHero
          pageKey={`category:${slug}`}
          defaults={{
            eyebrow: "Custom Manufacturing",
            title1: label.split(" ")[0] ?? label,
            title2: label.split(" ").slice(1).join(" "),
            subtitle: category?.description || "Made to order for teams, brands and retailers",
            image:
              "https://images.unsplash.com/photo-1517649763962-0c623066013b?q=80&w=2070&auto=format&fit=crop",
          }}
        />

        {isPending ? (
          <div className="mx-auto max-w-7xl px-4 py-20 lg:px-8">
            <div className="h-64 shimmer rounded-3xl border border-border bg-card" />
          </div>
        ) : live ? (
          <>
            <CategoryProducts category={slug} accentClass="group-hover:text-primary" activeSub={activeSub} />
            <CatalogCTA />
          </>
        ) : (
          <div className="mx-auto grid max-w-3xl gap-4 px-4 py-24 text-center lg:px-8">
            <h1 className="section-title font-black uppercase italic">Category unavailable</h1>
            <p className="text-sm text-muted-foreground">
              This collection is not published right now. Explore our other custom apparel ranges.
            </p>
            <Link
              to="/sportswear"
              className="mx-auto rounded-xl bg-primary px-6 py-3 text-xs font-black uppercase tracking-widest text-primary-foreground"
            >
              Browse products
            </Link>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
