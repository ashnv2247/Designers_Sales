/* eslint-disable @typescript-eslint/no-explicit-any */
import { CuratedPageHero } from "@/components/curated/CuratedPageHero";
import { ProductCard } from "@/components/ProductCard";
import type { CuratedPageData } from "@/lib/curated-public.types";
import { getVariantPriceSummary } from "@/lib/pricing";

export function CuratedPagePreview({ page }: { page: any; showInactive?: boolean }) {
  if (!page) return null;

  const rawProducts = (page.curated_page_products ?? [])
    .sort((a: any, b: any) => (a.display_order ?? 0) - (b.display_order ?? 0))
    .map((cpp: any) => {
      const p = cpp.products;
      if (!p) return null;
      const defaultColor = p.options?.find((o: any) => o.isDefault) ?? p.options?.[0];
      const primaryImg =
        defaultColor?.images?.find((img: any) => img.isPrimary)?.url ||
        defaultColor?.images?.[0]?.url ||
        "";
      const priceSummary = getVariantPriceSummary(p.product_variants ?? []);
      return {
        id: p.id,
        name: p.name,
        designer: p.brands?.name ?? p.brand_id ?? "Designer",
        price: priceSummary
          ? `${priceSummary.hasRange ? "From " : ""}$${priceSummary.lowest.currentPrice}`
          : "Price required",
        was: priceSummary?.lowest.isDiscounted
          ? `$${priceSummary.lowest.originalPrice}`
          : undefined,
        badge: p.status === "draft" ? "Draft" : undefined,
        image: primaryImg,
        alt: p.name,
      };
    })
    .filter(Boolean);

  const pageData: CuratedPageData = {
    id: page.id || "preview-id",
    title: page.title || "Untitled Curated Page",
    slug: page.slug || "preview",
    subtitle: page.subtitle ?? null,
    description: page.description ?? null,
    heroImageUrl: page.hero_image_url ?? null,
    mobileHeroImageUrl: page.mobile_hero_image_url ?? page.hero_image_url ?? null,
    seoTitle: page.seo_title ?? page.title,
    seoDescription: page.seo_description ?? page.subtitle ?? page.description,
    publishedAt: page.published_at ?? null,
    status: page.status || "draft",
    products: rawProducts,
  };

  return (
    <article className="bg-background text-foreground min-h-screen">
      <CuratedPageHero page={pageData} />

      <section className="mx-auto max-w-[1600px] px-5 py-12 md:px-10 md:py-20">
        {pageData.products.length > 0 ? (
          <div className="grid grid-cols-2 gap-x-5 gap-y-10 sm:gap-x-6 sm:gap-y-12 md:grid-cols-3 lg:grid-cols-4">
            {pageData.products.map((product, idx) => (
              <div key={product.id || idx}>
                <ProductCard product={product as any} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-muted-foreground border border-dashed rounded-lg">
            No products selected for this page. Add products in the editor.
          </div>
        )}
      </section>
    </article>
  );
}
