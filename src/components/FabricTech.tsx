import { Droplets, Move3d, ShieldCheck, Sparkles } from "lucide-react";
import { assetUrl } from "@/lib/media";
import fabricA from "@/assets/fabric-mesh.jpg";
import fabricB from "@/assets/fabric-stretch.jpg";

const SPECS = [
  {
    icon: Droplets,
    title: "Moisture Wicking",
    desc: "220GSM+ micro-polyester pulls sweat off skin and dries in minutes under match load.",
  },
  {
    icon: Move3d,
    title: "4-Way Stretch",
    desc: "Elastane blends recover their shape after every sprint, squat and full range of motion.",
  },
  {
    icon: ShieldCheck,
    title: "Anti-Bacterial Dry-Fit",
    desc: "Odour-control finish keeps team kits fresh through back-to-back fixtures and travel.",
  },
  {
    icon: Sparkles,
    title: "Sublimation Durability",
    desc: "Italian inks bonded into the fibre — zero cracking, zero fade, wash after wash.",
  },
];

export function FabricTech() {
  return (
    <section className="border-y border-border bg-surface px-4 py-16 md:py-20 lg:px-8">
      <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-2">
        <div className="grid grid-cols-2 gap-3">
          {[fabricA, fabricB].map((img, i) => (
            <div
              key={i}
              className={`relative overflow-hidden rounded-lg border border-border bg-card ${i === 1 ? "mt-8" : ""}`}
            >
              <img
                src={img}
                alt="Performance fabric macro detail"
                loading="lazy"
                className="aspect-[4/5] w-full bg-muted object-cover"
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.visibility = "hidden"; }}
              />
              <span className="absolute bottom-3 left-3 rounded bg-primary px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.16em] text-primary-foreground">
                {i === 0 ? "220 GSM+" : "Zero Fade"}
              </span>
            </div>
          ))}
        </div>

        <div>
          <h3 className="mb-3 text-sm font-black uppercase tracking-[0.24em] text-primary">Fabric & Performance</h3>
          <h2 className="mb-8 section-title font-black uppercase italic tracking-tight">
            Engineered <span className="text-primary">Tech Specs</span>
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {SPECS.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="rounded-lg border border-border bg-card p-5">
                <Icon size={20} className="mb-3 text-primary" strokeWidth={2} />
                <h4 className="mb-1.5 text-sm font-black uppercase tracking-tight">{title}</h4>
                <p className="text-xs leading-relaxed text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
