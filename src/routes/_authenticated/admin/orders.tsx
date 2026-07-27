import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { adminListOrders, adminUpdateOrderStatus } from "@/lib/admin.functions";
import { money } from "@/lib/cart";
import { STATUS_LABEL } from "@/lib/order-status";

const STATUSES = ["confirmed", "preparing", "in_transit", "delivered", "cancelled"] as const;

export const Route = createFileRoute("/_authenticated/admin/orders")({
  head: () => ({
    meta: [
      { title: "Admin Orders | DesignerSale" },
      { name: "description", content: "Review every DesignerSale order and move it through fulfilment." },
      { property: "og:title", content: "Admin Orders | DesignerSale" },
      { property: "og:description", content: "Review and update every DesignerSale order." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AdminOrders,
});

function AdminOrders() {
  const list = useServerFn(adminListOrders);
  const update = useServerFn(adminUpdateOrderStatus);
  const qc = useQueryClient();

  const { data, isPending, error } = useQuery({ queryKey: ["admin-orders"], queryFn: () => list({}) });

  const mutation = useMutation({
    mutationFn: (vars: { id: string; status: (typeof STATUSES)[number] }) => update({ data: vars }),
    onSuccess: () => {
      toast.success("Order updated");
      qc.invalidateQueries({ queryKey: ["admin-orders"] });
      qc.invalidateQueries({ queryKey: ["admin-summary"] });
    },
    onError: () => toast.error("Could not update that order"),
  });

  if (isPending) return <p className="text-sm text-muted-foreground">Loading orders…</p>;
  if (error || !data) return <p className="text-sm text-muted-foreground">We couldn't load orders.</p>;
  if (data.length === 0) return <p className="text-sm text-muted-foreground">No orders yet.</p>;

  return (
    <ul className="border-t border-border">
      {data.map((o: any) => (
        <li key={o.id} className="grid gap-4 border-b border-border py-6 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <p className="text-sm">
              <span className="tracking-[0.14em]">{o.reference}</span>
              <span className="text-muted-foreground"> · {new Date(o.created_at).toLocaleDateString()}</span>
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {o.shipping_name} · {o.shipping_email} · {o.shipping_city}, {o.shipping_country}
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              {(o.order_items ?? []).map((i: any) => `${i.quantity}× ${i.name}`).join(" · ") || "No line items"}
            </p>
          </div>
          <div className="flex items-center gap-6">
            <p className="text-sm">{money(o.total_cents)}</p>
            <select
              aria-label={`Status for order ${o.reference}`}
              value={o.status}
              disabled={mutation.isPending}
              onChange={(e) =>
                mutation.mutate({ id: o.id, status: e.target.value as (typeof STATUSES)[number] })
              }
              className="border border-border bg-transparent px-3 py-2 text-[0.62rem] uppercase tracking-[0.18em]"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABEL[s]}
                </option>
              ))}
            </select>
          </div>
        </li>
      ))}
    </ul>
  );
}
