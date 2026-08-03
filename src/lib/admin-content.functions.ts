import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

type Ctx = { supabase: any; userId: string };

async function assertAdmin(context: Ctx) {
  const { data, error } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "admin",
  });
  if (error) throw new Error("Could not verify permissions");
  if (!data) throw new Error("Forbidden");
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

async function cleanupCloudinary(publicIds: Array<string | null | undefined>) {
  const ids = publicIds.filter((id): id is string => Boolean(id) && !id!.includes("/seed/"));
  if (!ids.length) return;
  const { destroyCloudinaryImage } = await import("./cloudinary.server");
  for (const id of ids) {
    try {
      await destroyCloudinaryImage(id);
    } catch (error) {
      console.error(`[Cloudinary] Cleanup failed for ${id}`, error);
    }
  }
}

const uuid = z.string().uuid();
const optText = z
  .string()
  .trim()
  .optional()
  .transform((v) => (v ? v : null));

/* ------------------------------- reference data ------------------------------ */

export const adminGetRefs = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context as Ctx);
    const sb = context.supabase;
    const [merchants, brands, categories, productTypes, products] = await Promise.all([
      sb.from("merchants").select("id, name").order("name"),
      sb.from("brands").select("id, name").order("name"),
      sb.from("categories").select("id, name").order("name"),
      sb
        .from("product_types")
        .select("id, name, slug, category_id, is_active")
        .eq("is_active", true)
        .order("display_order"),
      sb
        .from("products")
        .select(
          "id,name,slug,sku,merchant_id,brand_id,category_id,product_type_id,status,currency,created_at,merchants(name),brands(name),categories(name),product_variants(id,original_price,discounted_price,stock_quantity,is_active),product_images(image_url,is_primary,display_order)",
        )
        .order("name")
        .limit(500),
    ]);
    const referenceError =
      merchants.error ?? brands.error ?? categories.error ?? productTypes.error ?? products.error;
    if (referenceError) {
      throw new Error(`Could not load admin reference data: ${referenceError.message}`);
    }
    return {
      merchants: merchants.data ?? [],
      brands: brands.data ?? [],
      categories: categories.data ?? [],
      productTypes: productTypes.data ?? [],
      products: products.data ?? [],
    };
  });

/* --------------------------------- banners --------------------------------- */

const bannerInput = z
  .object({
    name: z.string().trim().min(2).max(120),
    eyebrow: optText,
    headline: z.string().trim().min(2).max(220),
    highlighted_text: optText,
    description: optText,
    image_url: z.string().url(),
    image_public_id: optText,
    mobile_image_url: optText,
    mobile_image_public_id: optText,
    background_color: z.string().trim().min(1).max(80),
    accent_color: z.string().trim().min(1).max(80),
    glow_color: optText,
    cta_label: optText,
    target_path: z
      .union([
        z
          .string()
          .trim()
          .regex(/^\/[A-Za-z0-9/_?&=.#%-]*$/),
        z.literal(""),
      ])
      .optional()
      .transform((v) => v || null),
    display_order: z.number().int().nonnegative().default(0),
    is_active: z.boolean().default(true),
    starts_at: optText,
    ends_at: optText,
  })
  .superRefine((value, ctx) => {
    if (Boolean(value.cta_label) !== Boolean(value.target_path)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "CTA label and target path must be provided together",
      });
    }
  });

export const adminListBanners = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context as Ctx);
    const { data, error } = await context.supabase
      .from("banners")
      .select("*")
      .order("display_order");
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const adminSaveBanner = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: uuid.optional(), banner: bannerInput }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context as Ctx);
    if (data.id) {
      const { data: old } = await context.supabase
        .from("banners")
        .select("image_public_id,mobile_image_public_id")
        .eq("id", data.id)
        .single();
      const { error } = await context.supabase
        .from("banners")
        .update(data.banner)
        .eq("id", data.id);
      if (error) throw new Error(error.message);
      await cleanupCloudinary([
        old?.image_public_id !== data.banner.image_public_id ? old?.image_public_id : null,
        old?.mobile_image_public_id !== data.banner.mobile_image_public_id
          ? old?.mobile_image_public_id
          : null,
      ]);
      return { id: data.id };
    }
    const { data: row, error } = await context.supabase
      .from("banners")
      .insert(data.banner)
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const adminDeleteBanner = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: uuid }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context as Ctx);
    const { data: old } = await context.supabase
      .from("banners")
      .select("image_public_id,mobile_image_public_id")
      .eq("id", data.id)
      .single();
    const { error } = await context.supabase.from("banners").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    await cleanupCloudinary([old?.image_public_id, old?.mobile_image_public_id]);
    return { ok: true };
  });

