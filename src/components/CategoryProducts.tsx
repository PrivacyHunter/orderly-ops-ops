import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Info, Package } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { getPublicProducts } from "@/lib/banners.functions";
import { getCatalogTaxonomy } from "@/lib/catalog.functions";
import { QuickViewModal } from "@/components/QuickViewModal";
import { resolveMediaUrl } from "@/lib/media";
import { categoryLinkProps, formatPrice, liveSubcategories, resolveSubForConfig } from "@/lib/catalog";

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

type CategoryProductsProps = {
  category: string;
  accentClass: string;
  activeSub?: string;
};

export function CategoryProducts({ category, accentClass, activeSub = "" }: CategoryProductsProps) {
  const getProducts = useServerFn(getPublicProducts);
  const loadTaxonomy = useServerFn(getCatalogTaxonomy);
  const { data = [], isPending } = useQuery({
    queryKey: ["public-products", category],
    queryFn: () => getProducts({ data: { category } }),
  });
  const { data: taxonomy } = useQuery({ queryKey: ["catalog-taxonomy"], queryFn: () => loadTaxonomy() });
  const [selected, setSelected] = useState<PublicProduct | null>(null);

  const subs = liveSubcategories(taxonomy, category);

  const withSub = (data as PublicProduct[]).map((product) => ({
    product,
    sub: resolveSubForConfig(product, taxonomy),
  }));
  const visible = activeSub ? withSub.filter((row) => row.sub === activeSub) : withSub;

  const modalProduct = selected
    ? {
        name: selected.name,
        category: selected.category,
        desc: selected.description || "Premium custom apparel manufactured to your specifications.",
        price: formatPrice(selected.price, selected.currency) ?? "",
        image: resolveMediaUrl(selected.cover_image || selected.images?.[0] || ""),
      }
    : null;

  return (
    <>
      <section className="mx-auto max-w-7xl overflow-hidden px-4 py-10 sm:py-20 lg:px-8 lg:py-24">
        {/* Sub-category tabs */}
        <div className="-mx-4 mb-7 flex snap-x gap-2 overflow-x-auto px-4 pb-2 sm:mx-0 sm:mb-10 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0">
          <Link
            {...(categoryLinkProps(category, "") as any)}
            className={`shrink-0 snap-start rounded-full border px-4 py-2.5 text-[10px] font-black uppercase tracking-[0.12em] transition-colors sm:text-xs ${
              activeSub ? "border-border text-muted-foreground hover:border-primary hover:text-primary" : "border-primary bg-primary text-primary-foreground"
            }`}
          >
            All Products
          </Link>
          {subs.map((sub) => (
            <Link
              key={sub.slug}
              {...(categoryLinkProps(category, sub.slug) as any)}
              className={`shrink-0 snap-start rounded-full border px-4 py-2.5 text-[10px] font-black uppercase tracking-[0.12em] transition-colors sm:text-xs ${
                activeSub === sub.slug
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground hover:border-primary hover:text-primary"
              }`}
            >
              {sub.name}
            </Link>
          ))}
        </div>

        {isPending ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:gap-12 lg:grid-cols-3" aria-label="Loading products">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="overflow-hidden rounded-3xl border border-border bg-card">
                <div className="aspect-[4/3] shimmer bg-muted" />
                <div className="space-y-4 p-8">
                  <div className="h-6 w-2/3 shimmer rounded" />
                  <div className="h-16 w-full shimmer rounded" />
                  <div className="h-12 w-full shimmer rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : visible.length === 0 ? (
          <div className="grid min-h-64 place-items-center gap-3 text-center text-muted-foreground">
            <Package size={28} />
            <p className="text-sm font-bold uppercase">Products coming soon</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:gap-12 lg:grid-cols-3">
            {visible.map(({ product, sub }, index) => {
              const image = resolveMediaUrl(product.cover_image || product.images?.[0] || "");
              const price = formatPrice(product.price, product.currency);
              return (
                <motion.article
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: Math.min(index, 5) * 0.08 }}
                  whileHover={{ y: -10 }}
                  className="group flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-border bg-card sm:rounded-3xl"
                >
                  <Link to="/product/$slug" params={{ slug: product.slug }} className="relative block aspect-[16/10] overflow-hidden bg-muted sm:aspect-[4/3]">
                    {image ? (
                      <img
                        src={image}
                        alt={`${product.name} — custom ${product.category} manufactured by Ambition Sports`}
                        width={640}
                        height={480}
                        loading={index < 3 ? "eager" : "lazy"}
                        fetchPriority={index < 3 ? "high" : "auto"}
                        decoding="async"
                        className="relative z-10 h-full w-full object-contain p-3 opacity-90 transition duration-700 group-hover:scale-105 group-hover:opacity-100"
                      />
                    ) : (
                      <div className="grid h-full place-items-center text-muted-foreground"><Package size={28} /></div>
                    )}
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-60" />
                  </Link>

                  <div className="flex min-w-0 flex-grow flex-col p-4 sm:p-8 lg:p-10">
                    <p className="mb-2 line-clamp-2 min-w-0 break-words text-[9px] font-black uppercase leading-relaxed tracking-[0.12em] text-primary [overflow-wrap:anywhere] sm:mb-3 sm:text-[10px]">
                      {subs.find((s) => s.slug === sub)?.name ?? product.category}
                    </p>
                    <h2 className={`mb-2 break-words text-lg font-black uppercase italic leading-tight transition-colors [overflow-wrap:anywhere] sm:mb-3 sm:text-2xl ${accentClass}`}>
                      <Link to="/product/$slug" params={{ slug: product.slug }}>{product.name}</Link>
                    </h2>
                    <p className="mb-5 flex-grow break-words text-[13px] leading-relaxed text-muted-foreground sm:mb-8 sm:text-sm">
                      {product.description || "Premium custom apparel manufactured to your specifications."}
                    </p>
                    <div className="mb-5 flex flex-wrap items-center justify-between gap-3 sm:mb-8">
                      {price ? (
                        <span className="text-lg font-black italic sm:text-xl">{price}</span>
                      ) : (
                        <span className="rounded-full border border-primary/40 bg-primary/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-primary">
                          Inquire For Pricing
                        </span>
                      )}
                      <span className="flex items-center gap-1 text-[10px] font-bold uppercase text-muted-foreground">
                        <CheckCircle2 size={16} className="text-neon-lime" /> Premium QC
                      </span>
                    </div>
                    <div className="grid grid-cols-1 gap-3 min-[360px]:grid-cols-2 sm:gap-4">
                      <button type="button" onClick={() => setSelected(product)} className="flex min-h-12 items-center justify-center gap-2 rounded-xl border border-border bg-muted px-3 text-[10px] font-black uppercase transition hover:border-primary">
                        <Info size={14} /> Quick View
                      </button>
                      <Link to="/quote" className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-primary px-3 text-center text-[10px] font-black uppercase text-primary-foreground transition hover:opacity-90">
                        Inquire Now <ArrowRight size={14} />
                      </Link>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>
        )}
      </section>
      <QuickViewModal product={modalProduct} isOpen={Boolean(selected)} onClose={() => setSelected(null)} />
    </>
  );
}
