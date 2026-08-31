import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Plus, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { MediaField } from "@/components/admin/MediaField";
import { getSiteBlocks, saveSiteBlocks } from "@/lib/site-blocks.functions";
import { PageBannersSection } from "@/components/admin/PageBannersSection";

type Step = { num: string; title: string; desc: string; image: string };
type Social = { facebook: string; instagram: string; twitter: string; linkedin: string; whatsapp: string };
type PageBanner = { eyebrow: string; title1: string; title2: string; subtitle: string; image: string };
type Catalog = { title: string; subtitle: string; buttonLabel: string; fileUrl: string };
type CategoryCard = { title: string; desc: string; image: string; url: string };
const EMPTY_CATALOG: Catalog = { title: "", subtitle: "", buttonLabel: "", fileUrl: "" };
type Facilities = {
  eyebrow: string; title1: string; title2: string; description: string;
  image1: string; image2: string;
  stat1Value: string; stat1Label: string; stat2Value: string; stat2Label: string;
  buttonLabel: string; buttonUrl: string;
};
const EMPTY_FACILITIES: Facilities = {
  eyebrow: "", title1: "", title2: "", description: "",
  image1: "", image2: "",
  stat1Value: "", stat1Label: "", stat2Value: "", stat2Label: "",
  buttonLabel: "", buttonUrl: "",
};

const SOCIAL_KEYS: (keyof Social)[] = ["facebook", "instagram", "twitter", "linkedin", "whatsapp"];

