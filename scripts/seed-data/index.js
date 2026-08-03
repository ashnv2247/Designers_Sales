const asset = (name) => `src/assets/${name}`;
const productAsset = (category, index) => asset(`products/${category}-${index}.jpg`);

export const categories = [
  {
    slug: "dresses",
    name: "Dresses",
    description:
      "Slip silks, sculpted crepe and occasion pieces drawn from the season's most considered Australian ateliers.",
    image: asset("cat-dresses.jpg"),
    metadata: {
      kicker: "The Edit — No. 01",
      headline: "Dresses",
      editorial: {
        eyebrow: "Styling note",
        title: "On the quiet slip",
        body: "Cut on the bias, worn without ceremony. Our buyers favour a single silk in a colour close to skin — it flatters at dusk and refuses to date.",
        source: asset("boutique-1.jpg"),
        alt: "Boutique interior with soft daylight and hanging silks",
        credit: "Photographed at Maison Verre, Paddington",
      },
    },
  },
  {
    slug: "outerwear",
    name: "Outerwear",
    description:
      "Tailored wool, double-faced cashmere and the long coat — the one garment worth an entire wardrobe's budget.",
    image: asset("cat-outerwear.jpg"),
    metadata: {
      kicker: "The Edit — No. 02",
      headline: "Outerwear",
      editorial: {
        eyebrow: "Buyer's note",
        title: "The coat, considered",
        body: "Weight before pattern. A 480gsm wool holds its shoulder for a decade; anything lighter is a season's indulgence dressed as an investment.",
        source: asset("boutique-2.jpg"),
        alt: "Atelier rail of tailored coats in warm light",
        credit: "Photographed at Atelier Nord, Fitzroy",
      },
    },
  },
  {
    slug: "bags",
    name: "Bags",
    description:
      "Vegetable-tanned totes, structured top handles and small leather goods from independent makers.",
    image: asset("cat-bags.jpg"),
    metadata: {
      kicker: "The Edit — No. 03",
      headline: "Bags & Leather",
      editorial: {
        eyebrow: "Provenance",
        title: "Twelve hands, one hide",
        body: "Each Saltbush tote passes through twelve pairs of hands. The edge paint alone is laid in four coats, burnished between each.",
        source: asset("boutique-1.jpg"),
        alt: "Leather workshop bench with tools",
        credit: "Photographed at Saltbush Studio, Hobart",
      },
    },
  },
  {
    slug: "jewellery",
    name: "Fine Jewellery",
    description:
      "Solid gold, single stones and heirloom-intent pieces. Nothing plated, nothing fleeting.",
    image: asset("cat-jewellery.jpg"),
    metadata: {
      kicker: "The Edit — No. 04",
      headline: "Fine Jewellery",
      editorial: {
        eyebrow: "House rule",
        title: "Gold, or nothing",
        body: "We list solid metal only. A 9k chain worn daily outlives its owner; a plated one outlives a summer.",
        source: asset("boutique-2.jpg"),
        alt: "Jeweller's bench with gold chain",
        credit: "Photographed at Margot House, Melbourne",
      },
    },
  },
];

export const productTypes = [
  { slug: "designer-dresses", name: "Designer Dresses", categorySlug: "dresses" },
  { slug: "coats-and-jackets", name: "Coats & Jackets", categorySlug: "outerwear" },
  { slug: "designer-bags", name: "Designer Bags", categorySlug: "bags" },
  { slug: "fine-jewellery", name: "Fine Jewellery", categorySlug: "jewellery" },
];

export const brands = [
  "Zimmermann",
  "Camilla and Marc",
  "Saltbush Studio",
  "Margot House",
  "Bassike",
  "Christopher Esber",
].map((name) => ({
  name,
  slug: slugify(name),
  is_active: true,
  is_featured: true,
}));

export const merchants = [
  ["Maison Verre", "Sydney"],
  ["Atelier Nord", "Melbourne"],
  ["Saltbush Studio", "Hobart"],
  ["Margot House", "Perth"],
].map(([name, city]) => ({
  name,
  slug: slugify(name),
  city,
  country: "Australia",
  status: "approved",
  is_active: true,
  is_featured: true,
}));

