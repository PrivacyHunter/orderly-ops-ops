import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { MediaField } from "@/components/admin/MediaField";
import { getSiteBlocks, saveSiteBlocks } from "@/lib/site-blocks.functions";

export type PageBanner = { eyebrow: string; title1: string; title2: string; subtitle: string; image: string };

export const PAGE_BANNERS: { key: string; label: string }[] = [
  { key: "sportswear", label: "Sportswear" },
  { key: "activewear", label: "Activewear" },
  { key: "casual-wear", label: "Casual wear" },
  { key: "contact", label: "Contact us" },
  { key: "customization", label: "Customization" },
  { key: "about", label: "About us" },
  { key: "track", label: "Order tracker" },
  { key: "favorites", label: "Favorites" },
];

const EMPTY_BANNER: PageBanner = { eyebrow: "", title1: "", title2: "", subtitle: "", image: "" };

/** Editable hero banners for every category / info page, saved inside site blocks. */
export function PageBannersSection() {
  const load = useServerFn(getSiteBlocks);
  const save = useServerFn(saveSiteBlocks);
  const { data, refetch, isPending } = useQuery({ queryKey: ["site-blocks"], queryFn: () => load() });

  const [pageBanners, setPageBanners] = useState<Record<string, PageBanner>>({});

  useEffect(() => {
    if (data) setPageBanners((data.pageBanners ?? {}) as Record<string, PageBanner>);
  }, [data]);

  const mutation = useMutation({
    mutationFn: () => {
      if (!data) throw new Error("Still loading");
      return save({
        data: {
          workflow: data.workflow,
          social: data.social,
          catalog: data.catalog,
          facilities: data.facilities,
          categories: (data as any).categories,
          pageBanners,
        },
      });
    },
    onSuccess: () => { toast.success("Page banners saved"); void refetch(); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Save failed"),
  });

  const patchBanner = (key: string, next: Partial<PageBanner>) =>
    setPageBanners((rows) => ({ ...rows, [key]: { ...EMPTY_BANNER, ...(rows[key] ?? {}), ...next } }));

  return (
    <div className="glass space-y-5 rounded-3xl p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-sm font-black uppercase">Page banners</h3>
          <p className="text-xs text-muted-foreground">
            Sportswear, activewear, casual wear, contact, customization and about pages. Leave a field blank to keep the built-in default.
          </p>
        </div>
        <button
          type="button"
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending || isPending}
          className="flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-[10px] font-black uppercase tracking-widest text-primary-foreground disabled:opacity-50"
        >
          {mutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save page banners
        </button>
      </div>

      {isPending ? (
        <Loader2 className="mx-auto animate-spin" />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {PAGE_BANNERS.map(({ key, label }) => {
            const banner = pageBanners[key] ?? EMPTY_BANNER;
            return (
              <div key={key} className="space-y-3 rounded-2xl border border-border p-4">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">{label}</span>
                <Field label="Eyebrow" value={banner.eyebrow} onChange={(eyebrow) => patchBanner(key, { eyebrow })} />
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Title line 1" value={banner.title1} onChange={(title1) => patchBanner(key, { title1 })} />
                  <Field label="Title line 2" value={banner.title2} onChange={(title2) => patchBanner(key, { title2 })} />
                </div>
                <Field label="Subtitle" value={banner.subtitle} onChange={(subtitle) => patchBanner(key, { subtitle })} />
                <MediaField label="Background image or video" value={banner.image} folder="banners" onChange={(image) => patchBanner(key, { image })} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-lg border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-primary"
      />
    </label>
  );
}
