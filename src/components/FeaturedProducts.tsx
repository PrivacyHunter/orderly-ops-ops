import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Heart, ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getPublicProducts } from "@/lib/banners.functions";
import { resolveMediaUrl } from "@/lib/media";
import { formatPrice } from "@/lib/catalog";

export function FeaturedProducts() {
  const getProducts = useServerFn(getPublicProducts);
  const { data, isPending } = useQuery({
    queryKey: ["public-products", "featured"],
    queryFn: () => getProducts({ data: { featuredOnly: true } }),
  });
  const products = (data ?? []).slice(0, 12);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [index, setIndex] = useState(0);
  const [perView, setPerView] = useState(4);

  useEffect(() => {
    const stored = localStorage.getItem("ambition_favorites");
    if (stored) setFavorites(JSON.parse(stored));
  }, []);

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      setPerView(w < 640 ? 1 : w < 1024 ? 2 : w < 1280 ? 3 : 4);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const maxIndex = Math.max(0, products.length - perView);

  useEffect(() => {
    if (index > maxIndex) setIndex(0);
  }, [maxIndex, index]);

  useEffect(() => {
    if (products.length <= perView) return;
    const id = setInterval(() => setIndex((i) => (i >= maxIndex ? 0 : i + 1)), 3500);
    return () => clearInterval(id);
  }, [products.length, perView, maxIndex]);

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => {
      const next = prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id];
      localStorage.setItem("ambition_favorites", JSON.stringify(next));
      return next;
    });
  };

  return (
    <section className="bg-background px-4 py-16 md:py-20 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h3 className="mb-3 text-sm font-black uppercase tracking-[0.24em] text-primary">Most Wanted</h3>
            <h2 className="section-title font-black uppercase italic tracking-tight">
              Featured <span className="text-primary">Collection</span>
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex gap-2">
              <button
                type="button"
                aria-label="Previous products"
                onClick={() => setIndex((i) => (i <= 0 ? maxIndex : i - 1))}
                className="rounded-lg border-2 border-border p-2 text-foreground transition-colors hover:border-primary hover:text-primary"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                aria-label="Next products"
                onClick={() => setIndex((i) => (i >= maxIndex ? 0 : i + 1))}
                className="rounded-lg border-2 border-border p-2 text-foreground transition-colors hover:border-primary hover:text-primary"
              >
                <ChevronRight size={16} />
              </button>
            </div>
            <Link
              to="/sportswear"
              className="group inline-flex items-center gap-2 border-b-2 border-primary pb-1.5 text-xs font-black uppercase tracking-[0.2em] text-foreground transition-colors hover:text-primary"
            >
              Explore All Gear <ArrowRight size={15} className="text-primary transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>

        <div className="overflow-hidden">
          {isPending ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" aria-label="Loading featured products">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="overflow-hidden rounded-lg border border-border bg-card">
                  <div className="aspect-[4/3] shimmer bg-muted" />
                  <div className="space-y-3 p-5">
                    <div className="h-3 w-1/3 shimmer rounded" />
                    <div className="h-5 w-3/4 shimmer rounded" />
                    <div className="h-10 w-full shimmer rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : <motion.div
            className="flex"
            animate={{ x: `-${index * (100 / perView)}%` }}
            transition={{ type: "spring", stiffness: 120, damping: 22 }}
          >
            {products.map((product, productIndex) => {
            const image = resolveMediaUrl(product.cover_image || product.images?.[0] || "");
            const price = formatPrice(product.price, product.currency);
            return (
              <div
                key={product.id}
                className="w-full shrink-0 px-2 sm:w-1/2 lg:w-1/3 xl:w-1/4"
              >
              <article
                className="group flex h-full flex-col overflow-hidden rounded-lg border border-border bg-card transition-all hover:-translate-y-1 hover:border-primary hover:shadow-lg"
              >
                <div className="relative">

                  <Link
                    to="/product/$slug"
                    params={{ slug: product.slug }}
                    className="relative block aspect-[4/3] overflow-hidden bg-surface"
                  >
                    {image ? (
                      <img
                        src={image}
                        alt={product.name}
                        width={640}
                        height={480}
                        loading={productIndex < perView ? "eager" : "lazy"}
                        fetchPriority={productIndex < perView ? "high" : "auto"}
                        decoding="async"
                        className="relative z-10 h-full w-full object-contain p-4 transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : null}
                  </Link>
                  <button
                    type="button"
                    aria-label="Toggle favorite"
                    onClick={() => toggleFavorite(product.id)}
                    className={`absolute right-3 top-3 rounded-md border p-2 transition-colors ${
                      favorites.includes(product.id)
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-card text-foreground hover:text-primary"
                    }`}
                  >
                    <Heart size={15} fill={favorites.includes(product.id) ? "currentColor" : "none"} />
                  </button>
                </div>

                <div className="flex flex-1 flex-col border-t border-border p-5">
                  <div className="mb-2 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="shrink-0 rounded bg-primary px-2 py-1 text-[8px] font-black uppercase tracking-[0.12em] text-primary-foreground">Featured</span>
                    <p className="min-w-0 break-words text-[9px] font-black uppercase leading-relaxed tracking-[0.14em] text-primary [overflow-wrap:anywhere]">{product.category}</p>
                  </div>
                  <h4 className="mb-2 min-w-0 break-words text-base font-black uppercase leading-tight tracking-tight [overflow-wrap:anywhere]">
                    <Link to="/product/$slug" params={{ slug: product.slug }} className="hover:text-primary">
                      {product.name}
                    </Link>
                  </h4>
                  <p className="mb-4 flex-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                    {product.description || "High-performance custom apparel engineered for elite teams."}
                  </p>
                  {price ? (
                    <p className="mb-4 text-sm font-black tracking-tight text-foreground">{price}</p>
                  ) : (
                    <p className="mb-4 text-[10px] font-black uppercase tracking-[0.14em] text-primary">Inquire For Pricing</p>
                  )}
                  <Link
                    to="/quote"
                    className="flex min-h-12 w-full items-center justify-center rounded-lg bg-primary px-3 py-3 text-center text-[9px] font-black uppercase leading-snug tracking-[0.1em] text-primary-foreground transition-colors hover:opacity-90 min-[380px]:text-[10px] min-[380px]:tracking-[0.14em]"
                  >
                    Request Spec Sheet / B2B Quote
                  </Link>
                </div>
              </article>
              </div>
            );
          })}
          </motion.div>}
        </div>
      </div>
    </section>

  );
}
