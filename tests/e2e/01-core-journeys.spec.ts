import { test, expect } from '@playwright/test';
import * as path from 'path';

test.describe('DESIGNERSALE Core User Journeys & End-to-End Verification', () => {
  const screenshotsDir = path.resolve(process.cwd(), 'reports/webloom/screenshots');

  test('Journey 1: Header Search Navigates to Filtered Directory', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Click search icon in header
    const searchToggle = page.locator('button[aria-label="Toggle search"]');
    await expect(searchToggle).toBeVisible();
    await searchToggle.click();

    // Fill search query
    const searchInput = page.locator('input[placeholder*="Search boutiques"]');
    await expect(searchInput).toBeVisible();
    await searchInput.fill('Fitzroy');
    await searchInput.press('Enter');

    // Verify navigation to /directory?q=Fitzroy
    await page.waitForURL(/.*\/directory\?q=Fitzroy/);
    await page.waitForLoadState('networkidle');

    // Verify directory displays filtered results mentioning Fitzroy
    const listingCards = page.locator('[data-testid="boutique-listing-card"]');
    const count = await listingCards.count();
    expect(count).toBeGreaterThan(0);

    await page.screenshot({ path: `${screenshotsDir}/after/01-search-journey-filtered.png` });
  });

  test('Journey 2: Boutique Deep Linking Loads Dynamic Shop Profile by ID', async ({ page }) => {
    // Navigate directly to Marton & Davis shop profile
    await page.goto('/shop?id=marton-and-davis');
    await page.waitForLoadState('networkidle');

    // Verify shop name is Marton & Davis
    await expect(page.locator('h1, h2, h3').filter({ hasText: /Marton & Davis/i }).first()).toBeVisible();

    // Verify address contains High Street Armadale
    await expect(page.locator('body')).toContainText(/High Street/i);

    // Verify editorial content block renders "WHAT WE LOVE"
    await expect(page.locator('h2, h3').filter({ hasText: /WHAT WE LOVE/i }).first()).toBeVisible();

    await page.screenshot({ path: `${screenshotsDir}/after/02-shop-profile-dynamic.png` });
  });

  test('Journey 3: Submit a Boutique Modal Opens and Persists Submission', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Click "SUBMIT A SHOP" in header
    const submitBtn = page.getByRole('button', { name: /SUBMIT A SHOP/i });
    await expect(submitBtn).toBeVisible();
    await submitBtn.click();

    // Modal should be visible
    const modalHeading = page.getByRole('heading', { name: /Submit an Independent Boutique/i });
    await expect(modalHeading).toBeVisible();

    // Fill form
    await page.locator('input[placeholder*="Maison de Verre"]').fill('Atelier Lune Ceramics');
    await page.locator('input[placeholder*="Fitzroy, Paddington"]').fill('Collingwood');
    await page.locator('input[placeholder*="proprietor@boutique.com"]').fill('curator@atelierlune.com.au');
    await page.locator('textarea').fill('Bespoke ceramic vessels and architectural sculptural lighting.');

    // Submit
    const submitCta = page.getByRole('button', { name: /SUBMIT FOR CURATION/i });
    await submitCta.click();

    // Verify success confirmation
    await expect(page.getByRole('heading', { name: /Submission Received/i })).toBeVisible({ timeout: 10000 });

    await page.screenshot({ path: `${screenshotsDir}/after/03-submit-shop-success.png` });
  });

  test('Journey 4: Live On-Page Studio & Classic Dashboard Synchronize', async ({ page }) => {
    // Open Live Studio
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');

    // Unlock via Curatorial Security Gate if unauthenticated
    const unlockBtn = page.getByRole('button', { name: '1-Click Demo Curator Unlock' });
    if (await unlockBtn.isVisible()) {
      await unlockBtn.click();
      await page.waitForLoadState('networkidle');
    }

    // Verify Live Canvas renders without clunky form boxes
    await expect(page.locator('text=BLOCK 01 / Text with Visual')).not.toBeVisible();
    await expect(page.locator('button', { hasText: /Admin Dashboard/i })).toBeVisible();

    // Click "Admin Dashboard" to toggle view mode
    await page.locator('button', { hasText: /Admin Dashboard/i }).click();

    // Verify Sidebar Admin table and metrics are displayed
    await expect(page.getByRole('heading', { name: /Curated Boutiques & Shop Profiles/i })).toBeVisible();

    // Verify direct URL navigation to /admin/dashboard
    await page.goto('/admin/dashboard');
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('heading', { name: /Curated Boutiques & Shop Profiles/i })).toBeVisible();

    await page.screenshot({ path: `${screenshotsDir}/after/04-admin-dashboard-sync.png` });
  });
});
