import { createFileRoute, Link } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useState } from "react";
import { getOrderStatus } from "@/lib/quotes.functions";
import { trackCustomOrder } from "@/lib/orders.functions";
import { useServerFn } from "@tanstack/react-start";
import { Search, Package, Truck, CheckCircle2, Factory, ShieldCheck, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const Route = createFileRoute("/track")({
  component: Track,
});

const statusMap: Record<string, { label: string; icon: any; color: string; progress: number }> = {
  pending: { label: "Order Received", icon: Package, color: "text-white", progress: 10 },
  designing: { label: "Design & Tech Pack", icon: Factory, color: "text-neon-cyan", progress: 30 },
  sampling: { label: "Fabric & Sampling", icon: Factory, color: "text-neon-cyan", progress: 45 },
  production: { label: "Manufacturing", icon: Factory, color: "text-neon-lime", progress: 60 },
  quality_check: { label: "Quality Assurance", icon: ShieldCheck, color: "text-neon-cyan", progress: 85 },
  shipped: { label: "Dispatched", icon: Truck, color: "text-neon-lime", progress: 95 },
  delivered: { label: "Delivered", icon: CheckCircle2, color: "text-neon-lime", progress: 100 },
  cancelled: { label: "Cancelled", icon: Package, color: "text-white", progress: 100 },
};

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

  return (
    <div className="min-h-screen bg-[#020617] text-white selection:bg-neon-lime selection:text-background">
      <Navbar />
      <main className="py-24 px-4 lg:px-8 max-w-4xl mx-auto">
        <div className="text-center mb-16">
           <h3 className="text-neon-cyan font-black tracking-[0.4em] uppercase mb-6 text-sm">Real-Time Logistics</h3>
           <h1 className="text-6xl md:text-8xl font-black uppercase italic tracking-tighter leading-none mb-8">
              Track Your <br /><span className="text-neon-lime">Ambition</span>
           </h1>
           <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Monitor your custom apparel through every stage of our elite manufacturing process.
           </p>
        </div>

        <form onSubmit={handleTrack} className="flex flex-col md:flex-row gap-4 mb-16">
          <div className="flex-1 relative">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
            <input 
              value={orderId} 
              onChange={(e) => setOrderId(e.target.value)} 
              placeholder="Enter Tracking ID (e.g. AS-XXXXX)" 
              className="w-full pl-14 pr-6 py-6 bg-white/5 rounded-2xl border border-white/10 outline-none focus:border-neon-cyan transition-all text-lg font-bold italic tracking-wider uppercase" 
            />
          </div>
          <button 
            type="submit"
            disabled={loading}
            className="bg-neon-cyan hover:bg-neon-lime text-background px-12 py-6 rounded-2xl font-black uppercase italic tracking-widest transition-all shadow-[0_20px_40px_rgba(0,243,255,0.2)] disabled:opacity-50"
          >
            {loading ? "Searching..." : "Track Order"}
          </button>
        </form>

        <AnimatePresence>
          {result && status && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card p-10 md:p-16 rounded-[3rem] border border-white/10 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-neon-lime/5 blur-[100px] -z-10" />
              
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
                <div>
                   <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground mb-2">Order Identification</p>
                   <h2 className="text-3xl font-black tracking-tighter italic">{result.orderId}</h2>
                </div>
                <div className="bg-white/5 border border-white/10 px-6 py-3 rounded-xl flex items-center gap-3">
                   <status.icon className={status.color} size={20} />
                   <span className="font-black uppercase tracking-widest text-sm">{status.label}</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="relative mb-16">
                <div className="h-4 bg-white/5 rounded-full overflow-hidden border border-white/5">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${status.progress}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-neon-cyan to-neon-lime shadow-[0_0_20px_rgba(57,255,20,0.3)]"
                  />
                </div>
                <div className="flex justify-between mt-4">
                   <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Order Placed</span>
                   <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Delivered</span>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-12">
                 <div className="space-y-6">
                    <h4 className="text-neon-cyan font-black uppercase tracking-widest text-xs border-b border-white/10 pb-2">Timeline Details</h4>
                    <div className="space-y-4">
                       <TimelineItem label="Last Update" value={new Date(result.updatedAt).toLocaleDateString()} active />
                       <TimelineItem label="Est. Delivery" value={new Date(result.estimatedDelivery).toLocaleDateString()} />
                       <TimelineItem label="Logistics Partner" value="DHL Global Express" />
                    </div>
                 </div>
                 <div className="bg-white/[0.03] p-8 rounded-2xl border border-white/5">
                    <h4 className="text-white font-black uppercase tracking-widest text-xs mb-4">Quality Assurance</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed italic">
                       "Your order is currently passing through our triple-stage quality check to ensure every stitch meets the Ambition Sports professional standard."
                    </p>
                 </div>
              </div>

              <div className="mt-12 pt-12 border-t border-white/10 flex flex-wrap gap-4">
                 <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-white transition-colors text-xs font-black uppercase tracking-widest">
                    <ArrowLeft size={14} /> Return to Home
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
      <div className="flex justify-between items-center">
         <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{label}</span>
         <span className={`text-sm font-black italic tracking-tighter ${active ? "text-white" : "text-muted-foreground"}`}>{value}</span>
      </div>
   );
}
