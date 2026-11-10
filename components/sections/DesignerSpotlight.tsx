"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

const FEATURED_DESIGNERS = [
  { name: "Christopher Esber", discipline: "Precision Tailoring & Cut-Outs", origin: "Sydney" },
  { name: "Matteau", discipline: "Organic Silks & Sustainable Resort", origin: "Sydney" },
  { name: "Song for the Mute", discipline: "Experimental Fabrics & Deconstruction", origin: "Melbourne" },
  { name: "Bassike", discipline: "Organic Jersey & Architectural Basics", origin: "Avalon Beach" },
  { name: "Albus Lumen", discipline: "Quiet Luxury & Ceramic Accents", origin: "Sydney" },
  { name: "Dion Lee", discipline: "Architectural Silhouette & Technical Knit", origin: "Sydney" },
];

export const DesignerSpotlight: React.FC = () => {
  return (
    <section id="designers" className="w-full py-10 sm:py-16 bg-[#F2ECE1] border-b border-editorial-border select-none">
      <div className="w-full max-w-[1400px] mx-auto px-5 sm:px-8 lg:px-9">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Generated Atelier Imagery with Editorial Caption */}
          <div className="lg:col-span-7 flex flex-col gap-3">
            <div className="relative aspect-[16/11] w-full overflow-hidden bg-surface-warm shadow-md">
              <Image
                src="/images/generated/atelier-showroom.jpg"
                alt="Australian designer luxury atelier and showroom with travertine plinths and natural silks"
                fill
                className="object-cover object-center transition-transform duration-700 hover:scale-[1.01]"
                sizes="(max-width: 1024px) 100vw, 55vw"
              />
              <div className="absolute top-4 left-4 bg-background/90 backdrop-blur-sm px-3 py-1 text-[8.5px] uppercase tracking-[0.22em] font-semibold text-foreground">
                DESIGNER SPOTLIGHT / 2026
              </div>
            </div>
            <div className="flex items-center justify-between text-editorial-caption px-1">
              <span className="font-editorial-sans text-[8.5px] uppercase tracking-[0.20em]">
                ATELIER SHOWROOM — SURRY HILLS, SYDNEY
              </span>
              <span className="font-editorial-sans text-[8.5px] uppercase tracking-[0.20em]">
                CURATED EDITORIAL
              </span>
            </div>
          </div>

          {/* Right Column: Editorial Narrative & Designer Matrix */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="font-editorial-sans text-[8.5px] sm:text-[9px] tracking-[0.24em] uppercase text-editorial-accent font-semibold">
                  AUSTRALIAN DESIGN TALENT
                </span>
              </div>
              <h2 className="font-editorial-serif text-[32px] sm:text-[40px] leading-[1.05] font-normal text-foreground">
                The Quiet Precision of Antipodean Luxury
              </h2>
              <p className="font-editorial-serif italic text-[13.5px] sm:text-[14px] leading-relaxed text-foreground/80 mt-3">
                &ldquo;Australian independent fashion has forged an internationally revered identity rooted in architectural silhouettes, natural breathable textiles, and an effortless balance between raw landscape and refined tailoring.&rdquo;
              </p>
            </div>

            {/* Featured Designer List */}
            <div className="mt-6 pt-5 border-t border-foreground/15">
              <span className="font-editorial-sans text-[8.5px] uppercase tracking-[0.24em] text-foreground font-semibold block mb-3">
                FEATURED LABEL DIRECTORY:
              </span>
              <div className="divide-y divide-foreground/10">
                {FEATURED_DESIGNERS.map((designer) => (
                  <div key={designer.name} className="py-2.5 flex items-center justify-between group cursor-pointer">
                    <div>
                      <h4 className="font-editorial-sans text-[11px] uppercase tracking-[0.16em] font-medium text-foreground group-hover:text-editorial-accent transition-colors">
                        {designer.name}
                      </h4>
                      <span className="font-editorial-serif italic text-[11px] text-foreground/70 block">
                        {designer.discipline}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-editorial-sans text-[8.5px] uppercase tracking-[0.16em] text-editorial-caption">
                        {designer.origin}
                      </span>
                      <ArrowUpRight className="w-3.5 h-3.5 text-foreground/60 group-hover:text-editorial-accent group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-2">
              <Link
                href="#all-designers"
                className="inline-flex items-center gap-1.5 font-editorial-sans text-[9px] sm:text-[9.5px] uppercase tracking-[0.22em] font-semibold text-foreground pb-0.5 border-b border-foreground hover:opacity-75 transition-opacity"
              >
                <span>EXPLORE ALL 80+ INDEPENDENT LABELS</span>
                <span className="text-[12px] leading-none">↗</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DesignerSpotlight;

