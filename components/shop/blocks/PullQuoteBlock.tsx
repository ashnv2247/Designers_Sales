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

  return (
    <div className="my-8 py-8 border-t border-b border-stone-200/80 text-center select-none">
      <blockquote className="max-w-2xl mx-auto px-4">
        {isEditMode ? (
          <textarea
            rows={3}
            value={quote.text}
            onChange={(e) =>
              onChange({
                ...block,
                quote: { ...quote, text: e.target.value },
              })
            }
            placeholder="Enter memorable quote or excerpt..."
            className="w-full font-serif text-xl sm:text-2xl md:text-[26px] italic font-normal leading-relaxed text-stone-800 bg-transparent border border-dashed border-stone-200 hover:border-stone-400 focus:border-stone-600 focus:bg-white/40 focus:outline-none rounded p-2 text-center resize-none transition-colors"
          />
        ) : (
          <p className="font-serif text-xl sm:text-2xl md:text-[26px] italic font-normal leading-relaxed text-stone-800">
            “{quote.text}”
          </p>
        )}

        {(quote.author || quote.role || isEditMode) && (
          <footer className="mt-4 flex flex-wrap items-center justify-center gap-2 font-editorial-sans text-[9px] sm:text-[10px] uppercase tracking-[0.22em] text-stone-500">
            {isEditMode ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={quote.author}
                  onChange={(e) =>
                    onChange({
                      ...block,
                      quote: { ...quote, author: e.target.value },
                    })
                  }
                  placeholder="AUTHOR NAME"
                  className="bg-transparent border-b border-dashed border-stone-300 focus:border-stone-700 text-center font-semibold text-stone-700 focus:outline-none px-1"
                />
                <span className="text-stone-300">/</span>
                <input
                  type="text"
                  value={quote.role || ""}
                  onChange={(e) =>
                    onChange({
                      ...block,
                      quote: { ...quote, role: e.target.value },
                    })
                  }
                  placeholder="ROLE / TITLE"
                  className="bg-transparent border-b border-dashed border-stone-300 focus:border-stone-700 text-center text-stone-500 focus:outline-none px-1"
                />
              </div>
            ) : (
              <>
                {quote.author && <span className="font-semibold">{quote.author}</span>}
                {quote.author && quote.role && <span className="text-stone-300">/</span>}
                {quote.role && <span>{quote.role}</span>}
              </>
            )}
          </footer>
        )}
      </blockquote>
    </div>
  );
};