/* --------------------------------- merchants -------------------------------- */

const merchantInput = z.object({
  name: z.string().trim().min(2),
  short_description: optText,
  description: optText,
  email: optText,
  phone: optText,
  city: optText,
  country: optText,
  website_url: optText,
  instagram_url: optText,
  logo_url: optText,
  logo_public_id: optText,
  cover_image_url: optText,
  cover_image_public_id: optText,
  status: z.enum(["pending", "approved", "rejected", "suspended"]).default("approved"),
  is_active: z.boolean().default(true),
  is_featured: z.boolean().default(false),
});

export const adminCreateMerchant = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => merchantInput.parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context as Ctx);
    const { data: row, error } = await context.supabase
      .from("merchants")
      .insert({ ...data, slug: slugify(data.name) })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const adminEditMerchant = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => merchantInput.partial().extend({ id: uuid }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context as Ctx);
    const { id, ...patch } = data;
    const { data: old } = await context.supabase
      .from("merchants")
      .select("logo_public_id,cover_image_public_id")
      .eq("id", id)
      .single();
    const { error } = await context.supabase.from("merchants").update(patch).eq("id", id);
    if (error) throw new Error(error.message);
    await cleanupCloudinary([
      old?.logo_public_id !== patch.logo_public_id ? old?.logo_public_id : null,
      old?.cover_image_public_id !== patch.cover_image_public_id
        ? old?.cover_image_public_id
        : null,
    ]);
    return { ok: true };
  });

export const adminDeleteMerchant = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: uuid }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context as Ctx);
    const { data: old } = await context.supabase
      .from("merchants")
      .select("logo_public_id,cover_image_public_id")
      .eq("id", data.id)
      .single();
    const { error } = await context.supabase.from("merchants").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    await cleanupCloudinary([old?.logo_public_id, old?.cover_image_public_id]);
    return { ok: true };
  });

/* ---------------------------------- products -------------------------------- */

const productInput = z.object({
  merchant_id: uuid,
  brand_id: z
    .union([uuid, z.literal("")])
    .optional()
    .transform((v) => (v ? v : null)),
  category_id: z
    .union([uuid, z.literal("")])
    .optional()
    .transform((v) => (v ? v : null)),
  product_type_id: z
    .union([uuid, z.literal("")])
    .optional()
    .transform((v) => (v ? v : null)),
  name: z.string().trim().min(2),
  short_description: optText,
  description: optText,
  condition: z
    .enum(["new", "new_with_tags", "new_without_tags", "excellent", "very_good", "good", "fair"])
    .default("new"),
  condition_notes: optText,
  materials: z.array(z.string()).default([]),
  measurements: z.record(z.string()).default({}),
  tags: z.array(z.string()).default([]),
  composition: optText,
  care_instructions: optText,
  country_of_origin: optText,
  fit: optText,
  pattern: optText,
  neckline: optText,
  sleeve_length: optText,
  dress_length: optText,
  gender: optText,
  season: optText,
  external_product_url: optText,
  status: z.enum(["draft", "published", "archived", "sold_out"]).default("draft"),
  is_featured: z.boolean().default(false),
  is_new_arrival: z.boolean().default(false),
  original_price: z.number().nonnegative().default(0),
  discounted_price: z.number().nonnegative().nullable().optional(),
  currency: z.string().trim().default("AUD"),
  sku: optText,
  seo_title: optText,
  seo_description: optText,
  // nested variants & images for atomic creations/edits
  variants: z
    .array(
      z.object({
        id: z.string().uuid().optional(),
        color_name: z.string().trim().min(1),
        color_hex: z.string().trim().nullable().optional(),
        size: z.string().trim().min(1),
        sku: z.string().trim().nullable().optional(),
        barcode: z.string().trim().nullable().optional(),
        stock_quantity: z.number().int().nonnegative().default(0),
        original_price: z.number().nonnegative().nullable().optional().default(null),
        discounted_price: z.number().nonnegative().nullable().optional(),
        is_active: z.boolean().default(true),
      }),
    )
    .default([]),
  images: z
    .array(
      z.object({
        id: z.string().uuid().optional(),
        variant_id: z.string().uuid().nullable().optional(),
        color_name: z.string().trim().nullable().optional(),
        image_url: z.string().url(),
        image_public_id: z.string().trim().min(1),
        alt_text: z.string().trim().nullable().optional(),
        display_order: z.number().int().default(0),
        is_primary: z.boolean().default(false),
      }),
    )
    .default([]),
});

