"use client";

import React from "react";
import { EditorialBlock, MediaAsset } from "@/types/shop";
import { EditorialImage } from "../EditorialImage";
import { MediaAssetEditor } from "../MediaAssetEditor";

interface ImageDuoBlockProps {
  block: EditorialBlock;
  isEditMode?: boolean;
  onChange: (updatedBlock: EditorialBlock) => void;
}

export const ImageDuoBlock: React.FC<ImageDuoBlockProps> = ({
  block,
  isEditMode = false,
  onChange,
}) => {
  // Strictly ensure exactly 2 image slots
  const currentImages = block.images || [];
  
  const slot1: MediaAsset = currentImages[0] || {
    id: `img-duo-1-${block.id}`,
    url: "",
    alt: "Image slot 1",
    aspectRatio: "4:5",
  };

  const slot2: MediaAsset = currentImages[1] || {
    id: `img-duo-2-${block.id}`,
    url: "",
    alt: "Image slot 2",
    aspectRatio: "4:5",
  };

  const handleSlot1Change = (newAsset: MediaAsset) => {
    onChange({
      ...block,
      images: [newAsset, slot2],
    });
  };

  const handleSlot2Change = (newAsset: MediaAsset) => {
    onChange({
      ...block,
      images: [slot1, newAsset],
    });
  };

  if (isEditMode) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="font-editorial-sans text-[10px] uppercase tracking-[0.2em] font-semibold text-stone-500">
            Image Duo (Strictly 2 Slots)
          </span>
          <span className="text-[10px] text-stone-400">
            Both columns render symmetrically side-by-side
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <MediaAssetEditor
            label="Left Image (Slot 1 of 2)"
            asset={slot1}
            onChange={handleSlot1Change}
            allowedRatios={["4:5", "1:1"]}
          />
          <MediaAssetEditor
            label="Right Image (Slot 2 of 2)"
            asset={slot2}
            onChange={handleSlot2Change}
            allowedRatios={["4:5", "1:1"]}
          />
        </div>
      </div>
    );
  }

  // Public Render Mode: Strictly 2 slots rendered side-by-side
  return (
    <div
      data-testid="image-duo-grid"
      className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-start"
    >
      <div data-testid="image-duo-slot-1" className="w-full">
        <EditorialImage
          src={slot1.url}
          alt={slot1.alt}
          aspectRatio={slot1.aspectRatio || "4:5"}
          caption={slot1.caption}
          photographerCredit={slot1.photographerCredit}
        />
      </div>

      <div data-testid="image-duo-slot-2" className="w-full">
        <EditorialImage
          src={slot2.url}
          alt={slot2.alt}
          aspectRatio={slot2.aspectRatio || "4:5"}
          caption={slot2.caption}
          photographerCredit={slot2.photographerCredit}
        />
      </div>
    </div>
  );
};

