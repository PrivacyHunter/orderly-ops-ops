import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { ArrowDown, ArrowUp, Copy, Download, Loader2, Plus, Save, Trash2, X } from "lucide-react";
import { deleteBanner, listBanners, reorderBanners, upsertBanner } from "@/lib/banners.functions";
import { copyToClipboard, downloadUrl } from "@/lib/media";
import { MediaField } from "./MediaField";
import { SmartImage } from "./SmartImage";
import { PageBannersSection } from "./PageBannersSection";

type BannerForm = {
  id?: string;
  title1: string;
  title2: string;
  subtitle: string;
  image_url: string;
  accent: string;
  cta_label: string;
  cta_url: string;
  secondary_label: string;
  secondary_url: string;
  sort_order: number;
  is_active: boolean;
  status: "draft" | "published" | "scheduled";
  scheduled_publish_at: string | null;
};

const EMPTY: BannerForm = {
  title1: "",
  title2: "",
  subtitle: "",
  image_url: "",
  accent: "text-primary",
  cta_label: "Shop Now",
  cta_url: "/sportswear",
  secondary_label: "Custom Order",
  secondary_url: "/contact",
  sort_order: 10,
  is_active: true,
  status: "published",
  scheduled_publish_at: null,
};

export function BannersTab() {
  const queryClient = useQueryClient();
  const list = useServerFn(listBanners);
  const save = useServerFn(upsertBanner);
  const remove = useServerFn(deleteBanner);
  const reorder = useServerFn(reorderBanners);

  const [form, setForm] = useState<BannerForm | null>(null);

  const { data: banners, isPending } = useQuery({
    queryKey: ["admin-banners"],
    queryFn: () => list(),
  });

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ["admin-banners"] });
    void queryClient.invalidateQueries({ queryKey: ["public-banners"] });
  };

  const saveMutation = useMutation({
    mutationFn: (payload: BannerForm) => save({ data: payload }),
    onSuccess: () => { toast.success("Banner saved"); setForm(null); invalidate(); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Save failed"),
  });

  const removeMutation = useMutation({
    mutationFn: (id: string) => remove({ data: { id } }),
    onSuccess: () => { toast.success("Banner deleted"); invalidate(); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Delete failed"),
  });

  const reorderMutation = useMutation({
    mutationFn: (ids: string[]) => reorder({ data: { ids } }),
    onSuccess: () => invalidate(),
    onError: (e) => toast.error(e instanceof Error ? e.message : "Reorder failed"),
  });

  const rows = banners ?? [];

  function move(index: number, direction: -1 | 1) {
    const next = [...rows];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target]!, next[index]!];
    reorderMutation.mutate(next.map((b) => b.id));
  }

  return (
    <div className="space-y-6">
      <div className="glass flex flex-wrap items-end justify-between gap-4 rounded-3xl p-6">
        <div>
          <h2 className="text-lg font-extrabold uppercase">Banners</h2>
          <p className="text-xs text-muted-foreground">
            Upload hero slides with images or videos, reorder them and publish instantly.
          </p>
        </div>
        <button
          onClick={() => setForm({ ...EMPTY, sort_order: (rows.length + 1) * 10 })}
          className="flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-[10px] font-extrabold uppercase tracking-widest text-primary-foreground"
        >
          <Plus size={13} /> Add banner
        </button>
      </div>

      {isPending && <Loader2 className="mx-auto animate-spin" />}

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {rows.map((banner, index) => (
          <div key={banner.id} className="glass overflow-hidden rounded-3xl border border-border">
            <div className="relative h-40 bg-black/30">
              <SmartImage src={banner.image_url} alt={banner.title1} className="h-full w-full object-cover" iconSize={22} />
              <span className={`absolute right-3 top-3 rounded-full px-2 py-1 text-[9px] font-black uppercase ${banner.status === "published" && banner.is_active ? "bg-primary text-primary-foreground" : "bg-black/70 text-white"}`}>
                {banner.is_active ? banner.status : "hidden"}
              </span>
            </div>
            <div className="space-y-3 p-5">
              <div>
                <p className="text-sm font-black uppercase">{banner.title1} {banner.title2}</p>
                <p className="line-clamp-2 text-xs text-muted-foreground">{banner.subtitle}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Action label="Edit" onClick={() => setForm({
                  id: banner.id,
                  title1: banner.title1,
                  title2: banner.title2 ?? "",
                  subtitle: banner.subtitle ?? "",
                  image_url: banner.image_url,
                  accent: banner.accent ?? "text-primary",
                  cta_label: banner.cta_label ?? "Shop Now",
                  cta_url: banner.cta_url ?? "/sportswear",
                  secondary_label: banner.secondary_label ?? "Custom Order",
                  secondary_url: banner.secondary_url ?? "/contact",
                  sort_order: banner.sort_order ?? 10,
                  is_active: banner.is_active,
                  status: (banner.status as BannerForm["status"]) ?? "published",
                  scheduled_publish_at: banner.scheduled_publish_at ?? null,
                })} />
                <Action label="Duplicate" onClick={() => saveMutation.mutate({
                  title1: banner.title1,
                  title2: banner.title2 ?? "",
                  subtitle: banner.subtitle ?? "",
                  image_url: banner.image_url,
                  accent: banner.accent ?? "text-primary",
                  cta_label: banner.cta_label ?? "Shop Now",
                  cta_url: banner.cta_url ?? "/sportswear",
                  secondary_label: banner.secondary_label ?? "Custom Order",
                  secondary_url: banner.secondary_url ?? "/contact",
                  sort_order: (rows.length + 1) * 10,
                  is_active: false,
                  status: "draft",
                  scheduled_publish_at: null,
                })} />
                <Action icon={Copy} label="Copy link" onClick={async () => { await copyToClipboard(banner.image_url); toast.success("Link copied"); }} />
                <Action icon={Download} label="Download" onClick={() => downloadUrl(banner.image_url)} />
                <Action icon={ArrowUp} label="Up" onClick={() => move(index, -1)} />
                <Action icon={ArrowDown} label="Down" onClick={() => move(index, 1)} />
                <Action
                  icon={Trash2}
                  label="Delete"
                  danger
                  onClick={() => { if (confirm(`Delete banner "${banner.title1}"?`)) removeMutation.mutate(banner.id); }}
                />
              </div>
            </div>
          </div>
        ))}
        {!isPending && rows.length === 0 && (
          <p className="text-xs text-muted-foreground">No banners yet — add your first slide.</p>
        )}
      </div>

      {form && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/80 p-4 backdrop-blur-md" onClick={() => setForm(null)}>
          <form
            onClick={(e) => e.stopPropagation()}
            onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(form); }}
            className="glass max-h-[88vh] w-full max-w-xl space-y-4 overflow-y-auto rounded-3xl p-6"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black uppercase">{form.id ? "Edit banner" : "New banner"}</h3>
              <button type="button" onClick={() => setForm(null)}><X size={16} /></button>
            </div>

            <MediaField
              label="Banner image or video"
              value={form.image_url}
              folder="banners"
              onChange={(image_url) => setForm({ ...form, image_url })}
            />

            <div className="grid gap-3 sm:grid-cols-2">
              <Text label="Title line 1" value={form.title1} required onChange={(v) => setForm({ ...form, title1: v })} />
              <Text label="Title line 2" value={form.title2} onChange={(v) => setForm({ ...form, title2: v })} />
            </div>
            <Text label="Subtitle" value={form.subtitle} onChange={(v) => setForm({ ...form, subtitle: v })} />
            <div className="grid gap-3 sm:grid-cols-2">
              <Text label="Primary button" value={form.cta_label} onChange={(v) => setForm({ ...form, cta_label: v })} />
              <Text label="Primary link" value={form.cta_url} onChange={(v) => setForm({ ...form, cta_url: v })} />
              <Text label="Secondary button" value={form.secondary_label} onChange={(v) => setForm({ ...form, secondary_label: v })} />
              <Text label="Secondary link" value={form.secondary_url} onChange={(v) => setForm({ ...form, secondary_url: v })} />
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <label className="block">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Order</span>
                <input
                  type="number"
                  value={form.sort_order}
                  onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })}
                  className="mt-1 w-full rounded-lg border border-border bg-transparent px-3 py-2 text-sm"
                />
              </label>
              <label className="block">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Status</span>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value as BannerForm["status"] })}
                  className="mt-1 w-full rounded-lg border border-border bg-transparent px-3 py-2 text-sm"
                >
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                  <option value="scheduled">Scheduled</option>
                </select>
              </label>
              <label className="block">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Publish at</span>
                <input
                  type="datetime-local"
                  value={form.scheduled_publish_at ? form.scheduled_publish_at.slice(0, 16) : ""}
                  onChange={(e) => setForm({ ...form, scheduled_publish_at: e.target.value ? new Date(e.target.value).toISOString() : null })}
                  className="mt-1 w-full rounded-lg border border-border bg-transparent px-3 py-2 text-sm"
                />
              </label>
            </div>

            <button
              type="button"
              onClick={() => setForm({ ...form, is_active: !form.is_active })}
              className={`flex items-center gap-2 rounded-full border px-3 py-2 text-[10px] font-bold uppercase tracking-widest ${form.is_active ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground"}`}
            >
              <span className={`h-2 w-2 rounded-full ${form.is_active ? "bg-primary" : "bg-muted-foreground"}`} /> Visible on site
            </button>

            <button
              type="submit"
              disabled={saveMutation.isPending}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-xs font-extrabold uppercase tracking-widest text-primary-foreground disabled:opacity-50"
            >
              {saveMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save banner
            </button>
          </form>
        </div>
      )}

      <PageBannersSection />
    </div>
  );
}

function Action({ icon: Icon, label, onClick, danger }: { icon?: any; label: string; onClick: () => void; danger?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[9px] font-bold uppercase tracking-widest ${
        danger ? "border-border hover:border-destructive hover:text-destructive" : "border-border hover:border-primary hover:text-primary"
      }`}
    >
      {Icon && <Icon size={11} />} {label}
    </button>
  );
}

function Text({ label, value, onChange, required }: { label: string; value: string; onChange: (v: string) => void; required?: boolean }) {
  return (
    <label className="block">
      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{label}</span>
      <input
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-lg border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-primary"
      />
    </label>
  );
}
