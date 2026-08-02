import { describe, expect, it } from "vitest";
import { calculateSalePrice, formatCurrency, resolveProductPrice } from "./sale-pricing";

describe("sale pricing", () => {
  it.each([
    ["percentage", "current_price", 15, 680],
    ["percentage", "original_price", 32, 680],
    ["fixed_amount", "current_price", 120, 680],
    ["final_price", "current_price", 680, 680],
    ["percentage", "current_price", 0, 800],
    ["percentage", "current_price", 100, 0],
  ] as const)("calculates %s from %s", (discountType, discountBase, discountValue, expected) => {
    expect(
      calculateSalePrice({
        originalPrice: 1000,
        currentPrice: 800,
        discountType,
        discountBase,
        discountValue,
      }),
    ).toBe(expected);
  });

  it.each([
    ["negative", { discountType: "percentage", discountBase: "current_price", discountValue: -1 }],
    [
      "over 100%",
      { discountType: "percentage", discountBase: "current_price", discountValue: 101 },
    ],
    [
      "fixed over base",
      { discountType: "fixed_amount", discountBase: "current_price", discountValue: 801 },
    ],
    [
      "above current",
      { discountType: "percentage", discountBase: "original_price", discountValue: 15 },
    ],
  ] as const)("rejects %s", (_name, input) => {
    expect(() =>
      calculateSalePrice({ originalPrice: 1000, currentPrice: 800, ...input }),
    ).toThrow();
  });

  it("ignores future, expired and inactive sales and selects the lowest active price", () => {
    const now = new Date("2026-08-03T12:00:00Z");
    const relation = (id: string, value: number, extra = {}) => ({
      discount_type: "final_price" as const,
      discount_base: "current_price" as const,
      discount_value: value,
      sales: { id, name: id, is_active: true, starts_at: null, ends_at: null, ...extra },
    });
    const result = resolveProductPrice({
      originalPrice: 1000,
      currentPrice: 800,
      currency: "AUD",
      now,
      sales: [
        relation("higher", 700),
        relation("lowest", 650),
        relation("future", 500, { starts_at: "2026-08-04T00:00:00Z" }),
        relation("expired", 400, { ends_at: "2026-08-03T12:00:00Z" }),
        relation("inactive", 300, { is_active: false }),
      ],
    });
    expect(result.effectivePrice).toBe(650);
    expect(result.activeSaleId).toBe("lowest");
    expect(result.totalSaving).toBe(350);
    expect(result.additionalSaleSaving).toBe(150);
  });

  it("formats AUD without hardcoded symbols", () => {
    expect(formatCurrency(1234.5, "AUD")).toContain("1,234.5");
  });
});
