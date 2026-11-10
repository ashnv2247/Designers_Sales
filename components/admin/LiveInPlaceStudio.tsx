"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Boutique } from "@/data/boutiques";
import { JournalArticle } from "@/data/journal";
import { GuideItem } from "@/lib/db";
import { ShopProfile, EditorialBlock, BlockType, MediaAsset, AspectRatio } from "@/types/shop";
import { SEED_SHOP_PROFILE, PRESET_STITCH_AND_TICKLE } from "@/data/seedShop";
import { PrecinctMap } from "@/components/shop/PrecinctMap";
import { DirectorySidebar } from "@/components/shop/DirectorySidebar";
import { EditorialFeed } from "@/components/shop/EditorialFeed";
import { ProductCatalogSection } from "@/components/products/ProductCatalogSection";
import { PRODUCTS_SEED_DATA } from "@/data/products";
import { ImageSwapModal } from "./ImageSwapModal";
import {
  Monitor,
  Tablet,
  Smartphone,
  Save,
  RotateCcw,
  Plus,
  Trash2,
  ExternalLink,
  MapPin,
  Clock,
  Camera,
  ChevronUp,
  ChevronDown,
  Copy,
  Layers,
  Edit3,
  CheckCircle2,
  ChevronDown as ChevronDownIcon,
  Sparkles,
  Share2,
  Sliders,
} from "lucide-react";

interface LiveInPlaceStudioProps {
  boutiques: Boutique[];
  guides: GuideItem[];
  journalArticles: JournalArticle[];
  onSaveBoutique: (b: Boutique) => Promise<void>;
  onSaveGuide: (g: GuideItem) => Promise<void>;
  onSaveJournal: (j: JournalArticle) => Promise<void>;
  onRefresh: () => Promise<void>;
  onOpenDashboard?: () => void;
}

