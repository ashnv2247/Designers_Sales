import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";

import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { Reveal } from "@/components/Reveal";
import { byCategory, catalogMetadataQuery, catalogQuery } from "@/lib/catalog-queries";

export const Route = createFileRoute("/shop/")({
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(catalogQuery),
      context.queryClient.ensureQueryData(catalogMetadataQuery),
    ]),
  errorComponent: ({ error }) => (
    <div className="flex min-h-screen items-center justify-center px-6 text-center" role="alert">
      <p className="text-sm text-muted-foreground">{error.message}</p>
    </div>
  ),
  head: () => ({
    meta: [
      { title: "The Edits — Shop Curated Luxury | DesignerSale" },
      {
        name: "description",
        content:
          "Browse the current edits: dresses, outerwear, bags and fine jewellery from Australia's most considered boutiques and ateliers.",
      },
      { property: "og:title", content: "The Edits — Shop Curated Luxury" },
      {
        property: "og:description",
        content: "Dresses, outerwear, bags and fine jewellery, curated by our buyers.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ShopIndex,
});

function ShopIndex() {
  const { data: items } = useSuspenseQuery(catalogQuery);
  const { data: metadata } = useSuspenseQuery(catalogMetadataQuery);
  const CATEGORIES = metadata.categories;

  return (
    <>
      <Nav />
      <main className="mx-auto max-w-[1600px] px-5 pb-28 pt-32 md:px-10 md:pt-44">
        <Reveal>
          <p className="eyebrow">The Edits</p>
        </Reveal>
        <Reveal variant="mask" delay={100}>
          <h1 className="display mt-5 text-[clamp(3rem,8vw,6.5rem)]">Browse the house</h1>
        </Reveal>

        <div className="mt-16 grid gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-4">
          {CATEGORIES.map((c, i) => (
            <Reveal key={c.slug} delay={i * 90} className={i % 2 === 1 ? "lg:mt-14" : ""}>
              <Link to="/shop/$category" params={{ category: c.slug }} className="group block">
                <div className="img-zoom aspect-[3/4] bg-cream">
                  <img
                    src={c.image}
                    alt={c.alt}
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                </div>
                <p className="rule-label mt-5 text-muted-foreground">{c.kicker}</p>
                <h2 className="display mt-2 text-3xl">{c.name}</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  {byCategory(items, c.slug).length} pieces
                </p>
              </Link>
            </Reveal>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
