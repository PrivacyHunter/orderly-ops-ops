import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { trackCustomOrder, ORDER_STAGE_PROGRESS, type OrderStage } from "@/lib/orders.functions";
import {
  Leaf,
  Recycle,
  Scan,
  HeartHandshake,
  Check,
  PencilRuler,
  FlaskConical,
  Factory,
  Plane,
} from "lucide-react";

const TIERS = [
  {
    name: "Starter",
    range: "50 - 100 Pcs",
    perks: ["Free digital mockups", "Standard sublimation", "Stock neck labels", "Air / sea shipping"],
    featured: false,
  },
  {
    name: "Pro Team",
    range: "100 - 500 Pcs",
    perks: ["Free mockups + tech pack", "HD sublimation support", "Custom woven neck labels", "Priority production slot"],
    featured: true,
  },
  {
    name: "Enterprise",
    range: "500+ Pcs",
    perks: ["Dedicated account manager", "Full private label & OEM", "Custom packaging & hang tags", "Priority express shipping"],
    featured: false,
  },
];

export function MoqTiers() {
  return (
    <section className="border-y border-border bg-background px-4 py-14 md:py-16 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <h3 className="mb-3 text-center text-sm font-black uppercase tracking-[0.28em] text-primary">Wholesale Tiers</h3>
        <h2 className="mb-10 text-center section-title font-black uppercase italic tracking-tight">
          B2B MOQs &amp; <span className="text-primary">Order Tiers</span>
        </h2>
        <div className="grid gap-5 md:grid-cols-3">
          {TIERS.map((t) => (
            <div
              key={t.name}
              className={`rounded-lg border-2 bg-card p-6 transition-colors ${
                t.featured ? "border-primary shadow-lg" : "border-border hover:border-primary/50"
              }`}
            >
              <p className="text-[11px] font-black uppercase tracking-[0.24em] text-muted-foreground">{t.name}</p>
              <p className="mt-2 text-3xl font-black italic uppercase tracking-tight text-primary">{t.range}</p>
              <ul className="mt-5 space-y-2.5">
                {t.perks.map((p) => (
                  <li key={p} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Check size={16} className="mt-0.5 shrink-0 text-primary" />
                    {p}
                  </li>
                ))}
              </ul>
              <Link
                to="/quote"
                className="mt-6 block rounded-lg bg-primary py-3 text-center text-[11px] font-black uppercase tracking-[0.16em] text-primary-foreground transition-transform hover:scale-[1.02]"
              >
                Request Pricing
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const ECO = [
  { icon: Recycle, title: "Recycled Performance Fabrics", desc: "rPET yarns spun from post-consumer bottles with the same 220GSM+ performance." },
  { icon: Leaf, title: "OEKO-TEX Certified Inks", desc: "Skin-safe, low-impact sublimation inks tested for harmful substances." },
  { icon: Scan, title: "Zero-Waste Laser Cutting", desc: "Computerised nesting cuts fabric waste by up to 18% on every bulk run." },
  { icon: HeartHandshake, title: "Fair-Wage Ethical Workplace", desc: "Audited working hours, fair wages and safe conditions across every line." },
];

export function EcoManufacturing() {
  return (
    <section className="bg-surface px-4 py-14 md:py-16 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <h3 className="mb-3 text-sm font-black uppercase tracking-[0.28em] text-primary">Responsible Production</h3>
        <h2 className="mb-10 section-title font-black uppercase italic tracking-tight">
          Eco-Friendly <span className="text-primary">Manufacturing</span>
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {ECO.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-lg border border-border bg-card p-5">
              <Icon size={22} strokeWidth={2} className="mb-3 text-primary" />
              <h4 className="mb-1.5 text-sm font-black uppercase tracking-tight">{title}</h4>
              <p className="text-xs leading-relaxed text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const SIZE_TABLES: Record<string, { head: string[]; rows: string[][] }> = {
  Jerseys: {
    head: ["Size", "Chest (in)", "Length (in)", "EU", "UK"],
    rows: [
      ["S", "36-38", "27", "46", "36"],
      ["M", "38-40", "28", "48", "38"],
      ["L", "40-42", "29", "50", "40"],
      ["XL", "42-44", "30", "52", "42"],
      ["2XL", "44-46", "31", "54", "44"],
    ],
  },
  Shorts: {
    head: ["Size", "Waist (in)", "Inseam (in)", "EU", "UK"],
    rows: [
      ["S", "28-30", "7", "46", "30"],
      ["M", "30-32", "7.5", "48", "32"],
      ["L", "32-34", "8", "50", "34"],
      ["XL", "34-36", "8.5", "52", "36"],
      ["2XL", "36-38", "9", "54", "38"],
    ],
  },
  Hoodies: {
    head: ["Size", "Chest (in)", "Length (in)", "EU", "UK"],
    rows: [
      ["S", "38-40", "27", "46", "36"],
      ["M", "40-42", "28", "48", "38"],
      ["L", "42-44", "29", "50", "40"],
      ["XL", "44-46", "30", "52", "42"],
      ["2XL", "46-48", "31", "54", "44"],
    ],
  },
};

export function SizeGuide() {
  const tabs = Object.keys(SIZE_TABLES);
  const [tab, setTab] = useState(tabs[0]!);
  const table = SIZE_TABLES[tab]!;

  return (
    <section className="border-y border-border bg-background px-4 py-14 md:py-16 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-2 lg:items-start">
        <div>
          <h3 className="mb-3 text-sm font-black uppercase tracking-[0.28em] text-primary">Fit Standards</h3>
          <h2 className="mb-5 section-title font-black uppercase italic tracking-tight">
            International <span className="text-primary">Size Guide</span>
          </h2>
          <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
            Every kit is graded against US, EU and UK size standards. Athletic, regular and relaxed fits are
            available on all sublimated and cut &amp; sew products — custom size sets are produced on request.
          </p>
          <div className="flex flex-wrap gap-2">
            {["US Standard", "EU Standard", "UK Standard", "Athletic Fit", "Custom Grading"].map((b) => (
              <span
                key={b}
                className="rounded border border-primary/40 bg-primary/5 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-primary"
              >
                {b}
              </span>
            ))}
          </div>
        </div>

        <div className="min-w-0">
          <div className="mb-4 flex gap-2">
            {tabs.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={`rounded border-2 px-4 py-2 text-[11px] font-black uppercase tracking-[0.16em] transition-colors ${
                  t === tab ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground hover:border-primary/50"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full min-w-[420px] text-left text-sm">
              <thead className="bg-surface">
                <tr>
                  {table.head.map((h) => (
                    <th key={h} className="px-4 py-3 text-[10px] font-black uppercase tracking-[0.16em] text-muted-foreground">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {table.rows.map((r) => (
                  <tr key={r[0]} className="border-t border-border">
                    {r.map((c, i) => (
                      <td key={i} className={`px-4 py-3 ${i === 0 ? "font-black text-primary" : "text-muted-foreground"}`}>
                        {c}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}

const TRACK_STEPS: { icon: any; label: string; stage: OrderStage }[] = [
  { icon: PencilRuler, label: "Design Approved", stage: "designing" },
  { icon: FlaskConical, label: "Sampling", stage: "sampling" },
  { icon: Factory, label: "Bulk Production", stage: "production" },
  { icon: Plane, label: "Express Shipping", stage: "shipped" },
];

export function OrderTrackingBanner() {
  const track = useServerFn(trackCustomOrder);
  const [id, setId] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Awaited<ReturnType<typeof trackCustomOrder>> | null>(null);
  const [notFound, setNotFound] = useState(false);

  const onTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id.trim()) return;
    setLoading(true);
    setNotFound(false);
    try {
      const res = await track({ data: { trackingId: id } });
      setResult(res);
      setNotFound(!res);
    } catch {
      setResult(null);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  const progress = result ? ORDER_STAGE_PROGRESS[result.status] : 0;

  return (
    <section className="bg-[#0f172a] px-4 py-12 md:py-14 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-md">
          <h3 className="mb-3 text-sm font-black uppercase tracking-[0.28em] text-primary">Live Order Tracking</h3>
          <h2 className="subsection-title font-black uppercase italic tracking-tight text-white">
            Track Every Stage Of Your <span className="text-primary">Bulk Order</span>
          </h2>
          <form onSubmit={onTrack} className="mt-5 flex flex-col gap-3 sm:flex-row">
            <input
              value={id}
              onChange={(e) => setId(e.target.value)}
              placeholder="Tracking ID e.g. AS-4KD91X"
              aria-label="Order tracking ID"
              className="min-w-0 flex-1 rounded-lg border-2 border-primary/60 bg-white/5 px-4 py-3 text-sm font-bold uppercase tracking-widest text-white outline-none placeholder:text-white/40 focus:border-primary"
            />
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-primary px-7 py-3 text-[11px] font-black uppercase tracking-[0.16em] text-primary-foreground transition-transform hover:scale-[1.03] disabled:opacity-50"
            >
              {loading ? "Checking…" : "Track Order"}
            </button>
          </form>
          {notFound && (
            <p className="mt-3 text-xs font-bold uppercase tracking-widest text-primary">
              No order found for that tracking ID.
            </p>
          )}
          {result && (
            <div className="mt-4 rounded-lg border border-white/10 bg-white/5 p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">{result.trackingId} · {result.product}</p>
              <p className="mt-1 text-lg font-black uppercase italic tracking-tight text-white">{result.label}</p>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                <div className="h-full bg-primary transition-all duration-700" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}
          <Link to="/track" className="mt-4 inline-block text-[11px] font-black uppercase tracking-[0.16em] text-white/60 hover:text-primary">
            Open full tracking page →
          </Link>
        </div>
        <div className="grid flex-1 grid-cols-2 gap-3 lg:max-w-2xl lg:grid-cols-4">
          {TRACK_STEPS.map(({ icon: Icon, label, stage }, i) => {
            const active = result ? progress >= ORDER_STAGE_PROGRESS[stage] : false;
            return (
              <div
                key={label}
                className={`rounded-lg border p-4 text-center transition-colors ${active ? "border-primary bg-primary/15" : "border-white/10 bg-white/5"}`}
              >
                <Icon size={20} className="mx-auto mb-2 text-primary" strokeWidth={2} />
                <p className="text-[9px] font-black uppercase tracking-[0.16em] text-white/50">Step 0{i + 1}</p>
                <p className="mt-1 text-xs font-black uppercase tracking-tight text-white">{label}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
