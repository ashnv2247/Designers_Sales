import { useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { Reveal } from "@/components/Reveal";
import { BrandTile } from "./BrandTile";
import { FeaturedBrandBanner } from "./FeaturedBrandBanner";

interface Brand {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  cover_image_url?: string | null;
  is_featured: boolean;
  is_active: boolean;
}

interface BrandSectionProps {
  brands: Brand[];
  catalogItems: any[];
  fallbackImage: string;
}

export function BrandSection({ brands, catalogItems, fallbackImage }: BrandSectionProps) {
  // Compute counts and find featured brand
  const brandsWithCounts = useMemo(() => {
    return (brands || []).map((brand) => {
      const count = catalogItems.filter(
        (item) =>
          item.designerSlug === brand.slug ||
          item.designer.toLowerCase() === brand.name.toLowerCase(),
      ).length;
      return {
        ...brand,
        productCount: count,
      };
    });
  }, [brands, catalogItems]);

  // Find the first featured brand with an active count, or fall back to any brand
  const featuredBrand = useMemo(() => {
    const featured = brandsWithCounts.find((b) => b.is_featured && b.productCount > 0);
    if (featured) return featured;
    // Fallback to Zimmermann if it exists, otherwise any featured brand
    const zimmermann = brandsWithCounts.find((b) => b.slug === "zimmermann");
    if (zimmermann) return zimmermann;
    return brandsWithCounts.find((b) => b.is_featured) || null;
  }, [brandsWithCounts]);

  if (!brands || brands.length === 0) return null;

  return (
    <section className="bg-background py-24 md:py-32 border-b border-border/30">
      <div className="mx-auto max-w-[1600px] px-5 md:px-10">
        {/* Centered Heading */}
        <div className="flex flex-col items-center text-center mb-16">
          <Reveal>
            <span className="text-[0.6rem] font-bold uppercase tracking-[0.3em] text-burgundy mb-3 block">
              05 — Curator Spotlight
            </span>
            <h2 className="display text-[clamp(2.4rem,4.5vw,4.2rem)] leading-[0.95] text-ink">
              Shop by <span className="italic">Brand</span>
            </h2>
            <p className="mt-4 text-xs uppercase tracking-[0.2em] text-muted-foreground max-w-md mx-auto leading-relaxed">
              Explore leading designers and emerging labels.
            </p>
          </Reveal>

          <Reveal className="mt-4">
            <Link
              to="/shop/$category"
              params={{ category: "dresses" }}
              className="link-underline text-[0.65rem] font-bold uppercase tracking-[0.22em] text-ink hover:text-gold transition-colors block"
            >
              View All Brands
            </Link>
          </Reveal>
        </div>

        {/* Featured Brand Banner */}
        {featuredBrand && (
          <Reveal>
            <FeaturedBrandBanner brand={featuredBrand} fallbackImage={fallbackImage} />
          </Reveal>
        )}

        {/* Brand Grid Layout */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {brandsWithCounts.map((brand, i) => (
            <Reveal key={brand.slug} delay={i * 50}>
              <BrandTile
                name={brand.name}
                slug={brand.slug}
                logoUrl={brand.logo_url}
                productCount={brand.productCount}
              />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
