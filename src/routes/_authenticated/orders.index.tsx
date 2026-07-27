import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";

import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { money } from "@/lib/cart";
import { listOrders } from "@/lib/orders.functions";
import { STATUS_LABEL } from "@/lib/order-status";

export const Route = createFileRoute("/_authenticated/orders/")({
  head: () => ({
    meta: [
      { title: "Your Orders | DesignerSale" },
      {
        name: "description",
        content: "Follow every DesignerSale order from confirmation through to delivery.",
      },
      { property: "og:title", content: "Your Orders | DesignerSale" },
      { property: "og:description", content: "Track your DesignerSale orders and delivery status." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: OrdersPage,
});

function OrdersPage() {
  const fetchOrders = useServerFn(listOrders);
  const { data, isPending, error } = useQuery({ queryKey: ["orders"], queryFn: () => fetchOrders({}) });

  return (
    <>
      <Nav />
      <main className="mx-auto min-h-[70vh] max-w-[1200px] px-5 pb-28 pt-32 md:px-10 md:pt-40">
        <p className="rule-label text-muted-foreground">Account</p>
        <h1 className="display mt-5 text-[clamp(2.6rem,6vw,4.2rem)] leading-[1]">Your orders</h1>

        {isPending && <p className="mt-14 text-sm text-muted-foreground">Loading your orders…</p>}
        {error && (
          <p role="alert" className="mt-14 text-sm text-muted-foreground">
            We couldn't load your orders just now.
          </p>
        )}

        {data && data.length === 0 && (
          <div className="mt-14 border-t border-border pt-14">
            <p className="text-sm text-muted-foreground">No orders yet.</p>
            <Link
              to="/shop"
              className="mt-8 inline-block bg-olive-deep px-10 py-4 text-[0.62rem] uppercase tracking-[0.24em] text-ivory"
            >
              Browse the edit
            </Link>
          </div>
        )}

        {data && data.length > 0 && (
          <ul className="mt-14 border-t border-border">
            {data.map((o) => (
              <li key={o.id}>
                <Link
                  to="/orders/$id"
                  params={{ id: o.id }}
                  className="flex flex-wrap items-center justify-between gap-6 border-b border-border py-7 transition-colors hover:bg-cream"
                >
                  <div>
                    <p className="rule-label text-muted-foreground">
                      {new Date(o.created_at).toLocaleDateString("en-AU", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                    <p className="mt-1.5 font-serif text-xl">{o.reference}</p>
                  </div>
                  <span className="rule-label border border-border px-3 py-1.5">
                    {STATUS_LABEL[o.status] ?? o.status}
                  </span>
                  <span className="text-sm">{money(o.total_cents)}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
      <Footer />
    </>
  );
}