/* eslint-disable @typescript-eslint/no-explicit-any */
import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";

import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { Reveal } from "@/components/Reveal";
import { ProductCard } from "@/components/ProductCard";
import {
  byCategory,
  catalogQuery,
  homepageQuery,
  publicCuratedPagesQuery,
} from "@/lib/catalog-queries";
import { ArrowRight, SearchIcon } from "@/components/Icons";
import { getCloudinaryImageUrl } from "@/lib/cloudinary-images";
import { HomeSkeleton, ImageWithSkeleton } from "@/components/Skeleton";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "DesignerSale — Curated Luxury from Australia's Boutiques" },
      {
        name: "description",
        content:
          "An editorial marketplace of Australia's most considered boutiques, designers and ateliers. Discover archive pieces, new season and quiet luxury.",
      },
      { property: "og:title", content: "DesignerSale — Curated Luxury Marketplace" },
      {
        property: "og:description",
        content:
          "An editorial marketplace of Australia's most considered boutiques, designers and ateliers.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(catalogQuery),
      context.queryClient.ensureQueryData(homepageQuery),
      context.queryClient.ensureQueryData(publicCuratedPagesQuery),
    ]);
  },
  pendingComponent: HomeSkeleton,
  component: Home,
});

function Counter({ value, suffix }: { value: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [n, setN] = useState(0);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      const start = performance.now();
      const tick = (t: number) => {
        const p = Math.min((t - start) / 1400, 1);
        setN(Math.round(value * (1 - Math.pow(1 - p, 3))));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
    io.observe(node);
    return () => io.disconnect();
  }, [value]);

  return (
    <span ref={ref} className="display text-[clamp(2.2rem,4vw,3.4rem)] tabular-nums">
      {n.toLocaleString()}
      {suffix}
    </span>
  );
}

