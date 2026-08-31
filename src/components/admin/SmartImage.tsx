import { useEffect, useState } from "react";
import { ImageOff } from "lucide-react";
import { isVideoUrl, resolveMediaUrl } from "@/lib/media";

/** Image/video preview that degrades to a clear placeholder when the file cannot load. */
export function SmartImage({
  src,
  alt,
  className = "",
  iconSize = 18,
}: {
  src: string;
  alt: string;
  className?: string;
  iconSize?: number;
}) {
  const [failed, setFailed] = useState(false);
  src = resolveMediaUrl(src);

  useEffect(() => setFailed(false), [src]);

  if (!src || failed) {
    return (
      <div
        className={`grid place-items-center bg-muted text-muted-foreground ${className}`}
        title={failed ? "Image failed to load" : "No image"}
      >
        <ImageOff size={iconSize} />
      </div>
    );
  }

  if (isVideoUrl(src)) {
    return <video src={src} className={className} muted playsInline onError={() => setFailed(true)} />;
  }

  return <img src={src} alt={alt} loading="lazy" decoding="async" className={className} onError={() => setFailed(true)} />;
}
