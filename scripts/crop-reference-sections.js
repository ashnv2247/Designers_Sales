const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const refPath = 'artifacts/reference/reference.jpg';
const outDir = 'artifacts/reference/sections';
fs.mkdirSync(outDir, { recursive: true });

const sections = [
  { name: '01-header.png', rect: { left: 0, top: 0, width: 935, height: 115 } },
  { name: '02-hero.png', rect: { left: 0, top: 115, width: 935, height: 355 } },
  { name: '03-explore.png', rect: { left: 0, top: 470, width: 935, height: 155 } },
  { name: '04-discoveries.png', rect: { left: 0, top: 625, width: 935, height: 265 } },
  { name: '05-featured-guide.png', rect: { left: 0, top: 890, width: 935, height: 134 } },
];

async function run() {
  for (const s of sections) {
    await sharp(refPath)
      .extract(s.rect)
      .png()
      .toFile(path.join(outDir, s.name));
    console.log('Saved reference section:', s.name);
  }
}

run();
