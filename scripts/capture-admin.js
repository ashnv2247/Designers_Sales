const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function run() {
  const browser = await chromium.launch({ headless: true });
  const outDir = 'C:\\Users\\DELL\\.gemini\\antigravity\\brain\\2aae928b-4f6a-435d-aaf1-4a5ccddb071a\\artifacts_media';
  fs.mkdirSync(outDir, { recursive: true });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();

  // 1. Admin Dashboard Boutiques View
  await page.goto('http://localhost:3000/admin', { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  await page.screenshot({
    path: path.join(outDir, 'admin-dashboard-boutiques.png'),
    fullPage: true,
  });
  console.log('Saved admin-dashboard-boutiques.png');

  // 2. Admin Dashboard Products View
  await page.getByRole('button', { name: /Products/i }).click();
  await page.waitForTimeout(600);
  await page.screenshot({
    path: path.join(outDir, 'admin-dashboard-products.png'),
    fullPage: true,
  });
  console.log('Saved admin-dashboard-products.png');

  // 3. Admin Media Uploader Studio
  await page.getByRole('button', { name: /Cloudinary Uploader/i }).click();
  await page.waitForTimeout(600);
  await page.screenshot({
    path: path.join(outDir, 'admin-dashboard-cloudinary.png'),
  });
  console.log('Saved admin-dashboard-cloudinary.png');

  await context.close();
  await browser.close();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});

