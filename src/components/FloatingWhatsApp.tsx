import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getSiteBlocks } from "@/lib/site-blocks.functions";
import whatsappIcon from "@/assets/whatsapp-icon.png.asset.json";

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
      <div className="grid h-12 w-12 place-items-center rounded-full bg-[#25D366] shadow-2xl ring-2 ring-white/20 transition-transform duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 sm:h-14 sm:w-14">
        <img
          src={whatsappIcon.url}
          alt="WhatsApp"
          className="h-7 w-7 object-contain sm:h-8 sm:w-8"
        />
      </div>
    </a>
  );
}
