"use client";

import React, { useState } from "react";
import Image from "next/image";
import { CloudinaryUploader } from "@/components/shared/CloudinaryUploader";
import { AspectRatio } from "@/types/shop";
import { X, Check, Camera, Image as ImageIcon } from "lucide-react";

interface ImageSwapModalProps {
  isOpen: boolean;
  title?: string;
  currentUrl: string;
  caption?: string;
  aspectRatio?: AspectRatio;
  onSave: (data: { url: string; caption?: string; aspectRatio?: AspectRatio }) => void;
  onClose: () => void;
}

export const ImageSwapModal: React.FC<ImageSwapModalProps> = ({
  isOpen,
  title = "Edit Photo (Cloudinary)",
  currentUrl,
  caption = "",
  aspectRatio = "4:5",
  onSave,
  onClose,
}) => {
  const [url, setUrl] = useState(currentUrl);
  const [photoCaption, setPhotoCaption] = useState(caption);
  const [ratio, setRatio] = useState<AspectRatio>(aspectRatio);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs select-none">
      <div className="bg-white border border-stone-200 rounded-lg max-w-lg w-full shadow-2xl flex flex-col overflow-hidden text-stone-900">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-stone-200 bg-stone-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Camera className="w-4 h-4 text-stone-700" />
            <h3 className="font-editorial-serif text-lg font-medium">{title}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-stone-400 hover:text-stone-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 text-xs">
          {/* Cloudinary Uploader Component */}
          <CloudinaryUploader
            label="Upload Image via Cloudinary"
            currentImageUrl={url}
            onUploadSuccess={(newUrl) => setUrl(newUrl)}
            aspectRatio="aspect-[16/10]"
          />

          {/* Caption */}
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-stone-500 font-semibold mb-1">
              Photo Caption (Optional)
            </label>
            <input
              type="text"
              value={photoCaption}
              onChange={(e) => setPhotoCaption(e.target.value)}
              placeholder="e.g. 19th-century Victorian bluestone facade"
              className="w-full px-3 py-1.5 bg-stone-50 border border-stone-200 rounded text-xs focus:outline-none focus:border-stone-500"
            />
          </div>

          {/* Aspect Ratio */}
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-stone-500 font-semibold mb-1">
              Aspect Ratio
            </label>
            <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-editorial-sans uppercase tracking-wider">
              {(["4:5", "1:1", "16:10", "auto"] as AspectRatio[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRatio(r)}
                  className={`py-1.5 px-2 rounded border transition-colors ${
                    ratio === r
                      ? "bg-stone-900 text-white border-stone-900 font-bold"
                      : "bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-stone-200 bg-stone-50 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 text-xs uppercase tracking-wider text-stone-600 hover:text-stone-900"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onSave({ url, caption: photoCaption, aspectRatio: ratio });
              onClose();
            }}
            className="px-4 py-1.5 bg-[#1C1917] hover:bg-stone-800 text-white rounded text-xs font-editorial-sans uppercase tracking-[0.16em] inline-flex items-center gap-1.5 shadow-2xs"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Apply to Page</span>
          </button>
        </div>
      </div>
    </div>
  );
};

