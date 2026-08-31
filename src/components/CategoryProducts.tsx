import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Info, Package, Zap } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { getPublicProducts } from "@/lib/banners.functions";
import { QuickViewModal } from "@/components/QuickViewModal";
import { resolveMediaUrl } from "@/lib/media";

type PublicProduct = {
  id: string;
  name: string;
  category: string;
  description: string | null;
  price: number | null;
  currency: string | null;
  images: string[] | null;
  cover_image: string | null;
};

type CategoryProductsProps = {
  category: "sportswear" | "activewear" | "casualwear";
  accentClass: string;
};

function displayPrice(product: PublicProduct) {
  return product.price == null || product.price === 0
    ? "Custom Quote"
    : `${product.currency ?? "USD"} ${product.price}`;
}

export function CategoryProducts({ category, accentClass }: CategoryProductsProps) {
  const getProducts = useServerFn(getPublicProducts);
  const { data = [], isPending } = useQuery({
    queryKey: ["public-products", category],
    queryFn: () => getProducts({ data: { category } }),
  });
  const [selected, setSelected] = useState<PublicProduct | null>(null);

  const modalProduct = selected
    ? {
        name: selected.name,
        category: selected.category,
        desc: selected.description || "Premium custom apparel manufactured to your specifications.",
        price: displayPrice(selected),
        image: selected.cover_image || selected.images?.[0] || "",
      }
    : null;

  return (
    <>
      <section className="mx-auto max-w-7xl px-4 py-20 sm:py-24 lg:px-8 lg:py-32">
        {isPending ? (
          <div className="grid min-h-64 place-items-center text-sm font-bold uppercase text-muted-foreground">Loading products…</div>
        ) : data.length === 0 ? (
          <div className="grid min-h-64 place-items-center gap-3 text-center text-muted-foreground">
            <Package size={28} />
            <p className="text-sm font-bold uppercase">Products coming soon</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:gap-12 lg:grid-cols-3">
            {data.map((product, index) => {
              const image = resolveMediaUrl(product.cover_image || product.images?.[0] || "");
              return (
                <motion.article
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: Math.min(index, 5) * 0.08 }}
                  whileHover={{ y: -10 }}
                  className="group flex h-full min-w-0 flex-col overflow-hidden rounded-3xl border border-border bg-card"
                >
                  <div className="relative h-44 overflow-hidden bg-muted sm:h-52 lg:h-60">
                    {image ? (
                      <img src={image} alt={product.name} loading="lazy" className="h-full w-full object-contain p-3 opacity-90 transition duration-700 group-hover:scale-105 group-hover:opacity-100" />
                    ) : (
                      <div className="grid h-full place-items-center text-muted-foreground"><Package size={28} /></div>
                    )}
                    <div className="absolute right-4 top-4 max-w-[calc(100%-2rem)] sm:right-6 sm:top-6">
                      <span className="flex items-center gap-2 rounded-full bg-primary px-3 py-1.5 text-[9px] font-black uppercase text-primary-foreground sm:px-4 sm:text-[10px]">
                        <Zap size={10} fill="currentColor" className="shrink-0" /> {product.category}
                      </span>
                    </div>
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-60" />
                  </div>

                  <div className="flex min-w-0 flex-grow flex-col p-6 sm:p-8 lg:p-10">
                    <h2 className={`mb-3 break-words text-xl font-black uppercase italic leading-tight transition-colors [overflow-wrap:anywhere] sm:text-2xl ${accentClass}`}>
                      {product.name}
                    </h2>
                    <p className="mb-8 flex-grow break-words text-sm leading-relaxed text-muted-foreground">
                      {product.description || "Premium custom apparel manufactured to your specifications."}
                    </p>
                    <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
                      <span className="text-lg font-black italic sm:text-xl">{displayPrice(product)}</span>
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