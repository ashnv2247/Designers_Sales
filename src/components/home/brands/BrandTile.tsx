import { Link } from "@tanstack/react-router";
import { getCloudinaryImageUrl } from "@/lib/cloudinary-images";
import { ImageWithSkeleton } from "@/components/Skeleton";
import { ArrowRight } from "@/components/Icons";

interface BrandTileProps {
  name: string;
  slug: string;
  logoUrl: string | null;
  productCount: number;
}

export function BrandTile({ name, slug, logoUrl, productCount }: BrandTileProps) {
  return (
    <Link
      to="/shop/$category"
      params={{ category: "dresses" }}
      search={{ designer: name } as any}
      className="group relative block bg-background border border-border/30 hover:border-gold/60 p-6 md:p-8 flex flex-col items-center justify-center text-center transition-all duration-300 h-36 md:h-44 shadow-sm hover:shadow-md rounded-sm overflow-hidden"
    >
      {/* Brand logo or Typographic fallback */}
      {logoUrl ? (
        <div className="w-full h-16 relative flex items-center justify-center transition-all duration-300 group-hover:scale-102">
          <img
            src={getCloudinaryImageUrl(logoUrl, "logo")}
            alt={`${name} logo`}
            loading="lazy"
            className="max-w-[80%] max-h-full object-contain filter grayscale opacity-80 group-hover:opacity-100 group-hover:grayscale-0 transition-all duration-300"
          />
        </div>
      ) : (
        <span className="font-serif text-xl md:text-2xl font-light tracking-wide text-ink group-hover:text-gold transition-colors duration-300">
          {name}
        </span>
      )}

      {/* Product Count / Muted Label */}
      <span className="text-[0.55rem] font-bold tracking-widest text-muted-foreground uppercase mt-3 transition-opacity duration-300 group-hover:opacity-0">
        {productCount} {productCount === 1 ? "piece" : "pieces"}
      </span>

      {/* Hover action overlay */}
      <div className="absolute inset-x-0 bottom-0 translate-y-3 opacity-0 transition-all duration-300 ease-luxe group-hover:translate-y-0 group-hover:opacity-100 pb-4 flex items-center justify-center gap-1.5 text-[0.58rem] font-bold uppercase tracking-[0.2em] text-gold pointer-events-none">
        <span>Shop Designer</span>
        <ArrowRight className="h-3 w-3" />
      </div>
    </Link>
  );
}
