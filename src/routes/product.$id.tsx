import { createFileRoute, Link, useNavigate, notFound } from "@tanstack/react-router";
import { useSuspenseQuery, useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState, useEffect } from "react";
import { toast } from "sonner";

import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { Reveal } from "@/components/Reveal";
import { ProductCard } from "@/components/ProductCard";
import { ArrowRight, HeartIcon } from "@/components/Icons";
import { getTone } from "@/lib/catalog-ui";
import { catalogQuery, findItem, relatedItems } from "@/lib/catalog-queries";
import { getVariantQuote } from "@/lib/catalog.functions";
import { useCart } from "@/lib/cart";
import { useImageTone } from "@/lib/useImageTone";
import { useSession } from "@/lib/use-session";
import { getUserWishlist, toggleWishlist } from "@/lib/wishlist.functions";
import { resolveProductPrice } from "@/lib/sale-pricing";

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
        meta: [
          { title: "Piece unavailable — DesignerSale" },
          { name: "robots", content: "noindex" },
        ],
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
        <Link
          to="/shop"
          className="mt-8 bg-olive-deep px-8 py-4 text-[0.62rem] uppercase tracking-[0.24em] text-ivory"
        >
          Return to the shop
        </Link>
      </main>
      <Footer />
    </>
  );
}

const TABS = ["Details", "Measurements", "Provenance", "Shipping & returns"] as const;
const fmt = (n: number) => `$${Math.round(n).toLocaleString("en-AU")}`;

