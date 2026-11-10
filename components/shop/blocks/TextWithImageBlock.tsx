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

  if (isEditMode) {
    return (
      <div className="space-y-4">
        {/* Heading Field */}
        <div>
          <label className="block text-[10px] uppercase tracking-wider text-stone-500 mb-1">
            Section Kicker / Heading
          </label>
          <input
            type="text"
            value={block.heading || ""}
            onChange={(e) => onChange({ ...block, heading: e.target.value })}
            placeholder="e.g. WHAT WE LOVE"
            className="w-full px-3 py-1.5 bg-stone-50 border border-stone-200 rounded text-xs font-medium uppercase tracking-wider focus:outline-none focus:border-stone-400"
          />
        </div>

        {/* Body Text Field */}
        <div>
          <label className="block text-[10px] uppercase tracking-wider text-stone-500 mb-1">
            Long-form Editorial Prose
          </label>
          <textarea
            rows={5}
            value={block.bodyText || ""}
            onChange={(e) => onChange({ ...block, bodyText: e.target.value })}
            placeholder="Enter editorial prose for this section..."
            className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded text-xs font-serif leading-relaxed focus:outline-none focus:border-stone-400 resize-y"
          />
        </div>

        {/* Optional Image Editor */}
        <div className="pt-2">
          {image ? (
            <MediaAssetEditor
              label="Accompanying Visual"
              asset={image}
              onChange={handleImageChange}
              onRemove={handleImageRemove}
              allowedRatios={["4:5", "1:1", "16:10"]}
            />
          ) : (
            <button
              type="button"
              onClick={handleAddImage}
              className="inline-flex items-center gap-1.5 px-3 py-2 border border-dashed border-stone-300 hover:border-stone-500 rounded text-stone-600 hover:text-stone-900 text-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Visual to this Text Block</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  // Public Render Mode
  return (
    <article className="space-y-6">
      {block.heading && (
        <h2 className="font-editorial-sans text-xs md:text-sm font-semibold uppercase tracking-[0.25em] text-stone-600 pb-1 border-b border-stone-200/60 inline-block">
          {block.heading}
        </h2>
      )}

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        <div
          className={`${
            image ? "md:col-span-7" : "md:col-span-12"
          } space-y-4`}
        >
          {block.bodyText && (
            <div className="font-serif text-base md:text-[17px] leading-[1.85] text-stone-700 whitespace-pre-line text-justify selection:bg-stone-200">
              {block.bodyText}
            </div>
          )}
        </div>

        {image && (
          <div className="md:col-span-5">
            <EditorialImage
              src={image.url}
              alt={image.alt}
              aspectRatio={image.aspectRatio}
              caption={image.caption}
              photographerCredit={image.photographerCredit}
            />
          </div>
        )}
      </div>
    </article>
  );
};

