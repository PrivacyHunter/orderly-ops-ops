import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { FaWhatsapp } from "react-icons/fa";
import { getSiteBlocks } from "@/lib/site-blocks.functions";

function isValidWhatsAppUrl(url: unknown): url is string {
  if (typeof url !== "string") return false;
  const trimmed = url.trim();
  if (!trimmed) return false;
  return /^https?:\/\//i.test(trimmed);
}

export function FloatingWhatsApp() {
  const loadBlocks = useServerFn(getSiteBlocks);
  const { data: blocks } = useQuery({
    queryKey: ["site-blocks"],
    queryFn: () => loadBlocks(),
  });

  const whatsappUrl = blocks?.social?.whatsapp;
  if (!isValidWhatsAppUrl(whatsappUrl)) return null;

  return (
    <a
      href={whatsappUrl.trim()}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-4 right-4 z-50 sm:bottom-6 sm:right-6"
      style={{
        bottom: "max(1rem, env(safe-area-inset-bottom))",
        right: "max(1rem, env(safe-area-inset-right))",
      }}
    >
      {/* Inline vector icon: renders on any host (Lovable, Vercel, custom domain) with no external image request. */}
      <div className="grid h-14 w-14 place-items-center rounded-full bg-[#1c1c1c] shadow-2xl ring-2 ring-[#ff0000] transition-transform duration-300 hover:scale-110 focus:outline-none sm:h-16 sm:w-16">
        <FaWhatsapp aria-hidden="true" className="h-8 w-8 text-white sm:h-9 sm:w-9" />
      </div>

    </a>
  );
}
