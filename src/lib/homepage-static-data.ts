import heroJpg from "@/assets/hero.jpg";
import boutique1Jpg from "@/assets/boutique-1.jpg";
import boutique2Jpg from "@/assets/boutique-2.jpg";
import heroOlive from "@/assets/hero-olive.jpg";
import heroBlack from "@/assets/hero-black.jpg";
import heroSand from "@/assets/hero-sand.jpg";
import heroNavy from "@/assets/hero-navy.jpg";
import heroBurgundy from "@/assets/hero-burgundy.jpg";
import heroTerracotta from "@/assets/hero-terracotta.jpg";
import heroSlate from "@/assets/hero-slate.jpg";
import heroPlum from "@/assets/hero-plum.jpg";
import designerMarchetti from "@/assets/designer.jpg";
import designerAoki from "@/assets/designer-2.jpg";
import designerOkoro from "@/assets/designer-3.jpg";
import designerLindqvist from "@/assets/designer-4.jpg";
import designerRao from "@/assets/designer-5.jpg";

export const authHero = {
  image_url: heroJpg,
  alt_text: "Editorial still life from the DesignerSale atelier",
};

export const boutiqueAssets = {
  "boutique-editorial-1": boutique1Jpg,
  "boutique-editorial-2": boutique2Jpg,
};

export const homepageSlides = [
  {
    id: "olive",
    image: heroOlive,
    kicker: "Issue 07 — The Winter Edit",
    lines: ["Where Fashion", "Becomes", "Art."],
    caption: "Silk, Stone & Light",
    campaign: "Campaign 07",
    bg: "oklch(0.265 0.036 126)",
    accent: "oklch(0.78 0.09 92)",
    glow: "oklch(0.265 0.036 126 / 0.15)",
  },
  {
    id: "black",
    image: heroBlack,
    kicker: "Issue 08 — After Dark",
    lines: ["Tailoring", "Cut for the", "Night."],
    caption: "The Black Coat",
    campaign: "Campaign 08",
    bg: "oklch(0.145 0.004 250)",
    accent: "oklch(0.82 0.07 88)",
    glow: "oklch(0.145 0.004 250 / 0.15)",
  },
  {
    id: "sand",
    image: heroSand,
    kicker: "The Cashmere Rooms",
    lines: ["Quiet Cloth,", "Long", "Winters."],
    caption: "Ivory & Camel",
    campaign: "Campaign 09",
    bg: "oklch(0.30 0.028 68)",
    accent: "oklch(0.86 0.05 82)",
    glow: "oklch(0.30 0.028 68 / 0.15)",
  },
  {
    id: "navy",
    image: heroNavy,
    kicker: "Outerwear Archive",
    lines: ["A Coat", "Outlives the", "Season."],
    caption: "Midnight Trench",
    campaign: "Campaign 10",
    bg: "oklch(0.22 0.048 258)",
    accent: "oklch(0.84 0.06 86)",
    glow: "oklch(0.22 0.048 258 / 0.15)",
  },
  {
    id: "burgundy",
    image: heroBurgundy,
    kicker: "Evening — Chapter Two",
    lines: ["Velvet, Held", "Against the", "Dark."],
    caption: "Oxblood Velvet",
    campaign: "Campaign 11",
    bg: "oklch(0.23 0.062 16)",
    accent: "oklch(0.85 0.06 78)",
    glow: "oklch(0.23 0.062 16 / 0.15)",
  },
  {
    id: "terracotta",
    image: heroTerracotta,
    kicker: "Fine Jewellery",
    lines: ["Gold Kept", "Close to the", "Skin."],
    caption: "Clay & Carat",
    campaign: "Campaign 12",
    bg: "oklch(0.32 0.078 42)",
    accent: "oklch(0.90 0.06 80)",
    glow: "oklch(0.32 0.078 42 / 0.15)",
  },
  {
    id: "slate",
    image: heroSlate,
    kicker: "The Suiting Room",
    lines: ["Precision,", "Softly", "Worn."],
    caption: "Slate Tailoring",
    campaign: "Campaign 13",
    bg: "oklch(0.27 0.014 250)",
    accent: "oklch(0.86 0.04 90)",
    glow: "oklch(0.27 0.014 250 / 0.15)",
  },
  {
    id: "plum",
    image: heroPlum,
    kicker: "Gowns — The Archive",
    lines: ["Silk That", "Moves Like", "Water."],
    caption: "Aubergine Silk",
    campaign: "Campaign 14",
    bg: "oklch(0.25 0.088 330)",
    accent: "oklch(0.88 0.06 84)",
    glow: "oklch(0.25 0.088 330 / 0.15)",
  },
];

export const designerSpotlights = [
  {
    id: "marchetti",
    name: "Elène Marchetti",
    image: designerMarchetti,
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
    image: designerAoki,
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
    image: designerOkoro,
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
    image: designerLindqvist,
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
    image: designerRao,
    alt: "Black and white portrait of textile designer Priya Rao in a dye studio",
    bio: "Rao dyes with madder, indigo and pomegranate rind in open vats, so no two lengths of silk ever repeat. The collection is the collection; the cut simply carries it.",
    stats: [
      ["Since", "2008"],
      ["Atelier", "Jaipur"],
      ["Pieces", "43"],
    ],
    bg: "oklch(0.25 0.072 22)",
    accent: "oklch(0.87 0.07 62)",
  },
];

export const homepageStats = [
  { value: 142, suffix: "", label: "Boutiques" },
  { value: 1876, suffix: "", label: "Pieces live" },
  { value: 62, suffix: "%", label: "Average reduction" },
  { value: 48, suffix: "h", label: "Delivery, nationwide" },
];
