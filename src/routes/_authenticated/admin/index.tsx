import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";

import { getAdminSummary } from "@/lib/admin.functions";
import { money } from "@/lib/cart";

export const Route = createFileRoute("/_authenticated/admin/")({
  head: () => ({
    meta: [
      { title: "Admin Overview | DesignerSale" },
      { name: "description", content: "Store-wide revenue, orders, catalogue and merchant health at a glance." },
      { property: "og:title", content: "Admin Overview | DesignerSale" },
      { property: "og:description", content: "Revenue, orders, catalogue and merchant health." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AdminOverview,
});

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="border-t border-border pt-5">
      <p className="rule-label text-muted-foreground">{label}</p>
      <p className="display mt-3 text-[2rem] leading-none">{value}</p>
      {hint && <p className="mt-2 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

function AdminOverview() {
  const fetchSummary = useServerFn(getAdminSummary);
  const { data, isPending, error } = useQuery({
    queryKey: ["admin-summary"],
    queryFn: () => fetchSummary({}),
  });

  if (isPending) return <p className="text-sm text-muted-foreground">Loading store figures…</p>;
  if (error || !data)
    return <p className="text-sm text-muted-foreground">We couldn't load the store figures.</p>;

  return (
    <div className="grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
      <Stat label="Revenue" value={money(data.revenueCents)} hint="Excludes cancelled orders" />
      <Stat label="Orders" value={String(data.orderCount)} hint={`${data.openOrders} still in progress`} />
      <Stat
        label="Products"
        value={String(data.productCount)}
        hint={`${data.publishedProducts} published`}
      />
      <Stat
        label="Merchants"
        value={String(data.merchantCount)}
        hint={`${data.pendingMerchants} awaiting approval`}
      />
      <Stat label="Customer records" value={String(data.userCount)} />
    </div>
  );
}
