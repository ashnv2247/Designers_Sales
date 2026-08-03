import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

import type { Database } from "@/integrations/supabase/types";
import { isSellableVariant } from "@/lib/pricing";
import { resolveProductPrice } from "@/lib/sale-pricing";
import {
  homepageSlides,
  designerSpotlights,
  homepageStats,
  boutiqueAssets,
  authHero,
} from "@/lib/homepage-static-data";

export interface DbCatalogItem {
  id: string; // slug
  dbId: string; // database uuid
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
  materials: string[];
  variants: Database["public"]["Tables"]["product_variants"]["Row"][];
  images: Database["public"]["Tables"]["product_images"]["Row"][];
  original_price: number;
  discounted_price: number | null;
  saleInfo?: { id: string; name: string; slug: string };
  saleRelations: any[];
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
  season, is_featured, is_new_arrival, created_at, original_price, discounted_price, currency, sku, external_product_url,
  materials, measurements, tags, fit, pattern, neckline, sleeve_length, dress_length, gender,
  categories:category_id ( slug, name ),
  brands:brand_id ( name, slug ),
  merchants:merchant_id ( name, slug, city ),
  product_variants ( id, color_name, color_hex, size, sku, barcode, stock_quantity, original_price, discounted_price, is_active ),
  product_images ( id, variant_id, color_name, image_url, image_public_id, alt_text, display_order, is_primary ),
  sale_products ( discount_type, discount_base, discount_value, sale_price, sales ( id, name, slug, is_active, starts_at, ends_at ) )
`;

/* eslint-disable @typescript-eslint/no-explicit-any */
export function mapItem(row: any): DbCatalogItem {
  const variants = (row.product_variants as any[]) ?? [];
  const images = (row.product_images as any[]) ?? [];
  const activeVariants = variants.filter(isSellableVariant);

  // Group variants by color
  const defaultVariant =
    activeVariants.find((v) => v.stock_quantity > 0) ?? activeVariants[0] ?? variants[0];
  const defaultColorName = defaultVariant?.color_name ?? "Default";

  const saleRelations = row.sale_products ?? [];
  const resolvedPrices = activeVariants.map((variant) =>
    resolveProductPrice({
      originalPrice: Number(variant.original_price),
      currentPrice: Number(variant.discounted_price ?? variant.original_price),
      currency: row.currency ?? "AUD",
      sales: saleRelations,
    }),
  );
  if (!resolvedPrices.length) throw new Error(`Product ${row.id} has no sellable priced variant`);
  const lowestPrice = resolvedPrices.reduce((best, price) =>
    price.effectivePrice < best.effectivePrice ? price : best,
  );
  const hasRange = new Set(resolvedPrices.map((price) => price.effectivePrice)).size > 1;
  const priceString = `${hasRange ? "From " : ""}${fmt(lowestPrice.effectivePrice)}`;
  const wasString = lowestPrice.totalSaving > 0 ? fmt(lowestPrice.originalPrice) : undefined;
  const reduction = Math.round(lowestPrice.effectiveDiscountPercentage);

  // Sorting Images prioritizing color-specific images
  const colorImages = images.filter((img) => img.color_name === defaultColorName);
  const generalImages = images.filter((img) => !img.color_name);
  const sortedImages = [...colorImages, ...generalImages].sort(
    (a: any, b: any) => (a.display_order ?? 0) - (b.display_order ?? 0),
  );

  const gallery: string[] = sortedImages.map((i: any) => i.image_url);
  const primaryImg = images.find((i: any) => i.is_primary) ?? sortedImages[0];
  const image = primaryImg?.image_url ?? gallery[0] ?? "";

  const designer = row.brands?.name ?? "DesignerSale";
  const boutique = row.merchants?.name ?? "DesignerSale";
  const condition = CONDITION_LABEL[row.condition] ?? "New season";
  const addedDaysAgo = Math.max(
    0,
    Math.round((Date.now() - new Date(row.created_at).getTime()) / 86_400_000),
  );

  const activeSaleRelation = saleRelations.find(
    (relation: any) => relation.sales?.id === lowestPrice.activeSaleId,
  );
  const activeSale = activeSaleRelation?.sales;

  const tags = row.tags ?? [];
  const materials = row.materials ?? [];

  const availableSizes = activeVariants
    .filter((v: any) => v.color_name === defaultColorName && v.stock_quantity > 0)
    .map((v: any) => v.size);

  const measurementsObj = row.measurements ?? {};
  const measurements = Object.entries(measurementsObj).map(([label, value]) => ({
    label,
    value: String(value),
  }));

  const allSizes = [
    ...new Set(
      activeVariants.filter((v: any) => v.color_name === defaultColorName).map((v: any) => v.size),
    ),
  ];
  const totalStock = activeVariants.reduce((sum, v) => sum + (v.stock_quantity ?? 0), 0);

  return {
    id: row.slug,
    dbId: row.id,
    name: row.name,
    designer,
    designerSlug: row.brands?.slug ?? designer,
    boutique,
    size: availableSizes.join(", ") || "No sizes available",
    colour: defaultColorName,
    condition,
    price: priceString,
    was: wasString,
    badge: lowestPrice.hasActiveSale
      ? `${reduction}% off · SALE`
      : reduction >= 55
        ? "Final pieces"
        : reduction === 0
          ? "New in"
          : `${reduction}% off`,
    image,
    alt: row.short_description ?? `${row.name} by ${designer}`,
    priceValue: lowestPrice.effectivePrice,
    reduction,
    addedDaysAgo,
    category: row.categories?.slug ?? "dresses",
    gallery: gallery.length ? gallery : [image],
    measurements,
    composition: row.composition ?? "",
    conditionNote: row.condition_notes ?? "",
    sizes: allSizes,
    stock: totalStock,
    provenance: {
      atelier: boutique,
      city: row.merchants?.city ?? "Sydney",
      year: row.season ?? "",
      note: row.description ?? "",
    },
    tags,
    materials,
    variants,
    images,
    saleRelations,
    original_price: Number(row.original_price),
    discounted_price: row.discounted_price != null ? Number(row.discounted_price) : null,
    ...(activeSale && {
      saleInfo: { id: activeSale.id, name: activeSale.name, slug: activeSale.slug },
    }),
  };
}

export const getCatalog = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = serverClient();
  const { data, error } = await supabase
    .from("products")
    .select(SELECT)
    .in("status", ["published", "sold_out"])
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? [])
    .filter((row: any) => (row.product_variants ?? []).some(isSellableVariant))
    .map(mapItem);
});

export const getVariantQuote = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => z.object({ variantId: z.string().uuid() }).parse(data))
  .handler(async ({ data }) => {
    const { data: variant, error } = await serverClient()
      .from("product_variants")
      .select(
        `id,stock_quantity,is_active,original_price,discounted_price,
         products!inner(id,status,currency,sale_products(discount_type,discount_base,discount_value,sales(id,name,is_active,starts_at,ends_at)))`,
      )
      .eq("id", data.variantId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    const product: any = variant?.products;
    if (
      !variant ||
      !variant.is_active ||
      variant.stock_quantity <= 0 ||
      variant.original_price == null ||
      product?.status !== "published"
    ) {
      throw new Error("This option is no longer available.");
    }
    const price = resolveProductPrice({
      originalPrice: Number(variant.original_price),
      currentPrice: Number(variant.discounted_price ?? variant.original_price),
      currency: product.currency ?? "AUD",
      sales: product.sale_products ?? [],
    });
    return {
      unitPriceCents: Math.round(price.effectivePrice * 100),
      originalPriceCents: Math.round(price.originalPrice * 100),
      currentPriceCents: Math.round(price.currentPrice * 100),
      activeSaleName: price.activeSaleName,
    };
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
      .in("status", ["published", "sold_out"]),
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
  const [
    { data: page, error: pageError },
    { data: categoriesData, error: catError },
    { data: merchantsData, error: merchError },
    { data: bannersData, error: bannerError },
  ] = await Promise.all([
    supabase
      .from("curated_pages")
      .select(`id, title, curated_page_products(display_order, products(${SELECT}))`)
      .eq("slug", "home")
      .eq("status", "published")
      .maybeSingle(),
    supabase.from("categories").select("id,name,slug,image_url,description"),
    supabase
      .from("merchants")
      .select("id,name,slug,city,country,logo_url")
      .eq("status", "approved")
      .eq("is_active", true)
      .eq("is_featured", true),
    supabase
      .from("banners")
      .select(
        "id,name,eyebrow,headline,highlighted_text,description,image_url,mobile_image_url,background_color,accent_color,glow_color,cta_label,target_path,display_order",
      )
      .eq("is_active", true)
      .or(`starts_at.is.null,starts_at.lte.${new Date().toISOString()}`)
      .or(`ends_at.is.null,ends_at.gt.${new Date().toISOString()}`)
      .order("display_order"),
  ]);

  if (pageError) throw new Error(pageError.message);
  if (catError) throw new Error(catError.message);
  if (merchError) throw new Error(merchError.message);
  // Banners deliberately degrade to the bundled hero when the table is unavailable.

  const homeProducts = (page?.curated_page_products ?? [])
    .sort((a: any, b: any) => a.display_order - b.display_order)
    .map((item: any) =>
      item.products?.product_variants?.some(isSellableVariant) ? mapItem(item.products) : null,
    )
    .filter(Boolean);

  const slides =
    !bannerError && bannersData?.length
      ? bannersData.map((banner: any) => ({
          id: banner.id,
          image: banner.image_url,
          mobileImage: banner.mobile_image_url,
          kicker: banner.eyebrow ?? "",
          headline: banner.headline,
          highlightedText: banner.highlighted_text ?? "",
          description: banner.description ?? "",
          bg: banner.background_color,
          accent: banner.accent_color,
          glow: banner.glow_color ?? banner.background_color,
          ctaLabel: banner.cta_label,
          targetPath: banner.target_path,
        }))
      : homepageSlides.map((slide) => ({
          ...slide,
          headline: "Designer Fashion",
          highlightedText: "Up To 70% Off",
          description:
            "Discover authentic luxury fashion from Australia's leading boutique network at exclusive clearance prices. 100% authenticated, delivered to your door.",
          ctaLabel: "Shop Sale",
          targetPath: "/#search-section",
        }));

  return {
    slides,
    categories: (categoriesData ?? []).map((cat: any) => ({
      ...cat,
      image: cat.image_url,
      alt: cat.name,
      count: "",
    })),
    products: homeProducts,
    designers: designerSpotlights,
    merchants: merchantsData ?? [],
    stats: homepageStats,
    assets: boutiqueAssets,
  };
});

export const getSiteAsset = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => String(data))
  .handler(async ({ data }) => {
    if (data === "auth-hero") {
      return authHero;
    }
    return null;
  });

export const getCuratedPageBySlug = createServerFn({ method: "GET" })
  .inputValidator((slug: unknown) => String(slug))
  .handler(async ({ data: slug }) => {
    const supabase = serverClient();
    const { data: page, error } = await supabase
      .from("curated_pages")
      .select(
        `id,title,subtitle,description,hero_image_url,mobile_hero_image_url,
         curated_page_products(display_order,products(${SELECT}))`,
      )
      .eq("slug", slug)
      .eq("status", "published")
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!page) return null;

    const mappedProducts = (page.curated_page_products ?? [])
      .sort((a: any, b: any) => (a.display_order ?? 0) - (b.display_order ?? 0))
      .map((cpp: any) =>
        cpp.products?.product_variants?.some(isSellableVariant) ? mapItem(cpp.products) : null,
      )
      .filter((p: DbCatalogItem | null): p is DbCatalogItem => p !== null);

    return {
      id: page.id,
      title: page.title,
      subtitle: page.subtitle,
      description: page.description,
      hero_image_url: page.hero_image_url,
      mobile_hero_image_url: page.mobile_hero_image_url,
      products: mappedProducts,
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

export const getActiveCampaign = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = serverClient();
  const nowStr = new Date().toISOString();
  const { data: sale, error } = await supabase
    .from("sales")
    .select(
      `
      id, name, slug, description, banner_image_url, mobile_banner_image_url, starts_at, ends_at, is_featured, is_active,
      sale_products (
        product_id,
        display_order
      )
    `,
    )
    .eq("is_active", true)
    .or(`starts_at.is.null,starts_at.lte.${nowStr}`)
    .or(`ends_at.is.null,ends_at.gt.${nowStr}`)
    .order("is_featured", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return sale;
});

export const getBrandsList = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = serverClient();
  const { data, error } = await supabase
    .from("brands")
    .select("id, name, slug, logo_url, is_featured, is_active")
    .eq("is_active", true)
    .order("name");
  if (error) throw new Error(error.message);
  return data ?? [];
});
