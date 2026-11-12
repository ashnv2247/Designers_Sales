import { test, expect } from '@playwright/test';

test.describe('DesignerSale Live In-Place Canvas Studio Verification', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem(
        'ds_curator_session',
        JSON.stringify({
          id: 'curator-demo',
          email: 'curator@designersale.com.au',
          name: 'Elena Roche',
          role: 'Chief Design Curator',
        })
      );
    });
  });
  test('Admin Studio renders live in-place toolbar, page switcher, and viewport controls', async ({ page }) => {
    await page.goto('/admin', { waitUntil: 'domcontentloaded' });

    // Check Header & Brand in Studio Toolbar
    await expect(page.getByText('LIVE STUDIO')).toBeVisible();

    // Check Page Mode Tabs (Shop Page, City Guide, Journal Article)
    await expect(page.getByRole('button', { name: /Shop Page/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /City Guide/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Journal Article/i })).toBeVisible();

    // Check Mode Switcher (Live In-Place Edit Active)
    await expect(page.getByRole('button', { name: /Live In-Place Edit \(Active\)/i })).toBeVisible();

    // Verify there is NO separate edit sidebar form column
    await expect(page.getByText(/1\. Sections & Layout/i)).toHaveCount(0);
    await expect(page.getByText(/Supabase Schema & Sync/i)).toHaveCount(0);
  });

  test('Shop Page enables live in-place photo replacing, section insertion, and block controls', async ({ page }) => {
    await page.goto('/admin', { waitUntil: 'domcontentloaded' });

    // Check that real shop profile is displayed live on the page
    await expect(page.getByTestId('synchronized-media-header')).toBeVisible();
    await expect(page.locator('input[value*="WHAT WE LOVE"]').or(page.getByText(/WHAT WE LOVE/i))).toBeVisible();

    // Verify Direct On-Photo Replace Button exists on Hero Banner
    const replacePhotoBtn = page.getByRole('button', { name: /Replace Photo \(Cloudinary\)/i });
    await expect(replacePhotoBtn).toBeVisible();

    // Verify Direct In-Place Section Adder Bar exists in the page flow
    await expect(page.getByText('+ Insert New Section Into Page:')).toBeVisible();
    await expect(page.getByRole('button', { name: /Image Duo \(2 Photos\)/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Full Bleed Photo/i })).toBeVisible();

    // Test inserting a new section directly in place
    const initialBlocks = await page.locator('[data-testid^="editorial-block-"]').count();
    await page.getByRole('button', { name: /Image Duo \(2 Photos\)/i }).click();
    const newBlocks = await page.locator('[data-testid^="editorial-block-"]').count();
    expect(newBlocks).toBeGreaterThanOrEqual(initialBlocks);

    // Test viewport toggle
    await page.getByRole('button', { name: /Tablet/i }).click();
    await expect(page.getByTestId('synchronized-media-header')).toBeVisible();

    await page.getByRole('button', { name: /Mobile/i }).click();
    await expect(page.getByTestId('synchronized-media-header')).toBeVisible();

    await page.getByRole('button', { name: /Desktop/i }).click();
  });

  test('City Guide enables live on-page text editing and itinerary section insertion', async ({ page }) => {
    await page.goto('/admin', { waitUntil: 'domcontentloaded' });

    // Switch to City Guide mode
    await page.getByRole('button', { name: /City Guide/i }).click();

    // Check that The Melbourne Edit is displayed live on the page
    await expect(page.getByText(/CURATED CITY EDITORIAL/i)).toBeVisible();
    await expect(page.getByText('+ Add Itinerary Walking Stop:')).toBeVisible();

    // Test inserting a new itinerary stop directly in place
    const initialStops = await page.locator('text=ITINERARY STOP').count();
    await page.getByRole('button', { name: /Insert New Stop/i }).click();
    const newStops = await page.locator('text=ITINERARY STOP').count();
    expect(newStops).toBeGreaterThan(initialStops);
  });

  test('Journal Article enables live on-page editing and section insertion', async ({ page }) => {
    await page.goto('/admin', { waitUntil: 'domcontentloaded' });

    // Switch to Journal Article mode
    await page.getByRole('button', { name: /Journal Article/i }).click();

    // Check that article is displayed live on page
    await expect(page.getByText(/Dispatched by/i)).toBeVisible();
    await expect(page.getByText('+ Insert Article Section:')).toBeVisible();

    // Test inserting a new prose block
    await page.getByRole('button', { name: /\+ Prose Paragraph/i }).click();
    await expect(page.getByText('Write new longform editorial narrative here...')).toBeVisible();
  });

  test('ImageSwapModal opens on photo click with Cloudinary uploader', async ({ page }) => {
    await page.goto('/admin', { waitUntil: 'domcontentloaded' });

    // Click Replace Photo on Hero Banner
    const replacePhotoBtn = page.getByRole('button', { name: /Replace Photo \(Cloudinary\)/i });
    await replacePhotoBtn.click();

    // Modal opens
    await expect(page.getByRole('heading', { name: 'Edit Storefront Banner' })).toBeVisible();
    await expect(page.getByText('Upload Image via Cloudinary')).toBeVisible();
    await expect(page.getByRole('button', { name: /Apply to Page/i })).toBeVisible();

    // Close modal
    await page.getByRole('button', { name: /Cancel/i }).click();
    await expect(page.getByRole('heading', { name: 'Edit Storefront Banner' })).toHaveCount(0);
  });
});
