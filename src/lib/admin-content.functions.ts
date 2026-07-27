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
    const [merchants, brands, categories, colors, blogCategories, products] = await Promise.all([
      sb.from("merchants").select("id, name").order("name"),
      sb.from("brands").select("id, name").order("name"),
      sb.from("categories").select("id, name").order("name"),
      sb.from("colors").select("id, name").order("name"),
      sb.from("blog_categories").select("id, name").order("name"),
      sb.from("products").select("id, name").order("name").limit(300),
    ]);
    return {
      merchants: merchants.data ?? [],
      brands: brands.data ?? [],
      categories: categories.data ?? [],
      colors: colors.data ?? [],
      blogCategories: blogCategories.data ?? [],
      products: products.data ?? [],
    };
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
  cover_image_url: optText,
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
    const { error } = await context.supabase.from("merchants").update(patch).eq("id", id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminDeleteMerchant = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: uuid }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context as Ctx);
    const { error } = await context.supabase.from("merchants").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/* ---------------------------------- products -------------------------------- */

const productInput = z.object({
  merchant_id: uuid,
  brand_id: z.union([uuid, z.literal("")]).optional().transform((v) => (v ? v : null)),
  category_id: z.union([uuid, z.literal("")]).optional().transform((v) => (v ? v : null)),
  name: z.string().trim().min(2),
  short_description: optText,
  description: optText,
  condition: z
    .enum(["new", "new_with_tags", "new_without_tags", "excellent", "very_good", "good", "fair"])
    .default("new"),
  gender: optText,
  season: optText,
  composition: optText,
  care_instructions: optText,
  status: z.enum(["draft", "published", "archived", "sold_out"]).default("draft"),
  is_featured: z.boolean().default(false),
  is_new_arrival: z.boolean().default(false),
});

export const adminCreateProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => productInput.parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context as Ctx);
    const { data: row, error } = await context.supabase
      .from("products")
      .insert({
        ...data,
        slug: `${slugify(data.name)}-${Math.random().toString(36).slice(2, 7)}`,
        published_at: data.status === "published" ? new Date().toISOString() : null,
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const adminEditProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => productInput.partial().extend({ id: uuid }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context as Ctx);
    const { id, ...patch } = data;
    const { error } = await context.supabase.from("products").update(patch).eq("id", id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminDeleteProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: uuid }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context as Ctx);
    const { error } = await context.supabase.from("products").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminGetProduct = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: uuid }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context as Ctx);
    const { data: row, error } = await context.supabase
      .from("products")
      .select(
        "*, product_images(id, image_url, is_primary, display_order), product_variants(id, name, sku, sizes, original_price, discounted_price, currency, stock_quantity, is_default, is_available, color_id)",
      )
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) throw new Error("Product not found");
    return row;
  });

/* ---------------------------------- variants -------------------------------- */

const variantInput = z.object({
  product_id: uuid,
  name: optText,
  sku: z.string().trim().min(1),
  sizes: z.array(z.string().trim().min(1)).default([]),
  original_price: z.number().nonnegative(),
  discounted_price: z.number().nonnegative().nullable().optional(),
  currency: z.string().trim().default("AUD"),
  stock_quantity: z.number().int().nonnegative().default(0),
  color_id: z.union([uuid, z.literal("")]).optional().transform((v) => (v ? v : null)),
  is_default: z.boolean().default(false),
  is_available: z.boolean().default(true),
});

export const adminCreateVariant = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => variantInput.parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context as Ctx);
    const { error } = await context.supabase.from("product_variants").insert(data);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminEditVariant = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => variantInput.partial().extend({ id: uuid }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context as Ctx);
    const { id, ...patch } = data;
    const { error } = await context.supabase.from("product_variants").update(patch).eq("id", id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminDeleteVariant = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: uuid }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context as Ctx);
    const { error } = await context.supabase.from("product_variants").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/* ----------------------------------- images --------------------------------- */

export const adminAddProductImage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ product_id: uuid, image_url: z.string().trim().url(), is_primary: z.boolean().default(false) }).parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context as Ctx);
    const { error } = await context.supabase.from("product_images").insert(data);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminDeleteProductImage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: uuid }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context as Ctx);
    const { error } = await context.supabase.from("product_images").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/* ------------------------------------ sales --------------------------------- */

const saleInput = z.object({
  name: z.string().trim().min(2),
  description: optText,
  merchant_id: z.union([uuid, z.literal("")]).optional().transform((v) => (v ? v : null)),
  banner_image_url: optText,
  starts_at: optText,
  ends_at: optText,
  is_active: z.boolean().default(true),
  is_featured: z.boolean().default(false),
});

export const adminListSales = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context as Ctx);
    const { data, error } = await context.supabase
      .from("sales")
      .select("id, name, slug, description, merchant_id, banner_image_url, starts_at, ends_at, is_active, is_featured, merchants(name)")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const adminCreateSale = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => saleInput.parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context as Ctx);
    const { error } = await context.supabase
      .from("sales")
      .insert({ ...data, slug: `${slugify(data.name)}-${Math.random().toString(36).slice(2, 6)}` });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminEditSale = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => saleInput.partial().extend({ id: uuid }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context as Ctx);
    const { id, ...patch } = data;
    const { error } = await context.supabase.from("sales").update(patch).eq("id", id);
    if (error) throw new Error(error.message);
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
  category_id: z.union([uuid, z.literal("")]).optional().transform((v) => (v ? v : null)),
  featured_image_url: optText,
  status: z.enum(["draft", "published", "archived"]).default("draft"),
  is_featured: z.boolean().default(false),
});

export const adminListBlogPosts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context as Ctx);
    const { data, error } = await context.supabase
      .from("blog_posts")
      .select("id, title, slug, excerpt, content, status, is_featured, featured_image_url, category_id, published_at, created_at, blog_categories(name)")
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
    const { error } = await context.supabase.from("blog_posts").insert({
      ...data,
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
    const { id, ...patch } = data;
    const next: Record<string, unknown> = { ...patch };
    if (patch.status === "published") next.published_at = new Date().toISOString();
    const { error } = await context.supabase.from("blog_posts").update(next).eq("id", id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminDeleteBlogPost = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: uuid }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context as Ctx);
    const { error } = await context.supabase.from("blog_posts").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminCreateBlogCategory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ name: z.string().trim().min(2) }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context as Ctx);
    const { error } = await context.supabase
      .from("blog_categories")
      .insert({ name: data.name, slug: slugify(data.name) });
    if (error) throw new Error(error.message);
    return { ok: true };
  });
