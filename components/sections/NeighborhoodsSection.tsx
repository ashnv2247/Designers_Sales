"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

const PRECINCTS = [
  {
    name: "Fitzroy & Collingwood",
    city: "Melbourne",
    shopsCount: "42 BOUTIQUES",
    character: "Heritage bluestone warehouses, climbing ivy shopfronts, bespoke ceramicists and independent concept studios.",
    keyStreets: "Gertrude St, Smith St, Johnston St",
    image: "/images/hero/hero-main.jpg",
  },
  {
    name: "Paddington & Surry Hills",
    city: "Sydney",
    shopsCount: "38 BOUTIQUES",
    character: "Victorian filigree iron terraces, quiet leafy residential cross-streets, niche perfumeries and archival showrooms.",
    keyStreets: "William St, Oxford St, Crown St",
    image: "/images/explore/explore-handbag.jpg",
  },
  {
    name: "James Street Precinct",
    city: "Brisbane",
    shopsCount: "24 BOUTIQUES",
    character: "Subtropical brick architecture shaded by giant fig trees, indoor-outdoor resort wear, and open-air design corridors.",
    keyStreets: "James St, Robertson St, Doggett St",
    image: "/images/hero/hero-bottom-right.jpg",
  },
  {
    name: "High Street Armadale",
    city: "Melbourne",
    shopsCount: "29 BOUTIQUES",
    character: "Wide tree-lined boulevard lined with blue-chip antique dealers, European mid-century furniture, and bridal couturiers.",
    keyStreets: "High St, Kooyong Rd",
    image: "/images/discoveries/marton-and-davis.jpg",
  },
];

export const NeighborhoodsSection: React.FC = () => {
  return (
    <section id="cities" className="w-full py-10 sm:py-14 select-none">
      <div className="w-full max-w-[1400px] mx-auto px-5 sm:px-8 lg:px-9">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between pb-6 border-b border-editorial-border gap-3">
          <div>
            <span className="font-editorial-sans text-[8.5px] sm:text-[9px] tracking-[0.24em] uppercase text-editorial-accent font-semibold">
              CITY PRECINCT GUIDES
            </span>
            <h2 className="font-editorial-serif text-[32px] sm:text-[38px] leading-tight font-normal text-foreground mt-1">
              Historic Shopping Quarters
            </h2>
          </div>
          <Link
            href="#cities"
            className="inline-flex items-center gap-1 font-editorial-sans text-[8.5px] sm:text-[9.5px] uppercase tracking-[0.20em] font-medium text-foreground pb-0.5 border-b border-foreground hover:opacity-75 transition-opacity"
          >
            <span>VIEW ALL 12 PRECINCTS</span>
            <span className="text-[11px] leading-none">↗</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 pt-6">
          {PRECINCTS.map((precinct) => (
            <div
              key={precinct.name}
              className="flex flex-col bg-surface-card border border-editorial-border hover:border-foreground/40 transition-all duration-300 group cursor-pointer shadow-sm hover:shadow-md"
            >
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-surface-warm">
                <Image
                  src={precinct.image}
                  alt={precinct.name}
                  fill
                  className="object-cover object-center transition-transform duration-700 group-hover:scale-[1.03]"
                  sizes="(max-width: 768px) 100vw, 25vw"
                />
                <div className="absolute top-2.5 left-2.5">
                  <span className="font-editorial-sans text-[8px] uppercase tracking-[0.20em] px-2 py-0.5 bg-background/90 backdrop-blur-sm text-foreground font-semibold">
                    {precinct.city}
                  </span>
                </div>
                <div className="absolute bottom-2.5 right-2.5">
                  <span className="font-editorial-sans text-[7.5px] uppercase tracking-[0.18em] px-1.5 py-0.5 bg-background/90 backdrop-blur-sm text-editorial-accent font-semibold">
                    {precinct.shopsCount}
                  </span>
                </div>
              </div>

              <div className="p-4 flex flex-col justify-between flex-1">
                <div>
                  <h3 className="font-editorial-serif text-[20px] leading-snug font-normal text-foreground group-hover:opacity-85 transition-opacity">
                    {precinct.name}
                  </h3>
                  <p className="font-editorial-serif italic text-[12px] leading-relaxed text-foreground/75 mt-2">
                    {precinct.character}
                  </p>
                </div>

                <div className="pt-3 mt-3 border-t border-editorial-border/60">
                  <span className="font-editorial-sans text-[8px] uppercase tracking-[0.16em] text-editorial-caption block">
                    KEY STREETS:
                  </span>
                  <span className="font-editorial-serif text-[12px] text-foreground/85 block mt-0.5">
                    {precinct.keyStreets}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default NeighborhoodsSection;

