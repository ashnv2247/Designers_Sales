import { z } from "zod";

export const sectionTypes = [
  "hero",
  "products",
  "sales",
  "merchants",
  "categories",
  "editorial",
  "banner",
  "blog_posts",
] as const;
export const pageStatuses = ["draft", "published", "archived"] as const;
const nullable = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((v) => v || null);
export const slugify = (v: string) =>
  v
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 200);

export const curatedPageSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(180),
  slug: z
    .string()
    .trim()
    .min(1, "Slug is required")
    .max(200)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and hyphens"),
  subtitle: nullable(300),
  description: nullable(10000),
  hero_image_url: nullable(2000),
  hero_image_public_id: nullable(500),
  mobile_hero_image_url: nullable(2000),
  mobile_hero_image_public_id: nullable(500),
  status: z.enum(pageStatuses),
  published_at: z.string().nullable().optional(),
  seo_title: nullable(255),
  seo_description: nullable(500),
});

export const curatedSectionSchema = z.object({
  id: z.string().uuid().optional(),
  curated_page_id: z.string().uuid(),
  section_type: z.enum(sectionTypes),
  title: nullable(180),
  subtitle: nullable(300),
  content: nullable(50000),
  image_url: nullable(2000),
  image_public_id: nullable(500),
  mobile_image_url: nullable(2000),
  mobile_image_public_id: nullable(500),
  link_url: z
    .union([
      z.literal(""),
      z
        .string()
        .url()
        .refine((v) => /^https?:\/\//i.test(v), "Use an http or https URL"),
    ])
    .optional()
    .transform((v) => v || null),
  link_label: nullable(100),
  display_order: z.coerce.number().int().min(0),
  is_active: z.boolean(),
  item_ids: z.array(z.string().uuid()).default([]),
  categories: z
    .array(
      z.object({
        id: z.string().uuid(),
        custom_title: z.string().max(150).nullable().optional(),
        custom_image_url: z.string().url().nullable().optional(),
        custom_image_public_id: z.string().nullable().optional(),
      }),
    )
    .default([]),
});

export function publishingErrors(
  sections: Array<{ section_type: string; is_active: boolean; item_count?: number }>,
) {
  const relational = new Set(["products", "sales", "merchants", "categories", "blog_posts"]);
  return sections
    .filter((s) => s.is_active && relational.has(s.section_type) && !s.item_count)
    .map((s) => `${s.section_type.replace("_", " ")} section requires at least one item`);
}
