import { describe, expect, it } from "vitest";
import { normalizedProductOptions, withNormalizedOptions } from "./product-options";

describe("normalized product options", () => {
  const product = {
    id: "product-1",
    product_variants: [
      {
        color_name: "Ink",
        color_hex: "#111111",
        size: "S",
        stock_quantity: 2,
        original_price: 100,
        is_active: true,
      },
      {
        color_name: "Ink",
        color_hex: "#111111",
        size: "M",
        stock_quantity: 0,
        original_price: 100,
        is_active: true,
      },
      {
        color_name: "Ivory",
        color_hex: "#fffff0",
        size: "S",
        stock_quantity: 5,
        original_price: 100,
        is_active: false,
      },
    ],
    product_images: [
      {
        color_name: "Ink",
        image_url: "ink-2.jpg",
        image_public_id: "ink-2",
        is_primary: false,
        display_order: 2,
      },
      {
        color_name: "Ink",
        image_url: "ink-1.jpg",
        image_public_id: "ink-1",
        is_primary: true,
        display_order: 1,
      },
    ],
  };

  it("derives availability, sizes and ordered images from normalized rows", () => {
    const options = normalizedProductOptions(product);
    expect(options).toHaveLength(1);
    expect(options[0]).toMatchObject({ name: "Ink", isDefault: true, isAvailable: true });
    expect(options[0].sizes).toEqual([
      { name: "S", available: true, stock: 2 },
      { name: "M", available: false, stock: 0 },
    ]);
    expect(options[0].images.map((image) => image.url)).toEqual(["ink-1.jpg", "ink-2.jpg"]);
  });

  it("adds the compatibility option shape without removing normalized data", () => {
    const mapped = withNormalizedOptions(product);
    expect(mapped.product_variants).toBe(product.product_variants);
    expect(mapped.options[0].name).toBe("Ink");
  });
});
