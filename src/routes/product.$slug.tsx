import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowRight, Check, ShieldCheck, Truck, Layers } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { getPublicProduct } from "@/lib/banners.functions";
import { getCatalogTaxonomy } from "@/lib/catalog.functions";
import { resolveMediaUrl } from "@/lib/media";
import { formatPrice, resolveSubcategory, subcategoryName } from "@/lib/catalog";

/** B2B manufacturing spec sheet shown on every product detail page. */
const SPEC_SHEET: { label: string; value: string }[] = [
  { label: "Design Consultation", value: "Free design consultation with our in-house uniform designers." },
  { label: "Fabric Weight & Tech", value: "220gsm Swiss Pique / Interlock, 100% micro-polyester fabric." },
  { label: "Performance Features", value: "100% high quality, moisture-wicking, breathable polyester." },
  { label: "Kit Options", value: "Choice of full kit set or jersey only." },
  { label: "Construction", value: "Cut & sewn with full button, v-neck or custom collar styles." },
  { label: "Style Choice", value: "Select any of our custom template styles." },
  { label: "Customization", value: "Unlimited design elements, logos, team names and colors (full sublimation / screen print / embroidery)." },
  { label: "Personalization", value: "Player names and numbers included in bulk printing." },
  { label: "Turnaround Time", value: "3 to 4 weeks production & turnaround time." },
  { label: "Transparent Pricing", value: "No hidden fees or setup charges." },
  { label: "In-House Manufacturing", value: "Created to your exact specifications in our own apparel design and production department." },
];

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
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <ProductBody />
      <Footer />
    </div>
  );
}

function ProductBody() {
  const { slug } = Route.useParams();
  const load = useServerFn(getPublicProduct);
  const loadTaxonomy = useServerFn(getCatalogTaxonomy);
  const { data, isLoading } = useQuery({
    queryKey: ["public-product", slug],
    queryFn: () => load({ data: { slug } }),
  });
  const { data: taxonomy } = useQuery({ queryKey: ["catalog-taxonomy"], queryFn: () => loadTaxonomy() });
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
  const price = formatPrice(data.price, data.currency);
  const subLabel = subcategoryName(resolveSubcategory(data, taxonomy?.assignments ?? {}));

  return (
    <main className="bg-background px-4 py-16 md:py-24 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-2">
        {/* Mockup showcase */}
        <div className="lg:sticky lg:top-28 lg:self-start">
          <div className="overflow-hidden rounded-2xl border border-border bg-surface">
            {image ? (
              <img src={image} alt={`${data.name} high-resolution custom apparel mockup`} className="h-[340px] w-full object-contain p-8 md:h-[520px]" />
            ) : (
              <div className="h-[340px] w-full bg-muted md:h-[520px]" />
            )}
          </div>
          {gallery.length > 1 && (
            <div className="mt-3 grid grid-cols-4 gap-3">
              {gallery.slice(0, 8).map((g, i) => (
                <button
                  key={`${g}-${i}`}
                  type="button"
                  aria-label={`View image ${i + 1}`}
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
          <p className="mb-3 text-[10px] font-black uppercase tracking-[0.28em] text-primary">
            {subLabel || data.category}
          </p>
          <h1 className="mb-4 page-title font-black uppercase italic tracking-tight">{data.name}</h1>

          {price ? (
            <p className="mb-6 text-2xl font-black tracking-tight text-foreground">{price}</p>
          ) : (
            <p className="mb-6 inline-block rounded-full border border-primary/40 bg-primary/10 px-4 py-2 text-[11px] font-black uppercase tracking-[0.16em] text-primary">
              Inquire For Pricing
            </p>
          )}

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

          {/* Manufacturing spec sheet */}
          <section className="mb-8 rounded-2xl border border-border bg-card p-6 md:p-8">
            <h2 className="mb-6 text-lg font-black uppercase italic tracking-tight md:text-xl">
              Benefits &amp; Specifications
            </h2>
            <ul className="space-y-3.5">
              {SPEC_SHEET.map((spec) => (
                <li key={spec.label} className="flex gap-3 text-sm leading-relaxed text-muted-foreground">
                  <Check size={16} className="mt-0.5 shrink-0 text-primary" />
                  <span className="min-w-0">
                    <strong className="font-black uppercase tracking-tight text-foreground">{spec.label}:</strong>{" "}
                    {spec.value}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              to="/quote"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-8 py-4 text-xs font-black uppercase tracking-[0.16em] text-primary-foreground transition-opacity hover:opacity-90"
            >
              Request B2B Quote / Spec Sheet <ArrowRight size={16} />
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
