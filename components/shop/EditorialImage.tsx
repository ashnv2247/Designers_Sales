"use client";

import React, { useState } from "react";
import Image from "next/image";
import { AspectRatio } from "@/types/shop";
import { ImageOff } from "lucide-react";

interface EditorialImageProps {
  src?: string;
  alt: string;
  aspectRatio?: AspectRatio;
  caption?: string;
  photographerCredit?: string;
  className?: string;
  priority?: boolean;
}

export const EditorialImage: React.FC<EditorialImageProps> = ({
  src,
  alt,
  aspectRatio = "4:5",
  caption,
  photographerCredit,
  className = "",
  priority = false,
}) => {
  const [hasError, setHasError] = useState(false);

  // Aspect ratio classes
  const aspectClassMap: Record<AspectRatio, string> = {
    "4:5": "aspect-[4/5]",
    "1:1": "aspect-square",
    "16:10": "aspect-[16/10]",
    "auto": "aspect-auto",
  };

  const chosenAspect = aspectClassMap[aspectRatio] || "aspect-[4/5]";

  const isBroken = hasError || !src || src.trim() === "";

  return (
    <figure className={`w-full group ${className}`}>
      <div
        className={`relative w-full overflow-hidden bg-stone-100 border border-stone-200/60 ${chosenAspect}`}
      >
        {isBroken ? (
          <div
            data-testid="archive-image-unavailable"
            className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-[#FAF8F5] select-none"
          >
            <div className="w-10 h-10 rounded-full border border-stone-300 flex items-center justify-center mb-3 text-stone-400">
              <ImageOff className="w-4 h-4" />
            </div>
            <span className="font-editorial-serif text-base tracking-[0.12em] text-stone-800">
              DS/
            </span>
            <span className="font-editorial-sans text-[8.5px] uppercase tracking-[0.22em] text-stone-500 font-medium mt-1">
              ARCHIVE IMAGE UNAVAILABLE
            </span>
            <p className="text-[10px] text-stone-400 font-mono mt-1 max-w-[200px] truncate">
              {src ? src.split("/").pop() : "No source specified"}
            </p>
          </div>
        ) : (
          <Image
            src={src}
            alt={alt || "DesignerSale Archive Visual"}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 800px"
            priority={priority}
            onError={() => setHasError(true)}
            className="object-cover w-full h-full transition-transform duration-700 ease-out group-hover:scale-[1.015]"
          />
        )}
      </div>

      {(caption || photographerCredit) && (
        <figcaption className="mt-2.5 flex items-baseline justify-between gap-3 text-stone-500 text-[11px] font-sans leading-relaxed border-t border-stone-100 pt-1.5">
          {caption && <span className="italic text-stone-600">{caption}</span>}
          {photographerCredit && (
            <span className="font-editorial-sans text-[8px] uppercase tracking-[0.18em] text-stone-400 shrink-0 ml-auto">
              Photo: {photographerCredit}
            </span>
          )}
        </figcaption>
      )}
    </figure>
  );
};

