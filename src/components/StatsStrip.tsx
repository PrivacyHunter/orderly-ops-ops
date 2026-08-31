import { Factory, Boxes, Globe2, Cog } from "lucide-react";

const STATS = [
  { icon: Factory, value: "15+", label: "Years Manufacturing" },
  { icon: Boxes, value: "500K+", label: "Annual Capacity" },
  { icon: Globe2, value: "25+", label: "Export Nations" },
  { icon: Cog, value: "100%", label: "In-House Production" },
];

export function StatsStrip() {
  return (
    <section className="-mt-px border-b-2 border-primary bg-surface">
      <div className="mx-auto grid max-w-7xl grid-cols-2 divide-y divide-border px-4 py-4 sm:py-5 lg:grid-cols-4 lg:divide-y-0 lg:divide-x lg:px-8">
        {STATS.map(({ icon: Icon, value, label }) => (
          <div key={label} className="flex items-center gap-3 px-2 py-3 sm:gap-4 sm:px-5">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-primary/30 bg-primary/10 text-primary sm:h-12 sm:w-12">
              <Icon size={20} strokeWidth={2.4} />
            </span>
            <div className="min-w-0">
              <p className="text-2xl font-black leading-none tracking-tight text-primary sm:text-3xl lg:text-4xl">
                {value}
              </p>
              <p className="mt-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-foreground sm:text-xs">
                {label}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

