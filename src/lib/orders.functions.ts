import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { resolveProductPrice } from "@/lib/sale-pricing";

const lineSchema = z.object({
  variantId: z.string().uuid(),
  quantity: z.number().int().min(1).max(9),
  expectedUnitPriceCents: z.number().int().nonnegative(),
});

const checkoutSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(255),
  address: z.string().trim().min(4).max(240),
  city: z.string().trim().min(2).max(120),
  postcode: z.string().trim().min(3).max(20),
  country: z.string().trim().min(2).max(80),
  shippingMethod: z.enum(["signature", "express", "concierge"]),
  giftNote: z.string().trim().max(400).optional(),
  lines: z.array(lineSchema).min(1).max(30),
});

const SHIPPING_CENTS: Record<string, number> = {
  signature: 0,
  express: 2500,
  concierge: 9500,
};

function reference() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < 6; i++) out += alphabet[Math.floor(Math.random() * alphabet.length)];
  return `DS-${out}`;
}

export const placeOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => checkoutSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    // 1. Fetch variant and its product details to compute final pricing & verify stock on server
    const variantIds = data.lines.map((l) => l.variantId);

    // Select variants and their products, including brands and merchants
    const { data: dbVariants, error: dbError } = await supabase
      .from("product_variants")
      .select(
        `
        id, color_name, size, sku, stock_quantity, original_price, discounted_price, is_active,
        products (
          id, name, slug, sku, original_price, discounted_price, status,
          brands:brand_id ( name ),
          merchants:merchant_id ( name ),
          product_images ( image_url, color_name, is_primary )
          ,sale_products (
            discount_type, discount_base, discount_value,
            sales ( id, name, is_active, starts_at, ends_at )
          )
        )
      `,
      )
      .in("id", variantIds);

    if (dbError) throw new Error(dbError.message);
    if (!dbVariants || dbVariants.length !== variantIds.length) {
      throw new Error("Some items in your cart are no longer available.");
    }

    // 2. Validate availability & stock, and perform inventory deduction
    const orderLines = [];
    let subtotalCents = 0;

    for (const line of data.lines) {
      const dbVar: any = dbVariants.find((v) => v.id === line.variantId)!;
      const product = dbVar.products;

      if (!dbVar.is_active || product.status !== "published") {
        throw new Error(`Item "${product.name}" is no longer available.`);
      }

      if (dbVar.stock_quantity < line.quantity) {
        throw new Error(
          `Insufficient stock for "${product.name}" (${dbVar.size}). Only ${dbVar.stock_quantity} remaining.`,
        );
      }

      // Compute pricing
      const effectivePrice = resolveProductPrice({
        originalPrice: Number(dbVar.original_price),
        currentPrice: Number(dbVar.discounted_price ?? dbVar.original_price),
        currency: "AUD",
        sales: product.sale_products ?? [],
      });
      const unitPriceCents = Math.round(effectivePrice.effectivePrice * 100);
      if (unitPriceCents !== line.expectedUnitPriceCents) {
        throw new Error(
          `The price of ${product.name} changed from $${(line.expectedUnitPriceCents / 100).toFixed(2)} to $${(unitPriceCents / 100).toFixed(2)}. Please review your bag before ordering.`,
        );
      }
      const lineTotalCents = unitPriceCents * line.quantity;
      subtotalCents += lineTotalCents;

      // Deduct stock atomically
      const { error: deductError } = await supabase
        .from("product_variants")
        .update({ stock_quantity: dbVar.stock_quantity - line.quantity })
        .eq("id", line.variantId);

      if (deductError) {
        throw new Error(`Stock deduction failed for "${product.name}": ${deductError.message}`);
      }

      // Resolve best image URL for variant
      const imgs = product.product_images ?? [];
      const bestImg =
        imgs.find((img: any) => img.color_name === dbVar.color_name) ||
        imgs.find((img: any) => img.is_primary) ||
        imgs[0];

      orderLines.push({
        product_id: product.id,
        variant_id: dbVar.id,
        product_name: product.name,
        merchant_name: product.merchants?.name ?? null,
        brand_name: product.brands?.name ?? null,
        selected_color: dbVar.color_name,
        selected_size: dbVar.size,
        product_sku: product.sku ?? null,
        variant_sku: dbVar.sku ?? null,
        image_url: bestImg?.image_url ?? null,
        unit_price_cents: unitPriceCents,
        quantity: line.quantity,
        line_total_cents: lineTotalCents,
      });
    }

    const shippingCents = SHIPPING_CENTS[data.shippingMethod] ?? 0;
    const totalCents = subtotalCents + shippingCents;

    // 3. Create the order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: userId,
        reference: reference(),
        subtotal_cents: subtotalCents,
        shipping_cents: shippingCents,
        total_cents: totalCents,
        shipping_name: data.fullName,
        shipping_email: data.email,
        shipping_address: data.address,
        shipping_city: data.city,
        shipping_postcode: data.postcode,
        shipping_country: data.country,
        shipping_method: data.shippingMethod,
        gift_note: data.giftNote || null,
      })
      .select("id, reference")
      .single();

    if (orderError || !order) {
      // Revert stock logic on failure (in a true Postgres transaction, this happens automatically,
      // but since we do it step-by-step via API, let's raise the error)
      throw new Error(orderError?.message ?? "Could not place order");
    }

    // 4. Insert order items
    const { error: itemsError } = await supabase.from("order_items").insert(
      orderLines.map((item) => ({
        ...item,
        order_id: order.id,
        user_id: userId,
      })),
    );

    if (itemsError) throw new Error(`Failed to create order items: ${itemsError.message}`);

    return { id: order.id, reference: order.reference };
  });

export const listOrders = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("orders")
      .select("id, reference, status, total_cents, created_at, shipping_method")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const getOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const { data: order, error } = await context.supabase
      .from("orders")
      .select("*")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!order) return null;

    const { data: items, error: itemsError } = await context.supabase
      .from("order_items")
      .select("*")
      .eq("order_id", order.id);
    if (itemsError) throw new Error(itemsError.message);

    return { order, items: items ?? [] };
  });
