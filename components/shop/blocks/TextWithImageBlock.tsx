"use client";

import React from "react";
import { EditorialBlock, MediaAsset } from "@/types/shop";
import { EditorialImage } from "../EditorialImage";
import { MediaAssetEditor } from "../MediaAssetEditor";
import { Plus } from "lucide-react";

interface TextWithImageBlockProps {
  block: EditorialBlock;
  isEditMode?: boolean;
  onChange: (updatedBlock: EditorialBlock) => void;
}

export const TextWithImageBlock: React.FC<TextWithImageBlockProps> = ({
  block,
  isEditMode = false,
  onChange,
}) => {
  const image = block.images?.[0];

  const handleImageChange = (newAsset: MediaAsset) => {
    onChange({
      ...block,
      images: [newAsset],
    });
  };

  const handleImageRemove = () => {
    onChange({
      ...block,
      images: [],
    });
  };

  const handleAddImage = () => {
    const freshAsset: MediaAsset = {
      id: `img-${Date.now()}`,
      url: "/images/hero/hero-top-right.jpg",
      alt: "Curated boutique detail",
      caption: "Boutique interior detail",
      aspectRatio: "4:5",
      photographerCredit: "DesignerSale Archive",
    };
    onChange({
      ...block,
      images: [freshAsset],
    });
  };

  return (
    <article className="space-y-6">
      {/* Heading / Kicker */}
      {(block.heading || isEditMode) && (
        <div className="pb-1 border-b border-stone-200/60 inline-block w-full max-w-md">
          {isEditMode ? (
            <input
              type="text"
              value={block.heading || ""}
              onChange={(e) => onChange({ ...block, heading: e.target.value })}
              placeholder="SECTION KICKER / HEADING"
              className="font-editorial-sans text-xs md:text-sm font-semibold uppercase tracking-[0.25em] text-stone-600 bg-transparent border-none p-0 focus:outline-none w-full placeholder:text-stone-300"
            />
          ) : (
            <h2 className="font-editorial-sans text-xs md:text-sm font-semibold uppercase tracking-[0.25em] text-stone-600">
              {block.heading}
            </h2>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        <div
          className={`${
            image ? "md:col-span-7" : "md:col-span-12"
          } space-y-4`}
        >
          {isEditMode ? (
            <textarea
              rows={Math.max(4, (block.bodyText || "").split("\n").length + 2)}
              value={block.bodyText || ""}
              onChange={(e) => onChange({ ...block, bodyText: e.target.value })}
              placeholder="Enter long-form editorial prose..."
              className="w-full font-serif text-base md:text-[17px] leading-[1.85] text-stone-700 bg-transparent border border-dashed border-stone-200 hover:border-stone-400 focus:border-stone-600 focus:bg-white/50 rounded p-2 focus:outline-none resize-y transition-colors"
            />
          ) : (
            block.bodyText && (
              <div className="font-serif text-base md:text-[17px] leading-[1.85] text-stone-700 whitespace-pre-line text-justify selection:bg-stone-200">
                {block.bodyText}
              </div>
            )
          )}
        </div>

        {image ? (
          <div className="md:col-span-5 relative group/img">
            <EditorialImage
              src={image.url}
              alt={image.alt}
              aspectRatio={image.aspectRatio}
              caption={image.caption}
              photographerCredit={image.photographerCredit}
            />
            {isEditMode && (
              <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover/img:opacity-100 transition-opacity">
                <button
                  type="button"
                  onClick={() => {
                    const newUrl = prompt("Enter new image URL or Cloudinary path:", image.url);
                    if (newUrl && newUrl.trim()) {
                      handleImageChange({ ...image, url: newUrl.trim() });
                    }
                  }}
                  className="px-2 py-1 bg-white/95 hover:bg-white text-stone-800 text-[10px] font-editorial-sans uppercase tracking-wider rounded shadow-xs border border-stone-300 flex items-center gap-1"
                >
                  <span>Replace Photo</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleImageChange({ ...image, url: "https://invalid-image-url-404.jpg" })}
                  className="px-1.5 py-1 bg-white/80 hover:bg-white text-stone-500 text-[9px] font-mono rounded border border-stone-200"
                >
                  Load Broken URL
                </button>
              </div>
            )}
          </div>
        ) : isEditMode ? (
          <div className="md:col-span-5">
            <button
              type="button"
              onClick={handleAddImage}
              className="w-full aspect-[4/5] border border-dashed border-stone-300 hover:border-stone-500 rounded bg-stone-50/50 flex flex-col items-center justify-center gap-2 text-stone-500 hover:text-stone-800 transition-colors"
            >
              <Plus className="w-5 h-5 text-stone-400" />
              <span className="text-xs font-editorial-sans uppercase tracking-wider">
                Add Accompanying Visual
              </span>
            </button>
          </div>
        ) : null}
      </div>
    </article>
  );
};

