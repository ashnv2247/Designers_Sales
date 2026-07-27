import type { CSSProperties } from "react";
import type { Product } from "@/components/ProductCard";

import catDresses from "@/assets/cat-dresses.jpg";
import catOuterwear from "@/assets/cat-outerwear.jpg";
import catBags from "@/assets/cat-bags.jpg";
import catJewellery from "@/assets/cat-jewellery.jpg";
import boutique1 from "@/assets/boutique-1.jpg";
import boutique2 from "@/assets/boutique-2.jpg";
import designerImg from "@/assets/designer.jpg";
import { PRODUCT_IMAGES } from "@/lib/product-images";

export interface CatalogItem extends Product {
  id: string;
  designerSlug: string;
  boutique: string;
  size: string;
  colour: string;
  condition: "New season" | "Archive" | "Sample";
  priceValue: number;
  reduction: number;
  addedDaysAgo: number;
  category: string;
  gallery: string[];
  measurements: { label: string; value: string }[];
  composition: string;
  conditionNote: string;
  provenance: { atelier: string; city: string; year: string; note: string };
}

export interface Category {
  slug: string;
  name: string;
  kicker: string;
  headline: string;
  standfirst: string;
  image: string;
  alt: string;
  editorial: {
    eyebrow: string;
    title: string;
    body: string;
    image: string;
    alt: string;
    credit: string;
  };
}

export const CATEGORIES: Category[] = [
  {
    slug: "dresses",
    name: "Dresses",
    kicker: "The Edit — No. 01",
    headline: "Dresses",
    standfirst:
      "Slip silks, sculpted crepe and occasion pieces drawn from the season's most considered Australian ateliers.",
    image: catDresses,
    alt: "Champagne silk slip dress on a linen backdrop",
    editorial: {
      eyebrow: "Styling note",
      title: "On the quiet slip",
      body: "Cut on the bias, worn without ceremony. Our buyers favour a single silk in a colour close to skin — it flatters at dusk and refuses to date.",
      image: boutique1,
      alt: "Boutique interior with soft daylight and hanging silks",
      credit: "Photographed at Maison Verre, Paddington",
    },
  },
  {
    slug: "outerwear",
    name: "Outerwear",
    kicker: "The Edit — No. 02",
    headline: "Outerwear",
    standfirst:
      "Tailored wool, double-faced cashmere and the long coat — the one garment worth an entire wardrobe's budget.",
    image: catOuterwear,
    alt: "Tailored charcoal wool coat",
    editorial: {
      eyebrow: "Buyer's note",
      title: "The coat, considered",
      body: "Weight before pattern. A 480gsm wool holds its shoulder for a decade; anything lighter is a season's indulgence dressed as an investment.",
      image: boutique2,
      alt: "Atelier rail of tailored coats in warm light",
      credit: "Photographed at Atelier Nord, Fitzroy",
    },
  },
  {
    slug: "bags",
    name: "Bags",
    kicker: "The Edit — No. 03",
    headline: "Bags & Leather",
    standfirst:
      "Vegetable-tanned totes, structured top handles and small leather goods from independent makers.",
    image: catBags,
    alt: "Tan structured leather tote on a stone plinth",
    editorial: {
      eyebrow: "Provenance",
      title: "Twelve hands, one hide",
      body: "Each Saltbush tote passes through twelve pairs of hands. The edge paint alone is laid in four coats, burnished between each.",
      image: boutique1,
      alt: "Leather workshop bench with tools",
      credit: "Photographed at Saltbush Studio, Hobart",
    },
  },
  {
    slug: "jewellery",
    name: "Fine Jewellery",
    kicker: "The Edit — No. 04",
    headline: "Fine Jewellery",
    standfirst:
      "Solid gold, single stones and heirloom-intent pieces. Nothing plated, nothing fleeting.",
    image: catJewellery,
    alt: "Fine gold chain necklace resting on ivory silk",
    editorial: {
      eyebrow: "House rule",
      title: "Gold, or nothing",
      body: "We list solid metal only. A 9k chain worn daily outlives its owner; a plated one outlives a summer.",
      image: boutique2,
      alt: "Jeweller's bench with gold chain",
      credit: "Photographed at Margot House, Melbourne",
    },
  },
];

