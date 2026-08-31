import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Download } from "lucide-react";
import { getSiteBlocks } from "@/lib/site-blocks.functions";

/** Catalog download banner. Content and file are managed in the control panel. */
export function CatalogCTA() {
  const load = useServerFn(getSiteBlocks);
  const { data } = useQuery({ queryKey: ["site-blocks"], queryFn: () => load() });
  const catalog = (data as any)?.catalog as
    | { title: string; subtitle: string; buttonLabel: string; fileUrl: string }
    | undefined;

  if (!catalog?.fileUrl) return null;

  return (
    <section className="relative overflow-hidden bg-primary px-4 py-24">
      <div className="pointer-events-none absolute inset-0 bg-background/5 opacity-10">
        <div className="h-full w-full bg-[url('https://www.transparenttextures.com/patterns/graphy-dark.png')]" />
      </div>
      <div className="relative z-10 mx-auto flex max-w-7xl flex-col items-center justify-between gap-12 lg:flex-row">
        <div className="text-center lg:text-left">
          <h2 className="mb-4 break-words section-title font-black uppercase italic tracking-tighter text-primary-foreground">
            {catalog.title || "Download Our Latest Catalog"}
          </h2>
          <p className="text-[10px] font-bold uppercase tracking-widest text-primary-foreground/70 sm:text-xs">
            {catalog.subtitle}
          </p>
        </div>
        <a
          href={catalog.fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          download
          className="flex items-center gap-2 rounded-2xl bg-primary-foreground px-8 py-5 text-xs font-black uppercase tracking-widest text-primary shadow-xl transition-all hover:bg-white sm:px-12 sm:py-6 sm:text-sm"
        >
          <Download size={16} /> {catalog.buttonLabel || "Get PDF Catalog"}
        </a>
      </div>
    </section>
  );
}
