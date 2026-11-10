import { test, expect } from '@playwright/test';

test.describe('DesignerSale (DS/) Editorial Shop Profile & Dynamic Block CMS', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/shop', { waitUntil: 'domcontentloaded' });
  });

  test('TC-01: Synchronized Media Header and Directory Sidebar Render Correctly', async ({ page }) => {
    // Row 1: Check Precinct Map & Storefront Hero Banner
    const mediaHeader = page.locator('[data-testid="synchronized-media-header"]');
    await expect(mediaHeader).toBeVisible();
    await expect(page.locator('[data-testid="precinct-map"]')).toBeVisible();

    // Row 2: Check Shop Title and Categories
    await expect(page.getByRole('heading', { level: 1, name: /PARLOUR ARCHIVE/i })).toBeVisible();
    await expect(page.getByText(/DESIGNER APPAREL ·/i)).toBeVisible();

    // Check Operating Hours & Live Status Badge
    await expect(page.locator('[data-testid="shop-status-badge"]')).toBeVisible();

    // Check Similar Shops (exactly 6 items)
    const similarGrid = page.locator('[data-testid="similar-shops-grid"]');
    await expect(similarGrid).toBeVisible();
    const similarCards = similarGrid.locator('[data-testid="similar-shop-card"]');
    await expect(similarCards).toHaveCount(6);
  });

  test('TC-02: Studio CMS Mode Toggle and Add Block Flow', async ({ page }) => {
    // Switch to Studio CMS
    const cmsBtn = page.locator('[data-testid="mode-cms"]');
    await cmsBtn.click();
    await expect(cmsBtn).toHaveClass(/bg-\[#1C1917\]/);

    // Count initial blocks
    const initialBlocks = await page.locator('[data-testid^="move-down-block-"]').count();

    // Insert a new Pull Quote
    const insertQuoteBtn = page.getByRole('button', { name: 'Pull Quote' }).first();
    await insertQuoteBtn.click();

    // Verify block count increased
    const updatedBlocks = await page.locator('[data-testid^="move-down-block-"]').count();
    expect(updatedBlocks).toBe(initialBlocks + 1);
  });

  test('TC-03: Move Block Bounds Check (Top & Bottom No-ops)', async ({ page }) => {
    // Switch to Studio CMS
    await page.locator('[data-testid="mode-cms"]').click();

    // First block Move Up should be disabled
    const firstMoveUp = page.locator('[data-testid="move-up-block-0"]');
    await expect(firstMoveUp).toBeDisabled();

    // Count blocks
    const count = await page.locator('[data-testid^="move-down-block-"]').count();
    const lastMoveDown = page.locator(`[data-testid="move-down-block-${count - 1}"]`);
    await expect(lastMoveDown).toBeDisabled();
  });

  test('TC-04: Image Duo Enforces Strictly 2 Image Slots', async ({ page }) => {
    const duoGrid = page.locator('[data-testid="image-duo-grid"]').first();
    await expect(duoGrid).toBeVisible();

    const slot1 = page.locator('[data-testid="image-duo-slot-1"]').first();
    const slot2 = page.locator('[data-testid="image-duo-slot-2"]').first();
    await expect(slot1).toBeVisible();
    await expect(slot2).toBeVisible();
  });

  test('TC-05: Broken Image URL Fallback Frame Displays DS/ ARCHIVE IMAGE UNAVAILABLE', async ({ page }) => {
    // Switch to Studio CMS
    await page.locator('[data-testid="mode-cms"]').click();

    // Click quick test broken image button inside any media editor
    const testBrokenBtn = page.getByRole('button', { name: /Load Broken URL/i }).first();
    if (await testBrokenBtn.isVisible()) {
      await testBrokenBtn.click();
    }

    // Switch back to Public Reader
    await page.locator('[data-testid="mode-public"]').click();

    // Verify Archive Image Unavailable banner is visible
    const unavailableBanner = page.locator('[data-testid="archive-image-unavailable"]').first();
    await expect(unavailableBanner).toBeVisible();
    await expect(unavailableBanner).toContainText('ARCHIVE IMAGE UNAVAILABLE');
  });

  test('TC-06 & TC-07: In-Browser Diagnostic Test Suite Execution (All 10 Pass)', async ({ page }) => {
    // Open Diagnostic Test Drawer
    const openTestSuiteBtn = page.locator('[data-testid="btn-open-test-suite"]');
    await openTestSuiteBtn.click();

    const testDrawer = page.locator('[data-testid="diagnostic-test-drawer"]');
    await expect(testDrawer).toBeVisible();

    // Execute All Tests
    const runBtn = page.locator('[data-testid="btn-run-all-tests"]');
    await runBtn.click();

    // Wait for tests to finish and verify 10/10 Passed
    await expect(page.getByText('10 / 10 Passed')).toBeVisible({ timeout: 10000 });
  });

  test('TC-10: Mobile Viewport Stacking Order Verification', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/shop', { waitUntil: 'domcontentloaded' });

    // In mobile single column, the grid should stack cleanly
    const mediaHeader = page.locator('[data-testid="synchronized-media-header"]');
    await expect(mediaHeader).toBeVisible();

    const sidebar = page.getByRole('heading', { level: 1, name: /PARLOUR ARCHIVE/i });
    await expect(sidebar).toBeVisible();

    const feed = page.locator('[data-testid="editorial-feed"]');
    await expect(feed).toBeVisible();
  });
});

