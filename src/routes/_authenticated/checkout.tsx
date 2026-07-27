import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";

import { Nav } from "@/components/Nav";
import { money, useCart } from "@/lib/cart";
import { placeOrder } from "@/lib/orders.functions";
import { useSession } from "@/lib/use-session";

export const Route = createFileRoute("/_authenticated/checkout")({
  head: () => ({
    meta: [
      { title: "Secure Checkout | DesignerSale" },
      {
        name: "description",
        content:
          "Complete your DesignerSale order: delivery details, shipping preference and a final review of your bag.",
      },
      { property: "og:title", content: "Secure Checkout | DesignerSale" },
      { property: "og:description", content: "Complete your DesignerSale order securely." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CheckoutPage,
});

const SHIPPING = [
  { id: "signature", label: "Signature delivery", detail: "2–5 business days", cents: 0 },
  { id: "express", label: "Express delivery", detail: "1–2 business days", cents: 2500 },
  { id: "concierge", label: "Concierge hand delivery", detail: "Sydney & Melbourne", cents: 9500 },
] as const;

function CheckoutPage() {
  const cart = useCart();
  const navigate = useNavigate();
  const { user } = useSession();
  const submit = useServerFn(placeOrder);

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    address: "",
    city: "",
    postcode: "",
    country: "Australia",
    giftNote: "",
  });
  const [shippingMethod, setShippingMethod] = useState<(typeof SHIPPING)[number]["id"]>("signature");
  const [busy, setBusy] = useState(false);

  const shippingCents = SHIPPING.find((s) => s.id === shippingMethod)!.cents;
  const total = cart.subtotalCents + shippingCents;
  const set = (k: keyof typeof form) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    if (cart.lines.length === 0) {
      toast.error("Your bag is empty");
      return;
    }
    setBusy(true);
    try {
      const order = await submit({
        data: {
          ...form,
          email: form.email || user?.email || "",
          giftNote: form.giftNote || undefined,
          shippingMethod,
          lines: cart.lines,
        },
      });
      cart.clear();
      navigate({ to: "/orders/$id", params: { id: order.id } });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "We couldn't place that order");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Nav />
      <main className="min-h-screen bg-cream pt-16 md:pt-20">
        <div className="mx-auto grid max-w-[1400px] gap-14 px-5 py-16 md:px-10 lg:grid-cols-[1.25fr_0.75fr] lg:gap-24 lg:py-24">
          <form onSubmit={onSubmit} className="order-2 lg:order-1">
            <p className="rule-label text-muted-foreground">Step two of three</p>
            <h1 className="display mt-5 text-[clamp(2.4rem,5vw,3.6rem)] leading-[1.02]">Checkout</h1>

            <Section title="Information" step="01">
              <Field label="Full name" value={form.fullName} onChange={set("fullName")} required minLength={2} maxLength={120} autoComplete="name" />
              <Field
                label="Email address"
                type="email"
                value={form.email}
                onChange={set("email")}
                required
                maxLength={255}
                autoComplete="email"
                placeholder={user?.email ?? ""}
              />
            </Section>

            <Section title="Delivery" step="02">
              <Field label="Street address" value={form.address} onChange={set("address")} required maxLength={240} autoComplete="street-address" />
              <div className="grid gap-6 sm:grid-cols-3">
                <Field label="City" value={form.city} onChange={set("city")} required maxLength={120} autoComplete="address-level2" />
                <Field label="Postcode" value={form.postcode} onChange={set("postcode")} required maxLength={20} autoComplete="postal-code" />
                <Field label="Country" value={form.country} onChange={set("country")} required maxLength={80} autoComplete="country-name" />
              </div>

              <fieldset className="mt-2 space-y-3">
                <legend className="rule-label text-muted-foreground">Shipping method</legend>
                {SHIPPING.map((s) => (
                  <label
                    key={s.id}
                    className={`flex cursor-pointer items-center justify-between border bg-background px-5 py-4 transition-colors ${
                      shippingMethod === s.id ? "border-olive-deep" : "border-border"
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="shipping"
                        value={s.id}
                        checked={shippingMethod === s.id}
                        onChange={() => setShippingMethod(s.id)}
                        className="accent-[color:var(--ink,#1a1a1a)]"
                      />
                      <span>
                        <span className="block text-sm">{s.label}</span>
                        <span className="block text-xs text-muted-foreground">{s.detail}</span>
                      </span>
                    </span>
                    <span className="text-sm">{s.cents === 0 ? "Complimentary" : money(s.cents)}</span>
                  </label>
                ))}
              </fieldset>
            </Section>

            <Section title="Payment" step="03">
              <p className="text-xs leading-relaxed text-muted-foreground">
                This boutique runs on invoice settlement: place the order and our client team will send a
                secure payment link within the hour. No card details are collected here.
              </p>
              <Field
                label="Gift note (optional)"
                value={form.giftNote}
                onChange={set("giftNote")}
                maxLength={400}
              />
            </Section>

            <button
              type="submit"
              disabled={busy || cart.lines.length === 0}
              className="mt-10 w-full bg-olive-deep py-4 text-[0.62rem] uppercase tracking-[0.24em] text-ivory transition-opacity hover:opacity-85 disabled:opacity-50"
            >
              {busy ? "Placing your order…" : `Place order · ${money(total)}`}
            </button>
          </form>

          <aside className="order-1 lg:order-2 lg:sticky lg:top-32 lg:self-start">
            <div className="border border-border bg-background p-7">
              <div className="flex items-baseline justify-between">
                <h2 className="rule-label text-muted-foreground">Shopping bag</h2>
                <Link to="/cart" className="link-underline text-[0.62rem] uppercase tracking-[0.2em]">
                  Edit
                </Link>
              </div>

              <ul className="mt-6 space-y-5">
                {cart.lines.map((l) => (
                  <li key={`${l.id}-${l.size}`} className="flex gap-4">
                    <img src={l.image} alt={l.name} className="h-24 w-18 w-[4.5rem] object-cover" />
                    <div className="flex flex-1 flex-col justify-between">
                      <div>
                        <p className="rule-label text-muted-foreground">{l.designer}</p>
                        <p className="mt-1 font-serif leading-snug">{l.name}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Size {l.size} · Qty {l.quantity}
                        </p>
                      </div>
                      <p className="text-sm">{money(l.unitPriceCents * l.quantity)}</p>
                    </div>
                  </li>
                ))}
                {cart.lines.length === 0 && (
                  <li className="text-sm text-muted-foreground">Your bag is empty.</li>
                )}
              </ul>

              <dl className="mt-7 space-y-3 border-t border-border pt-5 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Subtotal</dt>
                  <dd>{money(cart.subtotalCents)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Shipping</dt>
                  <dd>{shippingCents === 0 ? "Complimentary" : money(shippingCents)}</dd>
                </div>
                <div className="flex justify-between border-t border-border pt-4">
                  <dt className="rule-label">Total</dt>
                  <dd className="text-lg">{money(total)}</dd>
                </div>
              </dl>
            </div>
          </aside>
        </div>
      </main>
    </>
  );
}

function Section({ title, step, children }: { title: string; step: string; children: React.ReactNode }) {
  return (
    <section className="mt-12 border-t border-border pt-8">
      <div className="flex items-baseline gap-4">
        <span className="rule-label text-muted-foreground">{step}</span>
        <h2 className="font-serif text-2xl">{title}</h2>
      </div>
      <div className="mt-7 space-y-6">{children}</div>
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  ...rest
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value">) {
  return (
    <label className="block">
      <span className="rule-label text-muted-foreground">{label}</span>
      <input
        {...rest}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full border-b border-border bg-transparent pb-2.5 text-sm outline-none transition-colors focus:border-gold"
      />
    </label>
  );
}