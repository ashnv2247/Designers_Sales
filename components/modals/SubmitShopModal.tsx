"use client";

import React, { useState } from "react";
import { X, Check, Upload, Store } from "lucide-react";

interface SubmitShopModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const SubmitShopModal: React.FC<SubmitShopModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    city: "Melbourne",
    neighborhood: "",
    category: "Fashion",
    address: "",
    website: "",
    email: "",
    description: "",
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const payload = {
        name: formData.name,
        city: formData.city,
        neighborhood: formData.neighborhood,
        category: formData.category,
        address: formData.address || `${formData.neighborhood}, ${formData.city}`,
        hours: "Mon–Sat 10am–6pm, Sun 11am–5pm",
        priceTier: "$$$",
        tagline: formData.description ? formData.description.slice(0, 80) : "Independent Australian Boutique",
        description: formData.description || `Independent boutique in ${formData.neighborhood}, ${formData.city}.`,
        curatorNote: `Submitted by ${formData.email}. Under editorial review.`,
        image: "/images/hero/hero-main.jpg",
        featured: false,
        tags: [formData.category, formData.neighborhood, formData.city],
      };

      const res = await fetch("/api/boutiques", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to submit boutique.");
      }

      setSubmitted(true);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSubmitted(false);
    setFormData({
      name: "",
      city: "Melbourne",
      neighborhood: "",
      category: "Fashion",
      address: "",
      website: "",
      email: "",
      description: "",
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-foreground/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-background w-full max-w-xl border border-editorial-border shadow-2xl relative my-8 overflow-hidden select-none">
        {/* Modal Header */}
        <div className="p-6 sm:p-8 border-b border-editorial-border bg-surface-warm/40 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 text-foreground/70 hover:text-foreground hover:bg-background/80 rounded-full transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5 stroke-[1.5]" />
          </button>

          <div className="flex items-center gap-2 mb-1.5">
            <span className="font-editorial-sans text-[8.5px] uppercase tracking-[0.24em] text-editorial-accent font-semibold">
              CURATED SUBMISSION
            </span>
          </div>
          <h2 className="font-editorial-serif text-[28px] sm:text-[32px] leading-tight font-normal text-foreground">
            Submit an Independent Boutique
          </h2>
          <p className="font-editorial-serif italic text-[13px] leading-relaxed text-foreground/75 mt-1">
            We review every submission manually to champion authentic Australian design spaces, craft studios, and concept stores.
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 max-h-[70vh] overflow-y-auto">
          {submitted ? (
            <div className="py-8 text-center flex flex-col items-center">
              <div className="w-12 h-12 bg-editorial-accent/10 border border-editorial-accent/30 rounded-full flex items-center justify-center mb-4 text-editorial-accent">
                <Check className="w-6 h-6 stroke-[2]" />
              </div>
              <h3 className="font-editorial-serif text-[24px] font-normal text-foreground">
                Submission Received
              </h3>
              <p className="font-editorial-serif italic text-[13.5px] leading-relaxed text-foreground/80 mt-2 max-w-sm">
                Thank you for recommending <strong className="font-medium text-foreground">{formData.name || "your boutique"}</strong>. Our editorial team will review the space and photograph portfolio within 3 business days.
              </p>
              <button
                onClick={handleReset}
                className="mt-6 px-6 py-2.5 bg-foreground text-background font-editorial-sans text-[9px] uppercase tracking-[0.22em] font-semibold hover:opacity-90 transition-opacity"
              >
                RETURN TO DIRECTORY
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
              <div>
                <label className="block font-editorial-sans text-[8.5px] uppercase tracking-[0.20em] text-foreground font-semibold mb-1">
                  Boutique / Storefront Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Maison de Verre Studio"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 text-[12px] bg-surface-card border border-editorial-border focus:outline-none focus:border-foreground transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-editorial-sans text-[8.5px] uppercase tracking-[0.20em] text-foreground font-semibold mb-1">
                    City *
                  </label>
                  <select
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3 py-2 text-[12px] bg-surface-card border border-editorial-border focus:outline-none focus:border-foreground transition-colors"
                  >
                    <option value="Melbourne">Melbourne</option>
                    <option value="Sydney">Sydney</option>
                    <option value="Brisbane">Brisbane</option>
                    <option value="Perth">Perth</option>
                    <option value="Adelaide">Adelaide</option>
                    <option value="Byron Bay">Byron Bay</option>
                    <option value="Hobart">Hobart</option>
                  </select>
                </div>

                <div>
                  <label className="block font-editorial-sans text-[8.5px] uppercase tracking-[0.20em] text-foreground font-semibold mb-1">
                    Precinct / Neighborhood *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Fitzroy, Paddington, James St"
                    value={formData.neighborhood}
                    onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
                    className="w-full px-3 py-2 text-[12px] bg-surface-card border border-editorial-border focus:outline-none focus:border-foreground transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-editorial-sans text-[8.5px] uppercase tracking-[0.20em] text-foreground font-semibold mb-1">
                    Primary Discipline *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 text-[12px] bg-surface-card border border-editorial-border focus:outline-none focus:border-foreground transition-colors"
                  >
                    <option value="Fashion">Designer Fashion & Apparel</option>
                    <option value="Ceramics & Home">Ceramics, Objects & Homewares</option>
                    <option value="Books & Art">Rare Books, Art & Monographs</option>
                    <option value="Antiques">Vintage & European Antiques</option>
                    <option value="Concept">Concept Studio & Niche Perfumery</option>
                  </select>
                </div>

                <div>
                  <label className="block font-editorial-sans text-[8.5px] uppercase tracking-[0.20em] text-foreground font-semibold mb-1">
                    Proprietor / Contact Email *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="proprietor@boutique.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 text-[12px] bg-surface-card border border-editorial-border focus:outline-none focus:border-foreground transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block font-editorial-sans text-[8.5px] uppercase tracking-[0.20em] text-foreground font-semibold mb-1">
                  Street Address
                </label>
                <input
                  type="text"
                  placeholder="e.g. 142 Gertrude Street, Fitzroy VIC 3065"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 text-[12px] bg-surface-card border border-editorial-border focus:outline-none focus:border-foreground transition-colors"
                />
              </div>

              <div>
                <label className="block font-editorial-sans text-[8.5px] uppercase tracking-[0.20em] text-foreground font-semibold mb-1">
                  Website or Instagram Handle
                </label>
                <input
                  type="text"
                  placeholder="https://... or @boutique"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  className="w-full px-3 py-2 text-[12px] bg-surface-card border border-editorial-border focus:outline-none focus:border-foreground transition-colors"
                />
              </div>

              <div>
                <label className="block font-editorial-sans text-[8.5px] uppercase tracking-[0.20em] text-foreground font-semibold mb-1">
                  Editorial Story & Character
                </label>
                <textarea
                  rows={3}
                  placeholder="Tell us about the design philosophy, interior architecture, and labels represented..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 text-[12px] bg-surface-card border border-editorial-border focus:outline-none focus:border-foreground transition-colors resize-none"
                />
              </div>

              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-mono">
                  {errorMsg}
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-editorial-border">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  className="px-4 py-2 text-[9px] uppercase tracking-[0.20em] font-editorial-sans text-editorial-caption hover:text-foreground transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 bg-foreground text-background font-editorial-sans text-[9px] uppercase tracking-[0.22em] font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
                >
                  {loading && <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                  <span>{loading ? "SUBMITTING..." : "SUBMIT FOR CURATION ↗"}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubmitShopModal;

