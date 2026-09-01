import { FaInstagram } from "react-icons/fa";
import { assetUrl } from "@/lib/media";

import factoryViewImg from "@/assets/factory-view.jpg.asset.json";
import stitchingFloorImg from "@/assets/stitching-floor.jpg.asset.json";
import stitchingImg from "@/assets/wf-stitching.jpg.asset.json";
import qcImg from "@/assets/wf-qc.jpg.asset.json";
import designImg from "@/assets/wf-design.jpg.asset.json";
import materialImg from "@/assets/wf-material.jpg.asset.json";

const INSTAGRAM_PROFILE = "https://www.instagram.com/ambition_sports313";
const INSTAGRAM_FEED =
  "https://www.instagram.com/ambition_sports313?igsi=MWNseTBvaHcxcGJq&utm_source=qr";

const FACTORY_CARDS = [
  {
    src: factoryViewImg.url,
    alt: "Ambition Sports manufacturing facility floor overview in Sialkot",
  },
  {
    src: stitchingFloorImg.url,
    alt: "Precision stitching unit for custom teamwear and activewear",
  },
  {
    src: stitchingImg.url,
    alt: "Industrial flatlock stitching machines assembling sportswear",
  },
  {
    src: qcImg.url,
    alt: "Quality control inspection of finished custom kits",
  },
  {
    src: designImg.url,
    alt: "Digital design and sublimation printing setup",
  },
  {
    src: materialImg.url,
    alt: "Performance fabric rolls and material selection for B2B orders",
  },
];

export function InstagramSection() {
  return (
    <section className="bg-card px-4 py-16 md:py-20 lg:px-8">
      <div className="mx-auto grid max-w-7xl items-center gap-10 rounded-3xl border border-border bg-card p-8 md:grid-cols-2 md:p-12">
        <div className="min-w-0">
          <h3 className="mb-4 text-sm font-black uppercase tracking-[0.24em] text-primary">
            Follow The Work
          </h3>
          <h2 className="section-title mb-5 font-black uppercase italic leading-tight tracking-tighter [hyphens:none] [overflow-wrap:break-word]">
            We&apos;re On <span className="text-primary">Instagram</span>
          </h2>
          <p className="mb-8 text-sm leading-relaxed text-muted-foreground md:text-base">
            Fresh kits, factory floor clips and client deliveries — see what
            leaves our Sialkot unit every week.
          </p>
          <a
            href={INSTAGRAM_FEED}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-7 py-4 text-xs font-black uppercase tracking-widest text-primary-foreground transition-transform hover:scale-[1.02]"
          >
            <FaInstagram size={16} /> View Our Feed
          </a>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {FACTORY_CARDS.map((img, i) => (
            <a
              key={i}
              href={INSTAGRAM_PROFILE}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative flex aspect-square items-center justify-center overflow-hidden rounded-2xl border border-border bg-muted"
              aria-label="Open our Instagram profile"
            >
              <img
                src={assetUrl(img.src)}
                alt={img.alt}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                loading="lazy"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <FaInstagram
                  className="text-white drop-shadow-lg transition-transform duration-300 group-hover:scale-110"
                  size={28}
                />
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
