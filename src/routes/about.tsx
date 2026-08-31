import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { PageHero } from "@/components/PageHero";
import { Footer } from "@/components/Footer";
import { motion } from "framer-motion";
import { Shield, Target, Eye, Gem, Award, Users, Box, Headphones, Upload, CheckCircle2, Globe } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { useState } from "react";
import { submitInquiry } from "@/lib/inquiries.functions";
import { useServerFn } from "@tanstack/react-start";


const quoteSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email"),
  sportType: z.string().min(2, "Sport type is required"),
  quantity: z.string().min(1, "Quantity is required"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type QuoteFormValues = z.infer<typeof quoteSchema>;

import { getPageSeo } from "@/lib/seo.functions";
import { Certifications } from "@/components/Certifications";

export const Route = createFileRoute("/about")({
  loader: async ({ context }) => {
    return context.queryClient.ensureQueryData({
      queryKey: ["seo", "/about"],
      queryFn: () => getPageSeo({ data: { path: "/about" } }),
    });
  },
  head: ({ loaderData }) => {
    const seo = loaderData as any;
    const title = seo?.title || "About Us | Ambition Sports";
    const description = seo?.description || "Learn about Ambition Sports' legacy of premium custom sportswear manufacturing.";
    return {
      title,
      meta: [
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
        ...(seo?.ogImage ? [{ property: "og:image", content: seo.ogImage }] : []),
      ],
    };
  },
  component: About,
});

function About() {
  useEffect(() => {
    const track = async () => {
      try {
        await fetch('/api/public/tracking', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            path: '/about',
            referrer: document.referrer,
            userAgent: navigator.userAgent
          })
        });
      } catch (e) {}
    };
    track();
  }, []);

  const submitInquiryFn = useServerFn(submitInquiry);
  const [fileName, setFileName] = useState<string | null>(null);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<QuoteFormValues>({
    resolver: zodResolver(quoteSchema),
  });

  const onSubmit = async (data: QuoteFormValues) => {
    try {
      await submitInquiryFn({
        data: {
          name: data.name,
          email: data.email,
          subject: `Bulk Quote Request: ${data.sportType}`,
          message: data.message,
          details: {
            sportType: data.sportType,
            quantity: data.quantity,
            fileName: fileName || "None"
          }
        }
      });
      toast.success("Quote request sent successfully! We will contact you shortly.", {
        icon: <CheckCircle2 className="text-neon-lime" />,
        className: "bg-background border-neon-lime/20 text-white"
      });
      reset();
      setFileName(null);
    } catch (error) {
      toast.error("Failed to submit quote request. Please try again.");
    }
  };


  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFileName(e.target.files[0].name);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      <Navbar />

      <main>
        <PageHero
          pageKey="about"
          accentClass="text-primary"
          ruleClass="bg-primary"
          defaults={{
            eyebrow: "Since Day One",
            title1: "Our",
            title2: "Ambition",
            subtitle: "Legacy of Manufacturing Excellence",
            image: "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?q=80&w=2070&auto=format&fit=crop",
          }}
        />

        {/* Story Section */}
        <section className="py-16 md:py-32 px-4 lg:px-8 max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 md:gap-24 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="page-title font-black uppercase tracking-tighter italic mb-10 leading-[0.9] break-words">
              The Power Behind <br /><span className="text-primary">The Pros</span>
            </h2>
            <div className="space-y-8 text-muted-foreground text-sm sm:text-base leading-relaxed break-words">
              <p>
                Founded in the heart of Sialkot, Ambition Sports has evolved from a small stitching unit into a leading global manufacturer of premium custom sportswear. Our journey is fueled by a relentless drive to provide athletes with gear that matches their hustle.
              </p>
              <p>
                We specialize in full sublimation, custom embroidery, and high-performance fabric engineering. Every jersey, hoodie, and pair of leggings we produce carries the mark of excellence, exported to professional teams and retail brands worldwide.
              </p>
            </div>
            
            <div className="mt-12 flex flex-wrap gap-6">
               <div className="bg-white/5 border border-white/10 px-6 py-3 rounded-full flex items-center gap-3">
                  <Award className="text-primary" size={20} />
                  <span className="font-bold text-xs uppercase tracking-widest text-white">ISO 9001 Certified</span>
               </div>
               <div className="bg-white/5 border border-white/10 px-6 py-3 rounded-full flex items-center gap-3">
                  <Globe className="text-primary" size={20} />
                  <span className="font-bold text-xs uppercase tracking-widest text-white">Exported to 30+ Countries</span>
               </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-2 gap-6 relative">
             <div className="absolute inset-0 bg-primary/5 blur-[120px] -z-10" />
             <StatCard number="15+" label="Years Experience" />
             <StatCard number="200+" label="Expert Staff" />
             <StatCard number="50k+" label="Monthly Output" />
             <StatCard number="100%" label="Satisfaction" />
          </div>
        </section>

        {/* Who We Are / What We Do / Our Approach */}
        <section className="border-y border-border bg-surface px-4 py-20 md:py-28 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-3">
            <div className="min-w-0">
              <h3 className="mb-4 text-xs sm:text-sm font-black uppercase tracking-[0.24em] text-primary">01 — Who We Are</h3>
              <h2 className="mb-5 subsection-title font-black uppercase italic leading-tight tracking-tighter break-words">
                Sialkot-Built, Globally Trusted
              </h2>
              <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
                Founded in Sialkot, Pakistan — the world capital of sports manufacturing — Ambition Sports is a leading global
                manufacturer and exporter of high-performance custom sportswear, activewear and athletic apparel. We power
                professional teams, clubs, gym brands and global retailers with factory-direct production and full B2B support.
              </p>
            </div>

            <div className="min-w-0">
              <h3 className="mb-4 text-xs sm:text-sm font-black uppercase tracking-[0.24em] text-primary">02 — What We Do</h3>
              <h2 className="mb-5 subsection-title font-black uppercase italic leading-tight tracking-tighter break-words">
                Core Manufacturing Capabilities
              </h2>
              <ul className="space-y-3">
                {[
                  "High-Definition Sublimation Printing (Italian inks, zero-fade).",
                  "Precision Embroidery & 3D Crest Patchwork.",
                  "Custom Cut & Sew Manufacturing (flatlock stitching, athletic fits).",
                  "Performance Fabric Engineering (220GSM+ moisture-wicking polyester blends).",
                  "Private Labeling & OEM Branding (custom neck labels, tags, poly-bags).",
                ].map((item) => (
                  <li key={item} className="flex gap-3 text-sm leading-relaxed text-muted-foreground">
                    <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-primary" />
                    <span className="min-w-0 break-words">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="min-w-0">
              <h3 className="mb-4 text-xs sm:text-sm font-black uppercase tracking-[0.24em] text-primary">03 — Our Approach</h3>
              <h2 className="mb-5 subsection-title font-black uppercase italic leading-tight tracking-tighter break-words">
                Transparent, Quality-First Partnership
              </h2>
              <ul className="space-y-3">
                {[
                  "Triple-stage quality control on every single unit shipped.",
                  "Transparent 3-4 week turnaround times, communicated up front.",
                  "No hidden fees — setup, names, numbers and logos included.",
                  "Low MOQs so new teams and startups can order with confidence.",
                  "Free in-house design consultation and unlimited mockup revisions.",
                ].map((item) => (
                  <li key={item} className="flex gap-3 text-sm leading-relaxed text-muted-foreground">
                    <Shield size={16} className="mt-0.5 shrink-0 text-primary" />
                    <span className="min-w-0 break-words">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Mission / Vision / Values */}

        <section className="bg-surface py-32 px-4 lg:px-8 border-y border-border">
          <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-12">
            <ValueCard 
              icon={<Target className="text-primary" size={48} />}
              title="Our Mission"
              desc="To empower athletes through innovative, high-performance apparel that blends style with uncompromising quality."
            />
            <ValueCard 
              icon={<Eye className="text-primary" size={48} />}
              title="Our Vision"
              desc="To be the world's most trusted partner for custom sportswear, setting the standard for speed, quality, and design."
            />
            <ValueCard 
              icon={<Gem className="text-primary" size={48} />}
              title="Core Values"
              desc="Integrity in manufacturing, relentless innovation, and a customer-first approach in every stitch."
            />
          </div>
        </section>

        {/* Quote Form Section */}
        <section className="py-32 px-4 lg:px-8 max-w-5xl mx-auto">
           <div className="bg-card border border-border rounded-[3rem] p-10 md:p-20 relative overflow-hidden shadow-2xl">
             <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 blur-[100px] -z-10" />
             <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/5 blur-[100px] -z-10" />
             
             <div className="max-w-3xl mx-auto">
               <h2 className="section-title font-black uppercase italic tracking-tighter mb-4 text-center leading-tight break-words">
                 Request A <span className="text-primary">Bulk Quote</span>
               </h2>
               <p className="text-muted-foreground mb-16 text-center text-sm uppercase font-bold tracking-[0.2em]">Partner with Ambition Sports today</p>

               <form onSubmit={handleSubmit(onSubmit)} className="grid md:grid-cols-2 gap-8">
                 <div className="space-y-3">
                   <label className="text-xs sm:text-sm font-black uppercase tracking-[0.24em] text-primary">Full Name</label>
                   <input {...register("name")} className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 focus:border-primary outline-none transition-all focus:bg-white/[0.08]" placeholder="e.g. John Doe" />
                   {errors.name && <span className="text-red-500 text-[10px] font-bold uppercase tracking-widest">{errors.name.message}</span>}
                 </div>
                 <div className="space-y-3">
                   <label className="text-xs sm:text-sm font-black uppercase tracking-[0.24em] text-primary">Business Email</label>
                   <input {...register("email")} className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 focus:border-primary outline-none transition-all focus:bg-white/[0.08]" placeholder="john@company.com" />
                   {errors.email && <span className="text-red-500 text-[10px] font-bold uppercase tracking-widest">{errors.email.message}</span>}
                 </div>
                 <div className="space-y-3">
                   <label className="text-xs sm:text-sm font-black uppercase tracking-[0.24em] text-primary">Sport / Product Type</label>
                   <input {...register("sportType")} className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 focus:border-primary outline-none transition-all focus:bg-white/[0.08]" placeholder="e.g. Soccer, Basketball" />
                   {errors.sportType && <span className="text-red-500 text-[10px] font-bold uppercase tracking-widest">{errors.sportType.message}</span>}
                 </div>
                 <div className="space-y-3">
                   <label className="text-xs sm:text-sm font-black uppercase tracking-[0.24em] text-primary">Estimated Quantity</label>
                   <input {...register("quantity")} type="number" className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 focus:border-primary outline-none transition-all focus:bg-white/[0.08]" placeholder="Min. 20 Pieces" />
                   {errors.quantity && <span className="text-red-500 text-[10px] font-bold uppercase tracking-widest">{errors.quantity.message}</span>}
                 </div>
                 <div className="md:col-span-2 space-y-3">
                   <label className="text-xs sm:text-sm font-black uppercase tracking-[0.24em] text-primary">Design Mockup / Logo</label>
                   <div className="relative">
                      <input 
                        type="file" 
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                        accept="image/*,.pdf,.ai,.eps"
                      />
                      <div className="w-full bg-white/5 border-2 border-dashed border-white/10 rounded-2xl py-6 px-6 flex flex-col items-center justify-center gap-2 hover:border-primary/50 transition-colors">
                        <Upload className="text-muted-foreground" size={24} />
                        <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                          {fileName || "Click to upload design files"}
                        </span>
                        <span className="text-[10px] text-muted-foreground/50 italic">AI, PDF, EPS, PNG, JPG (Max 50MB)</span>
                      </div>
                   </div>
                 </div>
                 <div className="md:col-span-2 space-y-3">
                   <label className="text-xs sm:text-sm font-black uppercase tracking-[0.24em] text-primary">Detailed Requirements</label>
                   <textarea {...register("message")} rows={5} className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 focus:border-primary outline-none transition-all focus:bg-white/[0.08]" placeholder="Tell us about fabric, sizing, colors, and deadline..." />
                   {errors.message && <span className="text-red-500 text-[10px] font-bold uppercase tracking-widest">{errors.message.message}</span>}
                 </div>
                 <div className="md:col-span-2 pt-6">
                   <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full bg-primary hover:bg-white text-primary-foreground font-black uppercase italic py-6 rounded-2xl transition-all hover:scale-[1.02] shadow-[0_20px_40px_rgba(212,175,55,0.2)] disabled:opacity-50 disabled:cursor-not-allowed group"
                   >
                     {isSubmitting ? "Processing..." : (
                       <span className="flex items-center justify-center gap-3">
                         Submit Quote Request <CheckCircle2 className="group-hover:scale-125 transition-transform" size={20} />
                       </span>
                     )}
                   </button>
                 </div>
               </form>
             </div>
           </div>
        </section>
      </main>

      <Certifications />

      <Footer />
    </div>
  );
}

function StatCard({ number, label }: { number: string, label: string }) {
  return (
    <motion.div 
      whileHover={{ scale: 1.05 }}
      className="bg-surface border border-border p-5 sm:p-8 md:p-10 rounded-[2rem] text-center group min-w-0 hover:border-primary/40 transition-all shadow-xl"
    >
       <div className="text-[clamp(1.75rem,7vw,3rem)] font-black text-white mb-3 group-hover:text-primary transition-colors italic leading-none break-words">{number}</div>
       <div className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground group-hover:text-primary transition-colors">{label}</div>
    </motion.div>
  );
}

function ValueCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <motion.div 
      whileHover={{ y: -10 }}
      className="p-12 bg-background border border-border rounded-[2.5rem] hover:shadow-[0_0_50px_rgba(212,175,55,0.05)] transition-all relative group overflow-hidden"
    >
       <div className="absolute top-0 left-0 w-2 h-0 bg-primary group-hover:h-full transition-all duration-500" />
       <div className="mb-8">{icon}</div>
       <h3 className="text-2xl font-black uppercase tracking-tighter italic mb-6 group-hover:text-primary transition-colors">{title}</h3>
       <p className="text-muted-foreground leading-relaxed text-sm font-medium">{desc}</p>
    </motion.div>
  );
}
