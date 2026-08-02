import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { withNormalizedOptions } from "@/lib/product-options";

type Ctx = { supabase: any; userId: string };

async function assertAdmin(context: Ctx) {
  const { data, error } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "admin",
  });
  if (error) throw new Error("Could not verify permissions");
  if (!data) throw new Error("Forbidden");
}

export const getMyAdminAccess = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    return { isAdmin: Boolean(data) };
  });

export const getAdminSummary = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context as Ctx);
    const sb = context.supabase;

    const [orders, products, merchants] = await Promise.all([
      sb
        .from("orders")
        .select("total_cents, status, created_at")
        .order("created_at", { ascending: false }),
      sb.from("products").select("id, status"),
      sb.from("merchants").select("id, status"),
    ]);

    const orderRows = orders.data ?? [];
    const revenueCents = orderRows
      .filter((o: any) => o.status !== "cancelled")
      .reduce((n: number, o: any) => n + (o.total_cents ?? 0), 0);

    const { count: userCount } = await sb
      .from("users")
      .select("id", { count: "exact", head: true });

    return {
      revenueCents,
      orderCount: orderRows.length,
      openOrders: orderRows.filter((o: any) => o.status !== "delivered" && o.status !== "cancelled")
        .length,
      productCount: (products.data ?? []).length,
      publishedProducts: (products.data ?? []).filter((p: any) => p.status === "published").length,
      merchantCount: (merchants.data ?? []).length,
      pendingMerchants: (merchants.data ?? []).filter((m: any) => m.status === "pending").length,
      userCount: userCount ?? 0,
    };
  });

export const adminListOrders = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context as Ctx);
    const { data, error } = await context.supabase
      .from("orders")
      .select(
        "id, reference, status, total_cents, shipping_name, shipping_email, shipping_city, shipping_country, shipping_method, created_at, order_items(id, name, designer, size, quantity, unit_price_cents)",
      )
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

const ORDER_STATUS = ["confirmed", "preparing", "in_transit", "delivered", "cancelled"] as const;

export const adminUpdateOrderStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ id: z.string().uuid(), status: z.enum(ORDER_STATUS) }).parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context as Ctx);
    const { error } = await context.supabase
      .from("orders")
      .update({ status: data.status })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminListProducts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context as Ctx);
    const { data, error } = await context.supabase
      .from("products")
      .select(
        "id, name, slug, status, is_featured, is_new_arrival, created_at, merchants(name), original_price, discounted_price, currency, product_variants(color_name,color_hex,size,stock_quantity,original_price,discounted_price,is_active), product_images(color_name,image_url,image_public_id,is_primary,display_order)",
      )
      .order("created_at", { ascending: false })
      .limit(300);
    if (error) throw new Error(error.message);
    return (data ?? []).map(withNormalizedOptions);
  });

const PRODUCT_STATUS = ["draft", "published", "archived", "sold_out"] as const;

export const adminUpdateProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        id: z.string().uuid(),
        status: z.enum(PRODUCT_STATUS).optional(),
        is_featured: z.boolean().optional(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context as Ctx);
    const patch: { status?: (typeof PRODUCT_STATUS)[number]; is_featured?: boolean } = {};
    if (data.status) patch.status = data.status;
    if (typeof data.is_featured === "boolean") patch.is_featured = data.is_featured;
    if (Object.keys(patch).length === 0) return { ok: true };
    if (data.status === "published") {
      const { data: variants, error: variantError } = await context.supabase
        .from("product_variants")
        .select("is_active,stock_quantity,original_price")
        .eq("product_id", data.id);
      if (variantError) throw new Error(variantError.message);
      if (
        !(variants ?? []).some(
          (variant) =>
            variant.is_active && variant.stock_quantity > 0 && variant.original_price != null,
        )
      ) {
        throw new Error("Add stock and variant pricing before publishing");
      }
    }
    const { error } = await context.supabase.from("products").update(patch).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminListMerchants = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context as Ctx);
    const { data, error } = await context.supabase
      .from("merchants")
      .select(
        "id, name, slug, city, country, email, phone, website_url, instagram_url, short_description, description, logo_url, logo_public_id, cover_image_url, cover_image_public_id, status, is_active, is_featured, created_at",
      )
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

const MERCHANT_STATUS = ["pending", "approved", "rejected", "suspended"] as const;

export const adminUpdateMerchant = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        id: z.string().uuid(),
        status: z.enum(MERCHANT_STATUS).optional(),
        is_active: z.boolean().optional(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context as Ctx);
    const patch: { status?: (typeof MERCHANT_STATUS)[number]; is_active?: boolean } = {};
    if (data.status) patch.status = data.status;
    if (typeof data.is_active === "boolean") patch.is_active = data.is_active;
    if (Object.keys(patch).length === 0) return { ok: true };
    const { error } = await context.supabase.from("merchants").update(patch).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminListUsers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context as Ctx);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: authUsers, error } = await supabaseAdmin.auth.admin.listUsers({ perPage: 200 });
    if (error) throw new Error(error.message);

    const { data: roles } = await context.supabase.from("user_roles").select("user_id, role");
    const byUser = new Map<string, string[]>();
    for (const r of roles ?? []) {
      byUser.set(r.user_id, [...(byUser.get(r.user_id) ?? []), r.role]);
    }

    return authUsers.users.map((u) => ({
      id: u.id,
      email: u.email ?? "",
      createdAt: u.created_at,
      lastSignInAt: u.last_sign_in_at ?? null,
      roles: byUser.get(u.id) ?? [],
    }));
  });

const ROLES = ["customer", "merchant", "editor", "admin"] as const;

export const adminSetUserRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ userId: z.string().uuid(), role: z.enum(ROLES), grant: z.boolean() }).parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context as Ctx);
    if (!data.grant && data.role === "admin" && data.userId === context.userId) {
      throw new Error("You cannot remove your own admin access");
    }
    const sb = context.supabase;
    if (data.grant) {
      const { error } = await sb
        .from("user_roles")
        .upsert({ user_id: data.userId, role: data.role }, { onConflict: "user_id,role" });
      if (error) throw new Error(error.message);
    } else {
      const { error } = await sb
        .from("user_roles")
        .delete()
        .eq("user_id", data.userId)
        .eq("role", data.role);
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });
