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

  // 1. Directory Listing Page Full Screenshot
  await page.goto('http://localhost:3000/directory', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await page.screenshot({
    path: path.join(outDir, 'directory-listing-page.png'),
    fullPage: true,
  });
  console.log('Saved directory-listing-page.png');

  // 2. Landing Page Discoveries & Show More Section
  await page.goto('http://localhost:3000/#discoveries-section', { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  const discoveriesEl = page.locator('#discoveries-section');
  await discoveriesEl.screenshot({
    path: path.join(outDir, 'landing-show-more-section.png'),
  });
  console.log('Saved landing-show-more-section.png');

  // 3. Curated Guide Page Screenshot
  await page.goto('http://localhost:3000/guides/melbourne-edit', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await page.screenshot({
    path: path.join(outDir, 'curated-guide-melbourne.png'),
    fullPage: true,
  });
  console.log('Saved curated-guide-melbourne.png');

  await context.close();
  await browser.close();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});

