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
  tags: string[];
  saleInfo?: { id: string; name: string; slug: string };
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
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`)
          h.delete("Authorization");
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
  product_variants ( id, name, sizes, original_price, discounted_price, stock_quantity, is_default, colors:color_id ( name ), sale_variants ( sales ( id, name, slug, is_active, starts_at, ends_at ) ) ),
  product_tags ( tags ( name, slug ) )
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

  const now = new Date();
  const activeSale = row.product_variants?.flatMap((v: any) => v.sale_variants ?? [])
    .map((sv: any) => sv.sales)
    .find((sale: any) => {
      if (!sale || !sale.is_active) return false;
      const starts = sale.starts_at ? new Date(sale.starts_at) : null;
      const ends = sale.ends_at ? new Date(sale.ends_at) : null;
      return (!starts || starts <= now) && (!ends || ends >= now);
    });

  const tags = (row.product_tags ?? []).map((pt: any) => pt.tags?.slug).filter(Boolean);

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
    tags,
    ...(activeSale && { saleInfo: { id: activeSale.id, name: activeSale.name, slug: activeSale.slug } }),
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
    const categories = [
      ...new Set(owned.map((p: any) => p.categories?.slug).filter(Boolean)),
    ] as string[];
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

export const getCatalogMetadata = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = serverClient();
  const [{ data: categories, error }, { data: brands, error: brandError }] = await Promise.all([
    supabase
      .from("categories")
      .select("id,name,slug,description,image_url,metadata,display_order")
      .eq("is_active", true)
      .order("display_order"),
    supabase.from("brands").select("id,name,slug").eq("is_active", true).order("name"),
  ]);
  if (error) throw new Error(error.message);
  if (brandError) throw new Error(brandError.message);
  return {
    categories: (categories ?? []).map((category: any) => ({
      slug: category.slug,
      name: category.name,
      kicker: category.metadata?.kicker ?? "",
      headline: category.metadata?.headline ?? category.name,
      standfirst: category.description ?? "",
      image: category.image_url ?? "",
      alt: category.name,
      editorial: category.metadata?.editorial ?? {
        eyebrow: "",
        title: category.name,
        body: category.description ?? "",
        image: category.image_url ?? "",
        alt: category.name,
        credit: "",
      },
    })),
    designers: (brands ?? []).map((brand) => brand.name),
  };
});

export const getHomepageContent = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = serverClient();
  const [{ data: page, error }, { data: assets, error: assetError }] = await Promise.all([
    supabase
      .from("curated_pages")
      .select(
        `id,title,curated_sections(id,title,subtitle,content,image_url,display_order,section_type,settings,
       curated_section_categories(display_order,categories(id,name,slug,image_url)),
       curated_section_products(display_order,products(${SELECT})),
       curated_section_merchants(display_order,merchants(id,name,slug,city,country,logo_url)))`,
      )
      .eq("slug", "home")
      .eq("status", "published")
      .single(),
    supabase
      .from("site_assets")
      .select("asset_key,image_url,alt_text")
      .in("asset_key", ["boutique-editorial-1", "boutique-editorial-2"]),
  ]);
  if (error) throw new Error(error.message);
  if (assetError) throw new Error(assetError.message);
  const sections = [...(page.curated_sections ?? [])].sort(
    (a: any, b: any) => a.display_order - b.display_order,
  );
  return {
    slides: sections
      .filter((section: any) => section.settings?.kind === "homepage-slide")
      .map((section: any) => ({
        ...section.settings,
        image: section.image_url,
        alt: section.title,
        kicker: section.subtitle,
      })),
    categories:
      sections
        .find((section: any) => section.settings?.kind === "homepage-categories")
        ?.curated_section_categories?.sort((a: any, b: any) => a.display_order - b.display_order)
        .map((item: any) => ({
          ...item.categories,
          image: item.categories?.image_url,
          alt: item.categories?.name,
          count: "",
        })) ?? [],
    products:
      sections
        .find((section: any) => section.settings?.kind === "homepage-products")
        ?.curated_section_products?.sort((a: any, b: any) => a.display_order - b.display_order)
        .map((item: any) => mapItem(item.products)) ?? [],
    designers: sections
      .filter((section: any) => section.settings?.kind === "designer-spotlight")
      .map((section: any) => ({
        ...section.settings,
        name: section.title,
        image: section.image_url,
        bio: section.content,
        alt: section.title,
        stats: [],
      })),
    merchants:
      sections
        .find((section: any) => section.settings?.kind === "homepage-merchants")
        ?.curated_section_merchants?.sort((a: any, b: any) => a.display_order - b.display_order)
        .map((item: any) => item.merchants) ?? [],
    stats:
      (
        sections.find((section: any) => section.settings?.kind === "homepage-stats")
          ?.settings as any
      )?.items ?? [],
    assets: Object.fromEntries((assets ?? []).map((asset) => [asset.asset_key, asset.image_url])),
  };
});

export const getSiteAsset = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => String(data))
  .handler(async ({ data }) => {
    const { data: asset, error } = await serverClient()
      .from("site_assets")
      .select("asset_key,image_url,alt_text")
      .eq("asset_key", data)
      .single();
    if (error) throw new Error(error.message);
    return asset;
  });

export const getCuratedPageBySlug = createServerFn({ method: "GET" })
  .inputValidator((slug: unknown) => String(slug))
  .handler(async ({ data: slug }) => {
    const supabase = serverClient();
    const { data: page, error } = await supabase
      .from("curated_pages")
      .select(
        `id,title,subtitle,description,hero_image_url,mobile_hero_image_url,curated_sections(id,title,subtitle,content,image_url,display_order,section_type,settings,
       curated_section_categories(display_order,categories(id,name,slug,image_url)),
       curated_section_products(display_order,products(${SELECT})),
       curated_section_merchants(display_order,merchants(id,name,slug,city,country,logo_url)))`
      )
      .eq("slug", slug)
      .eq("status", "published")
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!page) return null;

    const mappedSections = (page.curated_sections ?? []).map((section: any) => {
      if (section.section_type === "products" && section.curated_section_products) {
        return {
          ...section,
          curated_section_products: section.curated_section_products.map((csp: any) => ({
            ...csp,
            products: csp.products ? mapItem(csp.products) : null,
          })),
        };
      }
      return section;
    });

    return {
      ...page,
      curated_sections: mappedSections,
    };
  });

export const listPublicCuratedPages = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = serverClient();
  const { data, error } = await supabase
    .from("curated_pages")
    .select("id, title, slug, subtitle, description, hero_image_url")
    .eq("status", "published")
    .order("published_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
});
