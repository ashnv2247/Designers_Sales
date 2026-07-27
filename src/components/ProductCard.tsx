import { useState } from "react";
import { HeartIcon } from "./Icons";

export interface Product {
  name: string;
  designer: string;
  price: string;
  was?: string;
  badge?: string;
  image: string;
  alt: string;
}

export function ProductCard({ product }: { product: Product }) {
  const [saved, setSaved] = useState(false);

  return (
    <article className="group">
      <div className="img-zoom relative aspect-[3/4] bg-cream">
        <img
          src={product.image}
          alt={product.alt}
          loading="lazy"
          className="h-full w-full object-cover"
        />

        {product.badge && (
          <span className="rule-label absolute left-4 top-4 bg-background/90 px-2.5 py-1.5 opacity-0 transition-opacity duration-500 group-hover:opacity-100 md:opacity-100">
            {product.badge}
          </span>
        )}

        <button
          aria-label={saved ? "Remove from wishlist" : "Save to wishlist"}
          aria-pressed={saved}
          onClick={() => setSaved((s) => !s)}
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center bg-background/80 backdrop-blur-sm transition-all duration-300 hover:bg-background"
        >
          <HeartIcon
            className={`transition-all duration-300 ${
              saved ? "scale-110 fill-current text-gold" : "text-foreground"
            }`}
          />
        </button>

        <div className="pointer-events-none absolute inset-x-3 bottom-3 translate-y-2 opacity-0 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100">
          <button className="w-full bg-background/95 py-3 text-[0.6rem] uppercase tracking-[0.22em] backdrop-blur transition-colors duration-300 hover:bg-olive-deep hover:text-ivory">
            Quick view
          </button>
        </div>
      </div>

      <div className="mt-4 flex items-start justify-between gap-4">
        <div>
          <p className="rule-label text-muted-foreground">{product.designer}</p>
          <h3 className="mt-1.5 font-serif text-lg leading-snug">{product.name}</h3>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-sm">{product.price}</p>
          {product.was && (
            <p className="text-xs text-muted-foreground line-through">{product.was}</p>
          )}
        </div>
      </div>
    </article>
  );
}
