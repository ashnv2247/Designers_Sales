"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";

const CITIES = [
  "MELBOURNE",
  "SYDNEY",
  "BRISBANE",
  "PERTH",
  "ADELAIDE",
];

export const ExploreSection: React.FC = () => {
  return (
    <section id="explore-section" className="w-full pt-1 pb-2 sm:pb-3 select-none">
      <div className="w-full max-w-[1400px] mx-auto px-5 sm:px-8 lg:px-9">
        {/* On desktop (md and above), use exact flex proportions matching the reference strip */}
        <div className="hidden md:flex gap-[6px] items-stretch h-[143px] w-full">
          {/* Block 1: Hat on books lifestyle photo */}
          <div className="flex-[178] relative overflow-hidden bg-surface-card shadow-sm">
            <Image
              src="/images/explore/explore-hat.jpg"
              alt="Straw hat and books lifestyle boutique photography"
              fill
              className="object-cover object-center transition-transform duration-700 hover:scale-[1.02]"
              sizes="20vw"
            />
          </div>

          {/* Block 2: EXPLORE BY CITY text block with arrow */}
          <div className="flex-[132] bg-[#F3EAE0] px-4 py-3.5 flex flex-col justify-between items-start shadow-sm">
            <div className="pt-0.5">
              <h3 className="font-editorial-sans text-[10px] uppercase tracking-[0.24em] font-medium leading-[1.35] text-foreground">
                <span className="block">EXPLORE BY</span>
                <span className="block mt-0.5">CITY</span>
              </h3>
            </div>
            <div className="pb-0.5 text-foreground/80 pl-0.5">
              <span className="text-[16px] leading-none select-none font-light">⟶</span>
            </div>
          </div>

          {/* Block 3: City Navigation Panel */}
          <div className="flex-[188] relative overflow-hidden shadow-sm group">
            <Image
              src="/images/explore/explore-city-bg.jpg"
              alt="Dark boutique interior background"
              fill
              className="object-cover object-center brightness-75 contrast-125 transition-transform duration-700 group-hover:scale-[1.02]"
              sizes="25vw"
            />
            <div className="absolute inset-0 bg-black/40" />

            {/* City Names List */}
            <div className="relative z-10 px-4 py-3 flex flex-col justify-center h-full gap-[3px]">
              {CITIES.map((city) => (
                <Link
                  key={city}
                  href={`#city-${city.toLowerCase()}`}
                  className="font-editorial-sans text-[9px] uppercase tracking-[0.26em] text-white/95 hover:text-white font-medium transition-colors"
                >
                  {city}
                </Link>
              ))}
            </div>
          </div>

          {/* Block 4: Handbag interior photo */}
          <div className="flex-[198] relative overflow-hidden bg-surface-card shadow-sm">
            <Image
              src="/images/explore/explore-handbag.jpg"
              alt="Luxury leather handbag displayed in boutique"
              fill
              className="object-cover object-center transition-transform duration-700 hover:scale-[1.02]"
              sizes="25vw"
            />
          </div>

          {/* Block 5: Books Art Fashion Home window photo */}
          <div className="flex-[192] relative overflow-hidden bg-surface-card shadow-sm">
            <Image
              src="/images/explore/explore-books.jpg"
              alt="Books Art Fashion Home gold lettering on boutique glass"
              fill
              className="object-cover object-center transition-transform duration-700 hover:scale-[1.02]"
              sizes="20vw"
            />
          </div>
        </div>

        {/* Mobile & Tablet layout: Responsive grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-[6px] md:hidden">
          <div className="relative aspect-[4/3] overflow-hidden bg-surface-card shadow-sm">
            <Image
              src="/images/explore/explore-hat.jpg"
              alt="Straw hat and books"
              fill
              className="object-cover object-center"
              sizes="50vw"
            />
          </div>
          <div className="bg-[#F3EAE0] p-4 flex flex-col justify-between items-start shadow-sm">
            <h3 className="font-editorial-sans text-[10px] uppercase tracking-[0.24em] font-medium leading-[1.3] text-foreground">
              <span className="block">EXPLORE BY</span>
              <span className="block mt-0.5">CITY</span>
            </h3>
            <span className="text-[16px] leading-none select-none font-light">⟶</span>
          </div>
          <div className="relative aspect-[4/3] col-span-2 sm:col-span-1 overflow-hidden shadow-sm">
            <Image
              src="/images/explore/explore-city-bg.jpg"
              alt="City list"
              fill
              className="object-cover object-center brightness-75 contrast-125"
              sizes="50vw"
            />
            <div className="absolute inset-0 bg-black/45" />
            <div className="relative z-10 p-4 flex flex-col justify-center h-full gap-1">
              {CITIES.map((city) => (
                <Link
                  key={city}
                  href={`#city-${city.toLowerCase()}`}
                  className="font-editorial-sans text-[9px] uppercase tracking-[0.24em] text-white/95 font-medium"
                >
                  {city}
                </Link>
              ))}
            </div>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden bg-surface-card shadow-sm">
            <Image
              src="/images/explore/explore-handbag.jpg"
              alt="Luxury leather handbag"
              fill
              className="object-cover object-center"
              sizes="50vw"
            />
          </div>
          <div className="relative aspect-[4/3] overflow-hidden bg-surface-card shadow-sm">
            <Image
              src="/images/explore/explore-books.jpg"
              alt="Books Art Fashion Home"
              fill
              className="object-cover object-center"
              sizes="50vw"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default ExploreSection;
