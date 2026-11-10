"use client";

import React, { useState } from "react";
import { EditorialBlock, BlockType } from "@/types/shop";
import { TextWithImageBlock } from "./blocks/TextWithImageBlock";
import { ImageDuoBlock } from "./blocks/ImageDuoBlock";
import { FullBleedImageBlock } from "./blocks/FullBleedImageBlock";
import { PullQuoteBlock } from "./blocks/PullQuoteBlock";
import { DesignerRosterBlock } from "./blocks/DesignerRosterBlock";
import {
  ChevronUp,
  ChevronDown,
  Copy,
  Trash2,
  Plus,
  Layers,
  Check,
  X,
} from "lucide-react";

interface EditorialFeedProps {
  blocks: EditorialBlock[];
  isEditMode?: boolean;
  onUpdateBlocks: (newBlocks: EditorialBlock[]) => void;
}

export const EditorialFeed: React.FC<EditorialFeedProps> = ({
  blocks,
  isEditMode = false,
  onUpdateBlocks,
}) => {
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Recalculate sequential orders
  const reindexBlocks = (list: EditorialBlock[]): EditorialBlock[] => {
    return list.map((b, idx) => ({ ...b, order: idx }));
  };

  // Move block up (TC-03)
  const handleMoveUp = (index: number) => {
    if (index <= 0) return; // Bounds check
    const updated = [...blocks];
    const temp = updated[index];
    updated[index] = updated[index - 1];
    updated[index - 1] = temp;
    onUpdateBlocks(reindexBlocks(updated));
  };

  // Move block down (TC-03)
  const handleMoveDown = (index: number) => {
    if (index >= blocks.length - 1) return; // Bounds check
    const updated = [...blocks];
    const temp = updated[index];
    updated[index] = updated[index + 1];
    updated[index + 1] = temp;
    onUpdateBlocks(reindexBlocks(updated));
  };

  // Duplicate block
  const handleDuplicate = (index: number) => {
    const target = blocks[index];
    const duplicated: EditorialBlock = {
      ...JSON.parse(JSON.stringify(target)),
      id: `block-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      order: index + 1,
    };
    const updated = [...blocks];
    updated.splice(index + 1, 0, duplicated);
    onUpdateBlocks(reindexBlocks(updated));
  };

  // Delete block
  const handleDelete = (id: string) => {
    const updated = blocks.filter((b) => b.id !== id);
    setConfirmDeleteId(null);
    onUpdateBlocks(reindexBlocks(updated));
  };

  // Change block type
  const handleTypeChange = (index: number, newType: BlockType) => {
    const target = blocks[index];
    if (target.type === newType) return;

    const updated = [...blocks];
    updated[index] = {
      ...target,
      type: newType,
    };
    onUpdateBlocks(updated);
  };

  // Update a single block's content
  const handleBlockChange = (index: number, updatedBlock: EditorialBlock) => {
    const updated = [...blocks];
    updated[index] = updatedBlock;
    onUpdateBlocks(updated);
  };

  // Add block at specific index (TC-02)
  const handleAddBlock = (type: BlockType, insertAtIndex?: number) => {
    const id = `block-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    let newBlock: EditorialBlock;

    switch (type) {
      case "text_with_image":
        newBlock = {
          id,
          type: "text_with_image",
          order: 0,
          heading: "NEW EDITORIAL FOCUS",
          bodyText:
            "Enter descriptive boutique prose, detailing architectural elements, artisanal provenance, and seasonal collections.",
          images: [
            {
              id: `img-${Date.now()}`,
              url: "/images/hero/hero-top-right.jpg",
              alt: "Boutique showcase visual",
              caption: "Curated boutique detail",
              aspectRatio: "4:5",
              photographerCredit: "DesignerSale Archive",
            },
          ],
        };
        break;

      case "image_duo":
        newBlock = {
          id,
          type: "image_duo",
          order: 0,
          images: [
            {
              id: `img-duo-1-${Date.now()}`,
              url: "/images/hero/hero-bottom-right.jpg",
              alt: "Visual detail 1",
              caption: "Interior display",
              aspectRatio: "4:5",
            },
            {
              id: `img-duo-2-${Date.now()}`,
              url: "/images/explore/explore-leather.jpg",
              alt: "Visual detail 2",
              caption: "Artisanal leather goods",
              aspectRatio: "4:5",
            },
          ],
        };
        break;

      case "full_bleed_image":
        newBlock = {
          id,
          type: "full_bleed_image",
          order: 0,
          images: [
            {
              id: `img-bleed-${Date.now()}`,
              url: "/images/hero/hero-main.jpg",
              alt: "Full storefront panorama",
              caption: "Heritage facade and street frontage",
              aspectRatio: "16:10",
              photographerCredit: "Elena Roche",
            },
          ],
        };
        break;

      case "pull_quote":
        newBlock = {
          id,
          type: "pull_quote",
          order: 0,
          quote: {
            text: "Australian retail architecture is undergoing a quiet renaissance, prioritizing tactility and intimacy.",
            author: "Elena Rostova",
            role: "Curator",
          },
        };
        break;

      case "designer_roster":
        newBlock = {
          id,
          type: "designer_roster",
          order: 0,
          heading: "CURATED LABELS & MAKERS",
          designers: [
            {
              id: `des-1-${Date.now()}`,
              name: "Christopher Esber",
              discipline: "Tailoring & Eveningwear",
              profileUrl: "#",
            },
            {
              id: `des-2-${Date.now()}`,
              name: "Song for the Mute",
              discipline: "Textile & Drape",
              profileUrl: "#",
            },
            {
              id: `des-3-${Date.now()}`,
              name: "Matteau",
              discipline: "Refined Resortwear",
              profileUrl: "#",
            },
          ],
        };
        break;
    }

    const updated = [...blocks];
    if (insertAtIndex !== undefined && insertAtIndex >= 0) {
      updated.splice(insertAtIndex, 0, newBlock);
    } else {
      updated.push(newBlock);
    }

    onUpdateBlocks(reindexBlocks(updated));
  };

  // Render individual block content
  const renderBlockContent = (
    block: EditorialBlock,
    index: number,
    editable: boolean
  ) => {
    switch (block.type) {
      case "text_with_image":
        return (
          <TextWithImageBlock
            block={block}
            isEditMode={editable}
            onChange={(b) => handleBlockChange(index, b)}
          />
        );
      case "image_duo":
        return (
          <ImageDuoBlock
            block={block}
            isEditMode={editable}
            onChange={(b) => handleBlockChange(index, b)}
          />
        );
      case "full_bleed_image":
        return (
          <FullBleedImageBlock
            block={block}
            isEditMode={editable}
            onChange={(b) => handleBlockChange(index, b)}
          />
        );
      case "pull_quote":
        return (
          <PullQuoteBlock
            block={block}
            isEditMode={editable}
            onChange={(b) => handleBlockChange(index, b)}
          />
        );
      case "designer_roster":
        return (
          <DesignerRosterBlock
            block={block}
            isEditMode={editable}
            onChange={(b) => handleBlockChange(index, b)}
          />
        );
      default:
        return null;
    }
  };

  // Add block insertion toolbar
  const renderAddToolbar = (insertIndex?: number) => (
    <div className="py-2.5 flex flex-wrap items-center justify-center gap-2 border-y border-dashed border-stone-200/80 my-6 opacity-60 hover:opacity-100 transition-opacity">
      <span className="font-editorial-sans text-[8.5px] uppercase tracking-[0.2em] font-semibold text-stone-400 mr-1">
        + Insert Section:
      </span>
      <button
        type="button"
        onClick={() => handleAddBlock("text_with_image", insertIndex)}
        className="px-2 py-0.5 text-[10px] font-editorial-sans uppercase tracking-wider bg-white border border-stone-200 hover:border-stone-400 text-stone-600 rounded transition-colors shadow-2xs"
      >
        Text + Visual
      </button>
      <button
        type="button"
        onClick={() => handleAddBlock("image_duo", insertIndex)}
        className="px-2 py-0.5 text-[10px] font-editorial-sans uppercase tracking-wider bg-white border border-stone-200 hover:border-stone-400 text-stone-600 rounded transition-colors shadow-2xs"
      >
        Image Duo (2 Slots)
      </button>
      <button
        type="button"
        onClick={() => handleAddBlock("full_bleed_image", insertIndex)}
        className="px-2 py-0.5 text-[10px] font-editorial-sans uppercase tracking-wider bg-white border border-stone-200 hover:border-stone-400 text-stone-600 rounded transition-colors shadow-2xs"
      >
        Full-Bleed Visual
      </button>
      <button
        type="button"
        onClick={() => handleAddBlock("pull_quote", insertIndex)}
        className="px-2 py-0.5 text-[10px] font-editorial-sans uppercase tracking-wider bg-white border border-stone-200 hover:border-stone-400 text-stone-600 rounded transition-colors shadow-2xs"
      >
        Pull Quote
      </button>
      <button
        type="button"
        onClick={() => handleAddBlock("designer_roster", insertIndex)}
        className="px-2 py-0.5 text-[10px] font-editorial-sans uppercase tracking-wider bg-white border border-stone-200 hover:border-stone-400 text-stone-600 rounded transition-colors shadow-2xs"
      >
        Designer Roster
      </button>
    </div>
  );

  return (
    <div data-testid="editorial-feed" className="space-y-12">
      {blocks.length === 0 && (
        <div className="py-16 text-center border border-dashed border-stone-300 rounded bg-white p-8">
          <Layers className="w-8 h-8 text-stone-300 mx-auto mb-3" />
          <h4 className="font-editorial-serif text-lg tracking-wide text-stone-800">
            No Editorial Sections
          </h4>
          <p className="text-stone-500 text-xs mt-1 max-w-sm mx-auto">
            This shop profile does not currently have any modular editorial blocks.
          </p>
          {isEditMode && renderAddToolbar(0)}
        </div>
      )}

      {blocks.map((block, index) => (
        <div key={block.id} className="relative group/block py-2">
          {/* Subtle Hover Action Toolbar for Block */}
          {isEditMode && (
            <div className="absolute -top-3 right-2 z-30 flex items-center gap-1 bg-white/95 backdrop-blur-xs border border-stone-200 rounded-full px-2 py-0.5 shadow-sm opacity-0 group-hover/block:opacity-100 transition-opacity text-[10px]">
              <span className="font-mono text-[9px] text-stone-400 font-semibold mr-1">
                #{String(index + 1).padStart(2, "0")}
              </span>
              <button
                type="button"
                data-testid={`move-up-block-${index}`}
                disabled={index === 0}
                onClick={() => handleMoveUp(index)}
                className="p-1 hover:bg-stone-100 rounded-full disabled:opacity-30 transition-colors text-stone-600"
                title="Move block up"
              >
                <ChevronUp className="w-3 h-3" />
              </button>
              <button
                type="button"
                data-testid={`move-down-block-${index}`}
                disabled={index === blocks.length - 1}
                onClick={() => handleMoveDown(index)}
                className="p-1 hover:bg-stone-100 rounded-full disabled:opacity-30 transition-colors text-stone-600"
                title="Move block down"
              >
                <ChevronDown className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={() => handleDuplicate(index)}
                className="p-1 hover:bg-stone-100 rounded-full transition-colors text-stone-600"
                title="Duplicate block"
              >
                <Copy className="w-3 h-3" />
              </button>
              {confirmDeleteId === block.id ? (
                <div className="flex items-center gap-0.5 bg-red-50 px-1 py-0.5 rounded text-[9px] text-red-700">
                  <span>Delete?</span>
                  <button
                    type="button"
                    data-testid={`confirm-delete-${index}`}
                    onClick={() => handleDelete(block.id)}
                    className="p-0.5 hover:bg-red-200 rounded text-red-800"
                  >
                    <Check className="w-2.5 h-2.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDeleteId(null)}
                    className="p-0.5 hover:bg-red-200 rounded text-stone-500"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  data-testid={`delete-block-${index}`}
                  onClick={() => setConfirmDeleteId(block.id)}
                  className="p-1 hover:bg-red-50 hover:text-red-700 rounded-full transition-colors text-stone-400"
                  title="Delete block"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
          )}

          {/* Block Content Container: Clean & Transparent */}
          <div className="relative">
            {renderBlockContent(block, index, isEditMode)}
          </div>

          {/* Insertion toolbar between blocks in edit mode */}
          {isEditMode && renderAddToolbar(index + 1)}
        </div>
      ))}
    </div>
  );
};

