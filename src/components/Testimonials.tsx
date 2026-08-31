import { useEffect, useState } from "react";
import { Star, Quote, ChevronLeft, ChevronRight } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";


const testimonials = [
  {
    name: "John Smith",
    flag: "🇬🇧",
    role: "Club Manager, Manchester UK",
    order: "240 pcs — Soccer Kits",
    content:
      "The quality of the custom kits we received was outstanding. Sublimation is crisp, colours matched our brand guide exactly and the flatlock stitching has survived a full season of matches. Delivered in 22 days, door to door.",
    rating: 5,
  },
  {
    name: "Elena Rodriguez",
    flag: "🇺🇸",
    role: "Fitness Brand Owner, Texas USA",
    order: "600 pcs — Activewear Line",
    content:
      "Ambition Sports delivered my activewear line ahead of schedule. The 220GSM fabric feels premium, the athletic fit is spot on, and private labelling with our own neck tags and poly-bags made it retail-ready out of the box.",
    rating: 5,
  },
  {
    name: "Ahmed Khan",
    flag: "🇦🇪",
    role: "League Coordinator, Dubai UAE",
    order: "18 Teams — Full Teamwear",
    content:
      "Great communication throughout the design process. Their designers rebuilt our artwork for free, sent mockups within 48 hours, and handled 18 team colourways without a single mistake. Pricing was transparent with no hidden fees.",
    rating: 5,
  },
  {
    name: "Lukas Meyer",
    flag: "🇩🇪",
    role: "Retail Buyer, Berlin Germany",
    order: "1,200 pcs — Hoodies & Jackets",
    content:
      "We tested five Sialkot suppliers and Ambition was the only one that passed our QC audit first time. Consistent GSM, clean embroidery on every crest and correct labelling across all sizes.",
    rating: 5,
  },
  {
    name: "Sarah Collins",
    flag: "🇺🇸",
    role: "College Athletics Director, Ohio USA",
    order: "350 pcs — Basketball Kits",
    content:
      "Player names and numbers were included at no extra cost, the reversible jerseys look professional and the low MOQ let us trial one squad before committing to the whole department.",
    rating: 5,
  },
  {
    name: "Marco Bianchi",
    flag: "🇮🇹",
    role: "Gym Chain Founder, Milan Italy",
    order: "800 pcs — Training Apparel",
    content:
      "Moisture-wicking performance is genuinely excellent and the print has not faded after months of washing. Reordering was even faster the second time — 3 weeks exactly, as promised.",
    rating: 5,
  },
];


export function Testimonials() {
  const shouldReduceMotion = useReducedMotion();
  const [start, setStart] = useState(0);
  const [perView, setPerView] = useState(3);

  useEffect(() => {
    const sync = () => setPerView(window.innerWidth < 640 ? 1 : window.innerWidth < 1024 ? 2 : 3);
    sync();
    window.addEventListener("resize", sync);
    return () => window.removeEventListener("resize", sync);
  }, []);

  useEffect(() => {
    if (shouldReduceMotion) return;
    const id = window.setInterval(() => setStart((s) => (s + 1) % testimonials.length), 4500);
    return () => window.clearInterval(id);
  }, [shouldReduceMotion]);

  const visible = Array.from({ length: perView }, (_, i) => testimonials[(start + i) % testimonials.length]!);
  const go = (dir: number) =>
    setStart((s) => (s + dir + testimonials.length) % testimonials.length);

  return (
    <section className="border-y border-border bg-surface py-16 md:py-20">
      <div className="max-w-7xl mx-auto px-4">
        <h3 className="text-primary font-black tracking-[0.3em] uppercase mb-4 text-center text-xs">
          Trusted Worldwide
        </h3>
        <h2 className="section-title mb-10 text-center font-black uppercase italic tracking-tight">
          What Our <span className="text-primary">Clients Say</span>
        </h2>

        <div className="relative">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            <AnimatePresence mode="popLayout" initial={false}>
              {visible.map((t) => (
                <motion.div
                  key={t.name}
                  layout
                  initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, x: 60, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, x: -60, scale: 0.95 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="relative rounded-lg border border-border bg-card p-7 shadow-[0_10px_30px_-22px_rgb(15_23_42_/_35%)] transition-colors duration-300 hover:border-primary"
                >
                  <Quote className="absolute right-5 top-5 text-primary/25" size={40} fill="currentColor" />
                  <div className="flex gap-1 mb-5">
                    {[...Array(t.rating)].map((_, s) => (
                      <Star key={s} size={14} className="fill-primary text-primary" />
                    ))}
                  </div>
                  <p className="mb-6 text-sm leading-relaxed text-muted-foreground">“{t.content}”</p>
                  <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-primary">
                    {t.order}
                  </span>
                  <div className="mt-6 border-t border-border pt-5">
                    <p className="font-black uppercase tracking-tight text-foreground"><span className="mr-2">{t.flag}</span>{t.name}</p>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary mt-1">{t.role}</p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <div className="mt-10 flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Previous testimonials"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:border-primary hover:text-primary"
            >
              <ChevronLeft size={18} />
            </button>
            <div className="flex gap-2">
              {testimonials.map((t, i) => (
                <button
                  key={t.name}
                  type="button"
                  onClick={() => setStart(i)}
                  aria-label={`Show testimonial ${i + 1}`}
                  className={`h-2 rounded-full transition-all ${i === start ? "w-6 bg-primary" : "w-2 bg-border"}`}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Next testimonials"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:border-primary hover:text-primary"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}


