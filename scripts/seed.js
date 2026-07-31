import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../.env") });
import { createClient } from "@supabase/supabase-js";
import * as seed from "./seed-data/index.js";
import { uploadSeedImage, stablePublicId } from "./lib/cloudinary.js";
import { assertResetAllowed, validateSeedData } from "./lib/validate-seed.js";

const flags = new Set(process.argv.slice(2)),
  dry = flags.has("--dry-run"),
  skipImages = flags.has("--skip-images"),
  reset = flags.has("--reset");
const dataset = {
  categories: seed.categories,
  brands: seed.brands,
  merchants: seed.merchants,
  products: seed.products,
};
const validation = validateSeedData(dataset);
if (validation.length) {
  console.error("Seed validation failed:\n" + validation.map((x) => `- ${x}`).join("\n"));
  process.exit(1);
}
console.log(
  `✓ Seed data validated (${seed.products.length} products, ${seed.homepageSlides.length} slides)`,
);
if (reset) assertResetAllowed();
if (dry) {
  console.log("✓ Dry run complete; no database or Cloudinary writes performed");
  process.exit(0);
}
for (const key of ["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"])
  if (!process.env[key]) throw new Error(`Missing ${key}`);
if (!skipImages)
  for (const key of ["CLOUDINARY_CLOUD_NAME", "CLOUDINARY_API_KEY", "CLOUDINARY_API_SECRET"])
    if (!process.env[key]) throw new Error(`Missing ${key}`);
const db = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const stats = { records: 0, images: 0, reused: 0, optionalFailures: 0 };
async function one(table, payload, onConflict, label) {
  const { data, error } = await db.from(table).upsert(payload, { onConflict }).select().single();
  if (error) throw new Error(`${label}: ${error.message}`);
  stats.records++;
  return data;
}
async function image(source, required = true) {
  if (skipImages) return null;
  try {
    const result = await uploadSeedImage({ source, required });
    if (result?.reused) stats.reused++;
    else if (result) stats.images++;
    return result;
  } catch (error) {
    if (required) throw error;
    stats.optionalFailures++;
    console.warn(`! Optional image failed: ${error.message}`);
    return null;
  }
}
async function clearSeed() {
  console.log("Resetting seeded catalog records…");
  const productSlugs = seed.products.map((x) => x.slug);
  const { data: owned } = await db.from("products").select("id").in("slug", productSlugs);
  const ids = (owned ?? []).map((x) => x.id);
  if (ids.length) {
    await db.from("product_images").delete().in("product_id", ids);
    await db.from("product_measurements").delete().in("product_id", ids);
    await db.from("product_variants").delete().in("product_id", ids);
    await db.from("products").delete().in("id", ids);
  }
  const { data: edits } = await db
    .from("curated_pages")
    .select("id")
    .in("slug", ["home", "summer-edit", "minimalist-wardrobe"]);
  const editIds = (edits ?? []).map((x) => x.id);
  if (editIds.length) await db.from("curated_pages").delete().in("id", editIds);
  await db
    .from("tags")
    .delete()
    .in("slug", ["quiet-luxury", "modern-tailoring", "archive", "resort"]);
  await db
    .from("site_assets")
    .delete()
    .in(
      "asset_key",
      seed.siteAssets.map((x) => x.key),
    );
  await db
    .from("categories")
    .delete()
    .in(
      "slug",
      seed.categories.map((x) => x.slug),
    );
  await db
    .from("brands")
    .delete()
    .in(
      "slug",
      seed.brands.map((x) => x.slug),
    );
  await db
    .from("merchants")
    .delete()
    .in(
      "slug",
      seed.merchants.map((x) => x.slug),
    );
}
if (reset) await clearSeed();
console.log("Starting seed…");
const categoryMap = new Map(),
  brandMap = new Map(),
  merchantMap = new Map(),
  colorMap = new Map(),
  productMap = new Map(),
  tagMap = new Map();

