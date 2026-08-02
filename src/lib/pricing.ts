export type EffectivePrice = {
  originalPrice: number;
  currentPrice: number;
  isDiscounted: boolean;
  discountPercentage: number | null;
};

export type PriceableVariant = {
  original_price: number | string | null;
  discounted_price: number | string | null;
  is_active?: boolean;
  stock_quantity?: number;
};

export function isSellableVariant(variant: PriceableVariant | null | undefined) {
  return Boolean(
    variant?.is_active && (variant.stock_quantity ?? 0) > 0 && getEffectivePrice(null, variant),
  );
}

export function getVariantPriceSummary(variants: PriceableVariant[]) {
  const priced = variants
    .filter(isSellableVariant)
    .map((variant) => getEffectivePrice(null, variant))
    .filter((price): price is EffectivePrice => price !== null);
  if (!priced.length) return null;
  const lowest = priced.reduce((best, price) =>
    price.currentPrice < best.currentPrice ? price : best,
  );
  return {
    lowest,
    hasRange: new Set(priced.map((price) => price.currentPrice)).size > 1,
  };
}

export function getEffectivePrice(
  _product: unknown,
  variant?: PriceableVariant | null,
): EffectivePrice | null {
  if (!variant || variant.original_price == null) return null;
  const originalPrice = Number(variant.original_price);
  const discountedPrice =
    variant.discounted_price != null ? Number(variant.discounted_price) : null;
  if (!Number.isFinite(originalPrice) || originalPrice < 0) return null;
  const currentPrice = discountedPrice ?? originalPrice;
  if (!Number.isFinite(currentPrice) || currentPrice < 0 || currentPrice > originalPrice)
    return null;

  const isDiscounted = currentPrice < originalPrice;
  const discountPercentage =
    isDiscounted && originalPrice > 0 ? Math.round((1 - currentPrice / originalPrice) * 100) : null;

  return {
    originalPrice,
    currentPrice,
    isDiscounted,
    discountPercentage,
  };
}
