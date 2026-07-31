/* eslint-disable @typescript-eslint/no-explicit-any */
import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";

import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { Reveal } from "@/components/Reveal";
import { ProductCard } from "@/components/ProductCard";
import { byCategory, catalogQuery, homepageQuery, publicCuratedPagesQuery } from "@/lib/catalog-queries";
import { ArrowRight } from "@/components/Icons";
import { getCloudinaryImageUrl } from "@/lib/cloudinary-images";

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
  const [scrolled, setScrolled] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [slide, setSlide] = useState(0);
  const [paused, setPaused] = useState(false);
  const active = SLIDES[slide] ?? SLIDES[0];
  const [designerIdx, setDesignerIdx] = useState(0);
  const activeDesigner = DESIGNERS[designerIdx] ?? DESIGNERS[0];

  useEffect(() => {
    setLoaded(true);
    const onScroll = () => setScrolled(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setSlide((s) => (s + 1) % SLIDES.length), 6000);
    return () => clearInterval(t);
  }, [paused, SLIDES.length]);

  const next = () => setSlide((s) => (s + 1) % SLIDES.length);
  const prev = () => setSlide((s) => (s - 1 + SLIDES.length) % SLIDES.length);

  return (
    <div className="min-h-screen bg-background">
      <Nav overlay />

      <main>
        {/* ── Hero ───────────────────────────────────────── */}
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
          className="relative min-h-[100svh] overflow-hidden pt-16 text-ivory transition-[background-color] duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] md:pt-20"
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_90%_at_15%_20%,color-mix(in_oklab,var(--slide-glow)_75%,transparent),transparent_70%)] transition-[background] duration-[1200ms]" />
          <div className="relative mx-auto grid max-w-[1600px] items-center gap-10 px-5 pb-16 pt-10 md:px-10 lg:min-h-[calc(100svh-5rem)] lg:grid-cols-[0.95fr_1.05fr] lg:gap-20 lg:pb-0">
            <div className="order-2 lg:order-1">
              <p
                className={`rule-label text-ivory/50 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                  loaded ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
                }`}
              >
                {active.kicker}
              </p>

              <h1 key={active.id} className="display mt-7 text-[clamp(2.9rem,6.2vw,5.6rem)]">
                {active.lines.map((line: string, i: number) => (
                  <span key={line + i} className="block overflow-hidden">
                    <span
                      style={{
                        animationDelay: `${120 + i * 110}ms`,
                        color: i === active.lines.length - 1 ? "var(--slide-accent)" : undefined,
                      }}
                      className={`block animate-[hero-line_900ms_cubic-bezier(0.22,1,0.36,1)_both] ${
                        i === active.lines.length - 1 ? "italic" : ""
                      }`}
                    >
                      {line}
                    </span>
                  </span>
                ))}
              </h1>

              <span
                style={{ transitionDelay: "560ms", backgroundColor: "var(--slide-accent)" }}
                className={`mt-8 block h-px w-24 origin-left transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                  loaded ? "scale-x-100" : "scale-x-0"
                }`}
              />

              <p
                style={{ transitionDelay: "620ms" }}
                className={`mt-7 max-w-md text-[0.95rem] leading-relaxed text-ivory/65 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                  loaded ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                }`}
              >
                One hundred and forty boutiques. One considered place. Archive gowns, tailoring and
                fine jewellery, reduced by up to seventy percent.
              </p>

              <div
                style={{ transitionDelay: "760ms" }}
                className={`mt-11 flex flex-wrap gap-3 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                  loaded ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                }`}
              >
                <a
                  href="#collections"
                  style={{ backgroundColor: "var(--slide-accent)" }}
                  className="inline-flex items-center gap-3 px-8 py-4 text-[0.6875rem] uppercase tracking-[0.2em] text-ink transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:opacity-90"
                >
                  Explore collection <ArrowRight />
                </a>
                <a
                  href="#boutiques"
                  className="inline-flex items-center gap-3 border border-ivory/25 px-8 py-4 text-[0.6875rem] uppercase tracking-[0.2em] text-ivory transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:border-[var(--slide-accent)] hover:text-[var(--slide-accent)]"
                >
                  Explore boutiques
                </a>
              </div>
            </div>

            <div className="relative order-1 lg:order-2">
              <div
                className={`relative aspect-[4/5] overflow-hidden transition-[clip-path] duration-[1400ms] ease-[cubic-bezier(0.22,1,0.36,1)] lg:aspect-[4/4.6] ${
                  loaded ? "[clip-path:inset(0_0_0_0)]" : "[clip-path:inset(0_0_100%_0)]"
                }`}
                style={{
                  backgroundColor: active.glow,
                  transform: `translateY(${scrolled * 0.04}px)`,
                }}
              >
                {SLIDES.map((s: any, i: number) => (
                  <img
                    key={s.id}
                    src={getCloudinaryImageUrl(s.image, "banner")}
                    alt={s.alt}
                    width={1200}
                    height={1500}
                    loading={i === 0 ? "eager" : "lazy"}
                    className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-[1100ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
                      i === slide ? "ken-burns opacity-100" : "opacity-0"
                    }`}
                  />
                ))}
                <div
                  className="absolute bottom-0 left-0 px-6 py-5 backdrop-blur-sm transition-colors duration-[1200ms]"
                  style={{ backgroundColor: `color-mix(in oklab, ${active.bg} 85%, transparent)` }}
                >
                  <p className="rule-label" style={{ color: "var(--slide-accent)" }}>
                    {active.campaign}
                  </p>
                  <p className="mt-1.5 font-serif text-xl text-ivory">{active.caption}</p>
                </div>

                {/* manual arrows */}
                <button
                  type="button"
                  onClick={prev}
                  aria-label="Previous campaign"
                  className="group absolute left-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center border border-ivory/30 bg-ink/25 text-ivory backdrop-blur-sm transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:border-[var(--slide-accent)] hover:text-[var(--slide-accent)]"
                >
                  <ArrowRight className="rotate-180 transition-transform duration-300 group-hover:-translate-x-0.5" />
                </button>
                <button
                  type="button"
                  onClick={next}
                  aria-label="Next campaign"
                  className="group absolute right-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center border border-ivory/30 bg-ink/25 text-ivory backdrop-blur-sm transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:border-[var(--slide-accent)] hover:text-[var(--slide-accent)]"
                >
                  <ArrowRight className="transition-transform duration-300 group-hover:translate-x-0.5" />
                </button>
              </div>

              {/* slide index */}
              <div className="absolute -left-10 top-1/2 hidden -translate-y-1/2 flex-col items-center gap-3 text-[0.65rem] tracking-[0.2em] xl:flex">
                {SLIDES.map((s: any, i: number) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSlide(i)}
                    aria-label={`Show campaign ${i + 1}`}
                    aria-current={i === slide}
                    className="transition-colors duration-300"
                    style={{
                      color:
                        i === slide
                          ? "var(--slide-accent)"
                          : "color-mix(in oklab, var(--ivory) 35%, transparent)",
                    }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </button>
                ))}
              </div>

              {/* slide dots */}
              <div className="mt-6 flex items-center gap-2 xl:hidden">
                {SLIDES.map((s: any, i: number) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSlide(i)}
                    aria-label={`Show campaign ${i + 1}`}
                    aria-current={i === slide}
                    className="h-px w-8 transition-all duration-500"
                    style={{
                      backgroundColor:
                        i === slide
                          ? "var(--slide-accent)"
                          : "color-mix(in oklab, var(--ivory) 30%, transparent)",
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Stats ──────────────────────────────────────── */}
        <section className="border-b border-border bg-olive-soft">
          <div className="mx-auto grid max-w-[1600px] grid-cols-2 gap-y-12 px-5 py-16 md:px-10 lg:grid-cols-4">
            {STATS.map((s: { value: number; suffix: string; label: string }, i: number) => (
              <Reveal key={s.label} delay={i * 90} className="text-center lg:text-left">
                <Counter value={s.value} suffix={s.suffix} />
                <p className="rule-label mt-3 text-muted-foreground">{s.label}</p>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ── Categories — broken grid ───────────────────── */}
        <section id="collections" className="mx-auto max-w-[1600px] px-5 py-24 md:px-10 md:py-36">
          <Reveal className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="rule-label text-muted-foreground">01 — The Wardrobe</p>
              <h2 className="display mt-5 text-[clamp(2.6rem,6vw,5rem)]">
                Shop by <span className="italic">category</span>
              </h2>
            </div>
            <a
              href="#boutiques"
              className="link-underline text-[0.7rem] uppercase tracking-[0.2em] text-muted-foreground"
            >
              View all categories
            </a>
          </Reveal>

          <div className="mt-16 grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
            {CATEGORIES.map((c, i) => (
              <Reveal key={c.name} delay={i * 110} className={i % 2 === 1 ? "lg:mt-20" : ""}>
                <Link to="/shop/$category" params={{ category: c.slug }} className="group block">
                  <div className="img-zoom aspect-[3/4] bg-cream">
                    <img
                      src={c.image}
                      alt={c.alt}
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="mt-5 flex items-baseline justify-between border-b border-border pb-4 transition-colors duration-300 group-hover:border-gold">
                    <h3 className="font-serif text-2xl">{c.name}</h3>
                    <span className="rule-label text-muted-foreground">{c.count}</span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ── Shop by Style ─────────────────────────────── */}
        <section className="mx-auto max-w-[1600px] px-5 py-24 md:px-10 md:py-36 border-t border-border/40">
          <Reveal className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="rule-label text-muted-foreground">02 — The Aesthetic</p>
              <h2 className="display mt-5 text-[clamp(2.6rem,6vw,5rem)]">
                Shop by <span className="italic">style</span>
              </h2>
            </div>
            <Link
              to="/shop"
              className="link-underline text-[0.7rem] uppercase tracking-[0.2em] text-muted-foreground"
            >
              View all styles
            </Link>
          </Reveal>

          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { name: "Quiet Luxury", slug: "quiet-luxury", kicker: "Minimalism", image: boutique1, desc: "Understated silhouettes, neutral tones, and premium natural materials." },
              { name: "Modern Tailoring", slug: "modern-tailoring", kicker: "Structure", image: boutique2, desc: "Sharp blazers, pleated trousers, and structural outer layers." },
              { name: "Archive Pieces", slug: "archive", kicker: "Vintage", image: SLIDES[2]?.image || SLIDES[0]?.image, desc: "Highly coveted historical pieces from legendary design houses." },
              { name: "Resort Wear", slug: "resort", kicker: "Escapism", image: SLIDES[1]?.image || SLIDES[0]?.image, desc: "Flowing silks, light linens, and sun-drenched silhouettes." },
            ].map((style, i) => (
              <Reveal key={style.slug} delay={i * 110} className={i % 2 === 1 ? "lg:mt-12" : ""}>
                <Link to="/style/$tag" params={{ tag: style.slug }} className="group block relative overflow-hidden bg-cream border border-border/30 hover:border-gold transition-colors duration-500 rounded p-6">
                  <div className="img-zoom aspect-[3/4] bg-cream overflow-hidden mb-6">
                    <img
                      src={style.image ? getCloudinaryImageUrl(style.image, "card") : ""}
                      alt={style.name}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                  <p className="rule-label text-muted-foreground text-[0.6rem] mb-2">{style.kicker}</p>
                  <h3 className="font-serif text-2xl group-hover:text-gold transition-colors duration-300">{style.name}</h3>
                  <p className="mt-3 text-xs text-muted-foreground leading-relaxed">{style.desc}</p>
                  <span className="inline-flex items-center gap-1.5 mt-5 text-[0.6rem] uppercase tracking-[0.2em] font-semibold group-hover:translate-x-1 transition-transform">
                    Explore <ArrowRight className="h-3 w-3" />
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ── Editorial split ────────────────────────────── */}
        <section className="bg-cream">
          <div className="mx-auto grid max-w-[1600px] items-center gap-12 px-5 py-24 md:px-10 md:py-36 lg:grid-cols-2 lg:gap-24">
            <Reveal
              variant="mask"
              className="order-2 aspect-[4/3] overflow-hidden lg:order-1 lg:aspect-[4/5]"
            >
              <img
                src={boutique1}
                alt="Interior of a travertine boutique with brass rails"
                loading="lazy"
                className="h-full w-full object-cover"
              />
            </Reveal>
            <Reveal delay={140} className="order-1 lg:order-2">
              <p className="rule-label text-muted-foreground">03 — The Journal</p>
              <h2 className="display mt-6 text-[clamp(2.4rem,5.5vw,4.6rem)]">
                Rooms that make
                <br />
                <span className="italic">you slow down.</span>
              </h2>
              <p className="mt-8 max-w-lg text-[0.95rem] leading-[1.9] text-muted-foreground">
                We photograph every partner boutique in its own light — the travertine, the brass,
                the quiet of a Tuesday morning. Because where a piece comes from is part of what it
                is.
              </p>
              <a href="#boutiques" className="btn-ghost-luxe mt-10">
                Read the story <ArrowRight />
              </a>
            </Reveal>
          </div>
        </section>

        {/* ── Trending products ──────────────────────────── */}
        <section id="trending" className="mx-auto max-w-[1600px] px-5 py-24 md:px-10 md:py-36">
          <Reveal className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="rule-label text-muted-foreground">04 — This Week</p>
              <h2 className="display mt-5 text-[clamp(2.6rem,6vw,5rem)]">
                Most <span className="italic">wanted</span>
              </h2>
            </div>
            <a
              href="#collections"
              className="link-underline text-[0.7rem] uppercase tracking-[0.2em] text-muted-foreground"
            >
              View all pieces
            </a>
          </Reveal>

          <div className="mt-16 grid gap-x-6 gap-y-16 sm:grid-cols-2 lg:grid-cols-4">
            {mostWanted.map((p, i) => (
              <Reveal key={p.id} delay={i * 110}>
                <Link to="/product/$id" params={{ id: p.id }}>
                  <ProductCard product={p} />
                </Link>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ── Curated Edits ──────────────────────────────── */}
        <section className="mx-auto max-w-[1600px] px-5 py-24 md:px-10 md:py-36 border-t border-border/40">
          <Reveal className="flex flex-wrap items-end justify-between gap-6 mb-16">
            <div>
              <p className="rule-label text-muted-foreground">05 — Curated Edits</p>
              <h2 className="display mt-5 text-[clamp(2.6rem,6vw,5rem)]">
                The Editorial <span className="italic">Pages</span>
              </h2>
            </div>
            <p className="text-[0.7rem] uppercase tracking-[0.2em] text-muted-foreground">
              Exclusive seasonal capsules
            </p>
          </Reveal>

          <div className="grid gap-12 lg:grid-cols-2">
            {curatedPages.map((page: any, i: number) => (
              <Reveal key={page.id} delay={i * 110}>
                <Link
                  to="/curated/$slug"
                  params={{ slug: page.slug }}
                  className="group block relative overflow-hidden bg-cream border border-border/30 hover:border-gold transition-colors duration-500 rounded p-6 h-full flex flex-col"
                >
                  <div className="img-zoom aspect-[16/10] bg-cream overflow-hidden mb-6">
                    <img
                      src={page.hero_image_url ? getCloudinaryImageUrl(page.hero_image_url, "banner") : getCloudinaryImageUrl(boutique1, "banner")}
                      alt={page.title}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                  <p className="rule-label text-gold text-[0.62rem] uppercase tracking-[0.18em] mb-2">Edit</p>
                  <h3 className="font-serif text-3xl group-hover:text-gold transition-colors duration-300">{page.title}</h3>
                  <p className="mt-3 text-sm text-muted-foreground leading-relaxed flex-1">{page.subtitle}</p>
                  <span className="inline-flex items-center gap-1.5 mt-6 text-[0.6875rem] uppercase tracking-[0.2em] font-semibold group-hover:translate-x-1 transition-transform">
                    Enter Edit <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ── Designer spotlight ─────────────────────────── */}
        <section
          style={
            {
              backgroundColor: activeDesigner.bg,
              "--gold": activeDesigner.accent,
            } as React.CSSProperties
          }
          className="text-ivory transition-[background-color] duration-[1000ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
        >
          <div className="mx-auto grid max-w-[1600px] items-center gap-12 px-5 py-24 md:px-10 md:py-36 lg:grid-cols-[0.85fr_1.15fr] lg:gap-24">
            <Reveal variant="mask" className="relative aspect-[4/5] overflow-hidden">
              {DESIGNERS.map((d, i) => (
                <img
                  key={d.id}
                  src={d.image}
                  alt={d.alt}
                  loading="lazy"
                  width={900}
                  height={1125}
                  className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
                    i === designerIdx ? "opacity-100" : "opacity-0"
                  }`}
                />
              ))}
            </Reveal>
            <Reveal delay={140}>
              <p className="rule-label text-ivory/40">06 — Designer Spotlight</p>
              <h2
                key={activeDesigner.id}
                className="display mt-6 text-[clamp(2.4rem,5.5vw,4.8rem)] animate-[hero-line_900ms_cubic-bezier(0.22,1,0.36,1)_both]"
              >
                {activeDesigner.name}
              </h2>
              <p className="mt-8 max-w-xl text-[0.95rem] leading-[1.9] text-ivory/60">
                {activeDesigner.bio}
              </p>
              <dl className="mt-12 grid max-w-lg grid-cols-3 gap-8 border-t border-ivory/12 pt-8">
                {activeDesigner.stats.map(([k, v]: [string, string]) => (
                  <div key={k}>
                    <dt className="rule-label text-ivory/40">{k}</dt>
                    <dd className="mt-2 font-serif text-2xl" style={{ color: "var(--gold)" }}>
                      {v}
                    </dd>
                  </div>
                ))}
              </dl>

              <div className="mt-12 flex flex-wrap items-center gap-x-8 gap-y-4">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    aria-label="Previous designer"
                    onClick={() =>
                      setDesignerIdx((i) => (i - 1 + DESIGNERS.length) % DESIGNERS.length)
                    }
                    className="grid h-11 w-11 place-items-center rounded-full border border-ivory/25 text-ivory/70 transition-colors duration-300 hover:border-gold hover:text-gold"
                  >
                    <ArrowRight className="rotate-180" />
                  </button>
                  <button
                    type="button"
                    aria-label="Next designer"
                    onClick={() => setDesignerIdx((i) => (i + 1) % DESIGNERS.length)}
                    className="grid h-11 w-11 place-items-center rounded-full border border-ivory/25 text-ivory/70 transition-colors duration-300 hover:border-gold hover:text-gold"
                  >
                    <ArrowRight />
                  </button>
                </div>
                <div className="flex flex-wrap gap-x-6 gap-y-2">
                  {DESIGNERS.map((d, i) => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => setDesignerIdx(i)}
                      aria-current={i === designerIdx}
                      className={`text-[0.65rem] uppercase tracking-[0.2em] transition-colors duration-300 ${
                        i === designerIdx ? "text-gold" : "text-ivory/40 hover:text-ivory/80"
                      }`}
                    >
                      {d.name}
                    </button>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ── Boutiques ──────────────────────────────────── */}
        <section id="boutiques" className="mx-auto max-w-[1600px] px-5 py-24 md:px-10 md:py-36">
          <Reveal>
            <p className="rule-label text-muted-foreground">07 — The Directory</p>
            <h2 className="display mt-5 max-w-3xl text-[clamp(2.6rem,6vw,5rem)]">
              One hundred and forty boutiques worth <span className="italic">knowing.</span>
            </h2>
          </Reveal>

          <div className="mt-16 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
            <Reveal className="img-zoom relative aspect-[16/10] bg-cream">
              <img
                src={boutique2}
                alt="Minimal charcoal atelier with a single garment under light"
                loading="lazy"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/70 to-transparent p-8">
                <p className="rule-label text-ivory/70">Melbourne</p>
                <p className="display mt-2 text-4xl text-ivory">Silk &amp; Stone</p>
              </div>
            </Reveal>

            <Reveal delay={130} className="flex flex-col justify-between gap-6">
              {[
                ["Hayman Edit", "Sydney", "84 pieces"],
                ["Saltbush Studio", "Byron Bay", "61 pieces"],
                ["Margot House", "Perth", "47 pieces"],
              ].map(([name, city, count]) => (
                <a
                  key={name}
                  href="#collections"
                  className="group flex flex-1 items-center justify-between border-b border-border pb-6 transition-colors duration-300 hover:border-gold"
                >
                  <div>
                    <p className="font-serif text-3xl transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-1.5">
                      {name}
                    </p>
                    <p className="rule-label mt-2 text-muted-foreground">
                      {city} — {count}
                    </p>
                  </div>
                  <ArrowRight className="text-muted-foreground transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-1.5 group-hover:text-foreground" />
                </a>
              ))}
            </Reveal>
          </div>
        </section>

        {/* ── Campaign banner ────────────────────────────── */}
        <section className="relative overflow-hidden">
          <Reveal className="relative flex min-h-[70svh] items-center justify-center bg-champagne px-5 py-28 text-center md:px-10">
            <div className="max-w-3xl">
              <p className="rule-label text-charcoal/60">The Winter Edit closes Sunday</p>
              <h2 className="display mt-7 text-[clamp(2.8rem,7vw,6rem)]">
                Up to seventy percent, <span className="italic">quietly.</span>
              </h2>
              <a href="#trending" className="btn-luxe mt-11">
                Enter the edit <ArrowRight />
              </a>
            </div>
          </Reveal>
        </section>
      </main>

      <Footer bg={active.bg} accent={active.accent} />
    </div>
  );
}
