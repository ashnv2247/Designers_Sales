import { useState } from "react";
import { Reveal } from "./Reveal";
import { ArrowRight } from "./Icons";

const COLUMNS = [
  { title: "Shop", links: ["New Arrivals", "Designers", "Clothing", "Accessories", "Sale"] },
  { title: "Discover", links: ["Boutiques", "Editorial", "Collections", "Campaigns", "The Journal"] },
  { title: "Service", links: ["Shipping", "Returns", "Size Guide", "Contact", "FAQ"] },
];

export function Footer({ bg, accent }: { bg?: string; accent?: string } = {}) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  return (
    <footer
      style={
        {
          ...(bg ? { "--olive-deep": bg } : {}),
          ...(accent ? { "--gold": accent } : {}),
        } as React.CSSProperties
      }
      className="bg-olive-deep text-ivory transition-[background-color] duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
    >
      <div className="mx-auto max-w-[1600px] px-5 py-24 md:px-10 md:py-32">
        <Reveal className="grid gap-14 border-b border-ivory/10 pb-20 lg:grid-cols-[1.1fr_0.9fr] lg:gap-24">
          <div>
            <p className="rule-label text-ivory/45">The Correspondence</p>
            <h2 className="display mt-6 text-[clamp(2.4rem,5vw,4.2rem)]">
              Private access to
              <br />
              every new arrival.
            </h2>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (email) setSent(true);
            }}
            className="flex flex-col justify-end"
          >
            <div className="flex items-end gap-4 border-b border-ivory/25 pb-3 transition-colors duration-300 focus-within:border-gold">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                aria-label="Email address"
                className="w-full bg-transparent text-sm tracking-wide text-ivory placeholder:text-ivory/40 focus:outline-none"
              />
              <button type="submit" className="shrink-0 text-[0.65rem] uppercase tracking-[0.2em] text-ivory/70 transition-colors duration-300 hover:text-gold">
                Subscribe
              </button>
            </div>
            <p
              className={`mt-4 text-xs text-gold transition-all duration-500 ${
                sent ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0"
              }`}
            >
              Welcome. Your first edit arrives Thursday.
            </p>
          </form>
        </Reveal>

        <div className="grid gap-12 pt-16 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="display text-3xl">DesignerSale</p>
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-ivory/50">
              A curated marketplace of Australia's most considered boutiques, designers and ateliers.
            </p>
          </div>
          {COLUMNS.map((col) => (
            <nav key={col.title}>
              <p className="rule-label text-ivory/40">{col.title}</p>
              <ul className="mt-6 space-y-3.5">
                {col.links.map((l) => (
                  <li key={l}>
                    <a href="#collections" className="link-underline text-sm text-ivory/70 transition-colors duration-300 hover:text-ivory">
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-20 flex flex-col gap-5 border-t border-ivory/10 pt-8 text-[0.65rem] uppercase tracking-[0.18em] text-ivory/40 md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} DesignerSale — Sydney</p>
          <a href="#collections" className="inline-flex items-center gap-3 transition-colors duration-300 hover:text-gold">
            Become a partner boutique <ArrowRight />
          </a>
        </div>
      </div>
    </footer>
  );
}
