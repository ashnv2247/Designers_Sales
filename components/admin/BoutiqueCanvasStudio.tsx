"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Boutique } from "@/data/boutiques";
import { ShopProfile, EditorialBlock, BlockType, MediaAsset } from "@/types/shop";
import { SEED_SHOP_PROFILE, PRESET_STITCH_AND_TICKLE } from "@/data/seedShop";
import { PrecinctMap } from "@/components/shop/PrecinctMap";
import { DirectorySidebar } from "@/components/shop/DirectorySidebar";
import { EditorialFeed } from "@/components/shop/EditorialFeed";
import { InlineMetadataEditor } from "@/components/shop/InlineMetadataEditor";
import { SimilarShopsModal } from "@/components/shop/SimilarShopsModal";
import { ProductCatalogSection } from "@/components/products/ProductCatalogSection";
import { PRODUCTS_SEED_DATA } from "@/data/products";
import { CloudinaryUploader } from "@/components/shared/CloudinaryUploader";
import {
  Monitor,
  Tablet,
  Smartphone,
  Save,
  RotateCcw,
  Plus,
  Trash2,
  Sliders,
  CheckCircle2,
  MapPin,
  Clock,
  Globe,
  Tag,
  Sparkles,
  Eye,
  Edit3,
  Layers,
  ChevronUp,
  ChevronDown,
  Copy,
  ExternalLink,
  Camera,
} from "lucide-react";

interface BoutiqueCanvasStudioProps {
  boutiques: Boutique[];
  onSave: (boutique: Boutique) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onRefresh: () => Promise<void>;
}

