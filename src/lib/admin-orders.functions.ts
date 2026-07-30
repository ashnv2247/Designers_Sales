import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { assertAdmin, type AdminCtx } from "@/lib/admin-guard.server";

const ORDER_STATUS = ["confirmed", "preparing", "in_transit", "delivered", "cancelled"] as const;

const filterSchema = z.object({
  search: z.string().trim().max(120).optional(),
  status: z.enum(ORDER_STATUS).optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  country: z.string().trim().max(80).optional(),
  minCents: z.number().int().nonnegative().optional(),
  maxCents: z.number().int().nonnegative().optional(),
  sort: z.enum(["created_at", "total_cents", "reference"]).default("created_at"),
  dir: z.enum(["asc", "desc"]).default("desc"),
});

const pageSchema = filterSchema.extend({
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(10).max(100).default(25),
});

type Filters = z.infer<typeof filterSchema>;

function applyFilters(query: any, f: Filters) {
  if (f.search) {
    const s = f.search.replace(/[%,()]/g, "");
    query = query.or(
      `reference.ilike.%${s}%,shipping_name.ilike.%${s}%,shipping_email.ilike.%${s}%`,
    );
  }
  if (f.status) query = query.eq("status", f.status);
  if (f.country) query = query.ilike("shipping_country", `%${f.country}%`);
  if (f.from) query = query.gte("created_at", new Date(`${f.from}T00:00:00`).toISOString());
  if (f.to) query = query.lte("created_at", new Date(`${f.to}T23:59:59`).toISOString());
  if (typeof f.minCents === "number") query = query.gte("total_cents", f.minCents);
  if (typeof f.maxCents === "number") query = query.lte("total_cents", f.maxCents);
  return query.order(f.sort, { ascending: f.dir === "asc" });
}

const LIST_COLUMNS =
  "id, reference, status, subtotal_cents, shipping_cents, total_cents, shipping_name, shipping_email, shipping_city, shipping_country, shipping_method, created_at, order_items(id)";

export const adminOrdersPage = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => pageSchema.parse(d ?? {}))
  .handler(async ({ data, context }) => {
    await assertAdmin(context as AdminCtx);
    const start = (data.page - 1) * data.pageSize;
    const query = applyFilters(
      context.supabase.from("orders").select(LIST_COLUMNS, { count: "exact" }),
      data,
    ).range(start, start + data.pageSize - 1);

    const { data: rows, count, error } = await query;
    if (error) throw new Error(error.message);
    return { rows: (rows ?? []) as any[], total: count ?? 0 };
  });

export const adminOrdersExport = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => filterSchema.parse(d ?? {}))
  .handler(async ({ data, context }) => {
    await assertAdmin(context as AdminCtx);
    const { data: rows, error } = await applyFilters(
      context.supabase.from("orders").select(LIST_COLUMNS),
      data,
    ).limit(5000);
    if (error) throw new Error(error.message);
    return (rows ?? []) as any[];
  });

export const adminOrderDetail = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context as AdminCtx);
    const { data: order, error } = await context.supabase
      .from("orders")
      .select("*, order_items(*)")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!order) throw new Error("Order not found");
    return order as any;
  });

export const adminSetOrderStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ ids: z.array(z.string().uuid()).min(1).max(200), status: z.enum(ORDER_STATUS) }).parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context as AdminCtx);
    const { error } = await context.supabase
      .from("orders")
      .update({ status: data.status })
      .in("id", data.ids);
    if (error) throw new Error(error.message);
    return { ok: true, updated: data.ids.length };
  });
