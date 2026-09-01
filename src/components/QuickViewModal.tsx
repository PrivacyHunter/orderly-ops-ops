import { motion, AnimatePresence } from "framer-motion";
import { X, Zap, ShieldCheck, Check } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useEffect } from "react";

const SPECS = [
  "Design consultation with our in-house apparel designers.",
  "Premium fabric specs: 220GSM Swiss Pique / Interlock, 100% Polyester.",
  "Moisture-wicking, anti-bacterial and quick-dry technology.",
  "Choice of a full set or an individual jersey / apparel piece.",
  "Custom cut & sew construction (buttons, V-neck, custom collars).",
  "Unlimited design elements, logos and custom colorways.",
  "Player names and numbers included in the print.",
  "3 to 4 week turnaround time with no hidden fees or charges.",
];

type Product = {
  name: string;
  price: string;
  category: string;
  desc: string;
  image: string;
};


export function QuickViewModal({ product, isOpen, onClose }: {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onInquire?: (name: string) => void;
}) {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "unset";
    return () => { document.body.style.overflow = "unset"; };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && product && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-background/80 backdrop-blur-md"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="glass relative grid w-full max-w-5xl max-h-[90vh] overflow-y-auto overflow-x-hidden rounded-2xl sm:rounded-[2rem] lg:grid-cols-2"
          >
            <button
              onClick={onClose}
              aria-label="Close"
              className="glass absolute right-4 top-4 z-20 rounded-full p-2.5 transition-colors hover:text-primary sm:right-6 sm:top-6"
            >
              <X size={18} />
            </button>

            <div className="relative h-44 shrink-0 bg-white/5 sm:h-56 lg:h-full lg:min-h-[20rem]">
              <div
                className="h-full w-full bg-contain bg-center bg-no-repeat p-4"
                style={{ backgroundImage: `url(${product.image})` }}
              />
              <div className="absolute left-4 top-4 sm:left-6 sm:top-6">
                <span className="rounded-full bg-primary px-3 py-1 text-[9px] font-black uppercase tracking-widest text-primary-foreground sm:text-[10px]">
                  {product.category}
                </span>
              </div>
            </div>

            <div className="flex min-w-0 flex-col justify-center p-6 sm:p-10 lg:p-14">
              <h2 className="mb-4 break-words text-2xl font-black uppercase italic leading-tight tracking-tighter sm:text-4xl lg:text-5xl">
                {product.name}
              </h2>

              <div className="mb-6 flex flex-wrap items-center gap-3">
                {product.price ? (
                  <span className="text-xl font-black italic tracking-tighter sm:text-2xl">{product.price}</span>
                ) : (
                  <span className="rounded-full border border-primary/40 bg-primary/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-primary">
                    Inquire For Pricing
                  </span>
                )}
                <div className="flex items-center gap-1.5">
                  <ShieldCheck size={16} className="shrink-0 text-neon-lime" />
                  <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-muted-foreground sm:text-[10px]">
                    Premium Quality Guaranteed
                  </span>
                </div>
              </div>

              <p className="mb-6 break-words text-sm leading-relaxed text-muted-foreground sm:text-base">
                {product.desc}
              </p>

              <div className="mb-8">
                <h3 className="mb-3 text-[10px] font-black uppercase tracking-[0.25em] text-primary">
                  Benefits &amp; Specifications
                </h3>
                <ul className="space-y-2">
                  {SPECS.map((spec) => (
                    <li key={spec} className="flex gap-2 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                      <Check size={14} className="mt-0.5 shrink-0 text-primary" />
                      <span className="min-w-0 break-words">{spec}</span>
                    </li>
                  ))}
                </ul>
              </div>



              <div className="space-y-4">
                <Link
                  to="/quote"
                  onClick={onClose}
                  className="flex w-full items-center justify-center gap-3 rounded-2xl bg-primary py-4 text-center text-xs font-black uppercase tracking-widest text-primary-foreground transition-all hover:bg-neon-cyan sm:py-5 sm:text-sm"
                >
                  Request Bulk Quote <Zap size={16} fill="currentColor" />
                </Link>
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div className="glass rounded-xl p-3 text-center sm:p-4">
                    <p className="mb-1 text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Material</p>
                    <p className="text-[11px] font-black sm:text-xs">Performance Poly</p>
                  </div>
                  <div className="glass rounded-xl p-3 text-center sm:p-4">
                    <p className="mb-1 text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Tech</p>
                    <p className="text-[11px] font-black sm:text-xs">Full Sublimation</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
