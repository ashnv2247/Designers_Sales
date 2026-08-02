import { describe, expect, it } from "vitest";
import { getEffectivePrice, getVariantPriceSummary, isSellableVariant } from "./pricing";

describe("variant-authoritative pricing", () => {
  it("does not fall back to product pricing", () => {
    expect(getEffectivePrice({ original_price: 100 }, null)).toBeNull();
    expect(
      getEffectivePrice({ original_price: 100 }, { original_price: null, discounted_price: null }),
    ).toBeNull();
  });

  it("uses the selected variant original and sale prices", () => {
    expect(getEffectivePrice(null, { original_price: 150, discounted_price: 120 })).toEqual({
      originalPrice: 150,
      currentPrice: 120,
      isDiscounted: true,
      discountPercentage: 20,
    });
  });

  it("only treats active, stocked, priced variants as sellable", () => {
    expect(
      isSellableVariant({
        original_price: 100,
        discounted_price: null,
        is_active: true,
        stock_quantity: 1,
      }),
    ).toBe(true);
    expect(
      isSellableVariant({
        original_price: null,
        discounted_price: null,
        is_active: true,
        stock_quantity: 1,
      }),
    ).toBe(false);
  });

  it("returns the lowest sellable price and range state", () => {
    const summary = getVariantPriceSummary([
      { original_price: 150, discounted_price: null, is_active: true, stock_quantity: 1 },
      { original_price: 120, discounted_price: 100, is_active: true, stock_quantity: 2 },
      { original_price: 50, discounted_price: null, is_active: true, stock_quantity: 0 },
    ]);
    expect(summary?.lowest.currentPrice).toBe(100);
    expect(summary?.hasRange).toBe(true);
  });
});
