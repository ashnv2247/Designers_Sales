"use client";

import React from "react";
import { EditorialBlock, MediaAsset } from "@/types/shop";
import { EditorialImage } from "../EditorialImage";
import { MediaAssetEditor } from "../MediaAssetEditor";

interface FullBleedImageBlockProps {
  block: EditorialBlock;
  isEditMode?: boolean;
  onChange: (updatedBlock: EditorialBlock) => void;
}

export const FullBleedImageBlock: React.FC<FullBleedImageBlockProps> = ({
  block,
  isEditMode = false,
  onChange,
}) => {
  const image = block.images?.[0] || {
    id: `img-bleed-${block.id}`,
    url: "",
    alt: "Storefront or atmosphere showcase visual",
    aspectRatio: "16:10",
  };

  const handleImageChange = (newAsset: MediaAsset) => {
    onChange({
      ...block,
      images: [newAsset],
    });
  };

  return (
    <div className="w-full my-3 relative group/bleed">
      <EditorialImage
        src={image.url}
        alt={image.alt}
        aspectRatio={image.aspectRatio || "16:10"}
        caption={image.caption}
        photographerCredit={image.photographerCredit}
      />
      {isEditMode && (
        <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover/bleed:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={() => {
              const newUrl = prompt("Enter new full-bleed image URL or Cloudinary path:", image.url);
              if (newUrl && newUrl.trim()) {
                handleImageChange({ ...image, url: newUrl.trim() });
              }
            }}
            className="px-2.5 py-1 bg-white/95 hover:bg-white text-stone-800 text-[10px] font-editorial-sans uppercase tracking-wider rounded shadow-xs border border-stone-300"
          >
            Replace Photo
          </button>
        </div>
      )}
    </div>
  );
};

