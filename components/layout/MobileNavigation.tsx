"use client";

import React from "react";
import { X, ArrowUpRight } from "lucide-react";
import Link from "next/link";

interface MobileNavigationProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitShopClick?: () => void;
}

export const MobileNavigation: React.FC<MobileNavigationProps> = ({
  isOpen,
  onClose,
  onSubmitShopClick,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-foreground/40 backdrop-blur-sm flex justify-end transition-opacity">
      <div className="w-full max-w-sm bg-background h-full p-6 sm:p-8 flex flex-col justify-between shadow-2xl border-l border-editorial-border overflow-y-auto">
        <div>
          <div className="flex items-center justify-between pb-6 border-b border-editorial-border">
            <div className="flex items-center gap-2">
              <span className="font-editorial-serif text-xl italic font-light">DS/</span>
              <span className="font-editorial-sans text-[10px] tracking-[0.2em] uppercase text-foreground/80">
                DIRECTORY
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-foreground hover:opacity-70 transition-opacity"
              aria-label="Close menu"
            >
              <X className="w-5 h-5 stroke-[1.5]" />
            </button>
          </div>

          <nav className="mt-8 flex flex-col gap-6">
            {["SHOPS", "CITIES", "GUIDES", "DESIGNERS", "JOURNAL"].map(
              (item) => (
                <Link
                  key={item}
                  href={
                    item === "SHOPS"
                      ? "/directory"
                      : item === "GUIDES"
                      ? "/guides/melbourne-edit"
                      : `/#${item.toLowerCase()}`
                  }
                  onClick={onClose}
                  className="font-editorial-sans text-[14px] uppercase tracking-[0.24em] font-medium text-foreground hover:text-editorial-accent transition-colors py-1"
                >
                  {item}
                </Link>
              )
            )}
          </nav>
        </div>

        <div className="pt-8 border-t border-editorial-border flex flex-col gap-4">
          <button
            type="button"
            onClick={() => {
              onClose();
              if (onSubmitShopClick) onSubmitShopClick();
            }}
            className="inline-flex items-center justify-between font-editorial-sans text-[12px] uppercase tracking-[0.20em] font-medium text-foreground py-2 border-b border-foreground text-left"
          >
            <span>SUBMIT A SHOP</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>

          <Link
            href="/admin"
            onClick={onClose}
            className="inline-flex items-center justify-between font-editorial-sans text-[11px] uppercase tracking-[0.18em] font-medium text-stone-600 hover:text-stone-900 py-1"
          >
            <span>ADMIN CMS & STUDIO</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>

          <p className="font-editorial-sans text-[10px] uppercase tracking-[0.20em] text-editorial-caption">
            EST. 2012 — AUSTRALIA
          </p>
        </div>
      </div>
    </div>
  );
};

export default MobileNavigation;
