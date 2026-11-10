"use client";

import React, { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Search, X, ArrowUpRight, SlidersHorizontal, MapPin } from "lucide-react";
import { BOUTIQUES_DATA, Boutique } from "@/data/boutiques";

const CITIES = ["ALL", "MELBOURNE", "SYDNEY", "BRISBANE", "PERTH"];
const CATEGORIES = [
  "ALL",
  "FASHION",
  "CERAMICS & HOME",
  "BOOKS & ART",
  "ANTIQUES",
  "CONCEPT",
];

export const DirectoryListingClient: React.FC = () => {
  const searchParams = useSearchParams();
  const [boutiquesList, setBoutiquesList] = useState<Boutique[]>(BOUTIQUES_DATA);
  const [selectedCity, setSelectedCity] = useState("ALL");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Sync search parameters from URL (e.g. from header search /directory?q=...)
  useEffect(() => {
    const qParam = searchParams.get("q");
    if (qParam) setSearchQuery(qParam);

    const cityParam = searchParams.get("city");
    if (cityParam) setSelectedCity(cityParam.toUpperCase());

    const catParam = searchParams.get("category");
    if (catParam) setSelectedCategory(catParam.toUpperCase());
  }, [searchParams]);

  // Live fetch from dynamic API
  useEffect(() => {
    fetch("/api/boutiques")
      .then((r) => r.json())
      .then((data) => {
        if (data.boutiques && data.boutiques.length > 0) {
          setBoutiquesList(data.boutiques);
        }
      })
      .catch((err) => console.warn("Using local boutique seed:", err));
  }, []);

  const filteredBoutiques = useMemo(() => {
    return boutiquesList.filter((b) => {
      // City matching
      const matchCity =
        selectedCity === "ALL" ||
        b.city.toUpperCase() === selectedCity.toUpperCase();

      // Category matching
      const matchCategory =
        selectedCategory === "ALL" ||
        b.category.toUpperCase() === selectedCategory.toUpperCase();

      // Search query matching
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        b.name.toLowerCase().includes(q) ||
        b.neighborhood.toLowerCase().includes(q) ||
        b.city.toLowerCase().includes(q) ||
        b.category.toLowerCase().includes(q) ||
        b.address.toLowerCase().includes(q) ||
        b.description.toLowerCase().includes(q) ||
        b.tagline.toLowerCase().includes(q) ||
        b.tags.some((t) => t.toLowerCase().includes(q));

      return matchCity && matchCategory && matchSearch;
    });
  }, [selectedCity, selectedCategory, searchQuery]);

  const handleResetFilters = () => {
    setSelectedCity("ALL");
    setSelectedCategory("ALL");
    setSearchQuery("");
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-900 select-none pb-20">
      <div className="max-w-[1360px] mx-auto px-4 sm:px-8 lg:px-9 pt-8 sm:pt-12">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-stone-200">
          <div>
            <span className="font-editorial-sans text-[8.5px] sm:text-[9px] uppercase tracking-[0.24em] font-semibold text-stone-500 block mb-2">
              COMPLETE DIRECTORY INDEX
            </span>
            <h1 className="font-editorial-serif text-[32px] sm:text-[40px] md:text-[46px] leading-[1.08] font-normal text-stone-900">
              Explore Australian Boutiques
            </h1>
            <p className="font-editorial-serif italic text-[13px] sm:text-[14px] leading-relaxed text-stone-600 mt-1 max-w-xl">
              Filtered by curated design disciplines, historic architectural precincts, and local proprietary character.
            </p>
          </div>

          {/* Search Box on Top Right */}
          <div className="w-full md:w-80 relative flex-shrink-0">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 stroke-[1.5]" />
            <input
              type="text"
              placeholder="Filter by name, precinct, or tag..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-xs bg-white border border-stone-200/90 rounded-none focus:outline-none focus:border-stone-500 transition-colors placeholder:text-stone-400 text-stone-900 shadow-2xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 p-0.5"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Dual Filter Rows: City & Category */}
        <div className="py-4 space-y-2.5 border-b border-stone-200 text-xs">
          {/* City Row */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-editorial-sans text-[8px] uppercase tracking-[0.22em] font-semibold text-stone-400 w-16 shrink-0">
              CITY
            </span>
            <div className="flex items-center gap-1 flex-wrap">
              {CITIES.map((city) => {
                const isActive = selectedCity === city;
                return (
                  <button
                    key={city}
                    type="button"
                    onClick={() => setSelectedCity(city)}
                    className={`px-2.5 py-1 text-[9.5px] uppercase tracking-[0.16em] transition-all ${
                      isActive
                        ? "bg-[#1C1917] text-white font-medium shadow-2xs"
                        : "text-stone-600 hover:text-stone-900 hover:bg-stone-100"
                    }`}
                  >
                    {city}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Category Row */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-editorial-sans text-[8px] uppercase tracking-[0.22em] font-semibold text-stone-400 w-16 shrink-0">
              CATEGORY
            </span>
            <div className="flex items-center gap-1 flex-wrap">
              {CATEGORIES.map((cat) => {
                const isActive = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2.5 py-1 text-[9.5px] uppercase tracking-[0.16em] transition-all ${
                      isActive
                        ? "bg-[#1C1917] text-white font-medium shadow-2xs"
                        : "text-stone-600 hover:text-stone-900 hover:bg-stone-100"
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Result Counter & Active Filter Tags */}
        <div className="flex items-center justify-between py-4 text-stone-500 text-[10px]">
          <span className="font-editorial-sans uppercase tracking-[0.22em] font-medium text-stone-500">
            SHOWING {filteredBoutiques.length} OF {boutiquesList.length} CURATED SPACES
          </span>

          {(selectedCity !== "ALL" || selectedCategory !== "ALL" || searchQuery) && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="font-editorial-sans uppercase tracking-[0.16em] text-stone-500 hover:text-stone-900 underline underline-offset-4 transition-colors"
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* 4-Column Boutique Grid */}
        <div
          data-testid="boutique-listing-grid"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch"
        >
          {filteredBoutiques.map((boutique) => (
            <article
              key={boutique.id}
              data-testid="boutique-listing-card"
              className="bg-white border border-stone-200/80 flex flex-col justify-between group hover:border-stone-400 transition-all shadow-2xs"
            >
              {/* Card Image with Badges */}
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-stone-100">
                <Image
                  src={boutique.image}
                  alt={`${boutique.name} storefront in ${boutique.neighborhood}`}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 320px"
                  className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                />

                {/* Top-left Overlay Badges */}
                <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 z-10 pointer-events-none">
                  <span className="bg-white/95 backdrop-blur-2xs text-stone-900 font-editorial-sans text-[8px] uppercase tracking-[0.16em] font-semibold px-2 py-0.5 border border-stone-200/80 shadow-2xs">
                    {boutique.neighborhood}
                  </span>
                  <span className="bg-white/95 backdrop-blur-2xs text-stone-600 font-mono text-[8px] font-medium px-1.5 py-0.5 border border-stone-200/80 shadow-2xs">
                    {boutique.priceTier}
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-2">
                  {/* Category & City Row */}
                  <div className="flex items-center justify-between text-[8.5px] uppercase tracking-[0.2em] font-editorial-sans font-medium text-stone-400">
                    <span>{boutique.category}</span>
                    <span>{boutique.city}</span>
                  </div>

                  {/* Boutique Name */}
                  <h3 className="font-editorial-serif text-[19px] sm:text-[20px] font-normal leading-tight text-stone-900 group-hover:text-stone-600 transition-colors">
                    <Link href={`/shop?id=${boutique.id}`} className="hover:underline">
                      {boutique.name}
                    </Link>
                  </h3>

                  {/* Subtitle / Tagline */}
                  <p className="font-editorial-sans text-[8.5px] uppercase tracking-[0.16em] text-stone-500 font-medium line-clamp-1">
                    {boutique.tagline}
                  </p>

                  {/* Editorial Description */}
                  <p className="font-editorial-serif italic text-[12px] leading-relaxed text-stone-600 line-clamp-3">
                    {boutique.description}
                  </p>
                </div>

                {/* Footer Bar: Address & View CTA */}
                <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-2 mt-auto">
                  <span className="font-mono text-[8.5px] uppercase tracking-[0.12em] text-stone-400 truncate max-w-[170px]">
                    {boutique.address.split(",")[0]}
                  </span>

                  <Link
                    href={`/shop?id=${boutique.id}`}
                    className="inline-flex items-center gap-0.5 font-editorial-sans text-[9px] uppercase tracking-[0.18em] font-semibold text-stone-800 group-hover:text-stone-950 transition-colors"
                  >
                    <span>VIEW</span>
                    <span className="text-[10px] leading-none">↗</span>
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Empty State */}
        {filteredBoutiques.length === 0 && (
          <div className="text-center py-20 bg-white border border-dashed border-stone-300 p-8 my-8">
            <p className="font-editorial-serif text-xl text-stone-800">
              No curated boutiques matched your filter criteria.
            </p>
            <p className="text-stone-500 text-xs mt-1 mb-4">
              Try adjusting your city, category, or search keywords.
            </p>
            <button
              type="button"
              onClick={handleResetFilters}
              className="px-4 py-2 bg-[#1C1917] text-white text-xs font-editorial-sans uppercase tracking-[0.16em] hover:bg-stone-800 transition-colors"
            >
              Reset All Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

