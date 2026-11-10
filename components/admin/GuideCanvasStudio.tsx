"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { GuideItem } from "@/lib/db";
import { Boutique } from "@/data/boutiques";
import { CloudinaryUploader } from "@/components/shared/CloudinaryUploader";
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
  BookOpen,
  Share2,
  Camera,
  ChevronUp,
  ChevronDown,
  Copy,
  Layers,
  Edit3,
} from "lucide-react";

interface GuideSection {
  id: string;
  type: "itinerary_stop" | "photo_break" | "curator_quote";
  title?: string;
  subtitle?: string;
  body?: string;
  image?: string;
  imageCaption?: string;
  quote?: string;
  author?: string;
}

interface GuideCanvasStudioProps {
  guides: GuideItem[];
  boutiques: Boutique[];
  onSave: (guide: GuideItem) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onRefresh: () => Promise<void>;
}

export const GuideCanvasStudio: React.FC<GuideCanvasStudioProps> = ({
  guides,
  boutiques,
  onSave,
  onDelete,
  onRefresh,
}) => {
  const [selectedGuideId, setSelectedGuideId] = useState<string>(
    guides[0]?.id || "melbourne-edit"
  );
  const [viewport, setViewport] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [isEditMode, setIsEditMode] = useState<boolean>(true);
  const [activeInspectorTab, setActiveInspectorTab] = useState<"sections" | "metadata" | "visuals">("sections");
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  const [draft, setDraft] = useState<GuideItem | null>(null);
  const [sections, setSections] = useState<GuideSection[]>([]);

  useEffect(() => {
    const found = guides.find((g) => g.id === selectedGuideId);
    if (found) {
      setDraft({ ...found });

      // Seed initial itinerary sections if not set
      setSections([
        {
          id: "sec-01",
          type: "itinerary_stop",
          title: "STOP 01: Gertrude Street Bluestone Heritage",
          subtitle: "Fitzroy's epicentre of independent fashion & botanical joinery",
          body:
            "Begin at the corner of Nicholson and Gertrude Street. The 19th-century bluestone facades house some of Australia's most revered independent fashion ateliers.\n\nClimbing green botanical ivy drapes over high arched display windows, framing tactile collections from local designers who prioritize ethical fabrication.",
          image: "/images/hero/hero-main.jpg",
          imageCaption: "Historic Gertrude Street storefront draped in climbing botanical ivy",
        },
        {
          id: "sec-02",
          type: "curator_quote",
          quote: "Melbourne retail is defined not by commercial volume, but by architectural intimacy and slow proprietary conviction.",
          author: "DS/ EDITORIAL BOARD · SPRING ANTHOLOGY",
        },
        {
          id: "sec-03",
          type: "itinerary_stop",
          title: "STOP 02: High Street Armadale Antiquity",
          subtitle: "20th-century furniture, rare lighting, and sculptural ceramics",
          body:
            "Traverse south to Armadale, where wide sunlit pavements lead to intimate antique arcades and small-batch pottery studios.\n\nHere, curators specialize in raw European stoneware, brushed brass sconces, and archival mid-century lounge chairs.",
          image: "/images/discoveries/marton-and-davis.jpg",
          imageCaption: "Armadale gallery featuring tactile stoneware and 20th-century lighting",
        },
      ]);
    } else if (guides.length > 0) {
      setDraft({ ...guides[0] });
      setSelectedGuideId(guides[0].id);
    }
  }, [selectedGuideId, guides]);

  if (!draft) {
    return <div className="p-8 text-center text-stone-500 font-mono text-xs">Loading Guide Studio...</div>;
  }

  const handleAddSection = (type: GuideSection["type"]) => {
    const newId = `sec-${Date.now()}`;
    let newSec: GuideSection;

    if (type === "itinerary_stop") {
      newSec = {
        id: newId,
        type: "itinerary_stop",
        title: `STOP 0${sections.length + 1}: Architectural Precinct Stop`,
        subtitle: "Independent atelier, ceramics gallery, or botanical courtyard",
        body: "Detail the walking path, architectural bluestone elements, lighting, and proprietary ethos...",
        image: "/images/generated/melbourne-laneway.jpg",
        imageCaption: "Sunlit cobblestone streetscape and Victorian brickwork",
      };
    } else if (type === "photo_break") {
      newSec = {
        id: newId,
        type: "photo_break",
        image: "/images/explore/explore-handbag.jpg",
        imageCaption: "Handcrafted accessories and tactile textures",
      };
    } else {
      newSec = {
        id: newId,
        type: "curator_quote",
        quote: "The city's best spaces reward slow exploration and careful tactile attention.",
        author: "CURATORIAL INSIDER",
      };
    }

    setSections([...sections, newSec]);
  };

  const handleMoveSection = (index: number, direction: "up" | "down") => {
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= sections.length) return;
    const updated = [...sections];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;
    setSections(updated);
  };

  const handleDeleteSection = (id: string) => {
    setSections(sections.filter((s) => s.id !== id));
  };

  const handleSave = async () => {
    setSaveStatus("Saving...");
    try {
      // Build content from sections
      const combinedContent = sections
        .map((s) => {
          if (s.type === "itinerary_stop") {
            return `### ${s.title}\n*${s.subtitle}*\n\n${s.body}`;
          }
          if (s.type === "curator_quote") {
            return `> "${s.quote}" — ${s.author}`;
          }
          return `[Photo: ${s.imageCaption}]`;
        })
        .join("\n\n");

      await onSave({
        ...draft,
        content: combinedContent,
      });

      setSaveStatus("Saved to guides!");
      setTimeout(() => setSaveStatus(null), 2500);
    } catch (e: any) {
      setSaveStatus("Error saving.");
    }
  };

  const cityBoutiques = boutiques.filter(
    (b) => b.city.toLowerCase() === draft.city.toLowerCase()
  );

  return (
    <div className="flex flex-col h-[calc(100vh-68px)] bg-stone-100 overflow-hidden select-none">
      {/* -------------------------------------------------------------------- */}
      {/* TOP STUDIO TOOLBAR */}
      {/* -------------------------------------------------------------------- */}
      <header className="h-14 bg-white border-b border-stone-200 px-4 sm:px-6 flex items-center justify-between gap-4 shrink-0 z-20">
        <div className="flex items-center gap-3">
          <label className="text-[10px] font-editorial-sans uppercase tracking-[0.2em] text-stone-500 font-semibold shrink-0 hidden sm:block">
            Guide Canvas:
          </label>
          <select
            value={selectedGuideId}
            onChange={(e) => setSelectedGuideId(e.target.value)}
            className="bg-stone-50 border border-stone-300 py-1.5 pl-3 pr-8 rounded text-xs font-editorial-serif text-stone-900 font-medium focus:outline-none focus:border-stone-500"
          >
            {guides.map((g) => (
              <option key={g.id} value={g.id}>
                {g.title} ({g.city})
              </option>
            ))}
          </select>
        </div>

        {/* Center: Device Viewport & Edit Mode */}
        <div className="flex items-center gap-2">
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

          <div className="flex items-center bg-stone-100 border border-stone-200 rounded p-0.5">
            <button
              type="button"
              onClick={() => setViewport("desktop")}
              className={`px-2.5 py-1 rounded text-[11px] font-editorial-sans uppercase tracking-wider flex items-center gap-1 transition-all ${
                viewport === "desktop" ? "bg-white text-stone-900 font-semibold shadow-2xs" : "text-stone-500 hover:text-stone-900"
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span className="hidden md:inline">1240px</span>
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

        {/* Right actions */}
        <div className="flex items-center gap-2">
          {saveStatus && (
            <span className="text-[11px] font-mono text-emerald-800 font-medium px-2 py-1 bg-emerald-50 border border-emerald-200 rounded animate-fade-in hidden sm:inline-block">
              {saveStatus}
            </span>
          )}

          <Link
            href="/guides/melbourne-edit"
            target="_blank"
            className="px-2.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-300 rounded text-xs font-editorial-sans uppercase tracking-wider inline-flex items-center gap-1 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5 text-stone-600" />
            <span className="hidden lg:inline">View Live Guide</span>
          </Link>

          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-1.5 bg-[#1C1917] hover:bg-stone-800 text-white rounded text-xs font-editorial-sans uppercase tracking-[0.16em] inline-flex items-center gap-1.5 shadow-2xs transition-colors"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Guide Canvas</span>
          </button>
        </div>
      </header>

      {/* -------------------------------------------------------------------- */}
      {/* SPLIT WORKSPACE: LEFT INSPECTOR + RIGHT LIVE CANVAS */}
      {/* -------------------------------------------------------------------- */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT INSPECTOR */}
        <aside className="w-[380px] lg:w-[410px] bg-white border-r border-stone-200 flex flex-col shrink-0 overflow-hidden z-10 shadow-xs">
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
              <span>1. Itinerary Sections</span>
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
              2. Guide Details
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
              <span>3. Hero Photos</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs text-stone-800">
            {/* TAB 1: SECTIONS & ITINERARY */}
            {activeInspectorTab === "sections" && (
              <div className="space-y-4">
                {/* Add Section Quick Bar */}
                <div className="p-3 bg-stone-50 border border-stone-200 rounded space-y-2">
                  <span className="font-editorial-sans text-[9px] uppercase tracking-[0.2em] font-semibold text-stone-600 block">
                    + Add Itinerary Section:
                  </span>
                  <div className="grid grid-cols-2 gap-1.5 font-editorial-sans text-[10px] uppercase tracking-wider">
                    <button
                      type="button"
                      onClick={() => handleAddSection("itinerary_stop")}
                      className="p-2 bg-white hover:bg-stone-100 border border-stone-300 rounded text-left flex items-center gap-1.5 transition-colors"
                    >
                      <Plus className="w-3 h-3 text-stone-600" />
                      <span>Walking Stop + Photo</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddSection("curator_quote")}
                      className="p-2 bg-white hover:bg-stone-100 border border-stone-300 rounded text-left flex items-center gap-1.5 transition-colors"
                    >
                      <Plus className="w-3 h-3 text-stone-600" />
                      <span>Curator Pull Quote</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddSection("photo_break")}
                      className="col-span-2 p-2 bg-white hover:bg-stone-100 border border-stone-300 rounded text-left flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Plus className="w-3 h-3 text-stone-600" />
                      <span>Full Photo Break</span>
                    </button>
                  </div>
                </div>

                {/* Section List */}
                <div className="space-y-2">
                  <span className="font-editorial-sans text-[9px] uppercase tracking-[0.2em] font-semibold text-stone-500 block">
                    Itinerary Stops ({sections.length})
                  </span>

                  <div className="space-y-3">
                    {sections.map((sec, idx) => (
                      <div
                        key={sec.id}
                        className="p-3 bg-white border border-stone-200 rounded space-y-2.5 shadow-2xs"
                      >
                        <div className="flex items-center justify-between pb-1.5 border-b border-stone-100">
                          <span className="font-mono text-[10px] px-1.5 py-0.5 bg-stone-100 rounded text-stone-600">
                            0{idx + 1} · {sec.type.replace(/_/g, " ").toUpperCase()}
                          </span>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              disabled={idx === 0}
                              onClick={() => handleMoveSection(idx, "up")}
                              className="p-1 text-stone-500 hover:text-stone-900 disabled:opacity-30"
                              title="Move up"
                            >
                              <ChevronUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              disabled={idx === sections.length - 1}
                              onClick={() => handleMoveSection(idx, "down")}
                              className="p-1 text-stone-500 hover:text-stone-900 disabled:opacity-30"
                              title="Move down"
                            >
                              <ChevronDown className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteSection(sec.id)}
                              className="p-1 text-stone-400 hover:text-red-700"
                              title="Delete stop"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {sec.type === "itinerary_stop" && (
                          <div className="space-y-2">
                            <input
                              type="text"
                              value={sec.title || ""}
                              onChange={(e) => {
                                const updated = [...sections];
                                updated[idx].title = e.target.value;
                                setSections(updated);
                              }}
                              placeholder="Stop Title"
                              className="w-full px-2.5 py-1 bg-stone-50 border border-stone-200 rounded text-xs font-semibold"
                            />
                            <input
                              type="text"
                              value={sec.subtitle || ""}
                              onChange={(e) => {
                                const updated = [...sections];
                                updated[idx].subtitle = e.target.value;
                                setSections(updated);
                              }}
                              placeholder="Precinct Subtitle"
                              className="w-full px-2.5 py-1 bg-stone-50 border border-stone-200 rounded text-xs italic font-serif"
                            />
                            <textarea
                              rows={3}
                              value={sec.body || ""}
                              onChange={(e) => {
                                const updated = [...sections];
                                updated[idx].body = e.target.value;
                                setSections(updated);
                              }}
                              placeholder="Walking route prose..."
                              className="w-full p-2 bg-stone-50 border border-stone-200 rounded text-xs font-serif leading-relaxed"
                            />
                            <div className="pt-1">
                              <label className="block text-[9px] uppercase tracking-wider text-stone-500 mb-1">
                                Stop Photo (Cloudinary)
                              </label>
                              <CloudinaryUploader
                                label="Stop Photo"
                                currentImageUrl={sec.image}
                                onUploadSuccess={(url) => {
                                  const updated = [...sections];
                                  updated[idx].image = url;
                                  setSections(updated);
                                }}
                                aspectRatio="aspect-[16/10]"
                              />
                            </div>
                          </div>
                        )}

                        {sec.type === "curator_quote" && (
                          <div className="space-y-2">
                            <textarea
                              rows={2}
                              value={sec.quote || ""}
                              onChange={(e) => {
                                const updated = [...sections];
                                updated[idx].quote = e.target.value;
                                setSections(updated);
                              }}
                              placeholder="Quote"
                              className="w-full p-2 bg-stone-50 border border-stone-200 rounded text-xs italic font-serif"
                            />
                            <input
                              type="text"
                              value={sec.author || ""}
                              onChange={(e) => {
                                const updated = [...sections];
                                updated[idx].author = e.target.value;
                                setSections(updated);
                              }}
                              placeholder="Author Byline"
                              className="w-full px-2.5 py-1 bg-stone-50 border border-stone-200 rounded text-xs uppercase"
                            />
                          </div>
                        )}

                        {sec.type === "photo_break" && (
                          <div className="space-y-2">
                            <CloudinaryUploader
                              label="Photo Break Visual"
                              currentImageUrl={sec.image}
                              onUploadSuccess={(url) => {
                                const updated = [...sections];
                                updated[idx].image = url;
                                setSections(updated);
                              }}
                              aspectRatio="aspect-[16/9]"
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: GUIDE DETAILS */}
            {activeInspectorTab === "metadata" && (
              <div className="space-y-3.5">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-stone-500 font-semibold mb-1">
                    Guide Title *
                  </label>
                  <input
                    type="text"
                    value={draft.title}
                    onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                    className="w-full px-3 py-1.5 bg-stone-50 border border-stone-200 rounded text-xs font-editorial-serif text-sm focus:outline-none focus:border-stone-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-stone-500 font-semibold mb-1">
                      City
                    </label>
                    <select
                      value={draft.city}
                      onChange={(e) => setDraft({ ...draft, city: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded text-xs"
                    >
                      <option value="Melbourne">Melbourne</option>
                      <option value="Sydney">Sydney</option>
                      <option value="Brisbane">Brisbane</option>
                      <option value="Perth">Perth</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-stone-500 font-semibold mb-1">
                      Reading Time
                    </label>
                    <input
                      type="text"
                      value={draft.readingTime}
                      onChange={(e) => setDraft({ ...draft, readingTime: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-stone-500 font-semibold mb-1">
                    Editorial Subtitle
                  </label>
                  <textarea
                    rows={3}
                    value={draft.subtitle}
                    onChange={(e) => setDraft({ ...draft, subtitle: e.target.value })}
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded text-xs italic font-serif leading-relaxed"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-stone-500 font-semibold mb-1">
                    Category Kicker
                  </label>
                  <input
                    type="text"
                    value={draft.kicker}
                    onChange={(e) => setDraft({ ...draft, kicker: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded text-xs font-mono"
                  />
                </div>
              </div>
            )}

            {/* TAB 3: HERO PHOTOS */}
            {activeInspectorTab === "visuals" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-stone-500 font-semibold mb-1">
                    Primary Hero Collage Visual (Cloudinary)
                  </label>
                  <CloudinaryUploader
                    label="Hero Visual"
                    currentImageUrl={draft.heroImage}
                    onUploadSuccess={(url) => setDraft({ ...draft, heroImage: url })}
                    aspectRatio="aspect-[16/10]"
                  />
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* RIGHT LIVE CANVAS VIEWPORT */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8 bg-stone-200/70 flex flex-col items-center justify-start">
          <div
            className={`w-full bg-[#FAF8F5] border border-stone-300 shadow-xl transition-all duration-300 flex flex-col ${
              viewport === "desktop"
                ? "max-w-[1240px]"
                : viewport === "tablet"
                ? "max-w-[768px] rounded-lg overflow-hidden my-4"
                : "max-w-[380px] rounded-2xl overflow-hidden my-4 border-4 border-stone-800"
            }`}
          >
            {/* Browser Bar */}
            <div className="bg-stone-100/90 border-b border-stone-200 px-4 py-2 flex items-center justify-between text-xs text-stone-500 shrink-0">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              </div>
              <div className="px-3 py-0.5 bg-white border border-stone-200 rounded font-mono text-[10px] text-stone-600 truncate max-w-xs">
                https://designersale.com.au/guides/{draft.id}
              </div>
              <div className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-800">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>{isEditMode ? "Live Guide Studio" : "Live Guide Preview"}</span>
              </div>
            </div>

            {/* CANVAS BODY: THE ACTUAL CURATED GUIDE PAGE */}
            <div className="p-4 sm:p-8 lg:p-10 space-y-10 select-text">
              {/* Header */}
              <header className="max-w-3xl space-y-4 pb-8 border-b border-stone-200">
                <span className="font-editorial-sans text-[9px] uppercase tracking-[0.25em] font-semibold text-stone-500 block">
                  {draft.kicker || "01 / CURATED CITY EDITORIAL"}
                </span>

                <h1 className="font-editorial-serif text-[38px] sm:text-[50px] leading-[1.04] font-normal text-stone-900 tracking-[-0.01em]">
                  {draft.title}
                </h1>

                <p className="font-editorial-serif italic text-lg sm:text-2xl leading-relaxed text-stone-700">
                  {draft.subtitle}
                </p>

                <div className="pt-3 flex flex-wrap items-center gap-4 text-stone-500 text-xs font-editorial-sans text-[8.5px] uppercase tracking-[0.2em] border-t border-stone-100">
                  <span>Curated by DS/ Editorial Board</span>
                  <span className="text-stone-300">·</span>
                  <span>{draft.readingTime}</span>
                  <span className="text-stone-300">·</span>
                  <span className="text-emerald-800 font-semibold">{cityBoutiques.length} Boutiques Featured</span>
                </div>
              </header>

              {/* Hero Image Collage */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="md:col-span-8 relative h-[320px] sm:h-[420px] bg-stone-200 overflow-hidden border border-stone-200 group">
                  <Image
                    src={draft.heroImage}
                    alt={draft.title}
                    fill
                    priority
                    className="object-cover"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-4 text-white">
                    <span className="font-editorial-sans text-[8px] uppercase tracking-[0.2em] text-stone-300">
                      {draft.city.toUpperCase()} ARCHITECTURAL PRECINCT
                    </span>
                    <p className="font-editorial-serif italic text-sm mt-0.5">
                      Historic storefront draped in botanical greenery
                    </p>
                  </div>

                  {isEditMode && (
                    <button
                      type="button"
                      onClick={() => setActiveInspectorTab("visuals")}
                      className="absolute top-3 right-3 bg-white/95 text-stone-800 text-[10px] font-editorial-sans uppercase tracking-[0.16em] px-2.5 py-1.5 rounded shadow border border-stone-300 flex items-center gap-1.5"
                    >
                      <Camera className="w-3 h-3 text-stone-600" />
                      <span>Edit Hero Photo</span>
                    </button>
                  )}
                </div>

                <div className="md:col-span-4 relative h-[320px] sm:h-[420px] bg-stone-200 overflow-hidden border border-stone-200">
                  <Image
                    src="/images/generated/melbourne-laneway.jpg"
                    alt="Cobblestone laneway"
                    fill
                    className="object-cover"
                  />
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

              {/* Dynamic Itinerary Sections */}
              <div className="space-y-12 max-w-3xl mx-auto pt-6">
                {sections.map((sec, idx) => (
                  <div key={sec.id} className="space-y-4">
                    {sec.type === "itinerary_stop" && (
                      <div className="space-y-4 pb-8 border-b border-stone-200">
                        <div className="space-y-1">
                          <span className="font-editorial-sans text-[9px] uppercase tracking-[0.2em] font-semibold text-stone-500">
                            ITINERARY STOP 0{idx + 1}
                          </span>
                          <h3 className="font-editorial-serif text-2xl font-normal text-stone-900">
                            {sec.title}
                          </h3>
                          {sec.subtitle && (
                            <p className="font-serif italic text-sm text-stone-600">
                              {sec.subtitle}
                            </p>
                          )}
                        </div>

                        {sec.image && (
                          <div className="relative h-[280px] sm:h-[340px] w-full bg-stone-200 overflow-hidden border border-stone-200">
                            <Image src={sec.image} alt={sec.title || "Stop"} fill className="object-cover" />
                            {sec.imageCaption && (
                              <div className="absolute bottom-2 left-2 bg-white/90 px-2 py-0.5 text-[9px] font-editorial-sans uppercase tracking-wider text-stone-700">
                                {sec.imageCaption}
                              </div>
                            )}
                          </div>
                        )}

                        <div className="font-editorial-serif text-[15px] sm:text-base leading-[1.85] text-stone-800 space-y-3">
                          {sec.body?.split("\n\n").map((p, i) => (
                            <p key={i}>{p}</p>
                          ))}
                        </div>
                      </div>
                    )}

                    {sec.type === "curator_quote" && (
                      <div className="py-8 px-6 sm:px-8 border-y border-stone-300 bg-white/80 my-8">
                        <p className="font-editorial-serif italic text-xl sm:text-2xl text-stone-900 leading-relaxed text-center">
                          &ldquo;{sec.quote}&rdquo;
                        </p>
                        <span className="font-editorial-sans text-[8.5px] uppercase tracking-[0.24em] text-stone-400 block text-center mt-2">
                          {sec.author}
                        </span>
                      </div>
                    )}

                    {sec.type === "photo_break" && sec.image && (
                      <div className="relative h-[320px] w-full bg-stone-200 overflow-hidden border border-stone-200 my-6">
                        <Image src={sec.image} alt="Photo break" fill className="object-cover" />
                        {sec.imageCaption && (
                          <div className="absolute bottom-2 left-2 bg-white/90 px-2 py-0.5 text-[9px] font-editorial-sans uppercase tracking-wider text-stone-700">
                            {sec.imageCaption}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Featured Spaces */}
              <div className="pt-10 border-t border-stone-200 space-y-4">
                <span className="font-editorial-sans text-[9px] uppercase tracking-[0.24em] font-semibold text-stone-500 block">
                  FEATURED SPACES IN {draft.city.toUpperCase()} ({cityBoutiques.length})
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {cityBoutiques.map((b) => (
                    <div key={b.id} className="p-3 bg-white border border-stone-200 rounded flex gap-3">
                      <div className="w-16 h-16 relative bg-stone-200 shrink-0 overflow-hidden">
                        <Image src={b.image} alt={b.name} fill className="object-cover" />
                      </div>
                      <div className="space-y-0.5 min-w-0">
                        <span className="font-editorial-sans text-[8px] uppercase tracking-wider text-stone-500 block">
                          {b.neighborhood}
                        </span>
                        <h4 className="font-editorial-serif text-sm font-medium text-stone-900 truncate">
                          {b.name}
                        </h4>
                        <span className="text-[10px] text-stone-500 font-mono block">
                          {b.category} · {b.priceTier}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