function validateVariantPricing(
  variants: Array<{
    color_name: string;
    size: string;
    sku?: string | null;
    stock_quantity: number;
    original_price: number | null;
    discounted_price?: number | null;
    is_active: boolean;
  }>,
  status?: string,
) {
  const combinations = new Set<string>();
  const skus = new Set<string>();
  const colorPrices = new Map<string, string>();
  let hasSellable = false;

  for (const variant of variants) {
    const combination = `${variant.color_name.trim().toLowerCase()}\u0000${variant.size.trim().toLowerCase()}`;
    if (combinations.has(combination)) throw new Error("Duplicate color and size combination");
    combinations.add(combination);

    const sku = variant.sku?.trim().toLowerCase();
    if (sku) {
      if (skus.has(sku)) throw new Error("Variant SKUs must be unique");
      skus.add(sku);
    }

    if (
      variant.discounted_price != null &&
      (variant.original_price == null || variant.discounted_price > variant.original_price)
    ) {
      throw new Error("Variant sale price cannot exceed its original price");
    }

    const color = variant.color_name.trim().toLowerCase();
    const priceKey = `${variant.original_price ?? "null"}:${variant.discounted_price ?? "null"}`;
    const existing = colorPrices.get(color);
    if (existing && existing !== priceKey)
      throw new Error("All sizes in a color must share prices");
    colorPrices.set(color, priceKey);

    if (variant.is_active && variant.stock_quantity > 0 && variant.original_price != null) {
      hasSellable = true;
    }
  }

  if (status === "published" && !hasSellable) {
    throw new Error("A published product needs an active, stocked, priced variant");
  }
}

async function validateProductTypeAssignment(
  sb: any,
  categoryId: string | null | undefined,
  productTypeId: string | null | undefined,
) {
  if (!categoryId) {
    if (productTypeId) throw new Error("Product type requires a category");
    return;
  }
  const { data: types, error } = await sb
    .from("product_types")
    .select("id,category_id,is_active")
    .eq("category_id", categoryId);
  if (error) throw new Error(`Could not validate product type: ${error.message}`);
  if (!types?.length) {
    if (productTypeId) throw new Error("The selected category has no product types");
    return;
  }
  if (!productTypeId) throw new Error("Product Type is required for the selected category");
  const selected = types.find((type: any) => type.id === productTypeId);
  if (!selected)
    throw new Error("The selected Product Type does not belong to the selected category");
  if (!selected.is_active) throw new Error("The selected Product Type is inactive");
}

export const adminCreateProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => productInput.parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context as Ctx);
    const { variants, images, ...productData } = data;
    await validateProductTypeAssignment(
      context.supabase,
      productData.category_id,
      productData.product_type_id,
    );
    validateVariantPricing(variants, productData.status);

    // Normalize tags
    const normalizedTags = (productData.tags ?? [])
      .map((t) => t.trim().toLowerCase())
      .filter((t) => t.length > 0);
    const uniqueTags = [...new Set(normalizedTags)];

    const { data: row, error } = await context.supabase
      .from("products")
      .insert({
        ...productData,
        tags: uniqueTags,
        slug: `${slugify(productData.name)}-${Math.random().toString(36).slice(2, 7)}`,
        published_at: productData.status === "published" ? new Date().toISOString() : null,
      })
      .select("id")
      .single();

    if (error) throw new Error(error.message);
    const productId = row.id;

    // Insert variants
    if (variants.length > 0) {
      const variantsToInsert = variants.map((v) => ({
        ...v,
        product_id: productId,
      }));
      const { error: vError } = await context.supabase
        .from("product_variants")
        .insert(variantsToInsert);
      if (vError) throw new Error(`Variants insert failed: ${vError.message}`);
    }

    // Insert images
    if (images.length > 0) {
      const imagesToInsert = images.map((img) => ({
        ...img,
        product_id: productId,
      }));
      const { error: imgError } = await context.supabase
        .from("product_images")
        .insert(imagesToInsert);
      if (imgError) throw new Error(`Images insert failed: ${imgError.message}`);
    }

    return row;
  });

