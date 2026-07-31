import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { Reveal } from "@/components/Reveal";
import { ProductCard } from "@/components/ProductCard";
import { ArrowRight, HeartIcon } from "@/components/Icons";
import { getTone } from "@/lib/catalog-ui";
import { catalogQuery, findItem, relatedItems } from "@/lib/catalog-queries";
import { useCart } from "@/lib/cart";
import { useImageTone } from "@/lib/useImageTone";

export const Route = createFileRoute("/product/$id")({
  loader: async ({ params, context }) => {
    const items = await context.queryClient.ensureQueryData(catalogQuery);
    const product = findItem(items, params.id);
    if (!product) throw notFound();
    return { id: product.id, name: product.name, designer: product.designer, price: product.price };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Piece unavailable — DesignerSale" }, { name: "robots", content: "noindex" }],
      };
    }
    const title = `${loaderData.name} by ${loaderData.designer} | DesignerSale`;
    const description = `${loaderData.name} by ${loaderData.designer}, ${loaderData.price}. Condition, measurements and provenance verified by our buying team.`;
    return {
      meta: [
        { title: title.slice(0, 60) },
        { name: "description", content: description.slice(0, 155) },
        { property: "og:title", content: title },
        { property: "og:description", content: description.slice(0, 155) },
        { property: "og:type", content: "product" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: ProductPage,
  notFoundComponent: ProductNotFound,
  errorComponent: ({ error }) => (
    <div className="flex min-h-screen items-center justify-center px-6 text-center" role="alert">
      <p className="text-sm text-muted-foreground">{error.message}</p>
    </div>
  ),
});

function ProductNotFound() {
  return (
    <>
      <Nav />
      <main className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center px-6 text-center">
        <h1 className="display text-4xl">This piece has found a home</h1>
        <p className="mt-4 text-sm text-muted-foreground">
          It is no longer available. The rest of the edit is waiting.
        </p>
        <Link to="/shop" className="mt-8 bg-olive-deep px-8 py-4 text-[0.62rem] uppercase tracking-[0.24em] text-ivory">
          Return to the shop
        </Link>
      </main>
      <Footer />
    </>
  );
}

const TABS = ["Details", "Measurements", "Provenance", "Shipping & returns"] as const;

function ProductPage() {
  const { id } = Route.useParams();
  const { data: items } = useSuspenseQuery(catalogQuery);
  const product = findItem(items, id)!;
  const related = relatedItems(items, product);
  const cart = useCart();

  const [active, setActive] = useState(0);
  const [size, setSize] = useState(product.size);
  const [tab, setTab] = useState<(typeof TABS)[number]>("Details");
  const [saved, setSaved] = useState(false);
  const tone = useImageTone(product.gallery[active] ?? product.image, getTone(product));

  const sizeOptions = product.sizes.length ? product.sizes : ["One size"];

  function addToBag() {
    cart.add({
      id: product.id,
      name: product.name,
      designer: product.designer,
      image: product.image,
      size,
      colour: product.colour,
      unitPriceCents: product.priceValue * 100,
    });
    toast.success("Added to your bag", { description: `${product.name} · Size ${size}` });
  }

  return (
    <div
      style={tone}
      className="bg-background text-foreground transition-colors duration-700 ease-luxe"
    >
      <Nav />
      <main className="pt-16 md:pt-20">
        <nav aria-label="Breadcrumb" className="mx-auto max-w-[1600px] px-5 pt-8 md:px-10">
          <ol className="flex items-center gap-2 text-[0.62rem] uppercase tracking-[0.2em] text-muted-foreground">
            <li>
              <Link to="/shop" className="link-underline">
                Shop
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li>
              <Link to="/shop/$category" params={{ category: product.category }} className="link-underline">
                {product.category}
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li className="text-foreground">{product.name}</li>
          </ol>
        </nav>

        <section className="mx-auto grid max-w-[1600px] gap-12 px-5 py-10 md:px-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-20 lg:py-16">
          {/* Gallery */}
          <div className="flex gap-4 lg:gap-6">
            <div className="hidden w-20 shrink-0 flex-col gap-3 md:flex">
              {product.gallery.map((src, i) => (
                <button
                  key={src + i}
                  onClick={() => setActive(i)}
                  aria-label={`View image ${i + 1}`}
                  aria-current={active === i}
                  className={`aspect-[3/4] overflow-hidden border transition-colors duration-300 ${
                    active === i ? "border-olive-deep" : "border-transparent hover:border-border"
                  }`}
                >
                  <img src={src} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>

            <div className="flex-1">
              <div className="img-zoom relative aspect-[3/4] bg-cream">
                <img
                  src={product.gallery[active]}
                  alt={`${product.alt} — view ${active + 1}`}
                  className="h-full w-full object-cover"
                />
                {product.badge && (
                  <span className="rule-label absolute left-5 top-5 bg-background/90 px-3 py-1.5">
                    {product.badge}
                  </span>
                )}
              </div>
              <div className="mt-3 flex gap-3 md:hidden">
                {product.gallery.map((src, i) => (
                  <button
                    key={src + i}
                    onClick={() => setActive(i)}
                    aria-label={`View image ${i + 1}`}
                    className={`h-16 w-12 overflow-hidden border ${active === i ? "border-olive-deep" : "border-transparent"}`}
                  >
                    <img src={src} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Detail column */}
          <div className="lg:sticky lg:top-28 lg:self-start">
            <p className="rule-label text-muted-foreground">{product.designer}</p>
            <h1 className="display mt-4 text-[clamp(2.2rem,4vw,3.4rem)] leading-[1.03]">{product.name}</h1>

            <div className="mt-6 flex flex-wrap items-baseline gap-4">
              <span className="text-xl">{product.price}</span>
              {product.was && (
                <span className="text-sm text-muted-foreground line-through">{product.was}</span>
              )}
              {product.reduction > 0 && (
                <span className="rule-label bg-olive-deep px-2 py-1 text-ivory">{product.reduction}% off</span>
              )}
              {product.saleInfo && (
                <span className="rule-label bg-gold text-ink font-semibold px-2 py-1">
                  {product.saleInfo.name}
                </span>
              )}
            </div>

            {product.saleInfo && (
              <div className="mt-6 p-4 border border-gold/30 bg-gold/5 rounded text-sm text-muted-foreground animate-fade-in">
                <span className="font-semibold text-foreground">Featured Edit:</span> This piece is part of the <span className="text-foreground font-semibold">{product.saleInfo.name}</span> event.
              </div>
            )}

            <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-4 border-y border-border py-6 text-sm">
              <div>
                <dt className="rule-label text-muted-foreground">Condition</dt>
                <dd className="mt-1.5">{product.condition}</dd>
              </div>
              <div>
                <dt className="rule-label text-muted-foreground">Colour</dt>
                <dd className="mt-1.5">{product.colour}</dd>
              </div>
              <div>
                <dt className="rule-label text-muted-foreground">Composition</dt>
                <dd className="mt-1.5">{product.composition}</dd>
              </div>
              <div>
                <dt className="rule-label text-muted-foreground">Sourced from</dt>
                <dd className="mt-1.5">{product.boutique}</dd>
              </div>
            </dl>

            <div className="mt-8">
              <div className="flex items-baseline justify-between">
                <p className="rule-label text-muted-foreground">Size — {size}</p>
                <span className="text-xs text-muted-foreground">Listed size {product.size}</span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {sizeOptions.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSize(s)}
                    aria-pressed={size === s}
                    className={`min-w-14 border px-4 py-3 text-[0.62rem] uppercase tracking-[0.2em] transition-colors duration-300 ${
                      size === s ? "border-olive-deep bg-olive-deep text-ivory" : "border-border hover:border-olive-deep"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-8 flex gap-3">
              <button
                onClick={addToBag}
                className="flex-1 bg-olive-deep py-4 text-[0.62rem] uppercase tracking-[0.24em] text-ivory transition-opacity duration-300 hover:opacity-85 cursor-pointer"
              >
                Add to bag
              </button>
              <button
                onClick={() => setSaved((s) => !s)}
                aria-pressed={saved}
                aria-label="Save to wishlist"
                className="flex w-14 items-center justify-center border border-border transition-colors duration-300 hover:border-olive-deep cursor-pointer"
              >
                <HeartIcon className={saved ? "fill-current text-gold" : ""} />
              </button>
            </div>

            <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
              Complimentary signature delivery within Australia · 14-day returns on unworn pieces ·
              Authenticated before dispatch.
            </p>

            {/* Tabs */}
            <div className="mt-12 border-t border-border">
              <div className="flex flex-wrap gap-6 py-5">
                {TABS.map((t) => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={`text-[0.62rem] uppercase tracking-[0.2em] transition-colors duration-300 ${
                      tab === t ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              <div className="pb-8 text-sm leading-relaxed text-muted-foreground">
                {tab === "Details" && (
                  <div className="space-y-3">
                    <p>
                      {product.name} in {product.colour.toLowerCase()}, cut from {product.composition.toLowerCase()}.
                    </p>
                    <p>{product.conditionNote}</p>
                  </div>
                )}
                {tab === "Measurements" && (
                  <dl className="grid gap-3 sm:grid-cols-2">
                    {product.measurements.map((m) => (
                      <div key={m.label} className="flex justify-between border-b border-border pb-2">
                        <dt>{m.label}</dt>
                        <dd className="text-foreground">{m.value}</dd>
                      </div>
                    ))}
                  </dl>
                )}
                {tab === "Provenance" && (
                  <div className="space-y-3">
                    <p className="text-foreground">
                      {product.provenance.atelier}, {product.provenance.city} — {product.provenance.year}
                    </p>
                    <p>{product.provenance.note}</p>
                  </div>
                )}
                {tab === "Shipping & returns" && (
                  <ul className="space-y-2">
                    <li>Signature delivery, 2–5 business days — complimentary.</li>
                    <li>Express delivery, 1–2 business days — $25.</li>
                    <li>Concierge hand delivery in Sydney and Melbourne — $95.</li>
                    <li>Returns accepted within 14 days on unworn pieces with tags intact.</li>
                  </ul>
                )}
              </div>
            </div>
          </div>
        </section>

        {related.length > 0 && (
          <section className="mx-auto max-w-[1600px] px-5 pb-28 md:px-10">
            <Reveal className="flex items-end justify-between border-t border-border pt-12">
              <h2 className="display text-[clamp(1.8rem,3vw,2.6rem)]">You may also like</h2>
              <Link
                to="/shop/$category"
                params={{ category: product.category }}
                className="link-underline flex items-center gap-2 text-[0.62rem] uppercase tracking-[0.2em]"
              >
                View all <ArrowRight />
              </Link>
            </Reveal>
            <div className="mt-10 grid grid-cols-2 gap-x-5 gap-y-12 lg:grid-cols-4">
              {related.map((item) => (
                <Link key={item.id} to="/product/$id" params={{ id: item.id }}>
                  <ProductCard product={item} />
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}
