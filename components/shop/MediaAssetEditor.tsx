"use client";

import React, { useRef, useState } from "react";
import { MediaAsset, AspectRatio } from "@/types/shop";
import { Upload, Link as LinkIcon, Trash2, Camera, Loader2, CloudUpload } from "lucide-react";

interface MediaAssetEditorProps {
  label: string;
  asset?: MediaAsset;
  onChange: (asset: MediaAsset) => void;
  onRemove?: () => void;
  allowedRatios?: AspectRatio[];
}

export const MediaAssetEditor: React.FC<MediaAssetEditorProps> = ({
  label,
  asset,
  onChange,
  onRemove,
  allowedRatios = ["4:5", "1:1", "16:10", "auto"],
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const currentAsset: MediaAsset = asset || {
    id: `img-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    url: "",
    alt: "",
    caption: "",
    aspectRatio: allowedRatios[0] || "4:5",
    photographerCredit: "",
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.url) {
        onChange({
          ...currentAsset,
          url: data.url,
          alt: currentAsset.alt || file.name.replace(/\.[^/.]+$/, ""),
        });
        setIsUploading(false);
        return;
      }
    } catch (err) {
      console.warn("Direct upload failed, falling back to base64 reader", err);
    }

    // Fallback reader
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      onChange({
        ...currentAsset,
        url: dataUrl,
        alt: currentAsset.alt || file.name.replace(/\.[^/.]+$/, ""),
      });
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="p-4 bg-white border border-stone-200 rounded-sm space-y-3 text-xs text-stone-800">
      <div className="flex items-center justify-between pb-2 border-b border-stone-100">
        <div className="flex items-center gap-1.5 font-editorial-sans text-[9px] uppercase tracking-[0.2em] font-semibold text-stone-600">
          <Camera className="w-3.5 h-3.5 text-stone-700" />
          <span>{label}</span>
        </div>
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="text-stone-400 hover:text-red-600 transition-colors p-1"
            title="Remove image"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* URL or Upload Input */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-stone-400">
              <LinkIcon className="w-3 h-3" />
            </span>
            <input
              type="text"
              placeholder="Paste image URL (e.g. /images/... or Cloudinary URL)"
              value={currentAsset.url}
              onChange={(e) =>
                onChange({ ...currentAsset, url: e.target.value })
              }
              className="w-full pl-8 pr-2 py-1.5 bg-stone-50 border border-stone-200 rounded text-xs focus:outline-none focus:border-stone-400"
            />
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />

          <button
            type="button"
            disabled={isUploading}
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded text-[11px] font-sans shrink-0 transition-colors shadow-2xs disabled:opacity-50"
            title="Upload directly to Cloudinary (cloud: h8nmncfh)"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin text-white" />
                <span>Uploading...</span>
              </>
            ) : (
              <>
                <CloudUpload className="w-3 h-3 text-cyan-300" />
                <span>Cloudinary Upload</span>
              </>
            )}
          </button>
        </div>

        {/* Quick test broken image button for TC-05 */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() =>
              onChange({
                ...currentAsset,
                url: "https://invalid-broken-domain-archive.com.au/404.jpg",
                alt: "Test broken archive image",
              })
            }
            className="text-[10px] text-stone-400 underline hover:text-stone-700 cursor-pointer"
          >
            Load Broken URL (TC-05 test)
          </button>
        </div>
      </div>

      {/* Alt Text & Caption */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <div>
          <label className="block text-[10px] uppercase tracking-wider text-stone-500 mb-1">
            Alt Text (Accessibility)
          </label>
          <input
            type="text"
            placeholder="Descriptive alt text for screen readers"
            value={currentAsset.alt}
            onChange={(e) =>
              onChange({ ...currentAsset, alt: e.target.value })
            }
            className="w-full px-2.5 py-1 bg-stone-50 border border-stone-200 rounded text-xs focus:outline-none focus:border-stone-400"
          />
        </div>
        <div>
          <label className="block text-[10px] uppercase tracking-wider text-stone-500 mb-1">
            Caption (Optional)
          </label>
          <input
            type="text"
            placeholder="Editorial caption displayed below image"
            value={currentAsset.caption || ""}
            onChange={(e) =>
              onChange({ ...currentAsset, caption: e.target.value })
            }
            className="w-full px-2.5 py-1 bg-stone-50 border border-stone-200 rounded text-xs focus:outline-none focus:border-stone-400"
          />
        </div>
      </div>

      {/* Photographer Credit & Aspect Ratio */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <div>
          <label className="block text-[10px] uppercase tracking-wider text-stone-500 mb-1">
            Photographer Credit
          </label>
          <input
            type="text"
            placeholder="e.g., Elena Roche for DS/"
            value={currentAsset.photographerCredit || ""}
            onChange={(e) =>
              onChange({ ...currentAsset, photographerCredit: e.target.value })
            }
            className="w-full px-2.5 py-1 bg-stone-50 border border-stone-200 rounded text-xs focus:outline-none focus:border-stone-400"
          />
        </div>
        <div>
          <label className="block text-[10px] uppercase tracking-wider text-stone-500 mb-1">
            Aspect Ratio
          </label>
          <select
            value={currentAsset.aspectRatio}
            onChange={(e) =>
              onChange({
                ...currentAsset,
                aspectRatio: e.target.value as AspectRatio,
              })
            }
            className="w-full px-2.5 py-1 bg-stone-50 border border-stone-200 rounded text-xs focus:outline-none focus:border-stone-400"
          >
            {allowedRatios.map((ratio) => (
              <option key={ratio} value={ratio}>
                {ratio === "4:5" && "4:5 (Vertical Editorial)"}
                {ratio === "1:1" && "1:1 (Square Tile)"}
                {ratio === "16:10" && "16:10 (Landscape Banner)"}
                {ratio === "auto" && "Auto (Intrinsic Dimensions)"}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};