console.log("Seeding style tags…");
const styles = [
  { name: "Quiet Luxury", slug: "quiet-luxury" },
  { name: "Modern Tailoring", slug: "modern-tailoring" },
  { name: "Archive Pieces", slug: "archive" },
  { name: "Resort Wear", slug: "resort" },
];
for (const style of styles) {
  const saved = await one("tags", style, "slug", `tag ${style.slug}`);
  tagMap.set(style.slug, saved);
}

for (let i = 0; i < seed.categories.length; i++) {
  const row = seed.categories[i],
    img = await image(row.image),
    editorial = await image(row.metadata?.editorial?.source, false);
  const metadata = {
    ...row.metadata,
    editorial: {
      ...row.metadata.editorial,
      image: editorial?.secureUrl ?? null,
      imagePublicId: editorial?.publicId ?? null,
      source: undefined,
    },
  };
  const saved = await one(
    "categories",
    {
      name: row.name,
      slug: row.slug,
      description: row.description,
      metadata,
      display_order: i,
      is_active: true,
      ...(img && { image_url: img.secureUrl, image_public_id: img.publicId }),
    },
    "slug",
    `category ${row.slug}`,
  );
  categoryMap.set(row.slug, saved);
}
for (const row of seed.brands) {
  const saved = await one("brands", row, "slug", `brand ${row.slug}`);
  brandMap.set(row.slug, saved);
}
for (const row of seed.merchants) {
  const saved = await one("merchants", row, "slug", `merchant ${row.slug}`);
  merchantMap.set(row.slug, saved);
}
for (const row of seed.colors) {
  const saved = await one(
    "colors",
    { ...row, slug: seed.slugify(row.name) },
    "name",
    `color ${row.name}`,
  );
  colorMap.set(row.name, saved);
}
for (const row of seed.products) {
  const saved = await one(
    "products",
    {
      merchant_id: merchantMap.get(row.merchantSlug).id,
      brand_id: brandMap.get(row.brandSlug).id,
      category_id: categoryMap.get(row.categorySlug).id,
      name: row.name,
      slug: row.slug,
      short_description: row.short_description,
      description: row.description,
      condition: row.condition,
      composition: row.composition,
      season: row.season,
      status: row.status,
      is_featured: row.is_featured,
      is_new_arrival: row.is_new_arrival,
      published_at: new Date().toISOString(),
    },
    "slug",
    `product ${row.slug}`,
  );
  productMap.set(row.slug, saved);
  await one(
    "product_variants",
    {
      product_id: saved.id,
      color_id: colorMap.get(row.variant.color).id,
      ...Object.fromEntries(Object.entries(row.variant).filter(([key]) => key !== "color")),
    },
    "sku",
    `variant ${row.variant.sku}`,
  );
  for (const item of row.images) {
    const img = await image(item.source, item.primary);
    if (img)
      await one(
        "product_images",
        {
          product_id: saved.id,
          image_url: img.secureUrl,
          image_public_id: img.publicId,
          alt_text: item.alt,
          display_order: item.position,
          is_primary: item.primary,
        },
        "product_id,display_order",
        `image ${row.slug}/${item.position}`,
      );
  }
  for (const [name, value, unit] of row.measurements.filter((x) => x[2] === "cm"))
    await one(
      "product_measurements",
      { product_id: saved.id, measurement_name: name, measurement_value: value, unit },
      "product_id,measurement_name,unit",
      `measurement ${row.slug}/${name}`,
    );

  let tagSlug = "";
  const index = seed.products.indexOf(row);
  if (row.categorySlug === "dresses") {
    tagSlug = index % 2 === 0 ? "quiet-luxury" : "resort";
  } else if (row.categorySlug === "outerwear") {
    tagSlug = index % 2 === 0 ? "modern-tailoring" : "archive";
  } else if (row.categorySlug === "bags") {
    tagSlug = "quiet-luxury";
  } else if (row.categorySlug === "jewellery") {
    tagSlug = "archive";
  }
  const tag = tagMap.get(tagSlug);
  if (tag) {
    await one(
      "product_tags",
      { product_id: saved.id, tag_id: tag.id },
      "product_id,tag_id",
      `product_tag ${row.slug}/${tagSlug}`
    );
  }

  console.log(`✓ ${row.slug}`);
}
const home = await one(
  "curated_pages",
  {
    title: "Homepage",
    slug: "home",
    subtitle: "DesignerSale editorial homepage",
    status: "published",
    published_at: new Date().toISOString(),
  },
  "slug",
  "home page",
);
const { data: existingSections } = await db
  .from("curated_sections")
  .select("id")
  .eq("curated_page_id", home.id);