export const LiveInPlaceStudio: React.FC<LiveInPlaceStudioProps> = ({
  boutiques,
  guides,
  journalArticles,
  onSaveBoutique,
  onSaveGuide,
  onSaveJournal,
  onRefresh,
  onOpenDashboard,
}) => {
  // Navigation & Page State
  const [pageType, setPageType] = useState<"boutique" | "guide" | "journal">("boutique");
  const [selectedBoutiqueId, setSelectedBoutiqueId] = useState<string>(
    boutiques[0]?.id || "parlour-archive-fitzroy"
  );
  const [selectedGuideId, setSelectedGuideId] = useState<string>(
    guides[0]?.id || "melbourne-edit"
  );
  const [selectedJournalId, setSelectedJournalId] = useState<string>(
    journalArticles[0]?.id || "journal-01"
  );

  // Viewport & Edit Mode (Direct on-page editing)
  const [viewport, setViewport] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [isEditMode, setIsEditMode] = useState<boolean>(true);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  // Image Swap Modal State
  const [imageModal, setImageModal] = useState<{
    isOpen: boolean;
    title: string;
    currentUrl: string;
    caption?: string;
    aspectRatio?: AspectRatio;
    onSave: (data: { url: string; caption?: string; aspectRatio?: AspectRatio }) => void;
  }>({
    isOpen: false,
    title: "",
    currentUrl: "",
    onSave: () => {},
  });

  // ---------------------------------------------------------------------------
  // 1. BOUTIQUE LIVE PROFILE STATE
  // ---------------------------------------------------------------------------
  const [shop, setShop] = useState<ShopProfile>(SEED_SHOP_PROFILE);

  useEffect(() => {
    const selected = boutiques.find((b) => b.id === selectedBoutiqueId);
    if (!selected) return;

    const storageKey = `ds_shop_profile_${selected.id}`;
    let customProfile: ShopProfile | null = null;
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) customProfile = JSON.parse(stored);
    } catch (e) {}

    if (customProfile && customProfile.contentBlocks?.length) {
      setShop(customProfile);
      return;
    }

    const isStitch = selected.id === "stitch-and-tickle";
    const base = isStitch ? PRESET_STITCH_AND_TICKLE : SEED_SHOP_PROFILE;

    setShop({
      ...base,
      id: selected.id,
      slug: selected.id,
      name: selected.name.toUpperCase(),
      subtitle: selected.tagline || base.subtitle,
      city: selected.city as any,
      precinct: `${selected.neighborhood} & ${selected.city}`,
      categories: [selected.category.toUpperCase(), "AUSTRALIAN DESIGN", selected.priceTier],
      address: {
        street: selected.address.split(",")[0] || selected.address,
        suburb: selected.neighborhood,
        state: selected.city === "Melbourne" ? "VIC" : selected.city === "Sydney" ? "NSW" : "WA",
        postcode: selected.city === "Melbourne" ? "3065" : "2000",
        formatted: selected.address,
      },
      heroImage: {
        ...base.heroImage,
        url: selected.image || base.heroImage.url,
        alt: `${selected.name} storefront`,
        caption: `${selected.neighborhood} streetscape and architectural facade`,
      },
      contentBlocks: base.contentBlocks.map((blk, idx) => ({
        ...blk,
        bodyText: idx === 0 && selected.description ? selected.description : blk.bodyText,
        quote: idx === 1 && selected.curatorNote ? { text: selected.curatorNote, author: "CURATOR NOTE" } : blk.quote,
      })),
    });
  }, [selectedBoutiqueId, boutiques]);

  const updateShop = (updated: ShopProfile) => {
    setShop(updated);
    try {
      localStorage.setItem(`ds_shop_profile_${updated.id}`, JSON.stringify(updated));
    } catch (e) {}
  };

  // Add block directly to shop flow
  const handleAddShopBlock = (type: BlockType) => {
    const newId = `block-${Date.now()}`;
    let newBlock: EditorialBlock;

    switch (type) {
      case "text_with_image":
        newBlock = {
          id: newId,
          type: "text_with_image",
          order: shop.contentBlocks.length,
          heading: "ARCHITECTURAL DETAILS & MATERIALITY",
          bodyText: "Custom warm travertine counters and unlacquered brass joinery create a serene spatial cadence throughout the boutique.",
          images: [{ id: `img-${Date.now()}`, url: "/images/generated/atelier-showroom.jpg", alt: "Boutique interior", aspectRatio: "4:5", caption: "Sunlit consultation plinth" }],
        };
        break;
      case "image_duo":
        newBlock = {
          id: newId,
          type: "image_duo",
          order: shop.contentBlocks.length,
          images: [
            { id: `duo-1-${Date.now()}`, url: "/images/discoveries/keep.jpg", alt: "Ceramic vessels", aspectRatio: "4:5", caption: "Handcrafted stoneware" },
            { id: `duo-2-${Date.now()}`, url: "/images/explore/explore-handbag.jpg", alt: "Leather goods", aspectRatio: "4:5", caption: "Archival accessories" },
          ],
        };
        break;
      case "full_bleed_image":
        newBlock = {
          id: newId,
          type: "full_bleed_image",
          order: shop.contentBlocks.length,
          images: [{ id: `fb-${Date.now()}`, url: "/images/generated/hero-boutique.jpg", alt: "Panoramic view", aspectRatio: "16:10", caption: "Full spatial panorama" }],
        };
        break;
      case "pull_quote":
        newBlock = {
          id: newId,
          type: "pull_quote",
          order: shop.contentBlocks.length,
          quote: { text: "A physical sanctuary where texture and the hand of the maker dictate the cadence of discovery.", author: "FOUNDER & PROPRIETOR", role: "CURATORIAL ARCHIVE" },
        };
        break;
      case "designer_roster":
        newBlock = {
          id: newId,
          type: "designer_roster",
          order: shop.contentBlocks.length,
          heading: "CURATED DESIGNERS & ARTISANS",
          bodyText: "Representing independent Australian craft and quiet luxury.",
          designers: [
            { id: "d1", name: "Christopher Esber", discipline: "Architectural Tailoring" },
            { id: "d2", name: "Song for the Mute", discipline: "Artisanal Drape" },
            { id: "d3", name: "Matteau", discipline: "Organic Linens" },
          ],
        };
        break;
    }

    const updated = [...shop.contentBlocks, newBlock].map((b, i) => ({ ...b, order: i }));
    updateShop({ ...shop, contentBlocks: updated });
  };

  // ---------------------------------------------------------------------------
  // 2. CURATED GUIDE LIVE PROFILE STATE
  // ---------------------------------------------------------------------------
  const [guide, setGuide] = useState<GuideItem | null>(null);
  const [guideStops, setGuideStops] = useState<
    { id: string; title: string; subtitle: string; body: string; image: string; caption?: string }[]
  >([]);

  useEffect(() => {
    const found = guides.find((g) => g.id === selectedGuideId);
    if (!found) return;

    setGuide({ ...found });
    setGuideStops([
      {
        id: "stop-01",
        title: "STOP 01: Gertrude Street Bluestone Heritage",
        subtitle: "Fitzroy's epicentre of independent fashion & botanical joinery",
        body: "Begin at the corner of Nicholson and Gertrude Street. The 19th-century bluestone facades house some of Australia's most revered independent fashion ateliers.\n\nClimbing green botanical ivy drapes over high arched display windows, framing tactile collections from local designers who prioritize ethical fabrication.",
        image: "/images/hero/hero-main.jpg",
        caption: "Historic Gertrude Street storefront draped in climbing botanical ivy",
      },
      {
        id: "stop-02",
        title: "STOP 02: High Street Armadale Antiquity",
        subtitle: "20th-century furniture, rare lighting, and sculptural ceramics",
        body: "Traverse south to Armadale, where wide sunlit pavements lead to intimate antique arcades and small-batch pottery studios.\n\nHere, curators specialize in raw European stoneware, brushed brass sconces, and archival mid-century lounge chairs.",
        image: "/images/discoveries/marton-and-davis.jpg",
        caption: "Armadale gallery featuring tactile stoneware and 20th-century lighting",
      },
    ]);
  }, [selectedGuideId, guides]);

  const handleAddGuideStop = () => {
    const newStop = {
      id: `stop-${Date.now()}`,
      title: `STOP 0${guideStops.length + 1}: Architectural Precinct Stop`,
      subtitle: "Independent atelier, ceramics gallery, or botanical courtyard",
      body: "Describe the walking route, architectural bluestone elements, lighting, and proprietary ethos...",
      image: "/images/generated/melbourne-laneway.jpg",
      caption: "Sunlit cobblestone streetscape and Victorian brickwork",
    };
    setGuideStops([...guideStops, newStop]);
  };

  // ---------------------------------------------------------------------------
  // 3. JOURNAL ARTICLE LIVE STATE
  // ---------------------------------------------------------------------------
  const [article, setArticle] = useState<JournalArticle | null>(null);
  const [articleBlocks, setArticleBlocks] = useState<
    { id: string; type: "p" | "quote" | "photo"; text?: string; author?: string; image?: string; caption?: string }[]
  >([]);

  useEffect(() => {
    const found = journalArticles.find((a) => a.id === selectedJournalId);
    if (!found) return;

    setArticle({ ...found });
    setArticleBlocks([
      {
        id: "art-01",
        type: "p",
        text: found.content || "In an era dominated by hyper-efficient digital transactions, the physical store has taken on an unexpected secondary role: that of an acoustic and tactile sanctuary.\n\nFrom High Street Armadale to the backstreets of Surry Hills, proprietors are dedicating significant footprint not to inventory density, but to raw stone, unglazed earthenware, and sculptural silence.",
      },
      {
        id: "art-02",
        type: "quote",
        text: "When a client touches a vessel made from clay dug in the Macedon Ranges, the pace of their breathing changes. The store becomes a memory rather than just a transaction point.",
        author: "MARCUS CHEN · ARCHITECTURAL OBSERVER",
      },
      {
        id: "art-03",
        type: "photo",
        image: "/images/generated/atelier-showroom.jpg",
        caption: "Natural daylight filtering across brushed travertine surfaces in Fitzroy",
      },
    ]);
  }, [selectedJournalId, journalArticles]);

  const handleAddArticleBlock = (type: "p" | "quote" | "photo") => {
    const newBlock = {
      id: `blk-${Date.now()}`,
      type,
      text: type === "p" ? "Write new longform editorial narrative here..." : "A pull quote encapsulating the aesthetic philosophy.",
      author: "CURATORIAL DISPATCH",
      image: "/images/discoveries/keep.jpg",
      caption: "Tactile ceramics and artisanal details",
    };
    setArticleBlocks([...articleBlocks, newBlock]);
  };

  // ---------------------------------------------------------------------------
  // SAVE PERSISTENCE
  // ---------------------------------------------------------------------------
  const handleSaveCurrentPage = async () => {
    setSaveStatus("Saving...");
    try {
      if (pageType === "boutique") {
        const matching = boutiques.find((b) => b.id === shop.id) || {
          id: shop.id,
          name: shop.name,
          tagline: shop.subtitle || "",
          city: (shop.city === "Hobart" ? "Melbourne" : shop.city) as Boutique["city"],
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

        await onSaveBoutique({
          ...matching,
          name: shop.name,
          city: (shop.city === "Hobart" ? "Melbourne" : shop.city) as Boutique["city"],
          tagline: shop.subtitle || "",
          image: shop.heroImage.url,
          description: shop.contentBlocks[0]?.bodyText || matching.description,
          curatorNote: shop.contentBlocks.find((b) => b.type === "pull_quote")?.quote?.text || matching.curatorNote,
        });
      } else if (pageType === "guide" && guide) {
        const combined = guideStops.map((s) => `### ${s.title}\n*${s.subtitle}*\n\n${s.body}`).join("\n\n");
        await onSaveGuide({ ...guide, content: combined });
      } else if (pageType === "journal" && article) {
        const combined = articleBlocks.map((b) => (b.type === "p" ? b.text : `> "${b.text}" — ${b.author}`)).join("\n\n");
        await onSaveJournal({ ...article, content: combined });
      }

      setSaveStatus("Saved in place!");
      setTimeout(() => setSaveStatus(null), 2500);
    } catch (e) {
      setSaveStatus("Error saving.");
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-900 flex flex-col select-none">
      {/* -------------------------------------------------------------------- */}
      {/* SLEEK FLOATING TOP STUDIO TOOLBAR (NO SEPARATE FORM COLUMN) */}
      {/* -------------------------------------------------------------------- */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200 px-4 sm:px-8 py-2.5 flex items-center justify-between gap-4 shrink-0 shadow-xs">
        {/* Brand & Page Selector */}
        <div className="flex items-center gap-3">
          <Link href="/" className="font-editorial-serif text-lg tracking-wider text-stone-900 inline-flex items-center font-bold">
            <span>DS</span>
            <span className="font-light text-sm ml-0.5 opacity-60">/</span>
            <span className="font-editorial-sans text-[8.5px] uppercase tracking-[0.24em] text-stone-500 font-semibold ml-2">
              LIVE STUDIO
            </span>
          </Link>

          {onOpenDashboard && (
            <button
              type="button"
              onClick={onOpenDashboard}
              className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 border border-stone-300 rounded text-[11px] font-editorial-sans uppercase tracking-wider inline-flex items-center gap-1.5 transition-colors text-stone-700"
              title="Return to Normal Admin Panel"
            >
              <Sliders className="w-3.5 h-3.5 text-stone-600" />
              <span className="hidden sm:inline">Admin Dashboard</span>
            </button>
          )}

          {/* Mode Tabs: Boutiques / Guides / Journal */}
          <div className="flex items-center bg-stone-100 border border-stone-200 rounded p-0.5 text-xs font-editorial-sans uppercase tracking-wider">
            <button
              type="button"
              onClick={() => setPageType("boutique")}
              className={`px-3 py-1 rounded transition-colors ${
                pageType === "boutique" ? "bg-white text-stone-900 font-semibold shadow-2xs" : "text-stone-500 hover:text-stone-900"
              }`}
            >
              Shop Page
            </button>
            <button
              type="button"
              onClick={() => setPageType("guide")}
              className={`px-3 py-1 rounded transition-colors ${
                pageType === "guide" ? "bg-white text-stone-900 font-semibold shadow-2xs" : "text-stone-500 hover:text-stone-900"
              }`}
            >
              City Guide
            </button>
            <button
              type="button"
              onClick={() => setPageType("journal")}
              className={`px-3 py-1 rounded transition-colors ${
                pageType === "journal" ? "bg-white text-stone-900 font-semibold shadow-2xs" : "text-stone-500 hover:text-stone-900"
              }`}
            >
              Journal Article
            </button>
          </div>

          {/* Entity Selector Dropdown */}
          {pageType === "boutique" && (
            <select
              value={selectedBoutiqueId}
              onChange={(e) => setSelectedBoutiqueId(e.target.value)}
              className="bg-stone-50 border border-stone-300 py-1 pl-2.5 pr-7 rounded text-xs font-editorial-serif text-stone-900 max-w-[200px] truncate"
            >
              {boutiques.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.city})
                </option>
              ))}
            </select>
          )}

          {pageType === "guide" && (
            <select
              value={selectedGuideId}
              onChange={(e) => setSelectedGuideId(e.target.value)}
              className="bg-stone-50 border border-stone-300 py-1 pl-2.5 pr-7 rounded text-xs font-editorial-serif text-stone-900 max-w-[200px] truncate"
            >
              {guides.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.title} ({g.city})
                </option>
              ))}
            </select>
          )}

          {pageType === "journal" && (
            <select
              value={selectedJournalId}
              onChange={(e) => setSelectedJournalId(e.target.value)}
              className="bg-stone-50 border border-stone-300 py-1 pl-2.5 pr-7 rounded text-xs font-editorial-serif text-stone-900 max-w-[200px] truncate"
            >
              {journalArticles.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.title}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Center: Live Inline Edit Toggle & Viewport */}
        <div className="flex items-center gap-2">
          {/* Edit In Place Active Button */}
          <button
            type="button"
            onClick={() => setIsEditMode(!isEditMode)}
            className={`px-3 py-1 rounded text-[11px] font-editorial-sans uppercase tracking-wider flex items-center gap-1.5 transition-all border ${
              isEditMode
                ? "bg-amber-100/90 border-amber-300 text-amber-900 font-bold shadow-2xs"
                : "bg-white border-stone-200 text-stone-600 hover:text-stone-900"
            }`}
          >
            <Edit3 className="w-3.5 h-3.5 text-amber-800" />
            <span>{isEditMode ? "Live In-Place Edit (Active)" : "Clean Reader View"}</span>
          </button>

          {/* Device Viewport Switcher */}
          <div className="flex items-center bg-stone-100 border border-stone-200 rounded p-0.5">
            <button
              type="button"
              onClick={() => setViewport("desktop")}
              className={`px-2.5 py-0.5 rounded text-[11px] font-editorial-sans uppercase tracking-wider flex items-center gap-1 transition-all ${
                viewport === "desktop" ? "bg-white text-stone-900 font-semibold shadow-2xs" : "text-stone-500 hover:text-stone-900"
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Desktop</span>
            </button>
            <button
              type="button"
              onClick={() => setViewport("tablet")}
              className={`px-2.5 py-0.5 rounded text-[11px] font-editorial-sans uppercase tracking-wider flex items-center gap-1 transition-all ${
                viewport === "tablet" ? "bg-white text-stone-900 font-semibold shadow-2xs" : "text-stone-500 hover:text-stone-900"
              }`}
            >
              <Tablet className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Tablet</span>
            </button>
            <button
              type="button"
              onClick={() => setViewport("mobile")}
              className={`px-2.5 py-0.5 rounded text-[11px] font-editorial-sans uppercase tracking-wider flex items-center gap-1 transition-all ${
                viewport === "mobile" ? "bg-white text-stone-900 font-semibold shadow-2xs" : "text-stone-500 hover:text-stone-900"
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Mobile</span>
            </button>
          </div>
        </div>

        {/* Right Actions: Save & Public View */}
        <div className="flex items-center gap-2">
          {saveStatus && (
            <span className="text-[11px] font-mono text-emerald-800 font-medium px-2 py-1 bg-emerald-50 border border-emerald-200 rounded animate-fade-in hidden md:inline-block">
              {saveStatus}
            </span>
          )}

          <Link
            href={pageType === "boutique" ? "/shop" : pageType === "guide" ? "/guides/melbourne-edit" : "/#journal"}
            target="_blank"
            className="px-2.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-300 rounded text-xs font-editorial-sans uppercase tracking-wider inline-flex items-center gap-1 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5 text-stone-600" />
            <span className="hidden lg:inline">View Public</span>
          </Link>

          <button
            type="button"
            onClick={handleSaveCurrentPage}
            className="px-4 py-1.5 bg-[#1C1917] hover:bg-stone-800 text-white rounded text-xs font-editorial-sans uppercase tracking-[0.16em] inline-flex items-center gap-1.5 shadow-2xs transition-colors"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Page</span>
          </button>
        </div>
      </header>

      {/* -------------------------------------------------------------------- */}
      {/* MAIN VIEWPORT: THE LIVE FULL-SCREEN PAGE DISPLAY */}
      {/* -------------------------------------------------------------------- */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-8 bg-stone-100/60 flex flex-col items-center">
        <div
          className={`w-full bg-[#FAF8F5] transition-all duration-300 ${
            viewport === "desktop"
              ? "max-w-[1280px]"
              : viewport === "tablet"
              ? "max-w-[768px] shadow-2xl border border-stone-300 rounded-lg overflow-hidden my-4"
              : "max-w-[380px] shadow-2xl border-4 border-stone-800 rounded-2xl overflow-hidden my-4"
          }`}
        >
          {/* ================================================================ */}
          {/* 1. BOUTIQUE SHOP PROFILE (LIVE ON-PAGE DISPLAY & DIRECT EDIT)   */}
          {/* ================================================================ */}
          {pageType === "boutique" && (
            <div className="p-4 sm:p-8 space-y-10 select-text">
              {/* Media Header */}
              <section data-testid="synchronized-media-header" className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
                {/* Left: Precinct Map */}
                <div className="lg:col-span-4 w-full h-[280px] lg:h-[340px]">
                  <PrecinctMap
                    coordinates={shop.coordinates}
                    shopName={shop.name}
                    precinct={shop.precinct}
                    addressFormatted={shop.address.formatted}
                  />
                </div>

                {/* Right: Hero Storefront Banner */}
                <div className="lg:col-span-8 w-full h-[280px] lg:h-[340px] relative overflow-hidden bg-stone-200 border border-stone-200/60 group">
                  <Image
                    src={shop.heroImage.url}
                    alt={shop.heroImage.alt || shop.name}
                    fill
                    priority
                    className="object-cover w-full h-full transition-transform duration-700 ease-out group-hover:scale-[1.01]"
                  />

                  {/* Caption & Credits */}
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

                  {/* Direct On-Photo Replace Button */}
                  {isEditMode && (
                    <button
                      type="button"
                      onClick={() =>
                        setImageModal({
                          isOpen: true,
                          title: "Edit Storefront Banner",
                          currentUrl: shop.heroImage.url,
                          caption: shop.heroImage.caption,
                          aspectRatio: shop.heroImage.aspectRatio,
                          onSave: ({ url, caption, aspectRatio }) =>
                            updateShop({
                              ...shop,
                              heroImage: {
                                ...shop.heroImage,
                                url,
                                caption,
                                aspectRatio: aspectRatio || "16:10",
                              },
                            }),
                        })
                      }
                      className="absolute top-3 right-3 bg-white/95 hover:bg-white text-stone-900 text-[10px] font-editorial-sans uppercase tracking-[0.16em] px-3 py-1.5 rounded shadow border border-stone-300 flex items-center gap-1.5 transition-all"
                    >
                      <Camera className="w-3.5 h-3.5 text-stone-700" />
                      <span>Replace Photo (Cloudinary)</span>
                    </button>
                  )}
                </div>
              </section>

              {/* Body: Sticky Sidebar + Dynamic Feed */}
              <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
                {/* Left 4 cols: Sticky Sidebar */}
                <div className="lg:col-span-4 w-full">
                  <DirectorySidebar
                    shop={shop}
                    isEditMode={isEditMode}
                    onEditMetadata={() => {}}
                    onManageSimilarShops={() => {}}
                    onSelectSimilarShop={() => {}}
                  />
                </div>

                {/* Right 8 cols: Dynamic Editorial Feed */}
                <div className="lg:col-span-8 w-full space-y-10">
                  {/* Floating In-Place Section Adder Bar */}
                  {isEditMode && (
                    <div className="p-3 bg-stone-50 border border-stone-200 rounded flex flex-wrap items-center justify-between gap-2 text-xs">
                      <span className="font-editorial-sans text-[9px] uppercase tracking-[0.2em] font-bold text-stone-600">
                        + Insert New Section Into Page:
                      </span>
                      <div className="flex flex-wrap gap-1.5 text-[10px] font-editorial-sans uppercase tracking-wider">
                        <button
                          type="button"
                          onClick={() => handleAddShopBlock("image_duo")}
                          className="px-2.5 py-1 bg-white hover:bg-stone-100 border border-stone-300 rounded flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Image Duo (2 Photos)</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAddShopBlock("full_bleed_image")}
                          className="px-2.5 py-1 bg-white hover:bg-stone-100 border border-stone-300 rounded flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Full Bleed Photo</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAddShopBlock("text_with_image")}
                          className="px-2.5 py-1 bg-white hover:bg-stone-100 border border-stone-300 rounded flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Text + Image</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAddShopBlock("pull_quote")}
                          className="px-2.5 py-1 bg-white hover:bg-stone-100 border border-stone-300 rounded flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Pull Quote</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Real Editorial Feed with In-Place Controls */}
                  <EditorialFeed
                    blocks={shop.contentBlocks}
                    isEditMode={isEditMode}
                    onUpdateBlocks={(newBlocks) =>
                      updateShop({ ...shop, contentBlocks: newBlocks })
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
          )}

          {/* ================================================================ */}
          {/* 2. CURATED CITY GUIDE (LIVE ON-PAGE DISPLAY & DIRECT EDIT)       */}
          {/* ================================================================ */}
          {pageType === "guide" && guide && (
            <div className="p-4 sm:p-8 lg:p-12 space-y-10 select-text">
              {/* Header */}
              <header className="max-w-3xl space-y-4 pb-8 border-b border-stone-200">
                <span className="font-editorial-sans text-[9px] uppercase tracking-[0.25em] font-semibold text-stone-500 block">
                  {guide.kicker || "01 / CURATED CITY EDITORIAL"}
                </span>

                {isEditMode ? (
                  <input
                    type="text"
                    value={guide.title}
                    onChange={(e) => setGuide({ ...guide, title: e.target.value })}
                    className="w-full font-editorial-serif text-[38px] sm:text-[50px] leading-[1.04] font-normal text-stone-900 border-b border-dashed border-amber-400 bg-amber-50/30 px-1 focus:outline-none"
                  />
                ) : (
                  <h1 className="font-editorial-serif text-[38px] sm:text-[50px] leading-[1.04] font-normal text-stone-900 tracking-[-0.01em]">
                    {guide.title}
                  </h1>
                )}

                {isEditMode ? (
                  <textarea
                    rows={2}
                    value={guide.subtitle}
                    onChange={(e) => setGuide({ ...guide, subtitle: e.target.value })}
                    className="w-full font-editorial-serif italic text-lg sm:text-2xl leading-relaxed text-stone-700 border-b border-dashed border-amber-400 bg-amber-50/30 p-1 focus:outline-none"
                  />
                ) : (
                  <p className="font-editorial-serif italic text-lg sm:text-2xl leading-relaxed text-stone-700">
                    {guide.subtitle}
                  </p>
                )}

                <div className="pt-3 flex flex-wrap items-center gap-4 text-stone-500 text-xs font-editorial-sans text-[8.5px] uppercase tracking-[0.2em] border-t border-stone-100">
                  <span>Curated by DS/ Editorial Board</span>
                  <span className="text-stone-300">·</span>
                  <span>{guide.readingTime}</span>
                  <span className="text-stone-300">·</span>
                  <span className="text-emerald-800 font-semibold">{boutiques.filter((b) => b.city.toLowerCase() === guide.city.toLowerCase()).length} Boutiques Featured</span>
                </div>
              </header>

              {/* Hero Image Collage with Direct Photo Swap */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="md:col-span-8 relative h-[320px] sm:h-[440px] bg-stone-200 overflow-hidden border border-stone-200 group">
                  <Image src={guide.heroImage} alt={guide.title} fill priority className="object-cover" />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-4 text-white">
                    <span className="font-editorial-sans text-[8px] uppercase tracking-[0.2em] text-stone-300">
                      {guide.city.toUpperCase()} ARCHITECTURAL PRECINCT
                    </span>
                    <p className="font-editorial-serif italic text-sm mt-0.5">
                      Historic storefront draped in botanical greenery
                    </p>
                  </div>

                  {isEditMode && (
                    <button
                      type="button"
                      onClick={() =>
                        setImageModal({
                          isOpen: true,
                          title: "Edit Guide Hero Photo",
                          currentUrl: guide.heroImage,
                          onSave: ({ url }) => setGuide({ ...guide, heroImage: url }),
                        })
                      }
                      className="absolute top-3 right-3 bg-white/95 text-stone-900 text-[10px] font-editorial-sans uppercase tracking-[0.16em] px-3 py-1.5 rounded shadow border border-stone-300 flex items-center gap-1.5"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>Replace Photo (Cloudinary)</span>
                    </button>
                  )}
                </div>

                <div className="md:col-span-4 relative h-[320px] sm:h-[440px] bg-stone-200 overflow-hidden border border-stone-200">
                  <Image src="/images/generated/melbourne-laneway.jpg" alt="Cobblestone laneway" fill className="object-cover" />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-4 text-white">
                    <span className="font-editorial-sans text-[8px] uppercase tracking-[0.2em] text-stone-300">
                      HERITAGE LANEWAY
                    </span>
                    <p className="font-editorial-serif italic text-xs mt-0.5">
                      Twilight shadows across bluestone pavers
                    </p>
                  </div>
                </div>
              </div>

              {/* Floating Section Adder */}
              {isEditMode && (
                <div className="max-w-3xl mx-auto p-3 bg-stone-50 border border-stone-200 rounded flex items-center justify-between">
                  <span className="font-editorial-sans text-[9px] uppercase tracking-[0.2em] font-bold text-stone-600">
                    + Add Itinerary Walking Stop:
                  </span>
                  <button
                    type="button"
                    onClick={handleAddGuideStop}
                    className="px-3 py-1 bg-stone-900 text-white rounded text-[10px] font-editorial-sans uppercase tracking-wider flex items-center gap-1 shadow-2xs"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Insert New Stop</span>
                  </button>
                </div>
              )}

              {/* Dynamic Itinerary Stops (Direct in-place text & photo editing) */}
              <div className="space-y-12 max-w-3xl mx-auto pt-4">
                {guideStops.map((stop, idx) => (
                  <div key={stop.id} className="space-y-4 pb-8 border-b border-stone-200 relative group">
                    <div className="flex items-center justify-between">
                      <span className="font-editorial-sans text-[9px] uppercase tracking-[0.2em] font-semibold text-stone-500">
                        ITINERARY STOP 0{idx + 1}
                      </span>
                      {isEditMode && (
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => {
                              const updated = [...guideStops];
                              const temp = updated[idx];
                              updated[idx] = updated[idx - 1];
                              updated[idx - 1] = temp;
                              setGuideStops(updated);
                            }}
                            className="p-1 text-stone-400 hover:text-stone-800 disabled:opacity-30"
                          >
                            <ChevronUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={idx === guideStops.length - 1}
                            onClick={() => {
                              const updated = [...guideStops];
                              const temp = updated[idx];
                              updated[idx] = updated[idx + 1];
                              updated[idx + 1] = temp;
                              setGuideStops(updated);
                            }}
                            className="p-1 text-stone-400 hover:text-stone-800 disabled:opacity-30"
                          >
                            <ChevronDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setGuideStops(guideStops.filter((s) => s.id !== stop.id))}
                            className="p-1 text-stone-400 hover:text-red-700"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>

                    {isEditMode ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={stop.title}
                          onChange={(e) => {
                            const updated = [...guideStops];
                            updated[idx].title = e.target.value;
                            setGuideStops(updated);
                          }}
                          className="w-full font-editorial-serif text-2xl font-normal text-stone-900 border-b border-dashed border-amber-400 bg-amber-50/20 px-1 focus:outline-none"
                        />
                        <input
                          type="text"
                          value={stop.subtitle}
                          onChange={(e) => {
                            const updated = [...guideStops];
                            updated[idx].subtitle = e.target.value;
                            setGuideStops(updated);
                          }}
                          className="w-full font-serif italic text-sm text-stone-600 border-b border-dashed border-amber-400 bg-amber-50/20 px-1 focus:outline-none"
                        />
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <h3 className="font-editorial-serif text-2xl font-normal text-stone-900">{stop.title}</h3>
                        <p className="font-serif italic text-sm text-stone-600">{stop.subtitle}</p>
                      </div>
                    )}

                    {/* Stop Photo with Direct Replace Button */}
                    <div className="relative h-[280px] sm:h-[360px] w-full bg-stone-200 overflow-hidden border border-stone-200 group">
                      <Image src={stop.image} alt={stop.title} fill className="object-cover" />
                      {isEditMode && (
                        <button
                          type="button"
                          onClick={() =>
                            setImageModal({
                              isOpen: true,
                              title: `Edit ${stop.title} Photo`,
                              currentUrl: stop.image,
                              caption: stop.caption,
                              onSave: ({ url, caption }) => {
                                const updated = [...guideStops];
                                updated[idx].image = url;
                                updated[idx].caption = caption;
                                setGuideStops(updated);
                              },
                            })
                          }
                          className="absolute top-3 right-3 bg-white/95 text-stone-900 text-[10px] font-editorial-sans uppercase tracking-wider px-2.5 py-1.5 rounded shadow border border-stone-300 flex items-center gap-1.5"
                        >
                          <Camera className="w-3 h-3" />
                          <span>Replace Photo</span>
                        </button>
                      )}
                    </div>

                    {isEditMode ? (
                      <textarea
                        rows={4}
                        value={stop.body}
                        onChange={(e) => {
                          const updated = [...guideStops];
                          updated[idx].body = e.target.value;
                          setGuideStops(updated);
                        }}
                        className="w-full p-2.5 font-editorial-serif text-[15px] sm:text-base leading-[1.85] text-stone-800 border border-dashed border-amber-400 bg-amber-50/20 rounded focus:outline-none"
                      />
                    ) : (
                      <div className="font-editorial-serif text-[15px] sm:text-base leading-[1.85] text-stone-800 space-y-3">
                        {stop.body.split("\n\n").map((p, i) => (
                          <p key={i}>{p}</p>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================================================================ */}
          {/* 3. BLOG & JOURNAL ARTICLE (LIVE ON-PAGE DISPLAY & DIRECT EDIT)   */}
          {/* ================================================================ */}
          {pageType === "journal" && article && (
            <article className="p-4 sm:p-8 lg:p-12 space-y-8 select-text max-w-3xl mx-auto w-full">
              {/* Header */}
              <header className="space-y-4 pb-6 border-b border-stone-200">
                <div className="flex items-center gap-3 text-[9px] font-editorial-sans uppercase tracking-[0.24em] text-stone-500 font-semibold">
                  <span className="px-2 py-0.5 bg-stone-200 text-stone-800">{article.category}</span>
                  <span>{article.date}</span>
                  <span>·</span>
                  <span>{article.readTime}</span>
                </div>

                {isEditMode ? (
                  <input
                    type="text"
                    value={article.title}
                    onChange={(e) => setArticle({ ...article, title: e.target.value })}
                    className="w-full font-editorial-serif text-[34px] sm:text-[48px] leading-[1.06] font-normal text-stone-900 border-b border-dashed border-amber-400 bg-amber-50/20 px-1 focus:outline-none"
                  />
                ) : (
                  <h1 className="font-editorial-serif text-[34px] sm:text-[48px] leading-[1.06] font-normal text-stone-900 tracking-[-0.01em]">
                    {article.title}
                  </h1>
                )}

                {isEditMode ? (
                  <textarea
                    rows={2}
                    value={article.excerpt}
                    onChange={(e) => setArticle({ ...article, excerpt: e.target.value })}
                    className="w-full font-editorial-serif italic text-lg sm:text-2xl leading-relaxed text-stone-700 border-b border-dashed border-amber-400 bg-amber-50/20 p-1 focus:outline-none"
                  />
                ) : (
                  <p className="font-editorial-serif italic text-lg sm:text-2xl leading-relaxed text-stone-700">
                    {article.excerpt}
                  </p>
                )}

                <div className="pt-2 text-stone-500 text-xs font-editorial-sans text-[9px] uppercase tracking-[0.2em]">
                  Dispatched by <span className="font-semibold text-stone-900">{article.author}</span>
                </div>
              </header>

              {/* Cover Photo with Direct Replace Button */}
              <div className="relative h-[320px] sm:h-[460px] w-full bg-stone-200 overflow-hidden border border-stone-200 group">
                <Image src={article.image} alt={article.title} fill priority className="object-cover" />
                {isEditMode && (
                  <button
                    type="button"
                    onClick={() =>
                      setImageModal({
                        isOpen: true,
                        title: "Edit Article Cover Photo",
                        currentUrl: article.image,
                        onSave: ({ url }) => setArticle({ ...article, image: url }),
                      })
                    }
                    className="absolute top-3 right-3 bg-white/95 text-stone-900 text-[10px] font-editorial-sans uppercase tracking-[0.16em] px-3 py-1.5 rounded shadow border border-stone-300 flex items-center gap-1.5"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Replace Cover (Cloudinary)</span>
                  </button>
                )}
              </div>

              {/* Floating Block Adder */}
              {isEditMode && (
                <div className="p-3 bg-stone-50 border border-stone-200 rounded flex items-center justify-between gap-2">
                  <span className="font-editorial-sans text-[9px] uppercase tracking-[0.2em] font-bold text-stone-600">
                    + Insert Article Section:
                  </span>
                  <div className="flex items-center gap-1.5 text-[10px] font-editorial-sans uppercase tracking-wider">
                    <button
                      type="button"
                      onClick={() => handleAddArticleBlock("p")}
                      className="px-2.5 py-1 bg-white hover:bg-stone-100 border border-stone-300 rounded"
                    >
                      + Prose Paragraph
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddArticleBlock("quote")}
                      className="px-2.5 py-1 bg-white hover:bg-stone-100 border border-stone-300 rounded"
                    >
                      + Pull Quote
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddArticleBlock("photo")}
                      className="px-2.5 py-1 bg-white hover:bg-stone-100 border border-stone-300 rounded"
                    >
                      + In-Article Photo
                    </button>
                  </div>
                </div>
              )}

              {/* Narrative Blocks (Direct in-place editing) */}
              <div className="space-y-8 pt-4">
                {articleBlocks.map((blk, idx) => (
                  <div key={blk.id} className="relative group">
                    {blk.type === "p" && (
                      <div className="space-y-2">
                        {isEditMode ? (
                          <textarea
                            rows={4}
                            value={blk.text || ""}
                            onChange={(e) => {
                              const updated = [...articleBlocks];
                              updated[idx].text = e.target.value;
                              setArticleBlocks(updated);
                            }}
                            className="w-full p-2.5 font-editorial-serif text-[16px] sm:text-[17px] leading-[1.85] text-stone-800 border border-dashed border-amber-400 bg-amber-50/20 rounded focus:outline-none"
                          />
                        ) : (
                          <div className="font-editorial-serif text-[16px] sm:text-[17px] leading-[1.85] text-stone-800 space-y-4">
                            {blk.text?.split("\n\n").map((p, i) => (
                              <p key={i} className={idx === 0 && i === 0 ? "first-letter:text-4xl first-letter:font-editorial-serif first-letter:float-left first-letter:mr-3 first-letter:leading-none" : ""}>
                                {p}
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {blk.type === "quote" && (
                      <div className="py-8 px-6 sm:px-8 border-y border-stone-300 bg-white/80 my-8">
                        {isEditMode ? (
                          <div className="space-y-2">
                            <textarea
                              rows={2}
                              value={blk.text || ""}
                              onChange={(e) => {
                                const updated = [...articleBlocks];
                                updated[idx].text = e.target.value;
                                setArticleBlocks(updated);
                              }}
                              className="w-full text-center font-editorial-serif italic text-xl sm:text-2xl text-stone-900 border-b border-dashed border-amber-400 bg-amber-50/20 p-1 focus:outline-none"
                            />
                            <input
                              type="text"
                              value={blk.author || ""}
                              onChange={(e) => {
                                const updated = [...articleBlocks];
                                updated[idx].author = e.target.value;
                                setArticleBlocks(updated);
                              }}
                              className="w-full text-center font-editorial-sans text-[8.5px] uppercase tracking-[0.24em] text-stone-500 border-b border-dashed border-amber-400 bg-amber-50/20 py-0.5 focus:outline-none"
                            />
                          </div>
                        ) : (
                          <>
                            <p className="font-editorial-serif italic text-xl sm:text-2xl text-stone-900 leading-relaxed text-center">
                              &ldquo;{blk.text}&rdquo;
                            </p>
                            <span className="font-editorial-sans text-[8.5px] uppercase tracking-[0.24em] text-stone-400 block text-center mt-2">
                              {blk.author}
                            </span>
                          </>
                        )}
                      </div>
                    )}

                    {blk.type === "photo" && blk.image && (
                      <div className="relative h-[320px] sm:h-[400px] w-full bg-stone-200 overflow-hidden border border-stone-200 my-6 group">
                        <Image src={blk.image} alt={blk.caption || "Photo"} fill className="object-cover" />
                        {isEditMode && (
                          <button
                            type="button"
                            onClick={() =>
                              setImageModal({
                                isOpen: true,
                                title: "Edit In-Article Photo",
                                currentUrl: blk.image || "",
                                caption: blk.caption,
                                onSave: ({ url, caption }) => {
                                  const updated = [...articleBlocks];
                                  updated[idx].image = url;
                                  updated[idx].caption = caption;
                                  setArticleBlocks(updated);
                                },
                              })
                            }
                            className="absolute top-3 right-3 bg-white/95 text-stone-900 text-[10px] font-editorial-sans uppercase tracking-wider px-2.5 py-1.5 rounded shadow border border-stone-300 flex items-center gap-1.5"
                          >
                            <Camera className="w-3 h-3" />
                            <span>Replace Photo</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </article>
          )}
        </div>
      </main>

      {/* Reusable Image Swap Modal */}
      <ImageSwapModal
        isOpen={imageModal.isOpen}
        title={imageModal.title}
        currentUrl={imageModal.currentUrl}
        caption={imageModal.caption}
        aspectRatio={imageModal.aspectRatio}
        onSave={imageModal.onSave}
        onClose={() => setImageModal({ ...imageModal, isOpen: false })}
      />
    </div>
  );
};

