"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import { BOUTIQUES_DATA, Boutique } from "@/data/boutiques";
import { Search, MapPin, Clock, Tag, X, ArrowUpRight } from "lucide-react";

const CITIES = ["All", "Melbourne", "Sydney", "Brisbane", "Perth"];
const CATEGORIES = ["All", "Fashion", "Ceramics & Home", "Books & Art", "Antiques", "Concept"];

export const DirectorySection: React.FC = () => {
  const [selectedCity, setSelectedCity] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBoutique, setSelectedBoutique] = useState<Boutique | null>(null);

  const filteredBoutiques = useMemo(() => {
    return BOUTIQUES_DATA.filter((b) => {
      const matchCity = selectedCity === "All" || b.city === selectedCity;
      const matchCat = selectedCategory === "All" || b.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        b.name.toLowerCase().includes(q) ||
        b.neighborhood.toLowerCase().includes(q) ||
        b.tags.some((t) => t.toLowerCase().includes(q)) ||
        b.description.toLowerCase().includes(q);
      return matchCity && matchCat && matchSearch;
    });
  }, [selectedCity, selectedCategory, searchQuery]);

  return (
    <section id="shops" className="w-full pt-8 sm:pt-12 pb-10 sm:pb-14 select-none">
      <div className="w-full max-w-[1400px] mx-auto px-5 sm:px-8 lg:px-9">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-editorial-border">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="font-editorial-sans text-[8.5px] sm:text-[9px] tracking-[0.24em] uppercase text-editorial-accent font-semibold">
                COMPLETE DIRECTORY INDEX
              </span>
            </div>
            <h2 className="font-editorial-serif text-[32px] sm:text-[38px] md:text-[44px] leading-tight font-normal text-foreground">
              Explore Australian Boutiques
            </h2>
            <p className="font-editorial-serif italic text-[13px] sm:text-[14px] leading-relaxed text-foreground/75 mt-1 max-w-lg">
              Filtered by curated design disciplines, historic architectural precincts, and local proprietary character.
            </p>
          </div>

          {/* Search Input Box */}
          <div className="w-full md:w-72 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-editorial-caption stroke-[1.5]" />
            <input
              type="text"
              placeholder="Filter by name, precinct, or tag..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-[12px] bg-surface-card border border-editorial-border rounded-none focus:outline-none focus:border-foreground transition-colors placeholder:text-editorial-caption text-foreground"
            />
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="py-4 flex flex-col lg:flex-row gap-4 lg:items-center justify-between border-b border-editorial-border/60">
          {/* City Filters */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            <span className="font-editorial-sans text-[8.5px] uppercase tracking-[0.20em] text-editorial-caption mr-1">
              CITY:
            </span>
            {CITIES.map((city) => (
              <button
                key={city}
                onClick={() => setSelectedCity(city)}
                className={`font-editorial-sans text-[9px] sm:text-[9.5px] uppercase tracking-[0.18em] px-3 py-1 transition-all ${
                  selectedCity === city
                    ? "bg-foreground text-background font-semibold"
                    : "bg-transparent text-foreground/80 hover:bg-surface-warm"
                }`}
              >
                {city}
              </button>
            ))}
          </div>

          {/* Category Filters */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            <span className="font-editorial-sans text-[8.5px] uppercase tracking-[0.20em] text-editorial-caption mr-1">
              CATEGORY:
            </span>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`font-editorial-sans text-[9px] sm:text-[9.5px] uppercase tracking-[0.18em] px-3 py-1 transition-all ${
                  selectedCategory === cat
                    ? "bg-foreground text-background font-semibold"
                    : "bg-transparent text-foreground/80 hover:bg-surface-warm"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Active Results Count */}
        <div className="pt-4 pb-2 flex items-center justify-between">
          <span className="font-editorial-sans text-[8.5px] sm:text-[9px] uppercase tracking-[0.22em] text-editorial-caption">
            SHOWING {filteredBoutiques.length} OF {BOUTIQUES_DATA.length} CURATED SPACES
          </span>
          {(selectedCity !== "All" || selectedCategory !== "All" || searchQuery) && (
            <button
              onClick={() => {
                setSelectedCity("All");
                setSelectedCategory("All");
                setSearchQuery("");
              }}
              className="font-editorial-sans text-[8.5px] uppercase tracking-[0.20em] text-editorial-accent hover:underline font-semibold"
            >
              RESET ALL FILTERS
            </button>
          )}
        </div>

        {/* Boutiques Card Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 pt-4">
          {filteredBoutiques.map((boutique) => (
            <article
              key={boutique.id}
              onClick={() => setSelectedBoutique(boutique)}
              className="flex flex-col bg-surface-card/60 border border-editorial-border hover:border-foreground/40 transition-all duration-300 group cursor-pointer shadow-sm hover:shadow-md"
            >
              {/* Image Frame with badges */}
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-surface-warm">
                <Image
                  src={boutique.image}
                  alt={boutique.name}
                  fill
                  className="object-cover object-center transition-transform duration-700 group-hover:scale-[1.03]"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
                <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                  <span className="font-editorial-sans text-[8px] uppercase tracking-[0.18em] px-2 py-0.5 bg-background/90 backdrop-blur-sm text-foreground font-medium">
                    {boutique.neighborhood}
                  </span>
                  <span className="font-editorial-sans text-[8px] uppercase tracking-[0.16em] px-1.5 py-0.5 bg-background/90 backdrop-blur-sm text-editorial-accent font-semibold">
                    {boutique.priceTier}
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 flex flex-col justify-between flex-1">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-editorial-sans text-[8px] uppercase tracking-[0.20em] text-editorial-accent font-semibold">
                      {boutique.category}
                    </span>
                    <span className="font-editorial-sans text-[8px] uppercase tracking-[0.20em] text-editorial-caption">
                      {boutique.city}
                    </span>
                  </div>

                  <h3 className="font-editorial-serif text-[18px] sm:text-[19px] leading-snug font-normal text-foreground group-hover:opacity-85 transition-opacity mt-1">
                    {boutique.name}
                  </h3>

                  <p className="font-editorial-sans text-[9.5px] uppercase tracking-[0.14em] text-foreground/70 mt-0.5">
                    {boutique.tagline}
                  </p>

                  <p className="font-editorial-serif italic text-[12px] leading-relaxed text-foreground/80 mt-2.5 line-clamp-2">
                    {boutique.description}
                  </p>
                </div>

                <div className="pt-4 mt-3 border-t border-editorial-border/60 flex items-center justify-between">
                  <span className="font-editorial-sans text-[8px] uppercase tracking-[0.18em] text-editorial-caption truncate max-w-[170px]">
                    {boutique.address.split(",")[0]}
                  </span>
                  <span className="inline-flex items-center gap-0.5 font-editorial-sans text-[8.5px] uppercase tracking-[0.20em] font-semibold text-foreground group-hover:translate-x-0.5 transition-transform">
                    <span>VIEW</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* View Full Directory Index Link */}
        <div className="pt-8 flex items-center justify-center">
          <a
            href="/directory"
            className="inline-flex items-center gap-2 px-6 py-2.5 border border-foreground bg-foreground text-background font-editorial-sans text-[9px] uppercase tracking-[0.24em] font-medium hover:bg-transparent hover:text-foreground transition-all"
          >
            <span>OPEN COMPLETE DIRECTORY INDEX (12+ CURATED SPACES)</span>
            <span className="text-[11px] leading-none">↗</span>
          </a>
        </div>

        {/* Modal / Quick View Drawer for Selected Boutique */}
        {selectedBoutique && (
          <div className="fixed inset-0 z-50 bg-foreground/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-background w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-editorial-border shadow-2xl relative">
              <button
                onClick={() => setSelectedBoutique(null)}
                className="absolute top-4 right-4 z-20 p-2 bg-background/80 hover:bg-background rounded-full text-foreground transition-colors shadow-sm"
                aria-label="Close details"
              >
                <X className="w-5 h-5 stroke-[1.5]" />
              </button>

              <div className="relative aspect-[16/9] w-full overflow-hidden bg-surface-card">
                <Image
                  src={selectedBoutique.image}
                  alt={selectedBoutique.name}
                  fill
                  className="object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-6 text-white">
                  <span className="font-editorial-sans text-[9px] uppercase tracking-[0.24em] font-semibold text-white/90">
                    {selectedBoutique.city} — {selectedBoutique.neighborhood}
                  </span>
                  <h2 className="font-editorial-serif text-[28px] sm:text-[34px] leading-tight text-white font-normal mt-0.5">
                    {selectedBoutique.name}
                  </h2>
                </div>
              </div>

              <div className="p-6 sm:p-8 space-y-6">
                <div>
                  <h4 className="font-editorial-sans text-[9px] uppercase tracking-[0.22em] text-editorial-accent font-semibold">
                    CURATOR&apos;S NOTE
                  </h4>
                  <p className="font-editorial-serif italic text-[16px] sm:text-[18px] leading-relaxed text-foreground mt-1.5 border-l-2 border-editorial-accent pl-4 py-1">
                    &ldquo;{selectedBoutique.curatorNote}&rdquo;
                  </p>
                </div>

                <div>
                  <h4 className="font-editorial-sans text-[9px] uppercase tracking-[0.22em] text-editorial-caption font-semibold">
                    ABOUT THE SPACE
                  </h4>
                  <p className="font-editorial-serif text-[14px] leading-relaxed text-foreground/85 mt-1.5">
                    {selectedBoutique.description}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-editorial-border">
                  <div className="flex items-start gap-2.5">
                    <MapPin className="w-4 h-4 text-editorial-accent mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-editorial-sans text-[8.5px] uppercase tracking-[0.20em] text-editorial-caption block">
                        LOCATION
                      </span>
                      <span className="font-editorial-serif text-[13px] text-foreground block mt-0.5">
                        {selectedBoutique.address}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <Clock className="w-4 h-4 text-editorial-accent mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-editorial-sans text-[8.5px] uppercase tracking-[0.20em] text-editorial-caption block">
                        OPENING HOURS
                      </span>
                      <span className="font-editorial-serif text-[13px] text-foreground block mt-0.5">
                        {selectedBoutique.hours}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 flex-wrap">
                  <span className="font-editorial-sans text-[8.5px] uppercase tracking-[0.20em] text-editorial-caption mr-1">
                    CURATED TAGS:
                  </span>
                  {selectedBoutique.tags.map((tag) => (
                    <span
                      key={tag}
                      className="font-editorial-sans text-[8.5px] uppercase tracking-[0.16em] px-2.5 py-1 bg-surface-warm text-foreground/85"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                <div className="pt-4 mt-2 border-t border-editorial-border flex justify-end">
                  <a
                    href={`/shop?id=${selectedBoutique.id}`}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-foreground text-background font-editorial-sans text-[9px] uppercase tracking-[0.22em] font-medium hover:bg-stone-800 transition-colors shadow-sm"
                  >
                    <span>EXPLORE EDITORIAL PROFILE</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default DirectorySection;

