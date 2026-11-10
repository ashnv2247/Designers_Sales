const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const refPath = 'artifacts/reference/reference.jpg';

const dirs = [
  'public/images/hero',
  'public/images/explore',
  'public/images/discoveries',
  'public/images/guides',
  'public/images/texture'
];

dirs.forEach(d => fs.mkdirSync(d, { recursive: true }));

const crops = [
  // Hero
  {
    name: 'public/images/hero/hero-main.jpg',
    rect: { left: 276, top: 123, width: 418, height: 342 }
  },
  {
    name: 'public/images/hero/hero-top-right.jpg',
    rect: { left: 700, top: 123, width: 220, height: 157 }
  },
  {
    name: 'public/images/hero/hero-bottom-right.jpg',
    rect: { left: 700, top: 286, width: 220, height: 179 }
  },
  
  // Explore
  {
    name: 'public/images/explore/explore-hat.jpg',
    rect: { left: 15, top: 472, width: 178, height: 143 }
  },
  {
    name: 'public/images/explore/explore-city-bg.jpg',
    rect: { left: 334, top: 472, width: 188, height: 143 }
  },
  {
    name: 'public/images/explore/explore-handbag.jpg',
    rect: { left: 527, top: 472, width: 198, height: 143 }
  },
  {
    name: 'public/images/explore/explore-books.jpg',
    rect: { left: 730, top: 472, width: 192, height: 143 }
  },

  // Latest Discoveries
  {
    name: 'public/images/discoveries/marton-and-davis.jpg',
    rect: { left: 31, top: 680, width: 214, height: 152 }
  },
  {
    name: 'public/images/discoveries/keep.jpg',
    rect: { left: 251, top: 680, width: 214, height: 152 }
  },
  {
    name: 'public/images/discoveries/stitch-and-tickle.jpg',
    rect: { left: 472, top: 680, width: 214, height: 152 }
  },
  {
    name: 'public/images/discoveries/talk-story.jpg',
    rect: { left: 693, top: 680, width: 214, height: 152 }
  },

  // Featured Guide Arch
  {
    name: 'public/images/guides/guide-arch.jpg',
    rect: { left: 826, top: 899, width: 87, height: 118 }
  },

  // Leaf shadow texture on hero left
  {
    name: 'public/images/texture/leaf-shadow-top.jpg',
    rect: { left: 0, top: 50, width: 250, height: 200 }
  },
  // Leaf shadow texture on featured guide left
  {
    name: 'public/images/texture/leaf-shadow-guide.jpg',
    rect: { left: 22, top: 899, width: 200, height: 118 }
  }
];

async function run() {
  for (const c of crops) {
    await sharp(refPath)
      .extract(c.rect)
      .jpeg({ quality: 95 })
      .toFile(c.name);
    console.log('Extracted:', c.name, c.rect);
  }
  console.log('All crops successfully created!');
}

run();
