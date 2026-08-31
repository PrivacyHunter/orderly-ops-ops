import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowRight, ShieldCheck, Truck, Layers } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { getPublicProduct } from "@/lib/banners.functions";
import { resolveMediaUrl } from "@/lib/media";

export const Route = createFileRoute("/product/$slug")({
  component: ProductDetail,
  head: ({ params }) => {
    const name = params.slug.replace(/-/g, " ");
    const title = `${name} — Custom Sportswear | Ambition Sports`;
    const description = `Request a B2B quote for ${name}. Custom sublimated, cut & sew manufacturing from Sialkot with low MOQs and 3-4 week turnaround.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "product" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
});

function ProductDetail() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <ProductBody />
      <Footer />
    </div>
  );
}

function ProductBody() {
  const { slug } = Route.useParams();
  const load = useServerFn(getPublicProduct);
  const { data, isLoading } = useQuery({
    queryKey: ["public-product", slug],
    queryFn: () => load({ data: { slug } }),
  });
  const [active, setActive] = useState(0);

  if (isLoading) {
    return <div className="mx-auto max-w-7xl px-4 py-32 text-sm font-bold uppercase tracking-widest text-muted-foreground">Loading product…</div>;
  }

  if (!data) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-32">
        <h1 className="mb-4 section-title font-black uppercase italic">Product not found</h1>
        <Link to="/sportswear" className="text-sm font-black uppercase tracking-widest text-primary">
          Browse all products
        </Link>
      </div>
    );
  }

  const gallery = [data.cover_image, ...(data.images ?? [])].filter(Boolean).map((u) => resolveMediaUrl(u as string));
  const image = gallery[active] || gallery[0];
  const price = data.price == null ? "Custom Quote" : `${data.currency ?? "USD"} ${data.price}`;

  return (
    <main className="bg-background px-4 py-16 md:py-24 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-2">
        <div>
          <div className="overflow-hidden rounded-lg border border-border bg-surface">
            {image ? (
              <img src={image} alt={data.name} className="h-[340px] w-full object-contain p-6 md:h-[460px]" />
            ) : (
              <div className="h-[340px] w-full bg-muted md:h-[460px]" />
            )}
          </div>
          {gallery.length > 1 && (
            <div className="mt-3 grid grid-cols-4 gap-3">
              {gallery.slice(0, 8).map((g, i) => (
                <button
                  key={`${g}-${i}`}
                  type="button"
                  onClick={() => setActive(i)}
                  className={`overflow-hidden rounded-lg border bg-card p-2 ${i === active ? "border-primary" : "border-border"}`}
                >
                  <img src={g} alt={`${data.name} view ${i + 1}`} className="h-16 w-full object-contain" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <p className="mb-3 text-[10px] font-black uppercase tracking-[0.28em] text-primary">{data.category}</p>
          <h1 className="mb-4 page-title font-black uppercase italic tracking-tight">{data.name}</h1>
          <p className="mb-6 text-2xl font-black tracking-tight">{price}</p>
          <p className="mb-8 leading-relaxed text-muted-foreground">
            {data.description || "High-performance custom apparel engineered for elite teams — sublimated, flatlock stitched and built for bulk B2B orders."}
          </p>

          <div className="mb-8 grid gap-3 sm:grid-cols-3">
            {[
              { icon: Layers, label: "220GSM+ Fabric" },
              { icon: ShieldCheck, label: "Triple-Stage QC" },
              { icon: Truck, label: "3-4 Week Delivery" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-3">
                <Icon size={16} className="text-primary" />
                <span className="text-[10px] font-black uppercase tracking-[0.14em]">{label}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              to="/quote"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-8 py-4 text-xs font-black uppercase tracking-[0.16em] text-primary-foreground transition-colors hover:bg-[#0f172a]"
            >
              Request Spec Sheet / B2B Quote <ArrowRight size={16} />
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center justify-center rounded-lg border-2 border-foreground px-8 py-4 text-xs font-black uppercase tracking-[0.16em] text-foreground transition-colors hover:bg-foreground hover:text-background"
            >
              Talk To Sales
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
