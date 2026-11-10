"use client";

import React, { useState, useEffect } from "react";
import { Boutique } from "@/data/boutiques";
import { JournalArticle } from "@/data/journal";
import { GuideItem } from "@/lib/db";
import { LiveInPlaceStudio } from "./LiveInPlaceStudio";
import { NormalAdminPanel } from "./NormalAdminPanel";

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
