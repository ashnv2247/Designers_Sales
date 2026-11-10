"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { JournalArticle } from "@/data/journal";
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
  BookOpen,
  Calendar,
  User,
  Clock,
  Sparkles,
  Camera,
  ChevronUp,
  ChevronDown,
  Copy,
  Layers,
  Edit3,
} from "lucide-react";

interface ArticleBlock {
  id: string;
  type: "paragraph" | "quote" | "photo";
  text?: string;
  author?: string;
  image?: string;
  caption?: string;
}

interface JournalCanvasStudioProps {
  articles: JournalArticle[];
  onSave: (article: JournalArticle) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onRefresh: () => Promise<void>;
}

export const JournalCanvasStudio: React.FC<JournalCanvasStudioProps> = ({
  articles,
  onSave,
  onDelete,
  onRefresh,
}) => {
  const [selectedArticleId, setSelectedArticleId] = useState<string>(
    articles[0]?.id || "journal-01"
  );
  const [viewport, setViewport] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [isEditMode, setIsEditMode] = useState<boolean>(true);
  const [activeInspectorTab, setActiveInspectorTab] = useState<"sections" | "metadata" | "visuals">("sections");
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  const [draft, setDraft] = useState<JournalArticle | null>(null);
  const [blocks, setBlocks] = useState<ArticleBlock[]>([]);

  useEffect(() => {
    const found = articles.find((a) => a.id === selectedArticleId);
    if (found) {
      setDraft({ ...found });

      // Seed rich narrative blocks from article content
      setBlocks([
        {
          id: "blk-01",
          type: "paragraph",
          text:
            found.content ||
            "In an era dominated by hyper-efficient digital transactions, the physical store has taken on an unexpected secondary role: that of an acoustic and tactile sanctuary.\n\nFrom High Street Armadale to the backstreets of Surry Hills, proprietors are dedicating significant footprint not to inventory density, but to raw stone, unglazed earthenware, and sculptural silence.",
        },
        {
          id: "blk-02",
          type: "quote",
          text: "When a client touches a vessel made from clay dug in the Macedon Ranges, the pace of their breathing changes. The store becomes a memory rather than just a transaction point.",
          author: "MARCUS CHEN · ARCHITECTURAL OBSERVER",
        },
        {
          id: "blk-03",
          type: "photo",
          image: "/images/generated/atelier-showroom.jpg",
          caption: "Natural daylight filtering across brushed travertine surfaces in Fitzroy",
        },
        {
          id: "blk-04",
          type: "paragraph",
          text:
            "This deliberate deceleration marks a watershed moment in Australian retail culture. Rather than attempting to match the limitless choice of the browser window, the country's finest spaces present a curated viewpoint where fewer, better objects are framed with museum-grade precision.",
        },
      ]);
    } else if (articles.length > 0) {
      setDraft({ ...articles[0] });
      setSelectedArticleId(articles[0].id);
    }
  }, [selectedArticleId, articles]);

  if (!draft) {
    return <div className="p-8 text-center text-stone-500 font-mono text-xs">Loading Journal Studio...</div>;
  }

  const handleAddBlock = (type: ArticleBlock["type"]) => {
    const newId = `blk-${Date.now()}`;
    let newBlk: ArticleBlock;

    if (type === "paragraph") {
      newBlk = {
        id: newId,
        type: "paragraph",
        text: "Write new longform editorial narrative here. Use double returns for paragraphs...",
      };
    } else if (type === "quote") {
      newBlk = {
        id: newId,
        type: "quote",
        text: "A pull quote encapsulating the aesthetic philosophy of the piece.",
        author: "CURATORIAL VOICE",
      };
    } else {
      newBlk = {
        id: newId,
        type: "photo",
        image: "/images/discoveries/keep.jpg",
        caption: "Tactile ceramics and artisanal details",
      };
    }

    setBlocks([...blocks, newBlk]);
  };

  const handleMoveBlock = (index: number, direction: "up" | "down") => {
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= blocks.length) return;
    const updated = [...blocks];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;
    setBlocks(updated);
  };

  const handleDeleteBlock = (id: string) => {
    setBlocks(blocks.filter((b) => b.id !== id));
  };

  const handleSave = async () => {
    setSaveStatus("Saving...");
    try {
      const combinedBody = blocks
        .map((b) => {
          if (b.type === "paragraph") return b.text;
          if (b.type === "quote") return `> "${b.text}" — ${b.author}`;
          return `[Photo: ${b.caption}]`;
        })
        .join("\n\n");

      await onSave({
        ...draft,
        content: combinedBody,
      });

      setSaveStatus("Saved to journal!");
      setTimeout(() => setSaveStatus(null), 2500);
    } catch (e: any) {
      setSaveStatus("Error saving.");
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-68px)] bg-stone-100 overflow-hidden select-none">
      {/* -------------------------------------------------------------------- */}
      {/* TOP STUDIO TOOLBAR */}
      {/* -------------------------------------------------------------------- */}
      <header className="h-14 bg-white border-b border-stone-200 px-4 sm:px-6 flex items-center justify-between gap-4 shrink-0 z-20">
        <div className="flex items-center gap-3">
          <label className="text-[10px] font-editorial-sans uppercase tracking-[0.2em] text-stone-500 font-semibold shrink-0 hidden sm:block">
            Article Canvas:
          </label>
          <select
            value={selectedArticleId}
            onChange={(e) => setSelectedArticleId(e.target.value)}
            className="bg-stone-50 border border-stone-300 py-1.5 pl-3 pr-8 rounded text-xs font-editorial-serif text-stone-900 font-medium focus:outline-none focus:border-stone-500 max-w-xs truncate"
          >
            {articles.map((a) => (
              <option key={a.id} value={a.id}>
                {a.title}
              </option>
            ))}
          </select>
        </div>

        {/* Viewport & Mode Toggle */}
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
              <span className="hidden md:inline">Desktop</span>
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
            href="/#journal"
            target="_blank"
            className="px-2.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-300 rounded text-xs font-editorial-sans uppercase tracking-wider inline-flex items-center gap-1 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5 text-stone-600" />
            <span className="hidden lg:inline">View Journal</span>
          </Link>

          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-1.5 bg-[#1C1917] hover:bg-stone-800 text-white rounded text-xs font-editorial-sans uppercase tracking-[0.16em] inline-flex items-center gap-1.5 shadow-2xs transition-colors"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Article</span>
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
              <span>1. Article Blocks</span>
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
              2. Metadata
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
              <span>3. Cover Visual</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs text-stone-800">
            {/* TAB 1: ARTICLE BLOCKS */}
            {activeInspectorTab === "sections" && (
              <div className="space-y-4">
                {/* Add Block Quick Bar */}
                <div className="p-3 bg-stone-50 border border-stone-200 rounded space-y-2">
                  <span className="font-editorial-sans text-[9px] uppercase tracking-[0.2em] font-semibold text-stone-600 block">
                    + Add Content Block:
                  </span>
                  <div className="grid grid-cols-3 gap-1 font-editorial-sans text-[9px] uppercase tracking-wider">
                    <button
                      type="button"
                      onClick={() => handleAddBlock("paragraph")}
                      className="p-2 bg-white hover:bg-stone-100 border border-stone-300 rounded text-center flex flex-col items-center gap-1 transition-colors"
                    >
                      <Plus className="w-3 h-3 text-stone-600" />
                      <span>Prose</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddBlock("quote")}
                      className="p-2 bg-white hover:bg-stone-100 border border-stone-300 rounded text-center flex flex-col items-center gap-1 transition-colors"
                    >
                      <Plus className="w-3 h-3 text-stone-600" />
                      <span>Pull Quote</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddBlock("photo")}
                      className="p-2 bg-white hover:bg-stone-100 border border-stone-300 rounded text-center flex flex-col items-center gap-1 transition-colors"
                    >
                      <Plus className="w-3 h-3 text-stone-600" />
                      <span>Photo</span>
                    </button>
                  </div>
                </div>

                {/* Blocks List */}
                <div className="space-y-3">
                  {blocks.map((blk, idx) => (
                    <div
                      key={blk.id}
                      className="p-3 bg-white border border-stone-200 rounded space-y-2 shadow-2xs"
                    >
                      <div className="flex items-center justify-between pb-1.5 border-b border-stone-100">
                        <span className="font-mono text-[10px] px-1.5 py-0.5 bg-stone-100 rounded text-stone-600 uppercase">
                          0{idx + 1} · {blk.type}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => handleMoveBlock(idx, "up")}
                            className="p-1 text-stone-500 hover:text-stone-900 disabled:opacity-30"
                            title="Move up"
                          >
                            <ChevronUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={idx === blocks.length - 1}
                            onClick={() => handleMoveBlock(idx, "down")}
                            className="p-1 text-stone-500 hover:text-stone-900 disabled:opacity-30"
                            title="Move down"
                          >
                            <ChevronDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteBlock(blk.id)}
                            className="p-1 text-stone-400 hover:text-red-700"
                            title="Delete block"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {blk.type === "paragraph" && (
                        <textarea
                          rows={4}
                          value={blk.text || ""}
                          onChange={(e) => {
                            const updated = [...blocks];
                            updated[idx].text = e.target.value;
                            setBlocks(updated);
                          }}
                          placeholder="Story prose..."
                          className="w-full p-2 bg-stone-50 border border-stone-200 rounded text-xs font-serif leading-relaxed"
                        />
                      )}

                      {blk.type === "quote" && (
                        <div className="space-y-1.5">
                          <textarea
                            rows={2}
                            value={blk.text || ""}
                            onChange={(e) => {
                              const updated = [...blocks];
                              updated[idx].text = e.target.value;
                              setBlocks(updated);
                            }}
                            placeholder="Pull Quote"
                            className="w-full p-2 bg-stone-50 border border-stone-200 rounded text-xs italic font-serif"
                          />
                          <input
                            type="text"
                            value={blk.author || ""}
                            onChange={(e) => {
                              const updated = [...blocks];
                              updated[idx].author = e.target.value;
                              setBlocks(updated);
                            }}
                            placeholder="Author Byline"
                            className="w-full px-2 py-1 bg-stone-50 border border-stone-200 rounded text-xs font-mono uppercase text-[10px]"
                          />
                        </div>
                      )}

                      {blk.type === "photo" && (
                        <div className="space-y-2">
                          <CloudinaryUploader
                            label="In-Article Photo"
                            currentImageUrl={blk.image}
                            onUploadSuccess={(url) => {
                              const updated = [...blocks];
                              updated[idx].image = url;
                              setBlocks(updated);
                            }}
                            aspectRatio="aspect-[16/10]"
                          />
                          <input
                            type="text"
                            value={blk.caption || ""}
                            onChange={(e) => {
                              const updated = [...blocks];
                              updated[idx].caption = e.target.value;
                              setBlocks(updated);
                            }}
                            placeholder="Photo Caption"
                            className="w-full px-2 py-1 bg-stone-50 border border-stone-200 rounded text-xs"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 2: METADATA */}
            {activeInspectorTab === "metadata" && (
              <div className="space-y-3.5">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-stone-500 font-semibold mb-1">
                    Article Title *
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
                      Category
                    </label>
                    <select
                      value={draft.category}
                      onChange={(e) => setDraft({ ...draft, category: e.target.value })}
                      className="w-full px-2 py-1.5 bg-stone-50 border border-stone-200 rounded text-xs"
                    >
                      <option value="RETAIL CULTURE">RETAIL CULTURE</option>
                      <option value="VINTAGE & ARCHIVAL">VINTAGE & ARCHIVAL</option>
                      <option value="CRAFT & DESIGN">CRAFT & DESIGN</option>
                      <option value="ARCHITECTURE">ARCHITECTURE</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-stone-500 font-semibold mb-1">
                      Reading Time
                    </label>
                    <input
                      type="text"
                      value={draft.readTime}
                      onChange={(e) => setDraft({ ...draft, readTime: e.target.value })}
                      className="w-full px-2 py-1.5 bg-stone-50 border border-stone-200 rounded text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-stone-500 font-semibold mb-1">
                      Author
                    </label>
                    <input
                      type="text"
                      value={draft.author}
                      onChange={(e) => setDraft({ ...draft, author: e.target.value })}
                      className="w-full px-2 py-1.5 bg-stone-50 border border-stone-200 rounded text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-stone-500 font-semibold mb-1">
                      Date
                    </label>
                    <input
                      type="text"
                      value={draft.date}
                      onChange={(e) => setDraft({ ...draft, date: e.target.value })}
                      className="w-full px-2 py-1.5 bg-stone-50 border border-stone-200 rounded text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-stone-500 font-semibold mb-1">
                    Editorial Excerpt
                  </label>
                  <textarea
                    rows={3}
                    value={draft.excerpt}
                    onChange={(e) => setDraft({ ...draft, excerpt: e.target.value })}
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded text-xs italic font-serif leading-relaxed"
                  />
                </div>
              </div>
            )}

            {/* TAB 3: COVER VISUAL */}
            {activeInspectorTab === "visuals" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-stone-500 font-semibold mb-1">
                    Article Cover Visual (Cloudinary)
                  </label>
                  <CloudinaryUploader
                    label="Cover Image"
                    currentImageUrl={draft.image}
                    onUploadSuccess={(url) => setDraft({ ...draft, image: url })}
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
                https://designersale.com.au/journal/{draft.id}
              </div>
              <div className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-800">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>{isEditMode ? "Live Article Studio" : "Live Article Preview"}</span>
              </div>
            </div>

            {/* CANVAS BODY: THE ACTUAL EDITORIAL ARTICLE PAGE */}
            <article className="p-4 sm:p-8 lg:p-12 space-y-8 select-text max-w-3xl mx-auto w-full">
              {/* Header */}
              <header className="space-y-4 pb-6 border-b border-stone-200">
                <div className="flex items-center gap-3 text-[9px] font-editorial-sans uppercase tracking-[0.24em] text-stone-500 font-semibold">
                  <span className="px-2 py-0.5 bg-stone-200 text-stone-800">
                    {draft.category}
                  </span>
                  <span>{draft.date}</span>
                  <span>·</span>
                  <span>{draft.readTime}</span>
                </div>

                <h1 className="font-editorial-serif text-[34px] sm:text-[48px] leading-[1.06] font-normal text-stone-900 tracking-[-0.01em]">
                  {draft.title}
                </h1>

                <p className="font-editorial-serif italic text-lg sm:text-2xl leading-relaxed text-stone-700">
                  {draft.excerpt}
                </p>

                <div className="pt-2 text-stone-500 text-xs font-editorial-sans text-[9px] uppercase tracking-[0.2em]">
                  Dispatched by <span className="font-semibold text-stone-900">{draft.author}</span>
                </div>
              </header>

              {/* Cover Image */}
              <div className="relative h-[320px] sm:h-[460px] w-full bg-stone-200 overflow-hidden border border-stone-200 group">
                <Image
                  src={draft.image}
                  alt={draft.title}
                  fill
                  priority
                  className="object-cover"
                />
                {isEditMode && (
                  <button
                    type="button"
                    onClick={() => setActiveInspectorTab("visuals")}
                    className="absolute top-3 right-3 bg-white/95 text-stone-800 text-[10px] font-editorial-sans uppercase tracking-[0.16em] px-2.5 py-1.5 rounded shadow border border-stone-300 flex items-center gap-1.5"
                  >
                    <Camera className="w-3 h-3 text-stone-600" />
                    <span>Edit Cover Photo</span>
                  </button>
                )}
              </div>

              {/* Narrative Blocks */}
              <div className="space-y-8 pt-4">
                {blocks.map((blk, idx) => (
                  <div key={blk.id}>
                    {blk.type === "paragraph" && (
                      <div className="font-editorial-serif text-[16px] sm:text-[17px] leading-[1.85] text-stone-800 space-y-4">
                        {blk.text?.split("\n\n").map((para, i) => (
                          <p
                            key={i}
                            className={idx === 0 && i === 0 ? "first-letter:text-4xl first-letter:font-editorial-serif first-letter:float-left first-letter:mr-3 first-letter:leading-none text-stone-900" : ""}
                          >
                            {para}
                          </p>
                        ))}
                      </div>
                    )}

                    {blk.type === "quote" && (
                      <div className="py-8 px-6 sm:px-8 border-y border-stone-300 bg-white/80 my-8">
                        <p className="font-editorial-serif italic text-xl sm:text-2xl text-stone-900 leading-relaxed text-center">
                          &ldquo;{blk.text}&rdquo;
                        </p>
                        <span className="font-editorial-sans text-[8.5px] uppercase tracking-[0.24em] text-stone-400 block text-center mt-2">
                          {blk.author}
                        </span>
                      </div>
                    )}

                    {blk.type === "photo" && blk.image && (
                      <div className="space-y-1.5 my-6">
                        <div className="relative h-[320px] sm:h-[400px] w-full bg-stone-200 overflow-hidden border border-stone-200">
                          <Image src={blk.image} alt={blk.caption || "Photo"} fill className="object-cover" />
                        </div>
                        {blk.caption && (
                          <p className="font-editorial-sans text-[9px] uppercase tracking-wider text-stone-500 text-center">
                            {blk.caption}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </article>
          </div>
        </main>
      </div>
    </div>
  );
};
