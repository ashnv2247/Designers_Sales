import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";

import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { Reveal } from "@/components/Reveal";
import { merchantDirectoryQuery } from "@/lib/catalog-queries";

export const Route = createFileRoute("/merchants")({
  loader: ({ context }) => context.queryClient.ensureQueryData(merchantDirectoryQuery),
  errorComponent: ({ error }) => (
    <div className="flex min-h-screen items-center justify-center px-6 text-center" role="alert">
      <p className="text-sm text-muted-foreground">{error.message}</p>
    </div>
  ),
  head: () => ({
    meta: [
      { title: "Merchant Directory — Boutiques & Ateliers | DesignerSale" },
      {
        name: "description",
        content:
          "A directory of the Australian boutiques and ateliers stocking DesignerSale, with their city and the number of pieces currently listed.",
      },
      { property: "og:title", content: "Merchant Directory — Boutiques & Ateliers" },
      {
        property: "og:description",
        content: "Every boutique and atelier we buy from, listed by city and pieces in stock.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MerchantsPage,
});

function MerchantsPage() {
  const { data: merchants } = useSuspenseQuery(merchantDirectoryQuery);


  return (
    <>
      <Nav />
      <main className="mx-auto max-w-[1600px] px-5 pb-28 pt-32 md:px-10 md:pt-44">
        <Reveal>
          <p className="eyebrow">The Directory</p>
        </Reveal>
        <Reveal variant="mask" delay={100}>
          <h1 className="display mt-5 text-[clamp(3rem,8vw,6.5rem)]">Merchants</h1>
        </Reveal>
        <Reveal delay={180}>
          <p className="mt-6 max-w-xl text-sm leading-relaxed text-muted-foreground">
            Every boutique and atelier we buy from, listed alphabetically.
          </p>
        </Reveal>

        <ul className="mt-16 border-t border-border">
          {merchants.map((m, i) => (
            <li key={m.name} className="border-b border-border">
             <Reveal delay={i * 60}>
              <div className="grid grid-cols-1 gap-2 py-8 sm:grid-cols-12 sm:items-baseline">
                <p className="rule-label text-muted-foreground sm:col-span-1">
                  {String(i + 1).padStart(2, "0")}
                </p>
                <h2 className="display text-3xl sm:col-span-4">{m.name}</h2>
                <p className="text-sm text-muted-foreground sm:col-span-3">{m.city}</p>
                <p className="text-sm text-muted-foreground sm:col-span-2">{m.count} pieces</p>
                <div className="flex flex-wrap gap-3 sm:col-span-2 sm:justify-end">
                  {m.categories.map((c) => (
                    <Link
                      key={c}
                      to="/shop/$category"
                      params={{ category: c }}
                      className="link-underline text-[0.62rem] uppercase tracking-[0.18em] text-muted-foreground"
                    >
                      {c}
                    </Link>
                  ))}
                </div>
              </div>
             </Reveal>
            </li>
          ))}
        </ul>
      </main>
      <Footer />
    </>
  );
}
