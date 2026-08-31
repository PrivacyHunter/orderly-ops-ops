import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useTheme } from "@/components/ThemeProvider";
import { HeroSlider } from "@/components/HeroSlider";
import { FeaturedProducts } from "@/components/FeaturedProducts";
import { Testimonials } from "@/components/Testimonials";
import { CategoryGrid } from "@/components/CategoryGrid";
import { VisionMission } from "@/components/VisionMission";
import { InstagramSection } from "@/components/InstagramSection";
import { StatsStrip } from "@/components/StatsStrip";
import { OemWorkflow } from "@/components/OemWorkflow";
import { FabricTech } from "@/components/FabricTech";
import { MoqTiers, EcoManufacturing, SizeGuide, OrderTrackingBanner } from "@/components/B2bSections";

import { Certifications } from "@/components/Certifications";
import { motion } from "framer-motion";
import { ShieldCheck, Zap, Scissors, Truck, Globe, Award, Factory, Users, Loader2 } from "lucide-react";
import { useEffect } from "react";
import { getPageSeo } from "@/lib/seo.functions";
import { getLandingPageContent } from "@/lib/content.functions";
import { getSiteBlocks } from "@/lib/site-blocks.functions";
import { getPublicBanners, getPublicProducts } from "@/lib/banners.functions";
import { getPublicCertificates } from "@/lib/certificates.functions";
import { assetUrl } from "@/lib/media";
import stitchingImg from "@/assets/wf-stitching.jpg.asset.json";
import qcImg from "@/assets/wf-qc.jpg.asset.json";
import shippingImg from "@/assets/wf-shipping.jpg.asset.json";
import materialImg from "@/assets/wf-material.jpg.asset.json";
import designImg from "@/assets/wf-design.jpg.asset.json";
import factoryImg from "@/assets/factory-view.jpg.asset.json";
import stitchingFloorImg from "@/assets/stitching-floor.jpg.asset.json";


import dhlLogo from "@/assets/dhl.png.asset.json";
import fedexLogo from "@/assets/fedex.png.asset.json";
import upsLogo from "@/assets/ups.png.asset.json";
import aramexLogo from "@/assets/aramex.png.asset.json";

