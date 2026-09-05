import { createFileRoute, Link } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useState } from "react";
import { getOrderStatus } from "@/lib/quotes.functions";
import { trackCustomOrder } from "@/lib/orders.functions";
import { useServerFn } from "@tanstack/react-start";
import { Search, Package, Truck, CheckCircle2, Factory, ShieldCheck, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { PageHero } from "@/components/PageHero";

export const Route = createFileRoute("/track")({
  head: () => {
    const title = "Track Your Order | Ambition Sports";
    const description =
      "Track your custom sportswear order in real time — design, sampling, manufacturing, quality assurance and worldwide dispatch updates.";
    return {
      title,
      meta: [
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: Track,
});

const statusMap: Record<string, { label: string; icon: any; progress: number }> = {
  pending: { label: "Order Received", icon: Package, progress: 10 },
  designing: { label: "Design & Tech Pack", icon: Factory, progress: 30 },
  sampling: { label: "Fabric & Sampling", icon: Factory, progress: 45 },
  production: { label: "Manufacturing", icon: Factory, progress: 60 },
  quality_check: { label: "Quality Assurance", icon: ShieldCheck, progress: 85 },
  shipped: { label: "Dispatched", icon: Truck, progress: 95 },
  delivered: { label: "Delivered", icon: CheckCircle2, progress: 100 },
  cancelled: { label: "Cancelled", icon: Package, progress: 100 },
};

const STAGES = ["pending", "designing", "sampling", "production", "quality_check", "shipped", "delivered"];

function Track() {
  const getStatus = useServerFn(getOrderStatus);
  const trackCustom = useServerFn(trackCustomOrder);
  const [orderId, setOrderId] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleTrack = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!orderId) return;
    setLoading(true);
    try {
      const custom = await trackCustom({ data: { trackingId: orderId } }).catch(() => null);
      if (custom) {
        setResult({ ...custom, orderId: custom.trackingId, found: true });
        return;
      }
      const res = await getStatus({ data: { orderId } });
      setResult(res);
    } finally {
      setLoading(false);
    }
  };

  const status = result ? statusMap[String(result.status)] : null;
  const currentStage = result ? STAGES.indexOf(String(result.status)) : -1;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 py-16 md:py-24 lg:px-8">
        <div className="mb-12 text-center md:mb-16">
          <h3 className="mb-4 text-[11px] font-black uppercase tracking-[0.3em] text-primary">Real-Time Logistics</h3>
          <h1 className="mb-6 page-title font-black uppercase italic leading-tight tracking-tight">
            Track Your <span className="text-primary">Ambition</span>
          </h1>
          <p className="mx-auto max-w-2xl text-base leading-relaxed text-muted-foreground">
            Monitor your custom apparel through every stage of our manufacturing process.
          </p>
        </div>

        <form onSubmit={handleTrack} className="mb-12 flex flex-col gap-3 md:flex-row">
          <label className="relative flex-1">
            <span className="sr-only">Tracking ID</span>
            <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <input
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              placeholder="Enter Tracking ID (e.g. AS-XXXXX)"
              className="h-14 w-full rounded-xl border border-border bg-card pl-12 pr-4 text-sm font-bold uppercase tracking-wider text-foreground outline-none transition-colors placeholder:font-medium placeholder:normal-case placeholder:tracking-normal placeholder:text-muted-foreground focus:border-primary"
            />
          </label>
          <button
            type="submit"
            disabled={loading}
            className="h-14 rounded-xl bg-primary px-10 text-xs font-black uppercase tracking-[0.16em] text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Searching…" : "Track Order"}
          </button>
        </form>

        {result && !status && (
          <p className="rounded-xl border border-border bg-card px-6 py-5 text-center text-sm font-bold text-muted-foreground">
            No order found for that tracking ID. Please check the code and try again.
          </p>
        )}

        <AnimatePresence>
          {result && status && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-border bg-card p-6 shadow-sm md:p-10"
            >
              <div className="mb-10 flex flex-col items-start justify-between gap-5 md:flex-row md:items-center">
                <div>
                  <p className="mb-2 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Order Identification</p>
                  <h2 className="text-2xl font-black uppercase italic tracking-tight text-foreground md:text-3xl">{result.orderId}</h2>
                </div>
                <div className="flex items-center gap-3 rounded-xl border border-primary/40 bg-primary/10 px-5 py-3">
                  <status.icon className="text-primary" size={20} />
                  <span className="text-xs font-black uppercase tracking-[0.16em] text-primary">{status.label}</span>
                </div>
              </div>

              {/* Progress */}
              <div className="mb-10">
                <div className="h-3 overflow-hidden rounded-full border border-border bg-muted">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${status.progress}%` }}
                    transition={{ duration: 0.9, ease: "easeOut" }}
                    className="h-full bg-primary"
                  />
                </div>
                <div className="mt-3 flex justify-between">
                  <span className="text-[10px] font-black uppercase tracking-[0.16em] text-muted-foreground">Order Placed</span>
                  <span className="text-[10px] font-black uppercase tracking-[0.16em] text-muted-foreground">Delivered</span>
                </div>
              </div>

              {/* Stage timeline */}
              <ol className="mb-10 grid gap-3 sm:grid-cols-2">
                {STAGES.map((stage, i) => {
                  const meta = statusMap[stage]!;
                  const done = currentStage >= i;
                  return (
                    <li
                      key={stage}
                      className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${
                        done ? "border-primary/40 bg-primary/5" : "border-border bg-background"
                      }`}
                    >
                      <meta.icon size={16} className={done ? "text-primary" : "text-muted-foreground"} />
                      <span className={`text-[11px] font-black uppercase tracking-[0.14em] ${done ? "text-foreground" : "text-muted-foreground"}`}>
                        {meta.label}
                      </span>
                    </li>
                  );
                })}
              </ol>

              <div className="grid gap-8 md:grid-cols-2">
                <div className="space-y-4">
                  <h4 className="border-b border-border pb-2 text-xs font-black uppercase tracking-[0.16em] text-primary">Timeline Details</h4>
                  <div className="space-y-3">
                    <TimelineItem label="Last Update" value={result.updatedAt ? new Date(result.updatedAt).toLocaleDateString() : "—"} active />
                    <TimelineItem label="Est. Delivery" value={result.estimatedDelivery ? new Date(result.estimatedDelivery).toLocaleDateString() : "—"} />
                    <TimelineItem label="Logistics Partner" value="DHL Global Express" />
                  </div>
                </div>
                <div className="rounded-xl border border-border bg-surface p-6">
                  <h4 className="mb-3 text-xs font-black uppercase tracking-[0.16em] text-foreground">Quality Assurance</h4>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    Your order passes through our triple-stage quality check so every stitch meets the Ambition Sports
                    professional standard.
                  </p>
                </div>
              </div>

              <div className="mt-10 flex flex-wrap gap-4 border-t border-border pt-8">
                <Link to="/" className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:text-primary">
                  <ArrowLeft size={14} /> Return to Home
                </Link>
                <Link to="/quote" className="text-[11px] font-black uppercase tracking-[0.16em] text-primary hover:opacity-80">
                  Start a New Order
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  );
}

function TimelineItem({ label, value, active = false }: { label: string; value: string; active?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">{label}</span>
      <span className={`text-sm font-black tracking-tight ${active ? "text-foreground" : "text-muted-foreground"}`}>{value}</span>
    </div>
  );
}
