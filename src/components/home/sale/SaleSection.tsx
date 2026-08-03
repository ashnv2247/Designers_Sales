import { useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { Reveal } from "@/components/Reveal";
import { SaleCountdown } from "./SaleCountdown";
import { SaleTicker } from "./SaleTicker";
import { SaleProductCard } from "./SaleProductCard";

interface ActiveCampaign {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  banner_image_url: string | null;
  starts_at: string | null;
  ends_at: string | null;
  sale_products: { product_id: string; display_order: number }[];
}

interface SaleSectionProps {
  activeCampaign: ActiveCampaign | null;
  catalogItems: any[];
}

export function SaleSection({ activeCampaign, catalogItems }: SaleSectionProps) {
  // Get products for the campaign, fallback to all reduced items in catalog if no campaign exists
  const campaignProducts = useMemo(() => {
    if (activeCampaign && activeCampaign.sale_products?.length > 0) {
      const productIds = new Set(activeCampaign.sale_products.map((sp) => sp.product_id));
      return catalogItems
        .filter((item) => productIds.has(item.dbId))
        .sort((a, b) => {
          const orderA =
            activeCampaign.sale_products.find((sp) => sp.product_id === a.dbId)?.display_order ?? 0;
          const orderB =
            activeCampaign.sale_products.find((sp) => sp.product_id === b.dbId)?.display_order ?? 0;
          return orderA - orderB;
        });
    }

    // Fallback: items that have a price drop
    return catalogItems
      .filter((item) => item.reduction > 0)
      .sort((a, b) => b.reduction - a.reduction)
      .slice(0, 8);
  }, [activeCampaign, catalogItems]);

  const hasProducts = campaignProducts.length > 0;
  const isRealCampaign = !!activeCampaign;

  // Determine copy
  const campaignTitle = isRealCampaign ? activeCampaign.name : "Designer Sale";
  const campaignDesc = isRealCampaign
    ? activeCampaign.description
    : "Exclusive markdown events and clearance prices from leading Australian boutiques.";
  const maxDiscount = useMemo(() => {
    if (campaignProducts.length === 0) return 70;
    return Math.max(...campaignProducts.map((p) => p.reduction || 0), 70);
  }, [campaignProducts]);

  if (!hasProducts) return null; // Hide completely if no products to show

  return (
    <section className="bg-burgundy py-20 text-ivory overflow-hidden border-b border-border/10 relative">
      {/* Visual Ticker Banner at Top */}
      <div className="absolute top-0 left-0 w-full z-10">
        <SaleTicker />
      </div>

      <div className="mx-auto max-w-[1600px] px-5 md:px-10 pt-12">
        {/* Campaign Header layout: Promo content on left, Countdown on right on desktop */}
        <div className="grid gap-8 lg:grid-cols-12 items-center mb-16">
          <div className="lg:col-span-8 space-y-4">
            <Reveal>
              <span className="text-[0.6rem] font-bold uppercase tracking-[0.3em] text-gold mb-3 block">
                {isRealCampaign ? "03 — Active Campaign" : "03 — Price Reductions"}
              </span>
              <h2 className="display text-[clamp(2.8rem,5.5vw,5.2rem)] leading-[0.9] text-ivory">
                {campaignTitle} <br />
                <span className="italic text-gold font-normal">Up to {maxDiscount}% Off</span>
              </h2>
              <p className="mt-4 max-w-xl text-xs md:text-sm text-ivory/80 uppercase tracking-widest leading-relaxed">
                {campaignDesc}
              </p>
            </Reveal>

            <Reveal className="pt-2">
              <Link
                to="/shop/$category"
                params={{ category: "dresses" }}
                className="inline-flex items-center gap-3 bg-gold hover:bg-ivory hover:text-ink text-ink font-bold text-[0.65rem] uppercase tracking-[0.24em] px-8 py-4 shadow-lg transition-all duration-300"
              >
                Shop All Sale
              </Link>
            </Reveal>
          </div>

          {/* Countdown Area */}
          {isRealCampaign && activeCampaign.ends_at && (
            <div className="lg:col-span-4 bg-black/25 border border-white/10 p-6 md:p-8 flex justify-center items-center shadow-inner self-stretch lg:h-auto">
              <Reveal>
                <SaleCountdown endsAt={activeCampaign.ends_at} />
              </Reveal>
            </div>
          )}
        </div>

        {/* Swipeable Product Row */}
        <div>
          <div
            className="overflow-x-auto flex snap-x snap-mandatory pb-4 gap-6 scrollbar-none -mx-5 px-5 md:-mx-10 md:px-10"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {campaignProducts.map((product, i) => (
              <div
                key={product.id || product.dbId}
                className="min-w-[75vw] sm:min-w-[45vw] lg:min-w-[22vw] snap-align-start snap-always shrink-0"
              >
                <Reveal delay={i * 80}>
                  <SaleProductCard product={product} />
                </Reveal>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
