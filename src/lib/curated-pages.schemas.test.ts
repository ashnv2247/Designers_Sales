import { describe, expect, it } from "vitest";
import {
  curatedPageSchema,
  curatedSectionSchema,
  publishingErrors,
  slugify,
} from "./curated-pages.schemas";
describe("curated page validation", () => {
  it("creates safe slugs", () =>
    expect(slugify("  Summer & Silk 2026! ")).toBe("summer-silk-2026"));
  it("enforces database limits", () =>
    expect(
      curatedPageSchema.safeParse({
        title: "x",
        slug: "x",
        status: "draft",
        seo_title: "x".repeat(256),
      }).success,
    ).toBe(false));
  it("requires valid links", () =>
    expect(
      curatedSectionSchema.safeParse({
        curated_page_id: crypto.randomUUID(),
        section_type: "hero",
        display_order: 0,
        is_active: true,
        item_ids: [],
        categories: [],
        link_url: "javascript:alert(1)",
      }).success,
    ).toBe(false));
  it("blocks active empty relational sections", () =>
    expect(
      publishingErrors([{ section_type: "products", is_active: true, item_count: 0 }]),
    ).toHaveLength(1));
  it("allows inactive empty relational sections", () =>
    expect(
      publishingErrors([{ section_type: "products", is_active: false, item_count: 0 }]),
    ).toHaveLength(0));
});
