import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowLeft, Copy } from "lucide-react";

import { Card, ErrorState, LoadingSkeleton, PageHeader, StatusBadge } from "@/components/admin/kit";
import { adminOrderDetail, adminSetOrderStatus } from "@/lib/admin-orders.functions";
import { formatDateTime, friendlyError, humanStatus } from "@/lib/admin-metrics";
import { money } from "@/lib/cart";
import { ORDER_STEPS, SHIPPING_LABEL } from "@/lib/order-status";

const STATUSES = ["confirmed", "preparing", "in_transit", "delivered", "cancelled"] as const;

export const Route = createFileRoute("/_authenticated/admin/orders/$id")({
  head: () => ({
    meta: [
      { title: "Order detail | DesignerSale Admin" },
      {
        name: "description",
        content: "Full order breakdown, customer details and fulfilment controls.",
      },
      { property: "og:title", content: "Order detail | DesignerSale Admin" },
      { property: "og:description", content: "Order breakdown and fulfilment controls." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: OrderDetail,
});

function OrderDetail() {
  const { id } = Route.useParams();
  const fetchOrder = useServerFn(adminOrderDetail);
  const setStatus = useServerFn(adminSetOrderStatus);
  const qc = useQueryClient();

  const {
    data: order,
    isPending,
    error,
    refetch,
  } = useQuery({
    queryKey: ["admin-order", id],
    queryFn: () => fetchOrder({ data: { id } }),
  });

  const mutation = useMutation({
    mutationFn: (status: (typeof STATUSES)[number]) => setStatus({ data: { ids: [id], status } }),
    onSuccess: () => {
      toast.success("Order updated");
      qc.invalidateQueries({ queryKey: ["admin-order", id] });
      qc.invalidateQueries({ queryKey: ["admin-orders"] });
      qc.invalidateQueries({ queryKey: ["admin-dashboard"] });
    },
    onError: (e: Error) => toast.error(friendlyError(e.message)),
  });

  if (isPending) return <LoadingSkeleton rows={8} />;
  if (error || !order)
    return (
      <ErrorState
        message={friendlyError((error as Error)?.message ?? "")}
        onRetry={() => refetch()}
      />
    );

  const items = (order.order_items ?? []) as any[];
  const cancelled = order.status === "cancelled";
  const currentStep = ORDER_STEPS.indexOf(order.status);

  return (
    <>
      <Link
        to="/admin/orders"
        className="mb-4 inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to orders
      </Link>

      <PageHeader
        title={order.reference}
        description={`Placed ${formatDateTime(order.created_at)} · last updated ${formatDateTime(order.updated_at)}`}
        actions={
          <>
            <StatusBadge status={order.status} />
            <select
              aria-label="Update order status"
              value={order.status}
              disabled={mutation.isPending}
              onChange={(e) => {
                const next = e.target.value as (typeof STATUSES)[number];
                if (
                  (next === "cancelled" || next === "delivered") &&
                  !confirm(`Mark this order as ${humanStatus(next)}?`)
                )
                  return;
                mutation.mutate(next);
              }}
              className="rounded-md border border-border bg-card px-3 py-2 text-xs"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {humanStatus(s)}
                </option>
              ))}
            </select>
          </>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card title="Status timeline">
            {cancelled ? (
              <p className="text-sm text-muted-foreground">This order was cancelled.</p>
            ) : (
              <ol className="flex flex-wrap gap-3">
                {ORDER_STEPS.map((step, i) => (
                  <li
                    key={step}
                    className={`flex-1 min-w-[9rem] rounded-md border px-3 py-2 text-xs ${
                      i <= currentStep
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : "border-border text-muted-foreground"
                    }`}
                  >
                    {humanStatus(step)}
                  </li>
                ))}
              </ol>
            )}
          </Card>

          <Card title={`Items (${items.length})`}>
            <ul className="divide-y divide-border">
              {items.map((i) => (
                <li key={i.id} className="flex gap-4 py-3">
                  {i.image ? (
                    <img
                      src={i.image}
                      alt={i.name}
                      loading="lazy"
                      className="h-20 w-16 shrink-0 rounded-md object-cover"
                    />
                  ) : (
                    <div className="h-20 w-16 shrink-0 rounded-md bg-muted" />
                  )}
                  <div className="min-w-0 flex-1 text-sm">
                    <p className="truncate font-medium">{i.name}</p>
                    <p className="text-xs text-muted-foreground">{i.designer}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      ID {i.product_id}
                      {i.size ? ` · Size ${i.size}` : ""}
                      {i.colour ? ` · ${i.colour}` : ""}
                    </p>
                  </div>
                  <div className="shrink-0 text-right text-sm">
                    <p>{money(i.unit_price_cents)}</p>
                    <p className="text-xs text-muted-foreground">× {i.quantity}</p>
                    <p className="mt-1 font-medium">{money(i.unit_price_cents * i.quantity)}</p>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        <div className="space-y-4">
          <Card title="Customer">
            <div className="space-y-1 text-sm">
              <p>{order.shipping_name}</p>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(order.shipping_email);
                  toast.success("Email copied");
                }}
                className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground"
              >
                {order.shipping_email} <Copy className="h-3 w-3" />
              </button>
            </div>
          </Card>

          <Card title="Shipping">
            <div className="space-y-1 text-sm text-muted-foreground">
              <p>{order.shipping_address}</p>
              <p>
                {order.shipping_city}, {order.shipping_postcode}
              </p>
              <p>{order.shipping_country}</p>
              <p className="pt-2 text-foreground">
                {SHIPPING_LABEL[order.shipping_method] ?? order.shipping_method}
              </p>
            </div>
          </Card>

          {order.gift_note && (
            <Card title="Gift note">
              <p className="text-sm text-muted-foreground">{order.gift_note}</p>
            </Card>
          )}

          <Card title="Summary">
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Subtotal</dt>
                <dd>{money(order.subtotal_cents)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Shipping</dt>
                <dd>{money(order.shipping_cents)}</dd>
              </div>
              <div className="flex justify-between border-t border-border pt-2 font-medium">
                <dt>Total</dt>
                <dd>{money(order.total_cents)}</dd>
              </div>
            </dl>
          </Card>
        </div>
      </div>
    </>
  );
}
