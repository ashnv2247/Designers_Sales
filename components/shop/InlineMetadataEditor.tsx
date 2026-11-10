"use client";

import React, { useState } from "react";
import { ShopProfile, OperatingHours } from "@/types/shop";
import { MediaAssetEditor } from "./MediaAssetEditor";
import { X, Save, Clock, MapPin, Building, Globe } from "lucide-react";

interface InlineMetadataEditorProps {
  isOpen: boolean;
  onClose: () => void;
  shop: ShopProfile;
  onSave: (updated: ShopProfile) => void;
}

export const InlineMetadataEditor: React.FC<InlineMetadataEditorProps> = ({
  isOpen,
  onClose,
  shop,
  onSave,
}) => {
  const [formData, setFormData] = useState<ShopProfile>(JSON.parse(JSON.stringify(shop)));

  if (!isOpen) return null;

  const handleHourChange = (
    dayIndex: number,
    field: keyof OperatingHours,
    value: any
  ) => {
    const updatedHours = [...formData.hours];
    updatedHours[dayIndex] = {
      ...updatedHours[dayIndex],
      [field]: value,
    };
    setFormData({ ...formData, hours: updatedHours });
  };

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs select-none overflow-y-auto">
      <div className="bg-white border border-stone-200 rounded-lg max-w-2xl w-full my-8 max-h-[90vh] flex flex-col shadow-2xl text-stone-900">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 bg-stone-50/50">
          <div>
            <h3 className="font-editorial-serif text-xl tracking-wide uppercase text-stone-900">
              Edit Shop Profile & Metadata
            </h3>
            <p className="font-editorial-sans text-[9px] uppercase tracking-[0.2em] text-stone-500">
              Directory Header, Coordinates & Operating Schedule
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

        {/* Form Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs">
          {/* Section 1: Basic Identity */}
          <div className="space-y-3">
            <h4 className="font-editorial-sans text-[10px] uppercase tracking-[0.2em] font-semibold text-stone-600 flex items-center gap-1.5 border-b border-stone-100 pb-1.5">
              <Building className="w-3.5 h-3.5" />
              <span>Identity & Precinct</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-stone-500 mb-1">
                  Shop Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded font-editorial-serif text-sm focus:outline-none focus:border-stone-500"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-stone-500 mb-1">
                  Precinct (e.g. Fitzroy & Gertrude St)
                </label>
                <input
                  type="text"
                  value={formData.precinct}
                  onChange={(e) =>
                    setFormData({ ...formData, precinct: e.target.value })
                  }
                  className="w-full px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded text-xs focus:outline-none focus:border-stone-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-wider text-stone-500 mb-1">
                Categories (Separated by middle dots · in header)
              </label>
              <input
                type="text"
                placeholder="Comma separated: DESIGNER APPAREL, CERAMICS, ART BOOKS"
                value={formData.categories.join(", ")}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    categories: e.target.value
                      .split(",")
                      .map((c) => c.trim())
                      .filter(Boolean),
                  })
                }
                className="w-full px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded text-xs focus:outline-none focus:border-stone-500"
              />
            </div>
          </div>

          {/* Section 2: Address & Coordinates */}
          <div className="space-y-3">
            <h4 className="font-editorial-sans text-[10px] uppercase tracking-[0.2em] font-semibold text-stone-600 flex items-center gap-1.5 border-b border-stone-100 pb-1.5">
              <MapPin className="w-3.5 h-3.5" />
              <span>Location & Geo Coordinates</span>
            </h4>

            <div>
              <label className="block text-[10px] uppercase tracking-wider text-stone-500 mb-1">
                Full Street Address
              </label>
              <input
                type="text"
                value={formData.address.formatted}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    address: { ...formData.address, formatted: e.target.value },
                  })
                }
                className="w-full px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded text-xs focus:outline-none focus:border-stone-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-stone-500 mb-1">
                  Latitude
                </label>
                <input
                  type="number"
                  step="0.0001"
                  value={formData.coordinates.lat}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      coordinates: {
                        ...formData.coordinates,
                        lat: parseFloat(e.target.value) || 0,
                      },
                    })
                  }
                  className="w-full px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded text-xs focus:outline-none focus:border-stone-500"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-stone-500 mb-1">
                  Longitude
                </label>
                <input
                  type="number"
                  step="0.0001"
                  value={formData.coordinates.lng}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      coordinates: {
                        ...formData.coordinates,
                        lng: parseFloat(e.target.value) || 0,
                      },
                    })
                  }
                  className="w-full px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded text-xs focus:outline-none focus:border-stone-500"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Operating Hours */}
          <div className="space-y-3">
            <h4 className="font-editorial-sans text-[10px] uppercase tracking-[0.2em] font-semibold text-stone-600 flex items-center gap-1.5 border-b border-stone-100 pb-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>Weekly Operating Hours (24H Engine)</span>
            </h4>

            <div className="space-y-1.5 border border-stone-200 rounded p-3 bg-stone-50/40">
              {formData.hours.map((h, idx) => (
                <div
                  key={h.day}
                  className="flex items-center justify-between gap-2 py-1 border-b border-stone-100 last:border-0"
                >
                  <span className="w-12 font-editorial-sans font-semibold text-[11px] text-stone-700">
                    {h.day}
                  </span>

                  <label className="flex items-center gap-1.5 text-[11px] text-stone-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={h.isClosed}
                      onChange={(e) =>
                        handleHourChange(idx, "isClosed", e.target.checked)
                      }
                      className="rounded border-stone-300"
                    />
                    <span>Closed</span>
                  </label>

                  {!h.isClosed ? (
                    <div className="flex items-center gap-1.5">
                      <input
                        type="time"
                        value={h.open}
                        onChange={(e) =>
                          handleHourChange(idx, "open", e.target.value)
                        }
                        className="px-1.5 py-0.5 bg-white border border-stone-200 rounded text-[11px]"
                      />
                      <span className="text-stone-400">–</span>
                      <input
                        type="time"
                        value={h.close}
                        onChange={(e) =>
                          handleHourChange(idx, "close", e.target.value)
                        }
                        className="px-1.5 py-0.5 bg-white border border-stone-200 rounded text-[11px]"
                      />
                    </div>
                  ) : (
                    <span className="text-stone-400 italic text-[11px]">
                      Not open
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: Contact & Social */}
          <div className="space-y-3">
            <h4 className="font-editorial-sans text-[10px] uppercase tracking-[0.2em] font-semibold text-stone-600 flex items-center gap-1.5 border-b border-stone-100 pb-1.5">
              <Globe className="w-3.5 h-3.5" />
              <span>Contact & Social</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-stone-500 mb-1">
                  Website URL
                </label>
                <input
                  type="text"
                  value={formData.contact.websiteUrl || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      contact: {
                        ...formData.contact,
                        websiteUrl: e.target.value,
                      },
                    })
                  }
                  className="w-full px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded text-xs focus:outline-none focus:border-stone-500"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-stone-500 mb-1">
                  Instagram Handle
                </label>
                <input
                  type="text"
                  value={formData.contact.instagramHandle || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      contact: {
                        ...formData.contact,
                        instagramHandle: e.target.value,
                      },
                    })
                  }
                  className="w-full px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded text-xs focus:outline-none focus:border-stone-500"
                />
              </div>
            </div>
          </div>

          {/* Section 5: Hero Banner Media */}
          <div className="space-y-3">
            <h4 className="font-editorial-sans text-[10px] uppercase tracking-[0.2em] font-semibold text-stone-600 border-b border-stone-100 pb-1.5">
              Row 1 Hero Storefront Banner (Top-Right 8 Cols)
            </h4>

            <MediaAssetEditor
              label="Storefront Hero Image"
              asset={formData.heroImage}
              onChange={(hero) => setFormData({ ...formData, heroImage: hero })}
              allowedRatios={["16:10", "auto"]}
            />
          </div>
        </div>

        {/* Footer */}
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
            <span>Apply Changes</span>
          </button>
        </div>
      </div>
    </div>
  );
};

