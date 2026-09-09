import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowRight, Flame } from "lucide-react";
import { getSiteBlocks } from "@/lib/site-blocks.functions";
import { getCatalogTaxonomy } from "@/lib/catalog.functions";
import {
  categoryLinkProps,
  liveCategories,
  isHotItem,
  HOT_ITEM_CATEGORIES,
  slugify,
} from "@/lib/catalog";
import { resolveMediaUrl } from "@/lib/media";

type CategoryCard = { title: string; desc: string; image: string; url: string };

/**
 * "Hot Items" — the headline sublimation uniform categories.
 * Imagery is optional: until real photos are uploaded in Site Blocks,
 * each tile renders a themed sublimation panel instead of a broken image.
 */
export function HotItems() {
  const loadCatalog = useServerFn(getCatalogTaxonomy);
  const { data: catalog } = useQuery({ queryKey: ["catalog-taxonomy"], queryFn: () => loadCatalog() });
  const loadBlocks = useServerFn(getSiteBlocks);
  const { data: blocks } = useQuery({ queryKey: ["site-blocks"], queryFn: () => loadBlocks() });
  const blockCards = ((blocks as any)?.categories as CategoryCard[] | undefined) ?? [];

  const live = liveCategories(catalog).filter((c) => isHotItem(c.slug));
  const items = (live.length ? live : HOT_ITEM_CATEGORIES).map((cat) => ({
    slug: cat.slug,
    title: cat.name,
    desc: cat.description,
    image: blockCards.find((c) => slugify(c.title ?? "") === cat.slug)?.image ?? "",
    subs: cat.subcategories.filter((s) => s.enabled).slice(0, 3),
  }));

  if (!items.length) return null;

  return (
    <section className="bg-surface px-4 py-16 md:py-20 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <h3 className="mb-3 flex items-center gap-2 text-sm font-black uppercase tracking-[0.24em] text-primary">
          <Flame size={16} /> Hot Items
        </h3>
        <h2 className="mb-3 section-title font-black uppercase italic tracking-tight">
          Sublimated <span className="text-primary">Team Uniforms</span>
        </h2>
        <p className="mb-10 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          100% custom dye-sublimation manufacturing — your logo, colours, names and numbers printed
          right into the fabric. Low minimums, export-ready quality.
        </p>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, i) => {
            const image = item.image ? resolveMediaUrl(item.image) : "";
            return (
              <motion.div
                key={item.slug}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: Math.min(i, 5) * 0.06 }}
              >
                <Link
                  {...(categoryLinkProps(item.slug) as any)}
                  className="group relative flex h-64 flex-col justify-end overflow-hidden rounded-lg border border-border bg-card p-6 transition-colors hover:border-[2px] hover:border-primary"
                >
                  {image ? (
                    <img
                      src={image}
                      alt={`Custom sublimated ${item.title.toLowerCase()} manufacturer`}
                      width={640}
                      height={640}
                      loading="lazy"
                      decoding="async"
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).style.visibility = "hidden";
                      }}
                    />
                  ) : (
                    <div
                      aria-hidden
                      className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,color-mix(in_oklab,var(--color-primary)_38%,transparent),transparent_60%),linear-gradient(140deg,color-mix(in_oklab,var(--color-primary)_16%,transparent),transparent_70%)]"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent" />

                  <div className="relative">
                    <h4 className="mb-1.5 text-xl font-black uppercase italic tracking-tight text-white">
                      {item.title}
                    </h4>
                    <p className="mb-3 line-clamp-2 text-xs leading-relaxed text-white/75">{item.desc}</p>
                    <div className="mb-4 flex flex-wrap gap-1.5">
                      {item.subs.map((sub) => (
                        <span
                          key={sub.slug}
                          className="rounded-full border border-white/25 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-white/85"
                        >
                          {sub.name}
                        </span>
                      ))}
                    </div>
                    <span className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-white">
                      View Range{" "}
                      <ArrowRight
                        size={14}
                        className="text-primary transition-transform group-hover:translate-x-1"
                      />
                    </span>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
