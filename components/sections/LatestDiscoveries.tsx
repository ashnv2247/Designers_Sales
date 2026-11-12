"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";

interface DiscoveryItem {
  id: string;
  name: string;
  categories: string;
  image: string;
  alt: string;
}

const DISCOVERIES: DiscoveryItem[] = [
  {
    id: "marton-and-davis",
    name: "MARTON & DAVIS",
    categories: "LIFESTYLE, ANTIQUES",
    image: "/images/discoveries/marton-and-davis.jpg",
    alt: "Marton & Davis boutique storefront with pink facade and striped awning",
  },
  {
    id: "keep",
    name: "KEEP",
    categories: "CERAMICS, HOME",
    image: "/images/discoveries/keep.jpg",
    alt: "Keep ceramics store interior with wooden shelves of pottery and ceramic wares",
  },
  {
    id: "stitch-and-tickle",
    name: "STITCH & TICKLE",
    categories: "FASHION, LIFESTYLE",
    image: "/images/discoveries/stitch-and-tickle.jpg",
    alt: "Stitch & Tickle boutique with brick storefront, magenta dress and floral bicycle",
  },
  {
    id: "talk-story-bookstore",
    name: "TALK STORY BOOKSTORE",
    categories: "BOOKS, CULTURE",
    image: "/images/discoveries/talk-story.jpg",
    alt: "Talk Story Bookstore entrance with dark green arch and warm lit bookshelves",
  },
];

export const LatestDiscoveries: React.FC = () => {
  return (
    <section id="discoveries-section" className="w-full pt-4 sm:pt-5 pb-3 sm:pb-4 select-none">
      <div className="w-full max-w-[1400px] mx-auto px-5 sm:px-8 lg:px-9">
        {/* Section Header */}
        <div className="flex items-center justify-between pb-3 sm:pb-3.5">
          <h2 className="font-editorial-sans text-[11px] sm:text-[11.5px] uppercase tracking-[0.24em] font-medium text-foreground">
            LATEST DISCOVERIES
          </h2>

          <Link
            href="/directory"
            className="inline-flex items-center gap-1 font-editorial-sans text-[8.5px] sm:text-[9px] uppercase tracking-[0.20em] font-medium text-foreground pb-0.5 border-b border-foreground hover:opacity-75 transition-opacity"
          >
            <span>VIEW ALL SHOPS</span>
            <span className="text-[11px] leading-none">↗</span>
          </Link>
        </div>

        {/* 4-Column Grid of Discovery Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-[6px] sm:gap-[7px]">
          {DISCOVERIES.map((item) => (
            <Link
              key={item.id}
              href={`/shop?id=${item.id}`}
              className="flex flex-col group cursor-pointer"
            >
              {/* Image Container with strict editorial aspect ratio */}
              <div className="relative aspect-[214/152] w-full overflow-hidden bg-surface-card shadow-sm">
                <Image
                  src={item.image}
                  alt={item.alt}
                  fill
                  className="object-cover object-center transition-transform duration-700 group-hover:scale-[1.02]"
                  sizes="(max-width: 640px) 50vw, 25vw"
                />
              </div>

              {/* Information below Image */}
              <div className="pt-2 sm:pt-2.5 pb-0.5 flex flex-col items-start">
                <h3 className="font-editorial-sans text-[10px] sm:text-[10.5px] uppercase tracking-[0.14em] font-medium text-foreground group-hover:opacity-85 transition-opacity">
                  {item.name}
                </h3>
                <p className="font-editorial-sans text-[8px] sm:text-[8.5px] uppercase tracking-[0.20em] font-medium text-editorial-accent mt-0.5">
                  {item.categories}
                </p>
              </div>
            </Link>
          ))}
        </div>

        {/* Show More Discovery Bar */}
        <div className="pt-4 sm:pt-5 flex items-center justify-center">
          <Link
            href="/directory"
            className="inline-flex items-center gap-2 px-5 py-2 border border-editorial-border hover:border-foreground bg-surface-card/60 hover:bg-surface-card font-editorial-sans text-[9px] uppercase tracking-[0.22em] font-medium text-foreground transition-all group"
          >
            <span>SHOW MORE FROM AUSTRALIAN DIRECTORY (12+ SPACES)</span>
            <span className="text-[11px] leading-none transition-transform group-hover:translate-x-0.5">
              ↗
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default LatestDiscoveries;
