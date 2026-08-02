import { z } from "zod";

export const productImageSchema = z.object({
  url: z.string().url(),
  publicId: z.string().nullable(),
  alt: z.string().default(""),
  isPrimary: z.boolean(),
  displayOrder: z.number().int().nonnegative(),
});

export const productSizeSchema = z.object({
  name: z.string().min(1).max(30),
  available: z.boolean(),
});

export const productColorOptionSchema = z.object({
  id: z.string().min(1).max(100),
  name: z.string().min(1).max(80),
  hex: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Must be a valid hex color code (e.g. #FFFFFF)")
    .nullable()
    .or(z.literal("")),
  isDefault: z.boolean(),
  isAvailable: z.boolean(),
  images: z.array(productImageSchema).refine(
    (images) => {
      if (images.length === 0) return true;
      const primaries = images.filter((img) => img.isPrimary);
      return primaries.length <= 1;
    },
    { message: "No more than one primary image per colour is allowed" },
  ),
  sizes: z.array(productSizeSchema).refine(
    (sizes) => {
      const names = sizes.map((s) => s.name.toLowerCase().trim());
      return new Set(names).size === names.length;
    },
    { message: "Duplicate sizes inside a colour option are not allowed" },
  ),
});

const optionsValidation = z
  .array(productColorOptionSchema)
  .refine(
    (options) => {
      if (options.length === 0) return true;
      const defaults = options.filter((o) => o.isDefault);
      return defaults.length === 1;
    },
    { message: "Exactly one default colour must be selected when options are not empty" },
  )
  .refine(
    (options) => {
      const ids = options.map((o) => o.id.toLowerCase().trim());
      return new Set(ids).size === ids.length;
    },
    { message: "Duplicate colour IDs are not allowed" },
  )
  .refine(
    (options) => {
      const names = options.map((o) => o.name.toLowerCase().trim());
      return new Set(names).size === names.length;
    },
    { message: "Duplicate colour names are not allowed" },
  );

export const productBaseSchema = z.object({
  merchant_id: z.string().uuid(),
  brand_id: z.string().uuid().nullable().optional(),
  category_id: z.string().uuid().nullable().optional(),
  product_type_id: z.string().uuid().nullable().optional(),
  name: z.string().min(1).max(200),
  short_description: z.string().max(500).nullable().optional(),
  description: z.string().nullable().optional(),
  original_price: z.number().nonnegative(),
  discounted_price: z.number().nonnegative().nullable().optional(),
  currency: z.string().min(3).max(3).default("AUD"),
  options: optionsValidation.default([]),
  condition: z.enum([
    "new",
    "new_with_tags",
    "new_without_tags",
    "excellent",
    "very_good",
    "good",
    "fair",
  ]),
  condition_notes: z.string().nullable().optional(),
  composition: z.string().nullable().optional(),
  care_instructions: z.string().nullable().optional(),
  country_of_origin: z.string().max(100).nullable().optional(),
  fit: z.string().max(80).nullable().optional(),
  pattern: z.string().max(80).nullable().optional(),
  neckline: z.string().max(80).nullable().optional(),
  sleeve_length: z.string().max(80).nullable().optional(),
  dress_length: z.string().max(80).nullable().optional(),
  gender: z.string().max(30).nullable().optional(),
  season: z.string().max(50).nullable().optional(),
  external_product_url: z.string().url().nullable().optional().or(z.literal("")),
  status: z.enum(["draft", "published", "archived", "sold_out"]).default("draft"),
  is_featured: z.boolean().default(false),
  is_new_arrival: z.boolean().default(false),
  seo_title: z.string().max(255).nullable().optional(),
  seo_description: z.string().max(500).nullable().optional(),
});

export const productCreatePayloadSchema = productBaseSchema
  .refine(
    (data) => {
      if (data.discounted_price !== undefined && data.discounted_price !== null) {
        return data.discounted_price <= data.original_price;
      }
      return true;
    },
    { message: "Discounted price cannot exceed original price", path: ["discounted_price"] },
  )
  .refine(
    (data) => {
      if (data.status === "published" && data.options) {
        const availableColors = data.options.filter((o) => o.isAvailable);
        return availableColors.length >= 1;
      }
      return true;
    },
    { message: "Published products must have at least one available colour", path: ["options"] },
  )
  .refine(
    (data) => {
      if (data.status === "published" && data.options) {
        const availableColors = data.options.filter((o) => o.isAvailable);
        const hasAvailableSize = availableColors.some((c) => c.sizes.some((s) => s.available));
        return hasAvailableSize;
      }
      return true;
    },
    { message: "Published products must have at least one available size", path: ["options"] },
  )
  .refine(
    (data) => {
      if (data.status === "published" && data.options) {
        const availableColors = data.options.filter((o) => o.isAvailable);
        const hasValidImage = availableColors.some((c) => c.images.length >= 1);
        return hasValidImage;
      }
      return true;
    },
    { message: "Published products must have at least one valid image", path: ["options"] },
  );

export const productUpdatePayloadSchema = productBaseSchema.partial().extend({
  id: z.string().uuid(),
});

export const addToCartPayloadSchema = z.object({
  product_id: z.string().uuid(),
  selected_color_id: z.string().min(1).max(100),
  selected_color_name: z.string().min(1).max(80),
  selected_size: z.string().min(1).max(30),
  quantity: z.number().int().positive().default(1),
  unit_price: z.number().nonnegative(),
});
