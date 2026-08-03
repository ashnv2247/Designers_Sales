export function normalizeProductType(value = "") {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function resolveProductType(product, productTypes) {
  const candidates = productTypes.filter((type) => type.category_id === product.category_id);
  if (product.product_type_id) {
    const current = candidates.find((type) => type.id === product.product_type_id);
    return current
      ? { status: "valid", type: current, reason: "existing relationship" }
      : { status: "unmapped", candidates, reason: "existing type does not match category" };
  }
  if (candidates.length === 1)
    return { status: "mapped", type: candidates[0], reason: "only type in category" };
  const haystack = normalizeProductType(
    [product.slug, product.name, ...(product.tags ?? [])].join(" "),
  );
  const matches = candidates.filter((type) => {
    const slug = normalizeProductType(type.slug),
      name = normalizeProductType(type.name);
    return (slug && haystack.includes(slug)) || (name && haystack.includes(name));
  });
  if (matches.length === 1)
    return { status: "mapped", type: matches[0], reason: "unique slug/name match" };
  return {
    status: matches.length > 1 ? "ambiguous" : "unmapped",
    candidates: matches.length ? matches : candidates,
    reason: matches.length > 1 ? "multiple text matches" : "no unambiguous match",
  };
}
