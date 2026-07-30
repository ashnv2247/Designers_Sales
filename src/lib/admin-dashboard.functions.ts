import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { assertAdmin, type AdminCtx } from "@/lib/admin-guard.server";
import { isRevenueOrder, LOW_STOCK_THRESHOLD, resolveRange, type RangeKey } from "@/lib/admin-metrics";

const rangeInput = z.object({
  range: z.enum(["today", "7d", "30d", "90d", "all", "custom"]).default("30d"),
  from: z.string().optional(),
  to: z.string().optional(),
});

export const getAdminDashboard = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => rangeInput.parse(d ?? {}))
  .handler(async ({ data, context }) => {
    await assertAdmin(context as AdminCtx);
    const sb = context.supabase;
    const { from, to } = resolveRange(data.range as RangeKey, data.from, data.to);

    let ordersQuery = sb
      .from("orders")
      .select("id, reference, status, total_cents, created_at, shipping_name, shipping_email")
      .order("created_at", { ascending: false });
    if (from) ordersQuery = ordersQuery.gte("created_at", from);
    if (to) ordersQuery = ordersQuery.lte("created_at", to);

    let itemsQuery = sb
      .from("order_items")
      .select("name, designer, quantity, unit_price_cents, created_at, image");
    if (from) itemsQuery = itemsQuery.gte("created_at", from);
    if (to) itemsQuery = itemsQuery.lte("created_at", to);

    const [orders, items, products, merchants, variants, users, sales] = await Promise.all([
      ordersQuery.limit(5000),
      itemsQuery.limit(5000),
      sb.from("products").select("id, name, status, created_at").order("created_at", { ascending: false }),
      sb.from("merchants").select("id, name, status, created_at").order("created_at", { ascending: false }),
      sb
        .from("product_variants")
        .select("id, sku, stock_quantity, is_available, products(name)")
        .lte("stock_quantity", LOW_STOCK_THRESHOLD)
        .order("stock_quantity", { ascending: true })
        .limit(12),
      sb
        .from("users")
        .select("id, display_name, email, created_at")
        .order("created_at", { ascending: false })
        .limit(6),
      sb.from("sales").select("id, is_active"),
    ]);

    const orderRows = (orders.data ?? []) as any[];
    const itemRows = (items.data ?? []) as any[];
    const productRows = (products.data ?? []) as any[];
    const merchantRows = (merchants.data ?? []) as any[];

    const todayKey = new Date().toISOString().slice(0, 10);
    const byDay = new Map<string, { date: string; revenue: number; orders: number }>();
    for (const o of orderRows) {
      const key = String(o.created_at).slice(0, 10);
      const row = byDay.get(key) ?? { date: key, revenue: 0, orders: 0 };
      row.orders += 1;
      if (isRevenueOrder(o.status)) row.revenue += (o.total_cents ?? 0) / 100;
      byDay.set(key, row);
    }
    const series = [...byDay.values()].sort((a, b) => a.date.localeCompare(b.date));

    const count = (rows: any[], field: string, value: string) =>
      rows.filter((r) => r[field] === value).length;

    const statusCounts = (rows: any[]) => {
      const m = new Map<string, number>();
      for (const r of rows) m.set(r.status, (m.get(r.status) ?? 0) + 1);
      return [...m.entries()].map(([status, value]) => ({ status, value }));
    };

    const topMap = new Map<string, { name: string; designer: string; units: number; revenue: number }>();
    for (const i of itemRows) {
      const row = topMap.get(i.name) ?? { name: i.name, designer: i.designer, units: 0, revenue: 0 };
      row.units += i.quantity ?? 0;
      row.revenue += ((i.unit_price_cents ?? 0) * (i.quantity ?? 0)) / 100;
      topMap.set(i.name, row);
    }
    const topProducts = [...topMap.values()].sort((a, b) => b.units - a.units).slice(0, 8);

    const { count: customerCount } = await sb
      .from("users")
      .select("id", { count: "exact", head: true });

    return {
      cards: {
        totalOrders: orderRows.length,
        revenueCents: orderRows.reduce(
          (n, o) => (isRevenueOrder(o.status) ? n + (o.total_cents ?? 0) : n),
          0,
        ),
        ordersToday: orderRows.filter((o) => String(o.created_at).slice(0, 10) === todayKey).length,
        pendingOrders: orderRows.filter((o) => o.status === "confirmed" || o.status === "preparing").length,
        deliveredOrders: count(orderRows, "status", "delivered"),
        cancelledOrders: count(orderRows, "status", "cancelled"),
        totalProducts: productRows.length,
        publishedProducts: count(productRows, "status", "published"),
        draftProducts: count(productRows, "status", "draft"),
        soldOutProducts: count(productRows, "status", "sold_out"),
        lowStockVariants: (variants.data ?? []).length,
        totalMerchants: merchantRows.length,
        pendingMerchants: count(merchantRows, "status", "pending"),
        totalCustomers: customerCount ?? 0,
        activeSales: ((sales.data ?? []) as any[]).filter((s) => s.is_active).length,
      },
      series,
      ordersByStatus: statusCounts(orderRows),
      productsByStatus: statusCounts(productRows),
      topProducts,
      lowStock: ((variants.data ?? []) as any[]).map((v) => ({
        id: v.id,
        sku: v.sku,
        stock: v.stock_quantity,
        available: v.is_available,
        product: v.products?.name ?? "—",
      })),
      recentOrders: orderRows.slice(0, 8),
      pendingMerchantList: merchantRows.filter((m) => m.status === "pending").slice(0, 6),
      recentProducts: productRows.slice(0, 6),
      recentCustomers: (users.data ?? []) as any[],
    };
  });
