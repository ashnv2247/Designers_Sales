import { describe, expect, it } from "vitest";
import { getCloudinaryImageUrl, isCloudinaryUrl } from "./cloudinary-images";
describe("Cloudinary delivery helpers", () => {
  it("recognizes only Cloudinary delivery hosts", () => {
    expect(isCloudinaryUrl("https://res.cloudinary.com/demo/image/upload/x.jpg")).toBe(true);
    expect(isCloudinaryUrl("/local.jpg")).toBe(false);
  });
  it("adds the selected transformation", () =>
    expect(
      getCloudinaryImageUrl("https://res.cloudinary.com/demo/image/upload/x.jpg", "card"),
    ).toContain("/f_auto,q_auto,c_fill,w_600,h_750/"));
});
