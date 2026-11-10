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

  if (isEditMode) {
    return (
      <div className="space-y-4 p-4 bg-white border border-stone-200 rounded-sm">
        <div className="flex items-center justify-between pb-2 border-b border-stone-100">
          <div className="flex items-center gap-1.5 font-editorial-sans text-[10px] uppercase tracking-[0.2em] font-semibold text-stone-600">
            <Tag className="w-3.5 h-3.5" />
            <span>Designer Roster & Labels ({designers.length})</span>
          </div>
          <button
            type="button"
            onClick={handleAddDesigner}
            className="inline-flex items-center gap-1 px-2 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded text-[10px] font-sans tracking-wide transition-colors"
          >
            <Plus className="w-3 h-3" />
            <span>Add Designer</span>
          </button>
        </div>

        <div>
          <label className="block text-[10px] uppercase tracking-wider text-stone-500 mb-1">
            Section Heading
          </label>
          <input
            type="text"
            value={block.heading || "REPRESENTED LABELS & ARCHIVES"}
            onChange={(e) => onChange({ ...block, heading: e.target.value })}
            className="w-full px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded text-xs focus:outline-none focus:border-stone-400"
          />
        </div>

        <div className="space-y-2.5">
          {designers.map((designer, idx) => (
            <div
              key={designer.id || idx}
              className="p-3 bg-stone-50 border border-stone-200/80 rounded flex flex-col sm:flex-row items-stretch sm:items-center gap-2"
            >
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Designer / Label Name"
                  value={designer.name}
                  onChange={(e) =>
                    handleUpdateDesigner(idx, "name", e.target.value)
                  }
                  className="w-full px-2 py-1 bg-white border border-stone-200 rounded text-xs font-medium text-stone-900"
                />
              </div>
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Discipline / Focus (e.g. Tailoring)"
                  value={designer.discipline}
                  onChange={(e) =>
                    handleUpdateDesigner(idx, "discipline", e.target.value)
                  }
                  className="w-full px-2 py-1 bg-white border border-stone-200 rounded text-xs text-stone-600"
                />
              </div>
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="URL link"
                  value={designer.profileUrl || ""}
                  onChange={(e) =>
                    handleUpdateDesigner(idx, "profileUrl", e.target.value)
                  }
                  className="w-full px-2 py-1 bg-white border border-stone-200 rounded text-xs text-stone-400"
                />
              </div>
              <button
                type="button"
                onClick={() => handleDeleteDesigner(idx)}
                className="text-stone-400 hover:text-red-600 p-1 self-end sm:self-center transition-colors"
                title="Remove designer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}

          {designers.length === 0 && (
            <p className="text-[11px] text-stone-400 italic text-center py-2">
              No designers added yet. Click &ldquo;Add Designer&rdquo; above.
            </p>
          )}
        </div>
      </div>
    );
  }

  // Public Render Mode
  return (
    <div className="space-y-4 pt-2">
      <h3 className="font-editorial-sans text-xs md:text-sm font-semibold uppercase tracking-[0.25em] text-stone-600 pb-1 border-b border-stone-200/60 inline-block">
        {block.heading || "REPRESENTED LABELS & ARCHIVES"}
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
        {designers.map((designer, idx) => (
          <div
            key={designer.id || idx}
            className="p-3.5 bg-stone-50/70 border border-stone-200/60 hover:border-stone-400/80 transition-all group flex flex-col justify-between"
          >
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
          </div>
        ))}
      </div>
    </div>
  );
};

