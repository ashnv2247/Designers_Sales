import { useMemo } from "react";
import { Reveal } from "@/components/Reveal";
import { CategoryCard } from "./CategoryCard";

interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
}

interface DbCatalogItem {
  category: string;
}

interface CategorySectionProps {
  categories: Category[];
  catalogItems: DbCatalogItem[];
}

export function CategorySection({ categories, catalogItems }: CategorySectionProps) {
  // Dynamically calculate product count for each category
  const categoriesWithCounts = useMemo(() => {
    return categories.map((cat) => {
      const count = catalogItems.filter((item) => item.category === cat.slug).length;
      return {
        ...cat,
        productCount: count,
      };
    });
  }, [categories, catalogItems]);

  if (!categories || categories.length === 0) return null;

  return (
    <section className="bg-background py-24 md:py-32 border-b border-border/30">
      <div className="mx-auto max-w-[1600px] w-full">
        {/* Centered Heading */}
        <Reveal className="text-center px-5 mb-16">
          <span className="text-[0.6rem] font-bold uppercase tracking-[0.3em] text-burgundy mb-3 block">
            02 — The Departments
          </span>
          <h2 className="display text-[clamp(2.4rem,4.5vw,4.2rem)] leading-[0.95] text-ink">
            Shop by <span className="italic">Category</span>
          </h2>
          <p className="mt-4 text-xs uppercase tracking-[0.2em] text-muted-foreground max-w-md mx-auto leading-relaxed">
            Find designer pieces across our most popular categories.
          </p>
        </Reveal>

        {/* Desktop Layout: Responsive Grid | Mobile Layout: Horizontal Snap Scroller */}
        <div className="px-5 md:px-10">
          {/* Desktop/Tablet Grid */}
          <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
            {categoriesWithCounts.map((cat, i) => (
              <Reveal key={cat.slug} delay={i * 80}>
                <CategoryCard
                  name={cat.name}
                  slug={cat.slug}
                  image={cat.image}
                  productCount={cat.productCount}
                />
              </Reveal>
            ))}
          </div>

          {/* Mobile Snap Scroller Row */}
          <div
            className="sm:hidden -mx-5 overflow-x-auto flex snap-x snap-mandatory scroll-smooth pb-4 px-5 gap-4 scrollbar-none"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {categoriesWithCounts.map((cat) => (
              <div key={cat.slug} className="min-w-[70vw] snap-align-start snap-always shrink-0">
                <CategoryCard
                  name={cat.name}
                  slug={cat.slug}
                  image={cat.image}
                  productCount={cat.productCount}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
