import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { motion, AnimatePresence } from "framer-motion";
import { Award, X } from "lucide-react";
import { getPublicCertificates } from "@/lib/certificates.functions";
import { resolveMediaUrl } from "@/lib/media";

/** Public certifications grid with a lightbox preview, driven by the admin panel. */
export function Certifications({ tone = "surface" }: { tone?: "surface" | "plain" }) {
  const load = useServerFn(getPublicCertificates);
  const { data } = useQuery({ queryKey: ["public-certificates"], queryFn: () => load() });
  const [zoom, setZoom] = useState<{ title: string; image: string } | null>(null);

  const items = data ?? [];
  if (!items.length) return null;

  return (
    <section className={`px-4 py-20 md:py-28 lg:px-8 ${tone === "surface" ? "border-y border-border bg-surface" : ""}`}>
      <div className="mx-auto max-w-7xl">
        <h3 className="mb-4 text-sm font-black uppercase tracking-[0.24em] text-primary">Trust & Compliance</h3>
        <h2 className="mb-12 section-title font-black uppercase italic leading-tight tracking-tighter [hyphens:none] break-normal">
          <span>Our Certifications</span>{" "}
          <span className="text-primary">&amp; Compliance</span>
        </h2>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((c, i) => (
            <motion.button
              key={c.id}
              type="button"
              onClick={() => c.image_url && setZoom({ title: c.title, image: c.image_url })}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: Math.min(i, 5) * 0.06 }}
              className="group flex h-full flex-col rounded-3xl border border-border bg-background/60 p-5 text-left transition-all hover:border-primary/50 hover:shadow-xl"
            >
              <div className="mb-4 grid h-40 place-items-center overflow-hidden rounded-2xl bg-muted">
                {c.image_url ? (
                  <img src={resolveMediaUrl(c.image_url)} alt={c.title} loading="lazy" className="h-full w-full object-contain p-3" />
                ) : (
                  <Award size={34} className="text-primary" />
                )}
              </div>
              <h4 className="min-w-0 break-words text-base font-black uppercase italic tracking-tight group-hover:text-primary">
                {c.title}
              </h4>
              {(c.issuer || c.issue_date) && (
                <p className="mt-1 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                  {c.issuer}{c.issuer && c.issue_date ? " • " : ""}{c.issue_date}
                </p>
              )}
              {c.details && <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{c.details}</p>}
            </motion.button>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {zoom && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setZoom(null)}
            className="fixed inset-0 z-[100] grid place-items-center bg-black/85 p-4"
          >
            <button
              type="button"
              aria-label="Close"
              onClick={() => setZoom(null)}
              className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full border border-white/20 text-white"
            >
              <X size={18} />
            </button>
            <img src={resolveMediaUrl(zoom.image)} alt={zoom.title} className="max-h-[85vh] max-w-full rounded-2xl object-contain" />
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
