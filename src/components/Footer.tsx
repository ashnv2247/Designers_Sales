import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Reveal } from "./Reveal";
import { ArrowRight } from "./Icons";
import { subscribeNewsletter } from "@/lib/inquiries.functions";

const COLUMNS = [
  {
    title: "Shopping",
    links: [
      { label: "Sale", href: "/shop/dresses" },
      { label: "New Arrivals", href: "/shop/dresses" },
      { label: "Designers", href: "/#designers" },
      { label: "Boutiques", href: "/merchants" },
    ],
  },
  {
    title: "Customer Service",
    links: [
      { label: "Returns", href: "/faqs" },
      { label: "Shipping", href: "/faqs" },
      { label: "FAQs", href: "/faqs" },
      { label: "Track Order", href: "/orders" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contacts" },
      { label: "Careers", href: "/" },
    ],
  },
  {
    title: "Social",
    links: [
      { label: "Instagram", href: "https://instagram.com" },
      { label: "Pinterest", href: "https://pinterest.com" },
      { label: "Facebook", href: "https://facebook.com" },
    ],
  },
];

export function Footer({ bg, accent }: { bg?: string; accent?: string } = {}) {
  const subscribe = useServerFn(subscribeNewsletter);
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || loading) return;
    setLoading(true);
    try {
      await subscribe({ data: { email } });
      setSent(true);
      toast.success("Subscribed to clearance alerts!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not subscribe");
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer
      style={
        {
          ...(bg ? { "--olive-deep": bg } : {}),
          ...(accent ? { "--gold": accent } : {}),
        } as React.CSSProperties
      }
      className="bg-black text-ivory transition-[background-color] duration-[1200ms] ease-luxe"
    >
      <div className="mx-auto max-w-[1600px] px-5 py-24 md:px-10 md:py-32">
        <Reveal className="grid gap-14 border-b border-ivory/10 pb-20 lg:grid-cols-[1.15fr_0.85fr] lg:gap-24">
          <div>
            <p className="rule-label text-champagne/80 font-medium">
              Clearance &amp; New Drops Access
            </p>
            <h2 className="display mt-6 text-[clamp(2.2rem,5vw,3.8rem)] leading-[1.05]">
              Be the first to know about
            </h2>
            <ul className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5 text-xs text-ivory/70 font-medium">
              <li className="flex items-center gap-2">
                <span className="text-gold">✓</span> New Designer Drops
              </li>
              <li className="flex items-center gap-2">
                <span className="text-gold">✓</span> Exclusive Clearance Events
              </li>
              <li className="flex items-center gap-2">
                <span className="text-gold">✓</span> Private Member Sales
              </li>
              <li className="flex items-center gap-2">
                <span className="text-gold">✓</span> Price Reductions
              </li>
              <li className="flex items-center gap-2">
                <span className="text-gold">✓</span> Early Access Collections
              </li>
            </ul>
          </div>
          <form onSubmit={handleSubscribe} className="flex flex-col justify-end">
            <div className="flex items-end gap-4 border-b border-ivory/25 pb-3 transition-colors duration-300 focus-within:border-gold">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                aria-label="Email address for newsletters"
                className="w-full bg-transparent text-sm tracking-wide text-ivory placeholder:text-ivory/40 focus:outline-none"
              />
              <button
                type="submit"
                disabled={loading}
                className="shrink-0 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-ivory/75 transition-colors duration-300 hover:text-gold cursor-pointer disabled:opacity-50"
              >
                {loading ? "Saving…" : "Subscribe"}
              </button>
            </div>
            <p
              className={`mt-4 text-xs text-gold transition-all duration-500 ${
                sent ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0"
              }`}
            >
              Welcome. Private clearance alerts are now active for your email.
            </p>
          </form>
        </Reveal>

        <div className="grid gap-12 pt-16 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <p className="display text-3xl text-gold">DesignerSale</p>
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-ivory/50">
              Discover authentic luxury fashion from leading boutiques at exclusive clearance
              prices. 100% authenticated in-house.
            </p>
          </div>
          {COLUMNS.map((col) => (
            <nav key={col.title}>
              <p className="text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-ivory/45">
                {col.title}
              </p>
              <ul className="mt-6 space-y-3.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <a
                      href={l.href}
                      className="link-underline text-sm text-ivory/70 transition-colors duration-300 hover:text-ivory"
                    >
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-20 flex flex-col gap-5 border-t border-ivory/10 pt-8 text-[0.65rem] uppercase tracking-[0.18em] text-ivory/40 md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} DesignerSale — Sydney</p>
          <a
            href="/merchants"
            className="inline-flex items-center gap-3 transition-colors duration-300 hover:text-gold"
          >
            Become a partner boutique <ArrowRight />
          </a>
        </div>
      </div>
    </footer>
  );
}
