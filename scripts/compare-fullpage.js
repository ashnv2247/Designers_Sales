const sharp = require('sharp');
const path = require('path');

async function run() {
  const refPath = 'artifacts/reference/reference.jpg';
  const actualPath = 'artifacts/screenshots/06-full-page/desktopRef.png';

  const refMeta = await sharp(refPath).metadata();
  const actMeta = await sharp(actualPath).metadata();

  console.log(`Reference: ${refMeta.width}x${refMeta.height}`);
  console.log(`Actual desktopRef: ${actMeta.width}x${actMeta.height}`);

  const targetW = 935;
  const targetH = Math.max(refMeta.height, actMeta.height);

  const refBuffer = await sharp(refPath)
    .resize(targetW, targetH, { fit: 'contain', background: { r: 246, g: 242, b: 235, alpha: 1 } })
    .toBuffer();

  const actBuffer = await sharp(actualPath)
    .resize(targetW, targetH, { fit: 'contain', background: { r: 246, g: 242, b: 235, alpha: 1 } })
    .toBuffer();

  const totalW = targetW * 2 + 20;

  const canvas = sharp({
    create: {
      width: totalW,
      height: targetH + 40,
      channels: 4,
      background: { r: 240, g: 235, b: 228, alpha: 1 },
    },
  });

  const outPath = 'artifacts/screenshots/06-full-page/side-by-side-reference-vs-actual.png';

  await canvas
    .composite([
      { input: refBuffer, left: 0, top: 20 },
      { input: actBuffer, left: targetW + 20, top: 20 },
    ])
    .png()
    .toFile(outPath);

  console.log(`Full page side-by-side comparison saved to: ${outPath}`);
}

run().catch(console.error);
