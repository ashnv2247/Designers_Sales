const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const section = process.argv[2] || '01-header';
const iteration = process.argv[3] || 'final';

async function compare() {
  const refPath = path.join('artifacts', 'reference', 'sections', `${section}.png`);
  const actualPath = path.join('artifacts', 'screenshots', section, `${iteration}.png`);

  if (!fs.existsSync(refPath) || !fs.existsSync(actualPath)) {
    console.error('File missing:', { ref: fs.existsSync(refPath), actual: fs.existsSync(actualPath) });
    return;
  }

  const refMeta = await sharp(refPath).metadata();
  const actMeta = await sharp(actualPath).metadata();

  console.log(`Comparing ${section}:`);
  console.log(`Reference size: ${refMeta.width}x${refMeta.height}`);
  console.log(`Actual size: ${actMeta.width}x${actMeta.height}`);

  // Create side-by-side comparison image:
  // Resize actual to match reference width if needed or place side-by-side
  const targetW = 935;
  const refResized = await sharp(refPath).resize(targetW).toBuffer();
  const actResized = await sharp(actualPath).resize(targetW).toBuffer();

  const refInfo = await sharp(refResized).metadata();
  const actInfo = await sharp(actResized).metadata();

  const maxH = Math.max(refInfo.height, actInfo.height);
  const totalW = targetW * 2 + 20;

  const canvas = sharp({
    create: {
      width: totalW,
      height: maxH + 40,
      channels: 4,
      background: { r: 245, g: 240, b: 232, alpha: 1 },
    },
  });

  const diffDir = path.join('artifacts', 'screenshots', section);
  const outPath = path.join(diffDir, `comparison-${iteration}.png`);

  await canvas
    .composite([
      { input: refResized, left: 0, top: 20 },
      { input: actResized, left: targetW + 20, top: 20 },
    ])
    .png()
    .toFile(outPath);

  console.log(`Saved side-by-side comparison to ${outPath}`);
}

compare().catch(console.error);