function Home() {
  const { data: catalogItems } = useSuspenseQuery(catalogQuery);
  const { data: homepage } = useSuspenseQuery(homepageQuery);
  const { data: curatedPages } = useSuspenseQuery(publicCuratedPagesQuery);
  const SLIDES = homepage.slides;
  const CATEGORIES = homepage.categories;
  const DESIGNERS = homepage.designers;
  const STATS = homepage.stats;
  const boutique1 = homepage.assets["boutique-editorial-1"];
  const boutique2 = homepage.assets["boutique-editorial-2"];
  const mostWanted = useMemo(
    () =>
      [
        byCategory(catalogItems, "dresses")[0],
        byCategory(catalogItems, "outerwear")[1],
        byCategory(catalogItems, "bags")[2],
        byCategory(catalogItems, "jewellery")[3],
      ].filter(Boolean),
    [catalogItems],
  );
  const [slide, setSlide] = useState(0);
  const [paused, setPaused] = useState(false);
  const active = SLIDES[slide] ?? SLIDES[0];
  const [designerIdx, setDesignerIdx] = useState(0);
  const activeDesigner = DESIGNERS[designerIdx] ?? DESIGNERS[0];

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setSlide((s) => (s + 1) % SLIDES.length), 6000);
    return () => clearInterval(t);
  }, [paused, SLIDES.length]);

  return (
    <div className="min-h-screen bg-background">
      <Nav overlay />

      <main className="overflow-x-hidden">
        {/* ── 3. Redesigned Hero Section ───────────────────────── */}
        <section
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          style={
            {
              backgroundColor: active.bg,
              "--slide-glow": active.glow,
              "--slide-accent": active.accent,
            } as React.CSSProperties
          }
          className="relative min-h-[85vh] pt-28 lg:pt-36 pb-16 flex items-center transition-[background-color] duration-[1200ms] ease-luxe text-ivory overflow-hidden origin-top"
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_90%_at_15%_20%,color-mix(in_oklab,var(--slide-glow)_75%,transparent),transparent_70%)] transition-[background] duration-[1200ms]" />
          <div className="relative mx-auto max-w-[1600px] w-full px-5 md:px-10 grid gap-12 lg:grid-cols-12 items-center">
            {/* Left Side: Conversion Copy */}
            <div className="lg:col-span-6 order-2 lg:order-1 flex flex-col justify-center">
              <span
                style={{
                  color: "var(--slide-accent)",
                  backgroundColor: "color-mix(in oklab, var(--slide-accent) 15%, transparent)",
                  borderColor: "color-mix(in oklab, var(--slide-accent) 30%, transparent)",
                }}
                className="text-[0.62rem] font-bold uppercase tracking-[0.3em] px-3 py-1.5 border self-start mb-6"
              >
                {active.kicker || "Luxury Clearance Marketplace"}
              </span>
              <h1 className="display text-[clamp(2.8rem,5.5vw,5.2rem)] leading-[0.92] text-ivory">
                {active.headline} <br />
                <span style={{ color: "var(--slide-accent)" }} className="italic font-medium">
                  {active.highlightedText}
                </span>
              </h1>
              <p className="mt-6 max-w-lg text-sm md:text-base leading-relaxed text-ivory/80">
                {active.description}
              </p>

              <div className="mt-9 flex flex-wrap gap-4">
                <a
                  href={active.targetPath || "#search-section"}
                  style={{ backgroundColor: "var(--slide-accent)" }}
                  className="inline-flex items-center gap-3 px-9 py-4.5 text-[0.65rem] font-bold uppercase tracking-[0.24em] text-ink shadow-lg hover:opacity-90 transition-all duration-300 hover:-translate-y-0.5"
                >
                  {active.ctaLabel || "Shop Sale"} <ArrowRight />
                </a>
                <Link
                  to="/shop/$category"
                  params={{ category: "dresses" }}
                  className="inline-flex items-center gap-3 border border-ivory/20 bg-ivory/10 backdrop-blur px-9 py-4.5 text-[0.65rem] font-bold uppercase tracking-[0.24em] text-ivory hover:border-ivory/40 transition-all duration-300 hover:-translate-y-0.5"
                >
                  Browse New Arrivals
                </Link>
              </div>

              {/* Trust Badges Row */}
              <div className="mt-12 pt-8 border-t border-ivory/10 grid grid-cols-3 gap-4 text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-ivory/60">
                <div className="flex items-center gap-2">
                  <span style={{ color: "var(--slide-accent)" }} className="text-sm font-bold">
                    ✓
                  </span>
                  <span>Authentic Brands</span>
                </div>
                <div className="flex items-center gap-2">
                  <span style={{ color: "var(--slide-accent)" }} className="text-sm font-bold">
                    ✓
                  </span>
                  <span>Limited Stock</span>
                </div>
                <div className="flex items-center gap-2">
                  <span style={{ color: "var(--slide-accent)" }} className="text-sm font-bold">
                    ✓
                  </span>
                  <span>Weekly Drops</span>
                </div>
              </div>
            </div>

            {/* Right Side: Lifestyle Image & Interactive Badges */}
            <div className="lg:col-span-6 order-1 lg:order-2 relative flex justify-center">
              <div className="relative aspect-[4/5] w-full max-w-md md:max-w-lg overflow-hidden bg-stone shadow-xl">
                <ImageWithSkeleton
                  src={getCloudinaryImageUrl(active.image, "banner")}
                  alt="Premium Designer Clearance"
                  className="h-full w-full object-cover transition-transform duration-1000 scale-100 hover:scale-102"
                />

                {/* Manual Navigation Arrows */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSlide((s) => (s - 1 + SLIDES.length) % SLIDES.length);
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-3.5 bg-black/45 hover:bg-black/75 backdrop-blur border border-white/10 text-white rounded-full transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer shadow-md"
                  aria-label="Previous Slide"
                >
                  <svg
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    viewBox="0 0 24 24"
                    className="h-4.5 w-4.5"
                    width="18"
                    height="18"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSlide((s) => (s + 1) % SLIDES.length);
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-3.5 bg-black/45 hover:bg-black/75 backdrop-blur border border-white/10 text-white rounded-full transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer shadow-md"
                  aria-label="Next Slide"
                >
                  <svg
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    viewBox="0 0 24 24"
                    className="h-4.5 w-4.5"
                    width="18"
                    height="18"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>

                {/* Floating Discount Badge */}
                <div className="absolute top-4 left-4 bg-burgundy text-ivory text-xs font-bold tracking-[0.2em] px-4 py-2.5 shadow-md uppercase animate-[pulse_3s_infinite]">
                  70% OFF
                </div>

                {/* Floating Card 1: -70% */}
                <div className="absolute right-4 top-12 bg-background/90 backdrop-blur-md px-4 py-3 shadow-lg border border-border/20 flex flex-col hover:scale-105 transition-transform duration-300">
                  <span className="text-[0.55rem] font-bold tracking-wider text-muted-foreground uppercase">
                    Average Discount
                  </span>
                  <span className="text-xl font-bold text-burgundy mt-0.5">-70% OFF</span>
                </div>

                {/* Floating Card 2: Urgency */}
                <div className="absolute left-4 bottom-20 bg-background/90 backdrop-blur-md px-4 py-3 shadow-lg border border-border/20 flex flex-col hover:scale-105 transition-transform duration-300">
                  <span className="text-[0.55rem] font-bold tracking-wider text-burgundy uppercase">
                    Limited Stock
                  </span>
                  <span className="text-xs font-medium text-foreground mt-0.5">
                    Only 2 Left Today
                  </span>
                </div>

                {/* Floating Card 3: Savings */}
                <div className="absolute right-6 bottom-8 bg-background/95 backdrop-blur px-5 py-3.5 shadow-lg border border-border/20 flex flex-col hover:scale-105 transition-transform duration-300">
                  <span className="text-[0.55rem] font-bold tracking-wider text-forest uppercase">
                    New Arrival
                  </span>
                  <span className="text-sm font-semibold text-foreground mt-1">
                    Solene Wrap Gown
                  </span>
                  <span className="text-xs text-forest font-medium mt-0.5">Save $340</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── 4. Prominent Search Experience ──────────────────── */}
        <section
          id="search-section"
          className="border-y border-border/50 bg-background py-16 scroll-mt-24"
        >
          <div className="mx-auto max-w-[1000px] px-5 text-center">
            <Reveal>
              <h2 className="display text-3xl md:text-4xl text-ink">Search the Marketplace</h2>
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mt-2">
                Discover pieces by designer, product, category, or boutique
              </p>
            </Reveal>

            <div className="mt-8 relative max-w-2xl mx-auto">
              <input
                type="text"
                id="luxury-search"
                placeholder="Search 'Zimmermann', 'Sneakers', 'Jacquemus', 'Dress'..."
                className="w-full bg-background border border-border focus:border-gold focus:outline-none px-6 py-5 pr-14 text-base tracking-wide shadow-sm transition-all duration-300 focus:shadow-md font-serif"
                onChange={(e) => {
                  const q = e.target.value;
                  const el = document.getElementById("luxury-search");
                  if (el) el.setAttribute("data-query", q);
                  // Trigger state re-render
                  const evt = new CustomEvent("search-change", { detail: q });
                  window.dispatchEvent(evt);
                }}
              />
              <div className="absolute right-5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
                <SearchIcon className="h-5.5 w-5.5" />
              </div>
            </div>

            {/* Quick Suggestion Chips */}
            <div className="mt-5 flex flex-wrap justify-center items-center gap-3 text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              <span>Try:</span>
              {[
                { label: "Zimmermann", query: "Zimmermann" },
                { label: "Sneakers", query: "outerwear" },
                { label: "Jacquemus", query: "Christopher Esber" },
                { label: "Dress", query: "Dress" },
              ].map((chip) => (
                <button
                  key={chip.label}
                  onClick={() => {
                    const input = document.getElementById("luxury-search") as HTMLInputElement;
                    if (input) {
                      input.value = chip.query;
                      input.focus();
                      input.dispatchEvent(new Event("input", { bubbles: true }));
                      // Trigger state
                      const el = document.getElementById("luxury-search");
                      if (el) el.setAttribute("data-query", chip.query);
                      const evt = new CustomEvent("search-change", { detail: chip.query });
                      window.dispatchEvent(evt);
                    }
                  }}
                  className="bg-cream hover:bg-stone hover:text-ink px-4 py-2 border border-border/40 transition-colors cursor-pointer"
                >
                  Search "{chip.label}"
                </button>
              ))}
            </div>

            {/* Instant Search Results Panel */}
            <SearchResultsPanel catalogItems={catalogItems} />
          </div>
        </section>

        {/* ── 5. Just Reduced Section ─────────────────────────── */}
        <section className="mx-auto max-w-[1600px] px-5 py-20 md:px-10 border-b border-border/30">
          <Reveal className="flex flex-wrap items-end justify-between gap-6 mb-12">
            <div>
              <span className="text-[0.6rem] font-bold uppercase tracking-[0.3em] text-burgundy">
                01 — Price Drops
              </span>
              <h2 className="display mt-4 text-[clamp(2.4rem,4.5vw,4.2rem)] leading-[0.95]">
                Just <span className="italic text-burgundy">Reduced</span>
              </h2>
            </div>
            <Link
              to="/shop/$category"
              params={{ category: "dresses" }}
              className="link-underline text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground"
            >
              View all reductions
            </Link>
          </Reveal>

          <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
            {catalogItems
              .filter((item) => item.reduction > 0)
              .sort((a, b) => b.reduction - a.reduction)
              .slice(0, 4)
              .map((p, i) => (
                <Reveal key={p.id} delay={i * 100}>
                  <Link to="/product/$id" params={{ id: p.id }} className="h-full block">
                    <ProductCard product={p} />
                  </Link>
                </Reveal>
              ))}
          </div>
        </section>

        {/* ── 6. Category Selection chips ──────────────────────── */}
        <section className="bg-cream/40 py-12 border-b border-border/20">
          <div className="mx-auto max-w-[1600px] px-5 md:px-10">
            <p className="text-center text-[0.6rem] font-bold uppercase tracking-[0.3em] text-muted-foreground mb-6">
              Shop by Category
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              {CATEGORIES.map((c) => (
                <Link
                  key={c.slug}
                  to="/shop/$category"
                  params={{ category: c.slug }}
                  className="group bg-background hover:bg-black hover:text-ivory px-8 py-5 border border-border shadow-sm transition-all duration-300 font-serif text-lg text-ink flex items-center gap-3 cursor-pointer"
                >
                  <span>{c.name}</span>
                  <span className="text-[0.65rem] font-semibold uppercase tracking-wider text-muted-foreground group-hover:text-gold transition-colors">
                    ({catalogItems.filter((i) => i.category === c.slug).length})
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── 7. Trending Deals ───────────────────────────────── */}
        <section className="mx-auto max-w-[1600px] px-5 py-20 md:px-10 border-b border-border/30">
          <Reveal className="flex flex-wrap items-end justify-between gap-6 mb-12">
            <div>
              <span className="text-[0.6rem] font-bold uppercase tracking-[0.3em] text-gold font-semibold">
                02 — Selling Out
              </span>
              <h2 className="display mt-4 text-[clamp(2.4rem,4.5vw,4.2rem)] leading-[0.95]">
                Trending <span className="italic text-gold">Deals</span>
              </h2>
            </div>
            <Link
              to="/shop/$category"
              params={{ category: "bags" }}
              className="link-underline text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground"
            >
              Shop Hot Pieces
            </Link>
          </Reveal>

          <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
            {catalogItems
              .filter((item) => item.stock <= 3 && item.reduction > 0)
              .slice(0, 4)
              .map((p, i) => (
                <Reveal key={p.id} delay={i * 100}>
                  <Link to="/product/$id" params={{ id: p.id }} className="h-full block">
                    <ProductCard product={p} />
                  </Link>
                </Reveal>
              ))}
          </div>
        </section>

        {/* ── 8. Luxury Under $300 ────────────────────────────── */}
        <section className="mx-auto max-w-[1600px] px-5 py-20 md:px-10 border-b border-border/30 bg-soft-grey/10">
          <Reveal className="flex flex-wrap items-end justify-between gap-6 mb-12">
            <div>
              <span className="text-[0.6rem] font-bold uppercase tracking-[0.3em] text-forest">
                03 — Accessible Luxury
              </span>
              <h2 className="display mt-4 text-[clamp(2.4rem,4.5vw,4.2rem)] leading-[0.95]">
                Luxury Under <span className="italic text-forest">$300</span>
              </h2>
            </div>
            <Link
              to="/shop/$category"
              params={{ category: "jewellery" }}
              className="link-underline text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground"
            >
              Browse all budget luxury
            </Link>
          </Reveal>

          <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
            {catalogItems
              .filter((item) => item.priceValue <= 300)
              .slice(0, 4)
              .map((p, i) => (
                <Reveal key={p.id} delay={i * 100}>
                  <Link to="/product/$id" params={{ id: p.id }} className="h-full block">
                    <ProductCard product={p} />
                  </Link>
                </Reveal>
              ))}
          </div>
        </section>

        {/* ── Curated Editorial Edits ─────────────────────────── */}
        <section className="mx-auto max-w-[1600px] px-5 py-24 md:px-10 border-b border-border/30 bg-cream/30">
          <Reveal className="flex flex-wrap items-end justify-between gap-6 mb-12">
            <div>
              <span className="text-[0.6rem] font-bold uppercase tracking-[0.3em] text-gold font-semibold">
                Curated Features
              </span>
              <h2 className="display mt-4 text-[clamp(2.4rem,4.5vw,4.2rem)] leading-[0.95]">
                Editorial <span className="italic text-gold">Stories & Edits</span>
              </h2>
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mt-2 max-w-lg">
                Explore hand-picked luxury selections and seasonal stories curated by our buying
                team
              </p>
            </div>
            <Link
              to="/shop/$category"
              params={{ category: "dresses" }}
              className="link-underline text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground"
            >
              Browse all edits
            </Link>
          </Reveal>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {(curatedPages.length > 0
              ? curatedPages
              : [
                  {
                    id: "summer-edit",
                    title: "Summer & Resort Edit",
                    slug: "summer-edit",
                    subtitle: "Lightweight silks, linen tailoring & resort silhouettes",
                    hero_image_url: homepage.assets["boutique-editorial-1"] || SLIDES[0]?.image,
                  },
                  {
                    id: "minimalist-wardrobe",
                    title: "The Minimalist Wardrobe",
                    slug: "minimalist-wardrobe",
                    subtitle: "Capsule tailoring, neutral tones & quiet luxury essentials",
                    hero_image_url: homepage.assets["boutique-editorial-2"] || SLIDES[1]?.image,
                  },
                ]
            ).map((page: any, i: number) => (
              <Reveal
                key={page.id || page.slug}
                delay={i * 120}
                className="group relative overflow-hidden bg-stone border border-border/40 hover:border-gold/60 transition-all duration-500 flex flex-col justify-between shadow-sm"
              >
                <div className="aspect-[16/10] overflow-hidden bg-stone relative">
                  <ImageWithSkeleton
                    src={getCloudinaryImageUrl(page.hero_image_url || SLIDES[0]?.image, "banner")}
                    alt={page.title}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-103"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                  <div className="absolute bottom-4 left-5 right-5 text-ivory">
                    <span className="text-[0.55rem] font-bold uppercase tracking-[0.24em] text-gold block mb-1">
                      Curated Edit
                    </span>
                    <h3 className="display text-2xl leading-snug text-ivory font-semibold group-hover:text-gold transition-colors">
                      {page.title}
                    </h3>
                  </div>
                </div>
                <div className="p-6 bg-card flex-1 flex flex-col justify-between">
                  <p className="text-xs text-muted-foreground leading-relaxed font-serif line-clamp-2">
                    {page.subtitle ||
                      page.description ||
                      "Discover hand-picked archive pieces and exclusive boutique clearance drops."}
                  </p>
                  <div className="mt-6 pt-4 border-t border-border/40 flex items-center justify-between">
                    <Link
                      to="/curated/$slug"
                      params={{ slug: page.slug }}
                      className="inline-flex items-center gap-2 text-[0.62rem] font-bold uppercase tracking-[0.24em] text-foreground group-hover:text-gold transition-colors"
                    >
                      Explore Story <ArrowRight />
                    </Link>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ── 9. Designer Spotlight Carousel ──────────────────── */}
        <section
          id="designers"
          className="bg-black py-16 border-b border-border/10 overflow-hidden relative"
        >
          <div className="mx-auto max-w-[1600px] px-5 md:px-10">
            <p className="text-center text-[0.6rem] font-bold uppercase tracking-[0.3em] text-champagne/80 mb-10">
              04 — Shop Leading Designers
            </p>
            {/* Auto Scrolling Typographic Marquee */}
            <div className="flex gap-16 animate-[marquee_25s_linear_infinite] whitespace-nowrap py-4">
              {[
                "Zimmermann",
                "Camilla",
                "Aje",
                "Rebecca Vallance",
                "Scanlan Theodore",
                "Manning Cartell",
                "Bianca Spender",
                "Bassike",
                "Christopher Esber",
                "Camilla and Marc",
              ].map((name) => (
                <Link
                  key={name}
                  to="/shop/$category"
                  params={{ category: "dresses" }}
                  search={{ designer: name } as any}
                  className="font-serif text-[clamp(2rem,5vw,4rem)] text-ivory/50 hover:text-gold transition-colors duration-300 font-light tracking-wide inline-block"
                >
                  {name}
                </Link>
              ))}
              {/* Duplicate list to handle infinite scroll loop */}
              {[
                "Zimmermann",
                "Camilla",
                "Aje",
                "Rebecca Vallance",
                "Scanlan Theodore",
                "Manning Cartell",
                "Bianca Spender",
                "Bassike",
                "Christopher Esber",
                "Camilla and Marc",
              ].map((name) => (
                <Link
                  key={name + "-dup"}
                  to="/shop/$category"
                  params={{ category: "dresses" }}
                  search={{ designer: name } as any}
                  className="font-serif text-[clamp(2rem,5vw,4rem)] text-ivory/50 hover:text-gold transition-colors duration-300 font-light tracking-wide inline-block"
                >
                  {name}
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── 10. Boutique Collection (Simplified) ────────────── */}
        <section
          id="boutiques"
          className="mx-auto max-w-[1600px] px-5 py-20 md:px-10 border-b border-border/30"
        >
          <Reveal className="mb-12">
            <span className="text-[0.6rem] font-bold uppercase tracking-[0.3em] text-muted-foreground">
              05 — Partner Network
            </span>
            <h2 className="display mt-4 max-w-3xl text-[clamp(2.4rem,4.5vw,4.2rem)] leading-[0.95]">
              Australian Boutique <span className="italic">Ateliers</span>
            </h2>
          </Reveal>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                name: "Maison Verre",
                city: "Sydney",
                image: boutique1,
                products: 24,
                discount: 45,
              },
              {
                name: "Atelier Nord",
                city: "Melbourne",
                image: boutique2,
                products: 18,
                discount: 40,
              },
              {
                name: "Saltbush Studio",
                city: "Hobart",
                image: SLIDES[2]?.image || SLIDES[0]?.image,
                products: 12,
                discount: 35,
              },
              {
                name: "Margot House",
                city: "Perth",
                image: SLIDES[1]?.image || SLIDES[0]?.image,
                products: 15,
                discount: 50,
              },
            ].map((boutique, i) => (
              <Reveal
                key={boutique.name}
                delay={i * 100}
                className="bg-cream/30 border border-border/40 p-5 flex flex-col justify-between hover:border-gold/50 transition-colors duration-300"
              >
                <div>
                  <div className="aspect-[4/3] bg-stone overflow-hidden mb-5">
                    <img
                      src={getCloudinaryImageUrl(boutique.image, "card")}
                      alt={boutique.name}
                      className="h-full w-full object-cover transition-transform duration-700 hover:scale-102"
                    />
                  </div>
                  <p className="text-[0.55rem] font-bold tracking-wider text-muted-foreground uppercase">
                    {boutique.city}
                  </p>
                  <h3 className="font-serif text-2xl mt-1 text-ink">{boutique.name}</h3>
                  <div className="mt-4 flex justify-between text-xs text-muted-foreground border-y border-border/30 py-3">
                    <span>{boutique.products} Products</span>
                    <span className="font-semibold text-burgundy">
                      Average {boutique.discount}% Off
                    </span>
                  </div>
                </div>
                <Link
                  to="/merchants"
                  className="mt-6 w-full text-center bg-black py-3 text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-ivory hover:bg-gold hover:text-ink transition-colors duration-300"
                >
                  Shop Boutique
                </Link>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ── 11. Best Sellers ────────────────────────────────── */}
        <section className="mx-auto max-w-[1600px] px-5 py-20 md:px-10 border-b border-border/30">
          <Reveal className="flex flex-wrap items-end justify-between gap-6 mb-12">
            <div>
              <span className="text-[0.6rem] font-bold uppercase tracking-[0.3em] text-burgundy">
                06 — High Conversion
              </span>
              <h2 className="display mt-4 text-[clamp(2.4rem,4.5vw,4.2rem)] leading-[0.95]">
                Best <span className="italic text-burgundy">Sellers</span>
              </h2>
            </div>
            <Link
              to="/shop/$category"
              params={{ category: "dresses" }}
              className="link-underline text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground"
            >
              Shop Top Sellers
            </Link>
          </Reveal>

          <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
            {catalogItems
              .filter((item) => item.addedDaysAgo < 30)
              .slice(0, 4)
              .map((p, i) => (
                <Reveal key={p.id} delay={i * 100}>
                  <Link to="/product/$id" params={{ id: p.id }} className="h-full block">
                    <ProductCard product={p} />
                  </Link>
                </Reveal>
              ))}
          </div>
        </section>

        {/* ── 12. Trust Section ───────────────────────────────── */}
        <section className="bg-cream py-20 border-b border-border/40">
          <div className="mx-auto max-w-[1600px] px-5 md:px-10">
            <Reveal className="text-center mb-16">
              <p className="text-[0.6rem] font-bold uppercase tracking-[0.3em] text-muted-foreground">
                Why shop with us
              </p>
              <h2 className="display mt-4 text-[clamp(2.4rem,4.5vw,4rem)]">
                Luxury Clearance Guaranteed
              </h2>
            </Reveal>

            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  title: "100% Authentic",
                  desc: "Every item is checked and verified by our in-house luxury fashion experts.",
                },
                {
                  title: "Secure Checkout",
                  desc: "Your payment details are SSL protected and processed with industry-standard encryption.",
                },
                {
                  title: "Australian Boutiques",
                  desc: "Supporting local boutique owners and ateliers across the country.",
                },
                {
                  title: "Easy Returns",
                  desc: "Shop with peace of mind. We offer returns on all clearance products.",
                },
                {
                  title: "Fast Shipping",
                  desc: "Tracked express shipping across Australia with signature delivery.",
                },
                {
                  title: "Premium Support",
                  desc: "Our dedicated customer service team is ready to assist with sizing or orders.",
                },
              ].map((trust, i) => (
                <Reveal
                  key={trust.title}
                  delay={i * 80}
                  className="bg-background border border-border/30 p-8 flex flex-col justify-center shadow-sm"
                >
                  <span className="text-burgundy text-lg font-bold">✓</span>
                  <h3 className="font-serif text-xl mt-3 text-ink">{trust.title}</h3>
                  <p className="mt-3 text-xs text-muted-foreground leading-relaxed">{trust.desc}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

// ── Search Helper Subcomponent ────────────────────────────
function SearchResultsPanel({ catalogItems }: { catalogItems: any[] }) {
  const [query, setQuery] = useState("");

  useEffect(() => {
    const handler = (e: any) => setQuery(e.detail || "");
    window.addEventListener("search-change", handler);
    return () => window.removeEventListener("search-change", handler);
  }, []);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase().trim();
    return catalogItems.filter((item) => {
      return (
        item.designer.toLowerCase().includes(q) ||
        item.name.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.boutique.toLowerCase().includes(q)
      );
    });
  }, [query, catalogItems]);

  if (!query.trim()) return null;

  return (
    <div className="mt-12 bg-background border border-border p-6 md:p-10 shadow-lg text-left animate-[fade-in_0.4s_ease-out]">
      <div className="flex items-center justify-between border-b border-border/40 pb-4 mb-8">
        <p className="text-[0.62rem] font-bold uppercase tracking-[0.2em] text-muted-foreground">
          Found {results.length} Matching pieces
        </p>
        <button
          onClick={() => {
            const input = document.getElementById("luxury-search") as HTMLInputElement;
            if (input) {
              input.value = "";
              input.focus();
              const evt = new CustomEvent("search-change", { detail: "" });
              window.dispatchEvent(evt);
            }
          }}
          className="text-[0.6rem] font-bold uppercase tracking-[0.2em] text-burgundy hover:underline cursor-pointer"
        >
          Clear
        </button>
      </div>

      {results.length === 0 ? (
        <p className="text-sm text-muted-foreground font-serif text-center py-10">
          No matching designer products found for "{query}". Try another designer, boutique, or
          product name.
        </p>
      ) : (
        <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {results.slice(0, 8).map((p: any) => (
            <Link key={p.id} to="/product/$id" params={{ id: p.id }}>
              <ProductCard product={p} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
