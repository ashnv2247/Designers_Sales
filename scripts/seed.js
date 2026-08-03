import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../.env") });
import { createClient } from "@supabase/supabase-js";
import * as seed from "./seed-data/index.js";
import { uploadSeedImage } from "./lib/cloudinary.js";
import { assertResetAllowed, validateSeedData } from "./lib/validate-seed.js";

const flags = new Set(process.argv.slice(2)),
  dry = flags.has("--dry-run"),
  skipImages = flags.has("--skip-images"),
  reset = flags.has("--reset");
const dataset = {
  categories: seed.categories,
  productTypes: seed.productTypes,
  brands: seed.brands,
  merchants: seed.merchants,
  products: seed.products,
};
const validation = validateSeedData(dataset);
if (validation.length) {
  console.error("Seed validation failed:\n" + validation.map((x) => `- ${x}`).join("\n"));
  process.exit(1);
}
console.log(`✓ Seed data validated (${seed.products.length} products)`);
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
  await db
    .from("banners")
    .delete()
    .in(
      "name",
      seed.homepageSlides.map((x) => `Homepage ${x.id}`),
    );
  await db
    .from("sales")
    .delete()
    .in("slug", ["winter-clearance", "spring-preview", "archive-event"]);
  console.log("Resetting seeded catalog records…");
  const productSlugs = seed.products.map((x) => x.slug);
  const { data: owned } = await db.from("products").select("id").in("slug", productSlugs);
  const ids = (owned ?? []).map((x) => x.id);
  if (ids.length) {
    await db.from("products").delete().in("id", ids);
  }
  const { data: edits } = await db
    .from("curated_pages")
    .select("id")
    .in("slug", ["home", "summer-edit", "minimalist-wardrobe"]);
  const editIds = (edits ?? []).map((x) => x.id);
  if (editIds.length) await db.from("curated_pages").delete().in("id", editIds);
  await db
    .from("product_types")
    .delete()
    .in(
      "slug",
      seed.productTypes.map((x) => x.slug),
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
  productTypeMap = new Map(),
  brandMap = new Map(),
  merchantMap = new Map(),
  productMap = new Map();

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
for (let i = 0; i < seed.productTypes.length; i++) {
  const row = seed.productTypes[i];
  const saved = await one(
    "product_types",
    {
      name: row.name,
      slug: row.slug,
      category_id: categoryMap.get(row.categorySlug).id,
      description: `${row.name} for the ${categoryMap.get(row.categorySlug).name} collection.`,
      display_order: i,
      is_active: true,
    },
    "slug",
    `product type ${row.slug}`,
  );
  productTypeMap.set(row.slug, saved);
}
for (let i = 0; i < seed.homepageSlides.length; i++) {
  const slide = seed.homepageSlides[i];
  const uploaded = await image(slide.image);
  await one(
    "banners",
    {
      name: `Homepage ${slide.id}`,
      eyebrow: slide.kicker,
      headline: slide.lines.slice(0, -1).join(" "),
      highlighted_text: slide.lines.at(-1),
      description: `${slide.caption}. Discover authenticated designer fashion from Australia's leading boutiques.`,
      image_url: uploaded?.secureUrl ?? slide.image,
      image_public_id: uploaded?.publicId ?? null,
      background_color: slide.bg,
      accent_color: slide.accent,
      glow_color: slide.bg,
      cta_label: "Shop Sale",
      target_path: "/shop/dresses",
      display_order: i,
      is_active: true,
    },
    "name",
    `banner ${slide.id}`,
  );
}
for (const row of seed.brands) {
  const saved = await one("brands", row, "slug", `brand ${row.slug}`);
  brandMap.set(row.slug, saved);
}
for (const row of seed.merchants) {
  const saved = await one("merchants", row, "slug", `merchant ${row.slug}`);
  merchantMap.set(row.slug, saved);
}

for (const row of seed.products) {
  const index = seed.products.indexOf(row);

  // Upload and resolve Cloudinary images
  const uploadedImages = [];
  for (const item of row.images) {
    const img = await image(item.source, item.primary);
    if (img) {
      uploadedImages.push({
        url: img.secureUrl,
        publicId: img.publicId,
        isPrimary: item.primary,
        displayOrder: item.position,
      });
    }
  }

  const colorName = row.variant.color;
  const productCategorySizes =
    row.categorySlug === "jewellery" || row.categorySlug === "bags"
      ? ["One size"]
      : ["XS", "S", "M", "L"];

  const optionSizes = productCategorySizes.map((sizeName) => {
    const isMatched = row.variant.sizes.includes(sizeName);
    return {
      name: sizeName,
      available: isMatched || index % 3 !== 0, // some sizes available, some not
    };
  });

  const colorOption = {
    name: colorName,
    hex:
      colorName === "Camel"
        ? "#C59B73"
        : colorName === "Ivory"
          ? "#F9F6EE"
          : colorName === "Stone"
            ? "#8A9A86"
            : colorName === "Champagne"
              ? "#F0E6D2"
              : "#1B263B",
    isDefault: true,
    isAvailable: true,
    sizes: optionSizes,
    images: uploadedImages,
  };

  const options = [colorOption];

  // Add a second color option for even indices to showcase variant switching
  if (index % 2 === 0) {
    const altColorName = colorName === "Camel" ? "Black" : "Camel";
    const altOption = {
      name: altColorName,
      hex: altColorName === "Black" ? "#1A1A1A" : "#C59B73",
      isDefault: false,
      isAvailable: true,
      sizes: productCategorySizes.map((sizeName) => ({
        name: sizeName,
        available: sizeName !== "M", // M sold out
      })),
      images: uploadedImages.map((img) => ({
        ...img,
      })),
    };
    options.push(altOption);
  }

  // Map measurements array to JSONB object format
  const measurementsObj = {};
  for (const [name, val, unit] of row.measurements) {
    measurementsObj[name.toLowerCase()] = `${val} ${unit}`;
  }

  // Set tags based on category
  let tagSlug = "";
  if (row.categorySlug === "dresses") {
    tagSlug = index % 2 === 0 ? "quiet-luxury" : "resort";
  } else if (row.categorySlug === "outerwear") {
    tagSlug = index % 2 === 0 ? "modern-tailoring" : "archive";
  } else if (row.categorySlug === "bags") {
    tagSlug = "quiet-luxury";
  } else if (row.categorySlug === "jewellery") {
    tagSlug = "archive";
  }
  const tags = tagSlug ? [tagSlug] : [];

  const saved = await one(
    "products",
    {
      merchant_id: merchantMap.get(row.merchantSlug).id,
      brand_id: brandMap.get(row.brandSlug).id,
      category_id: categoryMap.get(row.categorySlug).id,
      product_type_id: productTypeMap.get(row.productTypeSlug).id,
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
      original_price: row.variant.original_price,
      discounted_price: row.variant.discounted_price,
      currency: row.variant.currency || "AUD",
      sku: row.variant.sku,
      materials: row.composition ? [row.composition] : [],
      measurements: measurementsObj,
      tags: tags,
    },
    "slug",
    `product ${row.slug}`,
  );
  productMap.set(row.slug, saved);

  // Seed product variants & product images directly from options
  for (const opt of options) {
    const sizeKeys = [];
    // Seed variants
    for (const sizeOpt of opt.sizes) {
      const vSku = `${saved.sku || "SKU"}-${opt.name.toUpperCase()}-${sizeOpt.name.toUpperCase()}`;
      const savedVar = await one(
        "product_variants",
        {
          product_id: saved.id,
          color_name: opt.name,
          color_hex: opt.hex,
          size: sizeOpt.name,
          sku: vSku,
          stock_quantity: sizeOpt.available ? row.variant.stock_quantity : 0,
          original_price: row.variant.original_price,
          discounted_price: row.variant.discounted_price,
          is_active: opt.isAvailable,
        },
        "product_id,color_name,size",
        `variant ${saved.slug}/${opt.name}/${sizeOpt.name}`,
      );
      sizeKeys.push({ size: sizeOpt.name, varId: savedVar.id });
    }

    // Seed images associated with color / variant
    for (const img of opt.images) {
      // Find matching size variant if primary or default
      const matchingVar = sizeKeys[0]?.varId || null;
      await one(
        "product_images",
        {
          product_id: saved.id,
          variant_id: matchingVar,
          color_name: opt.name,
          image_url: img.url,
          image_public_id: img.publicId,
          alt_text: `${saved.name} in ${opt.name}`,
          display_order: img.displayOrder,
          is_primary: img.isPrimary && opt.isDefault,
        },
        "image_public_id",
        `image ${saved.slug}/${opt.name}/${img.publicId}`,
      );
    }
  }

  console.log(`✓ ${row.slug}`);
}

console.log("Seeding salesâ€¦");
const now = Date.now();
const day = 86_400_000;
const sales = [
  {
    slug: "winter-clearance",
    name: "Winter Clearance",
    description: "Final reductions across selected seasonal pieces.",
    starts_at: new Date(now - 7 * day).toISOString(),
    ends_at: new Date(now + 14 * day).toISOString(),
    is_active: true,
    is_featured: true,
    products: seed.products.slice(0, 12),
  },
  {
    slug: "spring-preview",
    name: "Spring Preview",
    description: "An upcoming preview of lighter tailoring and occasion pieces.",
    starts_at: new Date(now + 21 * day).toISOString(),
    ends_at: new Date(now + 35 * day).toISOString(),
    is_active: true,
    is_featured: false,
    products: seed.products.slice(12, 20),
  },
  {
    slug: "archive-event",
    name: "Archive Event",
    description: "A completed archive sale retained for reporting and admin testing.",
    starts_at: new Date(now - 60 * day).toISOString(),
    ends_at: new Date(now - 30 * day).toISOString(),
    is_active: false,
    is_featured: false,
    products: seed.products.slice(20, 28),
  },
];
for (const sale of sales) {
  const { products: saleProducts, ...saleRow } = sale;
  const savedSale = await one("sales", saleRow, "slug", `sale ${sale.slug}`);
  const { error: clearSaleProductsError } = await db
    .from("sale_products")
    .delete()
    .eq("sale_id", savedSale.id);
  if (clearSaleProductsError) throw new Error(clearSaleProductsError.message);
  for (const [displayOrder, product] of saleProducts.entries()) {
    await one(
      "sale_products",
      {
        sale_id: savedSale.id,
        product_id: productMap.get(product.slug).id,
        display_order: displayOrder,
      },
      "sale_id,product_id",
      `${sale.slug} product ${displayOrder}`,
    );
  }
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

// Delete existing curated page products for home
await db.from("curated_page_products").delete().eq("curated_page_id", home.id);

// Seed homepage products directly
for (const [i, p] of seed.products.filter((x) => x.is_featured).entries()) {
  await one(
    "curated_page_products",
    {
      curated_page_id: home.id,
      product_id: productMap.get(p.slug).id,
      display_order: i,
    },
    "curated_page_id,product_id",
    `home product ${i}`,
  );
}

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

// Delete existing curated page products for summerEdit
await db.from("curated_page_products").delete().eq("curated_page_id", summerEdit.id);

const summerProductRows = seed.products
  .filter((p) => p.categorySlug === "dresses" || p.categorySlug === "jewellery")
  .slice(0, 4);
for (const [i, p] of summerProductRows.entries()) {
  await one(
    "curated_page_products",
    {
      curated_page_id: summerEdit.id,
      product_id: productMap.get(p.slug).id,
      display_order: i,
    },
    "curated_page_id,product_id",
    `summer product ${i}`,
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

// Delete existing curated page products for minimalistWardrobe
await db.from("curated_page_products").delete().eq("curated_page_id", minimalistWardrobe.id);

const minProductRows = seed.products
  .filter((p) => p.categorySlug === "outerwear" || p.categorySlug === "bags")
  .slice(0, 4);
for (const [i, p] of minProductRows.entries()) {
  await one(
    "curated_page_products",
    {
      curated_page_id: minimalistWardrobe.id,
      product_id: productMap.get(p.slug).id,
      display_order: i,
    },
    "curated_page_id,product_id",
    `minimalist product ${i}`,
  );
}

// Seed blog posts directly into blog_posts table
console.log("Seeding blog posts…");
const posts = [
  {
    title: "The Winter Slip",
    slug: "the-winter-slip",
    excerpt: "Silk cuts for deep winter: bias-laid heavy crepe under shearling.",
    content:
      "The slip dress behaves differently when the temperature drops. We pair a 40mm silk slip with heavy double-faced outerwear — the contrast in textures is quiet but dramatic.",
    status: "published",
    is_featured: true,
    tags: ["trend-report", "quiet-luxury"],
  },
  {
    title: "The Savile Tailor in Fitzroy",
    slug: "the-savile-tailor-in-fitzroy",
    excerpt: "A profile of unstructured tailoring finished by hand in the Melbourne studio.",
    content:
      "Unstructured tailoring requires more care, not less. Without padding to hide the seams, every line must be precise. Julien Okoro works only in linen-wool blends that behave under hot irons.",
    status: "published",
    is_featured: false,
    tags: ["designer-profile", "modern-tailoring"],
  },
];

for (const post of posts) {
  await one(
    "blog_posts",
    {
      ...post,
      published_at: new Date().toISOString(),
    },
    "slug",
    `blog post ${post.slug}`,
  );
}

await one(
  "contact_inquiries",
  {
    name: "Amelia Hart",
    email: "amelia.seed@example.com",
    subject: "Authentication question",
    message: "Could you explain the authentication process for archive pieces?",
    status: "unread",
  },
  "email,subject",
  "contact inquiry",
);
await one(
  "newsletter_subscribers",
  {
    email: "newsletter.seed@example.com",
    status: "subscribed",
  },
  "email",
  "newsletter subscriber",
);

if (!process.env.SEED_TEST_USER_ID) {
  console.log("Skipping carts, wishlists, and orders: SEED_TEST_USER_ID is not configured");
}

console.log(
  `Seed completed\nRecords: ${stats.records}\nImages uploaded: ${stats.images}\nImages reused: ${stats.reused}\nOptional failures: ${stats.optionalFailures}`,
);
