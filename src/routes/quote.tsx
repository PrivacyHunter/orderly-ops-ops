import { createFileRoute, Link } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { motion } from "framer-motion";
import { CheckCircle2, Upload, Send, ArrowRight, Zap, Target } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { submitQuote } from "@/lib/quotes.functions";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";

const schema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email"),
  sportType: z.string().min(2, "Sport type is required"),
  quantity: z.number().min(20, "Minimum order is 20 pieces"),
  deadline: z.string().min(2, "Deadline is required"),
  designNotes: z.string().min(10, "Design notes are required"),
});

export const Route = createFileRoute("/quote")({
  component: Quote,
});

function Quote() {
  const submitQuoteFn = useServerFn(submitQuote);
  const [orderId, setOrderId] = useState<string | null>(null);
  
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: any) => {
    try {
      const res = await submitQuoteFn({ data: { ...data, quantity: Number(data.quantity) } });
      if (res.success) {
        setOrderId(res.orderId);
        toast.success("Quote submitted successfully!", {
          icon: <CheckCircle2 className="text-neon-lime" />
        });
      }
    } catch {
      toast.error("Failed to submit inquiry. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white selection:bg-neon-cyan selection:text-background">
      <Navbar />
      <main className="py-16 md:py-24 px-4 lg:px-8 max-w-7xl mx-auto overflow-x-hidden">
        {orderId ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-3xl mx-auto bg-card p-6 sm:p-12 md:p-20 rounded-3xl md:rounded-[3rem] border border-neon-cyan/30 text-center shadow-[0_0_100px_rgba(0,243,255,0.1)]"
          >
            <div className="w-24 h-24 bg-neon-cyan/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-neon-cyan/20">
              <CheckCircle2 className="text-neon-cyan w-12 h-12" />
            </div>
            <h2 className="text-3xl sm:text-5xl font-black uppercase italic tracking-tighter mb-4 leading-none">Quote <br /><span className="text-neon-cyan">Received!</span></h2>
            <div className="bg-white/5 border border-white/10 p-6 rounded-2xl mb-12">
               <p className="text-xs font-bold uppercase tracking-[0.3em] text-muted-foreground mb-2">Your Tracking ID</p>
               <p className="text-3xl font-black tracking-tighter italic text-white">{orderId}</p>
            </div>
            <p className="text-muted-foreground text-lg mb-12 leading-relaxed">Our experts are reviewing your design mockups and fabric requirements. Expect a formal quote and production timeline in your inbox within 24 hours.</p>
            <div className="flex flex-wrap justify-center gap-6">
               <Link to="/track" className="bg-white text-background px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-neon-lime transition-all">
                  Track Status
               </Link>
               <Link to="/" className="border border-white/20 text-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-sm hover:border-neon-cyan transition-all">
                  Back Home
               </Link>
            </div>
          </motion.div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-24 items-start">
             <div>
                <h3 className="text-neon-lime font-black tracking-[0.25em] sm:tracking-[0.4em] uppercase mb-4 text-[10px] sm:text-sm break-words">Custom Order Portal</h3>
                <h1 className="page-title font-black uppercase italic tracking-tighter leading-[1.05] mb-6 break-words">
                   Build Your <br /><span className="text-neon-cyan">Legendary Gear</span>
                </h1>
                <p className="text-muted-foreground text-sm sm:text-lg leading-relaxed mb-10">
                   From professional soccer clubs to elite combat athletes, we manufacture gear that defines teams. Use our portal to submit your vision.
                </p>

                <div className="space-y-8">
                   <Feature icon={<Zap className="text-neon-cyan" />} title="Infinite Sublimation" desc="High-definition colors that never peel or fade." />
                   <Feature icon={<Target className="text-neon-lime" />} title="Elite Sourcing" desc="Access to engineered performance fabrics used by pros." />
                   <Feature icon={<CheckCircle2 className="text-neon-cyan" />} title="Strict QC" desc="Triple-stage quality assurance on every single piece." />
                </div>
             </div>

             <motion.div 
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               className="bg-card p-6 sm:p-10 md:p-16 rounded-3xl md:rounded-[3rem] border border-white/10 relative overflow-hidden shadow-2xl"
             >
                <div className="absolute top-0 right-0 w-64 h-64 bg-neon-cyan/5 blur-[100px] -z-10" />
                <h2 className="text-xl sm:text-3xl font-black uppercase italic tracking-tighter mb-8 leading-none">Order Specifications</h2>
                
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-neon-cyan">Full Name</label>
                       <input {...register("name")} className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 outline-none focus:border-neon-cyan transition-colors" placeholder="John Doe" />
                       {errors.name && <p className="text-[10px] text-red-500 font-bold uppercase">{errors.name.message as string}</p>}
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-neon-cyan">Email</label>
                       <input {...register("email")} className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 outline-none focus:border-neon-cyan transition-colors" placeholder="john@team.com" />
                       {errors.email && <p className="text-[10px] text-red-500 font-bold uppercase">{errors.email.message as string}</p>}
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-neon-cyan">Sport Type</label>
                       <input {...register("sportType")} className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 outline-none focus:border-neon-cyan transition-colors" placeholder="e.g. Soccer, Boxing" />
                       {errors.sportType && <p className="text-[10px] text-red-500 font-bold uppercase">{errors.sportType.message as string}</p>}
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-neon-cyan">Quantity (Min 20)</label>
                       <input {...register("quantity", { valueAsNumber: true })} type="number" className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 outline-none focus:border-neon-cyan transition-colors" placeholder="50" />
                       {errors.quantity && <p className="text-[10px] text-red-500 font-bold uppercase">{errors.quantity.message as string}</p>}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase tracking-widest text-neon-cyan">Required Deadline</label>
                     <input {...register("deadline")} className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 outline-none focus:border-neon-cyan transition-colors" placeholder="2026-10-15" />
                     {errors.deadline && <p className="text-[10px] text-red-500 font-bold uppercase">{errors.deadline.message as string}</p>}
                  </div>

                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase tracking-widest text-neon-cyan">Design & Fabric Notes</label>
                     <textarea {...register("designNotes")} rows={5} className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 outline-none focus:border-neon-cyan transition-colors" placeholder="Tell us about your colors, logos, and preferred materials..." />
                     {errors.designNotes && <p className="text-[10px] text-red-500 font-bold uppercase">{errors.designNotes.message as string}</p>}
                  </div>

                  <button 
                    disabled={isSubmitting} 
                    className="w-full bg-neon-cyan hover:bg-neon-lime text-background font-black uppercase italic py-6 rounded-2xl transition-all shadow-[0_20px_40px_rgba(0,243,255,0.2)] flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    {isSubmitting ? "Processing..." : <>Submit Custom Order <ArrowRight size={20} /></>}
                  </button>
                </form>
             </motion.div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

function Feature({ icon, title, desc }: { icon: any, title: string, desc: string }) {
   return (
      <div className="flex gap-6 items-start">
         <div className="w-14 h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center shrink-0">
            {icon}
         </div>
         <div>
            <h4 className="font-black uppercase tracking-widest text-sm mb-2">{title}</h4>
            <p className="text-muted-foreground text-sm leading-relaxed">{desc}</p>
         </div>
      </div>
   );
}
