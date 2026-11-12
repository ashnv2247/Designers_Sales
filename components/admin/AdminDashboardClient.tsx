"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Boutique } from "@/data/boutiques";
import { JournalArticle } from "@/data/journal";
import { GuideItem } from "@/lib/db";
import { LiveInPlaceStudio } from "./LiveInPlaceStudio";
import { NormalAdminPanel } from "./NormalAdminPanel";
import { ShieldAlert, ArrowLeft, Sparkles, Lock } from "lucide-react";

interface AdminDashboardClientProps {
  initialView?: "dashboard" | "studio";
}

export const AdminDashboardClient: React.FC<AdminDashboardClientProps> = ({
  initialView = "studio",
}) => {
  const [viewMode, setViewMode] = useState<"dashboard" | "studio">(initialView);
  const [boutiques, setBoutiques] = useState<Boutique[]>([]);
  const [guides, setGuides] = useState<GuideItem[]>([]);
  const [journalArticles, setJournalArticles] = useState<JournalArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const session = typeof window !== "undefined" ? localStorage.getItem("ds_curator_session") : null;
    if (!session) {
      setIsAuthenticated(false);
    } else {
      try {
        const parsed = JSON.parse(session);
        if (parsed && (parsed.email || parsed.id)) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch {
        setIsAuthenticated(false);
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const urlView = params.get("view");
      if (urlView === "dashboard" || urlView === "normal") {
        setViewMode("dashboard");
      } else if (urlView === "studio") {
        setViewMode("studio");
      }
    }
  }, []);

  // Load all initial dynamic data
  const loadData = async () => {
    setIsLoading(true);
    try {
      const [resBoutiques, resGuides, resJournal] = await Promise.all([
        fetch("/api/boutiques").then((r) => r.json()),
        fetch("/api/guides").then((r) => r.json()),
        fetch("/api/journal").then((r) => r.json()),
      ]);

      if (resBoutiques.boutiques) setBoutiques(resBoutiques.boutiques);
      if (resGuides.guides) setGuides(resGuides.guides);
      if (resJournal.articles) setJournalArticles(resJournal.articles);
    } catch (e) {
      console.error("Failed to load admin studio data:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Boutique Actions
  const handleSaveBoutique = async (boutiqueData: Boutique) => {
    const isEdit = boutiques.some((b) => b.id === boutiqueData.id);
    const method = isEdit ? "PUT" : "POST";
    const res = await fetch("/api/boutiques", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(boutiqueData),
    });
    if (res.ok) {
      await loadData();
    } else {
      throw new Error("Failed to save boutique");
    }
  };

  // Guide Actions
  const handleSaveGuide = async (guideData: GuideItem) => {
    const isEdit = guides.some((g) => g.id === guideData.id);
    const method = isEdit ? "PUT" : "POST";
    const res = await fetch("/api/guides", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(guideData),
    });
    if (res.ok) {
      await loadData();
    } else {
      throw new Error("Failed to save guide");
    }
  };

  // Journal Actions
  const handleSaveJournal = async (articleData: JournalArticle) => {
    const isEdit = journalArticles.some((a) => a.id === articleData.id);
    const method = isEdit ? "PUT" : "POST";
    const res = await fetch("/api/journal", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(articleData),
    });
    if (res.ok) {
      await loadData();
    } else {
      throw new Error("Failed to save article");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center font-mono text-xs text-stone-500">
        Loading DS/ Live Studio...
      </div>
    );
  }

  if (isAuthenticated === false) {
    return (
      <div className="min-h-screen bg-[#FBF9F5] text-stone-900 flex flex-col items-center justify-center p-6 selection:bg-[#EFE9DF]">
        <div className="w-full max-w-md bg-white border border-stone-200 p-8 shadow-xl text-center space-y-5">
          <div className="flex justify-center">
            <div className="w-12 h-12 rounded-full bg-stone-100 border border-stone-200 flex items-center justify-center">
              <Lock className="w-5 h-5 text-stone-800" />
            </div>
          </div>
          <div>
            <span className="text-[9px] uppercase tracking-[0.24em] font-editorial-sans text-stone-500 font-semibold block mb-1">
              CURATOR ACCESS REQUIRED
            </span>
            <h2 className="text-2xl font-editorial-serif font-normal text-stone-950">
              Editorial Studio Restricted
            </h2>
            <p className="font-editorial-serif italic text-xs text-stone-600 mt-2">
              Authentication is required to view live canvas controls, publish guide itineraries, or manage boutique records.
            </p>
          </div>
          <div className="pt-2 flex flex-col gap-2.5">
            <Link
              href="/login?redirect=/admin"
              className="w-full py-2.5 px-4 bg-stone-900 text-white text-[10px] uppercase tracking-[0.22em] font-editorial-sans font-semibold hover:bg-stone-800 transition-colors inline-flex items-center justify-center gap-2"
            >
              <span>SIGN IN TO CURATOR PORTAL</span>
            </Link>
            <button
              type="button"
              onClick={() => {
                const demoUser = {
                  id: "curator-demo",
                  email: "curator@designersale.com.au",
                  name: "Elena Roche",
                  role: "Chief Design Curator",
                };
                localStorage.setItem("ds_curator_session", JSON.stringify(demoUser));
                setIsAuthenticated(true);
              }}
              className="w-full py-2 px-4 bg-stone-100 hover:bg-stone-200 border border-stone-300 text-stone-800 text-[9.5px] uppercase tracking-[0.18em] font-editorial-sans font-medium transition-colors inline-flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-stone-600" />
              <span>1-Click Demo Curator Unlock</span>
            </button>
          </div>
          <div className="pt-4 border-t border-stone-100 text-center">
            <Link href="/" className="text-[9px] uppercase tracking-[0.20em] font-editorial-sans text-stone-500 hover:text-stone-900 inline-flex items-center gap-1">
              <ArrowLeft className="w-3 h-3" />
              <span>Return to Public Directory</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (viewMode === "dashboard") {
    return (
      <NormalAdminPanel onOpenStudio={() => setViewMode("studio")} />
    );
  }

  return (
    <LiveInPlaceStudio
      boutiques={boutiques}
      guides={guides}
      journalArticles={journalArticles}
      onSaveBoutique={handleSaveBoutique}
      onSaveGuide={handleSaveGuide}
      onSaveJournal={handleSaveJournal}
      onRefresh={loadData}
      onOpenDashboard={() => setViewMode("dashboard")}
    />
  );
};
