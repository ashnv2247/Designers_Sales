import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Copy, Download, RefreshCw } from "lucide-react";
import { z } from "zod";

import {
  Card,
  EmptyState,
  ErrorState,
  LoadingSkeleton,
  PageHeader,
  PaginationControls,
  StatusBadge,
} from "@/components/admin/kit";
import { adminOrdersExport, adminOrdersPage, adminSetOrderStatus } from "@/lib/admin-orders.functions";
import { downloadCsv, formatDate, humanStatus } from "@/lib/admin-metrics";
import { money } from "@/lib/cart";

const STATUSES = ["confirmed", "preparing", "in_transit", "delivered", "cancelled"] as const;

const searchSchema = z.object({
  search: z.string().optional(),
  status: z.enum(STATUSES).optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  country: z.string().optional(),
  min: z.number().optional(),
  max: z.number().optional(),
  page: z.number().optional(),
  size: z.number().optional(),
});

export const Route = createFileRoute("/_authenticated/admin/orders/")({
  validateSearch: (s: Record<string, unknown>) => searchSchema.parse(s),
  head: () => ({
    meta: [
      { title: "Orders | DesignerSale Admin" },
      { name: "description", content: "Search, filter, export and fulfil every DesignerSale order." },
      { property: "og:title", content: "Orders | DesignerSale Admin" },
      { property: "og:description", content: "Order management for DesignerSale administrators." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: OrdersList,
});

function OrdersList() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const qc = useQueryClient();

  const list = useServerFn(adminOrdersPage);
  const exportFn = useServerFn(adminOrdersExport);
  const setStatus = useServerFn(adminSetOrderStatus);

  const [term, setTerm] = useState(search.search ?? "");
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => setTerm(search.search ?? ""), [search.search]);

  // Debounced search -> URL
  useEffect(() => {
    const t = setTimeout(() => {
      if ((search.search ?? "") === term) return;
      navigate({ search: (p: any) => ({ ...p, search: term || undefined, page: 1 }) });
    }, 350);
    return () => clearTimeout(t);
  }, [term]);

  const filters = useMemo(
    () => ({
      search: search.search || undefined,
      status: search.status,
      from: search.from || undefined,
      to: search.to || undefined,
      country: search.country || undefined,
      minCents: typeof search.min === "number" ? Math.round(search.min * 100) : undefined,
      maxCents: typeof search.max === "number" ? Math.round(search.max * 100) : undefined,
      sort: "created_at" as const,
      dir: "desc" as const,
    }),
    [search],
  );

  const page = search.page ?? 1;
  const pageSize = search.size ?? 25;

  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: ["admin-orders", filters, page, pageSize],
    queryFn: () => list({ data: { ...filters, page, pageSize } }),
  });

  const statusMutation = useMutation({
    mutationFn: (v: { ids: string[]; status: (typeof STATUSES)[number] }) => setStatus({ data: v }),
    onSuccess: (r: any) => {
      toast.success(`${r.updated} order${r.updated === 1 ? "" : "s"} updated`);
      setSelected([]);
      qc.invalidateQueries({ queryKey: ["admin-orders"] });
      qc.invalidateQueries({ queryKey: ["admin-dashboard"] });
    },
    onError: (e: Error) => toast.error(friendly(e.message)),
  });

  const exportMutation = useMutation({
    mutationFn: () => exportFn({ data: filters }),
    onSuccess: (rows: any[]) => {
      if (rows.length === 0) return toast.error("Nothing to export for these filters");
      downloadCsv(
        `orders-${new Date().toISOString().slice(0, 10)}.csv`,
        rows.map((o) => ({
          Reference: o.reference,
          Status: humanStatus(o.status),
          Customer: o.shipping_name,
          Email: o.shipping_email,
          Items: (o.order_items ?? []).length,
          Subtotal: (o.subtotal_cents / 100).toFixed(2),
          Shipping: (o.shipping_cents / 100).toFixed(2),
          Total: (o.total_cents / 100).toFixed(2),
          City: o.shipping_city,
          Country: o.shipping_country,
          Method: o.shipping_method,
          Created: formatDate(o.created_at),
        })),
      );
      toast.success(`Exported ${rows.length} orders`);
    },
    onError: (e: Error) => toast.error(friendly(e.message)),
  });

  const rows = data?.rows ?? [];
  const allSelected = rows.length > 0 && selected.length === rows.length;

  function setFilter(patch: Record<string, unknown>) {
    navigate({ search: (p: any) => ({ ...p, ...patch, page: 1 }) });
  }

  function bulkStatus(status: (typeof STATUSES)[number]) {
    if (selected.length === 0) return;
    if (status === "cancelled" || status === "delivered") {
      if (!confirm(`Mark ${selected.length} order(s) as ${humanStatus(status)}? This is hard to undo.`)) return;
    }
    statusMutation.mutate({ ids: selected, status });
  }

  return (
    <>
      <PageHeader
        title="Orders"
        description="Every order in the marketplace, filtered server-side."
        actions={
          <>
            <button
              onClick={() => refetch()}
              className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-xs hover:bg-muted"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`} /> Refresh
            </button>
            <button
              onClick={() => exportMutation.mutate()}
              disabled={exportMutation.isPending}
              className="inline-flex items-center gap-2 rounded-md bg-foreground px-3 py-2 text-xs text-background disabled:opacity-50"
            >
              <Download className="h-3.5 w-3.5" /> Export CSV
            </button>
          </>
        }
      />

      <div className="mb-4 flex flex-wrap gap-2">
        <button
          onClick={() => setFilter({ status: undefined })}
          className={tab(!search.status)}
        >
          All
        </button>
        {STATUSES.map((s) => (
          <button key={s} onClick={() => setFilter({ status: s })} className={tab(search.status === s)}>
            {humanStatus(s)}
          </button>
        ))}
      </div>

      <Card>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <input
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Reference, name or email"
            className={input}
            aria-label="Search orders"
          />
          <input
            type="date"
            value={search.from ?? ""}
            onChange={(e) => setFilter({ from: e.target.value || undefined })}
            className={input}
            aria-label="From date"
          />
          <input
            type="date"
            value={search.to ?? ""}
            onChange={(e) => setFilter({ to: e.target.value || undefined })}
            className={input}
            aria-label="To date"
          />
          <input
            value={search.country ?? ""}
            onChange={(e) => setFilter({ country: e.target.value || undefined })}
            placeholder="Shipping country"
            className={input}
            aria-label="Shipping country"
          />
          <div className="flex gap-2">
            <input
              type="number"
              min={0}
              value={search.min ?? ""}
              onChange={(e) => setFilter({ min: e.target.value ? Number(e.target.value) : undefined })}
              placeholder="Min £"
              className={input}
              aria-label="Minimum amount"
            />
            <input
              type="number"
              min={0}
              value={search.max ?? ""}
              onChange={(e) => setFilter({ max: e.target.value ? Number(e.target.value) : undefined })}
              placeholder="Max £"
              className={input}
              aria-label="Maximum amount"
            />
          </div>
        </div>
      </Card>

      {selected.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card px-4 py-3 text-xs shadow-sm">
          <span>{selected.length} selected</span>
          {STATUSES.map((s) => (
            <button
              key={s}
              disabled={statusMutation.isPending}
              onClick={() => bulkStatus(s)}
              className="rounded-md border border-border px-2.5 py-1 hover:bg-muted disabled:opacity-50"
            >
              Mark {humanStatus(s)}
            </button>
          ))}
          <button onClick={() => setSelected([])} className="ml-auto text-muted-foreground hover:underline">
            Clear
          </button>
        </div>
      )}

      <div className="mt-4 overflow-hidden rounded-lg border border-border bg-card shadow-sm">
        {isPending && <div className="p-4"><LoadingSkeleton /></div>}
        {error && <ErrorState message={friendly((error as Error).message)} onRetry={() => refetch()} />}
        {data && rows.length === 0 && (
          <EmptyState title="No orders match these filters" hint="Try clearing the search or date range." />
        )}

        {data && rows.length > 0 && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-sm">
                <thead className="border-b border-border bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={allSelected}
                        aria-label="Select all orders on this page"
                        onChange={(e) => setSelected(e.target.checked ? rows.map((r: any) => r.id) : [])}
                      />
                    </th>
                    <th className="px-4 py-3">Reference</th>
                    <th className="px-4 py-3">Customer</th>
                    <th className="px-4 py-3">Items</th>
                    <th className="px-4 py-3">Total</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">City</th>
                    <th className="px-4 py-3">Created</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {rows.map((o: any) => (
                    <tr key={o.id} className="hover:bg-muted/30">
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          aria-label={`Select order ${o.reference}`}
                          checked={selected.includes(o.id)}
                          onChange={(e) =>
                            setSelected((prev) =>
                              e.target.checked ? [...prev, o.id] : prev.filter((id) => id !== o.id),
                            )
                          }
                        />
                      </td>
                      <td className="px-4 py-3 font-medium">
                        <Link to="/admin/orders/$id" params={{ id: o.id }} className="hover:underline">
                          {o.reference}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <p>{o.shipping_name}</p>
                        <p className="text-xs text-muted-foreground">{o.shipping_email}</p>
                      </td>
                      <td className="px-4 py-3">{(o.order_items ?? []).length}</td>
                      <td className="px-4 py-3">{money(o.total_cents)}</td>
                      <td className="px-4 py-3">
                        <select
                          aria-label={`Status for ${o.reference}`}
                          value={o.status}
                          disabled={statusMutation.isPending}
                          onChange={(e) => {
                            const next = e.target.value as (typeof STATUSES)[number];
                            if (
                              (next === "cancelled" || next === "delivered") &&
                              !confirm(`Mark ${o.reference} as ${humanStatus(next)}?`)
                            )
                              return;
                            statusMutation.mutate({ ids: [o.id], status: next });
                          }}
                          className="rounded-md border border-border bg-transparent px-2 py-1 text-xs"
                        >
                          {STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {humanStatus(s)}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {o.shipping_city}, {o.shipping_country}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{formatDate(o.created_at)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            title="Copy reference"
                            aria-label={`Copy reference ${o.reference}`}
                            onClick={() => {
                              navigator.clipboard.writeText(o.reference);
                              toast.success("Reference copied");
                            }}
                            className="rounded-md border border-border p-1.5 hover:bg-muted"
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </button>
                          <Link
                            to="/admin/orders/$id"
                            params={{ id: o.id }}
                            className="rounded-md border border-border px-2.5 py-1 text-xs hover:bg-muted"
                          >
                            View
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <PaginationControls
              page={page}
              pageSize={pageSize}
              total={data.total}
              onPage={(p) => navigate({ search: (prev: any) => ({ ...prev, page: p }) })}
              onPageSize={(n) => navigate({ search: (prev: any) => ({ ...prev, size: n, page: 1 }) })}
            />
          </>
        )}
      </div>
    </>
  );
}

const input =
  "w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-foreground";

const tab = (active: boolean) =>
  `rounded-md border px-3 py-1.5 text-xs transition-colors ${
    active ? "border-foreground bg-foreground text-background" : "border-border bg-card hover:bg-muted"
  }`;

export function friendly(message: string) {
  if (/forbidden/i.test(message)) return "You do not have permission to perform this action.";
  if (/jwt|session|unauthor/i.test(message)) return "The session has expired. Please sign in again.";
  return "Something went wrong. Please try again.";
}