export const adminEditProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => productInput.partial().extend({ id: uuid }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context as Ctx);
    const { id, variants, images, ...productPatch } = data;

    const { data: current, error: currentError } = await context.supabase
      .from("products")
      .select("category_id,product_type_id")
      .eq("id", id)
      .single();
    if (currentError) throw new Error(currentError.message);
    await validateProductTypeAssignment(
      context.supabase,
      productPatch.category_id !== undefined ? productPatch.category_id : current.category_id,
      productPatch.product_type_id !== undefined
        ? productPatch.product_type_id
        : current.product_type_id,
    );

    if (variants !== undefined) validateVariantPricing(variants, productPatch.status);
    if (productPatch.status === "published" && variants === undefined) {
      const { data: savedVariants, error: priceError } = await context.supabase
        .from("product_variants")
        .select("color_name,size,sku,stock_quantity,original_price,discounted_price,is_active")
        .eq("product_id", id);
      if (priceError) throw new Error(priceError.message);
      validateVariantPricing(savedVariants ?? [], "published");
    }

    // Normalize tags
    if (productPatch.tags !== undefined) {
      const normalizedTags = (productPatch.tags ?? [])
        .map((t) => t.trim().toLowerCase())
        .filter((t) => t.length > 0);
      productPatch.tags = [...new Set(normalizedTags)];
    }

    // 1. Update product base info
    if (Object.keys(productPatch).length > 0) {
      const { error: pError } = await context.supabase
        .from("products")
        .update(productPatch)
        .eq("id", id);
      if (pError) throw new Error(pError.message);
    }

    // 2. Sync variants if provided
    if (variants !== undefined) {
      const { data: dbVariants } = await context.supabase
        .from("product_variants")
        .select("id")
        .eq("product_id", id);

      const dbIds = (dbVariants ?? []).map((v) => v.id);
      const incomingIds = variants.map((v) => v.id).filter(Boolean) as string[];

      // Delete variants not in incoming list
      const deleteIds = dbIds.filter((dbId) => !incomingIds.includes(dbId));
      if (deleteIds.length > 0) {
        const { error: delError } = await context.supabase
          .from("product_variants")
          .delete()
          .in("id", deleteIds);
        if (delError) throw new Error(`Variants deletion failed: ${delError.message}`);
      }

      // Update / Insert variants
      for (const v of variants) {
        if (v.id) {
          const { error: uError } = await context.supabase
            .from("product_variants")
            .update(v)
            .eq("id", v.id);
          if (uError) throw new Error(`Variant update failed: ${uError.message}`);
        } else {
          const { error: iError } = await context.supabase
            .from("product_variants")
            .insert({ ...v, product_id: id });
          if (iError) throw new Error(`Variant insert failed: ${iError.message}`);
        }
      }
    }

    // 3. Sync images if provided
    if (images !== undefined) {
      const { data: dbImages } = await context.supabase
        .from("product_images")
        .select("id, image_public_id")
        .eq("product_id", id);

      const dbImageMap = new Map((dbImages ?? []).map((img) => [img.id, img.image_public_id]));
      const incomingIds = images.map((img) => img.id).filter(Boolean) as string[];

      // Deletions
      const deletedImagesPublicIds: string[] = [];
      const deletedImageIds: string[] = [];

      for (const [dbId, pubId] of dbImageMap.entries()) {
        if (!incomingIds.includes(dbId)) {
          deletedImageIds.push(dbId);
          if (pubId) deletedImagesPublicIds.push(pubId);
        }
      }

      if (deletedImageIds.length > 0) {
        const { error: imgDelError } = await context.supabase
          .from("product_images")
          .delete()
          .in("id", deletedImageIds);
        if (imgDelError) throw new Error(`Images deletion failed: ${imgDelError.message}`);
        // Async cleanup of Cloudinary files
        await cleanupCloudinary(deletedImagesPublicIds);
      }

      // Update / Insert incoming images
      for (const img of images) {
        if (img.id) {
          const { error: uError } = await context.supabase
            .from("product_images")
            .update(img)
            .eq("id", img.id);
          if (uError) throw new Error(`Image update failed: ${uError.message}`);
        } else {
          const { error: iError } = await context.supabase
            .from("product_images")
            .insert({ ...img, product_id: id });
          if (iError) throw new Error(`Image insert failed: ${iError.message}`);
        }
      }
    }

    return { ok: true };
  });

export const adminDeleteProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: uuid }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context as Ctx);
    // Find all public IDs first for Cloudinary cleanup
    const { data: images } = await context.supabase
      .from("product_images")
      .select("image_public_id")
      .eq("product_id", data.id);

    const { error } = await context.supabase.from("products").delete().eq("id", data.id);
    if (error) throw new Error(error.message);

    if (images && images.length > 0) {
      const publicIds = images.map((i) => i.image_public_id);
      await cleanupCloudinary(publicIds);
    }

    return { ok: true };
  });

export const adminGetProduct = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: uuid }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context as Ctx);
    const { data: row, error } = await context.supabase
      .from("products")
      .select("*, product_variants(*), product_images(*)")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) throw new Error("Product not found");
    return row;
  });

/* ------------------------------------ sales --------------------------------- */

