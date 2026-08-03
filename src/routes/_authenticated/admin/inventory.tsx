import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Search, Save, AlertTriangle, ArrowUp, ArrowDown } from "lucide-react";

import { Btn } from "@/components/admin/ui";
import { Card, PageHeader, StatusBadge } from "@/components/admin/kit";
import {
  adminListInventory,
  adminUpdateInventoryStock,
  adminGetRefs,
} from "@/lib/admin-content.functions";

export const Route = createFileRoute("/_authenticated/admin/inventory")({
  head: () => ({
    meta: [
      { title: "Admin Inventory | DesignerSale" },
      { name: "description", content: "Monitor stock and update piece variants." },
    ],
  }),
  component: AdminInventory,
});

function InventoryRow({
  item,
  onSave,
  pending,
}: {
  item: any;
  onSave: (stock: number, active: boolean) => void;
  pending: boolean;
}) {
  const [stock, setStock] = useState<number>(item.stock_quantity);
  const [active, setActive] = useState<boolean>(item.is_active);

  const hasChanged = stock !== item.stock_quantity || active !== item.is_active;

  return (
    <tr className="hover:bg-muted/30">
      <td className="px-6 py-3 font-mono text-xs">{item.sku ?? "—"}</td>
      <td className="px-6 py-3">
        <p className="font-medium">{item.products?.name ?? "—"}</p>
        <p className="text-xs text-muted-foreground">{item.products?.merchants?.name ?? "—"}</p>
      </td>
      <td className="px-6 py-3 text-xs">
        <span className="inline-flex items-center gap-1.5">
          {item.color_hex && (
            <span
              className="h-3 w-3 rounded-full border border-border/40 shrink-0"
              style={{ backgroundColor: item.color_hex }}
            />
          )}
          {item.color_name} · Size {item.size}
        </span>
      </td>
      <td className="px-6 py-3">
        <StatusBadge status={item.products?.status ?? "draft"} />
      </td>
      <td className="px-6 py-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setStock((s) => Math.max(0, s - 1))}
            className="rounded border border-border p-1 hover:bg-muted text-xs font-bold"
            title="Decrease stock"
            aria-label="Decrease stock"
          >
            <ArrowDown className="h-3 w-3" />
          </button>
          <input
            type="number"
            min={0}
            value={stock}
            aria-label={`Stock quantity for variant ${item.sku}`}
            onChange={(e) => setStock(Math.max(0, Number(e.target.value)))}
            className="w-16 rounded border border-border bg-card px-2 py-1 text-center text-sm outline-none focus:border-foreground"
          />
          <button
            onClick={() => setStock((s) => s + 1)}
            className="rounded border border-border p-1 hover:bg-muted text-xs font-bold"
            title="Increase stock"
            aria-label="Increase stock"
          >
            <ArrowUp className="h-3 w-3" />
          </button>
        </div>
      </td>
      <td className="px-6 py-3">
        <input
          type="checkbox"
          aria-label={`Toggle active for variant ${item.sku}`}
          checked={active}
          onChange={(e) => setActive(e.target.checked)}
        />
      </td>
      <td className="px-6 py-3 text-right">
        {hasChanged && (
          <button
            onClick={() => onSave(stock, active)}
            disabled={pending}
            className="inline-flex items-center gap-1 rounded bg-teal-700 px-2.5 py-1 text-xs font-semibold text-white hover:bg-teal-800 disabled:opacity-50"
          >
            <Save className="h-3 w-3" /> Save
          </button>
        )}
      </td>
    </tr>
  );
}

function AdminInventory() {
  const list = useServerFn(adminListInventory);
  const updateStock = useServerFn(adminUpdateInventoryStock);
  const getRefs = useServerFn(adminGetRefs);
  const qc = useQueryClient();

  const [search, setSearch] = useState("");
  const [lowStock, setLowStock] = useState(false);
  const [merchantId, setMerchantId] = useState("");

  const {
    data: inventory,
    isPending,
    error,
  } = useQuery({
    queryKey: ["admin-inventory", search, lowStock, merchantId],
    queryFn: () => list({ data: { search, lowStock, ...(merchantId ? { merchantId } : {}) } }),
  });

  const { data: refs } = useQuery({
    queryKey: ["admin-refs"],
    queryFn: () => getRefs({}),
  });

  const saveMut = useMutation({
    mutationFn: (v: { variantId: string; stockQuantity: number; isActive: boolean }) =>
      updateStock({ data: v }),
    onSuccess: () => {
      toast.success("Inventory stock updated successfully");
      qc.invalidateQueries({ queryKey: ["admin-inventory"] });
      qc.invalidateQueries({ queryKey: ["admin-dashboard"] });
      qc.invalidateQueries({ queryKey: ["admin-products"] });
    },
    onError: (e: Error) => toast.error(e.message || "Failed to update stock"),
  });

  const merchants = (refs as any)?.merchants ?? [];
  const listData = inventory ?? [];

  return (
    <>
      <PageHeader
        title="Inventory Manager"
        description="View variants, monitor out-of-stock pieces, and adjust stock quantities directly."
      />

      <div className="mb-6 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-4 items-center flex-1 max-w-2xl">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by product name or SKU..."
              aria-label="Search inventory"
              className="w-full rounded-md border border-border bg-card py-2 pl-9 pr-3 text-sm outline-none focus:border-foreground"
            />
          </div>
          <div>
            <select
              value={merchantId}
              onChange={(e) => setMerchantId(e.target.value)}
              className="rounded-md border border-border bg-card px-3 py-2 text-sm outline-none"
              aria-label="Filter by Boutique"
            >
              <option value="">All Boutiques</option>
              {merchants.map((m: any) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground cursor-pointer">
            <input
              type="checkbox"
              checked={lowStock}
              onChange={(e) => setLowStock(e.target.checked)}
              className="rounded text-primary focus:ring-primary h-4 w-4"
            />
            <span className="flex items-center gap-1 text-amber-700">
              <AlertTriangle className="h-4 w-4" /> Low Stock Only
            </span>
          </label>
        </div>
      </div>

      {isPending ? (
        <p className="text-sm text-muted-foreground">Loading inventory list...</p>
      ) : error ? (
        <p className="text-sm text-destructive">Failed to load inventory.</p>
      ) : listData.length === 0 ? (
        <Card
          children={
            <p className="text-sm text-muted-foreground py-6 text-center">
              No inventory items match filters.
            </p>
          }
        />
      ) : (
        <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/40 border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-6 py-3">Variant SKU</th>
                  <th className="px-6 py-3">Product / Boutique</th>
                  <th className="px-6 py-3">Color & Size</th>
                  <th className="px-6 py-3">Product Status</th>
                  <th className="px-6 py-3">Stock Quantity</th>
                  <th className="px-6 py-3">Variant Active</th>
                  <th className="px-6 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {listData.map((v: any) => (
                  <InventoryRow
                    key={v.id}
                    item={v}
                    onSave={(stock, active) =>
                      saveMut.mutate({ variantId: v.id, stockQuantity: stock, isActive: active })
                    }
                    pending={saveMut.isPending}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}
