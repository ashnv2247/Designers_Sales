import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";

import type { Database } from "@/integrations/supabase/types";

export interface DbCatalogItem {
  id: string;
  name: string;
  designer: string;
  designerSlug: string;
  boutique: string;
  size: string;
  colour: string;
  condition: string;
  price: string;
  was?: string;
  badge?: string;
  image: string;
  alt: string;
  priceValue: number;
  reduction: number;
  addedDaysAgo: number;
  category: string;
  gallery: string[];
  measurements: { label: string; value: string }[];
  composition: string;
  conditionNote: string;
  sizes: string[];
  stock: number;
  provenance: { atelier: string; city: string; year: string; note: string };
}

export interface DbMerchant {
  id: string;
  name: string;
  slug: string;
  city: string;
  country: string;
  shortDescription: string;
  logoUrl: string | null;
  count: number;
  categories: string[];
}

const CONDITION_LABEL: Record<string, string> = {
  new: "New season",
  new_with_tags: "New season",
  new_without_tags: "New season",
  excellent: "Archive",
  very_good: "Sample",
  good: "Sample",
  fair: "Sample",
};

const fmt = (n: number) => `$${Math.round(n).toLocaleString("en-AU")}`;

function serverClient() {
  const key = process.env.SUPABASE_PUBLISHABLE_KEY!;
  return createClient<Database>(process.env.SUPABASE_URL!, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

const SELECT = `
  id, name, slug, short_description, description, condition, condition_notes, composition,
  season, model_wears_size, is_featured, is_new_arrival, created_at,
  categories:category_id ( slug, name ),
  brands:brand_id ( name, slug ),
  merchants:merchant_id ( name, slug, city ),
  product_images ( image_url, alt_text, display_order, is_primary ),
  product_measurements ( measurement_name, measurement_value, unit ),
  product_variants ( name, sizes, original_price, discounted_price, stock_quantity, is_default, colors:color_id ( name ) )
`;

/* eslint-disable @typescript-eslint/no-explicit-any */
function mapItem(row: any): DbCatalogItem {
  const variant = row.product_variants?.find((v: any) => v.is_default) ?? row.product_variants?.[0];
  const original = Number(variant?.original_price ?? 0);
  const discounted = variant?.discounted_price != null ? Number(variant.discounted_price) : null;
  const priceValue = discounted ?? original;
  const reduction = discounted && original > 0 ? Math.round((1 - discounted / original) * 100) : 0;
  const images = [...(row.product_images ?? [])].sort(
    (a: any, b: any) => a.display_order - b.display_order,
  );
  const gallery: string[] = images.map((i: any) => i.image_url);
  const image = images.find((i: any) => i.is_primary)?.image_url ?? gallery[0] ?? "";
  const designer = row.brands?.name ?? "DesignerSale";
  const boutique = row.merchants?.name ?? "DesignerSale";
  const condition = CONDITION_LABEL[row.condition] ?? "New season";
  const addedDaysAgo = Math.max(
    0,
    Math.round((Date.now() - new Date(row.created_at).getTime()) / 86_400_000),
  );

  return {
    id: row.slug,
    name: row.name,
    designer,
    designerSlug: designer,
    boutique,
    size: row.model_wears_size ?? variant?.sizes?.[0] ?? "One size",
    colour: variant?.colors?.name ?? variant?.name ?? "Ivory",
    condition,
    price: fmt(priceValue),
    was: reduction ? fmt(original) : undefined,
    badge: reduction >= 55 ? "Final pieces" : reduction === 0 ? "New in" : `${reduction}% off`,
    image,
    alt: row.short_description ?? `${row.name} by ${designer}`,
    priceValue,
    reduction,
    addedDaysAgo,
    category: row.categories?.slug ?? "dresses",
    gallery: gallery.length ? gallery : [image],
    measurements: (row.product_measurements ?? []).map((m: any) => ({
      label: m.measurement_name,
      value: `${Number(m.measurement_value)} ${m.unit}`,
    })),
    composition: row.composition ?? "",
    conditionNote: row.condition_notes ?? "",
    sizes: variant?.sizes ?? ["One size"],
    stock: variant?.stock_quantity ?? 0,
    provenance: {
      atelier: boutique,
      city: row.merchants?.city ?? "Sydney",
      year: row.season ?? "",
      note: row.description ?? "",
    },
  };
}

export const getCatalog = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = serverClient();
  const { data, error } = await supabase
    .from("products")
    .select(SELECT)
    .eq("status", "published")
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []).map(mapItem);
});

export const getMerchantDirectory = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = serverClient();
  const [{ data: merchants, error }, { data: products, error: productError }] = await Promise.all([
    supabase
      .from("merchants")
      .select("id, name, slug, city, country, short_description, logo_url")
      .eq("is_active", true)
      .order("name"),
    supabase
      .from("products")
      .select("merchant_id, categories:category_id ( slug )")
      .eq("status", "published"),
  ]);

  if (error) throw new Error(error.message);
  if (productError) throw new Error(productError.message);

  return (merchants ?? []).map((m): DbMerchant => {
    const owned = (products ?? []).filter((p: any) => p.merchant_id === m.id);
    const categories = [...new Set(owned.map((p: any) => p.categories?.slug).filter(Boolean))] as string[];
    return {
      id: m.id,
      name: m.name,
      slug: m.slug,
      city: m.city ?? "",
      country: m.country ?? "",
      shortDescription: m.short_description ?? "",
      logoUrl: m.logo_url,
      count: owned.length,
      categories,
    };
  });
});
