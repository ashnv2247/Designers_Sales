import { test, expect } from "@playwright/test";

test("Capture DesignerSale Live In-Place Studio", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });

  // 1. Visit Live In-Place Studio (Shop Profile)
  await page.goto("/admin");
  await page.waitForSelector("text=LIVE STUDIO");
  await page.waitForTimeout(1000);

  await page.screenshot({
    path: "C:/Users/DELL/.gemini/antigravity/brain/2aae928b-4f6a-435d-aaf1-4a5ccddb071a/artifacts_media/studio-inplace-shop.png",
    fullPage: false,
  });

  // 2. Open Image Swap Modal on Hero Banner
  const replacePhotoBtn = page.getByRole("button", { name: /Replace Photo \(Cloudinary\)/i });
  await replacePhotoBtn.click();
  await page.waitForSelector("text=Edit Storefront Banner");
  await page.waitForTimeout(500);

  await page.screenshot({
    path: "C:/Users/DELL/.gemini/antigravity/brain/2aae928b-4f6a-435d-aaf1-4a5ccddb071a/artifacts_media/studio-inplace-image-modal.png",
    fullPage: false,
  });

  await page.getByRole("button", { name: /Cancel/i }).click();

  // 3. Switch to City Guide Mode
  await page.getByRole("button", { name: /City Guide/i }).click();
  await page.waitForSelector("text=+ Add Itinerary Walking Stop:");
  await page.waitForTimeout(600);

  await page.screenshot({
    path: "C:/Users/DELL/.gemini/antigravity/brain/2aae928b-4f6a-435d-aaf1-4a5ccddb071a/artifacts_media/studio-inplace-guide.png",
    fullPage: false,
  });

  // 4. Switch to Journal Article Mode
  await page.getByRole("button", { name: /Journal Article/i }).click();
  await page.waitForSelector("text=+ Insert Article Section:");
  await page.waitForTimeout(600);

  await page.screenshot({
    path: "C:/Users/DELL/.gemini/antigravity/brain/2aae928b-4f6a-435d-aaf1-4a5ccddb071a/artifacts_media/studio-inplace-journal.png",
    fullPage: false,
  });
});
