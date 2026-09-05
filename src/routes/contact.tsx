import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { PageHero } from "@/components/PageHero";
import { Footer } from "@/components/Footer";
import { FaqAccordion } from "@/components/FaqAccordion";

import { motion } from "framer-motion";
import { Phone, Mail, MapPin, Clock, MessageSquare, Send, CheckCircle2, Factory } from "lucide-react";
import { toast } from "sonner";
import { submitInquiry } from "@/lib/inquiries.functions";
import { submitCustomOrder } from "@/lib/orders.functions";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";


import { getPageSeo } from "@/lib/seo.functions";

export const Route = createFileRoute("/contact")({
  loader: async ({ context }) => {
    return context.queryClient.ensureQueryData({
      queryKey: ["seo", "/contact"],
      queryFn: () => getPageSeo({ data: { path: "/contact" } }),
    });
  },
  head: ({ loaderData }) => {
    const seo = loaderData as any;
    const title = seo?.title || "Contact Us | Ambition Sports";
    const description = seo?.description || "Get a quote for your custom sportswear project or visit our Sialkot factory.";
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
  component: Contact,
});

function Contact() {
  const submitInquiryFn = useServerFn(submitInquiry);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    
    try {
      await submitInquiryFn({
        data: {
          name: formData.get("name") as string,
          email: formData.get("email") as string,
          subject: formData.get("subject") as string,
          message: formData.get("message") as string,
        }
      });
      
      toast.success("Message sent successfully!", {
        icon: <CheckCircle2 className="text-neon-lime" />,
        description: "Our international sales team will reach out within 24 hours."
      });
      (e.target as HTMLFormElement).reset();
    } catch (error) {
      toast.error("Failed to send message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      <Navbar />

      <main>
        <PageHero
          pageKey="contact"
          accentClass="text-primary"
          ruleClass="bg-primary"
          defaults={{
            eyebrow: "Global Headquarters",
            title1: "Get In",
            title2: "Touch",
            subtitle: "Direct Manufacturing & Export Inquiries",
            image: "https://images.unsplash.com/photo-1526772662000-3f88f10405ff?q=80&w=2034&auto=format&fit=crop",
          }}
        />

        <section className="mx-auto max-w-7xl px-4 py-14 sm:py-20 lg:px-8 lg:py-32">
          <div className="grid gap-10 lg:grid-cols-3 lg:gap-16">
            
            {/* Contact Info Cards */}
            <div className="lg:col-span-1 space-y-8">
               <div className="space-y-6">
                 <ContactCard 
                  icon={<Phone className="text-primary" size={24} />} 
                  title="Phone / WhatsApp" 
                  value="+92 (304) 989-3054" 
                  desc="Mon-Sat, 9am-6pm (GMT+5)"
                 />
                 <ContactCard 
                  icon={<Mail className="text-primary" size={24} />} 
                  title="Official Email" 
                  value="ambitionsports381@gmail.com" 
                  desc="For bulk order & dealership inquiries"
                 />
                 <ContactCard 
                  icon={<MapPin className="text-primary" size={24} />} 
                  title="Factory Location" 
                  value="Industrial Estate, Sialkot, Pakistan" 
                  desc="Visit our state-of-the-art facility"
                 />
               </div>
               
               <motion.a 
                whileHover={{ scale: 1.02 }}
                href="https://wa.me/923049893054" 
                target="_blank" 
                className="flex items-center justify-center gap-4 bg-[#25D366] text-white font-black uppercase italic py-6 rounded-2xl hover:brightness-110 transition-all shadow-[0_20px_40px_rgba(37,211,102,0.2)] text-sm tracking-widest"
               >
                 <MessageSquare size={22} fill="currentColor" /> Chat On WhatsApp
               </motion.a>

               <div className="p-8 bg-white/5 border border-white/10 rounded-2xl text-center">
                  <Clock className="text-primary mx-auto mb-4" size={32} />
                  <h4 className="font-black uppercase tracking-widest text-xs mb-2">Operational Hours</h4>
                  <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest">Mon - Sat: 09:00 - 18:00</p>
                  <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest mt-1 italic">Sunday: Production Maintenance</p>
               </div>
            </div>

            {/* Map Placeholder & Form */}
            <div className="lg:col-span-2 space-y-12">
                <div className="group relative h-[300px] w-full overflow-hidden rounded-2xl border border-white/10 bg-white/5 sm:h-[450px] sm:rounded-[2.5rem]">
                  <div className="absolute inset-0 z-0">
                    <iframe 
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d108420.21102983796!2d74.46083375837648!3d32.50296766518116!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x391ee9042c130095%3A0x1927702e71887e14!2sSialkot%2C%20Punjab%2C%20Pakistan!5e0!3m2!1sen!2s!4v1700000000000!5m2!1sen!2s" 
                      width="100%" 
                      height="100%" 
                      style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg) contrast(90%) brightness(0.8)' }} 
                      allowFullScreen={true} 
                      loading="lazy" 
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  </div>
                  <div className="absolute inset-0 pointer-events-none border-[12px] border-background/20 rounded-[2.5rem]" />
                   <div className="absolute left-3 top-3 z-10 flex max-w-[calc(100%-1.5rem)] items-center gap-3 rounded-xl border border-white/10 bg-background/80 p-3 backdrop-blur-md sm:left-8 sm:top-8 sm:gap-4 sm:p-4">
                     <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                        <Factory className="text-background" size={24} />
                     </div>
                     <div>
                        <h4 className="font-black uppercase tracking-widest text-xs">Ambition Sports Unit-1</h4>
                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Sialkot Industrial Zone</p>
                     </div>
                  </div>
               </div>

                <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-2xl sm:p-10 md:rounded-[3rem] md:p-16">
                 <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] -z-10" />
                 <h2 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter mb-4 leading-none">Global <br /><span className="text-primary">Inquiry Portal</span></h2>
                 <p className="text-muted-foreground mb-12 uppercase font-bold tracking-widest text-xs">Direct line to our manufacturing experts</p>
                 
                  <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-8">
                     <div className="space-y-3">
                       <label className="text-xs sm:text-sm font-black uppercase tracking-[0.24em] text-primary">Client Name</label>
                       <input name="name" required className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 focus:border-primary outline-none transition-all focus:bg-white/[0.08]" placeholder="e.g. David Smith" />
                     </div>
                     <div className="space-y-3">
                       <label className="text-xs sm:text-sm font-black uppercase tracking-[0.24em] text-primary">Email Address</label>
                       <input name="email" required type="email" className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 focus:border-primary outline-none transition-all focus:bg-white/[0.08]" placeholder="david@sportsclub.com" />
                     </div>
                     <div className="md:col-span-2 space-y-3">
                       <label className="text-xs sm:text-sm font-black uppercase tracking-[0.24em] text-primary">Inquiry Subject</label>
                       <input name="subject" required className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 focus:border-primary outline-none transition-all focus:bg-white/[0.08]" placeholder="e.g. Private Label Manufacturing Inquiry" />
                     </div>
                     <div className="md:col-span-2 space-y-3">
                       <label className="text-xs sm:text-sm font-black uppercase tracking-[0.24em] text-primary">Detailed Message</label>
                       <textarea name="message" required rows={6} className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 focus:border-primary outline-none transition-all focus:bg-white/[0.08]" placeholder="Tell us about your project requirements..." />
                     </div>
                     <div className="md:col-span-2 pt-4">
                       <button type="submit" disabled={isSubmitting} className="w-full bg-primary hover:bg-white text-primary-foreground font-black uppercase italic py-6 rounded-2xl transition-all shadow-[0_20px_40px_rgba(212,175,55,0.2)] group disabled:opacity-50">
                         <span className="flex items-center justify-center gap-3">
                           {isSubmitting ? "Sending..." : "Send Message"} <Send className="group-hover:translate-x-2 transition-transform" size={20} />
                         </span>
                       </button>
                     </div>
                  </form>

               </div>
            </div>

          </div>

          <CustomOrderForm />
        </section>


        {/* Global Logistics Section */}
        <section className="py-24 border-t border-white/5 bg-white/[0.01]">
           <div className="max-w-7xl mx-auto px-4 lg:px-8 text-center">
             <h4 className="text-primary font-black tracking-[0.3em] uppercase mb-12 text-base md:text-xl">Our Global Logistics Partners</h4>
             <div className="flex flex-wrap justify-center gap-16 items-center opacity-90 hover:opacity-100 transition-all duration-700">
                <span className="text-foreground font-black text-3xl md:text-4xl tracking-tighter italic">DHL</span>
                <span className="text-foreground font-black text-3xl md:text-4xl tracking-tighter italic">FEDEX</span>
                <span className="text-foreground font-black text-3xl md:text-4xl tracking-tighter italic">UPS</span>
                <span className="text-foreground font-black text-3xl md:text-4xl tracking-tighter italic">TNT</span>
                <span className="text-foreground font-black text-3xl md:text-4xl tracking-tighter italic">DPD</span>
             </div>
           </div>
        </section>

        <FaqAccordion />
      </main>


      <Footer />
    </div>
  );
}

