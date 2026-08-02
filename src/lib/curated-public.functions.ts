/* eslint-disable @typescript-eslint/no-explicit-any */
import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import type { CuratedPageData } from "./curated-public.types";
import type { Product } from "@/components/ProductCard";
import { normalizedProductOptions } from "./product-options";
import { resolveProductPrice } from "./sale-pricing";

function serverClient() {
  const key = process.env.SUPABASE_PUBLISHABLE_KEY!;
  return createClient<Database>(process.env.SUPABASE_URL!, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`)
          h.delete("Authorization");
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

const PRODUCT_SELECT = `
  id, name, slug, short_description, description, condition, condition_notes, composition,
  season, is_featured, is_new_arrival, created_at, status, original_price, discounted_price, currency, sku, external_product_url,
  categories:category_id ( slug, name ),
  brands:brand_id ( name, slug ),
  merchants:merchant_id ( name, slug, city, status, is_active ),
  product_variants ( id, color_name, color_hex, size, stock_quantity, original_price, discounted_price, is_active ),
  product_images ( image_url, image_public_id, color_name, is_primary, display_order ),
  sale_products ( discount_type, discount_base, discount_value, sales ( id, name, is_active, starts_at, ends_at ) )
`;

function fmt(n: number) {
  return `$${Math.round(n).toLocaleString("en-AU")}`;
}

function mapProductItem(row: any): Product | null {
  if (!row || row.status === "draft" || row.status === "archived") return null;

  const resolvedPrices = (row.product_variants ?? [])
    .filter(
      (variant: any) =>
        variant.is_active && variant.stock_quantity > 0 && variant.original_price != null,
    )
    .map((variant: any) =>
      resolveProductPrice({
        originalPrice: Number(variant.original_price),
        currentPrice: Number(variant.discounted_price ?? variant.original_price),
        currency: row.currency ?? "AUD",
        sales: row.sale_products ?? [],
      }),
    );
  const priceSummary = resolvedPrices.length
    ? {
        lowest: resolvedPrices.reduce((best: any, price: any) =>
          price.effectivePrice < best.effectivePrice ? price : best,
        ),
        hasRange: new Set(resolvedPrices.map((price: any) => price.effectivePrice)).size > 1,
      }
    : null;
  if (!priceSummary) return null;
  const options = normalizedProductOptions(row);
  const defaultColor = options.find((o: any) => o.isDefault) ?? options[0];
  const {
    originalPrice: original,
    effectivePrice: priceValue,
    effectiveDiscountPercentage,
  } = priceSummary.lowest;
  const reduction = effectiveDiscountPercentage ?? 0;

  const colorImages = defaultColor?.images ?? [];
  const sortedImages = [...colorImages].sort(
    (a: any, b: any) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0),
  );
  const gallery: string[] = sortedImages.map((i: any) => i.url);
  const image = sortedImages.find((i: any) => i.isPrimary)?.url ?? gallery[0] ?? "";
  const designer = row.brands?.name ?? "DesignerSale";

  const CONDITION_LABEL: Record<string, string> = {
    new: "New season",
    new_with_tags: "New season",
    new_without_tags: "New season",
    excellent: "Archive",
    very_good: "Sample",
    good: "Sample",
    fair: "Sample",
  };
  const condition = CONDITION_LABEL[row.condition] ?? "New season";

  const availableSizes = (defaultColor?.sizes ?? [])
    .filter((s: any) => s.available)
    .map((s: any) => s.name);
  const size = availableSizes.join(", ") || "No sizes available";

  const addedDaysAgo = Math.max(
    0,
    Math.round((Date.now() - new Date(row.created_at).getTime()) / 86_400_000),
  );

  return {
    id: row.slug || row.id,
    name: row.name,
    designer,
    price: `${priceSummary.hasRange ? "From " : ""}${fmt(priceValue)}`,
    was: reduction ? fmt(original) : undefined,
    badge: priceSummary.lowest.hasActiveSale
      ? `${Math.round(reduction)}% off · SALE`
      : reduction >= 55
        ? "Final pieces"
        : reduction === 0
          ? "New in"
          : `${Math.round(reduction)}% off`,
    image,
    alt: row.short_description ?? `${row.name} by ${designer}`,
    reduction,
    priceValue,
    stock: (defaultColor?.sizes ?? []).reduce(
      (sum: number, size: any) => sum + (size.stock ?? 0),
      0,
    ),
    colour: defaultColor?.name ?? "Ivory",
    size,
    condition,
    addedDaysAgo,
  };
}

export const getPublishedCuratedPageBySlug = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => {
    if (typeof data === "string") return { slug: data, isPreview: false };
    const obj = (data as any) || {};
    return {
      slug: String(obj.slug || ""),
      isPreview: Boolean(obj.isPreview),
    };
  })
  .handler(async ({ data }): Promise<CuratedPageData | null> => {
    const { slug, isPreview } = data;
    if (!slug) return null;

    const supabase = serverClient();

    const detailSelect = `
      id, title, slug, subtitle, description, hero_image_url, mobile_hero_image_url,
      hero_image_public_id, mobile_hero_image_public_id, status, seo_title, seo_description, published_at,
      curated_page_products (
        display_order,
        products (${PRODUCT_SELECT})
      )
    `;

    let query = supabase.from("curated_pages").select(detailSelect).eq("slug", slug);

    if (!isPreview) {
      query = query.eq("status", "published");
    }

    const { data: pageRow, error } = await query.maybeSingle();

    if (error) {
      console.error("[getPublishedCuratedPageBySlug] Supabase Error:", error);
      throw new Error(error.message);
    }

    if (!pageRow) return null;

    const rawProducts = [...(pageRow.curated_page_products ?? [])]
      .sort((a: any, b: any) => (a.display_order ?? 0) - (b.display_order ?? 0))
      .map((item: any) => mapProductItem(item.products))
      .filter((p): p is Product => p !== null);

    return {
      id: pageRow.id,
      title: pageRow.title,
      slug: pageRow.slug,
      subtitle: pageRow.subtitle ?? null,
      description: pageRow.description ?? null,
      heroImageUrl: pageRow.hero_image_url ?? null,
      mobileHeroImageUrl: pageRow.mobile_hero_image_url ?? pageRow.hero_image_url ?? null,
      heroImagePublicId: pageRow.hero_image_public_id ?? null,
      mobileHeroImagePublicId: pageRow.mobile_hero_image_public_id ?? null,
      seoTitle: pageRow.seo_title ?? pageRow.title,
      seoDescription: pageRow.seo_description ?? pageRow.subtitle ?? pageRow.description ?? null,
      publishedAt: pageRow.published_at ?? null,
      status: pageRow.status as "draft" | "published" | "archived",
      products: rawProducts,
    };
  });
