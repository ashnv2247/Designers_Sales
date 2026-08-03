import { Link } from "@tanstack/react-router";
import { getCloudinaryImageUrl } from "@/lib/cloudinary-images";
import { ImageWithSkeleton } from "@/components/Skeleton";
import { ArrowRight } from "@/components/Icons";

interface Brand {
  name: string;
  slug: string;
  logo_url: string | null;
  cover_image_url?: string | null;
}

interface FeaturedBrandBannerProps {
  brand: Brand;
  fallbackImage: string;
}

export function FeaturedBrandBanner({ brand, fallbackImage }: FeaturedBrandBannerProps) {
  const coverImage = brand.cover_image_url || fallbackImage;

  return (
    <div className="relative w-full bg-stone overflow-hidden border border-border/20 shadow-md mb-12 h-96 md:h-[480px]">
      {/* Campaign Background Image */}
      <div className="absolute inset-0 w-full h-full">
        <ImageWithSkeleton
          src={getCloudinaryImageUrl(coverImage, "banner")}
          alt={`${brand.name} campaign`}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-[1200ms] ease-luxe hover:scale-102"
        />
      </div>

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />

      {/* Content over image */}
      <div className="absolute inset-0 flex flex-col justify-center p-6 md:p-12 text-ivory max-w-xl">
        <span className="text-[0.6rem] font-bold uppercase tracking-[0.3em] text-gold mb-3 block">
          Featured Designer
        </span>
        <h3 className="display text-4xl md:text-5xl lg:text-6xl text-ivory leading-none mb-4 font-light">
          {brand.name}
        </h3>
        <p className="text-xs md:text-sm text-ivory/80 font-serif leading-relaxed mb-8 max-w-md">
          Explore selected archive pieces, new arrivals, and seasonal favorites from {brand.name} at
          exclusive clearance prices up to 55% off.
        </p>

        <div className="flex">
          <Link
            to="/shop/$category"
            params={{ category: "dresses" }}
            search={{ designer: brand.name } as any}
            className="inline-flex items-center gap-3 bg-gold hover:bg-ivory hover:text-ink text-ink font-bold text-[0.65rem] uppercase tracking-[0.24em] px-8 py-4.5 shadow-lg transition-all duration-300"
          >
            <span>Shop {brand.name}</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