function ProductPage() {
  const { id } = Route.useParams();
  const { data: items } = useSuspenseQuery(catalogQuery);
  const product = findItem(items, id)!;
  const related = relatedItems(items, product);
  const cart = useCart();
  const { user } = useSession();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const toggleWishlistFn = useServerFn(toggleWishlist);
  const getWishlistFn = useServerFn(getUserWishlist);
  const quoteVariant = useServerFn(getVariantQuote);

  // Group variants by color to support normalized model
  const activeVariants = (product.variants ?? []).filter(
    (v: any) => v.is_active && v.original_price != null,
  );

  const uniqueColorsMap = new Map<
    string,
    { name: string; hex: string | null; sizes: any[]; isAvailable: boolean }
  >();
  for (const v of activeVariants) {
    if (!uniqueColorsMap.has(v.color_name)) {
      uniqueColorsMap.set(v.color_name, {
        name: v.color_name,
        hex: v.color_hex,
        sizes: [],
        isAvailable: false,
      });
    }
    const col = uniqueColorsMap.get(v.color_name)!;
    col.sizes.push({
      name: v.size,
      available: v.stock_quantity > 0,
      variantId: v.id,
      stock: v.stock_quantity,
    });
    if (v.stock_quantity > 0) {
      col.isAvailable = true;
    }
  }
  const uniqueColors = Array.from(uniqueColorsMap.values());

  const initialColorName = uniqueColors[0]?.name ?? "Default";
  const [selectedColorName, setSelectedColorName] = useState(initialColorName);

  const selectedColor = uniqueColors.find((c) => c.name === selectedColorName);
  const firstAvailableSize =
    selectedColor?.sizes?.find((s: any) => s.available)?.name ??
    selectedColor?.sizes?.[0]?.name ??
    "One size";

  const [active, setActive] = useState(0);
  const [size, setSize] = useState(firstAvailableSize);
  const [tab, setTab] = useState<(typeof TABS)[number]>("Details");
  const { data: wishlistItems = [] } = useQuery({
    queryKey: ["user-wishlist"],
    queryFn: () => getWishlistFn({}),
    enabled: Boolean(user),
    staleTime: 30_000,
  });
  const saved = Boolean(user && wishlistItems.some((item: any) => item.product?.id === product.id));

  // Reset active size if color changes
  useEffect(() => {
    if (selectedColor) {
      const firstAvail =
        selectedColor.sizes?.find((s: any) => s.available)?.name ??
        selectedColor.sizes?.[0]?.name ??
        "One size";
      setSize(firstAvail);
      setActive(0);
    }
  }, [selectedColorName]);

  const selectedVariant = activeVariants.find(
    (v: any) => v.color_name === selectedColorName && v.size === size,
  );

  // Calculate pricing based on current selection
  const currentVariantPrice = selectedVariant
    ? resolveProductPrice({
        originalPrice: Number(selectedVariant.original_price),
        currentPrice: Number(selectedVariant.discounted_price ?? selectedVariant.original_price),
        currency: "AUD",
        sales: product.saleRelations,
      })
    : null;
  const priceString = currentVariantPrice
    ? fmt(currentVariantPrice.effectivePrice)
    : "Price unavailable";
  const wasString =
    currentVariantPrice && currentVariantPrice.totalSaving > 0
      ? fmt(currentVariantPrice.originalPrice)
      : undefined;
  const reduction = Math.round(currentVariantPrice?.effectiveDiscountPercentage ?? 0);

  // Resolve gallery images
  const colorImgs = (product.images ?? []).filter(
    (img: any) => img.color_name === selectedColorName,
  );
  const generalImgs = (product.images ?? []).filter((img: any) => !img.color_name);
  const activeColorImages = colorImgs.length > 0 ? colorImgs : generalImgs;
  const sortedColorImages = [...activeColorImages].sort(
    (a: any, b: any) => (a.display_order ?? 0) - (b.display_order ?? 0),
  );

  const gallery =
    sortedColorImages.length > 0
      ? sortedColorImages.map((img: any) => img.image_url)
      : product.gallery;

  const tone = useImageTone(gallery[active] ?? product.image, getTone(product));

  const wishlistMut = useMutation({
    mutationFn: (productIdOrSlug: string) => toggleWishlistFn({ data: { productIdOrSlug } }),
    onSuccess: (res) => {
      toast.success(res.message);
      qc.invalidateQueries({ queryKey: ["user-wishlist"] });
    },
    onError: (err: Error) => toast.error(err.message || "Failed to update wishlist"),
  });

  function handleWishlistToggle() {
    if (!user) {
      toast.info("Please sign in to save pieces to your wishlist", {
        action: {
          label: "Sign in",
          onClick: () => navigate({ to: "/auth" }),
        },
      });
      return;
    }
    wishlistMut.mutate(product.id);
  }

  async function addToBag() {
    if (!selectedVariant) {
      toast.error("Please select a variant option");
      return;
    }
    if (selectedVariant.stock_quantity <= 0) {
      toast.error("This option is currently out of stock");
      return;
    }
    if (!currentVariantPrice) {
      toast.error("This option is not currently available for sale");
      return;
    }
    let quote;
    try {
      quote = await quoteVariant({ data: { variantId: selectedVariant.id } });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not verify this price");
      return;
    }
    cart.add({
      variantId: selectedVariant.id,
      productId: product.dbId,
      name: product.name,
      designer: product.designer,
      image: gallery[0] || product.image,
      size,
      colour: selectedColorName,
      unitPriceCents: quote.unitPriceCents,
    });
    toast.success("Added to your bag", {
      description: `${product.name} · ${selectedColorName} · Size ${size}`,
    });
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
              <Link
                to="/shop/$category"
                params={{ category: product.category }}
                className="link-underline"
              >
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
              {gallery.map((src, i) => (
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
                  src={gallery[active] || product.image}
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
                {gallery.map((src, i) => (
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
            <h1 className="display mt-4 text-[clamp(2.2rem,4vw,3.4rem)] leading-[1.03]">
              {product.name}
            </h1>

            <div className="mt-6 flex flex-wrap items-baseline gap-4">
              <span className="text-xl">{priceString}</span>
              {wasString && (
                <span className="text-sm text-muted-foreground line-through">{wasString}</span>
              )}
              {reduction > 0 && (
                <span className="rule-label bg-olive-deep px-2 py-1 text-ivory">
                  {reduction}% off
                </span>
              )}
              {product.saleInfo && (
                <span className="rule-label bg-gold text-ink font-semibold px-2 py-1">
                  {product.saleInfo.name}
                </span>
              )}
            </div>

            {currentVariantPrice?.hasActiveSale && (
              <div className="mt-3 space-y-1 text-sm text-muted-foreground">
                {currentVariantPrice.hasProductDiscount && (
                  <p>{fmt(currentVariantPrice.currentPrice)} before this sale</p>
                )}
                <p>{fmt(currentVariantPrice.originalPrice)} original price</p>
                <p>You save {fmt(currentVariantPrice.totalSaving)} in total</p>
                <p>Extra {fmt(currentVariantPrice.additionalSaleSaving)} off during this sale</p>
                {currentVariantPrice.saleEndsAt && (
                  <p>
                    Sale ends {new Date(currentVariantPrice.saleEndsAt).toLocaleString("en-AU")}
                  </p>
                )}
              </div>
            )}

            {product.saleInfo && (
              <div className="mt-6 p-4 border border-gold/30 bg-gold/5 rounded text-sm text-muted-foreground animate-fade-in">
                <span className="font-semibold text-foreground">Featured Edit:</span> This piece is
                part of the{" "}
                <span className="text-foreground font-semibold">{product.saleInfo.name}</span>{" "}
                event.
              </div>
            )}

            <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-4 border-y border-border py-6 text-sm">
              <div>
                <dt className="rule-label text-muted-foreground">Condition</dt>
                <dd className="mt-1.5">{product.condition}</dd>
              </div>
              <div>
                <dt className="rule-label text-muted-foreground">Colour</dt>
                <dd className="mt-1.5">{selectedColorName}</dd>
              </div>
              <div>
                <dt className="rule-label text-muted-foreground">Composition</dt>
                <dd className="mt-1.5">{product.composition || "N/A"}</dd>
              </div>
              <div>
                <dt className="rule-label text-muted-foreground">Sourced from</dt>
                <dd className="mt-1.5">{product.boutique}</dd>
              </div>
            </dl>

            {uniqueColors.length > 1 && (
              <div className="mt-8">
                <p className="rule-label text-muted-foreground">Colour Option</p>
                <div className="mt-3 flex flex-wrap gap-2.5">
                  {uniqueColors.map((opt: any) => {
                    const isSelected = selectedColorName === opt.name;
                    const hex = opt.hex || "#CCCCCC";
                    return (
                      <button
                        key={opt.name}
                        onClick={() => setSelectedColorName(opt.name)}
                        className={`group relative flex items-center justify-center h-8 px-3 border rounded-full text-[0.62rem] uppercase tracking-wider font-semibold transition-all duration-300 ${
                          isSelected
                            ? "border-olive-deep bg-cream/40"
                            : "border-border hover:border-olive-deep cursor-pointer"
                        }`}
                        aria-pressed={isSelected}
                      >
                        {opt.hex && (
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-black/10 mr-1.5"
                            style={{ backgroundColor: hex }}
                          />
                        )}
                        <span>{opt.name}</span>
                        {!opt.isAvailable && (
                          <span className="text-[0.55rem] text-muted-foreground ml-1.5">
                            (Sold out)
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="mt-8">
              <div className="flex items-baseline justify-between">
                <p className="rule-label text-muted-foreground">Size — {size}</p>
                <span className="text-xs text-muted-foreground">Listed sizes</span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {(selectedColor?.sizes ?? []).map((s: any) => {
                  const isSelected = size === s.name;
                  const isAvailable = s.available;
                  return (
                    <button
                      key={s.name}
                      onClick={() => isAvailable && setSize(s.name)}
                      disabled={!isAvailable}
                      aria-pressed={isSelected}
                      className={`min-w-14 border px-4 py-3 text-[0.62rem] uppercase tracking-[0.2em] transition-colors duration-300 relative ${
                        isSelected
                          ? "border-olive-deep bg-olive-deep text-ivory"
                          : isAvailable
                            ? "border-border hover:border-olive-deep cursor-pointer"
                            : "border-border/40 text-muted-foreground/40 bg-cream/10 cursor-not-allowed line-through"
                      }`}
                    >
                      {s.name}
                    </button>
                  );
                })}
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
                onClick={handleWishlistToggle}
                disabled={wishlistMut.isPending}
                aria-pressed={saved}
                aria-label="Save to wishlist"
                className="flex w-14 items-center justify-center border border-border transition-colors duration-300 hover:border-olive-deep cursor-pointer disabled:opacity-50"
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
                      {product.name} in {selectedColorName.toLowerCase()}
                      {product.materials?.length > 0
                        ? `, cut from ${product.materials.join(", ").toLowerCase()}`
                        : ""}
                      .
                    </p>
                    <p>{product.conditionNote}</p>
                    {product.composition && (
                      <p className="text-xs">Composition: {product.composition}</p>
                    )}
                  </div>
                )}
                {tab === "Measurements" && (
                  <dl className="grid gap-3 sm:grid-cols-2">
                    {product.measurements.map((m) => (
                      <div
                        key={m.label}
                        className="flex justify-between border-b border-border pb-2"
                      >
                        <dt>{m.label}</dt>
                        <dd className="text-foreground">{m.value}</dd>
                      </div>
                    ))}
                  </dl>
                )}
                {tab === "Provenance" && (
                  <div className="space-y-3">
                    <p className="text-foreground">
                      {product.provenance.atelier}, {product.provenance.city} —{" "}
                      {product.provenance.year}
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
