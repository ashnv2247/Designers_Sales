"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";

export const HeroSection: React.FC = () => {
  return (
    <section id="hero-section" className="w-full relative pt-1 sm:pt-2 pb-3 select-none">
      {/* Clean botanical leaf shadow with zero ghosted text */}
      <div
        className="absolute -top-6 -left-6 w-[280px] h-[260px] pointer-events-none opacity-60 mix-blend-multiply bg-no-repeat bg-contain"
        style={{
          backgroundImage: "url('/images/texture/clean-leaf-shadow.svg')",
        }}
        aria-hidden="true"
      />

      <div className="w-full max-w-[1400px] mx-auto px-5 sm:px-8 lg:px-9">
        <div className="flex flex-col md:flex-row gap-5 md:gap-7 items-stretch justify-between">
          {/* Left Column: Editorial Information */}
          <div className="w-full md:w-[250px] lg:w-[270px] flex-shrink-0 flex flex-col justify-between pt-1 md:pt-2 pb-1 pr-0 md:pr-2">
            <div>
              {/* Category / Location indicator */}
              <div className="flex items-center gap-2 mb-3.5 sm:mb-4">
                <span className="font-editorial-sans text-[8.5px] sm:text-[9px] tracking-[0.24em] uppercase text-foreground/85 font-medium">
                  01 / AUSTRALIA
                </span>
              </div>

              {/* Main Headline */}
              <h1 className="font-editorial-serif text-[38px] sm:text-[44px] md:text-[46px] lg:text-[50px] leading-[1.02] tracking-[-0.01em] font-normal text-foreground">
                <span className="italic block font-normal">Discover</span>
                <span className="block font-normal">Independent</span>
                <span className="block font-normal">Boutiques</span>
              </h1>

              {/* Short editorial description */}
              <p className="font-editorial-serif italic text-[12.5px] sm:text-[13px] leading-[1.42] text-foreground/80 mt-3.5 sm:mt-4 max-w-[245px]">
                A curated directory of Australia&apos;s best designer shops, independent boutiques and local stores.
              </p>
            </div>

            {/* CTA Link */}
            <div className="mt-6 md:mt-auto pt-4">
              <Link
                href="#shops"
                className="inline-flex items-center gap-1.5 font-editorial-sans text-[8.5px] sm:text-[9px] uppercase tracking-[0.22em] font-semibold text-foreground pb-0.5 border-b border-foreground hover:opacity-75 transition-opacity"
              >
                <span>EXPLORE SHOPS</span>
                <span className="text-[11px] leading-none">↗</span>
              </Link>
            </div>
          </div>

          {/* Right Column: Asymmetrical Image Composition */}
          <div className="flex-1 w-full">
            <div className="flex gap-[6px] items-stretch">
              {/* Dominant Main Storefront (approx 65% width) */}
              <div className="flex-[418] relative aspect-[418/342] overflow-hidden bg-surface-card shadow-sm">
                <Image
                  src="/images/hero/hero-main.jpg"
                  alt="Aesop boutique storefront with climbing green vines"
                  fill
                  priority
                  className="object-cover object-center transition-transform duration-700 hover:scale-[1.01]"
                  sizes="(max-width: 768px) 100vw, 55vw"
                />
              </div>

              {/* Secondary Images Column (approx 35% width) */}
              <div className="flex-[220] flex flex-col gap-[6px]">
                {/* Secondary Top: Boutique Interior */}
                <div className="relative aspect-[220/157] w-full overflow-hidden bg-surface-card shadow-sm">
                  <Image
                    src="/images/hero/hero-top-right.jpg"
                    alt="Luxury boutique interior with plant pots and garment rack"
                    fill
                    priority
                    className="object-cover object-center transition-transform duration-700 hover:scale-[1.01]"
                    sizes="(max-width: 768px) 100vw, 25vw"
                  />
                </div>

                {/* Secondary Bottom: Brick Arch Storefront */}
                <div className="relative aspect-[220/179] w-full overflow-hidden bg-surface-card shadow-sm">
                  <Image
                    src="/images/hero/hero-bottom-right.jpg"
                    alt="Brick archway boutique with striped awning"
                    fill
                    priority
                    className="object-cover object-center transition-transform duration-700 hover:scale-[1.01]"
                    sizes="(max-width: 768px) 100vw, 25vw"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