export const colors = ["Ivory", "Champagne", "Stone", "Ink", "Camel"].map((name) => ({
  name,
  hex_code: null,
}));
export const sizes = ["XS", "S", "M", "L", "One size"];
export const conditions = ["new", "excellent", "good"];

const names = {
  dresses: [
    "Illoura Plunge Gown",
    "Verity Bias Slip",
    "Aster Crepe Midi",
    "Noon Column Dress",
    "Lisette Ruched Silk",
    "Marram Linen Shift",
    "Estelle Cowl Gown",
    "Palma Poplin Dress",
    "Solene Wrap Dress",
    "Ondine Tulle Midi",
    "Colette Knit Dress",
    "Halden Shirt Dress",
  ],
  outerwear: [
    "Halcyon Wool Coat",
    "Brenne Double-Faced Cashmere",
    "Idris Tailored Blazer",
    "Vantage Trench",
    "Nord Shearling Jacket",
    "Kestrel Wool Cape",
    "Lowell Quilted Coat",
    "Marlowe Overshirt",
    "Serra Belted Coat",
    "Ashby Puffer",
    "Weir Cropped Jacket",
    "Corso Car Coat",
  ],
  bags: [
    "Marché Structured Tote",
    "Ida Top Handle",
    "Reeve Shoulder Bag",
    "Pell Card Holder",
    "Otway Weekender",
    "Juno Crescent Bag",
    "Bellweather Bucket",
    "Alba Envelope Clutch",
    "Ledger Document Case",
    "Wren Mini Crossbody",
    "Fold Leather Pouch",
    "Sable Hobo",
  ],
  jewellery: [
    "Solene Pendant, 18k",
    "Fen Signet Ring",
    "Aurelia Hoops",
    "Linea Chain, 9k",
    "Perrin Stone Ring",
    "Vesper Drop Earrings",
    "Onda Cuff",
    "Mira Pearl Studs",
    "Halo Band, 18k",
    "Cassia Charm Chain",
    "Ivo Bar Necklace",
    "Nell Huggies",
  ],
};
const compositions = {
  dresses: ["100% mulberry silk", "72% viscose, 28% silk crepe", "100% Belgian linen"],
  outerwear: [
    "100% Australian merino wool, 480gsm",
    "Double-faced cashmere",
    "Wool-alpaca blend, horn buttons",
  ],
  bags: [
    "Vegetable-tanned calf leather",
    "Full-grain bridle leather, brass hardware",
    "Suede-lined nappa",
  ],
  jewellery: [
    "Solid 18k yellow gold",
    "Solid 9k gold, hand-set stone",
    "Recycled 18k gold, freshwater pearl",
  ],
};
const measurements = {
  dresses: [
    ["Bust", 88, "cm"],
    ["Waist", 70, "cm"],
    ["Length", 134, "cm"],
  ],
  outerwear: [
    ["Shoulder", 42, "cm"],
    ["Chest", 104, "cm"],
    ["Sleeve", 62, "cm"],
    ["Length", 118, "cm"],
  ],
  bags: [
    ["Width", 32, "cm"],
    ["Height", 26, "cm"],
    ["Depth", 13, "cm"],
    ["Strap drop", 24, "cm"],
  ],
  jewellery: [
    ["Length", 45, "cm"],
    ["Weight", 4.2, "g"],
  ],
};

