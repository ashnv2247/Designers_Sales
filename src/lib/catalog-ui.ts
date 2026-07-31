import type { CSSProperties } from "react";
export const SIZES = ["XS", "S", "M", "L", "One size"];
export const COLOURS = ["Ivory", "Champagne", "Stone", "Ink", "Camel"];
export const CONDITIONS = ["New season", "Archive", "Sample"] as const;
export const PRICE_BANDS = [
  { label: "Under $300", min: 0, max: 300 },
  { label: "$300 – $600", min: 300, max: 600 },
  { label: "$600 – $1,000", min: 600, max: 1000 },
  { label: "$1,000 +", min: 1000, max: Infinity },
];
const tones: Record<string, CSSProperties> = {
  Ivory: {
    "--olive-deep": "oklch(0.30 0.055 126)",
    "--olive": "oklch(0.42 0.070 124)",
  } as CSSProperties,
  Champagne: {
    "--olive-deep": "oklch(0.32 0.045 82)",
    "--olive": "oklch(0.46 0.060 82)",
  } as CSSProperties,
  Stone: {
    "--olive-deep": "oklch(0.30 0.025 70)",
    "--olive": "oklch(0.43 0.035 72)",
  } as CSSProperties,
  Ink: {
    "--olive-deep": "oklch(0.22 0.028 264)",
    "--olive": "oklch(0.34 0.040 264)",
  } as CSSProperties,
  Camel: {
    "--olive-deep": "oklch(0.285 0.070 42)",
    "--olive": "oklch(0.415 0.095 44)",
  } as CSSProperties,
};
export const getTone = (item: { colour: string }) => tones[item.colour] ?? tones.Ivory;
