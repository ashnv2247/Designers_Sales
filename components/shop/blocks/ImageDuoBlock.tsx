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

  // Public & Live In-Place Render Mode: Strictly 2 slots rendered side-by-side
  return (
    <div
      data-testid="image-duo-grid"
      className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-start"
    >
      <div data-testid="image-duo-slot-1" className="w-full relative group/slot1">
        <EditorialImage
          src={slot1.url}
          alt={slot1.alt}
          aspectRatio={slot1.aspectRatio || "4:5"}
          caption={slot1.caption}
          photographerCredit={slot1.photographerCredit}
        />
        {isEditMode && (
          <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover/slot1:opacity-100 transition-opacity">
            <button
              type="button"
              onClick={() => {
                const newUrl = prompt("Enter image URL or Cloudinary path for Slot 1:", slot1.url);
                if (newUrl && newUrl.trim()) {
                  handleSlot1Change({ ...slot1, url: newUrl.trim() });
                }
              }}
              className="px-2 py-1 bg-white/95 hover:bg-white text-stone-800 text-[10px] font-editorial-sans uppercase tracking-wider rounded shadow-xs border border-stone-300"
            >
              Replace Photo 1
            </button>
          </div>
        )}
      </div>

      <div data-testid="image-duo-slot-2" className="w-full relative group/slot2">
        <EditorialImage
          src={slot2.url}
          alt={slot2.alt}
          aspectRatio={slot2.aspectRatio || "4:5"}
          caption={slot2.caption}
          photographerCredit={slot2.photographerCredit}
        />
        {isEditMode && (
          <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover/slot2:opacity-100 transition-opacity">
            <button
              type="button"
              onClick={() => {
                const newUrl = prompt("Enter image URL or Cloudinary path for Slot 2:", slot2.url);
                if (newUrl && newUrl.trim()) {
                  handleSlot2Change({ ...slot2, url: newUrl.trim() });
                }
              }}
              className="px-2 py-1 bg-white/95 hover:bg-white text-stone-800 text-[10px] font-editorial-sans uppercase tracking-wider rounded shadow-xs border border-stone-300"
            >
              Replace Photo 2
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

