import { useEffect, useState } from "react";
import { Loader2, Upload, Copy, Download, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { copyToClipboard, downloadUrl, uploadMedia, type MediaFolder } from "@/lib/media";
import { SmartImage } from "./SmartImage";

/** Upload-or-paste field for images and videos, with preview, copy and download. */
export function MediaField({
  label,
  value,
  folder,
  accept = "image/*,video/*",
  onChange,
}: {
  label: string;
  value: string;
  folder: MediaFolder;
  accept?: string;
  onChange: (url: string) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [localPreview, setLocalPreview] = useState<string | null>(null);

  useEffect(() => () => { if (localPreview) URL.revokeObjectURL(localPreview); }, [localPreview]);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    const objectUrl = URL.createObjectURL(file);
    setLocalPreview(objectUrl);
    setBusy(true);
    try {
      const url = await uploadMedia(file, folder);
      onChange(url);
      toast.success("Upload complete");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  const preview = localPreview || value;

  return (
    <div className="space-y-2">
      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{label}</span>
      <div className="flex gap-2">
        <input
          value={value}
          onChange={(e) => { setLocalPreview(null); onChange(e.target.value); }}
          placeholder="Paste a URL or upload a file"
          className="min-w-0 flex-1 rounded-lg border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-primary"
        />
        <label className="grid h-10 w-11 shrink-0 cursor-pointer place-items-center rounded-lg border border-border hover:border-primary">
          {busy ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
          <input
            type="file"
            accept={accept}
            className="hidden"
            onChange={(e) => void handleFile(e.target.files?.[0])}
          />
        </label>
      </div>

      {preview && (
        <div className="flex items-center gap-3 rounded-xl border border-border p-2">
          <div className="relative h-16 w-16 shrink-0">
            <SmartImage src={preview} alt={label} className="h-16 w-16 rounded-lg object-cover" />
            {busy && (
              <div className="absolute inset-0 grid place-items-center rounded-lg bg-black/50 text-foreground">
                <Loader2 size={14} className="animate-spin" />
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <MediaAction icon={Copy} label="Copy" onClick={async () => { await copyToClipboard(value); toast.success("Link copied"); }} />
            <MediaAction icon={Download} label="Download" onClick={() => downloadUrl(value)} />
            <MediaAction icon={Trash2} label="Remove" onClick={() => { setLocalPreview(null); onChange(""); }} />
          </div>
        </div>
      )}
    </div>
  );
}

export function MediaAction({ icon: Icon, label, onClick }: { icon: any; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-[9px] font-bold uppercase tracking-widest hover:border-primary hover:text-primary"
    >
      <Icon size={11} /> {label}
    </button>
  );
}