export const DESIGNERS = [
  "Zimmermann",
  "Camilla and Marc",
  "Saltbush Studio",
  "Margot House",
  "Bassike",
  "Christopher Esber",
];

export const SIZES = ["XS", "S", "M", "L", "One size"];
export const COLOURS = ["Ivory", "Champagne", "Stone", "Ink", "Camel"];
export const CONDITIONS = ["New season", "Archive", "Sample"] as const;

export const PRICE_BANDS = [
  { label: "Under $300", min: 0, max: 300 },
  { label: "$300 – $600", min: 300, max: 600 },
  { label: "$600 – $1,000", min: 600, max: 1000 },
  { label: "$1,000 +", min: 1000, max: Infinity },
];

const NAMES: Record<string, string[]> = {
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

const IMAGES: Record<string, string> = {
  dresses: catDresses,
  outerwear: catOuterwear,
  bags: catBags,
  jewellery: catJewellery,
};

const BOUTIQUES = ["Maison Verre", "Atelier Nord", "Saltbush Studio", "Margot House"];

const fmt = (n: number) => `$${n.toLocaleString("en-AU")}`;

const CITIES = ["Sydney", "Melbourne", "Hobart", "Perth"];

const COMPOSITIONS: Record<string, string[]> = {
  dresses: ["100% mulberry silk", "72% viscose, 28% silk crepe", "100% Belgian linen"],
  outerwear: ["100% Australian merino wool, 480gsm", "Double-faced cashmere", "Wool-alpaca blend, horn buttons"],
  bags: ["Vegetable-tanned calf leather", "Full-grain bridle leather, brass hardware", "Suede-lined nappa"],
  jewellery: ["Solid 18k yellow gold", "Solid 9k gold, hand-set stone", "Recycled 18k gold, freshwater pearl"],
};

const CONDITION_NOTES: Record<string, string> = {
  "New season": "Unworn, current season. Delivered with original packaging, tags and dust bag.",
  Archive: "Previously stocked, unworn. Light shelf handling to packaging only; garment itself is immaculate.",
  Sample: "Showroom sample in a single size. Faint press marks possible; steamed and inspected before dispatch.",
};

const MEASUREMENTS: Record<string, { label: string; value: string }[]> = {
  dresses: [
    { label: "Bust", value: "88 cm" },
    { label: "Waist", value: "70 cm" },
    { label: "Length", value: "134 cm, shoulder to hem" },
    { label: "Model", value: "178 cm, wears size S" },
  ],
  outerwear: [
    { label: "Shoulder", value: "42 cm" },
    { label: "Chest", value: "104 cm" },
    { label: "Sleeve", value: "62 cm" },
    { label: "Length", value: "118 cm, centre back" },
  ],
  bags: [
    { label: "Width", value: "32 cm" },
    { label: "Height", value: "26 cm" },
    { label: "Depth", value: "13 cm" },
    { label: "Strap drop", value: "24 cm" },
  ],
  jewellery: [
    { label: "Length", value: "45 cm, adjustable to 42 cm" },
    { label: "Weight", value: "4.2 g" },
    { label: "Metal", value: "Solid gold, stamped" },
    { label: "Stone", value: "Where present, natural and untreated" },
  ],
};

function build(category: Category): CatalogItem[] {
  return NAMES[category.slug].map((name, i) => {
    const price = 180 + ((i * 137) % 1400);
    const reduction = [0, 25, 35, 40, 55, 62][i % 6];
    const was = reduction ? Math.round(price / (1 - reduction / 100)) : undefined;
    const designer = DESIGNERS[i % DESIGNERS.length];
    const condition = CONDITIONS[i % CONDITIONS.length];
    const boutique = BOUTIQUES[i % BOUTIQUES.length];
    const city = CITIES[i % CITIES.length];

    return {
      id: `${category.slug}-${i}`,
      name,
      designer,
      designerSlug: designer,
      boutique,
      size: SIZES[i % SIZES.length],
      colour: COLOURS[i % COLOURS.length],
      condition,
      price: fmt(price),
      was: was ? fmt(was) : undefined,
      priceValue: price,
      reduction,
      addedDaysAgo: (i * 3) % 30,
      badge: reduction >= 55 ? "Final pieces" : reduction === 0 ? "New in" : `${reduction}% off`,
      image: PRODUCT_IMAGES[category.slug]?.[i] ?? IMAGES[category.slug],
      alt: `${name} by ${designer}`,
      category: category.slug,
      gallery: [
        PRODUCT_IMAGES[category.slug]?.[i] ?? IMAGES[category.slug],
        PRODUCT_IMAGES[category.slug]?.[(i + 4) % 12] ?? boutique1,
        PRODUCT_IMAGES[category.slug]?.[(i + 8) % 12] ?? designerImg,
        boutique2,
      ],
      measurements: MEASUREMENTS[category.slug],
      composition: COMPOSITIONS[category.slug][i % 3],
      conditionNote: CONDITION_NOTES[condition],
      provenance: {
        atelier: boutique,
        city,
        year: `${2021 + (i % 5)}`,
        note: `Acquired directly from ${boutique} in ${city}. Authenticated in-house by our buying team and photographed as received.`,
      },
    } satisfies CatalogItem;
  });
}

export const CATALOG: Record<string, CatalogItem[]> = Object.fromEntries(
  CATEGORIES.map((c) => [c.slug, build(c)]),
);

export const getCategory = (slug: string) => CATEGORIES.find((c) => c.slug === slug);

export const ALL_ITEMS: CatalogItem[] = CATEGORIES.flatMap((c) => CATALOG[c.slug]);

export const getProduct = (id: string) => ALL_ITEMS.find((p) => p.id === id);

export const getRelated = (item: CatalogItem, count = 4) =>
  CATALOG[item.category].filter((p) => p.id !== item.id).slice(0, count);

/**
 * Per-piece tone. The product image's dominant backdrop is driven by the
 * piece's colourway, so we recolour the page around it.
 */
const TONES: Record<string, Record<string, string>> = {
  Ivory: {
    "--olive-deep": "oklch(0.265 0.036 126)",
    "--olive": "oklch(0.335 0.044 124)",
    "--olive-soft": "oklch(0.918 0.021 120)",
    "--gold": "oklch(0.72 0.072 78)",
    "--background": "oklch(0.976 0.008 85)",
    "--cream": "oklch(0.955 0.014 84)",
    "--border": "oklch(0.885 0.012 80)",
  },
  Champagne: {
    "--olive-deep": "oklch(0.30 0.062 52)",
    "--olive": "oklch(0.40 0.075 50)",
    "--olive-soft": "oklch(0.925 0.030 68)",
    "--gold": "oklch(0.76 0.085 66)",
    "--background": "oklch(0.972 0.014 72)",
    "--cream": "oklch(0.948 0.024 70)",
    "--border": "oklch(0.880 0.022 70)",
  },
  Stone: {
    "--olive-deep": "oklch(0.275 0.012 250)",
    "--olive": "oklch(0.395 0.018 250)",
    "--olive-soft": "oklch(0.918 0.008 250)",
    "--gold": "oklch(0.74 0.045 90)",
    "--background": "oklch(0.968 0.004 250)",
    "--cream": "oklch(0.942 0.006 250)",
    "--border": "oklch(0.878 0.008 250)",
  },
  Ink: {
    "--olive-deep": "oklch(0.175 0.028 268)",
    "--olive": "oklch(0.285 0.042 264)",
    "--olive-soft": "oklch(0.912 0.018 264)",
    "--gold": "oklch(0.80 0.070 86)",
    "--background": "oklch(0.962 0.006 264)",
    "--cream": "oklch(0.936 0.010 264)",
    "--border": "oklch(0.872 0.012 264)",
  },
  Camel: {
    "--olive-deep": "oklch(0.285 0.070 42)",
    "--olive": "oklch(0.415 0.095 44)",
    "--olive-soft": "oklch(0.922 0.034 56)",
    "--gold": "oklch(0.78 0.090 70)",
    "--background": "oklch(0.970 0.016 62)",
    "--cream": "oklch(0.944 0.026 60)",
    "--border": "oklch(0.876 0.026 58)",
  },
};

export const getTone = (item: { colour: string }): CSSProperties =>
  (TONES[item.colour] ?? TONES.Ivory) as CSSProperties;
