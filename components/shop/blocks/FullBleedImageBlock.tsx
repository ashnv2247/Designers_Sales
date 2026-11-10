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

  if (isEditMode) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="font-editorial-sans text-[10px] uppercase tracking-[0.2em] font-semibold text-stone-500">
            Full-Bleed Showcase Image
          </span>
          <span className="text-[10px] text-stone-400">
            Spans full width of the editorial column
          </span>
        </div>

        <MediaAssetEditor
          label="Showcase Visual"
          asset={image}
          onChange={handleImageChange}
          allowedRatios={["16:10", "4:5", "1:1", "auto"]}
        />
      </div>
    );
  }

  return (
    <div className="w-full my-3">
      <EditorialImage
        src={image.url}
        alt={image.alt}
        aspectRatio={image.aspectRatio || "16:10"}
        caption={image.caption}
        photographerCredit={image.photographerCredit}
      />
    </div>
  );
};

