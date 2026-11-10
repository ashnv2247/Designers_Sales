import { test, expect } from '@playwright/test';

test.describe('DesignerSale Landing Page Complete Verification', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
  });

  test('Header renders with DS/ logo, wordmark, search, and navigation', async ({ page }) => {
    await expect(page.locator('h1').first()).toContainText('DESIGNERSALE');
    await expect(page.locator('text=THE VISUAL DISCOVERY DIRECTORY').first()).toBeVisible();
    await expect(page.locator('header >> text=EST. 2012')).toBeVisible();

    // Check navigation items
    for (const item of ['SHOPS', 'CITIES', 'GUIDES', 'DESIGNERS', 'JOURNAL']) {
      await expect(page.locator(`nav >> text=${item}`).first()).toBeVisible();
    }
  });

  test('Search drawer toggles and allows typing search query', async ({ page }) => {
    const searchBtn = page.locator('button[aria-label="Toggle search"]');
    await expect(searchBtn).toBeVisible();
    await searchBtn.click();

    const searchInput = page.locator('input[placeholder*="Search boutiques"]');
    await expect(searchInput).toBeVisible();
    await searchInput.fill('Aesop Melbourne');
    await expect(searchInput).toHaveValue('Aesop Melbourne');

    const closeBtn = page.locator('button:has(svg.lucide-x)');
    await closeBtn.click();
    await expect(searchInput).not.toBeVisible();
  });

  test('Mobile navigation drawer opens and closes', async ({ page }) => {
    const menuBtn = page.locator('button[aria-label="Open menu"]');
    await expect(menuBtn).toBeVisible();
    await menuBtn.click();

    const drawer = page.locator('.fixed.inset-0');
    await expect(drawer).toBeVisible();
    await expect(drawer.getByText('EST. 2012 — AUSTRALIA')).toBeVisible();

    const closeBtn = page.locator('button[aria-label="Close menu"]');
    await closeBtn.click();
    await expect(drawer).not.toBeVisible();
  });

  test('Hero section renders correct Australian boutique headline and CTA', async ({ page }) => {
    await expect(page.locator('text=01 / AUSTRALIA')).toBeVisible();
    await expect(page.getByText('Discover', { exact: true })).toBeVisible();
    await expect(page.getByText('Independent', { exact: true })).toBeVisible();
    await expect(page.getByText('Boutiques', { exact: true })).toBeVisible();
    await expect(page.locator('text=EXPLORE SHOPS')).toBeVisible();
  });

  test('Explore strip and Latest Discoveries sections render', async ({ page }) => {
    await expect(page.locator('text=EXPLORE BY').first()).toBeVisible();
    for (const city of ['MELBOURNE', 'SYDNEY', 'BRISBANE', 'PERTH', 'ADELAIDE']) {
      await expect(page.locator(`#explore-section >> text=${city}`).first()).toBeVisible();
    }
    await expect(page.locator('text=LATEST DISCOVERIES')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'MARTON & DAVIS', exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'KEEP', exact: true })).toBeVisible();
  });

  test('Featured guide section renders The Melbourne Edit', async ({ page }) => {
    await expect(page.locator('text=FEATURED GUIDE')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'The Melbourne Edit' })).toBeVisible();
    await expect(page.locator('text=READ THE GUIDE')).toBeVisible();
  });

  test('Stats banner displays 4 key editorial indicators', async ({ page }) => {
    await expect(page.locator('text=480+')).toBeVisible();
    await expect(page.locator('text=CURATED BOUTIQUES')).toBeVisible();
    await expect(page.locator('text=12').first()).toBeVisible();
    await expect(page.locator('text=CITIES & COASTAL TOWNS')).toBeVisible();
    await expect(page.locator('text=100%')).toBeVisible();
    await expect(page.locator('text=VERIFIED INDEPENDENT')).toBeVisible();
  });

  test('Interactive Directory allows filtering by city and category', async ({ page }) => {
    await expect(page.locator('text=Explore Australian Boutiques')).toBeVisible();

    // Click Sydney filter
    const sydneyBtn = page.locator('#shops button:has-text("Sydney")');
    await sydneyBtn.click();
    await expect(page.locator('#shops').getByText('Keep Studio & Gallery')).toBeVisible();
    await expect(page.locator('#shops').getByText('Stitch & Tickle')).toBeVisible();

    // Click Ceramics & Home category filter
    const ceramicsBtn = page.locator('#shops button:has-text("Ceramics & Home")');
    await ceramicsBtn.click();
    await expect(page.locator('#shops').getByText('Keep Studio & Gallery')).toBeVisible();

    // Click a boutique card to open modal details
    await page.locator('#shops').getByText('Keep Studio & Gallery').click();
    await expect(page.locator('text=CURATOR\'S NOTE')).toBeVisible();
    await expect(page.locator('text=A light-drenched terrace showcasing tactile ceramics')).toBeVisible();

    // Close modal
    const closeDetail = page.locator('button[aria-label="Close details"]');
    await closeDetail.click();
    await expect(closeDetail).not.toBeVisible();
  });

  test('Designer Spotlight & Precincts sections render correctly', async ({ page }) => {
    await expect(page.locator('text=The Quiet Precision of Antipodean Luxury')).toBeVisible();
    await expect(page.locator('text=Christopher Esber').first()).toBeVisible();
    await expect(page.locator('text=Historic Shopping Quarters')).toBeVisible();
    await expect(page.locator('text=Fitzroy & Collingwood')).toBeVisible();
  });

  test('Journal and Footer sections render with newsletter subscription', async ({ page }) => {
    await expect(page.locator('text=Essays, City Edits & Conversations')).toBeVisible();
    await expect(page.locator('text=The Architecture of Gertrude Street')).toBeVisible();
    await expect(page.locator('text=Receive Curated Boutique Additions & City Guides')).toBeVisible();

    // Test newsletter submission
    const emailInput = page.locator('input[placeholder="Enter your email address..."]');
    await emailInput.fill('editor@designersale.com.au');
    const subscribeBtn = page.locator('button:has-text("SUBSCRIBE")');
    await subscribeBtn.click();
    await expect(page.locator('text=Thank you. You are now subscribed to The Weekly Edit.')).toBeVisible();
  });

  test('No horizontal overflow across all desktop, tablet, and mobile viewports', async ({ page }) => {
    for (const width of [1440, 1366, 1024, 768, 390, 375]) {
      await page.setViewportSize({ width, height: 900 });
      await page.waitForTimeout(200);
      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
      expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
    }
  });
});
