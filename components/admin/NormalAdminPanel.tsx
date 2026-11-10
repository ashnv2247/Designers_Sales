"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Boutique } from "@/data/boutiques";
import { Product } from "@/types/product";
import { JournalArticle } from "@/data/journal";
import { GuideItem } from "@/lib/db";
import { CloudinaryUploader } from "@/components/shared/CloudinaryUploader";
import {
  Store,
  Package,
  BookOpen,
  FileText,
  CloudUpload,
  Database,
  Plus,
  Trash2,
  Edit2,
  RefreshCw,
  Search,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Eye,
  Sliders,
  X,
  Save,
  Menu,
  ChevronRight,
  Sparkles,
} from "lucide-react";

interface NormalAdminPanelProps {
  onOpenStudio?: () => void;
}

export const NormalAdminPanel: React.FC<NormalAdminPanelProps> = ({ onOpenStudio }) => {
  const [activeTab, setActiveTab] = useState<
    "boutiques" | "products" | "guides" | "journal" | "media" | "database"
  >("boutiques");

  // Mobile sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Data states
  const [boutiques, setBoutiques] = useState<Boutique[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [guides, setGuides] = useState<GuideItem[]>([]);
  const [journalArticles, setJournalArticles] = useState<JournalArticle[]>([]);
  const [dbStatus, setDbStatus] = useState<{ supabaseConnected: boolean; mode: string }>({
    supabaseConnected: false,
    mode: "Checking...",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Modals
  const [isBoutiqueModalOpen, setIsBoutiqueModalOpen] = useState(false);
  const [editingBoutique, setEditingBoutique] = useState<Boutique | null>(null);

  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);
  const [editingGuide, setEditingGuide] = useState<GuideItem | null>(null);

  const [isJournalModalOpen, setIsJournalModalOpen] = useState(false);
  const [editingJournal, setEditingJournal] = useState<JournalArticle | null>(null);

  const [testCloudinaryUrl, setTestCloudinaryUrl] = useState("");
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  // Fetch all initial data
  const loadData = async () => {
    setIsLoading(true);
    try {
      const [resBoutiques, resProducts, resGuides, resJournal, resStatus] = await Promise.all([
        fetch("/api/boutiques").then((r) => r.json()),
        fetch("/api/products").then((r) => r.json()),
        fetch("/api/guides").then((r) => r.json()),
        fetch("/api/journal").then((r) => r.json()),
        fetch("/api/seed").then((r) => r.json()),
      ]);

      if (resBoutiques.boutiques) setBoutiques(resBoutiques.boutiques);
      if (resProducts.products) setProducts(resProducts.products);
      if (resGuides.guides) setGuides(resGuides.guides);
      if (resJournal.articles) setJournalArticles(resJournal.articles);
      if (resStatus) setDbStatus(resStatus);
    } catch (e) {
      console.error("Failed to fetch admin data:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Boutique Form Actions
  const handleSaveBoutique = async (boutiqueData: Boutique) => {
    const isEdit = Boolean(editingBoutique);
    const method = isEdit ? "PUT" : "POST";
    const res = await fetch("/api/boutiques", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(boutiqueData),
    });
    if (res.ok) {
      await loadData();
      setIsBoutiqueModalOpen(false);
      setEditingBoutique(null);
    } else {
      alert("Failed to save boutique.");
    }
  };

  const handleDeleteBoutique = async (id: string) => {
    if (!confirm("Are you sure you want to delete this boutique?")) return;
    const res = await fetch(`/api/boutiques?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      await loadData();
    }
  };

  // Product Form Actions
  const handleSaveProduct = async (productData: Product) => {
    const isEdit = Boolean(editingProduct);
    const method = isEdit ? "PUT" : "POST";
    const res = await fetch("/api/products", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(productData),
    });
    if (res.ok) {
      await loadData();
      setIsProductModalOpen(false);
      setEditingProduct(null);
    } else {
      alert("Failed to save product.");
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    const res = await fetch(`/api/products?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      await loadData();
    }
  };

  // Guide Form Actions
  const handleSaveGuide = async (guideData: GuideItem) => {
    const isEdit = Boolean(editingGuide);
    const method = isEdit ? "PUT" : "POST";
    const res = await fetch("/api/guides", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(guideData),
    });
    if (res.ok) {
      await loadData();
      setIsGuideModalOpen(false);
      setEditingGuide(null);
    } else {
      alert("Failed to save guide.");
    }
  };

  const handleDeleteGuide = async (id: string) => {
    if (!confirm("Are you sure you want to delete this guide?")) return;
    const res = await fetch(`/api/guides?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      await loadData();
    }
  };

  // Journal/Blog Form Actions
  const handleSaveJournal = async (articleData: JournalArticle) => {
    const isEdit = Boolean(editingJournal);
    const method = isEdit ? "PUT" : "POST";
    const res = await fetch("/api/journal", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(articleData),
    });
    if (res.ok) {
      await loadData();
      setIsJournalModalOpen(false);
      setEditingJournal(null);
    } else {
      alert("Failed to save journal article.");
    }
  };

  const handleDeleteJournal = async (id: string) => {
    if (!confirm("Are you sure you want to delete this article?")) return;
    const res = await fetch(`/api/journal?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      await loadData();
    }
  };

  // Sync Supabase Database
  const handleSyncDatabase = async () => {
    setSyncMessage("Syncing database with Supabase...");
    try {
      const res = await fetch("/api/seed", { method: "POST" });
      const data = await res.json();
      setSyncMessage(data.message || "Database sync executed.");
      await loadData();
    } catch (e: any) {
      setSyncMessage(`Error: ${e.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-900 flex select-none">
      {/* -------------------------------------------------------------------- */}
      {/* SIDEBAR NAVIGATION (Desktop Sticky & Mobile Slideover) */}
      {/* -------------------------------------------------------------------- */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#171614] text-white flex flex-col justify-between shrink-0 border-r border-stone-800 transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full justify-between p-5">
          {/* Top: Logo & System Indicator */}
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-stone-800">
              <Link href="/" className="font-editorial-serif text-xl tracking-wider text-white inline-flex items-center">
                <span className="italic font-light">DS</span>
                <span className="font-light text-sm ml-0.5 opacity-80">/</span>
                <span className="font-editorial-sans text-[9px] uppercase tracking-[0.24em] text-stone-400 font-semibold ml-2.5">
                  ADMIN STUDIO
                </span>
              </Link>
              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden text-stone-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Status Pills */}
            <div className="space-y-1.5 font-mono text-[9px]">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-stone-900 border border-stone-800 text-stone-300">
                <span className={`w-2 h-2 rounded-full ${dbStatus.supabaseConnected ? "bg-emerald-400" : "bg-amber-400 animate-pulse"}`} />
                <span>DB: {dbStatus.supabaseConnected ? "Supabase Live" : "Local Dynamic Store"}</span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-stone-900 border border-stone-800 text-stone-300">
                <CloudUpload className="w-3 h-3 text-cyan-400" />
                <span>Cloudinary: h8nmncfh</span>
              </div>
            </div>

            {/* Navigation Menu */}
            <nav className="space-y-1 pt-2">
              <span className="font-editorial-sans text-[8px] uppercase tracking-[0.24em] font-semibold text-stone-500 block px-3 pb-1">
                DIRECTORY & COMMERCE
              </span>

              <button
                type="button"
                onClick={() => {
                  setActiveTab("boutiques");
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded text-xs font-editorial-sans uppercase tracking-[0.14em] transition-all ${
                  activeTab === "boutiques"
                    ? "bg-white text-stone-900 font-semibold shadow-xs"
                    : "text-stone-400 hover:text-white hover:bg-stone-900/60"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Store className="w-4 h-4" />
                  <span>Boutiques & Shops</span>
                </div>
                <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-stone-800/80 text-stone-300">
                  {boutiques.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab("products");
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded text-xs font-editorial-sans uppercase tracking-[0.14em] transition-all ${
                  activeTab === "products"
                    ? "bg-white text-stone-900 font-semibold shadow-xs"
                    : "text-stone-400 hover:text-white hover:bg-stone-900/60"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Package className="w-4 h-4" />
                  <span>Dynamic Products</span>
                </div>
                <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-stone-800/80 text-stone-300">
                  {products.length}
                </span>
              </button>

              <span className="font-editorial-sans text-[8px] uppercase tracking-[0.24em] font-semibold text-stone-500 block px-3 pt-5 pb-1">
                EDITORIAL & CURATION
              </span>

              <button
                type="button"
                onClick={() => {
                  setActiveTab("guides");
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded text-xs font-editorial-sans uppercase tracking-[0.14em] transition-all ${
                  activeTab === "guides"
                    ? "bg-white text-stone-900 font-semibold shadow-xs"
                    : "text-stone-400 hover:text-white hover:bg-stone-900/60"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <BookOpen className="w-4 h-4" />
                  <span>City Guides Pages</span>
                </div>
                <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-stone-800/80 text-stone-300">
                  {guides.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab("journal");
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded text-xs font-editorial-sans uppercase tracking-[0.14em] transition-all ${
                  activeTab === "journal"
                    ? "bg-white text-stone-900 font-semibold shadow-xs"
                    : "text-stone-400 hover:text-white hover:bg-stone-900/60"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <FileText className="w-4 h-4" />
                  <span>Blog & Journal Posts</span>
                </div>
                <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-stone-800/80 text-stone-300">
                  {journalArticles.length}
                </span>
              </button>

              <span className="font-editorial-sans text-[8px] uppercase tracking-[0.24em] font-semibold text-stone-500 block px-3 pt-5 pb-1">
                INFRASTRUCTURE & MEDIA
              </span>

              <button
                type="button"
                onClick={() => {
                  setActiveTab("media");
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded text-xs font-editorial-sans uppercase tracking-[0.14em] transition-all ${
                  activeTab === "media"
                    ? "bg-white text-stone-900 font-semibold shadow-xs"
                    : "text-stone-400 hover:text-white hover:bg-stone-900/60"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <CloudUpload className="w-4 h-4" />
                  <span>Cloudinary Media</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab("database");
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded text-xs font-editorial-sans uppercase tracking-[0.14em] transition-all ${
                  activeTab === "database"
                    ? "bg-white text-stone-900 font-semibold shadow-xs"
                    : "text-stone-400 hover:text-white hover:bg-stone-900/60"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Database className="w-4 h-4" />
                  <span>Supabase Schema & Sync</span>
                </div>
              </button>
            </nav>
            {/* Live On-Page Studio Shortcut */}
            {onOpenStudio && (
              <div className="pt-3">
                <button
                  type="button"
                  onClick={() => {
                    onOpenStudio();
                    setSidebarOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded bg-stone-900 border border-amber-900/40 text-amber-300 hover:text-white hover:bg-stone-800 text-xs font-editorial-sans uppercase tracking-[0.14em] transition-all shadow-xs"
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Live On-Page Studio</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                </button>
              </div>
            )}
          </div>

          {/* Bottom: Public Links */}
          <div className="pt-4 border-t border-stone-800 space-y-2 text-stone-400 text-xs">
            <span className="font-editorial-sans text-[8px] uppercase tracking-[0.2em] font-semibold text-stone-500 block">
              PUBLIC DISCOVERY VIEWS
            </span>
            <div className="space-y-1">
              <Link
                href="/"
                target="_blank"
                className="w-full flex items-center justify-between px-2 py-1 hover:text-white text-[11px] font-sans transition-colors"
              >
                <span>Landing Page</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
              <Link
                href="/directory"
                target="_blank"
                className="w-full flex items-center justify-between px-2 py-1 hover:text-white text-[11px] font-sans transition-colors"
              >
                <span>Directory Index</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
              <Link
                href="/shop"
                target="_blank"
                className="w-full flex items-center justify-between px-2 py-1 hover:text-white text-[11px] font-sans transition-colors"
              >
                <span>Boutique Profile (CMS)</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
              <Link
                href="/guides/melbourne-edit"
                target="_blank"
                className="w-full flex items-center justify-between px-2 py-1 hover:text-white text-[11px] font-sans transition-colors"
              >
                <span>Curated Melbourne Guide</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      </aside>

      {/* Backdrop for mobile sidebar */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* -------------------------------------------------------------------- */}
      {/* MAIN VIEWPORT (Offset by sidebar on desktop) */}
      {/* -------------------------------------------------------------------- */}
      <div className="flex-1 min-w-0 lg:ml-64 flex flex-col min-h-screen">
        {/* Top Viewport Header */}
        <header className="sticky top-0 z-30 bg-[#FAF8F5]/90 backdrop-blur-md border-b border-stone-200/80 px-5 sm:px-8 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-1.5 text-stone-700 hover:text-stone-950 border border-stone-300 rounded"
              aria-label="Open sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div>
              <span className="font-editorial-sans text-[8.5px] uppercase tracking-[0.2em] font-semibold text-stone-400 block">
                ADMINISTRATION / {activeTab.toUpperCase()}
              </span>
              <h1 className="font-editorial-serif text-2xl sm:text-3xl font-normal text-stone-900">
                {activeTab === "boutiques" && "Curated Boutiques & Shop Profiles"}
                {activeTab === "products" && "Dynamic Products & Inventory"}
                {activeTab === "guides" && "Curated City Guides Pages"}
                {activeTab === "journal" && "Editorial Journal & Blog Posts"}
                {activeTab === "media" && "Cloudinary Media Asset Studio"}
                {activeTab === "database" && "Supabase Database & Synchronization"}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenStudio && (
              <button
                type="button"
                onClick={onOpenStudio}
                className="px-3.5 py-2 bg-white hover:bg-stone-100 text-stone-800 border border-stone-300 rounded text-xs font-editorial-sans uppercase tracking-[0.16em] inline-flex items-center gap-1.5 shadow-2xs transition-colors"
                title="Switch to Kaftan-style live on-page display editor"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Live On-Page Studio</span>
              </button>
            )}

            {activeTab === "boutiques" && (
              <button
                type="button"
                onClick={() => {
                  setEditingBoutique(null);
                  setIsBoutiqueModalOpen(true);
                }}
                className="px-3.5 py-2 bg-[#1C1917] hover:bg-stone-800 text-white rounded text-xs font-editorial-sans uppercase tracking-[0.16em] inline-flex items-center gap-1.5 shadow-2xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Boutique</span>
              </button>
            )}

            {activeTab === "products" && (
              <button
                type="button"
                onClick={() => {
                  setEditingProduct(null);
                  setIsProductModalOpen(true);
                }}
                className="px-3.5 py-2 bg-[#1C1917] hover:bg-stone-800 text-white rounded text-xs font-editorial-sans uppercase tracking-[0.16em] inline-flex items-center gap-1.5 shadow-2xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Product</span>
              </button>
            )}

            {activeTab === "guides" && (
              <button
                type="button"
                onClick={() => {
                  setEditingGuide(null);
                  setIsGuideModalOpen(true);
                }}
                className="px-3.5 py-2 bg-[#1C1917] hover:bg-stone-800 text-white rounded text-xs font-editorial-sans uppercase tracking-[0.16em] inline-flex items-center gap-1.5 shadow-2xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create City Guide</span>
              </button>
            )}

            {activeTab === "journal" && (
              <button
                type="button"
                onClick={() => {
                  setEditingJournal(null);
                  setIsJournalModalOpen(true);
                }}
                className="px-3.5 py-2 bg-[#1C1917] hover:bg-stone-800 text-white rounded text-xs font-editorial-sans uppercase tracking-[0.16em] inline-flex items-center gap-1.5 shadow-2xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Blog Article</span>
              </button>
            )}
          </div>
        </header>

        {/* View Content Body */}
        <main className="p-5 sm:p-8 space-y-6 flex-1">
          {/* ---------------------------------------------------------------- */}
          {/* TAB 1: BOUTIQUES & EDITORIAL DESCRIPTION CMS */}
          {/* ---------------------------------------------------------------- */}
          {activeTab === "boutiques" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search boutique name, precinct or city..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 bg-white border border-stone-200 text-xs focus:outline-none focus:border-stone-500 shadow-2xs"
                  />
                </div>
                <span className="text-xs text-stone-500 font-editorial-sans uppercase tracking-wider">
                  Showing {boutiques.length} Boutiques
                </span>
              </div>

              <div className="bg-white border border-stone-200 rounded overflow-hidden shadow-2xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-stone-100/70 border-b border-stone-200 text-stone-600 font-editorial-sans uppercase tracking-wider text-[9px]">
                      <tr>
                        <th className="py-3 px-4">Image</th>
                        <th className="py-3 px-4">Boutique & Category</th>
                        <th className="py-3 px-4">Location</th>
                        <th className="py-3 px-4">Editorial Prose & Stories</th>
                        <th className="py-3 px-4">Tier</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {boutiques
                        .filter(
                          (b) =>
                            !searchQuery ||
                            b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            b.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            b.neighborhood.toLowerCase().includes(searchQuery.toLowerCase())
                        )
                        .map((boutique) => (
                          <tr key={boutique.id} className="hover:bg-stone-50/70 transition-colors">
                            <td className="py-3 px-4">
                              <div className="w-12 h-9 relative bg-stone-200 overflow-hidden border border-stone-300">
                                <Image
                                  src={boutique.image}
                                  alt={boutique.name}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="font-editorial-serif text-sm font-medium text-stone-900">
                                {boutique.name}
                              </div>
                              <span className="font-editorial-sans text-[8px] uppercase tracking-wider text-stone-500">
                                {boutique.category}
                              </span>
                            </td>
                            <td className="py-3 px-4 font-mono text-[11px] text-stone-600">
                              {boutique.city} · {boutique.neighborhood}
                            </td>
                            <td className="py-3 px-4 text-stone-500 text-[11px] max-w-[280px]">
                              <p className="line-clamp-2 italic font-serif">
                                {boutique.description}
                              </p>
                              {boutique.curatorNote && (
                                <span className="text-[10px] text-emerald-800 font-medium block mt-0.5">
                                  Curator: &ldquo;{boutique.curatorNote}&rdquo;
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-4 font-mono text-[10px] text-stone-700">
                              {boutique.priceTier}
                            </td>
                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Link
                                  href="/shop"
                                  target="_blank"
                                  className="p-1 text-stone-400 hover:text-stone-900 transition-colors"
                                  title="Open Block CMS Studio for this shop"
                                >
                                  <Sliders className="w-3.5 h-3.5 text-stone-700" />
                                </Link>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingBoutique(boutique);
                                    setIsBoutiqueModalOpen(true);
                                  }}
                                  className="p-1 text-stone-500 hover:text-stone-900 transition-colors"
                                  title="Edit Boutique & Editorial Prose"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteBoutique(boutique.id)}
                                  className="p-1 text-stone-400 hover:text-red-700 transition-colors"
                                  title="Delete Boutique"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ---------------------------------------------------------------- */}
          {/* TAB 2: PRODUCTS INVENTORY */}
          {/* ---------------------------------------------------------------- */}
          {activeTab === "products" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-editorial-sans text-[10px] uppercase tracking-[0.2em] text-stone-500 font-semibold">
                  Dynamic Products Database ({products.length} Items)
                </span>
              </div>

              <div className="bg-white border border-stone-200 rounded overflow-hidden shadow-2xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-stone-100/70 border-b border-stone-200 text-stone-600 font-editorial-sans uppercase tracking-wider text-[9px]">
                      <tr>
                        <th className="py-3 px-4">Image</th>
                        <th className="py-3 px-4">Product Name & Designer</th>
                        <th className="py-3 px-4">Boutique Origin</th>
                        <th className="py-3 px-4">Category</th>
                        <th className="py-3 px-4">Price (AUD)</th>
                        <th className="py-3 px-4">Availability</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {products.map((prod) => (
                        <tr key={prod.id} className="hover:bg-stone-50/70 transition-colors">
                          <td className="py-3 px-4">
                            <div className="w-12 h-10 relative bg-stone-200 overflow-hidden border border-stone-300">
                              <Image
                                src={prod.image}
                                alt={prod.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-editorial-serif text-sm font-medium text-stone-900">
                              {prod.name}
                            </div>
                            <span className="font-editorial-sans text-[8.5px] uppercase tracking-wider text-stone-500">
                              {prod.designer}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-stone-600 text-[11px]">
                            {prod.boutiqueName || prod.boutiqueId}
                          </td>
                          <td className="py-3 px-4 font-mono text-[11px] text-stone-600">
                            {prod.category}
                          </td>
                          <td className="py-3 px-4 font-mono text-[11px] font-semibold text-stone-900">
                            ${prod.price.toLocaleString()} {prod.currency}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-0.5 text-[9px] uppercase tracking-wider font-semibold rounded-full ${
                                prod.inStock
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-stone-100 text-stone-500"
                              }`}
                            >
                              {prod.inStock ? "In Stock" : "Sold Out"}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingProduct(prod);
                                  setIsProductModalOpen(true);
                                }}
                                className="p-1 text-stone-500 hover:text-stone-900 transition-colors"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteProduct(prod.id)}
                                className="p-1 text-stone-400 hover:text-red-700 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ---------------------------------------------------------------- */}
          {/* TAB 3: CITY GUIDES PAGES MANAGEMENT */}
          {/* ---------------------------------------------------------------- */}
          {activeTab === "guides" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="font-editorial-sans text-[10px] uppercase tracking-[0.2em] text-stone-500 font-semibold">
                  Curated City Guides & Architectural Precinct Walkthroughs ({guides.length})
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {guides.map((guide) => (
                  <div
                    key={guide.id}
                    className="p-5 bg-white border border-stone-200/90 rounded shadow-2xs space-y-4 flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="relative aspect-[16/9] w-full overflow-hidden bg-stone-100 border border-stone-200">
                        <Image
                          src={guide.heroImage}
                          alt={guide.title}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute top-2.5 left-2.5 bg-white/95 text-stone-900 font-editorial-sans text-[8px] uppercase tracking-[0.18em] px-2 py-0.5 border border-stone-300">
                          {guide.city}
                        </div>
                      </div>

                      <div>
                        <span className="font-editorial-sans text-[8px] uppercase tracking-[0.2em] text-stone-400 font-semibold">
                          {guide.kicker || "CITY EDITORIAL"}
                        </span>
                        <h3 className="font-editorial-serif text-xl text-stone-900 mt-0.5">
                          {guide.title}
                        </h3>
                        <p className="font-serif italic text-xs text-stone-600 mt-1 line-clamp-2">
                          {guide.subtitle}
                        </p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                      <span className="font-mono text-[10px] text-stone-400">
                        {guide.readingTime}
                      </span>

                      <div className="flex items-center gap-2">
                        <Link
                          href={`/guides/${guide.id}`}
                          target="_blank"
                          className="p-1 text-stone-500 hover:text-stone-900 inline-flex items-center gap-1 text-[11px]"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Public</span>
                        </Link>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingGuide(guide);
                            setIsGuideModalOpen(true);
                          }}
                          className="p-1 text-stone-600 hover:text-stone-950"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteGuide(guide.id)}
                          className="p-1 text-stone-400 hover:text-red-700"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ---------------------------------------------------------------- */}
          {/* TAB 4: BLOG & JOURNAL POSTS MANAGEMENT */}
          {/* ---------------------------------------------------------------- */}
          {activeTab === "journal" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="font-editorial-sans text-[10px] uppercase tracking-[0.2em] text-stone-500 font-semibold">
                  Editorial Journal & Longform Blog Dispatches ({journalArticles.length})
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {journalArticles.map((article) => (
                  <article
                    key={article.id}
                    className="p-4 bg-white border border-stone-200/90 rounded shadow-2xs space-y-3 flex flex-col justify-between"
                  >
                    <div className="space-y-2.5">
                      <div className="relative aspect-[16/10] w-full overflow-hidden bg-stone-100 border border-stone-200">
                        <Image
                          src={article.image}
                          alt={article.title}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute top-2 left-2 bg-white/95 text-stone-900 font-editorial-sans text-[8px] uppercase tracking-[0.16em] px-2 py-0.5 border border-stone-200">
                          {article.category}
                        </div>
                      </div>

                      <div className="text-[9px] font-mono text-stone-400 flex items-center gap-2">
                        <span>{article.date}</span>
                        <span>•</span>
                        <span>{article.readTime}</span>
                      </div>

                      <h4 className="font-editorial-serif text-lg font-normal text-stone-900 leading-snug">
                        {article.title}
                      </h4>

                      <p className="font-serif italic text-xs text-stone-600 line-clamp-3 leading-relaxed">
                        {article.excerpt}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                      <span className="font-editorial-sans text-[8.5px] uppercase tracking-wider text-stone-500 font-medium">
                        By {article.author}
                      </span>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingJournal(article);
                            setIsJournalModalOpen(true);
                          }}
                          className="p-1 text-stone-600 hover:text-stone-950"
                          title="Edit Blog Story"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteJournal(article.id)}
                          className="p-1 text-stone-400 hover:text-red-700"
                          title="Delete Blog Story"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}

          {/* ---------------------------------------------------------------- */}
          {/* TAB 5: CLOUDINARY MEDIA ASSET STUDIO */}
          {/* ---------------------------------------------------------------- */}
          {activeTab === "media" && (
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="p-6 bg-white border border-stone-200 rounded shadow-2xs space-y-4">
                <div className="border-b border-stone-100 pb-3">
                  <h3 className="font-editorial-serif text-xl text-stone-900">
                    Cloudinary Asset Upload Studio
                  </h3>
                  <p className="font-editorial-sans text-[9px] uppercase tracking-[0.2em] text-stone-500 mt-1">
                    Cloud Name: h8nmncfh · Direct API Upload
                  </p>
                </div>

                <CloudinaryUploader
                  label="Upload Visual Asset"
                  currentImageUrl={testCloudinaryUrl}
                  onUploadSuccess={(url) => setTestCloudinaryUrl(url)}
                  aspectRatio="aspect-[16/10]"
                />

                {testCloudinaryUrl && (
                  <div className="p-3.5 bg-stone-50 border border-stone-200 rounded text-xs space-y-1 font-mono">
                    <span className="text-[10px] uppercase text-emerald-800 font-semibold block">
                      Uploaded HTTPS URL:
                    </span>
                    <input
                      type="text"
                      readOnly
                      value={testCloudinaryUrl}
                      className="w-full bg-white border border-stone-200 p-2 text-xs select-all"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ---------------------------------------------------------------- */}
          {/* TAB 6: SUPABASE SCHEMA & LIVE SYNC */}
          {/* ---------------------------------------------------------------- */}
          {activeTab === "database" && (
            <div className="space-y-6">
              <div className="p-6 bg-white border border-stone-200 rounded shadow-2xs space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
                  <div>
                    <h3 className="font-editorial-serif text-xl text-stone-900">
                      Local / Remote Supabase Database Sync
                    </h3>
                    <p className="font-editorial-sans text-[9px] uppercase tracking-[0.2em] text-stone-500 mt-1">
                      Lightweight Relational Architecture
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleSyncDatabase}
                    className="px-4 py-2 bg-[#1C1917] hover:bg-stone-800 text-white text-xs font-editorial-sans uppercase tracking-[0.16em] transition-colors inline-flex items-center gap-2 shadow-2xs"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Execute Sync / Seed</span>
                  </button>
                </div>

                {syncMessage && (
                  <div className="p-3 bg-stone-100 border border-stone-300 font-mono text-xs text-stone-800">
                    {syncMessage}
                  </div>
                )}

                <div className="space-y-2">
                  <span className="font-editorial-sans text-[10px] uppercase tracking-[0.2em] text-stone-600 font-semibold block">
                    PostgreSQL Schema (`supabase/schema.sql`):
                  </span>
                  <pre className="p-4 bg-stone-900 text-emerald-400 font-mono text-[11px] overflow-x-auto rounded leading-relaxed">
{`-- 1. Boutiques Table
CREATE TABLE IF NOT EXISTS boutiques (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  neighborhood TEXT NOT NULL,
  category TEXT NOT NULL,
  address TEXT NOT NULL,
  price_tier TEXT DEFAULT '$$$',
  description TEXT,
  curator_note TEXT,
  image TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Dynamic Products Table
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  boutique_id TEXT REFERENCES boutiques(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  designer TEXT NOT NULL,
  category TEXT NOT NULL,
  price NUMERIC NOT NULL,
  image TEXT NOT NULL,
  in_stock BOOLEAN DEFAULT true
);

-- 3. City Guides Table
CREATE TABLE IF NOT EXISTS guides (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  city TEXT NOT NULL,
  subtitle TEXT,
  reading_time TEXT DEFAULT '8 Min Read',
  hero_image TEXT NOT NULL
);`}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* BOUTIQUE EDIT / CREATE MODAL WITH BLOG-STYLE DESCRIPTION TAB */}
      {/* -------------------------------------------------------------------- */}
      {isBoutiqueModalOpen && (
        <BoutiqueEditorModal
          boutique={editingBoutique}
          onClose={() => {
            setIsBoutiqueModalOpen(false);
            setEditingBoutique(null);
          }}
          onSave={handleSaveBoutique}
        />
      )}

      {/* -------------------------------------------------------------------- */}
      {/* PRODUCT EDIT / CREATE MODAL */}
      {/* -------------------------------------------------------------------- */}
      {isProductModalOpen && (
        <ProductEditorModal
          product={editingProduct}
          boutiques={boutiques}
          onClose={() => {
            setIsProductModalOpen(false);
            setEditingProduct(null);
          }}
          onSave={handleSaveProduct}
        />
      )}

      {/* -------------------------------------------------------------------- */}
      {/* GUIDE EDIT / CREATE MODAL */}
      {/* -------------------------------------------------------------------- */}
      {isGuideModalOpen && (
        <GuideEditorModal
          guide={editingGuide}
          onClose={() => {
            setIsGuideModalOpen(false);
            setEditingGuide(null);
          }}
          onSave={handleSaveGuide}
        />
      )}

      {/* -------------------------------------------------------------------- */}
      {/* BLOG / JOURNAL ARTICLE EDIT / CREATE MODAL */}
      {/* -------------------------------------------------------------------- */}
      {isJournalModalOpen && (
        <JournalEditorModal
          article={editingJournal}
          onClose={() => {
            setIsJournalModalOpen(false);
            setEditingJournal(null);
          }}
          onSave={handleSaveJournal}
        />
      )}
    </div>
  );
};

// -----------------------------------------------------------------------------
// BOUTIQUE MODAL WITH EDITORIAL / BLOG PROSE TAB
// -----------------------------------------------------------------------------

function BoutiqueEditorModal({
  boutique,
  onClose,
  onSave,
}: {
  boutique: Boutique | null;
  onClose: () => void;
  onSave: (data: Boutique) => void;
}) {
  const [editorSection, setEditorSection] = useState<"general" | "editorial">("general");

  const [formData, setFormData] = useState<Boutique>(
    boutique || {
      id: `boutique-${Date.now()}`,
      name: "",
      tagline: "",
      city: "Melbourne",
      neighborhood: "Fitzroy",
      category: "Fashion",
      address: "",
      hours: "Mon–Sat 10am–6pm",
      priceTier: "$$$",
      description: "",
      curatorNote: "",
      image: "/images/hero/hero-main.jpg",
      featured: false,
      tags: [],
    }
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white border border-stone-200 rounded-lg max-w-2xl w-full my-8 max-h-[90vh] flex flex-col shadow-2xl text-stone-900">
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 bg-stone-50">
          <div>
            <h3 className="font-editorial-serif text-xl">
              {boutique ? `Edit: ${boutique.name}` : "Add New Boutique Profile"}
            </h3>
            <p className="font-editorial-sans text-[9px] uppercase tracking-[0.2em] text-stone-500">
              Directory Metadata & Editorial Story Editor
            </p>
          </div>
          <button onClick={onClose} className="p-1 text-stone-400 hover:text-stone-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Editor Section Switcher */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-stone-100 bg-stone-50/50 text-xs">
          <button
            type="button"
            onClick={() => setEditorSection("general")}
            className={`pb-2 px-1 font-editorial-sans uppercase tracking-[0.16em] text-[10px] border-b-2 transition-all ${
              editorSection === "general"
                ? "border-stone-900 text-stone-900 font-bold"
                : "border-transparent text-stone-400 hover:text-stone-700"
            }`}
          >
            1. Directory Profile & Image
          </button>
          <button
            type="button"
            onClick={() => setEditorSection("editorial")}
            className={`pb-2 px-1 font-editorial-sans uppercase tracking-[0.16em] text-[10px] border-b-2 transition-all ${
              editorSection === "editorial"
                ? "border-stone-900 text-stone-900 font-bold"
                : "border-transparent text-stone-400 hover:text-stone-700"
            }`}
          >
            2. Blog-Style Editorial Prose & Notes
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-4 text-xs">
          {editorSection === "general" ? (
            <>
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-stone-500 mb-1">
                  Boutique Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded text-xs focus:outline-none focus:border-stone-500"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-stone-500 mb-1">
                  Tagline (Subtitle)
                </label>
                <input
                  type="text"
                  value={formData.tagline}
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                  placeholder="e.g. Botanical Skin & Hair Formulations"
                  className="w-full px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-stone-500 mb-1">
                    City *
                  </label>
                  <select
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value as any })}
                    className="w-full px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded text-xs"
                  >
                    <option value="Melbourne">Melbourne</option>
                    <option value="Sydney">Sydney</option>
                    <option value="Brisbane">Brisbane</option>
                    <option value="Perth">Perth</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-stone-500 mb-1">
                    Precinct / Neighborhood *
                  </label>
                  <input
                    type="text"
                    value={formData.neighborhood}
                    onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-stone-500 mb-1">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded text-xs"
                  >
                    <option value="Fashion">Fashion</option>
                    <option value="Ceramics & Home">Ceramics & Home</option>
                    <option value="Books & Art">Books & Art</option>
                    <option value="Antiques">Antiques</option>
                    <option value="Concept">Concept</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-stone-500 mb-1">
                    Price Tier
                  </label>
                  <select
                    value={formData.priceTier}
                    onChange={(e) => setFormData({ ...formData, priceTier: e.target.value as any })}
                    className="w-full px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded text-xs"
                  >
                    <option value="$$">$$ (Accessible)</option>
                    <option value="$$$">$$$ (Premium Independent)</option>
                    <option value="$$$$">$$$$ (High Luxury / Archival)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-stone-500 mb-1">
                  Full Street Address
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded text-xs"
                />
              </div>

              {/* Cloudinary Image Uploader */}
              <CloudinaryUploader
                label="Storefront Visual (Cloudinary)"
                currentImageUrl={formData.image}
                onUploadSuccess={(url) => setFormData({ ...formData, image: url })}
                aspectRatio="aspect-[4/3]"
              />
            </>
          ) : (
            /* SECTION 2: BLOG-STYLE EDITORIAL PROSE & NOTES */
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-stone-500 mb-1">
                  Long-form Editorial Prose (Blog-Style Story)
                </label>
                <textarea
                  rows={6}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detail the architectural bluestone elements, lighting, proprietary ethos, and curated designers..."
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded text-xs font-serif leading-relaxed"
                />
                <span className="text-[10px] text-stone-400 block mt-1">
                  Supports multi-paragraph editorial prose rendered on the boutique discovery listing and profile.
                </span>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-stone-500 mb-1">
                  Curator&apos;s Highlight Quote (Pull Quote)
                </label>
                <textarea
                  rows={3}
                  value={formData.curatorNote || ""}
                  onChange={(e) => setFormData({ ...formData, curatorNote: e.target.value })}
                  placeholder="e.g. &ldquo;The pioneering flagship where Gertrude Street's retail renaissance began.&rdquo;"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded text-xs italic font-serif leading-relaxed"
                />
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded text-xs flex items-center justify-between text-amber-900">
                <div>
                  <span className="font-semibold block text-[11px]">Modular 5-Block CMS Studio</span>
                  <span className="text-[10px] text-amber-800">
                    Need to add dual image galleries, pull quotes, or designer rosters?
                  </span>
                </div>
                <Link
                  href="/shop"
                  target="_blank"
                  className="px-2.5 py-1 bg-amber-900 text-white rounded text-[10px] uppercase font-mono tracking-wider shrink-0 ml-2"
                >
                  Launch Studio ↗
                </Link>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-3.5 border-t border-stone-200 bg-stone-50">
          <button onClick={onClose} className="px-4 py-2 text-xs uppercase tracking-wider text-stone-600">
            Cancel
          </button>
          <button
            onClick={() => onSave(formData)}
            className="px-4 py-2 bg-[#1C1917] hover:bg-stone-800 text-white text-xs uppercase tracking-wider rounded shadow-2xs"
          >
            Save Boutique Profile
          </button>
        </div>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// PRODUCT MODAL
// -----------------------------------------------------------------------------

function ProductEditorModal({
  product,
  boutiques,
  onClose,
  onSave,
}: {
  product: Product | null;
  boutiques: Boutique[];
  onClose: () => void;
  onSave: (data: Product) => void;
}) {
  const [formData, setFormData] = useState<Product>(
    product || {
      id: `prod-${Date.now()}`,
      boutiqueId: boutiques[0]?.id || "aesop-fitzroy",
      name: "",
      designer: "",
      category: "Apparel",
      price: 250,
      currency: "AUD",
      image: "/images/hero/hero-top-right.jpg",
      description: "",
      inStock: true,
      featured: false,
    }
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white border border-stone-200 rounded-lg max-w-xl w-full my-8 max-h-[90vh] flex flex-col shadow-2xl text-stone-900">
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 bg-stone-50">
          <h3 className="font-editorial-serif text-xl">
            {product ? "Edit Product" : "Add Dynamic Boutique Product"}
          </h3>
          <button onClick={onClose} className="p-1 text-stone-400 hover:text-stone-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-4 text-xs">
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-stone-500 mb-1">
              Product Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-stone-500 mb-1">
                Designer / Maker *
              </label>
              <input
                type="text"
                required
                value={formData.designer}
                onChange={(e) => setFormData({ ...formData, designer: e.target.value })}
                className="w-full px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded text-xs"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-wider text-stone-500 mb-1">
                Boutique Association
              </label>
              <select
                value={formData.boutiqueId}
                onChange={(e) => {
                  const bId = e.target.value;
                  const bName = boutiques.find((b) => b.id === bId)?.name || "";
                  setFormData({ ...formData, boutiqueId: bId, boutiqueName: bName });
                }}
                className="w-full px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded text-xs"
              >
                {boutiques.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.city})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-stone-500 mb-1">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                className="w-full px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded text-xs"
              >
                <option value="Apparel">Apparel</option>
                <option value="Ceramics">Ceramics</option>
                <option value="Leather Goods">Leather Goods</option>
                <option value="Books">Books</option>
                <option value="Fragrance">Fragrance</option>
                <option value="Objects">Objects</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-wider text-stone-500 mb-1">
                Price (AUD)
              </label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                className="w-full px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-wider text-stone-500 mb-1">
              Description
            </label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded text-xs"
            />
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.inStock}
                onChange={(e) => setFormData({ ...formData, inStock: e.target.checked })}
                className="rounded border-stone-300"
              />
              <span>In Stock</span>
            </label>
          </div>

          {/* Cloudinary Image Uploader */}
          <CloudinaryUploader
            label="Product Image (Cloudinary)"
            currentImageUrl={formData.image}
            onUploadSuccess={(url) => setFormData({ ...formData, image: url })}
            aspectRatio="aspect-[4/3]"
          />
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-3.5 border-t border-stone-200 bg-stone-50">
          <button onClick={onClose} className="px-4 py-2 text-xs uppercase tracking-wider text-stone-600">
            Cancel
          </button>
          <button
            onClick={() => onSave(formData)}
            className="px-4 py-2 bg-[#1C1917] text-white text-xs uppercase tracking-wider rounded"
          >
            Save Product
          </button>
        </div>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// GUIDE MODAL (CREATE / EDIT CITY GUIDES)
// -----------------------------------------------------------------------------

function GuideEditorModal({
  guide,
  onClose,
  onSave,
}: {
  guide: GuideItem | null;
  onClose: () => void;
  onSave: (data: GuideItem) => void;
}) {
  const [formData, setFormData] = useState<GuideItem>(
    guide || {
      id: `guide-${Date.now()}`,
      title: "",
      city: "Melbourne",
      kicker: "01 / CURATED CITY EDITORIAL",
      subtitle: "",
      readingTime: "8 Min Read",
      heroImage: "/images/hero/hero-main.jpg",
      published: true,
      content: "",
      curatorNote: "",
    }
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white border border-stone-200 rounded-lg max-w-2xl w-full my-8 max-h-[90vh] flex flex-col shadow-2xl text-stone-900">
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 bg-stone-50">
          <h3 className="font-editorial-serif text-xl">
            {guide ? `Edit: ${guide.title}` : "Create New Curated City Guide Page"}
          </h3>
          <button onClick={onClose} className="p-1 text-stone-400 hover:text-stone-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-4 text-xs">
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-stone-500 mb-1">
              Guide Headline *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. The Sydney Edit: Sandstone & Sea"
              className="w-full px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-stone-500 mb-1">
                Target City *
              </label>
              <select
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded text-xs"
              >
                <option value="Melbourne">Melbourne</option>
                <option value="Sydney">Sydney</option>
                <option value="Brisbane">Brisbane</option>
                <option value="Perth">Perth</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-wider text-stone-500 mb-1">
                Reading Time Estimate
              </label>
              <input
                type="text"
                value={formData.readingTime}
                onChange={(e) => setFormData({ ...formData, readingTime: e.target.value })}
                placeholder="e.g. 7 Min Read"
                className="w-full px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-wider text-stone-500 mb-1">
              Editorial Subtitle
            </label>
            <textarea
              rows={2}
              value={formData.subtitle}
              onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
              placeholder="Summary of architectural precincts and featured independent shops..."
              className="w-full px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded text-xs italic font-serif"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-wider text-stone-500 mb-1">
              Longform Curated Story & Itinerary Body
            </label>
            <textarea
              rows={5}
              value={formData.content || ""}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Write detailed walking routes, architectural notes on bluestone facades, coffee stops..."
              className="w-full px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded text-xs font-serif leading-relaxed"
            />
          </div>

          {/* Cloudinary Hero Image */}
          <CloudinaryUploader
            label="Guide Hero Visual (Cloudinary)"
            currentImageUrl={formData.heroImage}
            onUploadSuccess={(url) => setFormData({ ...formData, heroImage: url })}
            aspectRatio="aspect-[16/9]"
          />
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-3.5 border-t border-stone-200 bg-stone-50">
          <button onClick={onClose} className="px-4 py-2 text-xs uppercase tracking-wider text-stone-600">
            Cancel
          </button>
          <button
            onClick={() => onSave(formData)}
            className="px-4 py-2 bg-[#1C1917] text-white text-xs uppercase tracking-wider rounded"
          >
            Save Guide Page
          </button>
        </div>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// JOURNAL / BLOG MODAL (CREATE / EDIT BLOG ARTICLES)
// -----------------------------------------------------------------------------

function JournalEditorModal({
  article,
  onClose,
  onSave,
}: {
  article: JournalArticle | null;
  onClose: () => void;
  onSave: (data: JournalArticle) => void;
}) {
  const [formData, setFormData] = useState<JournalArticle>(
    article || {
      id: `article-${Date.now()}`,
      title: "",
      category: "RETAIL CULTURE",
      readTime: "5 MIN READ",
      date: "OCTOBER 2026",
      author: "ELENA ROCHE",
      excerpt: "",
      image: "/images/generated/melbourne-laneway.jpg",
      content: "",
      published: true,
    }
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white border border-stone-200 rounded-lg max-w-2xl w-full my-8 max-h-[90vh] flex flex-col shadow-2xl text-stone-900">
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 bg-stone-50">
          <h3 className="font-editorial-serif text-xl">
            {article ? `Edit: ${article.title}` : "Create New Blog / Journal Article"}
          </h3>
          <button onClick={onClose} className="p-1 text-stone-400 hover:text-stone-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-4 text-xs">
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-stone-500 mb-1">
              Article Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. The Architecture of Gertrude Street: How One Strip Defined Melbourne Retail"
              className="w-full px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded text-xs"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-stone-500 mb-1">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded text-xs"
              >
                <option value="RETAIL CULTURE">RETAIL CULTURE</option>
                <option value="VINTAGE & ARCHIVAL">VINTAGE & ARCHIVAL</option>
                <option value="CRAFT & DESIGN">CRAFT & DESIGN</option>
                <option value="ARCHITECTURE">ARCHITECTURE</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-wider text-stone-500 mb-1">
                Author
              </label>
              <input
                type="text"
                value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                className="w-full px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded text-xs"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-wider text-stone-500 mb-1">
                Reading Time
              </label>
              <input
                type="text"
                value={formData.readTime}
                onChange={(e) => setFormData({ ...formData, readTime: e.target.value })}
                placeholder="6 MIN READ"
                className="w-full px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-wider text-stone-500 mb-1">
              Short Excerpt (Displayed on Homepage)
            </label>
            <textarea
              rows={2}
              value={formData.excerpt}
              onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
              className="w-full px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded text-xs"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-wider text-stone-500 mb-1">
              Full Longform Blog Article Body
            </label>
            <textarea
              rows={6}
              value={formData.content || ""}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Write the full multi-paragraph editorial article..."
              className="w-full px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded text-xs font-serif leading-relaxed"
            />
          </div>

          {/* Cloudinary Featured Image */}
          <CloudinaryUploader
            label="Featured Story Image (Cloudinary)"
            currentImageUrl={formData.image}
            onUploadSuccess={(url) => setFormData({ ...formData, image: url })}
            aspectRatio="aspect-[16/10]"
          />
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-3.5 border-t border-stone-200 bg-stone-50">
          <button onClick={onClose} className="px-4 py-2 text-xs uppercase tracking-wider text-stone-600">
            Cancel
          </button>
          <button
            onClick={() => onSave(formData)}
            className="px-4 py-2 bg-[#1C1917] text-white text-xs uppercase tracking-wider rounded"
          >
            Publish Article
          </button>
        </div>
      </div>
    </div>
  );
}