export const BoutiqueCanvasStudio: React.FC<BoutiqueCanvasStudioProps> = ({
  boutiques,
  onSave,
  onDelete,
  onRefresh,
}) => {
  const [selectedBoutiqueId, setSelectedBoutiqueId] = useState<string>(
    boutiques[0]?.id || "aesop-fitzroy"
  );
  const [viewport, setViewport] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [isEditMode, setIsEditMode] = useState<boolean>(true);
  const [activeInspectorTab, setActiveInspectorTab] = useState<"metadata" | "sections" | "visuals">("sections");
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  // Modals for deep editing
  const [isMetadataOpen, setIsMetadataOpen] = useState(false);
  const [isSimilarShopsOpen, setIsSimilarShopsOpen] = useState(false);
  const [isHeroModalOpen, setIsHeroModalOpen] = useState(false);

  // Active ShopProfile backing the canvas
  const [shop, setShop] = useState<ShopProfile>(SEED_SHOP_PROFILE);

  // Synchronize selected boutique into a full ShopProfile
  useEffect(() => {
    const selected = boutiques.find((b) => b.id === selectedBoutiqueId);
    if (!selected) return;

    // Check if custom shop profile exists in localStorage for this boutique
    const storageKey = `ds_shop_profile_${selected.id}`;
    let customProfile: ShopProfile | null = null;
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        customProfile = JSON.parse(stored);
      }
    } catch (e) {
      // ignore
    }

    if (customProfile && customProfile.contentBlocks && customProfile.contentBlocks.length > 0) {
      setShop(customProfile);
      return;
    }

    // Build rich ShopProfile from selected boutique data
    const isStitch = selected.id === "stitch-and-tickle";
    const baseProfile = isStitch ? PRESET_STITCH_AND_TICKLE : SEED_SHOP_PROFILE;

    const populatedShop: ShopProfile = {
      ...baseProfile,
      id: selected.id,
      slug: selected.id,
      name: selected.name.toUpperCase(),
      subtitle: selected.tagline || baseProfile.subtitle,
      city: selected.city as any,
      precinct: `${selected.neighborhood} & ${selected.city}`,
      categories: [
        selected.category.toUpperCase(),
        "AUSTRALIAN DESIGN",
        selected.priceTier,
      ],
      address: {
        street: selected.address.split(",")[0] || selected.address,
        suburb: selected.neighborhood,
        state: selected.city === "Melbourne" ? "VIC" : selected.city === "Sydney" ? "NSW" : "WA",
        postcode: selected.city === "Melbourne" ? "3065" : "2000",
        formatted: selected.address,
      },
      heroImage: {
        ...baseProfile.heroImage,
        url: selected.image || baseProfile.heroImage.url,
        alt: `${selected.name} architectural storefront`,
        caption: `${selected.neighborhood} streetscape and architectural facade`,
      },
      contentBlocks: [
        {
          id: `block-essay-${selected.id}`,
          type: "text_with_image",
          order: 0,
          heading: "WHAT WE LOVE & ARCHITECTURAL ETHOS",
          bodyText:
            selected.description ||
            baseProfile.contentBlocks[0]?.bodyText ||
            "A sanctuary of contemporary Australian design and refined craftsmanship.",
          images: [
            {
              id: `img-essay-${selected.id}`,
              url: selected.image || "/images/generated/atelier-showroom.jpg",
              alt: `${selected.name} interior`,
              caption: "Tactile joinery and natural light in the main showroom",
              aspectRatio: "4:5",
              photographerCredit: "Elena Roche for DS/",
            },
          ],
        },
        {
          id: `block-quote-${selected.id}`,
          type: "pull_quote",
          order: 1,
          quote: {
            text:
              selected.curatorNote ||
              "A deliberate antidote to digital consumption — a physical sanctuary where texture and the hand of the maker dictate discovery.",
            author: "CURATORIAL SELECTION",
            role: `${selected.neighborhood.toUpperCase()} DIRECTORY ARCHIVE`,
          },
        },
        {
          id: `block-duo-${selected.id}`,
          type: "image_duo",
          order: 2,
          images: [
            {
              id: `duo-1-${selected.id}`,
              url: "/images/discoveries/keep.jpg",
              alt: "Ceramic vessels and tactile details",
              caption: "Handcrafted stoneware from local ceramic studios",
              aspectRatio: "4:5",
            },
            {
              id: `duo-2-${selected.id}`,
              url: "/images/explore/explore-handbag.jpg",
              alt: "Leather goods and archival accessories",
              caption: "Vegetable-tanned leather goods from independent ateliers",
              aspectRatio: "4:5",
            },
          ],
        },
        {
          id: `block-roster-${selected.id}`,
          type: "designer_roster",
          order: 3,
          heading: "CURATED DESIGNERS & EDITIONS",
          bodyText: "Representing independent Australian craft and quiet luxury.",
          designers: (selected.tags && selected.tags.length > 0
            ? selected.tags
            : ["Christopher Esber", "Song for the Mute", "Matteau", "Bassike"]
          ).map((t, idx) => ({
            id: `des-${idx}`,
            name: t,
            discipline: "Designer Ready-to-Wear & Objects",
            profileUrl: "#",
          })),
        },
      ],
    };

    setShop(populatedShop);
  }, [selectedBoutiqueId, boutiques]);

  // Persist changes to local state & storage
  const handleUpdateShop = (updated: ShopProfile) => {
    setShop(updated);
    try {
      localStorage.setItem(`ds_shop_profile_${updated.id}`, JSON.stringify(updated));
    } catch (e) {
      // ignore
    }
  };

  // Add a new section to the live canvas
  const handleAddSection = (type: BlockType) => {
    const newBlockId = `block-${Date.now()}`;
    let newBlock: EditorialBlock;

    switch (type) {
      case "text_with_image":
        newBlock = {
          id: newBlockId,
          type: "text_with_image",
          order: shop.contentBlocks.length,
          heading: "ARCHITECTURAL DETAILS & MATERIALITY",
          bodyText:
            "Custom warm travertine counters and unlacquered brass joinery create a serene spatial cadence throughout the boutique.",
          images: [
            {
              id: `img-${Date.now()}`,
              url: "/images/generated/atelier-showroom.jpg",
              alt: "Boutique interior view",
              caption: "Sunlit consultation plinth",
              aspectRatio: "4:5",
            },
          ],
        };
        break;

      case "image_duo":
        newBlock = {
          id: newBlockId,
          type: "image_duo",
          order: shop.contentBlocks.length,
          images: [
            {
              id: `duo-a-${Date.now()}`,
              url: "/images/explore/explore-hat.jpg",
              alt: "Artisan millinery piece",
              caption: "Woven toquilla straw hat on linen",
              aspectRatio: "4:5",
            },
            {
              id: `duo-b-${Date.now()}`,
              url: "/images/discoveries/stitch-and-tickle.jpg",
              alt: "Boutique facade window",
              caption: "Natural daylight through boutique windows",
              aspectRatio: "4:5",
            },
          ],
        };
        break;

      case "full_bleed_image":
        newBlock = {
          id: newBlockId,
          type: "full_bleed_image",
          order: shop.contentBlocks.length,
          images: [
            {
              id: `fb-${Date.now()}`,
              url: "/images/generated/hero-boutique.jpg",
              alt: "Panoramic interior architecture",
              caption: "Full spatial panorama of the historic gallery space",
              aspectRatio: "16:10",
              photographerCredit: "Elena Roche",
            },
          ],
        };
        break;

      case "pull_quote":
        newBlock = {
          id: newBlockId,
          type: "pull_quote",
          order: shop.contentBlocks.length,
          quote: {
            text: "The space was designed to encourage quiet contemplation rather than rapid commercial turnover.",
            author: "PRINCIPAL ARCHITECT",
            role: "STUDIO ARCHIVE",
          },
        };
        break;

      case "designer_roster":
        newBlock = {
          id: newBlockId,
          type: "designer_roster",
          order: shop.contentBlocks.length,
          heading: "NEW SEASON EDITIONS",
          bodyText: "Limited run pieces and exclusive showroom commissions.",
          designers: [
            { id: "d1", name: "Albus Lumen", discipline: "Resort Tailoring" },
            { id: "d2", name: "Dion Lee", discipline: "Architectural Cutwork" },
          ],
        };
        break;
    }

    const updatedBlocks = [...shop.contentBlocks, newBlock].map((b, idx) => ({
      ...b,
      order: idx,
    }));

    handleUpdateShop({ ...shop, contentBlocks: updatedBlocks });
  };

  // Reorder sections
  const handleMoveBlock = (index: number, direction: "up" | "down") => {
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= shop.contentBlocks.length) return;

    const updated = [...shop.contentBlocks];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;

    handleUpdateShop({
      ...shop,
      contentBlocks: updated.map((b, idx) => ({ ...b, order: idx })),
    });
  };

  // Delete section
  const handleDeleteBlock = (id: string) => {
    const updated = shop.contentBlocks
      .filter((b) => b.id !== id)
      .map((b, idx) => ({ ...b, order: idx }));
    handleUpdateShop({ ...shop, contentBlocks: updated });
  };

  // Duplicate section
  const handleDuplicateBlock = (index: number) => {
    const target = shop.contentBlocks[index];
    const copy: EditorialBlock = {
      ...JSON.parse(JSON.stringify(target)),
      id: `block-${Date.now()}`,
      order: index + 1,
    };
    const updated = [...shop.contentBlocks];
    updated.splice(index + 1, 0, copy);
    handleUpdateShop({
      ...shop,
      contentBlocks: updated.map((b, idx) => ({ ...b, order: idx })),
    });
  };

  // Save changes to backend directory
  const handleSaveAll = async () => {
    setSaveStatus("Saving...");
    try {
      // Find matching boutique and update its base attributes
      const matchingBoutique = boutiques.find((b) => b.id === shop.id) || {
        id: shop.id,
        name: shop.name,
        tagline: shop.subtitle || "",
        city: "Melbourne" as Boutique["city"],
        neighborhood: shop.precinct.split("&")[0].trim(),
        category: "Fashion" as Boutique["category"],
        address: shop.address.formatted,
        hours: "Mon–Sat 10am–6pm",
        priceTier: "$$$" as Boutique["priceTier"],
        description: shop.contentBlocks[0]?.bodyText || "",
        curatorNote: shop.contentBlocks.find((b) => b.type === "pull_quote")?.quote?.text || "",
        image: shop.heroImage.url,
        featured: true,
        tags: shop.contentBlocks.find((b) => b.type === "designer_roster")?.designers?.map((d) => d.name) || [],
      };

      await onSave({
        ...matchingBoutique,
        name: shop.name,
        city: (shop.city === "Hobart" ? "Melbourne" : shop.city) as Boutique["city"],
        tagline: shop.subtitle || "",
        image: shop.heroImage.url,
        description: shop.contentBlocks[0]?.bodyText || matchingBoutique.description,
        curatorNote:
          shop.contentBlocks.find((b) => b.type === "pull_quote")?.quote?.text ||
          matchingBoutique.curatorNote,
      });

      setSaveStatus("Saved to directory!");
      setTimeout(() => setSaveStatus(null), 2500);
    } catch (e) {
      setSaveStatus("Error saving.");
    }
  };

  // Reset to seed
  const handleReset = () => {
    localStorage.removeItem(`ds_shop_profile_${shop.id}`);
    setShop(SEED_SHOP_PROFILE);
    setSaveStatus("Reset to seed.");
    setTimeout(() => setSaveStatus(null), 1500);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-68px)] bg-stone-100 overflow-hidden select-none">
      {/* -------------------------------------------------------------------- */}
      {/* TOP STUDIO TOOLBAR */}
      {/* -------------------------------------------------------------------- */}
      <header className="h-14 bg-white border-b border-stone-200 px-4 sm:px-6 flex items-center justify-between gap-4 shrink-0 z-20">
        {/* Boutique Selector */}
        <div className="flex items-center gap-3">
          <label className="text-[10px] font-editorial-sans uppercase tracking-[0.2em] text-stone-500 font-semibold shrink-0 hidden sm:block">
            Shop Canvas:
          </label>
          <select
            value={selectedBoutiqueId}
            onChange={(e) => setSelectedBoutiqueId(e.target.value)}
            className="bg-stone-50 border border-stone-300 py-1.5 pl-3 pr-8 rounded text-xs font-editorial-serif text-stone-900 font-medium focus:outline-none focus:border-stone-500"
          >
            {boutiques.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name} ({b.city})
              </option>
            ))}
          </select>
        </div>

        {/* Center: Device Viewport Switcher & Edit Mode Toggle */}
        <div className="flex items-center gap-2">
          {/* Edit / Preview Toggle */}
          <button
            type="button"
            onClick={() => setIsEditMode(!isEditMode)}
            className={`px-3 py-1.5 rounded text-[11px] font-editorial-sans uppercase tracking-wider flex items-center gap-1.5 transition-all border ${
              isEditMode
                ? "bg-amber-100/80 border-amber-300 text-amber-900 font-bold"
                : "bg-white border-stone-200 text-stone-600 hover:text-stone-900"
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>{isEditMode ? "Studio Edit Mode ON" : "Preview Clean Page"}</span>
          </button>

          {/* Device Viewport Switcher */}
          <div className="flex items-center bg-stone-100 border border-stone-200 rounded p-0.5">
            <button
              type="button"
              onClick={() => setViewport("desktop")}
              className={`px-2.5 py-1 rounded text-[11px] font-editorial-sans uppercase tracking-wider flex items-center gap-1 transition-all ${
                viewport === "desktop" ? "bg-white text-stone-900 font-semibold shadow-2xs" : "text-stone-500 hover:text-stone-900"
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span className="hidden md:inline">1280px</span>
            </button>
            <button
              type="button"
              onClick={() => setViewport("tablet")}
              className={`px-2.5 py-1 rounded text-[11px] font-editorial-sans uppercase tracking-wider flex items-center gap-1 transition-all ${
                viewport === "tablet" ? "bg-white text-stone-900 font-semibold shadow-2xs" : "text-stone-500 hover:text-stone-900"
              }`}
            >
              <Tablet className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Tablet</span>
            </button>
            <button
              type="button"
              onClick={() => setViewport("mobile")}
              className={`px-2.5 py-1 rounded text-[11px] font-editorial-sans uppercase tracking-wider flex items-center gap-1 transition-all ${
                viewport === "mobile" ? "bg-white text-stone-900 font-semibold shadow-2xs" : "text-stone-500 hover:text-stone-900"
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Mobile</span>
            </button>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {saveStatus && (
            <span className="text-[11px] font-mono text-emerald-800 font-medium px-2 py-1 bg-emerald-50 border border-emerald-200 rounded animate-fade-in hidden sm:inline-block">
              {saveStatus}
            </span>
          )}

          <button
            type="button"
            onClick={handleReset}
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded transition-colors"
            title="Reset to seed"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <Link
            href="/shop"
            target="_blank"
            className="px-2.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-300 rounded text-xs font-editorial-sans uppercase tracking-wider inline-flex items-center gap-1 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5 text-stone-600" />
            <span className="hidden lg:inline">View Live Page</span>
          </Link>

          <button
            type="button"
            onClick={handleSaveAll}
            className="px-4 py-1.5 bg-[#1C1917] hover:bg-stone-800 text-white rounded text-xs font-editorial-sans uppercase tracking-[0.16em] inline-flex items-center gap-1.5 shadow-2xs transition-colors"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Canvas</span>
          </button>
        </div>
      </header>

      {/* -------------------------------------------------------------------- */}
      {/* SPLIT WORKSPACE: LEFT INSPECTOR + RIGHT LIVE CANVAS */}
      {/* -------------------------------------------------------------------- */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT INSPECTOR (Width 390px) */}
        <aside className="w-[380px] lg:w-[410px] bg-white border-r border-stone-200 flex flex-col shrink-0 overflow-hidden z-10 shadow-xs">
          {/* Tab Navigation */}
          <div className="flex items-center border-b border-stone-200 bg-stone-50/70 px-4 pt-2 text-xs shrink-0">
            <button
              type="button"
              onClick={() => setActiveInspectorTab("sections")}
              className={`pb-2.5 px-2 font-editorial-sans uppercase tracking-[0.16em] text-[10px] border-b-2 transition-all flex items-center gap-1 ${
                activeInspectorTab === "sections"
                  ? "border-stone-900 text-stone-900 font-bold"
                  : "border-transparent text-stone-500 hover:text-stone-800"
              }`}
            >
              <Layers className="w-3 h-3" />
              <span>1. Sections & Layout</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveInspectorTab("metadata")}
              className={`pb-2.5 px-2 font-editorial-sans uppercase tracking-[0.16em] text-[10px] border-b-2 transition-all ${
                activeInspectorTab === "metadata"
                  ? "border-stone-900 text-stone-900 font-bold"
                  : "border-transparent text-stone-500 hover:text-stone-800"
              }`}
            >
              2. Shop Details
            </button>
            <button
              type="button"
              onClick={() => setActiveInspectorTab("visuals")}
              className={`pb-2.5 px-2 font-editorial-sans uppercase tracking-[0.16em] text-[10px] border-b-2 transition-all flex items-center gap-1 ${
                activeInspectorTab === "visuals"
                  ? "border-stone-900 text-stone-900 font-bold"
                  : "border-transparent text-stone-500 hover:text-stone-800"
              }`}
            >
              <Camera className="w-3 h-3" />
              <span>3. Hero Photo</span>
            </button>
          </div>

          {/* Inspector Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs text-stone-800">
            {/* TAB 1: SECTIONS & LAYOUT */}
            {activeInspectorTab === "sections" && (
              <div className="space-y-4">
                {/* Add Section Quick Bar */}
                <div className="p-3 bg-stone-50 border border-stone-200 rounded space-y-2">
                  <span className="font-editorial-sans text-[9px] uppercase tracking-[0.2em] font-semibold text-stone-600 block">
                    + Add New Layout Section:
                  </span>
                  <div className="grid grid-cols-2 gap-1.5 font-editorial-sans text-[10px] uppercase tracking-wider">
                    <button
                      type="button"
                      onClick={() => handleAddSection("image_duo")}
                      className="p-2 bg-white hover:bg-stone-100 border border-stone-300 rounded text-left flex items-center gap-1.5 transition-colors"
                    >
                      <Plus className="w-3 h-3 text-stone-600" />
                      <span>Image Duo (2 Photos)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddSection("full_bleed_image")}
                      className="p-2 bg-white hover:bg-stone-100 border border-stone-300 rounded text-left flex items-center gap-1.5 transition-colors"
                    >
                      <Plus className="w-3 h-3 text-stone-600" />
                      <span>Full Bleed Photo</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddSection("text_with_image")}
                      className="p-2 bg-white hover:bg-stone-100 border border-stone-300 rounded text-left flex items-center gap-1.5 transition-colors"
                    >
                      <Plus className="w-3 h-3 text-stone-600" />
                      <span>Text + Image</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddSection("pull_quote")}
                      className="p-2 bg-white hover:bg-stone-100 border border-stone-300 rounded text-left flex items-center gap-1.5 transition-colors"
                    >
                      <Plus className="w-3 h-3 text-stone-600" />
                      <span>Pull Quote</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddSection("designer_roster")}
                      className="col-span-2 p-2 bg-white hover:bg-stone-100 border border-stone-300 rounded text-left flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Plus className="w-3 h-3 text-stone-600" />
                      <span>Designer Roster & Brands</span>
                    </button>
                  </div>
                </div>

                {/* Section List */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-editorial-sans text-[9px] uppercase tracking-[0.2em] font-semibold text-stone-500">
                      Active Sections ({shop.contentBlocks.length})
                    </span>
                    <span className="text-[10px] text-stone-400">
                      Drag or use arrows to reorder
                    </span>
                  </div>

                  <div className="space-y-2">
                    {shop.contentBlocks.map((block, idx) => (
                      <div
                        key={block.id}
                        className="p-3 bg-white border border-stone-200 rounded flex items-center justify-between gap-2 shadow-2xs hover:border-stone-400 transition-colors"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="font-mono text-[10px] px-1.5 py-0.5 bg-stone-100 border border-stone-200 rounded text-stone-600">
                            0{idx + 1}
                          </span>
                          <div className="truncate">
                            <span className="font-editorial-sans text-[9px] uppercase tracking-wider font-semibold text-stone-900 block truncate">
                              {block.type.replace(/_/g, " ")}
                            </span>
                            <span className="text-[10px] text-stone-500 font-serif italic truncate block">
                              {block.heading || block.quote?.text?.slice(0, 32) || "Photo block"}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => handleMoveBlock(idx, "up")}
                            className="p-1 text-stone-500 hover:text-stone-900 disabled:opacity-30"
                            title="Move section up"
                          >
                            <ChevronUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={idx === shop.contentBlocks.length - 1}
                            onClick={() => handleMoveBlock(idx, "down")}
                            className="p-1 text-stone-500 hover:text-stone-900 disabled:opacity-30"
                            title="Move section down"
                          >
                            <ChevronDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDuplicateBlock(idx)}
                            className="p-1 text-stone-500 hover:text-stone-900"
                            title="Duplicate section"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteBlock(block.id)}
                            className="p-1 text-stone-400 hover:text-red-700"
                            title="Delete section"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: SHOP DETAILS */}
            {activeInspectorTab === "metadata" && (
              <div className="space-y-3.5">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-stone-500 font-semibold mb-1">
                    Shop Name *
                  </label>
                  <input
                    type="text"
                    value={shop.name}
                    onChange={(e) => handleUpdateShop({ ...shop, name: e.target.value })}
                    className="w-full px-3 py-1.5 bg-stone-50 border border-stone-200 rounded text-xs font-editorial-serif text-sm focus:outline-none focus:border-stone-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-stone-500 font-semibold mb-1">
                    Subtitle / Tagline
                  </label>
                  <input
                    type="text"
                    value={shop.subtitle || ""}
                    onChange={(e) => handleUpdateShop({ ...shop, subtitle: e.target.value })}
                    className="w-full px-3 py-1.5 bg-stone-50 border border-stone-200 rounded text-xs focus:outline-none focus:border-stone-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-stone-500 font-semibold mb-1">
                      City
                    </label>
                    <select
                      value={shop.city}
                      onChange={(e) => handleUpdateShop({ ...shop, city: e.target.value as any })}
                      className="w-full px-2 py-1.5 bg-stone-50 border border-stone-200 rounded text-xs"
                    >
                      <option value="Melbourne">Melbourne</option>
                      <option value="Sydney">Sydney</option>
                      <option value="Brisbane">Brisbane</option>
                      <option value="Perth">Perth</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-stone-500 font-semibold mb-1">
                      Precinct
                    </label>
                    <input
                      type="text"
                      value={shop.precinct}
                      onChange={(e) => handleUpdateShop({ ...shop, precinct: e.target.value })}
                      className="w-full px-2 py-1.5 bg-stone-50 border border-stone-200 rounded text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-stone-500 font-semibold mb-1">
                    Formatted Address
                  </label>
                  <input
                    type="text"
                    value={shop.address.formatted}
                    onChange={(e) =>
                      handleUpdateShop({
                        ...shop,
                        address: { ...shop.address, formatted: e.target.value },
                      })
                    }
                    className="w-full px-3 py-1.5 bg-stone-50 border border-stone-200 rounded text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-stone-500 font-semibold mb-1">
                      Website
                    </label>
                    <input
                      type="text"
                      value={shop.contact.websiteUrl || ""}
                      onChange={(e) =>
                        handleUpdateShop({
                          ...shop,
                          contact: { ...shop.contact, websiteUrl: e.target.value },
                        })
                      }
                      className="w-full px-2 py-1.5 bg-stone-50 border border-stone-200 rounded text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-stone-500 font-semibold mb-1">
                      Instagram
                    </label>
                    <input
                      type="text"
                      value={shop.contact.instagramHandle || ""}
                      onChange={(e) =>
                        handleUpdateShop({
                          ...shop,
                          contact: { ...shop.contact, instagramHandle: e.target.value },
                        })
                      }
                      className="w-full px-2 py-1.5 bg-stone-50 border border-stone-200 rounded text-xs"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setIsMetadataOpen(true)}
                    className="w-full py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-300 rounded text-xs font-editorial-sans uppercase tracking-wider transition-colors inline-flex items-center justify-center gap-1.5"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span>Open Full Metadata Editor</span>
                  </button>
                </div>
              </div>
            )}

            {/* TAB 3: STOREFRONT HERO PHOTO */}
            {activeInspectorTab === "visuals" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-stone-500 font-semibold mb-1">
                    Storefront Hero Banner (Cloudinary)
                  </label>
                  <CloudinaryUploader
                    label="Hero Storefront Photo"
                    currentImageUrl={shop.heroImage.url}
                    onUploadSuccess={(url) =>
                      handleUpdateShop({
                        ...shop,
                        heroImage: { ...shop.heroImage, url },
                      })
                    }
                    aspectRatio="aspect-[16/10]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-stone-500 font-semibold mb-1">
                    Banner Caption
                  </label>
                  <input
                    type="text"
                    value={shop.heroImage.caption || ""}
                    onChange={(e) =>
                      handleUpdateShop({
                        ...shop,
                        heroImage: { ...shop.heroImage, caption: e.target.value },
                      })
                    }
                    className="w-full px-3 py-1.5 bg-stone-50 border border-stone-200 rounded text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-stone-500 font-semibold mb-1">
                    Photographer Credit
                  </label>
                  <input
                    type="text"
                    value={shop.heroImage.photographerCredit || ""}
                    onChange={(e) =>
                      handleUpdateShop({
                        ...shop,
                        heroImage: { ...shop.heroImage, photographerCredit: e.target.value },
                      })
                    }
                    className="w-full px-3 py-1.5 bg-stone-50 border border-stone-200 rounded text-xs"
                  />
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* RIGHT LIVE CANVAS VIEWPORT */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8 bg-stone-200/70 flex flex-col items-center justify-start">
          {/* Simulated Browser Frame */}
          <div
            className={`w-full bg-[#FAF8F5] border border-stone-300 shadow-xl transition-all duration-300 flex flex-col ${
              viewport === "desktop"
                ? "max-w-[1280px]"
                : viewport === "tablet"
                ? "max-w-[768px] rounded-lg overflow-hidden my-4"
                : "max-w-[380px] rounded-2xl overflow-hidden my-4 border-4 border-stone-800"
            }`}
          >
            {/* Browser Top Navigation Bar */}
            <div className="bg-stone-100/90 border-b border-stone-200 px-4 py-2 flex items-center justify-between text-xs text-stone-500 shrink-0">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              </div>
              <div className="px-3 py-0.5 bg-white border border-stone-200 rounded font-mono text-[10px] text-stone-600 truncate max-w-xs">
                https://designersale.com.au/shops/{shop.slug}
              </div>
              <div className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-800">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>{isEditMode ? "Live Studio Editing" : "Live Reader Preview"}</span>
              </div>
            </div>

            {/* CANVAS BODY: THE ACTUAL SHOP PROFILE PAGE */}
            <div className="p-4 sm:p-8 space-y-10 select-text">
              {/* ROW 1: SYNCHRONIZED MEDIA HEADER */}
              <section
                data-testid="synchronized-media-header"
                className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start"
              >
                {/* Top-Left: Precinct Map */}
                <div className="lg:col-span-4 w-full h-[280px] lg:h-[340px]">
                  <PrecinctMap
                    coordinates={shop.coordinates}
                    shopName={shop.name}
                    precinct={shop.precinct}
                    addressFormatted={shop.address.formatted}
                  />
                </div>

                {/* Top-Right: Hero Storefront Banner */}
                <div className="lg:col-span-8 w-full h-[280px] lg:h-[340px] relative overflow-hidden bg-stone-200 border border-stone-200/60 group">
                  <Image
                    src={shop.heroImage.url}
                    alt={shop.heroImage.alt || shop.name}
                    fill
                    priority
                    className="object-cover w-full h-full transition-transform duration-700 ease-out group-hover:scale-[1.01]"
                    sizes="(max-width: 1024px) 100vw, 840px"
                  />

                  {/* Caption Overlay */}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent p-4 sm:p-5 flex items-end justify-between text-white pointer-events-none">
                    <div>
                      {shop.heroImage.caption && (
                        <p className="font-editorial-serif italic text-xs sm:text-sm text-stone-100">
                          {shop.heroImage.caption}
                        </p>
                      )}
                      {shop.heroImage.photographerCredit && (
                        <p className="font-editorial-sans text-[8px] uppercase tracking-[0.2em] text-stone-300 mt-0.5">
                          Photo: {shop.heroImage.photographerCredit}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Quick Edit Hero Button */}
                  {isEditMode && (
                    <button
                      type="button"
                      onClick={() => setActiveInspectorTab("visuals")}
                      className="absolute top-3 right-3 bg-white/95 hover:bg-white text-stone-800 text-[10px] font-editorial-sans uppercase tracking-[0.16em] px-2.5 py-1.5 rounded shadow border border-stone-300 flex items-center gap-1.5 transition-all"
                    >
                      <Camera className="w-3 h-3 text-stone-600" />
                      <span>Edit Hero Photo</span>
                    </button>
                  )}
                </div>
              </section>

              {/* ROW 2: STICKY DIRECTORY SIDEBAR + DYNAMIC EDITORIAL FEED */}
              <section
                data-testid="shop-profile-body-grid"
                className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start"
              >
                {/* Left Column: Sticky Sidebar (4 Cols) */}
                <div className="lg:col-span-4 w-full">
                  <DirectorySidebar
                    shop={shop}
                    isEditMode={isEditMode}
                    onEditMetadata={() => setIsMetadataOpen(true)}
                    onManageSimilarShops={() => setIsSimilarShopsOpen(true)}
                    onSelectSimilarShop={(slug) => {}}
                  />
                </div>

                {/* Right Column: Full Dynamic Editorial Feed (8 Cols) */}
                <div className="lg:col-span-8 w-full space-y-12">
                  <EditorialFeed
                    blocks={shop.contentBlocks}
                    isEditMode={isEditMode}
                    onUpdateBlocks={(newBlocks) =>
                      handleUpdateShop({ ...shop, contentBlocks: newBlocks })
                    }
                  />

                  {/* Curated Dynamic Products */}
                  <div className="pt-8 border-t border-stone-200">
                    <ProductCatalogSection
                      initialProducts={PRODUCTS_SEED_DATA.slice(0, 4)}
                      title={`${shop.name} · Curated Artifacts`}
                      subtitle="Small-batch garments, handcrafted ceramics, and limited editions curated in this space."
                      showFilters={false}
                    />
                  </div>
                </div>
              </section>
            </div>
          </div>
        </main>
      </div>

      {/* Edit Metadata Modal */}
      <InlineMetadataEditor
        isOpen={isMetadataOpen}
        onClose={() => setIsMetadataOpen(false)}
        shop={shop}
        onSave={handleUpdateShop}
      />

      {/* Similar Shops Modal */}
      <SimilarShopsModal
        isOpen={isSimilarShopsOpen}
        onClose={() => setIsSimilarShopsOpen(false)}
        similarShops={shop.similarShops}
        onSave={(updatedList) =>
          handleUpdateShop({ ...shop, similarShops: updatedList })
        }
      />
    </div>
  );
};
