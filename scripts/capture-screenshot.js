const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const target = process.argv[2] || 'full';
const iteration = process.argv[3] || 'final';
const viewportType = process.argv[4] || 'desktop';

const viewports = {
  desktop: { width: 1440, height: 1280 },
  desktopRef: { width: 935, height: 1024 },
  laptop: { width: 1366, height: 768 },
  laptopSmall: { width: 1024, height: 768 },
  tablet: { width: 768, height: 1024 },
  mobile: { width: 390, height: 844 },
  mobileSmall: { width: 375, height: 812 },
};

async function capture() {
  const browser = await chromium.launch({ headless: true });

  const outDir = path.join('artifacts', 'screenshots');
  fs.mkdirSync(outDir, { recursive: true });

  if (target === 'all-viewports') {
    const fullDir = path.join(outDir, '06-full-page');
    fs.mkdirSync(fullDir, { recursive: true });

    for (const [vpName, vpSize] of Object.entries(viewports)) {
      console.log(`Capturing full page at viewport: ${vpName} (${vpSize.width}x${vpSize.height})...`);
      const context = await browser.newContext({ viewport: vpSize, deviceScaleFactor: 1 });
      const page = await context.newPage();
      try {
        await page.goto('http://localhost:3000', { waitUntil: 'networkidle', timeout: 30000 });
      } catch (e) {
        console.log(`Timeout waiting for networkidle on ${vpName}, continuing...`);
      }
      await page.waitForTimeout(1500);

      // Check for horizontal overflow
      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
      const hasOverflow = scrollWidth > clientWidth;
      console.log(`[${vpName}] scrollWidth: ${scrollWidth}, clientWidth: ${clientWidth}, overflow: ${hasOverflow}`);

      await page.screenshot({ path: path.join(fullDir, `${vpName}.png`), fullPage: true });
      await context.close();
    }
    console.log('All viewports captured successfully in artifacts/screenshots/06-full-page/ !');
    await browser.close();
    return;
  }

  const vp = viewports[viewportType] || viewports.desktop;
  const context = await browser.newContext({ viewport: vp, deviceScaleFactor: 1 });
  const page = await context.newPage();

  console.log(`Navigating to http://localhost:3000 at viewport ${viewportType}...`);
  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle', timeout: 30000 });
  } catch (err) {
    console.log('Networkidle wait timed out, proceeding anyway...');
  }
  await page.waitForTimeout(1500);

  if (target === 'header') {
    const dir = path.join(outDir, '01-header');
    fs.mkdirSync(dir, { recursive: true });
    const header = await page.$('header');
    if (header) {
      await header.screenshot({ path: path.join(dir, `${iteration}.png`) });
    }
    console.log(`Saved ${dir}/${iteration}.png`);
  } else if (target === 'hero') {
    const dir = path.join(outDir, '02-hero');
    fs.mkdirSync(dir, { recursive: true });
    const el = await page.$('#hero-section');
    if (el) {
      await el.screenshot({ path: path.join(dir, `${iteration}.png`) });
    }
    console.log(`Saved ${dir}/${iteration}.png`);
  } else if (target === 'explore') {
    const dir = path.join(outDir, '03-explore');
    fs.mkdirSync(dir, { recursive: true });
    const el = await page.$('#explore-section');
    if (el) {
      await el.screenshot({ path: path.join(dir, `${iteration}.png`) });
    }
    console.log(`Saved ${dir}/${iteration}.png`);
  } else if (target === 'discoveries') {
    const dir = path.join(outDir, '04-discoveries');
    fs.mkdirSync(dir, { recursive: true });
    const el = await page.$('#discoveries-section');
    if (el) {
      await el.screenshot({ path: path.join(dir, `${iteration}.png`) });
    }
    console.log(`Saved ${dir}/${iteration}.png`);
  } else if (target === 'featured-guide') {
    const dir = path.join(outDir, '05-featured-guide');
    fs.mkdirSync(dir, { recursive: true });
    const el = await page.$('#featured-guide-section');
    if (el) {
      await el.screenshot({ path: path.join(dir, `${iteration}.png`) });
    }
    console.log(`Saved ${dir}/${iteration}.png`);
  } else if (target === 'full') {
    const dir = path.join(outDir, '06-full-page');
    fs.mkdirSync(dir, { recursive: true });
    await page.screenshot({ path: path.join(fullDir, `${viewportType}.png`), fullPage: true });
    console.log(`Saved ${dir}/${viewportType}.png`);
  }

  await browser.close();
}

capture().catch(err => {
  console.error(err);
  process.exit(1);
});
