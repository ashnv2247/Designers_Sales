import { describe, expect, it } from "vitest";
import * as seed from "../seed-data/index.js";
import { assertResetAllowed, validateSeedData } from "./validate-seed.js";
import { stablePublicId } from "./cloudinary.js";
describe("seed tooling", () => {
  it("validates the extracted application data", () => expect(validateSeedData(seed)).toEqual([]));
  it("generates deterministic public IDs", () =>
    expect(stablePublicId("src/assets/products/bags-1.jpg")).toBe("products-bags-1"));
  it("guards reset mode", () =>
    expect(() => assertResetAllowed({ NODE_ENV: "development" })).toThrow(
      /ALLOW_DESTRUCTIVE_SEED/,
    ));
  it("requires a second production override", () =>
    expect(() =>
      assertResetAllowed({ NODE_ENV: "production", ALLOW_DESTRUCTIVE_SEED: "true" }),
    ).toThrow(/ALLOW_PRODUCTION/));
});
