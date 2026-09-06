import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Plus, Save, Trash2 } from "lucide-react";
import { getCatalogTaxonomy, saveCatalogCategories } from "@/lib/catalog.functions";
import { slugify, type CatalogCategory } from "@/lib/catalog";
import { toast } from "sonner";

/** Admin manager for site categories and their sub-categories. */
export function CatalogTab() {
  const load = useServerFn(getCatalogTaxonomy);
  const persist = useServerFn(saveCatalogCategories);
  const { data, refetch, isPending } = useQuery({
    queryKey: ["catalog-taxonomy"],
    queryFn: () => load(),
  });
  const [rows, setRows] = useState<CatalogCategory[]>([]);

  useEffect(() => {
    if (data?.categories) setRows(data.categories);
  }, [data]);

  const save = useMutation({
    mutationFn: () => persist({ data: { categories: rows } }),
    onSuccess: async () => {
      toast.success("Catalog updated");
      await refetch();
    },
    onError: (error: any) => toast.error(error?.message ?? "Could not save catalog"),
  });

  const update = (index: number, patch: Partial<CatalogCategory>) =>
    setRows((prev) => prev.map((row, i) => (i === index ? { ...row, ...patch } : row)));

  const addCategory = () =>
    setRows((prev) => [
      ...prev,
      { slug: `new-category-${prev.length + 1}`, name: "New category", description: "", enabled: false, subcategories: [] },
    ]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-black uppercase italic">Categories</h2>
          <p className="text-xs text-muted-foreground">
            Add product categories, add sub-categories, and switch any of them on or off for the live site.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={addCategory}
            className="flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-[11px] font-black uppercase tracking-widest hover:border-primary hover:text-primary"
          >
            <Plus size={14} /> Add category
          </button>
          <button
            type="button"
            disabled={save.isPending || isPending}
            onClick={() => save.mutate()}
            className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-[11px] font-black uppercase tracking-widest text-primary-foreground disabled:opacity-50"
          >
            {save.isPending ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save changes
          </button>
        </div>
      </div>

      {isPending && <div className="h-32 shimmer rounded-2xl border border-border bg-card" />}

      <div className="grid gap-4">
        {rows.map((cat, index) => (
          <div key={`${cat.slug}-${index}`} className="rounded-2xl border border-border bg-card p-4 text-card-foreground">
            <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
              <Field label="Name" value={cat.name} onChange={(name) => update(index, { name })} />
              <Field
                label="URL slug"
                value={cat.slug}
                onChange={(slug) => update(index, { slug: slugify(slug) })}
              />
              <div className="flex items-end gap-2">
                <Switch
                  on={cat.enabled}
                  onClick={() => update(index, { enabled: !cat.enabled })}
                  label={cat.enabled ? "On site" : "Off site"}
                />
                <button
                  type="button"
                  title="Delete category"
                  onClick={() => setRows((prev) => prev.filter((_, i) => i !== index))}
                  className="grid h-9 w-9 place-items-center rounded-lg border border-border hover:border-destructive hover:text-destructive"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            <div className="mt-3">
              <Field
                label="Short description"
                value={cat.description}
                onChange={(description) => update(index, { description })}
              />
            </div>

            <div className="mt-4 space-y-2 border-t border-border pt-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Sub-categories</p>
              {cat.subcategories.map((sub, subIndex) => (
                <div key={`${sub.slug}-${subIndex}`} className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
                  <Field
                    label="Name"
                    value={sub.name}
                    onChange={(name) =>
                      update(index, {
                        subcategories: cat.subcategories.map((s, i) => (i === subIndex ? { ...s, name } : s)),
                      })
                    }
                  />
                  <Field
                    label="Slug"
                    value={sub.slug}
                    onChange={(slug) =>
                      update(index, {
                        subcategories: cat.subcategories.map((s, i) =>
                          i === subIndex ? { ...s, slug: slugify(slug) } : s,
                        ),
                      })
                    }
                  />
                  <div className="flex items-end gap-2">
                    <Switch
                      on={sub.enabled}
                      onClick={() =>
                        update(index, {
                          subcategories: cat.subcategories.map((s, i) =>
                            i === subIndex ? { ...s, enabled: !s.enabled } : s,
                          ),
                        })
                      }
                      label={sub.enabled ? "On" : "Off"}
                    />
                    <button
                      type="button"
                      title="Delete sub-category"
                      onClick={() =>
                        update(index, { subcategories: cat.subcategories.filter((_, i) => i !== subIndex) })
                      }
                      className="grid h-9 w-9 place-items-center rounded-lg border border-border hover:border-destructive hover:text-destructive"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={() =>
                  update(index, {
                    subcategories: [
                      ...cat.subcategories,
                      {
                        slug: `sub-${cat.subcategories.length + 1}`,
                        name: `New sub-category ${cat.subcategories.length + 1}`,
                        enabled: true,
                      },
                    ],
                  })
                }
                className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-[10px] font-bold uppercase tracking-widest hover:border-primary hover:text-primary"
              >
                <Plus size={12} /> Add sub-category
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block min-w-0">
      <span className="text-[10px] font-bold uppercase text-muted-foreground">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-lg border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-primary"
      />
    </label>
  );
}

function Switch({ on, onClick, label }: { on: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-9 items-center gap-2 rounded-full border px-3 text-[10px] font-bold uppercase tracking-widest ${
        on ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground"
      }`}
    >
      <span className={`h-2 w-2 rounded-full ${on ? "bg-primary" : "bg-muted-foreground"}`} /> {label}
    </button>
  );
}
