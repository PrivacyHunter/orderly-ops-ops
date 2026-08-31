import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Plus, Save, Trash2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { MediaField } from "@/components/admin/MediaField";
import { SmartImage } from "@/components/admin/SmartImage";
import { listCertificates, upsertCertificate, deleteCertificate } from "@/lib/certificates.functions";

type Row = {
  id?: string;
  title: string;
  issuer: string;
  issue_date: string;
  details: string;
  image_url: string;
  sort_order: number;
  is_active: boolean;
};

const EMPTY: Row = { title: "", issuer: "", issue_date: "", details: "", image_url: "", sort_order: 10, is_active: true };

export function CertificatesTab() {
  const load = useServerFn(listCertificates);
  const save = useServerFn(upsertCertificate);
  const remove = useServerFn(deleteCertificate);
  const queryClient = useQueryClient();

  const { data, isPending, error, refetch } = useQuery({ queryKey: ["certificates"], queryFn: () => load(), retry: false });
  const [editing, setEditing] = useState<Row | null>(null);

  const saveMutation = useMutation({
    mutationFn: (row: Row) => save({ data: row as any }),
    onSuccess: () => {
      toast.success("Certificate saved");
      setEditing(null);
      void refetch();
      void queryClient.invalidateQueries({ queryKey: ["public-certificates"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Save failed"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => remove({ data: { id } }),
    onSuccess: () => {
      toast.success("Certificate deleted");
      void refetch();
      void queryClient.invalidateQueries({ queryKey: ["public-certificates"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Delete failed"),
  });

  return (
    <div className="space-y-6">
      <div className="glass flex flex-col gap-3 rounded-3xl p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-extrabold uppercase">Manage certificates</h2>
          <p className="text-xs text-muted-foreground">Quality and export badges shown on the homepage and about page.</p>
        </div>
        <button
          type="button"
          onClick={() => setEditing({ ...EMPTY, sort_order: ((data?.length ?? 0) + 1) * 10 })}
          className="flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-xs font-black uppercase text-primary-foreground"
        >
          <Plus size={14} /> Add certificate
        </button>
      </div>

      {editing && (
        <div className="glass space-y-4 rounded-3xl p-5">
          <h3 className="text-sm font-black uppercase">{editing.id ? "Edit certificate" : "New certificate"}</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Title" value={editing.title} onChange={(title) => setEditing({ ...editing, title })} />
            <Field label="Issuer / accreditation" value={editing.issuer} onChange={(issuer) => setEditing({ ...editing, issuer })} />
            <Field label="Issue date" value={editing.issue_date} onChange={(issue_date) => setEditing({ ...editing, issue_date })} />
            <Field
              label="Sort order"
              value={String(editing.sort_order)}
              onChange={(v) => setEditing({ ...editing, sort_order: Number(v) || 0 })}
            />
          </div>
          <Field label="Details" value={editing.details} onChange={(details) => setEditing({ ...editing, details })} />
          <MediaField
            label="Certificate image"
            value={editing.image_url}
            folder="products"
            accept="image/*"
            onChange={(image_url) => setEditing({ ...editing, image_url })}
          />
          <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
            <input
              type="checkbox"
              checked={editing.is_active}
              onChange={(e) => setEditing({ ...editing, is_active: e.target.checked })}
            />
            Visible on site
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={saveMutation.isPending || !editing.title.trim()}
              onClick={() => saveMutation.mutate(editing)}
              className="flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-xs font-black uppercase text-primary-foreground disabled:opacity-50"
            >
              {saveMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save
            </button>
            <button
              type="button"
              onClick={() => setEditing(null)}
              className="rounded-xl border border-border px-5 py-3 text-xs font-black uppercase"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {isPending && <div className="glass h-32 shimmer rounded-3xl" />}
      {error && (
        <div className="glass rounded-3xl p-5 text-sm text-destructive">
          Could not load certificates. <button className="underline" onClick={() => void refetch()}>Retry</button>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {(data ?? []).map((row) => (
          <div key={row.id} className="glass flex gap-4 rounded-3xl p-4">
            <SmartImage src={row.image_url} alt={row.title} className="h-20 w-20 shrink-0 rounded-xl object-cover" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h4 className="truncate text-sm font-black uppercase">{row.title}</h4>
                {row.is_active ? <Eye size={13} className="text-emerald-500" /> : <EyeOff size={13} className="text-muted-foreground" />}
              </div>
              <p className="truncate text-xs text-muted-foreground">{row.issuer} {row.issue_date && `• ${row.issue_date}`}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <SmallBtn label="Edit" onClick={() => setEditing({ ...(row as Row) })} />
                <SmallBtn
                  label={row.is_active ? "Hide" : "Show"}
                  onClick={() => saveMutation.mutate({ ...(row as Row), is_active: !row.is_active })}
                />
                <button
                  type="button"
                  onClick={() => { if (confirm(`Delete ${row.title}?`)) deleteMutation.mutate(row.id); }}
                  className="flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-[9px] font-bold uppercase tracking-widest hover:border-destructive hover:text-destructive"
                >
                  <Trash2 size={11} /> Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SmallBtn({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-lg border border-border px-2.5 py-1.5 text-[9px] font-bold uppercase tracking-widest hover:border-primary hover:text-primary"
    >
      {label}
    </button>
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
