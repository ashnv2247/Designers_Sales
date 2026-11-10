"use client";

import React, { useRef } from "react";
import { ShopProfile } from "@/types/shop";
import {
  Eye,
  Sliders,
  Download,
  Upload,
  RotateCcw,
  PlayCircle,
  Sparkles,
} from "lucide-react";

interface EditorialToolbarProps {
  isEditMode: boolean;
  onToggleEditMode: () => void;
  shop: ShopProfile;
  onImportShop: (imported: ShopProfile) => void;
  onResetToSeed: () => void;
  onSelectPreset: (presetKey: string) => void;
  onOpenTestSuite: () => void;
}

export const EditorialToolbar: React.FC<EditorialToolbarProps> = ({
  isEditMode,
  onToggleEditMode,
  shop,
  onImportShop,
  onResetToSeed,
  onSelectPreset,
  onOpenTestSuite,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Export JSON handler
  const handleExportJSON = () => {
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(shop, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute(
      "download",
      `ds-shop-${shop.slug || "profile"}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Import JSON handler
  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json && json.name && json.contentBlocks) {
          onImportShop(json as ShopProfile);
          alert(`Successfully imported "${json.name}" profile.`);
        } else {
          alert("Invalid profile JSON: missing name or contentBlocks.");
        }
      } catch (err) {
        alert("Failed to parse JSON file.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div
      data-testid="editorial-toolbar"
      className="sticky top-0 z-40 w-full bg-[#FAF8F5]/90 backdrop-blur-md border-b border-stone-200/80 px-4 py-2.5 sm:px-8 select-none transition-all"
    >
      <div className="max-w-[1280px] mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Left: Mode Switcher (Public Reader vs Studio CMS) */}
        <div className="flex items-center gap-1.5 bg-stone-200/70 p-0.5 rounded-full">
          <button
            type="button"
            data-testid="mode-public"
            onClick={() => isEditMode && onToggleEditMode()}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-editorial-sans uppercase tracking-[0.16em] transition-all ${
              !isEditMode
                ? "bg-white text-stone-900 shadow-2xs font-semibold"
                : "text-stone-600 hover:text-stone-900"
            }`}
          >
            <Eye className="w-3 h-3" />
            <span>Public Reader</span>
          </button>

          <button
            type="button"
            data-testid="mode-cms"
            onClick={() => !isEditMode && onToggleEditMode()}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-editorial-sans uppercase tracking-[0.16em] transition-all ${
              isEditMode
                ? "bg-[#1C1917] text-white shadow-2xs font-semibold"
                : "text-stone-600 hover:text-stone-900"
            }`}
          >
            <Sliders className="w-3 h-3" />
            <span>Studio CMS</span>
          </button>
        </div>

        {/* Center: Preset Selector */}
        <div className="hidden md:flex items-center gap-2 text-stone-500 text-[11px]">
          <span className="font-editorial-sans text-[8.5px] uppercase tracking-[0.2em] font-medium text-stone-400">
            Preset:
          </span>
          <select
            value={shop.slug === "stitch-and-tickle" ? "stitch-and-tickle" : "parlour"}
            onChange={(e) => onSelectPreset(e.target.value)}
            className="bg-transparent border-b border-stone-300 pb-0.5 text-stone-800 text-[11px] font-serif tracking-wide focus:outline-none cursor-pointer"
          >
            <option value="parlour">Parlour Archive (Fitzroy)</option>
            <option value="stitch-and-tickle">Stitch & Tickle (Victoria)</option>
          </select>
        </div>

        {/* Right: Actions (Export, Import, Reset, Test Runner) */}
        <div className="flex items-center gap-2 ml-auto">
          {/* Diagnostic Test Runner Button */}
          <button
            type="button"
            data-testid="btn-open-test-suite"
            onClick={onOpenTestSuite}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/80 rounded text-[10px] font-editorial-sans uppercase tracking-[0.14em] font-medium transition-colors"
            title="Open Diagnostic Test Suite (TC-01 through TC-10)"
          >
            <PlayCircle className="w-3.5 h-3.5 text-emerald-600" />
            <span>Run Tests</span>
          </button>

          {/* Export JSON */}
          <button
            type="button"
            onClick={handleExportJSON}
            className="inline-flex items-center gap-1 px-2 py-1 text-stone-600 hover:text-stone-900 border border-stone-200 hover:border-stone-400 bg-white rounded text-[10px] font-editorial-sans uppercase tracking-[0.14em] transition-colors"
            title="Download profile as JSON"
          >
            <Download className="w-3 h-3" />
            <span className="hidden sm:inline">Export</span>
          </button>

          {/* Import JSON */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImportFile}
            accept=".json"
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1 px-2 py-1 text-stone-600 hover:text-stone-900 border border-stone-200 hover:border-stone-400 bg-white rounded text-[10px] font-editorial-sans uppercase tracking-[0.14em] transition-colors"
            title="Import profile JSON"
          >
            <Upload className="w-3 h-3" />
            <span className="hidden sm:inline">Import</span>
          </button>

          {/* Reset to Seed */}
          <button
            type="button"
            onClick={() => {
              if (
                confirm(
                  "Reset profile to default editorial seed? Any unsaved edits will be discarded."
                )
              ) {
                onResetToSeed();
              }
            }}
            className="inline-flex items-center gap-1 px-2 py-1 text-stone-500 hover:text-stone-800 border border-stone-200 hover:border-stone-300 bg-stone-50 rounded text-[10px] font-editorial-sans uppercase tracking-[0.14em] transition-colors"
            title="Reset to default seed"
          >
            <RotateCcw className="w-3 h-3" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>
    </div>
  );
};

