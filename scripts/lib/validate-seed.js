export function validateSeedData(data) {
  const errors = [];
  const unique = (rows, key, label) => {
    const seen = new Set();
    for (const row of rows) {
      if (!row[key]) errors.push(`${label} missing ${key}`);
      else if (seen.has(row[key])) errors.push(`Duplicate ${label} ${key}: ${row[key]}`);
      seen.add(row[key]);
    }
  };
  unique(data.categories, "slug", "category");
  unique(data.brands, "slug", "brand");
  unique(data.merchants, "slug", "merchant");
  unique(data.products, "slug", "product");
  unique(
    data.products.map((p) => p.variant),
    "sku",
    "variant",
  );
  const cats = new Set(data.categories.map((x) => x.slug)),
    brands = new Set(data.brands.map((x) => x.slug)),
    merchants = new Set(data.merchants.map((x) => x.slug));
  for (const p of data.products) {
    if (!cats.has(p.categorySlug)) errors.push(`${p.slug}: unknown category`);
    if (!brands.has(p.brandSlug)) errors.push(`${p.slug}: unknown brand`);
    if (!merchants.has(p.merchantSlug)) errors.push(`${p.slug}: unknown merchant`);
    if (!p.images.some((x) => x.primary)) errors.push(`${p.slug}: primary image required`);
    if (p.variant.original_price < 0 || p.variant.stock_quantity < 0)
      errors.push(`${p.slug}: invalid price or stock`);
    if (p.variant.discounted_price != null && p.variant.discounted_price > p.variant.original_price)
      errors.push(`${p.slug}: discount exceeds original price`);
  }
  return errors;
}
export function assertResetAllowed(env = process.env) {
  if (env.ALLOW_DESTRUCTIVE_SEED !== "true")
    throw new Error("Reset requires ALLOW_DESTRUCTIVE_SEED=true");
  if (env.NODE_ENV === "production" && env.ALLOW_PRODUCTION_SEED_RESET !== "true")
    throw new Error("Production reset requires ALLOW_PRODUCTION_SEED_RESET=true");
}
