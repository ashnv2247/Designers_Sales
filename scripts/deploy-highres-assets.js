const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const brainDir = 'C:/Users/DELL/.gemini/antigravity/brain/2aae928b-4f6a-435d-aaf1-4a5ccddb071a';

const assetMap = [
  // Hero high-res
  {
    src: 'hero_boutique_1794037375616.jpg',
    dest: 'public/images/hero/hero-main.jpg',
    aspect: { width: 1254, height: 1026 }
  },
  {
    src: 'hero_interior_rack_jpg_1794039039450.jpg',
    dest: 'public/images/hero/hero-top-right.jpg',
    aspect: { width: 880, height: 628 }
  },
  {
    src: 'hero_brick_arch_jpg_1794039061777.jpg',
    dest: 'public/images/hero/hero-bottom-right.jpg',
    aspect: { width: 880, height: 716 }
  },

  // Explore high-res
  {
    src: 'explore_straw_hat_jpg_1794039085755.jpg',
    dest: 'public/images/explore/explore-hat.jpg',
    aspect: { width: 712, height: 572 }
  },
  {
    src: 'explore_leather_handbag_jpg_1794039107061.jpg',
    dest: 'public/images/explore/explore-handbag.jpg',
    aspect: { width: 792, height: 572 }
  },

  // Discoveries high-res
  {
    src: 'discovery_marton_davis_1794039069757.jpg',
    dest: 'public/images/discoveries/marton-and-davis.jpg',
    aspect: { width: 856, height: 608 }
  },
  {
    src: 'discovery_ceramics_keep_1794039047995.jpg',
    dest: 'public/images/discoveries/keep.jpg',
    aspect: { width: 856, height: 608 }
  },
  {
    src: 'discovery_stitch_tickle_1794039095327.jpg',
    dest: 'public/images/discoveries/stitch-and-tickle.jpg',
    aspect: { width: 856, height: 608 }
  },
  {
    src: 'discovery_talk_story_1794039118281.jpg',
    dest: 'public/images/discoveries/talk-story.jpg',
    aspect: { width: 856, height: 608 }
  },

  // Featured guide arch high-res
  {
    src: 'guide_stone_arch_jpg_1794039128985.jpg',
    dest: 'public/images/guides/guide-arch.jpg',
    aspect: { width: 400, height: 540 }
  }
];

async function deploy() {
  for (const item of assetMap) {
    const srcPath = path.join(brainDir, item.src);
    if (!fs.existsSync(srcPath)) {
      console.warn('Source missing:', item.src);
      continue;
    }

    const dir = path.dirname(item.dest);
    fs.mkdirSync(dir, { recursive: true });

    // Optimize and resize to crisp proportional HD resolution
    await sharp(srcPath)
      .resize(item.aspect.width, item.aspect.height, { fit: 'cover', position: 'center' })
      .jpeg({ quality: 95 })
      .toFile(item.dest);

    console.log(`Deployed high-res asset: ${item.dest} (${item.aspect.width}x${item.aspect.height})`);
  }

  // Create clean dark moody interior for explore-city-bg without ghosted text
  const heroRack = path.join(brainDir, 'hero_interior_rack_jpg_1794039039450.jpg');
  if (fs.existsSync(heroRack)) {
    await sharp(heroRack)
      .resize(752, 572, { fit: 'cover' })
      .modulate({ brightness: 0.35, saturation: 0.8 })
      .jpeg({ quality: 95 })
      .toFile('public/images/explore/explore-city-bg.jpg');
    console.log('Deployed clean textless dark background: public/images/explore/explore-city-bg.jpg');
  }

  console.log('All high-resolution assets deployed successfully!');
}

deploy().catch(console.error);

