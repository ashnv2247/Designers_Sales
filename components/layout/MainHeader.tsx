"use client";

import React, { useState } from "react";
import { Search, Menu, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SubmitShopModal } from "@/components/modals/SubmitShopModal";

interface MainHeaderProps {
  onToggleMobileNav?: () => void;
  onSubmitShopClick?: () => void;
}

export const MainHeader: React.FC<MainHeaderProps> = ({
  onToggleMobileNav,
  onSubmitShopClick,
}) => {
  const router = useRouter();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/directory?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
    }
  };

  const handleOpenSubmit = () => {
    if (onSubmitShopClick) {
      onSubmitShopClick();
    } else {
      setIsSubmitModalOpen(true);
    }
  };

  return (
    <header className="w-full pt-3.5 sm:pt-4 pb-2 bg-background relative z-40 select-none overflow-hidden">
      <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-9">
        {/* Top Header Row */}
        <div className="relative flex items-center justify-between gap-2">
          {/* Left area: DS/ and EST. 2012 */}
          <div className="flex items-baseline gap-1.5 sm:gap-3 flex-shrink-0">
            <Link
              href="/"
              className="font-editorial-serif text-[20px] sm:text-[23px] font-normal text-foreground hover:opacity-85 transition-opacity inline-flex items-center"
            >
              <span className="italic font-light">DS</span>
              <span className="font-light text-[15px] sm:text-[17px] ml-0.5 opacity-90">/</span>
            </Link>
            <span className="font-editorial-sans text-[7.5px] sm:text-[8.5px] tracking-[0.22em] uppercase text-foreground/80 font-medium ml-0.5 sm:ml-1">
              EST. 2012
            </span>
          </div>

          {/* Center area: DESIGNERSALE and THE VISUAL DISCOVERY DIRECTORY */}
          <div className="text-center flex-1 min-w-0 px-1 sm:px-2">
            <Link href="/" className="inline-block group text-center max-w-full">
              <h1 className="font-editorial-serif text-[20px] sm:text-[32px] md:text-[37px] tracking-[0.14em] sm:tracking-[0.16em] uppercase font-normal leading-tight text-foreground transition-opacity group-hover:opacity-90 truncate sm:overflow-visible">
                DESIGNERSALE
              </h1>
              <p className="font-editorial-sans text-[6.5px] sm:text-[8px] tracking-[0.22em] sm:tracking-[0.28em] uppercase text-foreground/80 font-medium mt-0.5 truncate">
                THE VISUAL DISCOVERY DIRECTORY
              </p>
            </Link>
          </div>

          {/* Right area: SUBMIT A SHOP, Search, Hamburger */}
          <div className="flex items-center justify-end gap-2.5 sm:gap-5 flex-shrink-0">
            <Link
              href="/admin"
              className="hidden lg:inline-flex items-center gap-1 font-editorial-sans text-[7.5px] uppercase tracking-[0.20em] font-semibold text-stone-700 px-2 py-0.5 border border-stone-300 rounded hover:bg-stone-100 transition-colors"
            >
              <span>ADMIN CMS</span>
            </Link>

            <button
              type="button"
              onClick={handleOpenSubmit}
              className="hidden md:inline-flex items-center gap-1 font-editorial-sans text-[8.5px] sm:text-[9px] uppercase tracking-[0.20em] font-medium text-foreground pb-0.5 border-b border-foreground hover:opacity-75 transition-opacity"
            >
              <span>SUBMIT A SHOP</span>
              <span className="text-[10px] leading-none">↗</span>
            </button>

            <button
              type="button"
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-1 text-foreground/90 hover:text-foreground transition-colors"
              aria-label="Toggle search"
            >
              <Search className="w-[16px] h-[16px] stroke-[1.3]" />
            </button>

            <button
              type="button"
              onClick={onToggleMobileNav}
              className="p-1 text-foreground/90 hover:text-foreground transition-colors"
              aria-label="Open menu"
            >
              <Menu className="w-[19px] h-[19px] stroke-[1.3]" />
            </button>
          </div>
        </div>

        {/* Search Bar Dropdown */}
        {searchOpen && (
          <form
            onSubmit={handleSearchSubmit}
            className="mt-2 py-2 px-3 bg-surface-warm/80 rounded border border-editorial-border transition-all"
          >
            <div className="flex items-center gap-3 max-w-md mx-auto">
              <Search className="w-3.5 h-3.5 text-editorial-muted stroke-[1.5]" />
              <input
                type="text"
                placeholder="Search boutiques, designers, or cities... (Press Enter)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="w-full bg-transparent text-[12px] tracking-wide focus:outline-none placeholder:text-editorial-caption"
              />
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="text-editorial-caption hover:text-foreground p-1"
                aria-label="Close search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        )}

        {/* Secondary Navigation */}
        <nav className="w-full pt-2.5 sm:pt-3 overflow-x-auto no-scrollbar">
          <ul className="flex items-center justify-center gap-4 sm:gap-9 md:gap-13 flex-wrap">
            {["SHOPS", "CITIES", "GUIDES", "DESIGNERS", "JOURNAL"].map(
              (item) => (
                <li key={item}>
                  <Link
                    href={
                      item === "SHOPS"
                        ? "/directory"
                        : item === "GUIDES"
                        ? "/guides/melbourne-edit"
                        : `/#${item.toLowerCase()}`
                    }
                    className="font-editorial-sans text-[8.5px] sm:text-[9.5px] uppercase tracking-[0.22em] sm:tracking-[0.24em] font-medium text-foreground hover:text-editorial-accent transition-colors whitespace-nowrap"
                  >
                    {item}
                  </Link>
                </li>
              )
            )}
          </ul>
        </nav>
      </div>

      {/* Global Submit Shop Modal */}
      <SubmitShopModal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
      />
    </header>
  );
};

export default MainHeader;