const saleInput = z.object({
  name: z.string().trim().min(2),
  description: optText,
  merchant_id: z
    .union([uuid, z.literal(""), z.null()])
    .optional()
    .transform((v) => (v ? v : null)),
  banner_image_url: optText,
  banner_image_public_id: optText,
  mobile_banner_image_url: optText,
  mobile_banner_image_public_id: optText,
  starts_at: optText,
  ends_at: optText,
  is_active: z.boolean().default(true),
  is_featured: z.boolean().default(false),
  products: z
    .array(
      z.object({
        product_id: uuid,
        display_order: z.number().int().nonnegative(),
        discount_type: z.enum(["percentage", "fixed_amount", "final_price"]),
        discount_base: z.enum(["original_price", "current_price"]),
        discount_value: z.number().nonnegative(),
        is_manually_overridden: z.boolean(),
        refresh_snapshots: z.boolean().optional(),
      }),
    )
    .default([]),
});

export const adminListSales = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context as Ctx);
    const { data, error } = await context.supabase
      .from("sales")
      .select(
        "id, merchant_id, name, slug, description, banner_image_url, banner_image_public_id, mobile_banner_image_url, mobile_banner_image_public_id, starts_at, ends_at, is_active, is_featured, merchants(name), sale_products(product_id,display_order,discount_type,discount_base,discount_value,original_price_snapshot,current_price_snapshot,sale_price,is_manually_overridden,updated_at)",
      )
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const adminCreateSale = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => saleInput.parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context as Ctx);
    const { products, ...sale } = data;
    const { data: saleId, error } = await context.supabase.rpc("save_sale_with_products", {
      p_sale: sale,
      p_products: products,
    });
    if (error)
      throw new Error(`The sale could not be saved. No changes were committed. ${error.message}`);
    return { ok: true, id: saleId };
  });

export const adminEditSale = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => saleInput.partial().extend({ id: uuid }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context as Ctx);
    const { id, products = [], ...patch } = data;
    const { error } = await context.supabase.rpc("save_sale_with_products", {
      p_sale: { id, ...patch },
      p_products: products,
    });
    if (error)
      throw new Error(`The sale could not be saved. No changes were committed. ${error.message}`);
    return { ok: true };
  });

export const adminDeleteSale = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: uuid }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context as Ctx);
    const { error } = await context.supabase.from("sales").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/* ------------------------------------ blog ---------------------------------- */

const postInput = z.object({
  title: z.string().trim().min(2),
  excerpt: optText,
  content: z.string().trim().min(1),
  featured_image_url: optText,
  featured_image_public_id: optText,
  status: z.enum(["draft", "published", "archived"]).default("draft"),
  is_featured: z.boolean().default(false),
  tags: z.array(z.string()).default([]),
});

export const adminListBlogPosts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context as Ctx);
    const { data, error } = await context.supabase
      .from("blog_posts")
      .select(
        "id, title, slug, excerpt, content, status, is_featured, featured_image_url, featured_image_public_id, tags, published_at, created_at",
      )
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const adminCreateBlogPost = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => postInput.parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context as Ctx);
    const normalizedTags = (data.tags ?? [])
      .map((t) => t.trim().toLowerCase())
      .filter((t) => t.length > 0);
    const uniqueTags = [...new Set(normalizedTags)];

    const { error } = await context.supabase.from("blog_posts").insert({
      ...data,
      tags: uniqueTags,
      author_id: context.userId,
      slug: `${slugify(data.title)}-${Math.random().toString(36).slice(2, 6)}`,
      published_at: data.status === "published" ? new Date().toISOString() : null,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminEditBlogPost = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => postInput.partial().extend({ id: uuid }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context as Ctx);
    const { id, tags, ...patch } = data;
    const { data: old } = await context.supabase
      .from("blog_posts")
      .select("featured_image_public_id")
      .eq("id", id)
      .single();

    let finalTags: string[] | undefined;
    if (tags !== undefined) {
      const normalizedTags = (tags ?? [])
        .map((t) => t.trim().toLowerCase())
        .filter((t) => t.length > 0);
      finalTags = [...new Set(normalizedTags)];
    }

    const next = {
      ...patch,
      ...(finalTags !== undefined ? { tags: finalTags } : {}),
      ...(patch.status === "published" ? { published_at: new Date().toISOString() } : {}),
    };

    const { error } = await context.supabase.from("blog_posts").update(next).eq("id", id);
    if (error) throw new Error(error.message);
    await cleanupCloudinary([
      old?.featured_image_public_id !== patch.featured_image_public_id
        ? old?.featured_image_public_id
        : null,
    ]);
    return { ok: true };
  });

export const adminDeleteBlogPost = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: uuid }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context as Ctx);
    const { data: old } = await context.supabase
      .from("blog_posts")
      .select("featured_image_public_id")
      .eq("id", data.id)
      .single();
    const { error } = await context.supabase.from("blog_posts").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    await cleanupCloudinary([old?.featured_image_public_id]);
    return { ok: true };
  });

