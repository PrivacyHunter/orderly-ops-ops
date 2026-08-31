import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";

const faqs = [
  {
    q: "What is your minimum order quantity (MOQ)?",
    a: "Our standard MOQ is 10 pieces per design for sublimated teamwear and 25 pieces for cut & sew or embroidered items. New clubs and startups can discuss lower trial quantities with our sales team.",
  },
  {
    q: "Can I order a pre-production sample first?",
    a: "Yes. We produce a paid pre-production sample in 7-10 working days so you can approve fabric, fit and print quality before we start bulk production. Sample costs are credited against bulk orders above 100 pieces.",
  },
  {
    q: "What are your delivery lead times?",
    a: "Bulk production takes 3 to 4 weeks after design and payment approval. Express air shipping via DHL, FedEx, UPS or Aramex adds 3-5 working days door-to-door.",
  },
  {
    q: "Do you offer private labeling and OEM branding?",
    a: "Absolutely. We supply custom woven neck labels, hang tags, size tags, printed poly-bags and branded packaging so the finished product ships fully under your own brand.",
  },
  {
    q: "Which artwork formats do you accept?",
    a: "Vector files (AI, EPS, PDF) are ideal. We also work from PNG, JPG or hand sketches — our in-house designers will rebuild your artwork into a print-ready tech pack free of charge.",
  },
  {
    q: "How does pricing and payment work?",
    a: "Every quote is itemised with no hidden fees; names, numbers and logos are included. We typically work on 50% advance and 50% before dispatch, via bank transfer or secure online payment.",
  },
];

export function FaqAccordion() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="border-t border-border bg-background px-4 py-20 dark:bg-zinc-950 md:py-28 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <h3 className="mb-4 text-center text-sm font-black uppercase tracking-[0.24em] text-primary">B2B Questions</h3>
        <h2 className="mb-12 text-center section-title font-black uppercase italic leading-tight tracking-tighter [hyphens:none] [overflow-wrap:break-word]">
          Frequently Asked <span className="text-primary">Questions</span>
        </h2>

        <div className="space-y-4">
          {faqs.map((item, i) => {
            const isOpen = open === i;
            return (
              <div
                key={item.q}
                className="overflow-hidden rounded-2xl border border-border bg-card"
              >
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left sm:px-7"
                >
                  <span className="min-w-0 break-words text-sm font-black uppercase tracking-tight sm:text-base">
                    {item.q}
                  </span>
                  <Plus
                    size={18}
                    className={`shrink-0 text-primary transition-transform duration-300 ${isOpen ? "rotate-45" : ""}`}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      <p className="px-5 pb-6 text-sm leading-relaxed text-muted-foreground sm:px-7">{item.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
