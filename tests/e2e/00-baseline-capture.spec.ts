import { test, expect } from '@playwright/test';
import * as path from 'path';

test.describe('Baseline Application Capture & State Audit', () => {
  const screenshotDir = path.resolve(process.cwd(), 'reports/webloom/screenshots');

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

  test('Capture Desktop Baseline across all key routes', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });

    // 1. Landing Page
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: `${screenshotDir}/before/01-landing-desktop.png`, fullPage: false });
    await page.screenshot({ path: `${screenshotDir}/desktop/01-landing-desktop-full.png`, fullPage: true });

    // 2. Directory Index
    await page.goto('/directory');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: `${screenshotDir}/before/02-directory-desktop.png`, fullPage: false });
    await page.screenshot({ path: `${screenshotDir}/desktop/02-directory-desktop-full.png`, fullPage: true });

    // 3. Shop Editorial Profile
    await page.goto('/shop');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: `${screenshotDir}/before/03-shop-desktop.png`, fullPage: false });
    await page.screenshot({ path: `${screenshotDir}/desktop/03-shop-desktop-full.png`, fullPage: true });

    // 4. Melbourne City Guide
    await page.goto('/guides/melbourne-edit');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: `${screenshotDir}/before/04-guide-desktop.png`, fullPage: false });
    await page.screenshot({ path: `${screenshotDir}/desktop/04-guide-desktop-full.png`, fullPage: true });

    // 5. Admin Live On-Page Studio
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: `${screenshotDir}/before/05-admin-studio-desktop.png`, fullPage: false });
    await page.screenshot({ path: `${screenshotDir}/preview/05-admin-studio-desktop.png`, fullPage: false });

    // 6. Admin Classic Sidebar Dashboard
    await page.goto('/admin/dashboard');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: `${screenshotDir}/before/06-admin-dashboard-desktop.png`, fullPage: false });
  });

  test('Capture Tablet & Mobile Baselines', async ({ page }) => {
    // Tablet Viewport (768px)
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: `${screenshotDir}/tablet/landing-tablet.png` });

    await page.goto('/directory');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: `${screenshotDir}/tablet/directory-tablet.png` });

    await page.goto('/shop');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: `${screenshotDir}/tablet/shop-tablet.png` });

    // Mobile Viewport (390px - iPhone 14 / modern standard)
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: `${screenshotDir}/mobile/landing-mobile.png` });

    await page.goto('/directory');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: `${screenshotDir}/mobile/directory-mobile.png` });

    await page.goto('/shop');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: `${screenshotDir}/mobile/shop-mobile.png` });
  });
});

