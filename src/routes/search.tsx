import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Search as SearchIcon, Package } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { getPublicProducts } from "@/lib/banners.functions";
import { resolveMediaUrl } from "@/lib/media";
import { formatPrice } from "@/lib/catalog";

type PublicProduct = {
  id: string;
  name: string;
  slug: string;
  category: string;
  description: string | null;
  price: number | null;
  currency: string | null;
  images: string[] | null;
  cover_image: string | null;
};

export const Route = createFileRoute("/search")({
  validateSearch: (search: Record<string, unknown>): { q?: string } =>
    typeof search["q"] === "string" && search["q"] ? { q: search["q"] } : {},
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData({
      queryKey: ["public-products", "all"],
      queryFn: () => getPublicProducts({ data: {} }),
    });
  },
  head: () => ({
    title: "Search Custom Sportswear & Teamwear Products | Ambition Sports",
    meta: [
      {
        name: "description",
        content:
          "Search our B2B catalog of custom sportswear, activewear and casual wear — sublimated jerseys, tracksuits, hoodies and more, made to order in Sialkot.",
      },
      { property: "og:title", content: "Search Products | Ambition Sports" },
      {
        property: "og:description",
        content: "Find custom teamwear, activewear and casual wear products for bulk B2B production.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SearchPage,
  errorComponent: ({ error }) => (
    <div role="alert" className="grid min-h-screen place-items-center bg-background p-8 text-foreground">
      {error.message}
    </div>
  ),
  notFoundComponent: () => (
    <div className="grid min-h-screen place-items-center bg-background text-foreground">No results.</div>
  ),
});

function SearchPage() {
  const { q = "" } = Route.useSearch();
  const navigate = Route.useNavigate();
  const getProducts = useServerFn(getPublicProducts);
  const { data = [] } = useQuery({
    queryKey: ["public-products", "all"],
    queryFn: () => getProducts({ data: {} }),
  });

  const term = q.trim().toLowerCase();
  const results = term
    ? (data as PublicProduct[]).filter((p) =>
        [p.name, p.category, p.description ?? ""].join(" ").toLowerCase().includes(term),
      )
    : [];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-14 lg:px-8 lg:py-20">
        <h1 className="text-3xl font-black uppercase italic tracking-tighter md:text-5xl">
          Search <span className="text-primary">Products</span>
        </h1>

        <form
          className="relative mt-6 max-w-xl"
          onSubmit={(e) => {
            e.preventDefault();
            const value = String(new FormData(e.currentTarget).get("q") ?? "").trim();
            void navigate({ search: value ? { q: value } : {} });
          }}
        >
          <SearchIcon size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            name="q"
            defaultValue={q}
            key={q}
            placeholder="Search jerseys, hoodies, leggings…"
            className="w-full rounded-xl border border-border bg-card py-3.5 pl-11 pr-4 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary"
          />
        </form>

        {!term ? (
          <p className="mt-10 text-sm text-muted-foreground">Type a product name or category to start searching.</p>
        ) : results.length === 0 ? (
          <div className="mt-16 grid place-items-center gap-3 text-center text-muted-foreground">
            <Package size={28} />
            <p className="text-sm font-bold uppercase">No products matched “{q}”</p>
            <Link to="/quote" className="text-xs font-black uppercase tracking-widest text-primary">
              Request a custom quote
            </Link>
          </div>
        ) : (
          <>
            <p className="mt-6 text-xs font-bold uppercase tracking-widest text-muted-foreground">
              {results.length} result{results.length === 1 ? "" : "s"}
            </p>
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {results.map((p) => {
                const price = formatPrice(p.price, p.currency);
                return (
                  <Link
                    key={p.id}
                    to="/product/$slug"
                    params={{ slug: p.slug }}
                    className="group overflow-hidden rounded-2xl border border-border bg-card transition-colors hover:border-primary"
                  >
                    <div className="aspect-square overflow-hidden bg-muted">
                      <img
                        src={resolveMediaUrl(p.cover_image || p.images?.[0] || "")}
                        alt={`${p.name} — custom ${p.category} manufactured by Ambition Sports`}
                        width={480}
                        height={480}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className="space-y-1 p-4">
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">{p.category}</p>
                      <h2 className="text-sm font-black uppercase leading-tight">{p.name}</h2>
                      <p className="text-xs font-bold text-muted-foreground">{price ?? "Inquire For Pricing"}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
