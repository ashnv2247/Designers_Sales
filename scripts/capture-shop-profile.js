const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function run() {
  const browser = await chromium.launch({ headless: true });
  const outDir = 'C:\\Users\\DELL\\.gemini\\antigravity\\brain\\2aae928b-4f6a-435d-aaf1-4a5ccddb071a\\artifacts_media';
  fs.mkdirSync(outDir, { recursive: true });

  // 1. Desktop Reader View (1440x900)
  const contextDesktop = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
  });
  const pageDesktop = await contextDesktop.newPage();
  await pageDesktop.goto('http://localhost:3000/shop', { waitUntil: 'networkidle' });
  await pageDesktop.waitForTimeout(1000);
  await pageDesktop.screenshot({
    path: path.join(outDir, 'shop-profile-desktop.png'),
    fullPage: true,
  });
  console.log('Saved shop-profile-desktop.png');

  // 2. Desktop Studio CMS Mode (1440x900)
  await pageDesktop.locator('[data-testid="mode-cms"]').click();
  await pageDesktop.waitForTimeout(800);
  await pageDesktop.screenshot({
    path: path.join(outDir, 'shop-profile-cms-mode.png'),
    fullPage: true,
  });
  console.log('Saved shop-profile-cms-mode.png');

  // 3. Diagnostic Test Suite Drawer open (1440x900)
  await pageDesktop.locator('[data-testid="btn-open-test-suite"]').click();
  await pageDesktop.locator('[data-testid="btn-run-all-tests"]').click();
  await pageDesktop.waitForTimeout(1200);
  await pageDesktop.screenshot({
    path: path.join(outDir, 'shop-profile-test-suite.png'),
  });
  console.log('Saved shop-profile-test-suite.png');
  await contextDesktop.close();

  // 4. Mobile Viewport (390x844)
  const contextMobile = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 1,
  });
  const pageMobile = await contextMobile.newPage();
  await pageMobile.goto('http://localhost:3000/shop', { waitUntil: 'networkidle' });
  await pageMobile.waitForTimeout(1000);
  await pageMobile.screenshot({
    path: path.join(outDir, 'shop-profile-mobile.png'),
    fullPage: true,
  });
  console.log('Saved shop-profile-mobile.png');
  await contextMobile.close();

  await browser.close();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});

