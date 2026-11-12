"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Check } from "lucide-react";

export const Footer: React.FC = () => {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail("");
    }
  };

  return (
    <footer className="w-full bg-[#171614] text-[#F7F3EC] pt-14 pb-12 select-none border-t border-editorial-border/30">
      <div className="w-full max-w-[1400px] mx-auto px-5 sm:px-8 lg:px-9">
        {/* Top Newsletter & Brand Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 pb-12 border-b border-white/10">
          <div className="lg:col-span-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="font-editorial-serif text-[26px] italic font-light text-white">DS/</span>
                <span className="font-editorial-sans text-[8.5px] uppercase tracking-[0.24em] text-white/60 ml-2">
                  EST. 2012 — AUSTRALIA
                </span>
              </div>
              <h3 className="font-editorial-serif text-[28px] sm:text-[34px] tracking-[0.16em] uppercase text-white font-normal leading-tight">
                DESIGNERSALE
              </h3>
              <p className="font-editorial-sans text-[8px] uppercase tracking-[0.28em] text-white/70 mt-1">
                THE VISUAL DISCOVERY DIRECTORY
              </p>
              <p className="font-editorial-serif italic text-[13px] leading-relaxed text-white/70 mt-4 max-w-sm">
                Australia&apos;s definitive independent boutique directory. Documenting the authentic retail spaces, design ateliers, and creative proprietors defining our cities.
              </p>
            </div>
          </div>

          <div className="lg:col-span-7 flex flex-col justify-center">
            <span className="font-editorial-sans text-[8.5px] uppercase tracking-[0.24em] text-editorial-accent font-semibold">
              THE WEEKLY EDIT
            </span>
            <h4 className="font-editorial-serif text-[24px] sm:text-[28px] font-normal text-white mt-1">
              Receive Curated Boutique Additions & City Guides
            </h4>
            <p className="font-editorial-serif italic text-[13px] text-white/70 mt-1">
              Delivered every Friday morning. No commercial promotions, only genuine independent design discoveries.
            </p>

            {subscribed ? (
              <div className="mt-4 p-3 bg-white/10 border border-white/20 inline-flex items-center gap-2 text-[12px] font-editorial-sans uppercase tracking-[0.18em] text-white">
                <Check className="w-4 h-4 text-editorial-accent" />
                <span>Thank you. You are now subscribed to The Weekly Edit.</span>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-5 flex flex-col sm:flex-row gap-2 max-w-md">
                <input
                  type="email"
                  required
                  placeholder="Enter your email address..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 bg-white/5 border border-white/20 px-3.5 py-2.5 text-[12px] text-white placeholder:text-white/40 focus:outline-none focus:border-white transition-colors"
                />
                <button
                  type="submit"
                  className="bg-white text-black px-5 py-2.5 font-editorial-sans text-[9px] uppercase tracking-[0.22em] font-semibold hover:bg-surface-warm transition-colors"
                >
                  SUBSCRIBE
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Directory Links Matrix */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-10 border-b border-white/10">
          <div>
            <h5 className="font-editorial-sans text-[8.5px] uppercase tracking-[0.24em] text-white/50 font-semibold mb-3">
              CITIES
            </h5>
            <ul className="space-y-2">
              {["Melbourne", "Sydney", "Brisbane", "Perth", "Adelaide", "Byron Bay", "Hobart"].map((city) => (
                <li key={city}>
                  <Link
                    href={`/directory?city=${encodeURIComponent(city)}`}
                    className="font-editorial-serif text-[14px] text-white/80 hover:text-white transition-colors"
                  >
                    {city}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h5 className="font-editorial-sans text-[8.5px] uppercase tracking-[0.24em] text-white/50 font-semibold mb-3">
              DISCIPLINES
            </h5>
            <ul className="space-y-2">
              {[
                { label: "Designer Apparel", cat: "Fashion" },
                { label: "Archival & Vintage", cat: "Fashion" },
                { label: "Ceramics & Homewares", cat: "Ceramics & Home" },
                { label: "Rare Art & Bookshops", cat: "Books & Art" },
                { label: "European Antiques", cat: "Antiques" },
                { label: "Perfumeries & Concept", cat: "Concept" },
              ].map((d) => (
                <li key={d.label}>
                  <Link
                    href={`/directory?category=${encodeURIComponent(d.cat)}`}
                    className="font-editorial-serif text-[14px] text-white/80 hover:text-white transition-colors"
                  >
                    {d.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h5 className="font-editorial-sans text-[8.5px] uppercase tracking-[0.24em] text-white/50 font-semibold mb-3">
              EDITORIAL
            </h5>
            <ul className="space-y-2">
              {[
                { label: "The Journal", href: "/#journal" },
                { label: "The Melbourne Edit", href: "/guides/melbourne-edit" },
                { label: "The Sydney Precincts", href: "/guides/melbourne-edit" },
                { label: "Curator Guidelines", href: "/directory" },
                { label: "Curator Login", href: "/login" },
              ].map((e) => (
                <li key={e.label}>
                  <Link
                    href={e.href}
                    className="font-editorial-serif text-[14px] text-white/80 hover:text-white transition-colors"
                  >
                    {e.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h5 className="font-editorial-sans text-[8.5px] uppercase tracking-[0.24em] text-white/50 font-semibold mb-3">
              DIRECTORY
            </h5>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/directory?action=submit"
                  className="font-editorial-serif text-[14px] text-white hover:underline inline-flex items-center gap-1 font-medium"
                >
                  <span>Submit a Boutique</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </li>
              <li>
                <Link href="/directory" className="font-editorial-serif text-[14px] text-white/80 hover:text-white">
                  About DesignerSale
                </Link>
              </li>
              <li>
                <Link href="/login" className="font-editorial-serif text-[14px] text-editorial-accent hover:underline inline-flex items-center gap-1">
                  <span>Curator Studio & Portal</span>
                  <ArrowUpRight className="w-3 h-3" />
                </Link>
              </li>
              <li>
                <Link href="/directory" className="font-editorial-serif text-[14px] text-white/80 hover:text-white">
                  Privacy & Editorial Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-white/50">
          <p className="font-editorial-sans text-[8.5px] uppercase tracking-[0.20em]">
            © 2012–2026 DESIGNERSALE AUSTRALIA. THE VISUAL DISCOVERY DIRECTORY. ALL RIGHTS RESERVED.
          </p>
          <div className="flex items-center gap-6">
            <span className="font-editorial-sans text-[8.5px] uppercase tracking-[0.20em] text-white/60">
              CURATED IN FITZROY, MELBOURNE
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

