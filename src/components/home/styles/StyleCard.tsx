import { Link } from "@tanstack/react-router";
import { ArrowRight } from "@/components/Icons";
import { getCloudinaryImageUrl } from "@/lib/cloudinary-images";
import { ImageWithSkeleton } from "@/components/Skeleton";

interface StyleCardProps {
  title: string;
  description: string;
  image: string;
  targetUrl: string;
  isLarge?: boolean;
}

export function StyleCard({
  title,
  description,
  image,
  targetUrl,
  isLarge = false,
}: StyleCardProps) {
  // Parse tanstack routes vs standard anchor links
  const isExternal = targetUrl.startsWith("http") || targetUrl.startsWith("#");

  const cardContent = (
    <>
      {/* Background Image */}
      <div className="absolute inset-0 h-full w-full">
        <ImageWithSkeleton
          src={getCloudinaryImageUrl(image, "banner")}
          alt={title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-[1200ms] ease-luxe group-hover:scale-104"
        />
      </div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent transition-opacity duration-300 group-hover:via-black/45" />

      {/* Decorative Corner Borders on Hover */}
      <div className="absolute inset-4 border border-gold/0 transition-all duration-500 group-hover:border-gold/20 pointer-events-none" />

      {/* Text on top */}
      <div
        className={`absolute inset-0 flex flex-col justify-end p-6 md:p-8 text-ivory ${isLarge ? "max-w-md" : "max-w-xs"}`}
      >
        <h3
          className={`display text-ivory font-light leading-[1.05] tracking-wide mb-2 transition-colors duration-300 group-hover:text-gold ${
            isLarge ? "text-3xl md:text-4xl" : "text-xl md:text-2xl"
          }`}
        >
          {title}
        </h3>

        {isLarge && (
          <p className="text-xs text-ivory/80 font-serif leading-relaxed line-clamp-3 mb-4">
            {description}
          </p>
        )}

        <div className="inline-flex items-center gap-2 text-[0.62rem] font-bold uppercase tracking-[0.24em] text-gold/90 transition-all duration-300 group-hover:text-ivory mt-1">
          <span>Shop Style</span>
          <span className="transition-transform duration-300 group-hover:translate-x-1">
            <ArrowRight className="h-3 w-3" />
          </span>
        </div>
      </div>
    </>
  );

  const containerClasses = `group relative block w-full overflow-hidden bg-stone border border-border/10 shadow-sm transition-transform duration-500 ${
    isLarge ? "h-[450px] md:h-[620px]" : "h-[210px] md:h-[298px]"
  }`;

  if (isExternal) {
    return (
      <a href={targetUrl} className={containerClasses}>
        {cardContent}
      </a>
    );
  }

  // Handle TanStack Router navigation paths (splitting paths vs simple names)
  if (targetUrl.startsWith("/style/")) {
    const tag = targetUrl.replace("/style/", "");
    return (
      <Link to="/style/$tag" params={{ tag }} className={containerClasses}>
        {cardContent}
      </Link>
    );
  }

  if (targetUrl.startsWith("/shop/")) {
    const cat = targetUrl.replace("/shop/", "");
    return (
      <Link to="/shop/$category" params={{ category: cat }} className={containerClasses}>
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
