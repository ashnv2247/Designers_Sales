import { test, expect } from '@playwright/test';

test.describe('Listing Directory & Curated Guide Pages Verification', () => {
  test('Landing Page "SHOW MORE" and "VIEW ALL SHOPS" route to /directory', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    // In Latest Discoveries section: check "VIEW ALL SHOPS" link
    const viewAllBtn = page.getByRole('link', { name: /VIEW ALL SHOPS/i });
    await expect(viewAllBtn).toBeVisible();
    await expect(viewAllBtn).toHaveAttribute('href', '/directory');

    // In Latest Discoveries section: check "SHOW MORE" button
    const showMoreBtn = page.getByRole('link', { name: /SHOW MORE FROM AUSTRALIAN DIRECTORY/i });
    await expect(showMoreBtn).toBeVisible();
    await expect(showMoreBtn).toHaveAttribute('href', '/directory');

    // Click Show More and assert navigation to /directory
    await showMoreBtn.click();
    await expect(page).toHaveURL(/.*\/directory/);
  });

  test('Featured Guide CTA on Landing Page routes to /guides/melbourne-edit', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    const readGuideBtn = page.getByRole('link', { name: /READ THE GUIDE/i });
    await expect(readGuideBtn).toBeVisible();
    await expect(readGuideBtn).toHaveAttribute('href', '/guides/melbourne-edit');

    await readGuideBtn.click();
    await expect(page).toHaveURL(/.*\/guides\/melbourne-edit/);
    await expect(page.getByRole('heading', { name: 'The Melbourne Edit' })).toBeVisible();
  });

  test('Directory Listing Page matches reference: title, dual filters, search, and 12 boutique cards', async ({ page }) => {
    await page.goto('/directory', { waitUntil: 'domcontentloaded' });

    // Check Header & Subtitle
    await expect(page.getByText('COMPLETE DIRECTORY INDEX')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Explore Australian Boutiques' })).toBeVisible();

    // Check Dual Filter Rows
    await expect(page.getByText('CITY', { exact: true })).toBeVisible();
    await expect(page.getByText('CATEGORY', { exact: true })).toBeVisible();

    // Check initial count: curated spaces
    await expect(page.getByText(/SHOWING \d+ OF \d+ CURATED SPACES/i)).toBeVisible();

    // Check card grid: at least 12 baseline cards
    const cards = page.locator('[data-testid="boutique-listing-card"]');
    const cardsCount = await cards.count();
    expect(cardsCount).toBeGreaterThanOrEqual(12);

    // Verify card content elements
    const firstCard = cards.first();
    await expect(firstCard.getByRole('heading', { name: 'Aesop Signature Store' })).toBeVisible();
    await expect(firstCard.getByText('FITZROY')).toBeVisible();
    await expect(firstCard.getByText('$$$')).toBeVisible();
    await expect(firstCard.getByText(/242 GERTRUDE STREET/i)).toBeVisible();
    await expect(firstCard.getByRole('link', { name: /VIEW/i })).toBeVisible();

    // Test City filter: clicking "Sydney" filters cards
    await page.getByRole('button', { name: 'SYDNEY', exact: true }).click();
    await expect(page.getByText(/SHOWING 4 OF \d+ CURATED SPACES/i)).toBeVisible();
    await expect(cards).toHaveCount(4);

    // Reset back to ALL
    await page.getByRole('button', { name: 'ALL', exact: true }).first().click();
    const finalCount = await cards.count();
    expect(finalCount).toBeGreaterThanOrEqual(12);

    // Test Search input
    const searchInput = page.locator('input[placeholder*="Filter by name"]');
    await searchInput.fill('Marton');
    await expect(page.getByText(/SHOWING 1 OF \d+ CURATED SPACES/i)).toBeVisible();
    await expect(cards).toHaveCount(1);
    await expect(cards.first().getByRole('heading', { name: 'Marton & Davis' })).toBeVisible();
  });

  test('Curated Guide Page renders longform editorial, photo collage, and boutique profiles', async ({ page }) => {
    await page.goto('/guides/melbourne-edit', { waitUntil: 'domcontentloaded' });

    // Check Headline and Credits
    await expect(page.getByRole('heading', { name: 'The Melbourne Edit' })).toBeVisible();
    await expect(page.getByText(/Curated by DS\/ Editorial Board/i)).toBeVisible();
    await expect(page.getByText(/8 Min Read/i)).toBeVisible();

    // Check Precinct quick jump navigation
    await expect(page.getByRole('button', { name: /01\. Fitzroy/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /02\. High St Armadale/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /03\. Carlton/i })).toBeVisible();

    // Check Featured Boutique Profile (Parlour Archive)
    await expect(page.getByRole('heading', { name: 'Parlour Archive & Atelier' })).toBeVisible();
    const shopLink = page.getByRole('link', { name: /View Shop Profile & CMS/i });
    await expect(shopLink).toBeVisible();
    await expect(shopLink).toHaveAttribute('href', '/shop');
  });
});
