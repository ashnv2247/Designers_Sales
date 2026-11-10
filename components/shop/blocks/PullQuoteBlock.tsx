"use client";

import React from "react";
import { EditorialBlock } from "@/types/shop";

interface PullQuoteBlockProps {
  block: EditorialBlock;
  isEditMode?: boolean;
  onChange: (updatedBlock: EditorialBlock) => void;
}

export const PullQuoteBlock: React.FC<PullQuoteBlockProps> = ({
  block,
  isEditMode = false,
  onChange,
}) => {
  const quote = block.quote || {
    text: "We wanted a sanctuary where the garments breathe with the same intention as an exhibition in a private gallery.",
    author: "Elena Rostova",
    role: "Proprietor & Creative Director",
  };

  if (isEditMode) {
    return (
      <div className="space-y-3 p-4 bg-white border border-stone-200 rounded-sm">
        <span className="font-editorial-sans text-[10px] uppercase tracking-[0.2em] font-semibold text-stone-500">
          Editorial Pull Quote
        </span>

        <div>
          <label className="block text-[10px] uppercase tracking-wider text-stone-500 mb-1">
            Quote Text
          </label>
          <textarea
            rows={3}
            value={quote.text}
            onChange={(e) =>
              onChange({
                ...block,
                quote: { ...quote, text: e.target.value },
              })
            }
            className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded text-xs italic font-serif leading-relaxed focus:outline-none focus:border-stone-400"
            placeholder="Enter memorable quote or excerpt..."
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-stone-500 mb-1">
              Author
            </label>
            <input
              type="text"
              value={quote.author}
              onChange={(e) =>
                onChange({
                  ...block,
                  quote: { ...quote, author: e.target.value },
                })
              }
              placeholder="e.g. Elena Rostova"
              className="w-full px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded text-xs focus:outline-none focus:border-stone-400"
            />
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-stone-500 mb-1">
              Role / Subtitle
            </label>
            <input
              type="text"
              value={quote.role || ""}
              onChange={(e) =>
                onChange({
                  ...block,
                  quote: { ...quote, role: e.target.value },
                })
              }
              placeholder="e.g. Founder & Creative Director"
              className="w-full px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded text-xs focus:outline-none focus:border-stone-400"
            />
          </div>
        </div>
      </div>
    );
  }

  // Public Render Mode
  return (
    <div className="my-8 py-8 border-t border-b border-stone-200/80 text-center select-none">
      <blockquote className="max-w-2xl mx-auto px-4">
        <p className="font-serif text-xl sm:text-2xl md:text-[26px] italic font-normal leading-relaxed text-stone-800">
          “{quote.text}”
        </p>
        {(quote.author || quote.role) && (
          <footer className="mt-4 flex items-center justify-center gap-2 font-editorial-sans text-[9px] sm:text-[10px] uppercase tracking-[0.22em] text-stone-500">
            {quote.author && <span className="font-semibold">{quote.author}</span>}
            {quote.author && quote.role && <span className="text-stone-300">/</span>}
            {quote.role && <span>{quote.role}</span>}
          </footer>
        )}
      </blockquote>
    </div>
  );
};

