import { describe, expect, it } from "vitest";
import {
  CLOUDINARY_FOLDERS,
  generateCloudinaryPublicId,
  getCloudinaryFolder,
} from "./cloudinary-config";

describe("Cloudinary upload configuration", () => {
  it("maps every entity to its complete approved folder", () => {
    expect(CLOUDINARY_FOLDERS).toEqual({
      banner: "designer-sales/banners",
      category: "designer-sales/categories",
      collection: "designer-sales/collections",
      designer: "designer-sales/designers",
      product: "designer-sales/products",
      sale: "designer-sales/sales",
      seed: "designer-sales/seed",
      variant: "designer-sales/variants",
    });
  });

  it("creates a flat, sanitized public ID without a folder", () => {
    expect(
      generateCloudinaryPublicId({
        entityId: "Product 123",
        imageId: "Image/456",
        fileName: "Front View.JPG",
      }),
    ).toBe("product-123-image-456-front-view");
  });

  it("rejects unsupported entity types at runtime", () => {
    expect(() => getCloudinaryFolder("unknown" as never)).toThrow(
      "Unsupported Cloudinary entity type",
    );
  });
});
