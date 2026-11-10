"use client";

import React, { useState } from "react";
import { SimilarShopPreview } from "@/types/shop";
import { X, Plus, Trash2, Save, Store } from "lucide-react";
import Image from "next/image";

interface SimilarShopsModalProps {
  isOpen: boolean;
  onClose: () => void;
  similarShops: SimilarShopPreview[];
  onSave: (updatedShops: SimilarShopPreview[]) => void;
}

export const SimilarShopsModal: React.FC<SimilarShopsModalProps> = ({
  isOpen,
  onClose,
  similarShops,
  onSave,
}) => {
  const [list, setList] = useState<SimilarShopPreview[]>(
    JSON.parse(JSON.stringify(similarShops))
  );

  if (!isOpen) return null;

  const handleAdd = () => {
    if (list.length >= 6) {
      alert("The sidebar grid supports up to 6 similar shops (2x3 grid).");
      return;
    }
    const fresh: SimilarShopPreview = {
      id: `similar-${Date.now()}`,
      slug: `shop-${Date.now()}`,
      name: "NEW CURATED BOUTIQUE",
      precinct: "Melbourne",
      thumbnailUrl: "/images/hero/hero-bottom-right.jpg",
    };
    setList([...list, fresh]);
  };

  const handleUpdate = (
    index: number,
    field: keyof SimilarShopPreview,
    val: string
  ) => {
    const updated = [...list];
    updated[index] = { ...updated[index], [field]: val };
    setList(updated);
  };

  const handleDelete = (index: number) => {
    setList(list.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    onSave(list);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs select-none">
      <div className="bg-white border border-stone-200 rounded-lg max-w-xl w-full my-8 max-h-[85vh] flex flex-col shadow-2xl text-stone-900">
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 bg-stone-50/50">
          <div>
            <h3 className="font-editorial-serif text-xl tracking-wide uppercase text-stone-900">
              Manage Similar Shops Grid
            </h3>
            <p className="font-editorial-sans text-[9px] uppercase tracking-[0.2em] text-stone-500">
              2x3 Thumbnail Discovery Matrix ({list.length} / 6)
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-stone-400 hover:text-stone-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-4 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-stone-600 font-sans">
              Curate similar boutiques appearing in the sticky sidebar
            </span>
            <button
              type="button"
              disabled={list.length >= 6}
              onClick={handleAdd}
              className="inline-flex items-center gap-1 px-3 py-1 bg-stone-100 hover:bg-stone-200 disabled:opacity-40 text-stone-700 rounded text-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Shop</span>
            </button>
          </div>

          <div className="space-y-3">
            {list.map((item, idx) => (
              <div
                key={item.id || idx}
                className="p-3 bg-stone-50 border border-stone-200 rounded flex items-center gap-3"
              >
                <div className="w-12 h-12 relative bg-stone-200 rounded overflow-hidden shrink-0 border border-stone-300">
                  <Image
                    src={item.thumbnailUrl}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="flex-1 space-y-1">
                  <input
                    type="text"
                    value={item.name}
                    placeholder="Boutique Name"
                    onChange={(e) => handleUpdate(idx, "name", e.target.value)}
                    className="w-full px-2 py-0.5 bg-white border border-stone-200 rounded text-xs font-editorial-serif font-medium"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={item.precinct}
                      placeholder="Precinct (e.g. Fitzroy)"
                      onChange={(e) =>
                        handleUpdate(idx, "precinct", e.target.value)
                      }
                      className="w-full px-2 py-0.5 bg-white border border-stone-200 rounded text-[11px] text-stone-600"
                    />
                    <input
                      type="text"
                      value={item.thumbnailUrl}
                      placeholder="Image URL"
                      onChange={(e) =>
                        handleUpdate(idx, "thumbnailUrl", e.target.value)
                      }
                      className="w-full px-2 py-0.5 bg-white border border-stone-200 rounded text-[11px] text-stone-400"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleDelete(idx)}
                  className="text-stone-400 hover:text-red-600 p-1 transition-colors"
                  title="Remove shop"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}

            {list.length === 0 && (
              <p className="text-center py-6 text-stone-400 italic">
                No similar shops configured.
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-3.5 border-t border-stone-200 bg-stone-50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-editorial-sans uppercase tracking-[0.16em] text-stone-600 hover:text-stone-900 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1C1917] hover:bg-stone-800 text-white rounded text-xs font-editorial-sans uppercase tracking-[0.16em] transition-colors shadow-2xs"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Grid</span>
          </button>
        </div>
      </div>
    </div>
  );
};

