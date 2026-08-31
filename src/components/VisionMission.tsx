import { motion, useReducedMotion } from "framer-motion";
import { Target, Compass } from "lucide-react";

const blocks = [
  {
    icon: Compass,
    title: "Our Vision",
    text: "To be the most trusted custom sportswear manufacturing partner from Pakistan — the name clubs, brands and retailers worldwide reach for when quality cannot be compromised.",
  },
  {
    icon: Target,
    title: "Our Mission",
    text: "Deliver pro-grade performance apparel with honest pricing, low minimums and a dependable 3-4 week turnaround, backed by in-house design, strict QC and fair-labour production.",
  },
];

export function VisionMission() {
  const reduce = useReducedMotion();
  return (
    <section className="border-y border-border bg-card px-4 py-20 dark:bg-background md:py-24 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <h3 className="mb-4 text-center text-sm font-black uppercase tracking-[0.24em] text-primary">What Drives Us</h3>
        <h2 className="mb-12 text-center section-title font-black uppercase italic leading-tight tracking-tighter [hyphens:none] [overflow-wrap:break-word]">
          Vision &amp; <span className="text-primary">Mission</span>
        </h2>
        <div className="grid gap-6 md:grid-cols-2 md:gap-8">
          {blocks.map((b, i) => (
            <motion.div
              key={b.title}
              initial={reduce ? { opacity: 1 } : { opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12, duration: 0.5 }}
              className="rounded-3xl border border-border bg-card p-8 shadow-sm md:p-10"
            >
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10">
                <b.icon className="text-primary" size={24} />
              </div>
              <h4 className="mb-3 text-xl font-black uppercase italic tracking-tighter md:text-2xl">{b.title}</h4>
              <p className="text-sm leading-relaxed text-muted-foreground md:text-base">{b.text}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