/* ------------------------------------ brands --------------------------------- */

const brandInput = z.object({
  name: z.string().trim().min(2),
  description: optText,
  logo_url: optText,
  logo_public_id: optText,
  cover_image_url: optText,
  cover_image_public_id: optText,
  website_url: optText,
  country: optText,
  is_featured: z.boolean().default(false),
  is_active: z.boolean().default(true),
});

export const adminListBrands = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        search: z.string().optional(),
      })
      .parse(d ?? {}),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context as Ctx);
    let q = context.supabase
      .from("brands")
      .select("*, products(count)")
      .order("created_at", { ascending: false });
    if (data.search) {
      q = q.ilike("name", `%${data.search}%`);
    }
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const adminCreateBrand = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => brandInput.parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context as Ctx);
    const { data: row, error } = await context.supabase
      .from("brands")
      .insert({ ...data, slug: slugify(data.name) })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const adminEditBrand = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => brandInput.partial().extend({ id: uuid }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context as Ctx);
    const { id, ...patch } = data;
    const { data: old } = await context.supabase
      .from("brands")
      .select("logo_public_id,cover_image_public_id")
      .eq("id", id)
      .single();
    const { error } = await context.supabase.from("brands").update(patch).eq("id", id);
    if (error) throw new Error(error.message);
    await cleanupCloudinary([
      old?.logo_public_id !== patch.logo_public_id ? old?.logo_public_id : null,
      old?.cover_image_public_id !== patch.cover_image_public_id
        ? old?.cover_image_public_id
        : null,
    ]);
    return { ok: true };
  });

export const adminDeleteBrand = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: uuid }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context as Ctx);

    // Check if products are referencing this brand
    const { count, error: countErr } = await context.supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .eq("brand_id", data.id);
    if (countErr) throw new Error(countErr.message);
    if (count && count > 0) {
      throw new Error(
        "This brand is referenced by existing products and cannot be deleted. Deactivate it instead.",
      );
    }

    const { data: old } = await context.supabase
      .from("brands")
      .select("logo_public_id,cover_image_public_id")
      .eq("id", data.id)
      .single();
    const { error } = await context.supabase.from("brands").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    await cleanupCloudinary([old?.logo_public_id, old?.cover_image_public_id]);
    return { ok: true };
  });

/* ---------------------------------- categories ------------------------------- */

const categoryInput = z.object({
  parent_id: z
    .union([uuid, z.literal("")])
    .optional()
    .transform((v) => (v ? v : null)),
  name: z.string().trim().min(2),
  description: optText,
  image_url: optText,
  image_public_id: optText,
  metadata: z.record(z.any()).default({}),
  display_order: z.number().int().default(0),
  is_active: z.boolean().default(true),
});

export const adminListCategories = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context as Ctx);
    const { data, error } = await context.supabase
      .from("categories")
      .select("*, products(count)")
      .order("display_order", { ascending: true })
      .order("name", { ascending: true });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const adminCreateCategory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => categoryInput.parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context as Ctx);
    const { data: row, error } = await context.supabase
      .from("categories")
      .insert({ ...data, slug: slugify(data.name) })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const adminEditCategory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => categoryInput.partial().extend({ id: uuid }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context as Ctx);
    const { id, ...patch } = data;

    // Prevent category from becoming its own parent or circular reference
    if (patch.parent_id === id) {
      throw new Error("A category cannot be its own parent.");
    }

    const { data: old } = await context.supabase
      .from("categories")
      .select("image_public_id")
      .eq("id", id)
      .single();
    const { error } = await context.supabase.from("categories").update(patch).eq("id", id);
    if (error) throw new Error(error.message);
    await cleanupCloudinary([
      old?.image_public_id !== patch.image_public_id ? old?.image_public_id : null,
    ]);
    return { ok: true };
  });

export const adminDeleteCategory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: uuid }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context as Ctx);

    // Check if products are referencing this category
    const { count: pCount, error: pError } = await context.supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .eq("category_id", data.id);
    if (pError) throw new Error(pError.message);
    if (pCount && pCount > 0) {
      throw new Error(
        "This category contains products and cannot be deleted. Deactivate it instead.",
      );
    }

    // Check if child categories reference this
    const { count: childCount, error: childError } = await context.supabase
      .from("categories")
      .select("*", { count: "exact", head: true })
      .eq("parent_id", data.id);
    if (childError) throw new Error(childError.message);
    if (childCount && childCount > 0) {
      throw new Error("This category has sub-categories and cannot be deleted.");
    }

    const { data: old } = await context.supabase
      .from("categories")
      .select("image_public_id")
      .eq("id", data.id)
      .single();
    const { error } = await context.supabase.from("categories").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    await cleanupCloudinary([old?.image_public_id]);
    return { ok: true };
  });

