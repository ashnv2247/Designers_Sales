"use client";

import React from "react";
import { EditorialBlock } from "@/types/shop";
import { Plus, Trash2, Tag, ArrowUpRight } from "lucide-react";

interface DesignerRosterBlockProps {
  block: EditorialBlock;
  isEditMode?: boolean;
  onChange: (updatedBlock: EditorialBlock) => void;
}

export const DesignerRosterBlock: React.FC<DesignerRosterBlockProps> = ({
  block,
  isEditMode = false,
  onChange,
}) => {
  const designers = block.designers || [];

  const handleAddDesigner = () => {
    const freshDesigner = {
      id: `des-${Date.now()}`,
      name: "New Australian Designer",
      discipline: "Contemporary Apparel",
      profileUrl: "https://designersale.com.au/designers",
    };
    onChange({
      ...block,
      designers: [...designers, freshDesigner],
    });
  };

  const handleUpdateDesigner = (
    index: number,
    field: string,
    value: string
  ) => {
    const updated = [...designers];
    updated[index] = {
      ...updated[index],
      [field]: value,
    };
    onChange({
      ...block,
      designers: updated,
    });
  };

  const handleDeleteDesigner = (index: number) => {
    const updated = designers.filter((_, i) => i !== index);
    onChange({
      ...block,
      designers: updated,
    });
  };

  return (
    <div className="space-y-4 pt-2">
      <div className="flex items-center justify-between pb-1 border-b border-stone-200/60">
        {isEditMode ? (
          <input
            type="text"
            value={block.heading || "REPRESENTED LABELS & ARCHIVES"}
            onChange={(e) => onChange({ ...block, heading: e.target.value })}
            className="font-editorial-sans text-xs md:text-sm font-semibold uppercase tracking-[0.25em] text-stone-600 bg-transparent border-none p-0 focus:outline-none w-full max-w-md"
          />
        ) : (
          <h3 className="font-editorial-sans text-xs md:text-sm font-semibold uppercase tracking-[0.25em] text-stone-600 inline-block">
            {block.heading || "REPRESENTED LABELS & ARCHIVES"}
          </h3>
        )}

        {isEditMode && (
          <button
            type="button"
            onClick={handleAddDesigner}
            className="inline-flex items-center gap-1 px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded text-[10px] font-editorial-sans uppercase tracking-wider transition-colors"
          >
            <Plus className="w-3 h-3" />
            <span>Add Designer</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
        {designers.map((designer, idx) => (
          <div
            key={designer.id || idx}
            className="p-3.5 bg-stone-50/70 border border-stone-200/60 hover:border-stone-400/80 transition-all group flex flex-col justify-between relative"
          >
            {isEditMode ? (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-1">
                  <input
                    type="text"
                    value={designer.name}
                    onChange={(e) => handleUpdateDesigner(idx, "name", e.target.value)}
                    placeholder="Designer Name"
                    className="font-editorial-serif text-sm md:text-base font-normal tracking-wide text-stone-900 bg-transparent border-b border-dashed border-stone-200 focus:border-stone-500 w-full focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleDeleteDesigner(idx)}
                    className="text-stone-300 hover:text-red-600 p-0.5 transition-colors"
                    title="Remove"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
                <input
                  type="text"
                  value={designer.discipline}
                  onChange={(e) => handleUpdateDesigner(idx, "discipline", e.target.value)}
                  placeholder="Discipline / Focus"
                  className="font-editorial-sans text-[9px] uppercase tracking-[0.16em] text-stone-500 bg-transparent border-b border-dashed border-stone-200 focus:border-stone-500 w-full focus:outline-none"
                />
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between gap-2">
                  <span className="font-editorial-serif text-sm md:text-base font-normal tracking-wide text-stone-900 group-hover:text-stone-600 transition-colors">
                    {designer.name}
                  </span>
                  {designer.profileUrl && (
                    <ArrowUpRight className="w-3 h-3 text-stone-300 group-hover:text-stone-700 transition-colors shrink-0" />
                  )}
                </div>
                <span className="font-editorial-sans text-[9px] uppercase tracking-[0.16em] text-stone-500 mt-2 block">
                  {designer.discipline}
                </span>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

