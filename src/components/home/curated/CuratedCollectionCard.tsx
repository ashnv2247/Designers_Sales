import { Link } from "@tanstack/react-router";
import { ArrowRight } from "@/components/Icons";
import { getCloudinaryImageUrl } from "@/lib/cloudinary-images";
import { ImageWithSkeleton } from "@/components/Skeleton";

interface CuratedCollectionCardProps {
  image: string;
  eyebrow: string;
  title: string;
  description: string;
  discountText?: string;
  targetUrl: string;
  isLarge?: boolean;
}

export function CuratedCollectionCard({
  image,
  eyebrow,
  title,
  description,
  discountText,
  targetUrl,
  isLarge = false,
}: CuratedCollectionCardProps) {
  const isExternal = targetUrl.startsWith("http") || targetUrl.startsWith("#");

  const cardContent = (
    <>
      {/* Background Image */}
      <div className="absolute inset-0 h-full w-full">
        <ImageWithSkeleton
          src={getCloudinaryImageUrl(image, "banner")}
          alt={title}
          className="h-full w-full object-cover transition-transform duration-[800ms] ease-luxe group-hover:scale-103"
        />
      </div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/10 transition-opacity duration-500 group-hover:via-black/50" />

      {/* Card Content */}
      <div
        className={`absolute inset-0 flex flex-col justify-end p-6 md:p-8 text-ivory ${
          isLarge ? "max-w-xl" : "max-w-lg"
        }`}
      >
        <span className="text-[0.6rem] font-bold uppercase tracking-[0.28em] text-gold mb-2 block">
          {eyebrow}
        </span>
        <h3
          className={`display text-ivory font-light leading-[1.05] tracking-wide mb-3 transition-colors duration-300 group-hover:text-gold ${
            isLarge ? "text-[2.2rem] md:text-[2.8rem]" : "text-xl md:text-2xl"
          }`}
        >
          {title}
        </h3>
        <p className="text-xs md:text-sm text-ivory/80 font-serif leading-relaxed line-clamp-2 mb-4">
          {description}
        </p>

        {discountText && (
          <span className="text-[0.65rem] font-bold tracking-[0.16em] uppercase text-gold bg-gold/10 border border-gold/25 px-2.5 py-1 self-start mb-4">
            {discountText}
          </span>
        )}

        <div className="inline-flex items-center gap-2 text-[0.62rem] font-bold uppercase tracking-[0.24em] text-ivory mt-2">
          <span>Explore the Edit</span>
          <span className="transition-transform duration-300 group-hover:translate-x-1.5">
            <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>
    </>
  );

  const containerClasses = `group relative block w-full overflow-hidden bg-stone border border-border/20 transition-all duration-500 shadow-sm ${
    isLarge ? "h-[620px]" : "h-[298px]"
  }`;

  if (isExternal) {
    return (
      <a href={targetUrl} className={containerClasses}>
        {cardContent}
      </a>
    );
  }

  if (targetUrl.startsWith("/curated/")) {
    const slug = targetUrl.replace("/curated/", "");
    return (
      <Link to="/curated/$slug" params={{ slug }} className={containerClasses}>
        {cardContent}
      </Link>
    );
  }

  if (targetUrl.startsWith("/shop/")) {
    const category = targetUrl.replace("/shop/", "");
    return (
      <Link to="/shop/$category" params={{ category }} className={containerClasses}>
        {cardContent}
      </Link>
    );
  }

  return (
    <Link to="/" className={containerClasses}>
      {cardContent}
    </Link>
  );
}