function CustomOrderForm() {
  const submitOrderFn = useServerFn(submitCustomOrder);
  const [sending, setSending] = useState(false);
  const [tracking, setTracking] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const get = (k: string) => String(fd.get(k) ?? "").trim();
    setSending(true);
    try {
      const res = await submitOrderFn({
        data: {
          name: get("name"),
          email: get("email"),
          phone: get("phone"),
          company: get("company"),
          product: get("product"),
          quantity: Number(get("quantity")) || 0,
          moq: get("moq"),
          colors: get("color"),
          deliveryTime: get("delivery"),
          designDetails: get("design"),
        },
      });
      setTracking(res.trackingId);
      toast.success(`Custom order received — ${res.trackingId}`, {
        description: "Track your production stages any time on the Track Order page.",
      });
      form.reset();
    } catch {
      toast.error("Could not send your request. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div id="custom-order" className="mt-20 rounded-[3rem] border border-border bg-card p-8 shadow-xl md:p-14">
      <h2 className="mb-3 section-title font-black uppercase italic leading-none tracking-tighter">
        Custom <span className="text-primary">Order Form</span>
      </h2>
      <p className="mb-10 text-xs font-bold uppercase tracking-widest text-muted-foreground">
        Share your specs — we reply with pricing and lead time
      </p>

      {tracking && (
        <div className="mb-10 rounded-2xl border-2 border-primary bg-primary/5 p-5">
          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-muted-foreground">Your tracking ID</p>
          <p className="mt-1 text-2xl font-black italic tracking-tight text-primary">{tracking}</p>
          <p className="mt-2 text-xs text-muted-foreground">
            Save this ID — enter it on the Track Order page to follow every production stage.
          </p>
        </div>
      )}

      <form onSubmit={onSubmit} className="grid gap-6 md:grid-cols-2">
        <Field label="Product" name="product" required placeholder="e.g. Soccer Kit / Hoodie" />
        <Field label="Quantity" name="quantity" required type="number" placeholder="e.g. 250" />
        <Field label="Minimum Order Qty (MOQ)" name="moq" placeholder="e.g. 50 pcs" />
        <Field label="Colors" name="color" placeholder="e.g. Navy / Red / White" />
        <Field label="Required Delivery Time" name="delivery" placeholder="e.g. 4 weeks" />
        <Field label="Company / Club" name="company" placeholder="e.g. Riverside FC" />
        <Field label="Your Name" name="name" required placeholder="e.g. David Smith" />
        <Field label="Email" name="email" required type="email" placeholder="david@club.com" />
        <Field label="Phone / WhatsApp" name="phone" placeholder="+1 555 0100" />
        <div className="space-y-3 md:col-span-2">
          <label className="text-xs sm:text-sm font-black uppercase tracking-[0.24em] text-primary">Design Details</label>
          <textarea
            name="design"
            rows={5}
            required
            placeholder="Logos, sublimation artwork, fabric, sizes breakdown..."
            className="w-full rounded-2xl border border-input bg-background px-6 py-4 outline-none transition-all focus:border-primary"
          />
        </div>
        <div className="md:col-span-2">
          <button
            type="submit"
            disabled={sending}
            className="group flex w-full items-center justify-center gap-3 rounded-2xl bg-primary py-5 font-black uppercase italic tracking-widest text-primary-foreground transition-all hover:brightness-110 disabled:opacity-50"
          >
            {sending ? "Sending..." : "Submit Custom Order"} <Send size={18} className="transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  placeholder,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div className="space-y-3">
      <label className="text-xs sm:text-sm font-black uppercase tracking-[0.24em] text-primary">{label}</label>
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-input bg-background px-6 py-4 outline-none transition-all focus:border-primary"
      />
    </div>
  );
}


function ContactCard({ icon, title, value, desc }: { icon: React.ReactNode, title: string, value: string, desc: string }) {
  return (
    <motion.div 
      whileHover={{ x: 10 }}
      className="p-8 bg-surface border border-border rounded-2xl group hover:border-primary/40 transition-all shadow-xl relative overflow-hidden"
    >
       <div className="absolute top-0 left-0 w-1 h-0 bg-primary group-hover:h-full transition-all duration-300" />
       <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-6 border border-white/10 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">{icon}</div>
       <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground mb-2 group-hover:text-white transition-colors">{title}</h3>
       <div className="text-xl font-bold mb-2 italic tracking-tighter">{value}</div>
       <div className="text-xs text-muted-foreground font-medium">{desc}</div>
    </motion.div>
  );
}