export const products = categories.flatMap((category) =>
  names[category.slug].map((name, index) => {
    const price = 180 + ((index * 137) % 1400);
    const reduction = [0, 25, 35, 40, 55, 62][index % 6];
    const original = reduction ? Math.round(price / (1 - reduction / 100)) : price;
    const brand = brands[index % brands.length];
    const merchant = merchants[index % merchants.length];
    const color = colors[index % colors.length];
    return {
      name,
      slug: `${category.slug}-${index}`,
      categorySlug: category.slug,
      productTypeSlug: productTypes.find((type) => type.categorySlug === category.slug).slug,
      brandSlug: brand.slug,
      merchantSlug: merchant.slug,
      condition: conditions[index % conditions.length],
      composition: compositions[category.slug][index % 3],
      description: `Acquired directly from ${merchant.name} in ${merchant.city}. Authenticated in-house by our buying team and photographed as received.`,
      short_description: `${name} by ${brand.name}`,
      status: "published",
      is_featured: index < 4,
      is_new_arrival: reduction === 0,
      season: `${2021 + (index % 5)}`,
      variant: {
        sku: `${category.slug}-${index}-${slugify(color.name)}`.toUpperCase(),
        name: color.name,
        color: color.name,
        sizes: [sizes[index % sizes.length]],
        original_price: original,
        discounted_price: reduction ? price : null,
        currency: "AUD",
        stock_quantity: 1 + (index % 4),
        is_default: true,
        is_available: true,
      },
      images: [
        {
          source: productAsset(category.slug, index),
          alt: `${name} by ${brand.name}`,
          position: 0,
          primary: true,
        },
        {
          source: productAsset(category.slug, (index + 4) % 12),
          alt: `${name}, alternate view`,
          position: 1,
          primary: false,
        },
        {
          source: productAsset(category.slug, (index + 8) % 12),
          alt: `${name}, detail view`,
          position: 2,
          primary: false,
        },
      ],
      measurements: measurements[category.slug],
    };
  }),
);

export const homepageSlides = [
  [
    "olive",
    "hero-olive.jpg",
    "Issue 07 — The Winter Edit",
    ["Where Fashion", "Becomes", "Art."],
    "Silk, Stone & Light",
    "Campaign 07",
    "oklch(0.265 0.036 126)",
    "oklch(0.78 0.09 92)",
  ],
  [
    "black",
    "hero-black.jpg",
    "Issue 08 — After Dark",
    ["Tailoring", "Cut for the", "Night."],
    "The Black Coat",
    "Campaign 08",
    "oklch(0.145 0.004 250)",
    "oklch(0.82 0.07 88)",
  ],
  [
    "sand",
    "hero-sand.jpg",
    "The Cashmere Rooms",
    ["Quiet Cloth,", "Long", "Winters."],
    "Ivory & Camel",
    "Campaign 09",
    "oklch(0.30 0.028 68)",
    "oklch(0.86 0.05 82)",
  ],
  [
    "navy",
    "hero-navy.jpg",
    "Outerwear Archive",
    ["A Coat", "Outlives the", "Season."],
    "Midnight Trench",
    "Campaign 10",
    "oklch(0.22 0.048 258)",
    "oklch(0.84 0.06 86)",
  ],
  [
    "burgundy",
    "hero-burgundy.jpg",
    "Evening — Chapter Two",
    ["Velvet, Held", "Against the", "Dark."],
    "Oxblood Velvet",
    "Campaign 11",
    "oklch(0.23 0.062 16)",
    "oklch(0.85 0.06 78)",
  ],
  [
    "terracotta",
    "hero-terracotta.jpg",
    "Fine Jewellery",
    ["Gold Kept", "Close to the", "Skin."],
    "Clay & Carat",
    "Campaign 12",
    "oklch(0.32 0.078 42)",
    "oklch(0.90 0.06 80)",
  ],
  [
    "slate",
    "hero-slate.jpg",
    "The Suiting Room",
    ["Precision,", "Softly", "Worn."],
    "Slate Tailoring",
    "Campaign 13",
    "oklch(0.27 0.014 250)",
    "oklch(0.86 0.04 90)",
  ],
  [
    "plum",
    "hero-plum.jpg",
    "Gowns — The Archive",
    ["Silk That", "Moves Like", "Water."],
    "Aubergine Silk",
    "Campaign 14",
    "oklch(0.25 0.088 330)",
    "oklch(0.88 0.06 84)",
  ],
].map(([id, file, kicker, lines, caption, campaign, bg, accent]) => ({
  id,
  image: asset(file),
  kicker,
  lines,
  caption,
  campaign,
  bg,
  accent,
}));

