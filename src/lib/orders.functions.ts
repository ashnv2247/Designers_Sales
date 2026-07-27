import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const lineSchema = z.object({
  id: z.string().min(1).max(80),
  name: z.string().min(1).max(160),
  designer: z.string().min(1).max(120),
  image: z.string().max(600).optional(),
  size: z.string().max(40).optional(),
  colour: z.string().max(40).optional(),
  unitPriceCents: z.number().int().min(0).max(100_000_00),
  quantity: z.number().int().min(1).max(9),
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

    const subtotal = data.lines.reduce((n, l) => n + l.unitPriceCents * l.quantity, 0);
    const shipping = SHIPPING_CENTS[data.shippingMethod] ?? 0;

    const { data: order, error } = await supabase
      .from("orders")
      .insert({
        user_id: userId,
        reference: reference(),
        subtotal_cents: subtotal,
        shipping_cents: shipping,
        total_cents: subtotal + shipping,
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

    if (error || !order) throw new Error(error?.message ?? "Could not place order");

    const { error: itemsError } = await supabase.from("order_items").insert(
      data.lines.map((l) => ({
        order_id: order.id,
        user_id: userId,
        product_id: l.id,
        name: l.name,
        designer: l.designer,
        size: l.size ?? null,
        colour: l.colour ?? null,
        image: l.image ?? null,
        unit_price_cents: l.unitPriceCents,
        quantity: l.quantity,
      })),
    );
    if (itemsError) throw new Error(itemsError.message);

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