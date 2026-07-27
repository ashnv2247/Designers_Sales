import { useEffect, useState } from "react";
import type { CSSProperties } from "react";

/** sRGB (0-255) -> OKLCH */
function rgbToOklch(r: number, g: number, b: number) {
  const lin = (c: number) => {
    const v = c / 255;
    return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  };
  const R = lin(r);
  const G = lin(g);
  const B = lin(b);

  const l = Math.cbrt(0.4122214708 * R + 0.5363325363 * G + 0.0514459929 * B);
  const m = Math.cbrt(0.2119034982 * R + 0.6806995451 * G + 0.1073969566 * B);
  const s = Math.cbrt(0.0883024619 * R + 0.2817188376 * G + 0.6299787005 * B);

  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const Bb = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;

  const C = Math.sqrt(A * A + Bb * Bb);
  let H = (Math.atan2(Bb, A) * 180) / Math.PI;
  if (H < 0) H += 360;
  return { L, C, H };
}

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
const ok = (l: number, c: number, h: number) => `oklch(${l.toFixed(3)} ${c.toFixed(3)} ${h.toFixed(1)})`;

/**
 * Reads the average colour of an image and returns design-token overrides so
 * the whole page can be recoloured around the piece being viewed.
 */
export function useImageTone(src: string, fallback: CSSProperties): CSSProperties {
  const [tone, setTone] = useState<CSSProperties | null>(null);

  useEffect(() => {
    let cancelled = false;
    setTone(null);

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = src;

    const run = () => {
      try {
        const size = 24;
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) return;
        ctx.drawImage(img, 0, 0, size, size);
        const { data } = ctx.getImageData(0, 0, size, size);

        let r = 0;
        let g = 0;
        let b = 0;
        let n = 0;
        for (let i = 0; i < data.length; i += 4) {
          if (data[i + 3] < 128) continue;
          r += data[i];
          g += data[i + 1];
          b += data[i + 2];
          n++;
        }
        if (!n || cancelled) return;

        const { C, H } = rgbToOklch(r / n, g / n, b / n);
        const hue = H;
        // Keep the palette editorial: borrow the hue, tame the chroma.
        const c = clamp(C, 0.006, 0.05);

        setTone({
          "--olive-deep": ok(0.28, c * 1.6, hue),
          "--olive": ok(0.4, c * 1.8, hue),
          "--olive-soft": ok(0.92, c * 0.8, hue),
          "--gold": ok(0.76, c * 2, hue),
          "--background": ok(0.972, c * 0.38, hue),
          "--cream": ok(0.947, c * 0.62, hue),
          "--border": ok(0.882, c * 0.6, hue),
          "--muted": ok(0.947, c * 0.62, hue),
          "--muted-foreground": ok(0.52, c * 0.5, hue),
          "--secondary": ok(0.947, c * 0.62, hue),
          "--accent": ok(0.92, c * 0.8, hue),
        } as CSSProperties);
      } catch {
        /* tainted canvas or decode failure — keep the fallback tone */
      }
    };

    if (img.complete && img.naturalWidth) run();
    else img.addEventListener("load", run);

    return () => {
      cancelled = true;
      img.removeEventListener("load", run);
    };
  }, [src]);

  return tone ?? fallback;
}
