import { supabase } from "@/integrations/supabase/client";

export type MediaFolder = "banners" | "products" | "studio";

const MEDIA_ORIGIN = "https://project--67fc21c1-8b75-46a1-81ab-d05f5a524583-dev.lovable.app";

/** Stable public URL for a file stored in one of the private media buckets. */
export function mediaUrl(bucket: string, path: string) {
  return `${MEDIA_ORIGIN}/api/public/media/${bucket}/${path}`;
}

function safeName(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9.]+/g, "-").replace(/^-|-$/g, "");
}

async function optimizeImageForUpload(file: File) {
  if (!file.type.startsWith("image/") || file.type === "image/svg+xml" || file.type === "image/gif") return file;

  const bitmap = await createImageBitmap(file);
  const maxDimension = 2200;
  const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) {
    bitmap.close();
    return file;
  }
  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", 0.82));
  if (!blob || blob.size >= file.size) return file;
  const baseName = file.name.replace(/\.[^.]+$/, "") || "image";
  return new File([blob], `${baseName}.webp`, { type: "image/webp", lastModified: file.lastModified });
}

/** Uploads an image or video from the admin panel and returns its public URL. */
export async function uploadMedia(file: File, folder: MediaFolder, bucket = "site-media") {
  const optimizedFile = await optimizeImageForUpload(file);
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safeName(optimizedFile.name)}`;
  const options: { cacheControl: string; upsert: boolean; contentType?: string } = {
    cacheControl: "31536000",
    upsert: false,
  };
  if (optimizedFile.type) options.contentType = optimizedFile.type;
  const { error } = await supabase.storage.from(bucket).upload(path, optimizedFile, options);
  if (error) throw new Error(error.message);
  return mediaUrl(bucket, path);
}

export function isVideoUrl(url: string) {
  return /\.(mp4|webm|mov|m4v)(\?|$)/i.test(url);
}

export async function copyToClipboard(value: string) {
  const absolute = value.startsWith("http") ? value : `${window.location.origin}${value}`;
  await navigator.clipboard.writeText(absolute);
  return absolute;
}

export function downloadUrl(url: string, filename?: string) {
  const a = document.createElement("a");
  a.href = url;
  a.download = filename || url.split("/").pop() || "download";
  a.target = "_blank";
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
}

/** Makes bundled asset links absolute so they also load on Vercel/custom domains. */
export function assetUrl(url: string) {
  return url.startsWith("/") ? `${MEDIA_ORIGIN}${url}` : url;
}

/**
 * Rewrites media-proxy links to the current origin. Older records point at a
 * fixed host, which makes every image an extra cross-origin round trip (and
 * fails when that host is slow). Same-origin keeps images fast everywhere.
 */
export function resolveMediaUrl(url: string | null | undefined) {
  if (!url) return "";
  const marker = "/api/public/media/";
  const i = url.indexOf(marker);
  return i > -1 ? url.slice(i) : url;
}