export const designerSpotlights = [
  {
    id: "marchetti",
    name: "Elène Marchetti",
    image: asset("designer.jpg"),
    alt: "Black and white portrait of designer Elène Marchetti",
    bio: "Twenty-two years between Milan and Melbourne. Marchetti cuts on the bias, dyes in small lots, and refuses a season calendar. The result is a wardrobe that behaves like an heirloom rather than a trend.",
    stats: [
      ["Since", "2003"],
      ["Atelier", "Fitzroy"],
      ["Pieces", "38"],
    ],
    bg: "oklch(0.265 0.036 126)",
    accent: "oklch(0.78 0.09 92)",
  },
  {
    id: "aoki",
    name: "Mieko Aoki",
    image: asset("designer-2.jpg"),
    alt: "Black and white portrait of designer Mieko Aoki in a linen atelier",
    bio: "Aoki works only in undyed linen and paper-thin wool, folding rather than seaming. Each garment is drafted from a single length of cloth — nothing cut away, nothing wasted.",
    stats: [
      ["Since", "1998"],
      ["Atelier", "Kyoto"],
      ["Pieces", "24"],
    ],
    bg: "oklch(0.30 0.028 68)",
    accent: "oklch(0.88 0.05 82)",
  },
  {
    id: "okoro",
    name: "Julien Okoro",
    image: asset("designer-3.jpg"),
    alt: "Black and white portrait of tailor Julien Okoro holding fabric shears",
    bio: "A Savile Row apprenticeship rebuilt for Melbourne heat. Okoro drafts unstructured tailoring in half-canvas, then finishes every buttonhole by hand in the Collingwood studio.",
    stats: [
      ["Since", "2014"],
      ["Atelier", "Collingwood"],
      ["Pieces", "51"],
    ],
    bg: "oklch(0.185 0.006 250)",
    accent: "oklch(0.84 0.07 88)",
  },
  {
    id: "lindqvist",
    name: "Ilse Lindqvist",
    image: asset("designer-4.jpg"),
    alt: "Black and white portrait of jewellery designer Ilse Lindqvist at a workbench",
    bio: "Recycled gold, rough-set stones, no polish where a thumb will wear one anyway. Lindqvist makes fine jewellery meant to be lived in rather than kept in a box.",
    stats: [
      ["Since", "2011"],
      ["Atelier", "Hobart"],
      ["Pieces", "66"],
    ],
    bg: "oklch(0.24 0.048 258)",
    accent: "oklch(0.86 0.06 86)",
  },
  {
    id: "rao",
    name: "Priya Rao",
    image: asset("designer-5.jpg"),
    alt: "Black and white portrait of textile designer Priya Rao in a dye studio",
    bio: "Rao dyes with madder, indigo and pomegranate rind in open vats, so no two lengths of silk ever repeat. The colour is the collection; the cut simply carries it.",
    stats: [
      ["Since", "2008"],
      ["Atelier", "Jaipur"],
      ["Pieces", "43"],
    ],
    bg: "oklch(0.25 0.072 22)",
    accent: "oklch(0.87 0.07 62)",
  },
];

export const siteAssets = [
  {
    key: "auth-hero",
    source: asset("hero.jpg"),
    alt: "Editorial still life from the DesignerSale atelier",
  },
  {
    key: "boutique-editorial-1",
    source: asset("boutique-1.jpg"),
    alt: "Independent boutique interior",
  },
  {
    key: "boutique-editorial-2",
    source: asset("boutique-2.jpg"),
    alt: "Australian atelier interior",
  },
];
export const homepageStats = [
  { value: 142, suffix: "", label: "Boutiques" },
  { value: 1876, suffix: "", label: "Pieces live" },
  { value: 62, suffix: "%", label: "Average reduction" },
  { value: 48, suffix: "h", label: "Delivery, nationwide" },
];
export function slugify(value) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_]+/g, "-");
}
