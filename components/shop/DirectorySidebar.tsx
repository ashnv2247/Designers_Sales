"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  MapPin,
  Clock,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Settings,
  Grid,
} from "lucide-react";
import { ShopProfile } from "@/types/shop";
import { calculateShopStatus, formatTime12h } from "@/lib/operatingHours";

const InstagramIcon: React.FC<{ className?: string }> = ({
  className = "w-3.5 h-3.5",
}) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

interface DirectorySidebarProps {
  shop: ShopProfile;
  isEditMode?: boolean;
  onEditMetadata?: () => void;
  onManageSimilarShops?: () => void;
  onSelectSimilarShop?: (shopSlug: string) => void;
}

export const DirectorySidebar: React.FC<DirectorySidebarProps> = ({
  shop,
  isEditMode = false,
  onEditMetadata,
  onManageSimilarShops,
  onSelectSimilarShop,
}) => {
  const [showFullHours, setShowFullHours] = useState(false);

  // Real-time calculation based on operating hours
  const statusResult = calculateShopStatus(shop.hours);

  return (
    <aside className="w-full lg:sticky lg:top-8 space-y-7 select-none">
      {/* Edit Mode Notification Banner if active */}
      {isEditMode && (
        <div className="bg-amber-50 border border-amber-200 p-3 flex items-center justify-between text-amber-900">
          <div className="flex items-center gap-2">
            <Settings className="w-3.5 h-3.5" />
            <span className="font-editorial-sans text-[8.5px] uppercase tracking-[0.20em] font-semibold">
              Sidebar Editable
            </span>
          </div>
          <button
            onClick={onEditMetadata}
            className="text-[8.5px] uppercase tracking-[0.18em] font-semibold underline hover:text-amber-700"
          >
            Edit Metadata
          </button>
        </div>
      )}

      {/* 1. Header Block: Title & Categories */}
      <div className="space-y-2">
        <div className="flex items-start justify-between">
          <h1 className="font-editorial-serif text-2xl md:text-3xl font-normal tracking-[0.08em] uppercase leading-tight text-stone-900">
            {shop.name}
          </h1>
          {isEditMode && (
            <button
              onClick={onEditMetadata}
              className="p-1 text-stone-400 hover:text-stone-900 transition-colors ml-2"
              title="Edit Shop Name and Categories"
              aria-label="Edit title and categories"
            >
              <Settings className="w-4 h-4 stroke-[1.5]" />
            </button>
          )}
        </div>

        {/* Categories joined by middle dot */}
        <p className="font-editorial-sans text-[10px] uppercase tracking-[0.2em] text-stone-500 font-medium leading-relaxed">
          {shop.categories.join(' · ')}
        </p>

        {shop.subtitle && (
          <p className="font-editorial-serif italic text-xs leading-relaxed text-stone-600 pt-1">
            {shop.subtitle}
          </p>
        )}
      </div>

      {/* 2. Metadata List: Location, Hours, Links */}
      <div className="space-y-4 border-t border-b border-stone-200 py-5 text-xs text-stone-600">
        {/* Location Item */}
        <div className="flex items-start gap-2.5">
          <MapPin className="w-3.5 h-3.5 text-stone-700 mt-0.5 flex-shrink-0 stroke-[1.8]" />
          <div className="space-y-0.5 leading-snug">
            <div>
              <span className="font-semibold text-stone-900 underline underline-offset-2">
                {shop.precinct}
              </span>
            </div>
            <div className="text-stone-600 leading-relaxed font-sans text-[11.5px]">
              {shop.address.formatted || `${shop.address.street}, ${shop.address.suburb}`}
            </div>
          </div>
        </div>

        {/* Operating Hours Item with Live Calculation Engine */}
        <div className="flex items-start gap-2.5">
          <Clock className="w-3.5 h-3.5 text-stone-700 mt-0.5 flex-shrink-0 stroke-[1.8]" />
          <div className="flex-1 space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              {/* Dynamic Status Badge */}
              <span
                data-testid="shop-status-badge"
                className={`font-editorial-sans text-[8.5px] uppercase tracking-[0.18em] font-semibold px-2 py-0.5 rounded-full ${
                  statusResult.isOpen
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-stone-100 text-stone-600"
                }`}
              >
                {statusResult.statusBadgeText}
              </span>

              <button
                type="button"
                onClick={() => setShowFullHours(!showFullHours)}
                className="font-editorial-sans text-[8px] uppercase tracking-[0.16em] text-stone-500 hover:text-stone-900 inline-flex items-center gap-0.5 transition-colors"
                aria-expanded={showFullHours}
              >
                <span>{showFullHours ? "Less" : "Weekly Schedule"}</span>
                {showFullHours ? (
                  <ChevronUp className="w-2.5 h-2.5" />
                ) : (
                  <ChevronDown className="w-2.5 h-2.5" />
                )}
              </button>
            </div>

            {/* Collapsible Full Weekly Schedule */}
            {showFullHours && (
              <div className="mt-2.5 p-3 bg-stone-50 border border-stone-200 text-[11px] font-sans space-y-1 animate-fadeIn">
                <span className="font-editorial-sans text-[8px] uppercase tracking-[0.2em] font-semibold text-stone-500 block pb-1 border-b border-stone-200">
                  STANDARD OPERATING HOURS (AEST)
                </span>
                <div className="divide-y divide-stone-200/60 pt-1">
                  {shop.hours.map((h) => (
                    <div
                      key={h.day}
                      className="py-1 flex items-center justify-between text-stone-700"
                    >
                      <span className="font-medium text-stone-900 w-10">{h.day}</span>
                      <span>
                        {h.isClosed
                          ? "Closed"
                          : `${formatTime12h(h.open)} – ${formatTime12h(h.close)}`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* External Links */}
        <div className="pt-2 border-t border-stone-200/60 flex flex-col gap-2">
          {shop.contact.websiteUrl && (
            <a
              href={shop.contact.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-stone-800 hover:text-stone-500 underline underline-offset-4 decoration-stone-300 hover:decoration-stone-600 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5 stroke-[1.6]" />
              <span className="font-editorial-sans text-[10px] uppercase tracking-[0.18em] font-medium">
                Visit Website
              </span>
            </a>
          )}

          {shop.contact.instagramHandle && (
            <a
              href={`https://instagram.com/${shop.contact.instagramHandle.replace('@', '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-stone-800 hover:text-stone-500 underline underline-offset-4 decoration-stone-300 hover:decoration-stone-600 transition-colors"
            >
              <InstagramIcon className="w-3.5 h-3.5" />
              <span className="font-editorial-sans text-[10px] uppercase tracking-[0.18em] font-medium">
                {shop.contact.instagramHandle}
              </span>
            </a>
          )}
        </div>
      </div>

      {/* 3. Similar Shops Discovery Grid (2x3 Grid) */}
      <div className="pt-1">
        <div className="flex items-center justify-between mb-3.5">
          <h2 className="font-editorial-sans text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-800">
            SIMILAR SHOPS
          </h2>
          {isEditMode && (
            <button
              onClick={onManageSimilarShops}
              className="p-1 text-stone-400 hover:text-stone-800 transition-colors"
              title="Manage Similar Shops Grid"
              aria-label="Manage similar shops"
            >
              <Grid className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* 2x3 Thumbnail Grid */}
        <div data-testid="similar-shops-grid" className="grid grid-cols-2 gap-x-3 gap-y-4">
          {shop.similarShops.slice(0, 6).map((similar) => (
            <div
              key={similar.id}
              data-testid="similar-shop-card"
              onClick={() => onSelectSimilarShop?.(similar.slug)}
              className="group cursor-pointer flex flex-col items-start"
            >
              <div className="relative aspect-square w-full overflow-hidden bg-stone-200 border border-stone-200/80">
                <Image
                  src={similar.thumbnailUrl}
                  alt={similar.name}
                  fill
                  className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 1024px) 45vw, 15vw"
                />
              </div>
              <h3 className="font-editorial-sans text-[9.5px] uppercase tracking-[0.15em] text-stone-700 group-hover:text-stone-900 group-hover:underline transition-all truncate w-full mt-1.5 font-medium">
                {similar.name}
              </h3>
              <span className="font-editorial-sans text-[8px] uppercase tracking-[0.18em] text-stone-400">
                {similar.precinct}
              </span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
};

export default DirectorySidebar;