/* -------------------------------- product types ------------------------------ */

const productTypeInput = z.object({
  category_id: z
    .union([uuid, z.literal(""), z.null()])
    .optional()
    .transform((v) => (v ? v : null)),
  name: z.string().trim().min(2),
  description: optText,
  image_url: optText,
  image_public_id: optText,
  display_order: z.number().int().default(0),
  is_active: z.boolean().default(true),
});

export const adminListProductTypes = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context as Ctx);
    const { data, error } = await context.supabase
      .from("product_types")
      .select("*, categories:category_id(name), products(count)")
      .order("display_order", { ascending: true })
      .order("name", { ascending: true });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const adminCreateProductType = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => productTypeInput.parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context as Ctx);
    const { data: row, error } = await context.supabase
      .from("product_types")
      .insert({ ...data, slug: slugify(data.name) })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const adminEditProductType = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => productTypeInput.partial().extend({ id: uuid }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context as Ctx);
    const { id, ...patch } = data;
    if (patch.name) (patch as typeof patch & { slug: string }).slug = slugify(patch.name);
    const { data: old } = await context.supabase
      .from("product_types")
      .select("image_public_id")
      .eq("id", id)
      .single();
    const { error } = await context.supabase.from("product_types").update(patch).eq("id", id);
    if (error) throw new Error(error.message);
    await cleanupCloudinary([
      old?.image_public_id !== patch.image_public_id ? old?.image_public_id : null,
    ]);
    return { ok: true };
  });

export const adminDeleteProductType = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: uuid }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context as Ctx);

    // Check if products reference this type
    const { count, error: pError } = await context.supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .eq("product_type_id", data.id);
    if (pError) throw new Error(pError.message);
    if (count && count > 0) {
      throw new Error(
        "This product type contains products and cannot be deleted. Deactivate it instead.",
      );
    }

    const { data: old } = await context.supabase
      .from("product_types")
      .select("image_public_id")
      .eq("id", data.id)
      .single();
    const { error } = await context.supabase.from("product_types").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    await cleanupCloudinary([old?.image_public_id]);
    return { ok: true };
  });

/* ---------------------------------- inventory -------------------------------- */

export const adminListInventory = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        search: z.string().optional(),
        lowStock: z.boolean().optional(),
        merchantId: z.string().uuid().optional(),
      })
      .parse(d ?? {}),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context as Ctx);
    let q = context.supabase
      .from("product_variants")
      .select("*, products(name, status, merchant_id, merchants(name))")
      .order("sku", { ascending: true });

    if (data.merchantId) {
      q = q.eq("products.merchant_id", data.merchantId);
    }
    if (data.lowStock) {
      q = q.lte("stock_quantity", 5);
    }

    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);

    let filtered = rows ?? [];
    if (data.search) {
      const s = data.search.toLowerCase();
      filtered = filtered.filter(
        (v: any) => v.sku?.toLowerCase().includes(s) || v.products?.name?.toLowerCase().includes(s),
      );
    }

    return filtered;
  });

export const adminUpdateInventoryStock = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        variantId: uuid,
        stockQuantity: z.number().int().nonnegative(),
        isActive: z.boolean().optional(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context as Ctx);
    const patch: any = { stock_quantity: data.stockQuantity };
    if (typeof data.isActive === "boolean") {
      patch.is_active = data.isActive;
    }
    const { error } = await context.supabase
      .from("product_variants")
      .update(patch)
      .eq("id", data.variantId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/* --------------------------------- customers --------------------------------- */

export const adminListCustomers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        search: z.string().optional(),
        status: z.enum(["active", "suspended", "deleted"]).optional(),
      })
      .parse(d ?? {}),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context as Ctx);
    let q = context.supabase
      .from("users")
      .select(
        "id, first_name, last_name, display_name, email, phone, status, created_at, last_login_at, orders(total_cents, status)",
      );

    if (data.status) {
      q = q.eq("status", data.status);
    }

    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);

    let mapped = (rows ?? []).map((u: any) => {
      const orders = u.orders ?? [];
      const nonCancelled = orders.filter((o: any) => o.status !== "cancelled");
      const totalSpend = nonCancelled.reduce(
        (sum: number, o: any) => sum + (o.total_cents ?? 0),
        0,
      );
      return {
        id: u.id,
        first_name: u.first_name,
        last_name: u.last_name,
        display_name: u.display_name,
        email: u.email,
        phone: u.phone,
        status: u.status,
        created_at: u.created_at,
        last_login_at: u.last_login_at,
        orderCount: orders.length,
        totalSpend,
      };
    });

    if (data.search) {
      const s = data.search.toLowerCase();
      mapped = mapped.filter(
        (c: any) =>
          c.email?.toLowerCase().includes(s) ||
          c.display_name?.toLowerCase().includes(s) ||
          c.first_name?.toLowerCase().includes(s) ||
          c.last_name?.toLowerCase().includes(s),
      );
    }

    return mapped;
  });

