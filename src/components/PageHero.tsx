import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { motion } from "framer-motion";
import { getSiteBlocks } from "@/lib/site-blocks.functions";
import { isVideoUrl } from "@/lib/media";

export type PageHeroContent = {
  eyebrow: string;
  title1: string;
  title2: string;
  subtitle: string;
  image: string;
};

/** Shared, admin-editable hero banner for the category and info pages. */
export function PageHero({
  pageKey,
  defaults,
  accentClass = "text-primary",
  ruleClass = "bg-primary",
}: {
  pageKey: string;
  defaults: PageHeroContent;
  accentClass?: string;
  ruleClass?: string;
}) {
  const load = useServerFn(getSiteBlocks);
  const { data } = useQuery({ queryKey: ["site-blocks"], queryFn: () => load() });

  const saved = (data?.pageBanners as Record<string, Partial<PageHeroContent>> | undefined)?.[pageKey] ?? {};
  const hero: PageHeroContent = {
    eyebrow: saved.eyebrow?.trim() || defaults.eyebrow,
    title1: saved.title1?.trim() || defaults.title1,
    title2: saved.title2?.trim() ?? defaults.title2,
    subtitle: saved.subtitle?.trim() || defaults.subtitle,
    image: saved.image?.trim() || defaults.image,
  };

  return (
    <section className="relative flex h-[300px] items-center justify-center overflow-hidden border-y-2 border-primary py-12 sm:h-[380px] sm:py-16 lg:h-auto lg:aspect-[16/7] lg:min-h-[420px] lg:max-h-[500px] lg:py-24">
      <div className="absolute inset-0 z-0 bg-muted">
        {isVideoUrl(hero.image) ? (
          <video src={hero.image} className="h-full w-full object-cover opacity-30" autoPlay muted loop playsInline />
        ) : (
          <img
            src={hero.image}
            alt=""
            width={1920}
            height={840}
            fetchPriority="high"
            loading="eager"
            decoding="async"
            className="h-full w-full object-cover opacity-30"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/60 to-background" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 mx-auto w-full min-w-0 max-w-4xl px-4 text-center sm:px-8"
      >
        {hero.eyebrow && (
          <h3 className={`mb-2 break-words text-[9px] font-black uppercase tracking-[0.16em] sm:mb-3 sm:tracking-[0.35em] sm:text-xs md:text-sm ${accentClass}`}>
            {hero.eyebrow}
          </h3>
        )}
        <h1 className="page-title mx-auto font-black uppercase italic text-foreground">
          <span className="block">{hero.title1}</span>
          {hero.title2 && <span className={`block ${accentClass}`}>{hero.title2}</span>}
        </h1>
        {hero.subtitle && (
          <div className="mt-3 flex items-center justify-center gap-3 sm:mt-5">
            <span className={`hidden h-[2px] w-8 shrink-0 sm:block sm:w-12 ${ruleClass}`} />
            <p className="max-w-[34ch] break-words text-[10px] font-bold uppercase leading-relaxed tracking-[0.12em] text-foreground/80 sm:text-xs sm:tracking-widest">
              {hero.subtitle}
            </p>
            <span className={`hidden h-[2px] w-8 shrink-0 sm:block sm:w-12 ${ruleClass}`} />
          </div>
        )}
      </motion.div>
    </section>
  );
}
