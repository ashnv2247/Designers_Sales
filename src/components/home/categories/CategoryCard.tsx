import { Link } from "@tanstack/react-router";
import { getCloudinaryImageUrl } from "@/lib/cloudinary-images";
import { ImageWithSkeleton } from "@/components/Skeleton";

interface CategoryCardProps {
  name: string;
  slug: string;
  image: string;
  productCount?: number;
}

export function CategoryCard({ name, slug, image, productCount }: CategoryCardProps) {
  return (
    <Link
      to="/shop/$category"
      params={{ category: slug }}
      className="group block bg-background overflow-hidden transition-all duration-300 focus:outline-none"
    >
      {/* Image Wrapper */}
      <div className="relative aspect-[3/4] overflow-hidden bg-cream border border-border/30 shadow-sm transition-shadow duration-300 group-hover:shadow-md">
        <ImageWithSkeleton
          src={getCloudinaryImageUrl(image, "card")}
          alt={name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 ease-luxe group-hover:scale-103"
        />
      </div>

      {/* Info details below the image */}
      <div className="mt-4 flex items-baseline justify-between">
        <h3 className="font-serif text-lg text-ink group-hover:text-gold transition-colors duration-300 relative inline-block">
          <span className="relative">
            {name}
            <span className="absolute left-0 bottom-0.5 h-[1px] w-full bg-gold scale-x-0 origin-right transition-transform duration-300 group-hover:scale-x-100 group-hover:origin-left" />
          </span>
        </h3>
        {productCount !== undefined && (
          <span className="text-[0.62rem] font-semibold uppercase tracking-wider text-muted-foreground">
            {productCount} {productCount === 1 ? "style" : "styles"}
          </span>
        )}
      </div>
    </Link>
  );
}