export const adminGetCustomerDetail = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: uuid }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context as Ctx);
    const sb = context.supabase;

    const [userRes, addressesRes, ordersRes, cartsRes, wishlistsRes] = await Promise.all([
      sb.from("users").select("*").eq("id", data.id).maybeSingle(),
      sb.from("user_addresses").select("*").eq("user_id", data.id),
      sb
        .from("orders")
        .select("*, order_items(*)")
        .eq("user_id", data.id)
        .order("created_at", { ascending: false }),
      sb
        .from("carts")
        .select("*, cart_items(*, product_variants(*, products(name)))")
        .eq("user_id", data.id)
        .maybeSingle(),
      sb
        .from("wishlists")
        .select("*, wishlist_items(*, products(name))")
        .eq("user_id", data.id)
        .maybeSingle(),
    ]);

    if (userRes.error) throw new Error(userRes.error.message);
    if (!userRes.data) throw new Error("Customer profile not found");

    return {
      profile: userRes.data,
      addresses: addressesRes.data ?? [],
      orders: ordersRes.data ?? [],
      cart: cartsRes.data ?? null,
      wishlist: wishlistsRes.data ?? null,
    };
  });

export const adminUpdateCustomerStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        id: uuid,
        status: z.enum(["active", "suspended", "deleted"]),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context as Ctx);

    // Prevent permanent delete if they have historical orders
    if (data.status === "deleted") {
      const { count, error: orderErr } = await context.supabase
        .from("orders")
        .select("*", { count: "exact", head: true })
        .eq("user_id", data.id);
      if (orderErr) throw new Error(orderErr.message);
      if (count && count > 0) {
        throw new Error(
          "This customer has historical orders and cannot be deleted. Suspend them instead.",
        );
      }
    }

    const { error } = await context.supabase
      .from("users")
      .update({ status: data.status })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/* ---------------------------- contact inquiries ------------------------------ */

export const adminListInquiries = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        search: z.string().optional(),
        status: z.enum(["unread", "read", "resolved", "spam"]).optional(),
      })
      .parse(d ?? {}),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context as Ctx);
    let q = context.supabase
      .from("contact_inquiries")
      .select("*")
      .order("created_at", { ascending: false });

    if (data.status) {
      q = q.eq("status", data.status);
    }

    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);

    let filtered = rows ?? [];
    if (data.search) {
      const s = data.search.toLowerCase();
      filtered = filtered.filter(
        (i: any) =>
          i.name?.toLowerCase().includes(s) ||
          i.email?.toLowerCase().includes(s) ||
          i.subject?.toLowerCase().includes(s) ||
          i.message?.toLowerCase().includes(s),
      );
    }
    return filtered;
  });

export const adminUpdateInquiryStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        id: uuid,
        status: z.enum(["unread", "read", "resolved", "spam"]),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context as Ctx);
    const { error } = await context.supabase
      .from("contact_inquiries")
      .update({ status: data.status })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminDeleteInquiry = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: uuid }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context as Ctx);
    const { error } = await context.supabase.from("contact_inquiries").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/* -------------------------- newsletter subscribers --------------------------- */

export const adminListNewsletterSubscribers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        search: z.string().optional(),
        status: z.enum(["subscribed", "unsubscribed"]).optional(),
      })
      .parse(d ?? {}),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context as Ctx);
    let q = context.supabase
      .from("newsletter_subscribers")
      .select("*")
      .order("created_at", { ascending: false });

    if (data.status) {
      q = q.eq("status", data.status);
    }

    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);

    let filtered = rows ?? [];
    if (data.search) {
      const s = data.search.toLowerCase();
      filtered = filtered.filter((i: any) => i.email?.toLowerCase().includes(s));
    }
    return filtered;
  });

export const adminUpdateNewsletterSubscriberStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        id: uuid,
        status: z.enum(["subscribed", "unsubscribed"]),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context as Ctx);
    const { error } = await context.supabase
      .from("newsletter_subscribers")
      .update({ status: data.status })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminDeleteNewsletterSubscriber = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: uuid }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context as Ctx);
    const { error } = await context.supabase
      .from("newsletter_subscribers")
      .delete()
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
