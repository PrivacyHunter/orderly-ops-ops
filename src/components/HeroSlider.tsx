import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { getLandingPageContent } from "@/lib/content.functions";
import { getPublicBanners } from "@/lib/banners.functions";
import { isVideoUrl, resolveMediaUrl } from "@/lib/media";

type HeroBanner = {
  id: string;
  title1: string;
  title2: string;
  subtitle: string;
  image_url: string;
  image?: string;
  accent: string;
  cta_label: string;
  cta_url: string;
  secondary_label: string;
  secondary_url: string;
};

const fallbackBanners: HeroBanner[] = [
  {
    image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=2070&auto=format&fit=crop",
    subtitle: "Premium Custom Gear",
    title1: "Unleash Your",
    title2: "Ambition",
    accent: "text-primary", id: "fallback-1", image_url: "", cta_label: "Shop Now", cta_url: "/sportswear", secondary_label: "Custom Order", secondary_url: "/contact"
  },
  {
    image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop",
    subtitle: "Elite Manufacturing",
    title1: "Precision",
    title2: "Performance",
    accent: "text-primary", id: "fallback-2", image_url: "", cta_label: "Shop Now", cta_url: "/sportswear", secondary_label: "Custom Order", secondary_url: "/contact"
  },
  {
    image: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=2076&auto=format&fit=crop",
    subtitle: "Team Uniforms",
    title1: "One Team",
    title2: "One Identity",
    accent: "text-white", id: "fallback-3", image_url: "", cta_label: "Shop Now", cta_url: "/sportswear", secondary_label: "Custom Order", secondary_url: "/contact"
  },
  {
    image: "https://images.unsplash.com/photo-1518310383802-640c2de311b2?q=80&w=2070&auto=format&fit=crop",
    subtitle: "Sublimation Specialists",
    title1: "Infinite",
    title2: "Design",
    accent: "text-primary", id: "fallback-4", image_url: "", cta_label: "Shop Now", cta_url: "/sportswear", secondary_label: "Custom Order", secondary_url: "/contact"
  },
  {
    image: "https://images.unsplash.com/photo-1505236858219-8359eb29e329?q=80&w=2062&auto=format&fit=crop",
    subtitle: "Activewear Revolution",
    title1: "Fit For",
    title2: "Greatness",
    accent: "text-primary", id: "fallback-5", image_url: "", cta_label: "Shop Now", cta_url: "/sportswear", secondary_label: "Custom Order", secondary_url: "/contact"
  },
  {
    image: "https://images.unsplash.com/photo-1461896704690-474cb88d599a?q=80&w=2070&auto=format&fit=crop",
    subtitle: "Worldwide Shipping",
    title1: "Global",
    title2: "Performance",
    accent: "text-white", id: "fallback-6", image_url: "", cta_label: "Shop Now", cta_url: "/sportswear", secondary_label: "Custom Order", secondary_url: "/contact"
  }
];

