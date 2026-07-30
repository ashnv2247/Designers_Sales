import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card, ErrorState, LoadingSkeleton, MetricCard, PageHeader, StatusBadge } from "@/components/admin/kit";
import { getAdminDashboard } from "@/lib/admin-dashboard.functions";
import {
  formatDate,
  humanStatus,
  LOW_STOCK_THRESHOLD,
  RANGE_OPTIONS,
  type RangeKey,
} from "@/lib/admin-metrics";
import { money } from "@/lib/cart";

export const Route = createFileRoute("/_authenticated/admin/")({
  head: () => ({
    meta: [
      { title: "Admin Dashboard | DesignerSale" },
      { name: "description", content: "Live revenue, orders, catalogue and merchant health for DesignerSale." },
      { property: "og:title", content: "Admin Dashboard | DesignerSale" },
      { property: "og:description", content: "Live marketplace analytics for DesignerSale administrators." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

const PIE_COLORS = ["#0ea5e9", "#f59e0b", "#10b981", "#ef4444", "#94a3b8", "#6366f1"];

function Dashboard() {
  const fetchDashboard = useServerFn(getAdminDashboard);
  const [range, setRange] = useState<RangeKey>("30d");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const { data, isPending, error, refetch } = useQuery({
    queryKey: ["admin-dashboard", range, from, to],
    queryFn: () => fetchDashboard({ data: { range, from: from || undefined, to: to || undefined } }),
  });

  const c = data?.cards;

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Marketplace performance, pulled live from your database."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {RANGE_OPTIONS.map((o) => (
              <button
                key={o.key}
                onClick={() => setRange(o.key)}
                className={`rounded-md border px-3 py-1.5 text-xs transition-colors ${
                  range === o.key
                    ? "border-foreground bg-foreground text-background"
                    : "border-border bg-card hover:bg-muted"
                }`}
              >
                {o.label}
              </button>
            ))}
            <div className="flex items-center gap-1 rounded-md border border-border bg-card px-2 py-1">
              <input
                type="date"
                value={from}
                aria-label="Custom range start"
                onChange={(e) => {
                  setFrom(e.target.value);
                  setRange("custom");
                }}
                className="bg-transparent text-xs outline-none"
              />
              <span className="text-xs text-muted-foreground">to</span>
              <input
                type="date"
                value={to}
                aria-label="Custom range end"
                onChange={(e) => {
                  setTo(e.target.value);
                  setRange("custom");
                }}
                className="bg-transparent text-xs outline-none"
              />
            </div>
          </div>
        }
      />

      {isPending && <LoadingSkeleton rows={8} />}
      {error && <ErrorState message={(error as Error).message} onRetry={() => refetch()} />}

      {data && c && (
        <div className="space-y-6">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
            <MetricCard label="Revenue" value={money(c.revenueCents)} hint="Excludes cancelled orders" accent />
            <MetricCard label="Total orders" value={c.totalOrders} />
            <MetricCard label="Orders today" value={c.ordersToday} />
            <MetricCard label="Pending orders" value={c.pendingOrders} hint="Confirmed or preparing" />
            <MetricCard label="Delivered" value={c.deliveredOrders} />
            <MetricCard label="Cancelled" value={c.cancelledOrders} />
            <MetricCard label="Products" value={c.totalProducts} hint={`${c.publishedProducts} published`} />
            <MetricCard label="Draft products" value={c.draftProducts} />
            <MetricCard label="Sold out" value={c.soldOutProducts} />
            <MetricCard
              label="Low-stock variants"
              value={c.lowStockVariants}
              hint={`At or below ${LOW_STOCK_THRESHOLD}`}
            />
            <MetricCard label="Merchants" value={c.totalMerchants} hint={`${c.pendingMerchants} pending`} />
            <MetricCard label="Customers" value={c.totalCustomers} />
            <MetricCard label="Active sales" value={c.activeSales} />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card title="Revenue over time">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.series}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="revenue" stroke="#0f766e" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card title="Orders over time">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.series}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="orders" fill="#0ea5e9" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card title="Orders by status">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.ordersByStatus.map((s) => ({ name: humanStatus(s.status), value: s.value }))}
                      dataKey="value"
                      nameKey="name"
                      outerRadius={90}
                      label
                    >
                      {data.ordersByStatus.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card title="Products by status">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={data.productsByStatus.map((s) => ({ name: humanStatus(s.status), value: s.value }))}
                    layout="vertical"
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                    <YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#f59e0b" radius={[0, 3, 3, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card title="Top-selling products">
              {data.topProducts.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">No sales in this period.</p>
              ) : (
                <ul className="divide-y divide-border text-sm">
                  {data.topProducts.map((p) => (
                    <li key={p.name} className="flex items-center justify-between gap-4 py-2">
                      <span className="truncate">
                        {p.name}
                        <span className="text-muted-foreground"> · {p.designer}</span>
                      </span>
                      <span className="shrink-0 text-muted-foreground">
                        {p.units} sold · {money(Math.round(p.revenue * 100))}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            <Card title="Low-stock overview">
              {data.lowStock.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">Stock levels are healthy.</p>
              ) : (
                <ul className="divide-y divide-border text-sm">
                  {data.lowStock.map((v) => (
                    <li key={v.id} className="flex items-center justify-between gap-4 py-2">
                      <span className="truncate">
                        {v.product}
                        <span className="text-muted-foreground"> · {v.sku}</span>
                      </span>
                      <StatusBadge
                        status={v.stock === 0 ? "out_of_stock" : "low_stock"}
                        label={v.stock === 0 ? "Out of stock" : `${v.stock} left`}
                      />
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>

          <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
            <Card title="Recent orders">
              {data.recentOrders.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">No orders yet.</p>
              ) : (
                <ul className="divide-y divide-border text-sm">
                  {data.recentOrders.map((o: any) => (
                    <li key={o.id} className="py-2">
                      <Link
                        to="/admin/orders/$id"
                        params={{ id: o.id }}
                        className="flex items-center justify-between gap-3 hover:underline"
                      >
                        <span className="truncate">{o.reference}</span>
                        <StatusBadge status={o.status} />
                      </Link>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {o.shipping_name} · {money(o.total_cents)}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            <Card title="Pending merchant approvals">
              {data.pendingMerchantList.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">Nothing awaiting approval.</p>
              ) : (
                <ul className="divide-y divide-border text-sm">
                  {data.pendingMerchantList.map((m: any) => (
                    <li key={m.id} className="flex items-center justify-between gap-3 py-2">
                      <span className="truncate">{m.name}</span>
                      <StatusBadge status="pending" />
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            <Card title="Recently added products">
              {data.recentProducts.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">No products yet.</p>
              ) : (
                <ul className="divide-y divide-border text-sm">
                  {data.recentProducts.map((p: any) => (
                    <li key={p.id} className="flex items-center justify-between gap-3 py-2">
                      <span className="truncate">{p.name}</span>
                      <StatusBadge status={p.status} />
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            <Card title="Recent customers">
              {data.recentCustomers.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">No customers yet.</p>
              ) : (
                <ul className="divide-y divide-border text-sm">
                  {data.recentCustomers.map((u: any) => (
                    <li key={u.id} className="py-2">
                      <p className="truncate">{u.display_name || u.email || "Unnamed"}</p>
                      <p className="text-xs text-muted-foreground">Joined {formatDate(u.created_at)}</p>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>
        </div>
      )}
    </>
  );
}
