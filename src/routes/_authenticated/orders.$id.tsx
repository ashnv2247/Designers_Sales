import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";

import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { money } from "@/lib/cart";
import { getOrder } from "@/lib/orders.functions";
import { ORDER_STEPS, SHIPPING_LABEL, STATUS_LABEL, STATUS_NOTE } from "@/lib/order-status";

export const Route = createFileRoute("/_authenticated/orders/$id")({
  head: () => ({
    meta: [
      { title: "Order Confirmation | DesignerSale" },
      {
        name: "description",
        content: "Your DesignerSale order confirmation, delivery details and live order status.",
      },
      { property: "og:title", content: "Order Confirmation | DesignerSale" },
      { property: "og:description", content: "View your order confirmation and delivery status." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: OrderPage,
});

function OrderPage() {
  const { id } = Route.useParams();
  const fetchOrder = useServerFn(getOrder);
  const { data, isPending, error } = useQuery({
    queryKey: ["order", id],
    queryFn: () => fetchOrder({ data: { id } }),
  });

  return (
    <>
      <Nav />
      <main className="mx-auto min-h-[70vh] max-w-[1200px] px-5 pb-28 pt-32 md:px-10 md:pt-40">
        {isPending && <p className="text-sm text-muted-foreground">Retrieving your order…</p>}
        {(error || (data === null && !isPending)) && (
          <div role="alert">
            <h1 className="display text-4xl">Order not found</h1>
            <Link to="/orders" className="link-underline mt-6 inline-block text-sm">
              Back to your orders
            </Link>
          </div>
        )}

        {data && (
          <>
            <p className="rule-label text-muted-foreground">Step three of three</p>
            <h1 className="display mt-5 text-[clamp(2.6rem,6vw,4.2rem)] leading-[1]">
              Thank you — your order is confirmed.
            </h1>
            <p className="mt-6 max-w-xl text-sm leading-relaxed text-muted-foreground">
              Reference <span className="text-foreground">{data.order.reference}</span>. A confirmation has
              been sent to {data.order.shipping_email}.
            </p>

            {/* Status timeline */}
            <ol className="mt-14 grid gap-4 border-y border-border py-8 sm:grid-cols-4">
              {ORDER_STEPS.map((step, i) => {
                const currentIndex = ORDER_STEPS.indexOf(data.order.status as (typeof ORDER_STEPS)[number]);
                const done = currentIndex >= i && data.order.status !== "cancelled";
                return (
                  <li key={step} className="flex flex-col gap-3">
                    <span className={`h-px w-full ${done ? "bg-olive-deep" : "bg-border"}`} />
                    <span
                      className={`rule-label ${done ? "text-foreground" : "text-muted-foreground"}`}
                    >
                      {STATUS_LABEL[step]}
                    </span>
                  </li>
                );
              })}
            </ol>
            <p className="mt-5 text-sm text-muted-foreground">
              {STATUS_NOTE[data.order.status] ?? ""}
            </p>

            <div className="mt-16 grid gap-14 lg:grid-cols-[1.3fr_0.7fr]">
              <ul className="border-t border-border">
                {data.items.map((it) => (
                  <li key={it.id} className="flex gap-5 border-b border-border py-6">
                    {it.image && (
                      <img src={it.image} alt={it.name} className="w-20 object-cover" />
                    )}
                    <div className="flex flex-1 items-start justify-between gap-4">
                      <div>
                        <p className="rule-label text-muted-foreground">{it.designer}</p>
                        <p className="mt-1.5 font-serif text-lg">{it.name}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {it.size ? `Size ${it.size} · ` : ""}Qty {it.quantity}
                        </p>
                      </div>
                      <p className="text-sm">{money(it.unit_price_cents * it.quantity)}</p>
                    </div>
                  </li>
                ))}
              </ul>

              <aside className="space-y-8">
                <div className="border border-border p-7">
                  <h2 className="rule-label text-muted-foreground">Summary</h2>
                  <dl className="mt-5 space-y-3 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Subtotal</dt>
                      <dd>{money(data.order.subtotal_cents)}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">
                        {SHIPPING_LABEL[data.order.shipping_method] ?? "Shipping"}
                      </dt>
                      <dd>
                        {data.order.shipping_cents === 0
                          ? "Complimentary"
                          : money(data.order.shipping_cents)}
                      </dd>
                    </div>
                    <div className="flex justify-between border-t border-border pt-4">
                      <dt className="rule-label">Total</dt>
                      <dd className="text-lg">{money(data.order.total_cents)}</dd>
                    </div>
                  </dl>
                </div>

                <div className="border border-border p-7 text-sm leading-relaxed">
                  <h2 className="rule-label text-muted-foreground">Delivering to</h2>
                  <address className="mt-4 not-italic text-muted-foreground">
                    <span className="block text-foreground">{data.order.shipping_name}</span>
                    {data.order.shipping_address}
                    <br />
                    {data.order.shipping_city} {data.order.shipping_postcode}
                    <br />
                    {data.order.shipping_country}
                  </address>
                  {data.order.gift_note && (
                    <p className="mt-4 border-t border-border pt-4 text-muted-foreground">
                      Gift note: “{data.order.gift_note}”
                    </p>
                  )}
                </div>

                <Link
                  to="/orders"
                  className="link-underline inline-block text-[0.62rem] uppercase tracking-[0.2em]"
                >
                  All orders
                </Link>
              </aside>
            </div>
          </>
        )}
      </main>
      <Footer />
    </>
  );
}