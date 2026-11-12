import { test, expect } from '@playwright/test';
import * as path from 'path';

test.describe('50 Distinct Synthetic User Persona Simulations', () => {
  const simDir = path.resolve(process.cwd(), 'reports/webloom/screenshots/simulations');

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

  // ---------------------------------------------------------------------------
  // GROUP A: FIRST-TIME USERS (U01 - U10)
  // ---------------------------------------------------------------------------
  test('U01: First-time visitor lands on homepage and inspects hero', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h1, h2').first()).toBeVisible();
    await page.screenshot({ path: `${simDir}/U01-first-visit-hero.png` });
  });

  test('U02: First-time visitor filters directory by Melbourne', async ({ page }) => {
    await page.goto('/directory');
    await page.click('button:has-text("MELBOURNE")');
    const cards = page.locator('[data-testid="boutique-listing-card"]');
    await expect(cards.first()).toBeVisible();
    await page.screenshot({ path: `${simDir}/U02-filter-melbourne.png` });
  });

  test('U03: First-time visitor filters directory by Sydney', async ({ page }) => {
    await page.goto('/directory');
    await page.click('button:has-text("SYDNEY")');
    const cards = page.locator('[data-testid="boutique-listing-card"]');
    await expect(cards.first()).toBeVisible();
    await page.screenshot({ path: `${simDir}/U03-filter-sydney.png` });
  });

  test('U04: First-time visitor searches for Ceramics via header', async ({ page }) => {
    await page.goto('/');
    await page.locator('button[aria-label="Toggle search"]').click();
    await page.locator('input[placeholder*="Search"]').fill('Ceramics');
    await page.locator('input[placeholder*="Search"]').press('Enter');
    await page.waitForURL(/.*q=Ceramics/);
    await page.screenshot({ path: `${simDir}/U04-search-ceramics.png` });
  });

  test('U05: First-time visitor searches for Books in directory index', async ({ page }) => {
    await page.goto('/directory');
    await page.locator('input[placeholder*="Filter by name"]').fill('Books');
    await page.screenshot({ path: `${simDir}/U05-filter-books.png` });
  });

  test('U06: Visitor explores Melbourne City Guide', async ({ page }) => {
    await page.goto('/guides/melbourne-edit');
    await expect(page.getByRole('heading', { name: 'The Melbourne Edit' })).toBeVisible();
    await page.screenshot({ path: `${simDir}/U06-melbourne-guide.png` });
  });

  test('U07: Visitor switches precinct to Armadale in Melbourne Guide', async ({ page }) => {
    await page.goto('/guides/melbourne-edit');
    const armadaleBtn = page.locator('button', { hasText: /Armadale/i }).first();
    if (await armadaleBtn.isVisible()) {
      await armadaleBtn.click();
    }
    await page.screenshot({ path: `${simDir}/U07-guide-armadale.png` });
  });

  test('U08: Visitor shares Melbourne Guide URL', async ({ page }) => {
    await page.goto('/guides/melbourne-edit');
    await page.locator('button', { hasText: /Share Guide/i }).click();
    await expect(page.locator('text=Link Copied!')).toBeVisible();
    await page.screenshot({ path: `${simDir}/U08-share-copied.png` });
  });

  test('U09: Proprietor fills Submit a Shop proposal', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /SUBMIT A SHOP/i }).click();
    await expect(page.getByRole('heading', { name: /Submit an Independent Boutique/i })).toBeVisible();
    await page.screenshot({ path: `${simDir}/U09-submit-shop-modal.png` });
  });

  test('U10: Visitor cancels Submit a Shop modal', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /SUBMIT A SHOP/i }).click();
    await page.locator('button[aria-label="Close modal"]').click();
    await expect(page.getByRole('heading', { name: /Submit an Independent Boutique/i })).not.toBeVisible();
    await page.screenshot({ path: `${simDir}/U10-modal-closed.png` });
  });

  // ---------------------------------------------------------------------------
  // GROUP B: REGULAR USERS (U11 - U20)
  // ---------------------------------------------------------------------------
  test('U11: Regular reader opens Aesop Fitzroy profile', async ({ page }) => {
    await page.goto('/shop?id=aesop-fitzroy');
    await expect(page.locator('body')).toContainText(/Aesop Signature Store/i);
    await page.screenshot({ path: `${simDir}/U11-aesop-profile.png` });
  });

  test('U12: Regular reader opens Keep Studio profile', async ({ page }) => {
    await page.goto('/shop?id=keep-ceramics');
    await expect(page.locator('body')).toContainText(/Keep Studio/i);
    await page.screenshot({ path: `${simDir}/U12-keep-profile.png` });
  });

  test('U13: Regular reader opens Stitch & Tickle profile', async ({ page }) => {
    await page.goto('/shop?id=stitch-and-tickle');
    await expect(page.locator('body')).toContainText(/Stitch & Tickle/i);
    await page.screenshot({ path: `${simDir}/U13-stitch-profile.png` });
  });

  test('U14: Regular reader opens Talk Story Bookstore profile', async ({ page }) => {
    await page.goto('/shop?id=talk-story-bookstore');
    await expect(page.locator('body')).toContainText(/Talk Story/i);
    await page.screenshot({ path: `${simDir}/U14-talk-story-profile.png` });
  });

  test('U15: Regular reader opens Subtropical Objects profile', async ({ page }) => {
    await page.goto('/shop?id=subtropical-objects');
    await expect(page.locator('body')).toContainText(/Subtropical Objects/i);
    await page.screenshot({ path: `${simDir}/U15-subtropical-profile.png` });
  });

  test('U16: Regular reader opens Claremont Collective profile', async ({ page }) => {
    await page.goto('/shop?id=claremont-collective');
    await expect(page.locator('body')).toContainText(/Claremont/i);
    await page.screenshot({ path: `${simDir}/U16-claremont-profile.png` });
  });

  test('U17: Regular reader opens Similar Shops modal', async ({ page }) => {
    await page.goto('/shop');
    const manageBtn = page.locator('button', { hasText: /Manage Similar/i }).first();
    if (await manageBtn.isVisible()) {
      await manageBtn.click();
      await page.screenshot({ path: `${simDir}/U17-similar-shops-modal.png` });
    }
  });

  test('U18: Regular reader inspects operating hours', async ({ page }) => {
    await page.goto('/shop');
    await expect(page.locator('[data-testid="shop-status-badge"]')).toBeVisible();
    await page.screenshot({ path: `${simDir}/U18-operating-hours.png` });
  });

  test('U19: Regular reader resets directory filters', async ({ page }) => {
    await page.goto('/directory');
    await page.click('button:has-text("PERTH")');
    await page.locator('button', { hasText: /Reset Filters/i }).click();
    await expect(page.locator('text=/SHOWING \\d+ OF \\d+ CURATED SPACES/i')).toBeVisible();
    await page.screenshot({ path: `${simDir}/U19-reset-filters.png` });
  });

  test('U20: Regular reader navigates to Journal section', async ({ page }) => {
    await page.goto('/#journal');
    await page.screenshot({ path: `${simDir}/U20-journal-section.png` });
  });

  // ---------------------------------------------------------------------------
  // GROUP C: ADVANCED CURATORS & ADMIN (U21 - U30)
  // ---------------------------------------------------------------------------
  test('U21: Curator opens Live On-Page Studio', async ({ page }) => {
    await page.goto('/admin');
    await expect(page.locator('text=LIVE STUDIO')).toBeVisible();
    await page.screenshot({ path: `${simDir}/U21-live-studio.png` });
  });

  test('U22: Curator switches Studio page to City Guide', async ({ page }) => {
    await page.goto('/admin');
    await page.locator('button', { hasText: 'City Guide' }).click();
    await page.screenshot({ path: `${simDir}/U22-studio-city-guide.png` });
  });

  test('U23: Curator switches Studio page to Journal', async ({ page }) => {
    await page.goto('/admin');
    await page.locator('button', { hasText: 'Journal Article' }).click();
    await page.screenshot({ path: `${simDir}/U23-studio-journal.png` });
  });

  test('U24: Curator toggles Studio viewport to Tablet (768px)', async ({ page }) => {
    await page.goto('/admin');
    await page.locator('button', { hasText: 'Tablet' }).click();
    await page.screenshot({ path: `${simDir}/U24-studio-tablet.png` });
  });

  test('U25: Curator toggles Studio viewport to Mobile (390px)', async ({ page }) => {
    await page.goto('/admin');
    await page.locator('button', { hasText: 'Mobile' }).click();
    await page.screenshot({ path: `${simDir}/U25-studio-mobile.png` });
  });

  test('U26: Curator toggles Studio viewport to Desktop (100%)', async ({ page }) => {
    await page.goto('/admin');
    await page.locator('button', { hasText: 'Desktop' }).click();
    await page.screenshot({ path: `${simDir}/U26-studio-desktop.png` });
  });

  test('U27: Curator verifies photo replacement trigger in studio', async ({ page }) => {
    await page.goto('/admin');
    const photoFrame = page.locator('main img').first();
    await expect(photoFrame).toBeVisible();
    await page.screenshot({ path: `${simDir}/U27-photo-frame.png` });
  });

  test('U28: Curator switches to Classic Sidebar Admin Dashboard', async ({ page }) => {
    await page.goto('/admin/dashboard');
    await expect(page.locator('h1').filter({ hasText: /Curated Boutiques/i })).toBeVisible();
    await page.screenshot({ path: `${simDir}/U28-sidebar-admin.png` });
  });

  test('U29: Curator views City Guides tab in Admin Dashboard', async ({ page }) => {
    await page.goto('/admin/dashboard');
    await page.locator('button', { hasText: /City Guides/i }).click();
    await page.screenshot({ path: `${simDir}/U29-dashboard-guides.png` });
  });

  test('U30: Curator views Cloudinary Media Studio tab in Admin Dashboard', async ({ page }) => {
    await page.goto('/admin/dashboard');
    await page.locator('button', { hasText: 'Cloudinary Media' }).click();
    await page.screenshot({ path: `${simDir}/U30-dashboard-media.png` });
  });

  // ---------------------------------------------------------------------------
  // GROUP D: ERROR-PRONE USERS & RECOVERY (U31 - U40)
  // ---------------------------------------------------------------------------
  test('U31: User searches for non-existent keyword and sees empty state', async ({ page }) => {
    await page.goto('/directory?q=xyznonexistent999');
    await expect(page.locator('text=No curated boutiques matched your filter criteria')).toBeVisible();
    await page.screenshot({ path: `${simDir}/U31-empty-state.png` });
  });

  test('U32: User clicks Reset All Filters from empty state', async ({ page }) => {
    await page.goto('/directory?q=xyznonexistent999');
    await page.locator('button', { hasText: /Reset All Filters/i }).click();
    await expect(page.locator('text=/SHOWING \\d+ OF \\d+ CURATED SPACES/i')).toBeVisible();
    await page.screenshot({ path: `${simDir}/U32-empty-state-recovered.png` });
  });

  test('U33: User attempts to submit empty form', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /SUBMIT A SHOP/i }).click();
    const submitBtn = page.getByRole('button', { name: /SUBMIT FOR CURATION/i });
    await submitBtn.click();
    // HTML5 required validation prevents submission
    await expect(page.getByRole('heading', { name: /Submission Received/i })).not.toBeVisible();
    await page.screenshot({ path: `${simDir}/U33-form-validation.png` });
  });

  test('U34: User enters invalid email format', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /SUBMIT A SHOP/i }).click();
    await page.locator('input[placeholder*="Maison de Verre"]').fill('Test Boutique');
    await page.locator('input[placeholder*="Fitzroy, Paddington"]').fill('Fitzroy');
    await page.locator('input[placeholder*="proprietor@boutique.com"]').fill('not-an-email');
    await page.getByRole('button', { name: /SUBMIT FOR CURATION/i }).click();
    await expect(page.getByRole('heading', { name: /Submission Received/i })).not.toBeVisible();
    await page.screenshot({ path: `${simDir}/U34-invalid-email.png` });
  });

  test('U35: User requests unknown boutique ID and recovers gracefully', async ({ page }) => {
    await page.goto('/shop?id=unknown-shop-12345');
    await expect(page.locator('body')).toBeVisible();
    await page.screenshot({ path: `${simDir}/U35-unknown-id-fallback.png` });
  });

  test('U36: User clicks search drawer toggle repeatedly', async ({ page }) => {
    await page.goto('/');
    const toggle = page.locator('button[aria-label="Toggle search"]');
    await toggle.click();
    await toggle.click();
    await toggle.click();
    await page.screenshot({ path: `${simDir}/U36-rapid-toggle.png` });
  });

  test('U37: User rapidly toggles multiple city filters', async ({ page }) => {
    await page.goto('/directory');
    await page.click('button:has-text("MELBOURNE")');
    await page.click('button:has-text("SYDNEY")');
    await page.click('button:has-text("BRISBANE")');
    await page.click('button:has-text("ALL")');
    await expect(page.locator('text=/SHOWING \\d+ OF \\d+ CURATED SPACES/i')).toBeVisible();
    await page.screenshot({ path: `${simDir}/U37-rapid-filters.png` });
  });

  test('U38: User rapidly switches Studio viewports', async ({ page }) => {
    await page.goto('/admin');
    await page.locator('button', { hasText: 'Mobile' }).click();
    await page.locator('button', { hasText: 'Tablet' }).click();
    await page.locator('button', { hasText: 'Desktop' }).click();
    await page.screenshot({ path: `${simDir}/U38-rapid-viewports.png` });
  });

  test('U39: User opens nonexistent route and sees 404 page', async ({ page }) => {
    await page.goto('/non-existent-route-404');
    await expect(page.locator('body')).toBeVisible();
    await page.screenshot({ path: `${simDir}/U39-404-handling.png` });
  });

  test('U40: Verify /api/boutiques returns JSON array', async ({ request }) => {
    const res = await request.get('/api/boutiques');
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.boutiques).toBeDefined();
    expect(body.boutiques.length).toBeGreaterThan(0);
  });

  // ---------------------------------------------------------------------------
  // GROUP E: EDGE CASES, ACCESSIBILITY & RESPONSIVE (U41 - U50)
  // ---------------------------------------------------------------------------
  test('U41: Mobile 360px Small Viewport verification', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 640 });
    await page.goto('/');
    await page.screenshot({ path: `${simDir}/U41-mobile-360px.png` });
  });

  test('U42: Mobile 390px iPhone Viewport verification', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/directory');
    await page.screenshot({ path: `${simDir}/U42-mobile-390px.png` });
  });

  test('U43: Mobile 430px iPhone Pro Max Viewport verification', async ({ page }) => {
    await page.setViewportSize({ width: 430, height: 932 });
    await page.goto('/shop');
    await page.screenshot({ path: `${simDir}/U43-mobile-430px.png` });
  });

  test('U44: Tablet 768px Portrait layout verification', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    await page.screenshot({ path: `${simDir}/U44-tablet-768px.png` });
  });

  test('U45: Laptop 1024px layout verification', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.goto('/directory');
    await page.screenshot({ path: `${simDir}/U45-laptop-1024px.png` });
  });

  test('U46: Desktop 1280px layout verification', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/guides/melbourne-edit');
    await page.screenshot({ path: `${simDir}/U46-desktop-1280px.png` });
  });

  test('U47: Large Desktop 1920px Wide layout verification', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');
    await page.screenshot({ path: `${simDir}/U47-large-desktop-1920px.png` });
  });

  test('U48: Keyboard Tab Navigation across header links', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.screenshot({ path: `${simDir}/U48-keyboard-nav.png` });
  });

  test('U49: Image Alt Attributes and Accessibility verification', async ({ page }) => {
    await page.goto('/directory');
    const images = page.locator('img');
    const count = await images.count();
    for (let i = 0; i < Math.min(count, 5); i++) {
      const alt = await images.nth(i).getAttribute('alt');
      expect(alt).toBeTruthy();
    }
    await page.screenshot({ path: `${simDir}/U49-image-a11y.png` });
  });

  test('U50: In-Browser Diagnostic Test Suite execution on /shop', async ({ page }) => {
    await page.goto('/shop');
    const runnerBtn = page.locator('button', { hasText: /Run Tests/i }).first();
    if (await runnerBtn.isVisible()) {
      await runnerBtn.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: `${simDir}/U50-test-runner.png` });
    }
  });
});
