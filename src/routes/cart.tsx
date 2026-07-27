import { createFileRoute, Link } from "@tanstack/react-router";

import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { CloseIcon } from "@/components/Icons";
import { money, useCart } from "@/lib/cart";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Your Shopping Bag | DesignerSale" },
      {
        name: "description",
        content:
          "Review the pieces in your DesignerSale bag, adjust sizes and quantities, then continue to a secure checkout.",
      },
      { property: "og:title", content: "Your Shopping Bag | DesignerSale" },
      { property: "og:description", content: "Review your selected pieces and continue to checkout." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const { lines, subtotalCents, setQuantity, remove, hydrated } = useCart();

  return (
    <>
      <Nav />
      <main className="mx-auto min-h-[70vh] max-w-[1400px] px-5 pb-28 pt-32 md:px-10 md:pt-40">
        <p className="rule-label text-muted-foreground">Step one of three</p>
        <h1 className="display mt-5 text-[clamp(2.6rem,6vw,4.5rem)] leading-[1]">Shopping bag</h1>

        {!hydrated ? (
          <p className="mt-16 text-sm text-muted-foreground">Retrieving your bag…</p>
        ) : lines.length === 0 ? (
          <div className="mt-16 border-t border-border pt-16">
            <p className="text-sm text-muted-foreground">Your bag is empty.</p>
            <Link
              to="/shop"
              className="mt-8 inline-block bg-olive-deep px-10 py-4 text-[0.62rem] uppercase tracking-[0.24em] text-ivory"
            >
              Browse the edit
            </Link>
          </div>
        ) : (
          <div className="mt-14 grid gap-16 lg:grid-cols-[1.4fr_0.6fr]">
            <ul className="border-t border-border">
              {lines.map((l) => (
                <li key={`${l.id}-${l.size}`} className="flex gap-5 border-b border-border py-7">
                  <Link to="/product/$id" params={{ id: l.id }} className="w-24 shrink-0 md:w-28">
                    <img src={l.image} alt={l.name} className="aspect-[3/4] w-full object-cover" />
                  </Link>
                  <div className="flex flex-1 flex-col justify-between">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="rule-label text-muted-foreground">{l.designer}</p>
                        <Link
                          to="/product/$id"
                          params={{ id: l.id }}
                          className="mt-1.5 block font-serif text-lg leading-snug"
                        >
                          {l.name}
                        </Link>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Size {l.size} · {l.colour}
                        </p>
                      </div>
                      <button
                        onClick={() => remove(l.id, l.size)}
                        aria-label={`Remove ${l.name}`}
                        className="p-1 text-muted-foreground transition-colors hover:text-foreground"
                      >
                        <CloseIcon />
                      </button>
                    </div>
                    <div className="mt-5 flex items-end justify-between">
                      <div className="flex items-center border border-border">
                        <button
                          onClick={() => setQuantity(l.id, l.size, l.quantity - 1)}
                          aria-label="Decrease quantity"
                          className="px-3 py-2 text-sm hover:bg-cream"
                        >
                          −
                        </button>
                        <span className="min-w-8 text-center text-sm">{l.quantity}</span>
                        <button
                          onClick={() => setQuantity(l.id, l.size, l.quantity + 1)}
                          aria-label="Increase quantity"
                          className="px-3 py-2 text-sm hover:bg-cream"
                        >
                          +
                        </button>
                      </div>
                      <p className="text-sm">{money(l.unitPriceCents * l.quantity)}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <aside className="lg:sticky lg:top-32 lg:self-start">
              <div className="border border-border p-7">
                <h2 className="rule-label text-muted-foreground">Summary</h2>
                <dl className="mt-6 space-y-3 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Subtotal</dt>
                    <dd>{money(subtotalCents)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Signature delivery</dt>
                    <dd>Complimentary</dd>
                  </div>
                </dl>
                <div className="mt-6 flex justify-between border-t border-border pt-5">
                  <span className="rule-label">Total</span>
                  <span className="text-lg">{money(subtotalCents)}</span>
                </div>
                <Link
                  to="/checkout"
                  className="mt-7 block bg-olive-deep py-4 text-center text-[0.62rem] uppercase tracking-[0.24em] text-ivory transition-opacity hover:opacity-85"
                >
                  Continue to checkout
                </Link>
                <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
                  Every piece is authenticated in-house and dispatched in signature packaging.
                </p>
              </div>
            </aside>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}