if (existingSections?.length)
  await db
    .from("curated_sections")
    .delete()
    .in(
      "id",
      existingSections.map((x) => x.id),
    );
let order = 0;
for (const slide of seed.homepageSlides) {
  const img = await image(slide.image);
  await one(
    "curated_sections",
    {
      curated_page_id: home.id,
      section_type: "hero",
      title: slide.lines.join(" "),
      subtitle: slide.kicker,
      image_url: img?.secureUrl ?? null,
      image_public_id: img?.publicId ?? null,
      display_order: order++,
      is_active: true,
      settings: {
        kind: "homepage-slide",
        id: slide.id,
        lines: slide.lines,
        caption: slide.caption,
        campaign: slide.campaign,
        bg: slide.bg,
        accent: slide.accent,
      },
    },
    "id",
    `slide ${slide.id}`,
  );
}
const categorySection = await one(
  "curated_sections",
  {
    curated_page_id: home.id,
    section_type: "categories",
    title: "Shop by category",
    display_order: order++,
    is_active: true,
    settings: { kind: "homepage-categories" },
  },
  "id",
  "home categories",
);
for (let i = 0; i < seed.categories.length; i++)
  await one(
    "curated_section_categories",
    {
      section_id: categorySection.id,
      category_id: categoryMap.get(seed.categories[i].slug).id,
      display_order: i,
    },
    "section_id,category_id",
    `home category ${i}`,
  );
const productsSection = await one(
  "curated_sections",
  {
    curated_page_id: home.id,
    section_type: "products",
    title: "Most wanted",
    display_order: order++,
    is_active: true,
    settings: { kind: "homepage-products" },
  },
  "id",
  "home products",
);
for (const [i, p] of seed.products.filter((x) => x.is_featured).entries())
  await one(
    "curated_section_products",
    { section_id: productsSection.id, product_id: productMap.get(p.slug).id, display_order: i },
    "section_id,product_id",
    `home product ${i}`,
  );
for (const spotlight of seed.designerSpotlights) {
  const img = await image(spotlight.image);
  await one(
    "curated_sections",
    {
      curated_page_id: home.id,
      section_type: "editorial",
      title: spotlight.name,
      content: spotlight.bio,
      image_url: img?.secureUrl ?? null,
      image_public_id: img?.publicId ?? null,
      display_order: order++,
      is_active: true,
      settings: {
        kind: "designer-spotlight",
        id: spotlight.id,
        alt: spotlight.alt,
        stats: spotlight.stats,
        bg: spotlight.bg,
        accent: spotlight.accent,
      },
    },
    "id",
    `spotlight ${spotlight.id}`,
  );
}
const merchantsSection = await one(
  "curated_sections",
  {
    curated_page_id: home.id,
    section_type: "merchants",
    title: "Independent boutiques",
    display_order: order++,
    is_active: true,
    settings: { kind: "homepage-merchants" },
  },
  "id",
  "home merchants",
);
for (const [i, m] of seed.merchants.entries())
  await one(
    "curated_section_merchants",
    { section_id: merchantsSection.id, merchant_id: merchantMap.get(m.slug).id, display_order: i },
    "section_id,merchant_id",
    `home merchant ${i}`,
  );
