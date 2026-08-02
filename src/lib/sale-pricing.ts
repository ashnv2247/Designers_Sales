export type SaleDiscountType = "percentage" | "fixed_amount" | "final_price";
export type SaleDiscountBase = "original_price" | "current_price";

export type SaleDiscountRule = {
  discount_type: SaleDiscountType | null;
  discount_base: SaleDiscountBase;
  discount_value: number | string | null;
};

export type SaleRelation = SaleDiscountRule & {
  sale_price?: number | string | null;
  sales?: {
    id: string;
    name: string;
    is_active: boolean;
    starts_at: string | null;
    ends_at: string | null;
  } | null;
};

export type ResolvedProductPrice = {
  currency: string;
  originalPrice: number;
  currentPrice: number;
  salePrice: number | null;
  effectivePrice: number;
  hasProductDiscount: boolean;
  hasActiveSale: boolean;
  existingSaving: number;
  additionalSaleSaving: number;
  totalSaving: number;
  productDiscountPercentage: number;
  additionalSaleDiscountPercentage: number;
  effectiveDiscountPercentage: number;
  activeSaleId: string | null;
  activeSaleName: string | null;
  saleStartsAt: string | null;
  saleEndsAt: string | null;
};

const toMinor = (value: number) => Math.round((value + Number.EPSILON) * 100);
const fromMinor = (value: number) => value / 100;
const percentage = (saving: number, base: number) =>
  base > 0 ? Math.round((saving / base) * 10_000) / 100 : 0;

export function calculateSalePrice({
  originalPrice,
  currentPrice,
  discountType,
  discountBase,
  discountValue,
}: {
  originalPrice: number;
  currentPrice: number;
  discountType: SaleDiscountType;
  discountBase: SaleDiscountBase;
  discountValue: number;
}) {
  if (![originalPrice, currentPrice, discountValue].every(Number.isFinite))
    throw new Error("Prices and discount value must be valid numbers.");
  if (originalPrice < 0 || currentPrice < 0) throw new Error("Product prices must be valid.");
  if (discountValue < 0) throw new Error("Discount value cannot be negative.");

  const originalMinor = toMinor(originalPrice);
  const currentMinor = toMinor(currentPrice);
  const baseMinor = discountBase === "original_price" ? originalMinor : currentMinor;
  let saleMinor: number;

  if (discountType === "percentage") {
    if (discountValue > 100) throw new Error("Percentage discount cannot exceed 100%.");
    saleMinor = Math.round((baseMinor * (10_000 - Math.round(discountValue * 100))) / 10_000);
  } else if (discountType === "fixed_amount") {
    const discountMinor = toMinor(discountValue);
    if (discountMinor > baseMinor) throw new Error("Fixed discount cannot exceed the base price.");
    saleMinor = baseMinor - discountMinor;
  } else {
    saleMinor = toMinor(discountValue);
  }

  if (saleMinor < 0) throw new Error("Sale price cannot be negative.");
  if (saleMinor > originalMinor) throw new Error("Sale price cannot exceed the original price.");
  if (saleMinor > currentMinor)
    throw new Error("Sale price cannot exceed the current selling price.");
  return fromMinor(saleMinor);
}

export function isSaleActive(sale: SaleRelation["sales"], now: Date = new Date()) {
  if (!sale?.is_active) return false;
  const time = now.getTime();
  return (
    (!sale.starts_at || new Date(sale.starts_at).getTime() <= time) &&
    (!sale.ends_at || new Date(sale.ends_at).getTime() > time)
  );
}

export function resolveProductPrice({
  originalPrice,
  currentPrice,
  currency,
  sales = [],
  now = new Date(),
}: {
  originalPrice: number;
  currentPrice: number;
  currency: string;
  sales?: SaleRelation[];
  now?: Date;
}): ResolvedProductPrice {
  const candidates = sales
    .filter((relation) => isSaleActive(relation.sales, now) && relation.discount_type)
    .map((relation) => {
      try {
        return {
          relation,
          price: calculateSalePrice({
            originalPrice,
            currentPrice,
            discountType: relation.discount_type!,
            discountBase: relation.discount_base,
            discountValue: Number(relation.discount_value),
          }),
        };
      } catch {
        return null;
      }
    })
    .filter((entry): entry is NonNullable<typeof entry> => entry !== null)
    .sort((a, b) => a.price - b.price);
  const winning = candidates[0] ?? null;
  const salePrice = winning?.price ?? null;
  const effectivePrice = salePrice ?? currentPrice;
  const existingSaving = Math.max(0, originalPrice - currentPrice);
  const additionalSaleSaving = Math.max(0, currentPrice - effectivePrice);
  const totalSaving = Math.max(0, originalPrice - effectivePrice);

  return {
    currency,
    originalPrice,
    currentPrice,
    salePrice,
    effectivePrice,
    hasProductDiscount: currentPrice < originalPrice,
    hasActiveSale: salePrice !== null && salePrice < currentPrice,
    existingSaving,
    additionalSaleSaving,
    totalSaving,
    productDiscountPercentage: percentage(existingSaving, originalPrice),
    additionalSaleDiscountPercentage: percentage(additionalSaleSaving, currentPrice),
    effectiveDiscountPercentage: percentage(totalSaving, originalPrice),
    activeSaleId: winning?.relation.sales?.id ?? null,
    activeSaleName: winning?.relation.sales?.name ?? null,
    saleStartsAt: winning?.relation.sales?.starts_at ?? null,
    saleEndsAt: winning?.relation.sales?.ends_at ?? null,
  };
}

export function formatCurrency(value: number, currency = "AUD") {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}
