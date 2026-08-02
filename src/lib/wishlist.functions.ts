import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { mapItem } from "@/lib/catalog.functions";

/* eslint-disable @typescript-eslint/no-explicit-any */
async function getOrCreateDefaultWishlist(sb: any, userId: string): Promise<string> {
  const { data: existing } = await sb
    .from("wishlists")
    .select("id")
    .eq("user_id", userId)
    .eq("is_default", true)
    .maybeSingle();

  if (existing?.id) return existing.id;

  const { data: created, error } = await sb
    .from("wishlists")
    .insert({ user_id: userId, name: "My Wishlist", is_default: true })
    .select("id")
    .single();

  if (error) throw new Error(error.message);
  return created.id;
}

export const getUserWishlist = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const sb = context.supabase;
    const userId = context.userId;
    const wishlistId = await getOrCreateDefaultWishlist(sb, userId);

    const SELECT = `
      id, name, slug, short_description, description, condition, condition_notes, composition,
      season, is_featured, is_new_arrival, created_at, original_price, discounted_price, currency, sku, external_product_url,
      materials, measurements, tags, fit, pattern, neckline, sleeve_length, dress_length, gender,
      categories:category_id ( slug, name ),
      brands:brand_id ( name, slug ),
      merchants:merchant_id ( name, slug, city ),
      product_variants ( id, color_name, color_hex, size, sku, barcode, stock_quantity, original_price, discounted_price, is_active ),
      product_images ( id, variant_id, color_name, image_url, image_public_id, alt_text, display_order, is_primary ),
      sale_products ( discount_type, discount_base, discount_value, sale_price, sales ( id, name, slug, is_active, starts_at, ends_at ) )
    `;

    const { data: items, error } = await sb
      .from("wishlist_items")
      .select(`id, product_id, created_at, products(${SELECT})`)
      .eq("wishlist_id", wishlistId)
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);

    return (items ?? []).map((item: any) => ({
      id: item.id,
      product_id: item.product_id,
      created_at: item.created_at,
      product: item.products?.product_variants?.some(
        (variant: any) =>
          variant.is_active && variant.stock_quantity > 0 && variant.original_price != null,
      )
        ? mapItem(item.products)
        : null,
    }));
  });

export const toggleWishlist = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        productIdOrSlug: z.string().min(1),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const sb = context.supabase;
    const userId = context.userId;

    // Resolve product UUID if slug passed
    let productId = data.productIdOrSlug;
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      productId,
    );
    if (!isUuid) {
      const { data: prod } = await sb
        .from("products")
        .select("id")
        .eq("slug", data.productIdOrSlug)
        .maybeSingle();
      if (!prod) throw new Error("Product not found");
      productId = prod.id;
    }

    const wishlistId = await getOrCreateDefaultWishlist(sb, userId);

    const { data: existing, error: lookupError } = await sb
      .from("wishlist_items")
      .select("id")
      .eq("wishlist_id", wishlistId)
      .eq("product_id", productId)
      .maybeSingle();
    if (lookupError) throw new Error(lookupError.message);

    if (existing) {
      const { error } = await sb.from("wishlist_items").delete().eq("id", existing.id);
      if (error) throw new Error(error.message);
      return { saved: false, message: "Removed from wishlist" };
    } else {
      const { error } = await sb.from("wishlist_items").insert({
        wishlist_id: wishlistId,
        product_id: productId,
      });
      if (error) throw new Error(error.message);
      return { saved: true, message: "Saved to wishlist" };
    }
  });

export const removeFromWishlist = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ itemId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const sb = context.supabase;
    const { error } = await sb.from("wishlist_items").delete().eq("id", data.itemId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
