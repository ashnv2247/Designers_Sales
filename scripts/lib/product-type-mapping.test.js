import { describe, expect, it } from "vitest";
import { resolveProductType } from "./product-type-mapping.js";

const types = [
  { id: "dress", category_id: "clothing", slug: "designer-dresses", name: "Designer Dresses" },
  { id: "coat", category_id: "clothing", slug: "coats", name: "Coats" },
  { id: "bag", category_id: "bags", slug: "totes", name: "Totes" },
];

describe("resolveProductType", () => {
  it("uses the only type in a category", () => {
    expect(resolveProductType({ category_id: "bags" }, types).type.id).toBe("bag");
  });
  it("matches a unique type name without crossing categories", () => {
    expect(resolveProductType({ category_id: "clothing", name: "Black Designer Dresses", tags: [] }, types).type.id).toBe("dress");
  });
  it("does not guess between multiple candidates", () => {
    expect(resolveProductType({ category_id: "clothing", name: "Archive piece", tags: [] }, types).status).toBe("unmapped");
  });
});
