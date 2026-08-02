import { describe, expect, it } from "vitest";
import type { CuratedPageData } from "@/lib/curated-public.types";

describe("public curated page system", () => {
  it("structures CuratedPageData properly with direct products list", () => {
    const page: CuratedPageData = {
      id: "page-1",
      title: "Designer Clearance",
      slug: "designer-clearance",
      subtitle: "Clearance deals",
      description: "Editorial edit",
      heroImageUrl: "https://example.com/hero.jpg",
      mobileHeroImageUrl: "https://example.com/hero-mobile.jpg",
      seoTitle: "Designer Clearance | DesignerSale",
      seoDescription: "Clearance deals",
      publishedAt: new Date().toISOString(),
      status: "published",
      products: [
        {
          id: "prod-1",
          name: "Silk Gown",
          designer: "Zimmermann",
          price: "$850",
          was: "$1,200",
          image: "https://example.com/image.jpg",
          alt: "Silk Gown",
        },
      ],
    };

    expect(page.status).toBe("published");
    expect(page.products).toHaveLength(1);
    expect(page.products[0].name).toBe("Silk Gown");
  });
});
