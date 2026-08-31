import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, RefreshCw, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  ORDER_STAGES,
  ORDER_STAGE_LABELS,
  ORDER_STAGE_PROGRESS,
  deleteCustomOrder,
  listCustomOrders,
  updateCustomOrder,
  type OrderStage,
} from "@/lib/orders.functions";

type OrderRow = {
  id: string;
  tracking_id: string;
  name: string;
  email: string;
  phone?: string | null;
  company?: string | null;
  product?: string | null;
  quantity?: number | null;
  moq?: string | null;
  colors?: string | null;
  delivery_time?: string | null;
  design_details?: string | null;
  admin_notes?: string | null;
  status: string;
  created_at: string;
  updated_at?: string | null;
};

function stageOf(value: unknown): OrderStage {
  return (ORDER_STAGES as readonly string[]).includes(value as string) ? (value as OrderStage) : "pending";
}

export function CustomOrdersTab() {
  const load = useServerFn(listCustomOrders);
  const update = useServerFn(updateCustomOrder);
  const remove = useServerFn(deleteCustomOrder);

  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState<"all" | OrderStage>("all");
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [busyId, setBusyId] = useState<string | null>(null);

  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: ["admin-custom-orders"],
    queryFn: () => load() as Promise<OrderRow[]>,
    retry: false,
  });

  const stageMutation = useMutation({
    mutationFn: (vars: { id: string; status?: OrderStage; adminNotes?: string }) =>
      update({ data: vars }),
    onSuccess: () => {
      toast.success("Order updated");
      void refetch();
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Update failed"),
    onSettled: () => setBusyId(null),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => remove({ data: { id } }),
    onSuccess: () => {
      toast.success("Order deleted");
      void refetch();
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Delete failed"),
  });

  const orders = useMemo(() => {
    const rows = (data ?? []) as OrderRow[];
    const q = search.trim().toLowerCase();
    return rows.filter((row) => {
      if (stageFilter !== "all" && stageOf(row.status) !== stageFilter) return false;
      if (!q) return true;
      return [row.tracking_id, row.name, row.email, row.company, row.product]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(q));
    });
  }, [data, search, stageFilter]);

  const counts = useMemo(() => {
    const rows = (data ?? []) as OrderRow[];
    const map: Record<string, number> = {};
    for (const row of rows) {
      const stage = stageOf(row.status);
      map[stage] = (map[stage] ?? 0) + 1;
    }
    return map;
  }, [data]);

  if (isPending) {
    return (
      <div className="glass flex items-center gap-3 rounded-3xl p-6 text-sm text-muted-foreground">
        <Loader2 size={16} className="animate-spin" /> Loading custom orders…
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass rounded-3xl p-6 text-sm text-destructive">
        {error instanceof Error ? error.message : "Failed to load custom orders"}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="glass flex flex-col gap-4 rounded-3xl p-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-lg font-extrabold uppercase">Custom orders</h2>
          <p className="text-xs text-muted-foreground">
            {(data ?? []).length} total · move each order through its production stage. Customers see the stage on the tracking page.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tracking ID, name, email…"
              className="w-64 rounded-xl border border-border bg-background py-2.5 pl-9 pr-3 text-xs font-semibold focus:border-primary focus:outline-none"
            />
          </div>
          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value as "all" | OrderStage)}
            aria-label="Filter by stage"
            className="rounded-xl border border-border bg-background px-3 py-2.5 text-xs font-bold uppercase tracking-widest focus:border-primary focus:outline-none"
          >
            <option value="all">All stages ({(data ?? []).length})</option>
            {ORDER_STAGES.map((stage) => (
              <option key={stage} value={stage}>
                {ORDER_STAGE_LABELS[stage]} ({counts[stage] ?? 0})
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => void refetch()}
            className="flex items-center gap-2 rounded-xl border border-border px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest hover:border-primary"
          >
            <RefreshCw size={12} className={isFetching ? "animate-spin" : ""} /> Refresh
          </button>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="glass rounded-3xl p-8 text-center text-sm text-muted-foreground">
          No custom orders match this view yet.
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const stage = stageOf(order.status);
            const noteValue = notes[order.id] ?? order.admin_notes ?? "";
            const isBusy = busyId === order.id && stageMutation.isPending;
            return (
              <article key={order.id} className="glass space-y-4 rounded-3xl p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary">
                      {order.tracking_id}
                    </p>
                    <h3 className="mt-1 text-base font-extrabold">
                      {order.product || "Custom Apparel"}
                      {order.quantity ? <span className="text-muted-foreground"> · {order.quantity} pcs</span> : null}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {order.name} · {order.email}
                      {order.company ? ` · ${order.company}` : ""}
                      {order.phone ? ` · ${order.phone}` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={stage}
                      aria-label={`Stage for order ${order.tracking_id}`}
                      disabled={isBusy}
                      onChange={(e) => {
                        setBusyId(order.id);
                        stageMutation.mutate({ id: order.id, status: e.target.value as OrderStage });
                      }}
                      className="rounded-xl border border-border bg-background px-3 py-2.5 text-xs font-bold uppercase tracking-widest focus:border-primary focus:outline-none"
                    >
                      {ORDER_STAGES.map((value) => (
                        <option key={value} value={value}>
                          {ORDER_STAGE_LABELS[value]}
                        </option>
                      ))}
                    </select>
                    {isBusy && <Loader2 size={14} className="animate-spin text-muted-foreground" />}
                    <button
                      type="button"
                      aria-label={`Delete order ${order.tracking_id}`}
                      onClick={() => {
                        if (!window.confirm(`Delete order ${order.tracking_id}? This cannot be undone.`)) return;
                        deleteMutation.mutate(order.id);
                      }}
                      className="rounded-xl border border-border p-2.5 text-muted-foreground hover:border-destructive hover:text-destructive"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${ORDER_STAGE_PROGRESS[stage]}%` }}
                  />
                </div>

                <div className="grid gap-3 text-xs text-muted-foreground sm:grid-cols-4">
                  <Detail label="MOQ" value={order.moq} />
                  <Detail label="Colors" value={order.colors} />
                  <Detail label="Delivery" value={order.delivery_time} />
                  <Detail label="Created" value={new Date(order.created_at).toLocaleDateString()} />
                </div>

                {order.design_details ? (
                  <p className="rounded-2xl border border-border p-4 text-xs leading-relaxed text-muted-foreground">
                    {order.design_details}
                  </p>
                ) : null}

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                    Internal notes
                  </label>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <textarea
                      value={noteValue}
                      onChange={(e) => setNotes((prev) => ({ ...prev, [order.id]: e.target.value }))}
                      rows={2}
                      className="flex-1 rounded-xl border border-border bg-background p-3 text-xs focus:border-primary focus:outline-none"
                      placeholder="Production notes, courier details, follow-ups…"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setBusyId(order.id);
                        stageMutation.mutate({ id: order.id, adminNotes: noteValue });
                      }}
                      className="h-fit rounded-xl bg-primary px-4 py-3 text-[10px] font-black uppercase tracking-widest text-primary-foreground"
                    >
                      Save notes
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Detail({ label, value }: { label: string; value?: string | null | undefined }) {
  return (
    <div className="rounded-xl border border-border p-3">
      <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{label}</p>
      <p className="mt-1 text-xs font-semibold text-foreground">{value || "—"}</p>
    </div>
  );
}