await one(
  "curated_sections",
  {
    curated_page_id: home.id,
    section_type: "banner",
    title: "Marketplace statistics",
    display_order: order++,
    is_active: true,
    settings: { kind: "homepage-stats", items: seed.homepageStats },
  },
  "id",
  "home stats",
);

console.log("Seeding summer-edit curated page…");
const summerEdit = await one(
  "curated_pages",
  {
    title: "The Summer Edit",
    slug: "summer-edit",
    subtitle: "Sun-drenched linen, gold cuffs and unstructured slip silks.",
    description: "A seasonal edit curated by our Melbourne and Sydney buying teams.",
    status: "published",
    published_at: new Date().toISOString(),
  },
  "slug",
  "summer edit page",
);

const summerHero = await one(
  "curated_sections",
  {
    curated_page_id: summerEdit.id,
    section_type: "hero",
    title: "The Summer Edit",
    subtitle: "Sun-drenched silhouettes",
    display_order: 0,
    is_active: true,
    settings: { kind: "editorial" },
  },
  "id",
  "summer hero section"
);

const summerProducts = await one(
  "curated_sections",
  {
    curated_page_id: summerEdit.id,
    section_type: "products",
    title: "Featured Pieces",
    display_order: 1,
    is_active: true,
    settings: { kind: "products" },
  },
  "id",
  "summer products section"
);

const summerProductRows = seed.products.filter(p => p.categorySlug === "dresses" || p.categorySlug === "jewellery").slice(0, 4);
for (const [i, p] of summerProductRows.entries()) {
  await one(
    "curated_section_products",
    { section_id: summerProducts.id, product_id: productMap.get(p.slug).id, display_order: i },
    "section_id,product_id",
    `summer product ${i}`
  );
}

console.log("Seeding minimalist-wardrobe curated page…");
const minimalistWardrobe = await one(
  "curated_pages",
  {
    title: "Minimalist Wardrobe",
    slug: "minimalist-wardrobe",
    subtitle: "Monochromatic tailoring, vegetable-tanned leather, and solid gold.",
    description: "An edit of clean lines and quiet luxury for the modern capsule wardrobe.",
    status: "published",
    published_at: new Date().toISOString(),
  },
  "slug",
  "minimalist wardrobe page",
);

const minHero = await one(
  "curated_sections",
  {
    curated_page_id: minimalistWardrobe.id,
    section_type: "hero",
    title: "The Minimalist Wardrobe",
    subtitle: "Clean lines & silent luxury",
    display_order: 0,
    is_active: true,
    settings: { kind: "editorial" },
  },
  "id",
  "minimalist hero section"
);

const minProducts = await one(
  "curated_sections",
  {
    curated_page_id: minimalistWardrobe.id,
    section_type: "products",
    title: "Capsule Essentials",
    display_order: 1,
    is_active: true,
    settings: { kind: "products" },
  },
  "id",
  "minimalist products section"
);

const minProductRows = seed.products.filter(p => p.categorySlug === "outerwear" || p.categorySlug === "bags").slice(0, 4);
for (const [i, p] of minProductRows.entries()) {
  await one(
    "curated_section_products",
    { section_id: minProducts.id, product_id: productMap.get(p.slug).id, display_order: i },
    "section_id,product_id",
    `minimalist product ${i}`
  );
}
for (const item of seed.siteAssets) {
  const img = await image(item.source);
  if (img)
    await one(
      "site_assets",
      {
        asset_key: item.key,
        image_url: img.secureUrl,
        image_public_id: img.publicId,
        alt_text: item.alt,
      },
      "asset_key",
      `site asset ${item.key}`,
    );
}
console.log(
  `Seed completed\nRecords: ${stats.records}\nImages uploaded: ${stats.images}\nImages reused: ${stats.reused}\nOptional failures: ${stats.optionalFailures}`,
);
