import { z } from "zod";

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

export function pagePublishingErrors(productCount: number) {
  if (productCount === 0) {
    return ["Curated page requires at least one product to be published"];
  }
  return [];
}
