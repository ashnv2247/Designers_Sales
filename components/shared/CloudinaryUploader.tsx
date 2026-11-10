"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { CloudUpload, Link as LinkIcon, CheckCircle2, Loader2, ImageOff } from "lucide-react";

interface CloudinaryUploaderProps {
  label?: string;
  currentImageUrl?: string;
  onUploadSuccess: (url: string) => void;
  aspectRatio?: string;
}

export const CloudinaryUploader: React.FC<CloudinaryUploaderProps> = ({
  label = "Upload Image (Cloudinary)",
  currentImageUrl = "",
  onUploadSuccess,
  aspectRatio = "aspect-[4/3]",
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [urlInput, setUrlInput] = useState(currentImageUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    setErrorMsg(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Failed to upload to Cloudinary");
      }

      setUrlInput(data.url);
      onUploadSuccess(data.url);
    } catch (err: any) {
      console.error("Cloudinary upload failed:", err);
      setErrorMsg(err.message || "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const handleManualUrlApply = () => {
    if (urlInput.trim()) {
      onUploadSuccess(urlInput.trim());
    }
  };

  return (
    <div className="space-y-3 p-3.5 bg-stone-50 border border-stone-200 rounded-sm text-xs text-stone-800">
      <div className="flex items-center justify-between pb-1.5 border-b border-stone-200/60">
        <span className="font-editorial-sans text-[8.5px] uppercase tracking-[0.2em] font-semibold text-stone-600 flex items-center gap-1.5">
          <CloudUpload className="w-3.5 h-3.5 text-stone-700" />
          <span>{label}</span>
        </span>
        <span className="font-mono text-[8px] text-stone-400">
          Cloud: h8nmncfh
        </span>
      </div>

      {/* Image Preview */}
      {currentImageUrl ? (
        <div className={`relative ${aspectRatio} w-full bg-stone-200 border border-stone-300 overflow-hidden`}>
          <Image
            src={currentImageUrl}
            alt="Uploaded preview"
            fill
            className="object-cover"
          />
          <div className="absolute top-2 right-2 bg-emerald-950/80 text-emerald-300 backdrop-blur-xs text-[8px] uppercase tracking-wider font-mono px-2 py-0.5 rounded flex items-center gap-1">
            <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
            <span>Active Asset</span>
          </div>
        </div>
      ) : (
        <div className={`flex flex-col items-center justify-center p-4 bg-white border border-dashed border-stone-300 ${aspectRatio}`}>
          <ImageOff className="w-6 h-6 text-stone-300 mb-1" />
          <span className="text-[10px] text-stone-400">No image assigned yet</span>
        </div>
      )}

      {/* Direct File Upload Button */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileUpload(file);
        }}
        accept="image/*"
        className="hidden"
      />

      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={isUploading}
          onClick={() => fileInputRef.current?.click()}
          className="flex-1 py-1.5 px-3 bg-[#1C1917] hover:bg-stone-800 disabled:opacity-50 text-white text-[10px] font-editorial-sans uppercase tracking-[0.16em] font-medium transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
        >
          {isUploading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Uploading to Cloudinary...</span>
            </>
          ) : (
            <>
              <CloudUpload className="w-3.5 h-3.5" />
              <span>Browse & Upload (Cloudinary)</span>
            </>
          )}
        </button>
      </div>

      {/* Or Paste Direct Image URL */}
      <div className="flex items-center gap-2 pt-1 border-t border-stone-200/60">
        <div className="relative flex-1">
          <LinkIcon className="w-3 h-3 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Or paste Cloudinary / direct image URL..."
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            className="w-full pl-7 pr-2 py-1 bg-white border border-stone-200 text-xs focus:outline-none focus:border-stone-500 font-mono text-[10px]"
          />
        </div>
        <button
          type="button"
          onClick={handleManualUrlApply}
          className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 border border-stone-300 text-stone-700 text-[10px] font-editorial-sans uppercase tracking-wider shrink-0 transition-colors"
        >
          Apply
        </button>
      </div>

      {errorMsg && (
        <p className="text-[10px] text-red-600 bg-red-50 p-1.5 border border-red-200">
          Upload Error: {errorMsg}
        </p>
      )}
    </div>
  );
};