export const Route = createFileRoute("/")({
  loader: async ({ context }) => {
    const qc = context.queryClient;
    // Fetch everything the homepage renders in parallel on the server so the
    // first paint already contains banners, products and content.
    const [seo] = await Promise.all([
      qc.ensureQueryData({
        queryKey: ["seo", "/"],
        queryFn: () => getPageSeo({ data: { path: "/" } }),
      }),
      qc.ensureQueryData({ queryKey: ["landing-page-content"], queryFn: () => getLandingPageContent() }),
      qc.ensureQueryData({ queryKey: ["site-blocks"], queryFn: () => getSiteBlocks() }),
      qc.ensureQueryData({ queryKey: ["public-banners"], queryFn: () => getPublicBanners() }),
      qc.ensureQueryData({
        queryKey: ["public-products", "featured"],
        queryFn: () => getPublicProducts({ data: { featuredOnly: true } }),
      }),
      qc.ensureQueryData({ queryKey: ["public-certificates"], queryFn: () => getPublicCertificates() }),
    ]);
    return seo;
  },
  head: ({ loaderData }) => {
    const seo = loaderData as any;
    const title = seo?.title || "Ambition Sports | Elite Performance Wear";
    const description = seo?.description || "High-performance custom sportswear and apparel manufacturer.";
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
  component: Index,
});

function Index() {
  const getContent = useServerFn(getLandingPageContent);
  const { data: content } = useQuery({
    queryKey: ["landing-page-content"],
    queryFn: () => getContent(),
  });

  const heroCta = content?.hero?.ctaText || "I have approved the plan";

  const loadBlocks = useServerFn(getSiteBlocks);
  const { data: blocks } = useQuery({ queryKey: ["site-blocks"], queryFn: () => loadBlocks() });
  const fallbackImages = [designImg.url, materialImg.url, stitchingImg.url, qcImg.url, shippingImg.url].map(assetUrl);
  const DEFAULT_WORKFLOW = [
    { num: "01", title: "Design", desc: "Digital mockups & 3D tech packs.", image: "" },
    { num: "02", title: "Material", desc: "Elite performance fabrics selection.", image: "" },
    { num: "03", title: "Stitching", desc: "High-density flatlock precision.", image: "" },
    { num: "04", title: "QC Check", desc: "Rigorous final quality assurance.", image: "" },
    { num: "05", title: "Shipping", desc: "Express global logistics delivery.", image: "" },
  ];
  const workflow = (blocks?.workflow?.length ? blocks.workflow : DEFAULT_WORKFLOW).map((step, i) => ({
    ...step,
    image: step.image || fallbackImages[i] || fallbackImages[0]!,
  }));

  const f = blocks?.facilities;
  const facilities = {
    eyebrow: f?.eyebrow || "Industrial Excellence",
    title1: f?.title1 || "Advanced",
    title2: f?.title2 || "Facilities",
    description:
      f?.description ||
      "Operating from Sialkot's industrial hub, our facility integrates vertical production lines. We handle everything from high-tech sublimation to precision tailoring under one roof.",
    image1: f?.image1 || assetUrl(factoryImg.url),
    image2: f?.image2 || assetUrl(stitchingFloorImg.url),
    stat1Value: f?.stat1Value || "25+",
    stat1Label: f?.stat1Label || "Export Nations",
    stat2Value: f?.stat2Value || "500k",
    stat2Label: f?.stat2Label || "Units Yearly",
    buttonLabel: f?.buttonLabel || "Explore Stitching Unit",
    buttonUrl: f?.buttonUrl || "/quote",
  };

  useEffect(() => {
    const track = async () => {
      const consent = localStorage.getItem("ambition_tracking_consent");
      if (!consent) return;

      try {
        const res = await fetch('https://ipapi.co/json/');
        const location = await res.json();
        
        await fetch('/api/public/tracking', {
          method: 'POST',
          body: JSON.stringify({
            path: '/',
            location: location,
            device: {
              browser: navigator.userAgent,
              platform: navigator.platform
            }
          })
        });
      } catch (err) {}
    };
    track();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main>
        <HeroSlider />

        <StatsStrip />

        <VisionMission />

        <CategoryGrid />

        <OemWorkflow />

        <FeaturedProducts />

        <FabricTech />

        <MoqTiers />

        <EcoManufacturing />

        <InstagramSection />




        {/* Brand Story Section */}
        <section className="bg-background px-4 py-14 md:py-20 lg:px-8">
          <div className="mx-auto grid max-w-7xl items-center gap-10 rounded-2xl border border-border bg-[#0f172a] p-6 text-white md:gap-14 md:p-12 lg:grid-cols-2">
            <div className="relative order-2 lg:order-1 px-2 md:px-0">
              <div className="grid grid-cols-2 gap-4 rounded-[2rem] md:rounded-[3rem] overflow-hidden group">
                <div className="space-y-4">
                  <div className="aspect-[4/5] rounded-2xl md:rounded-3xl overflow-hidden border border-white/10 relative">
                    <img 
                      src={facilities.image1} 
                      alt="Ambition Sports manufacturing facility" 

                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 hover:scale-105"
                    />
                  </div>
                  <div className="glass p-3 md:p-4 rounded-xl md:rounded-2xl border border-white/10 text-center">
                    <div className="text-2xl md:text-3xl font-black text-primary italic">{facilities.stat1Value}</div>
                    <div className="text-[7px] md:text-[8px] font-bold uppercase tracking-widest text-muted-foreground mt-1">{facilities.stat1Label}</div>
                  </div>
                </div>
                <div className="space-y-4 pt-8">
                  <div className="glass p-3 md:p-4 rounded-xl md:rounded-2xl border border-white/10 text-center">
                    <div className="text-2xl md:text-3xl font-black text-primary italic">{facilities.stat2Value}</div>
                    <div className="text-[7px] md:text-[8px] font-bold uppercase tracking-widest text-muted-foreground mt-1">{facilities.stat2Label}</div>
                  </div>
                  <div className="aspect-[4/5] rounded-2xl md:rounded-3xl overflow-hidden border border-white/10 relative">
                    <img 
                      src={facilities.image2} 
                      alt="Stitching floor at the Ambition Sports facility" 
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 hover:scale-105"
                    />

                  </div>
                </div>
              </div>
              <div className="absolute -top-5 md:-top-10 -left-5 md:-left-10 w-20 md:w-40 h-20 md:h-40 bg-primary/20 blur-[60px] md:blur-[100px] pointer-events-none" />
              <div className="absolute -bottom-5 md:-bottom-10 -right-5 md:-right-10 w-20 md:w-40 h-20 md:h-40 bg-primary/20 blur-[60px] md:blur-[100px] pointer-events-none" />
            </div>

            <div className="order-1 lg:order-2">
              <h3 className="mb-4 text-sm font-black uppercase tracking-[0.24em] text-primary">{facilities.eyebrow}</h3>
              <h2 className="mb-6 section-title font-black uppercase italic tracking-tight text-white">
                {facilities.title1} <br /><span className="text-primary">{facilities.title2}</span>
              </h2>
              <p className="mb-10 text-base leading-relaxed text-white/70 md:text-lg">
                {facilities.description}
              </p>
              
              <div className="mb-10 grid grid-cols-1 gap-6 sm:grid-cols-2 [&_h4]:text-white [&_p]:text-white/60">
                <FacilityItem icon={<Award className="text-primary" />} title="ISO 9001:2015" desc="Certified quality management standards." />
                <FacilityItem icon={<Zap className="text-primary" />} title="Sublimation Pro" desc="Infinite colors, zero-fade technology." />
                <FacilityItem icon={<Scissors className="text-primary" />} title="Laser Cutting" desc="Computerized precision fabric cutting." />
                <FacilityItem icon={<ShieldCheck className="text-primary" />} title="QC Protocol" desc="Triple-stage quality inspection." />
              </div>

              <a
                href={facilities.buttonUrl}
                className="inline-block bg-primary text-white hover:bg-slate-900 dark:hover:bg-white hover:text-white dark:hover:text-background hover:shadow-xl px-10 py-5 rounded-xl font-black uppercase tracking-widest text-sm transition-all duration-300"
              >
                {facilities.buttonLabel}
              </a>
            </div>
          </div>
        </section>

        {/* How We Build Section */}
        <section className="mx-auto max-w-7xl bg-background px-4 py-16 text-center md:py-20 lg:px-8">
          <h3 className="text-primary font-black tracking-[0.3em] uppercase mb-6 text-sm">The Process</h3>
          <h2 className="mb-12 section-title font-black uppercase italic tracking-tighter leading-tight [hyphens:none] break-normal md:mb-24"><span className="inline-block whitespace-nowrap">Manufacturing</span> <span className="inline-block whitespace-nowrap text-primary">Workflow</span></h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 sm:gap-12 relative w-full px-2 max-w-full overflow-hidden">
            <div className="hidden lg:block absolute top-12 left-0 w-full h-[2px] bg-border -z-10" />
            {workflow.map((step, i) => (
              <WorkflowStep key={i} num={step.num} title={step.title} desc={step.desc} image={step.image} />
            ))}
          </div>
        </section>

        <Testimonials />

        {/* Worldwide Shipping */}

        <section className="bg-primary py-16 md:py-20 overflow-hidden relative">
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="w-full h-full bg-[url('https://www.transparenttextures.com/patterns/world-map.png')] bg-repeat" />
          </div>
          <div className="max-w-7xl mx-auto px-4 lg:px-8 relative z-10 flex flex-col items-center text-center gap-10 md:gap-12">
            <div className="w-full">
              <h2 className="text-primary-foreground font-black text-3xl md:text-5xl uppercase italic tracking-tighter mb-2">We Ship Worldwide</h2>
              <p className="text-primary-foreground/80 font-bold uppercase tracking-widest text-[10px] md:text-sm">Express doorstep delivery via global partners</p>
            </div>
            <div className="w-full grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 md:gap-x-12 md:gap-y-8 items-center justify-items-center text-black font-black italic uppercase tracking-tighter">
               <span className="text-lg md:text-2xl whitespace-nowrap">DHL Express</span>
               <span className="text-lg md:text-2xl whitespace-nowrap">FedEx</span>
               <span className="text-lg md:text-2xl whitespace-nowrap">UPS</span>
               <span className="text-lg md:text-2xl whitespace-nowrap">Aramex</span>
               <span className="text-lg md:text-2xl whitespace-nowrap">DPD</span>
               <span className="text-lg md:text-2xl whitespace-nowrap">Skynet</span>
            </div>
          </div>
        </section>

        <SizeGuide />

        <Certifications />

        {/* Who We Are preview */}
        <section className="border-y border-border bg-surface px-4 py-16 md:py-20 lg:px-8">
          <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-2">
            <div className="min-w-0">
              <h3 className="mb-4 text-sm font-black uppercase tracking-[0.24em] text-primary">Who We Are</h3>
              <h2 className="mb-6 section-title font-black uppercase italic leading-tight tracking-tighter [hyphens:none] [overflow-wrap:break-word]">
                Built In <span className="text-primary">Sialkot</span>, Worn Worldwide
              </h2>
              <p className="mb-4 text-base leading-relaxed text-muted-foreground">
                Ambition Sports is a Sialkot-based manufacturer and exporter of high-performance custom sportswear,
                activewear and athletic apparel. From sublimation printing and precision embroidery to full cut & sew
                production, everything happens under one roof in our own facility.
              </p>
              <p className="mb-8 text-base leading-relaxed text-muted-foreground">
                Professional teams, clubs and global retailers rely on us for consistent quality, low minimums and a
                transparent 3-4 week turnaround with no hidden fees.
              </p>
              <Link
                to="/about"
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-7 py-4 text-xs font-black uppercase tracking-widest text-primary-foreground transition-transform hover:scale-[1.02]"
              >
                Learn More About Us
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { value: "15+", label: "Years Manufacturing" },
                { value: "25+", label: "Export Nations" },
                { value: "500k", label: "Units Yearly" },
                { value: "100%", label: "In-House Production" },
              ].map((s) => (
                <div key={s.label} className="rounded-3xl border border-border bg-surface p-6">
                  <p className="text-3xl font-black italic text-primary md:text-4xl">{s.value}</p>
                  <p className="mt-2 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>




        <OrderTrackingBanner />

        {/* Red footer CTA banner */}
        <section className="bg-primary px-4 py-14 md:py-16 lg:px-8">
          <div className="mx-auto flex max-w-7xl flex-col items-center gap-6 text-center md:flex-row md:justify-between md:text-left">
            <h2 className="section-title max-w-3xl font-black uppercase italic tracking-tight text-primary-foreground">
              Ready To Launch Or Scale Your Sportswear Line?
            </h2>
            <Link
              to="/quote"
              className="shrink-0 rounded-lg bg-[#0f172a] px-8 py-4 text-xs font-black uppercase tracking-[0.16em] text-white transition-transform hover:scale-[1.03]"
            >
              Get Instant B2B Quote
            </Link>
          </div>
        </section>

        {/* Final CTA / Footer Form Intro */}
        <section className="py-32 px-4 lg:px-8 text-center bg-background border-t border-border relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_50%_0%,var(--primary),transparent_70%)] opacity-[0.05]" />
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto p-12 md:p-20 rounded-[3rem] bg-primary/5 border border-primary/10 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] -z-10" />
            <h2 className="text-3xl sm:text-4xl md:text-6xl font-black uppercase italic tracking-tighter mb-8 leading-none">
              Start Your <br /><span className="text-primary">Custom Order</span>
            </h2>
            <p className="text-muted-foreground text-[10px] sm:text-lg mb-12 max-w-2xl mx-auto uppercase font-bold tracking-widest">
              Join the elite athletes and teams who trust Ambition Sports for their professional custom apparel needs.
            </p>
            <Link to="/quote" className="inline-block bg-primary text-primary-foreground hover:bg-white hover:shadow-[0_0_30px_rgba(212,175,55,0.4)] px-12 py-6 rounded-2xl font-black uppercase tracking-widest text-lg transition-all duration-300">
              Get A Quote Now
            </Link>
          </motion.div>
        </section>
      </main>

      <Footer />

      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}

function WorkflowStep({ num, title, desc, image }: { num: string; title: string; desc: string; image: string }) {
  return (
    <div className="relative group w-full">
      <div className="w-full aspect-square rounded-2xl md:rounded-3xl overflow-hidden mb-4 md:mb-8 border border-slate-200 dark:border-white/10 relative">
        <img 
          src={image} 
          alt={title} 
          className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <span className="text-2xl md:text-4xl font-black text-white italic">{num}</span>
        </div>
      </div>
      <h4 className="text-base md:text-lg font-black uppercase italic mb-2 md:mb-3 tracking-tighter">{title}</h4>
      <p className="text-[8px] md:text-[10px] font-bold uppercase tracking-widest text-muted-foreground leading-relaxed px-2 md:px-4">{desc}</p>
    </div>
  );
}

function FacilityItem({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="flex gap-5 items-start">
      <div className="w-14 h-14 rounded-2xl bg-primary/5 border border-primary/10 flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div>
        <h4 className="text-sm font-black uppercase italic tracking-widest mb-1">{title}</h4>
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}
