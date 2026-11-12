import { test, expect } from '@playwright/test';

test.describe('DesignerSale Authentication, Navigation & UX Audit Verification', () => {

  test('TC-AUTH-01: /login renders complete editorial curation portal and demo helper', async ({ page }) => {
    await page.goto('/login');
    await page.evaluate(() => localStorage.removeItem('ds_curator_session'));
    await page.reload();

    await expect(page.getByRole('heading', { name: 'Sign In to DS/ Studio' })).toBeVisible();
    await expect(page.getByText('1-CLICK INSTANT DEMO CURATOR')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Auto-fill inputs' })).toBeVisible();
    await expect(page.locator('form input[type="email"]')).toBeVisible();
    await expect(page.locator('input[placeholder="••••••••••••"]')).toBeVisible();

    await page.screenshot({ path: 'reports/ux-audit/screenshots/login-page-desktop.png', fullPage: true });
  });

  test('TC-AUTH-02: Invalid credentials display clear, polite error banner', async ({ page }) => {
    await page.goto('/login');
    await page.locator('form input[type="email"]').fill('curator@designersale.com.au');
    await page.locator('input[placeholder="••••••••••••"]').fill('wrongpassword');
    await page.getByRole('button', { name: 'SIGN IN TO STUDIO' }).click();

    await expect(page.getByText(/Invalid curator credentials/i)).toBeVisible();
    await page.screenshot({ path: 'reports/ux-audit/screenshots/login-error-state.png' });
  });

  test('TC-AUTH-03: Auto-fill inputs synchronizes email and password without discrepancy', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: 'Auto-fill inputs' }).click();

    const emailVal = await page.locator('form input[type="email"]').inputValue();
    const passVal = await page.locator('input[placeholder="••••••••••••"]').inputValue();

    expect(emailVal).toBe('curator@designersale.com.au');
    expect(passVal).toBe('curator123');
  });

  test('TC-AUTH-04: Forgot Password dialog opens, accepts email, and transmits recovery', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: 'Forgot?' }).click();

    await expect(page.getByRole('heading', { name: 'Reset Curator Password' })).toBeVisible();
    const modal = page.locator('div.fixed');
    await modal.locator('input[type="email"]').fill('curator@designersale.com.au');
    await modal.getByRole('button', { name: 'Transmit Reset' }).click();

    await expect(modal.getByText(/Recovery instructions transmitted to your inbox/i)).toBeVisible();
    await page.screenshot({ path: 'reports/ux-audit/screenshots/forgot-password-modal.png' });
  });

  test('TC-AUTH-05: 1-Click Instant Demo Curator authenticates and redirects to /admin', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: 'LAUNCH DEMO CURATOR STUDIO' }).click();

    await expect(page).toHaveURL(/.*\/admin/);
    await expect(page.getByText('LIVE STUDIO')).toBeVisible();
    await page.screenshot({ path: 'reports/ux-audit/screenshots/studio-authenticated-desktop.png', fullPage: true });
  });

  test('TC-AUTH-06: Sign Out button clears session and returns user to /login', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: 'LAUNCH DEMO CURATOR STUDIO' }).click();
    await expect(page).toHaveURL(/.*\/admin/);

    await page.getByRole('button', { name: /Sign Out/i }).first().click();

    await expect(page).toHaveURL(/.*\/login/);
    const session = await page.evaluate(() => localStorage.getItem('ds_curator_session'));
    expect(session).toBeNull();
    await page.screenshot({ path: 'reports/ux-audit/screenshots/logged-out-redirect.png' });
  });

  test('TC-AUTH-07: Unauthenticated visit to /admin shows Curatorial Security Gate', async ({ page }) => {
    await page.goto('/admin');
    await page.evaluate(() => localStorage.removeItem('ds_curator_session'));
    await page.reload();

    await expect(page.getByRole('heading', { name: 'Editorial Studio Restricted' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'SIGN IN TO CURATOR PORTAL' })).toBeVisible();
    await expect(page.getByRole('button', { name: '1-Click Demo Curator Unlock' })).toBeVisible();
    await page.screenshot({ path: 'reports/ux-audit/screenshots/admin-security-gate.png' });
  });

  test('TC-AUTH-08: 1-Click Demo Curator Unlock in Security Gate immediately unlocks studio', async ({ page }) => {
    await page.goto('/admin');
    await page.evaluate(() => localStorage.removeItem('ds_curator_session'));
    await page.reload();

    await page.getByRole('button', { name: '1-Click Demo Curator Unlock' }).click();
    await expect(page.getByText('LIVE STUDIO')).toBeVisible();
  });

  test('TC-UX-01: Explore Section City Link navigates directly to pre-filtered directory', async ({ page }) => {
    await page.goto('/');
    const melbLink = page.locator('#explore-section').getByRole('link', { name: 'MELBOURNE', exact: true }).first();
    await melbLink.click();

    await expect(page).toHaveURL(/.*\/directory\?city=Melbourne/);
    await expect(page.getByText(/SHOWING \d+ OF \d+ CURATED SPACES/i)).toBeVisible();
    await page.screenshot({ path: 'reports/ux-audit/screenshots/explore-city-filtered-directory.png' });
  });

  test('TC-UX-02: Latest Discoveries card navigates directly to specific boutique profile', async ({ page }) => {
    await page.goto('/');
    const martonCard = page.locator('#discoveries-section').getByRole('link', { name: /MARTON & DAVIS/i }).first();
    await martonCard.click();

    await expect(page).toHaveURL(/.*\/shop\?id=marton-and-davis/);
    await expect(page.getByRole('heading', { name: 'Marton & Davis', exact: true })).toBeVisible();
    await page.screenshot({ path: 'reports/ux-audit/screenshots/discovery-card-deep-link.png' });
  });

  test('TC-UX-03: Responsive Mobile Login & Navigation Audit (390px)', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: 'Sign In to DS/ Studio' })).toBeVisible();
    await page.screenshot({ path: 'reports/ux-audit/screenshots/login-page-mobile-390px.png', fullPage: true });

    await page.goto('/');
    await page.getByRole('button', { name: 'Open menu' }).click();
    await expect(page.getByRole('link', { name: /CURATOR PORTAL/i })).toBeVisible();
    await page.screenshot({ path: 'reports/ux-audit/screenshots/mobile-nav-curator-portal.png' });
  });

});
