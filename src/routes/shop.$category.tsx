import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";

import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { Reveal } from "@/components/Reveal";
import { ProductCard } from "@/components/ProductCard";
import { ArrowRight, CloseIcon } from "@/components/Icons";
import { FilterGroup, FilterCheck, SwatchCheck, FilterChip } from "@/components/Filters";
import {
  CATEGORIES,
  COLOURS,
  CONDITIONS,
  DESIGNERS,
  PRICE_BANDS,
  SIZES,
  getCategory,
} from "@/lib/catalog";
import { byCategory, catalogQuery, type DbCatalogItem } from "@/lib/catalog-queries";

type CatalogItem = DbCatalogItem;

export const Route = createFileRoute("/shop/$category")({
  loader: async ({ params, context }) => {
    const category = getCategory(params.category);
    if (!category) throw notFound();
    await context.queryClient.ensureQueryData(catalogQuery);
    return { slug: category.slug, name: category.name, standfirst: category.standfirst };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Unavailable — DesignerSale" }, { name: "robots", content: "noindex" }] };
    }
    const title = `${loaderData.name} — Curated Luxury | DesignerSale`;
    return {
      meta: [
        { title },
        { name: "description", content: loaderData.standfirst.slice(0, 155) },
        { property: "og:title", content: title },
        { property: "og:description", content: loaderData.standfirst.slice(0, 155) },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: CategoryPage,
  notFoundComponent: CategoryNotFound,
});

const SWATCHES: Record<string, string> = {
  Ivory: "oklch(0.976 0.008 85)",
  Champagne: "oklch(0.877 0.034 82)",
  Stone: "oklch(0.895 0.016 80)",
  Ink: "oklch(0.18 0.006 60)",
  Camel: "oklch(0.72 0.072 78)",
};

const SORTS = [
  { key: "curated", label: "Curated" },
  { key: "new", label: "Newest" },
  { key: "low", label: "Price, low to high" },
  { key: "high", label: "Price, high to low" },
  { key: "reduction", label: "Greatest reduction" },
] as const;

type SortKey = (typeof SORTS)[number]["key"];

function toggle(list: string[], value: string) {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

function CategoryPage() {
  const { category: slug } = Route.useParams();
  const category = getCategory(slug)!;
  const { data: all } = useSuspenseQuery(catalogQuery);
  const items = useMemo(() => byCategory(all, slug), [all, slug]);

  const [designers, setDesigners] = useState<string[]>([]);
  const [sizes, setSizes] = useState<string[]>([]);
  const [colours, setColours] = useState<string[]>([]);
  const [conditions, setConditions] = useState<string[]>([]);
  const [bands, setBands] = useState<string[]>([]);
  const [sort, setSort] = useState<SortKey>("curated");
  const [visible, setVisible] = useState(8);
  const [drawer, setDrawer] = useState(false);

  const count = (fn: (i: CatalogItem) => boolean) => items.filter(fn).length;

  const filtered = useMemo(() => {
    const list = items.filter((i) => {
      if (designers.length && !designers.includes(i.designer)) return false;
      if (sizes.length && !sizes.includes(i.size)) return false;
      if (colours.length && !colours.includes(i.colour)) return false;
      if (conditions.length && !conditions.includes(i.condition)) return false;
      if (bands.length) {
        const ok = PRICE_BANDS.filter((b) => bands.includes(b.label)).some(
          (b) => i.priceValue >= b.min && i.priceValue < b.max,
        );
        if (!ok) return false;
      }
      return true;
    });

    const sorted = [...list];
    if (sort === "low") sorted.sort((a, b) => a.priceValue - b.priceValue);
    if (sort === "high") sorted.sort((a, b) => b.priceValue - a.priceValue);
    if (sort === "new") sorted.sort((a, b) => a.addedDaysAgo - b.addedDaysAgo);
    if (sort === "reduction") sorted.sort((a, b) => b.reduction - a.reduction);
    return sorted;
  }, [items, designers, sizes, colours, conditions, bands, sort]);

  const chips = [
    ...designers.map((v) => ({ v, clear: () => setDesigners((s) => toggle(s, v)) })),
    ...sizes.map((v) => ({ v: `Size ${v}`, clear: () => setSizes((s) => toggle(s, v)) })),
    ...colours.map((v) => ({ v, clear: () => setColours((s) => toggle(s, v)) })),
    ...conditions.map((v) => ({ v, clear: () => setConditions((s) => toggle(s, v)) })),
    ...bands.map((v) => ({ v, clear: () => setBands((s) => toggle(s, v)) })),
  ];

  const clearAll = () => {
    setDesigners([]);
    setSizes([]);
    setColours([]);
    setConditions([]);
    setBands([]);
  };

  const panel = (
    <div className="pb-8">
      <FilterGroup title="Designer">
        {DESIGNERS.map((d) => (
          <FilterCheck
            key={d}
            label={d}
            count={count((i) => i.designer === d)}
            checked={designers.includes(d)}
            onChange={() => setDesigners((s) => toggle(s, d))}
          />
        ))}
      </FilterGroup>

      <FilterGroup title="Price">
        {PRICE_BANDS.map((b) => (
          <FilterCheck
            key={b.label}
            label={b.label}
            count={count((i) => i.priceValue >= b.min && i.priceValue < b.max)}
            checked={bands.includes(b.label)}
            onChange={() => setBands((s) => toggle(s, b.label))}
          />
        ))}
      </FilterGroup>

      <FilterGroup title="Size">
        <div className="flex flex-wrap gap-2">
          {SIZES.map((s) => (
            <button
              key={s}
              onClick={() => setSizes((v) => toggle(v, s))}
              aria-pressed={sizes.includes(s)}
              className={`min-w-11 border px-3 py-2 text-[0.65rem] uppercase tracking-[0.16em] transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                sizes.includes(s)
                  ? "border-olive-deep bg-olive-deep text-ivory"
                  : "border-border hover:border-gold hover:bg-cream"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="Colour">
        {COLOURS.map((c) => (
          <SwatchCheck
            key={c}
            label={c}
            swatch={SWATCHES[c]}
            checked={colours.includes(c)}
            onChange={() => setColours((s) => toggle(s, c))}
          />
        ))}
      </FilterGroup>

      <FilterGroup title="Condition">
        {CONDITIONS.map((c) => (
          <FilterCheck
            key={c}
            label={c}
            count={count((i) => i.condition === c)}
            checked={conditions.includes(c)}
            onChange={() => setConditions((s) => toggle(s, c))}
          />
        ))}
      </FilterGroup>
    </div>
  );

  const shown = filtered.slice(0, visible);
  const firstHalf = shown.slice(0, 4);
  const rest = shown.slice(4);

  return (
    <>
      <Nav />
      <main>
        {/* Editorial banner */}
        <section className="relative h-[62vh] min-h-[420px] w-full overflow-hidden bg-cream md:h-[72vh]">
          <img
            src={category.image}
            alt={category.alt}
            className="ken-burns h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/55 via-ink/10 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 mx-auto max-w-[1600px] px-5 pb-12 md:px-10 md:pb-16">
            <Reveal>
              <p className="rule-label text-ivory/80">{category.kicker}</p>
            </Reveal>
            <Reveal variant="mask" delay={120}>
              <h1 className="display mt-4 text-[clamp(3rem,9vw,7rem)] text-ivory">
                {category.headline}
              </h1>
            </Reveal>
            <Reveal delay={280}>
              <p className="mt-5 max-w-xl font-serif text-lg leading-relaxed text-ivory/85 md:text-xl">
                {category.standfirst}
              </p>
            </Reveal>
          </div>
        </section>

        {/* Breadcrumb + sibling categories */}
        <div className="border-b border-border">
          <div className="mx-auto flex max-w-[1600px] flex-wrap items-center gap-x-8 gap-y-4 px-5 py-5 md:px-10">
            <nav aria-label="Breadcrumb" className="rule-label text-muted-foreground">
              <Link to="/" className="link-underline">
                Home
              </Link>
              <span className="mx-3">/</span>
              <span className="text-foreground">{category.name}</span>
            </nav>
            <ul className="ml-auto flex flex-wrap items-center gap-6">
              {CATEGORIES.map((c) => (
                <li key={c.slug}>
                  <Link
                    to="/shop/$category"
                    params={{ category: c.slug }}
                    className={`link-underline text-[0.7rem] uppercase tracking-[0.18em] transition-colors duration-300 ${
                      c.slug === slug ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Listing */}
        <div className="mx-auto grid max-w-[1600px] gap-x-14 px-5 py-10 md:px-10 lg:grid-cols-[240px_1fr] lg:py-16">
          {/* Desktop filter rail */}
          <aside className="hidden lg:block">
            <div className="sticky top-28">
              <div className="flex items-baseline justify-between">
                <h2 className="rule-label">Refine</h2>
                {chips.length > 0 && (
                  <button
                    onClick={clearAll}
                    className="link-underline text-[0.65rem] uppercase tracking-[0.16em] text-muted-foreground"
                  >
                    Clear
                  </button>
                )}
              </div>
              <div className="mt-2 max-h-[calc(100vh-11rem)] overflow-y-auto pr-2">{panel}</div>
            </div>
          </aside>

          <div>
            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-5">
              <p className="text-sm text-muted-foreground">
                <span className="tabular-nums text-foreground">{filtered.length}</span> pieces
                {chips.length > 0 ? " refined" : " in this edit"}
              </p>

              <div className="flex items-center gap-4">
                <button
                  onClick={() => setDrawer(true)}
                  className="border border-border px-4 py-2.5 text-[0.65rem] uppercase tracking-[0.18em] transition-colors duration-300 hover:border-gold lg:hidden"
                >
                  Filters{chips.length ? ` (${chips.length})` : ""}
                </button>

                <label className="flex items-center gap-3">
                  <span className="rule-label hidden text-muted-foreground sm:inline">Sort</span>
                  <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value as SortKey)}
                    className="cursor-pointer border-b border-border bg-transparent py-2 pr-6 text-[0.7rem] uppercase tracking-[0.16em] outline-none transition-colors duration-300 hover:border-gold focus:border-gold"
                  >
                    {SORTS.map((s) => (
                      <option key={s.key} value={s.key}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </div>

            {/* Active chips */}
            {chips.length > 0 && (
              <div className="flex flex-wrap items-center gap-2.5 pt-5">
                {chips.map((c) => (
                  <FilterChip key={c.v} label={c.v} onRemove={c.clear} />
                ))}
                <button
                  onClick={clearAll}
                  className="link-underline ml-2 text-[0.65rem] uppercase tracking-[0.16em] text-muted-foreground"
                >
                  Clear all
                </button>
              </div>
            )}

            {filtered.length === 0 ? (
              <div className="py-28 text-center">
                <p className="eyebrow">Nothing matches</p>
                <h3 className="display mt-4 text-4xl">An empty rail</h3>
                <p className="mx-auto mt-4 max-w-sm text-sm text-muted-foreground">
                  Loosen a filter or two — the edit is small by design.
                </p>
                <button onClick={clearAll} className="btn-luxe mt-8">
                  Reset filters <ArrowRight />
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-x-5 gap-y-14 pt-10 md:gap-x-8 lg:grid-cols-3">
                  {firstHalf.map((p, i) => (
                    <Reveal key={p.id} delay={i * 70} className={i === 0 ? "lg:mt-0" : "lg:mt-8"}>
                      <Link to="/product/$id" params={{ id: p.id }}>
                        <ProductCard product={p} />
                      </Link>
                    </Reveal>
                  ))}
                </div>

                {/* In-grid editorial banner */}
                <Reveal className="mt-16">
                  <section className="grid items-stretch gap-0 bg-cream md:grid-cols-[1.1fr_1fr]">
                    <div className="img-zoom aspect-[4/3] md:aspect-auto">
                      <img
                        src={category.editorial.image}
                        alt={category.editorial.alt}
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex flex-col justify-center px-7 py-12 md:px-14">
                      <p className="rule-label text-muted-foreground">{category.editorial.eyebrow}</p>
                      <h2 className="display mt-5 text-[clamp(2rem,3.6vw,3.25rem)]">
                        {category.editorial.title}
                      </h2>
                      <p className="mt-5 max-w-md font-serif text-lg leading-relaxed text-charcoal">
                        {category.editorial.body}
                      </p>
                      <p className="mt-8 text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground">
                        {category.editorial.credit}
                      </p>
                    </div>
                  </section>
                </Reveal>

                {rest.length > 0 && (
                  <div className="grid grid-cols-2 gap-x-5 gap-y-14 pt-16 md:gap-x-8 lg:grid-cols-3">
                    {rest.map((p, i) => (
                      <Reveal key={p.id} delay={(i % 3) * 70} className={i % 3 === 1 ? "lg:mt-10" : ""}>
                        <Link to="/product/$id" params={{ id: p.id }}>
                          <ProductCard product={p} />
                        </Link>
                      </Reveal>
                    ))}
                  </div>
                )}

                <div className="mt-20 flex flex-col items-center gap-5 border-t border-border pt-12">
                  <p className="text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground">
                    Showing {shown.length} of {filtered.length}
                  </p>
                  <div className="h-px w-40 bg-border">
                    <div
                      className="h-px bg-gold transition-[width] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
                      style={{ width: `${(shown.length / filtered.length) * 100}%` }}
                    />
                  </div>
                  {shown.length < filtered.length && (
                    <button onClick={() => setVisible((v) => v + 8)} className="btn-ghost-luxe mt-2">
                      Load more <ArrowRight />
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      {/* Mobile filter drawer */}
      <div
        className={`fixed inset-0 z-[70] lg:hidden ${drawer ? "pointer-events-auto" : "pointer-events-none"}`}
        aria-hidden={!drawer}
      >
        <div
          onClick={() => setDrawer(false)}
          className={`absolute inset-0 bg-olive-deep/30 backdrop-blur-sm transition-opacity duration-500 ${
            drawer ? "opacity-100" : "opacity-0"
          }`}
        />
        <aside
          className={`absolute inset-y-0 right-0 flex w-[90%] max-w-sm flex-col bg-background px-7 py-8 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            drawer ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="display text-2xl">Refine</span>
            <button onClick={() => setDrawer(false)} aria-label="Close filters">
              <CloseIcon />
            </button>
          </div>
          <div className="mt-6 flex-1 overflow-y-auto">{panel}</div>
          <div className="flex gap-3 border-t border-border pt-5">
            <button onClick={clearAll} className="btn-ghost-luxe flex-1 justify-center">
              Clear
            </button>
            <button onClick={() => setDrawer(false)} className="btn-luxe flex-1 justify-center">
              Show {filtered.length}
            </button>
          </div>
        </aside>
      </div>

      <Footer />
    </>
  );
}

function CategoryNotFound() {
  return (
    <>
      <Nav />
      <main className="mx-auto max-w-2xl px-5 py-40 text-center">
        <p className="eyebrow">Not found</p>
        <h1 className="display mt-4 text-5xl">This edit has closed</h1>
        <p className="mt-5 text-muted-foreground">
          The category you were looking for is no longer live. Browse the current edits below.
        </p>
        <ul className="mt-10 flex flex-wrap justify-center gap-6">
          {CATEGORIES.map((c) => (
            <li key={c.slug}>
              <Link
                to="/shop/$category"
                params={{ category: c.slug }}
                className="link-underline text-[0.7rem] uppercase tracking-[0.18em]"
              >
                {c.name}
              </Link>
            </li>
          ))}
        </ul>
      </main>
      <Footer />
    </>
  );
}
