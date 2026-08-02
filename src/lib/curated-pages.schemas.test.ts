import { describe, expect, it } from "vitest";
import { curatedPageSchema, pagePublishingErrors, slugify } from "./curated-pages.schemas";
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
  it("blocks empty page on publish", () => expect(pagePublishingErrors(0)).toHaveLength(1));
  it("allows page with products on publish", () => expect(pagePublishingErrors(2)).toHaveLength(0));
});
