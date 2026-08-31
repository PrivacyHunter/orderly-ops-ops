import { motion } from "framer-motion";
import { FileText, Layers, Cog, Plane } from "lucide-react";

const STEPS = [
  {
    icon: FileText,
    step: "01",
    title: "Design & Tech Pack Submission",
    desc: "Share artwork, sketches or a tech pack. Our design team rebuilds it production-ready within 48 hours.",
  },
  {
    icon: Layers,
    step: "02",
    title: "Fabric & Sublimation Sampling",
    desc: "Approve GSM, fabric hand-feel and colour-matched sublimation strike-offs before bulk starts.",
  },
  {
    icon: Cog,
    step: "03",
    title: "Precision Bulk Production",
    desc: "Laser cutting, flatlock stitching and triple-stage QC across every size and colourway.",
  },
  {
    icon: Plane,
    step: "04",
    title: "Express Global Delivery",
    desc: "Private-labelled, poly-bagged and shipped door to door via DHL, FedEx, UPS or Aramex.",
  },
];

export function OemWorkflow() {
  return (
    <section className="bg-background px-4 py-16 md:py-20 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <h3 className="mb-3 text-sm font-black uppercase tracking-[0.24em] text-primary">OEM & Private Label</h3>
        <h2 className="mb-10 section-title font-black uppercase italic tracking-tight">
          Custom Manufacturing <span className="text-primary">Workflow</span>
        </h2>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map(({ icon: Icon, step, title, desc }, i) => (
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="group relative rounded-lg border border-border bg-card p-6 transition-all hover:-translate-y-1 hover:border-primary hover:shadow-lg"
            >
              <span className="absolute right-5 top-5 text-3xl font-black italic text-foreground/5">{step}</span>
              <span className="mb-5 grid h-11 w-11 place-items-center rounded-lg border border-primary/30 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <Icon size={20} strokeWidth={2} />
              </span>
              <h4 className="mb-2 text-base font-black uppercase leading-tight tracking-tight">{title}</h4>
              <p className="text-sm leading-relaxed text-muted-foreground">{desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