export function SiteBlocksTab() {
  const load = useServerFn(getSiteBlocks);
  const save = useServerFn(saveSiteBlocks);
  const { data, refetch } = useQuery({ queryKey: ["site-blocks"], queryFn: () => load() });

  const [workflow, setWorkflow] = useState<Step[]>([]);
  const [social, setSocial] = useState<Social>({ facebook: "", instagram: "", twitter: "", linkedin: "", whatsapp: "" });
  const [pageBanners, setPageBanners] = useState<Record<string, PageBanner>>({});
  const [catalog, setCatalog] = useState<Catalog>({ title: "", subtitle: "", buttonLabel: "", fileUrl: "" });
  const [facilities, setFacilities] = useState<Facilities>(EMPTY_FACILITIES);
  const [categories, setCategories] = useState<CategoryCard[]>([]);

  useEffect(() => {
    if (!data) return;
    setWorkflow(data.workflow as Step[]);
    setSocial(data.social as Social);
    setPageBanners((data.pageBanners ?? {}) as Record<string, PageBanner>);
    setCatalog({ ...EMPTY_CATALOG, ...((data as any).catalog ?? {}) } as Catalog);
    setFacilities({ ...EMPTY_FACILITIES, ...((data as any).facilities ?? {}) } as Facilities);
    setCategories((((data as any).categories ?? []) as CategoryCard[]));
  }, [data]);

  const mutation = useMutation({
    mutationFn: () => save({ data: { workflow, social, pageBanners, catalog, facilities, categories } }),
    onSuccess: () => { toast.success("Site blocks saved"); void refetch(); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Save failed"),
  });

  const patch = (index: number, next: Partial<Step>) =>
    setWorkflow((rows) => rows.map((row, i) => (i === index ? { ...row, ...next } : row)));

  return (
    <div className="space-y-6">
      <div className="glass flex flex-col gap-3 rounded-3xl p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-extrabold uppercase">Site blocks</h2>
          <p className="text-xs text-muted-foreground">Homepage workflow steps and social links. Empty links stay hidden on the site.</p>
        </div>
        <button
          type="button"
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending}
          className="flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-xs font-black uppercase text-primary-foreground"
        >
          {mutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save changes
        </button>
      </div>

      <div className="glass space-y-5 rounded-3xl p-5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black uppercase">Manufacturing workflow</h3>
          <button
            type="button"
            onClick={() => setWorkflow((rows) => [...rows, { num: String(rows.length + 1).padStart(2, "0"), title: "New step", desc: "", image: "" }])}
            className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-[10px] font-bold uppercase tracking-widest hover:border-primary"
          >
            <Plus size={12} /> Add step
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {workflow.map((step, index) => (
            <div key={index} className="space-y-3 rounded-2xl border border-border p-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Step {step.num || index + 1}</span>
                <button type="button" aria-label="Remove step" onClick={() => setWorkflow((rows) => rows.filter((_, i) => i !== index))} className="text-muted-foreground hover:text-destructive">
                  <Trash2 size={14} />
                </button>
              </div>
              <div className="grid gap-3 sm:grid-cols-[80px_minmax(0,1fr)]">
                <Field label="Number" value={step.num} onChange={(num) => patch(index, { num })} />
                <Field label="Title" value={step.title} onChange={(title) => patch(index, { title })} />
              </div>
              <Field label="Description" value={step.desc} onChange={(desc) => patch(index, { desc })} />
              <MediaField label="Image" value={step.image} folder="products" accept="image/*" onChange={(image) => patch(index, { image })} />
            </div>
          ))}
        </div>
      </div>

      <div className="glass space-y-4 rounded-3xl p-5">
        <div>
          <h3 className="text-sm font-black uppercase">Stitching unit / facilities section</h3>
          <p className="text-xs text-muted-foreground">Homepage "Advanced Facilities" block: images, stats, text and button.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <Field label="Eyebrow" value={facilities.eyebrow} onChange={(eyebrow) => setFacilities({ ...facilities, eyebrow })} />
          <Field label="Title line 1" value={facilities.title1} onChange={(title1) => setFacilities({ ...facilities, title1 })} />
          <Field label="Title line 2 (accent)" value={facilities.title2} onChange={(title2) => setFacilities({ ...facilities, title2 })} />
        </div>
        <Field label="Description" value={facilities.description} onChange={(description) => setFacilities({ ...facilities, description })} />
        <div className="grid gap-3 sm:grid-cols-2">
          <MediaField label="Image 1" value={facilities.image1} folder="products" accept="image/*" onChange={(image1) => setFacilities({ ...facilities, image1 })} />
          <MediaField label="Image 2" value={facilities.image2} folder="products" accept="image/*" onChange={(image2) => setFacilities({ ...facilities, image2 })} />
        </div>
        <div className="grid gap-3 sm:grid-cols-4">
          <Field label="Stat 1 value" value={facilities.stat1Value} onChange={(stat1Value) => setFacilities({ ...facilities, stat1Value })} />
          <Field label="Stat 1 label" value={facilities.stat1Label} onChange={(stat1Label) => setFacilities({ ...facilities, stat1Label })} />
          <Field label="Stat 2 value" value={facilities.stat2Value} onChange={(stat2Value) => setFacilities({ ...facilities, stat2Value })} />
          <Field label="Stat 2 label" value={facilities.stat2Label} onChange={(stat2Label) => setFacilities({ ...facilities, stat2Label })} />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Button label" value={facilities.buttonLabel} onChange={(buttonLabel) => setFacilities({ ...facilities, buttonLabel })} />
          <Field label="Button link" value={facilities.buttonUrl} onChange={(buttonUrl) => setFacilities({ ...facilities, buttonUrl })} />
        </div>
      </div>

      <div className="glass space-y-5 rounded-3xl p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-black uppercase">Product categories</h3>
            <p className="text-xs text-muted-foreground">Cards in the homepage "Product Categories" grid. Add an image for each card.</p>
          </div>
          <button
            type="button"
            onClick={() => setCategories((rows) => [...rows, { title: "New category", desc: "", image: "", url: "/sportswear" }])}
            className="flex shrink-0 items-center gap-2 rounded-lg border border-border px-3 py-2 text-[10px] font-bold uppercase tracking-widest hover:border-primary"
          >
            <Plus size={12} /> Add category
          </button>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {categories.map((cat, index) => {
            const patchCat = (next: Partial<CategoryCard>) =>
              setCategories((rows) => rows.map((row, i) => (i === index ? { ...row, ...next } : row)));
            return (
              <div key={index} className="space-y-3 rounded-2xl border border-border p-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Card {index + 1}</span>
                  <button
                    type="button"
                    aria-label="Remove category"
                    onClick={() => setCategories((rows) => rows.filter((_, i) => i !== index))}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <Field label="Title" value={cat.title} onChange={(title) => patchCat({ title })} />
                <Field label="Description" value={cat.desc} onChange={(desc) => patchCat({ desc })} />
                <Field label="Link (e.g. /sportswear)" value={cat.url} onChange={(url) => patchCat({ url })} />
                <MediaField label="Image" value={cat.image} folder="products" accept="image/*" onChange={(image) => patchCat({ image })} />
              </div>
            );
          })}
        </div>
      </div>

      <PageBannersSection />

      <div className="glass space-y-4 rounded-3xl p-5">
        <div>
          <h3 className="text-sm font-black uppercase">Catalog download</h3>
          <p className="text-xs text-muted-foreground">Upload any PDF or image catalog. Empty file hides the download button on the site.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Title" value={catalog.title} onChange={(title) => setCatalog({ ...catalog, title })} />
          <Field label="Button label" value={catalog.buttonLabel} onChange={(buttonLabel) => setCatalog({ ...catalog, buttonLabel })} />
        </div>
        <Field label="Subtitle" value={catalog.subtitle} onChange={(subtitle) => setCatalog({ ...catalog, subtitle })} />
        <MediaField
          label="Catalog file (PDF)"
          value={catalog.fileUrl}
          folder="products"
          accept="application/pdf,image/*"
          onChange={(fileUrl) => setCatalog({ ...catalog, fileUrl })}
        />
      </div>


      <div className="glass space-y-4 rounded-3xl p-5">
        <h3 className="text-sm font-black uppercase">Social links</h3>
        <p className="text-xs text-muted-foreground">Add a full URL to switch that icon on. Leave blank to hide it everywhere.</p>
        <div className="grid gap-3 sm:grid-cols-2">
          {SOCIAL_KEYS.map((key) => (
            <Field key={key} label={key} value={social[key]} onChange={(value) => setSocial({ ...social, [key]: value })} />
          ))}
        </div>
        {!social.whatsapp.trim() || !/^https?:\/\//i.test(social.whatsapp.trim()) ? (
          <p className="rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-[11px] font-semibold text-destructive">
            WhatsApp floating icon is hidden because the URL above is empty or invalid. Enter a full URL like https://wa.me/1234567890 to show it on the site.
          </p>
        ) : (
          <p className="text-[11px] font-semibold text-emerald-500">
            WhatsApp floating icon will be visible on all pages.
          </p>
        )}
      </div>
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