export function HeroSlider() {
  const getContent = useServerFn(getLandingPageContent);
  const getBanners = useServerFn(getPublicBanners);
  const { data: content } = useQuery({
    queryKey: ["landing-page-content"],
    queryFn: () => getContent(),
  });
  const { data: databaseBanners } = useQuery({
    queryKey: ["public-banners"],
    queryFn: () => getBanners(),
  });
  const banners: HeroBanner[] = databaseBanners?.length ? databaseBanners : fallbackBanners;

  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [banners.length]);

  useEffect(() => {
    if (current >= banners.length) setCurrent(0);
  }, [banners.length, current]);

  const next = () => setCurrent((prev) => (prev + 1) % banners.length);
  const prev = () => setCurrent((prev) => (prev - 1 + banners.length) % banners.length);

  const activeBanner = banners[current] || banners[0];
  if (!activeBanner) return null;
  const activeMedia = resolveMediaUrl(activeBanner.image_url || activeBanner.image || "");

  return (
    <section className="relative h-[clamp(360px,54svh,460px)] md:h-[clamp(420px,58svh,540px)] lg:h-[62vh] lg:max-h-[600px] w-full overflow-hidden border-y-2 border-primary bg-background">
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="absolute inset-0 z-0 shimmer"
        >
          <div className="absolute inset-0 z-10 bg-gradient-to-r from-white/97 dark:from-background/97 via-white/80 dark:via-background/85 to-white/40 dark:to-background/50" />
          <div className="absolute inset-0 z-10 bg-gradient-to-t from-white/70 dark:from-background/80 via-transparent to-transparent" />
          <Link
            to={(activeBanner.cta_url || "/sportswear") as "/sportswear"}
            aria-label={`${activeBanner.title1} ${activeBanner.title2}`.trim()}
            className="absolute inset-0 z-20"
          />
          {isVideoUrl(activeMedia) ? (
            <video src={activeMedia} autoPlay muted loop playsInline preload="metadata" className="h-full w-full object-cover" />
          ) : (
            <img
              src={activeMedia}
              alt={`${activeBanner.title1} ${activeBanner.title2}`.trim() || "Custom sportswear manufacturing banner"}
              width={1920}
              height={1080}
              fetchPriority="high"
              loading="eager"
              decoding="async"
              className="relative z-10 h-full w-full bg-muted object-cover"
            />
          )}
        </motion.div>
      </AnimatePresence>

      <div className="relative z-20 h-full max-w-7xl mx-auto px-5 sm:px-8 lg:px-8 flex items-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            transition={{ duration: 0.6 }}
            className="w-full max-w-[20rem] sm:max-w-md md:max-w-lg lg:max-w-xl min-w-0 pb-16 sm:pb-20 lg:pb-8"
          >

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-primary font-black tracking-[0.12em] sm:tracking-widest uppercase mb-3 sm:mb-4 flex items-start gap-2 sm:gap-3 text-[9px] leading-relaxed sm:text-[10px] md:text-xs lg:text-sm"
            >
              <span className="mt-[0.55em] h-[2px] w-7 shrink-0 bg-primary sm:w-12" /> <span className="min-w-0 break-words">{current === 0 ? (content?.hero?.subtitle || activeBanner?.subtitle) : activeBanner?.subtitle}</span>
            </motion.p>
            {(() => {
              const cmsTitle = current === 0 ? content?.hero?.title : undefined;
              const line1 = cmsTitle || activeBanner?.title1;
              const line2 = cmsTitle ? "" : activeBanner?.title2;
              return (
                <h1 className="max-w-[11ch] text-[2.1rem] sm:max-w-[12ch] sm:text-5xl md:text-6xl lg:text-7xl font-black uppercase italic leading-[0.94] tracking-[-0.02em] mb-5 sm:mb-6 md:mb-8 text-foreground break-words">
                  {line1}
                  {line2 ? (
                    <>
                      <br />
                      <span className="text-primary">{line2}</span>
                    </>
                  ) : null}
                </h1>
              );
            })()}
            <div className="flex flex-wrap gap-3 sm:gap-6">
              <Link
                to={activeBanner.cta_url as "/sportswear"}
                className="flex items-center gap-2 rounded-lg bg-primary px-5 py-3.5 text-[11px] font-black uppercase tracking-[0.14em] text-primary-foreground transition-all hover:bg-[#0f172a] hover:shadow-lg sm:gap-3 sm:px-8 sm:py-4 sm:text-xs"
              >
                {activeBanner.cta_label} <ArrowRight size={18} />
              </Link>
              <Link
                to={activeBanner.secondary_url as "/contact"}
                className="rounded-lg border-2 border-foreground px-5 py-3.5 text-[11px] font-black uppercase tracking-[0.14em] text-foreground transition-all hover:bg-foreground hover:text-background sm:px-8 sm:py-4 sm:text-xs"
              >
                {activeBanner.secondary_label}
              </Link>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Controls */}
      <div className="pointer-events-none absolute bottom-5 sm:bottom-6 lg:bottom-8 left-0 right-0 z-30 flex items-center justify-center gap-6 px-5 sm:px-8 lg:justify-end lg:gap-8">
        <div className="pointer-events-auto flex gap-3">
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
                aria-label={`Show banner ${i + 1}`}
                className={`h-1 transition-all duration-500 ${i === current ? "w-10 sm:w-16 bg-primary" : "w-4 sm:w-6 bg-slate-900/20 dark:bg-white/20"}`}
            />
          ))}
        </div>
        <div className="pointer-events-auto hidden lg:flex gap-4">
          <button onClick={prev} aria-label="Previous banner" className="rounded-full border border-slate-900/10 bg-white/60 p-2 text-slate-900 backdrop-blur transition-all hover:bg-primary hover:text-white dark:border-white/10 dark:bg-background/50 dark:text-white">
            <ChevronLeft size={20} />
          </button>
          <button onClick={next} aria-label="Next banner" className="rounded-full border border-slate-900/10 bg-white/60 p-2 text-slate-900 backdrop-blur transition-all hover:bg-primary hover:text-white dark:border-white/10 dark:bg-background/50 dark:text-white">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

    </section>
  );
}
