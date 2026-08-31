import { useQuery } from "@tanstack/react-query";
import { FaInstagram } from "react-icons/fa";
import { getSiteBlocks } from "@/lib/site-blocks.functions";

export function InstagramSection() {
  const { data } = useQuery({ queryKey: ["site-blocks"], queryFn: () => getSiteBlocks() });
  const handle = data?.social?.instagram || "";
  if (!handle) return null;

  return (
    <section className="bg-card px-4 py-16 dark:bg-zinc-950 md:py-20 lg:px-8">
      <div className="mx-auto grid max-w-7xl items-center gap-10 rounded-3xl border border-border bg-card p-8 md:grid-cols-2 md:p-12">
        <div className="min-w-0">
          <h3 className="mb-4 text-sm font-black uppercase tracking-[0.24em] text-primary">Follow The Work</h3>
          <h2 className="mb-5 section-title font-black uppercase italic leading-tight tracking-tighter [hyphens:none] [overflow-wrap:break-word]">
            We&apos;re On <span className="text-primary">Instagram</span>
          </h2>
          <p className="mb-8 text-sm leading-relaxed text-muted-foreground md:text-base">
            Fresh kits, factory floor clips and client deliveries — see what leaves our Sialkot unit every week.
          </p>
          <a
            href={handle}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-7 py-4 text-xs font-black uppercase tracking-widest text-primary-foreground transition-transform hover:scale-[1.02]"
          >
            <FaInstagram size={16} /> View Our Feed
          </a>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <a
              key={i}
              href={handle}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative flex aspect-square items-center justify-center overflow-hidden rounded-2xl border border-border bg-primary/5 transition-colors hover:bg-primary/15"
              aria-label="Open our Instagram profile"
            >
              <FaInstagram className="text-primary/50 transition-transform group-hover:scale-110" size={22} />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
