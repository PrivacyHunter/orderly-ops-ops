import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowRight } from "lucide-react";
import { getSiteBlocks } from "@/lib/site-blocks.functions";
import { resolveMediaUrl, assetUrl } from "@/lib/media";
import fallbackA from "@/assets/file-38.jpg.asset.json";
import fallbackB from "@/assets/file-41.jpg.asset.json";
import fallbackC from "@/assets/file-44.jpg.asset.json";

type CategoryCard = { title: string; desc: string; image: string; url: string };

const FALLBACK: CategoryCard[] = [
  { title: "Sportswear", desc: "Soccer, basketball & team kits built for match day.", image: "", url: "/sportswear" },
  { title: "Active Wear", desc: "Leggings, tanks, compression & training tees.", image: "", url: "/activewear" },
  { title: "Casual Wear", desc: "Hoodies, jackets, tracksuits & everyday essentials.", image: "", url: "/casual-wear" },
];

const FALLBACK_IMAGES = [fallbackA.url, fallbackB.url, fallbackC.url].map(assetUrl);

export function CategoryGrid() {
  const load = useServerFn(getSiteBlocks);
  const { data } = useQuery({ queryKey: ["site-blocks"], queryFn: () => load() });
  const categories = (((data as any)?.categories as CategoryCard[] | undefined)?.length
    ? ((data as any).categories as CategoryCard[])
    : FALLBACK
  ).slice(0, 3);

  return (
    <section className="bg-background px-4 py-16 md:py-20 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <h3 className="mb-3 text-sm font-black uppercase tracking-[0.24em] text-primary">Shop By Category</h3>
        <h2 className="mb-10 section-title font-black uppercase italic tracking-tight">
          Product <span className="text-primary">Categories</span>
        </h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {categories.map((cat, i) => {
            const image = cat.image ? resolveMediaUrl(cat.image) : FALLBACK_IMAGES[i] || FALLBACK_IMAGES[0]!;
            return (
              <motion.div
                key={`${cat.title}-${i}`}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: Math.min(i, 5) * 0.06 }}
              >
                <Link
                  to={(cat.url || "/sportswear") as any}
                  className="group shimmer relative block h-72 overflow-hidden rounded-lg border border-border transition-colors hover:border-[2px] hover:border-primary sm:h-80"
                >
                  <img
                    src={image}
                    alt={cat.title}
                    width={640}
                    height={640}
                    fetchPriority="high"
                    loading="eager"
                    decoding="async"
                    className="absolute inset-0 h-full w-full bg-ink object-cover transition-transform duration-700 group-hover:scale-110"
                    onError={(e) => { (e.currentTarget as HTMLImageElement).style.visibility = "hidden"; }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-[#0f172a]/45 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-6">
                    <h4 className="mb-1.5 text-xl font-black uppercase italic tracking-tight text-white">{cat.title}</h4>
                    <p className="mb-4 line-clamp-2 text-xs leading-relaxed text-white/75">{cat.desc}</p>
                    <span className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-white">
                      Explore <ArrowRight size={14} className="text-primary transition-transform group-hover:translate-x-1" />
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
