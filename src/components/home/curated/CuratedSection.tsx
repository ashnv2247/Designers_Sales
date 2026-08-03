import { useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { Reveal } from "@/components/Reveal";
import { CuratedCollectionCard } from "./CuratedCollectionCard";

interface CuratedPage {
  id: string;
  title: string;
  slug: string;
  subtitle: string | null;
  description: string | null;
  hero_image_url: string | null;
}

interface CuratedSectionProps {
  curatedPages: CuratedPage[];
  fallbackImage1: string;
  fallbackImage2: string;
  fallbackImage3: string;
}

export function CuratedSection({
  curatedPages,
  fallbackImage1,
  fallbackImage2,
  fallbackImage3,
}: CuratedSectionProps) {
  // Map and prioritize database curated pages, padding with mock entries if there are fewer than 3
  const displayEdits = useMemo(() => {
    const list: any[] = [];

    // Process items from the DB curated pages
    const dbPages = (curatedPages || []).filter((p) => p.slug !== "home");
    dbPages.forEach((page, i) => {
      list.push({
        id: page.id,
        title: page.title,
        eyebrow: i === 0 ? "Editor's Pick" : i === 1 ? "Boutique Edit" : "Seasonal Spotlight",
        description: page.subtitle || page.description || "Hand-picked designer edits.",
        image: page.hero_image_url || fallbackImage1,
        targetUrl: `/curated/${page.slug}`,
      });
    });

    const fallbacks = [
      {
        title: "The Designer Sale Edit",
        eyebrow: "Editor's Pick",
        description: "Statement pieces from leading designers, now up to 70% off.",
        discountText: "UP TO 70% OFF",
        image: fallbackImage1,
        targetUrl: "/shop/dresses",
      },
      {
        title: "Wedding Guest Edit",
        eyebrow: "Occasion Wear",
        description: "Curated styles for formal affairs and outdoor ceremonies.",
        image: fallbackImage2,
        targetUrl: "/shop/dresses",
      },
      {
        title: "Vacation Wardrobe",
        eyebrow: "Resort Dressing",
        description: "Lightweight designer pieces made for your next escape.",
        image: fallbackImage3,
        targetUrl: "/shop/dresses",
      },
    ];

    // Pad with fallbacks if DB returns fewer than 3 items
    let fallbackIndex = 0;
    while (list.length < 3) {
      const fb = fallbacks[fallbackIndex % fallbacks.length];
      list.push({
        ...fb,
        id: `fallback-${fallbackIndex}`,
      });
      fallbackIndex++;
    }

    return list.slice(0, 3);
  }, [curatedPages, fallbackImage1, fallbackImage2, fallbackImage3]);

  const [leftCard, rightCard1, rightCard2] = displayEdits;

  return (
    <section className="bg-cream/40 py-24 md:py-32 border-b border-border/30">
      <div className="mx-auto max-w-[1600px] px-5 md:px-10">
        {/* Section Heading */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <Reveal className="max-w-2xl">
            <span className="text-[0.6rem] font-bold uppercase tracking-[0.3em] text-burgundy mb-3 block">
              01 — Curated Edits
            </span>
            <h2 className="display text-[clamp(2.4rem,4.5vw,4.2rem)] leading-[0.95] text-ink">
              Curated <span className="italic">for You</span>
            </h2>
            <p className="mt-4 text-xs uppercase tracking-[0.2em] text-muted-foreground leading-relaxed">
              Hand-picked designer edits, seasonal favourites, and limited-time collections.
            </p>
          </Reveal>
          <Reveal className="shrink-0">
            <Link
              to="/shop/$category"
              params={{ category: "dresses" }}
              className="link-underline text-[0.65rem] font-bold uppercase tracking-[0.22em] text-ink hover:text-gold transition-colors block"
            >
              View All Collections
            </Link>
          </Reveal>
        </div>

        {/* Layout Grid */}
        <div className="grid gap-6 lg:grid-cols-12 items-start mt-8">
          {/* Left Large Column (60% width on desktop) */}
          <div className="lg:col-span-7 w-full">
            <Reveal delay={100}>
              <CuratedCollectionCard
                image={leftCard.image}
                eyebrow={leftCard.eyebrow}
                title={leftCard.title}
                description={leftCard.description}
                discountText={leftCard.discountText}
                targetUrl={leftCard.targetUrl}
                isLarge
              />
            </Reveal>
          </div>

          {/* Right Column (40% width on desktop) */}
          <div className="lg:col-span-5 w-full flex flex-col gap-6">
            <Reveal delay={200}>
              <CuratedCollectionCard
                image={rightCard1.image}
                eyebrow={rightCard1.eyebrow}
                title={rightCard1.title}
                description={rightCard1.description}
                discountText={rightCard1.discountText}
                targetUrl={rightCard1.targetUrl}
              />
            </Reveal>

            <Reveal delay={300}>
              <CuratedCollectionCard
                image={rightCard2.image}
                eyebrow={rightCard2.eyebrow}
                title={rightCard2.title}
                description={rightCard2.description}
                discountText={rightCard2.discountText}
                targetUrl={rightCard2.targetUrl}
              />
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
