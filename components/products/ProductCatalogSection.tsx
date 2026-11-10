"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Product } from "@/types/product";
import { ArrowUpRight, Sparkles, ShoppingBag, Check, Tag } from "lucide-react";

interface ProductCatalogSectionProps {
  initialProducts: Product[];
  title?: string;
  subtitle?: string;
  showFilters?: boolean;
}

const PRODUCT_CATEGORIES = [
  "ALL",
  "APPAREL",
  "CERAMICS",
  "LEATHER GOODS",
  "BOOKS",
  "FRAGRANCE",
  "OBJECTS",
];

export const ProductCatalogSection: React.FC<ProductCatalogSectionProps> = ({
  initialProducts,
  title = "Curated Boutique Objects & Artifacts",
  subtitle = "Directly sourced from independent ateliers, small-batch ceramic studios, and Australian designers.",
  showFilters = true,
}) => {
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [inStockOnly, setInStockOnly] = useState(false);

  const filteredProducts = useMemo(() => {
    return initialProducts.filter((p) => {
      const matchCat =
        selectedCategory === "ALL" ||
        p.category.toUpperCase() === selectedCategory.toUpperCase();
      const matchStock = !inStockOnly || p.inStock;
      return matchCat && matchStock;
    });
  }, [initialProducts, selectedCategory, inStockOnly]);

  return (
    <section className="w-full py-12 bg-white border-t border-stone-200 select-none">
      <div className="max-w-[1360px] mx-auto px-4 sm:px-8 lg:px-9">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-stone-200">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="font-editorial-sans text-[8.5px] uppercase tracking-[0.24em] font-semibold text-stone-500">
                DYNAMIC PRODUCT ARCHIVE
              </span>
              <span className="text-stone-300">·</span>
              <span className="font-editorial-sans text-[8.5px] uppercase tracking-[0.2em] font-medium text-emerald-800 bg-emerald-50 px-2 py-0.5 border border-emerald-200">
                Live Inventory
              </span>
            </div>
            <h2 className="font-editorial-serif text-[28px] sm:text-[36px] font-normal text-stone-900 leading-tight">
              {title}
            </h2>
            <p className="font-editorial-serif italic text-xs sm:text-sm text-stone-600 mt-1 max-w-xl">
              {subtitle}
            </p>
          </div>

          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-[10px] font-editorial-sans uppercase tracking-[0.16em] font-medium border border-stone-200 transition-colors shrink-0"
          >
            <span>Manage in Admin Panel</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Filter Bar */}
        {showFilters && (
          <div className="py-4 flex flex-wrap items-center justify-between gap-4 border-b border-stone-100 text-xs">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-editorial-sans text-[8px] uppercase tracking-[0.2em] text-stone-400 font-semibold mr-1">
                DISCIPLINE:
              </span>
              {PRODUCT_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 text-[9.5px] uppercase tracking-[0.16em] transition-all ${
                    selectedCategory === cat
                      ? "bg-[#1C1917] text-white font-medium"
                      : "text-stone-600 hover:text-stone-900 bg-stone-50 hover:bg-stone-100"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <label className="flex items-center gap-2 cursor-pointer text-stone-600 text-[11px] font-editorial-sans uppercase tracking-wider">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="rounded border-stone-300 text-stone-900"
              />
              <span>In Stock Only ({filteredProducts.length})</span>
            </label>
          </div>
        )}

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pt-6">
          {filteredProducts.map((prod) => (
            <div
              key={prod.id}
              className="bg-[#FAF8F5] border border-stone-200/90 flex flex-col justify-between group hover:border-stone-400 transition-all shadow-2xs"
            >
              {/* Product Visual */}
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-stone-100">
                <Image
                  src={prod.image}
                  alt={prod.name}
                  fill
                  className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 300px"
                />

                {/* Stock Badge Overlay */}
                <div className="absolute top-2.5 left-2.5 z-10 flex items-center gap-1.5">
                  <span
                    className={`font-editorial-sans text-[8px] uppercase tracking-[0.16em] font-semibold px-2 py-0.5 border shadow-2xs ${
                      prod.inStock
                        ? "bg-white/95 text-emerald-800 border-emerald-200/80"
                        : "bg-white/95 text-stone-500 border-stone-200"
                    }`}
                  >
                    {prod.inStock ? "Available" : "Waitlist Only"}
                  </span>
                </div>

                <div className="absolute top-2.5 right-2.5 z-10">
                  <span className="font-mono text-[9px] font-semibold bg-[#1C1917]/90 text-white px-2 py-0.5 shadow-2xs">
                    ${prod.price.toLocaleString()} {prod.currency}
                  </span>
                </div>
              </div>

              {/* Product Metadata */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-2.5">
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[8px] uppercase tracking-[0.2em] text-stone-400 font-editorial-sans font-medium">
                    <span>{prod.category}</span>
                    <span>{prod.designer}</span>
                  </div>

                  <h3 className="font-editorial-serif text-[18px] font-normal leading-snug text-stone-900 group-hover:text-stone-600 transition-colors">
                    {prod.name}
                  </h3>

                  {prod.boutiqueName && (
                    <p className="font-editorial-sans text-[8.5px] uppercase tracking-[0.15em] text-stone-500 font-medium">
                      At {prod.boutiqueName}
                    </p>
                  )}

                  <p className="font-editorial-serif italic text-xs text-stone-600 line-clamp-2 mt-1 leading-relaxed">
                    {prod.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-stone-200/70 flex items-center justify-between mt-auto">
                  <Link
                    href={`/directory?q=${encodeURIComponent(prod.designer)}`}
                    className="font-editorial-sans text-[8.5px] uppercase tracking-[0.16em] text-stone-500 hover:text-stone-900 transition-colors"
                  >
                    Find in Boutique
                  </Link>

                  <Link
                    href="/shop"
                    className="inline-flex items-center gap-1 font-editorial-sans text-[9px] uppercase tracking-[0.18em] font-medium text-stone-900 hover:opacity-75 transition-opacity"
                  >
                    <span>Inspect</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

