"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { ShopProfile, SimilarShopPreview } from "@/types/shop";
import { SEED_SHOP_PROFILE, PRESET_STITCH_AND_TICKLE } from "@/data/seedShop";
import { BOUTIQUES_DATA } from "@/data/boutiques";
import { PrecinctMap } from "./PrecinctMap";
import { DirectorySidebar } from "./DirectorySidebar";
import { EditorialFeed } from "./EditorialFeed";
import { EditorialToolbar } from "./EditorialToolbar";
import { InlineMetadataEditor } from "./InlineMetadataEditor";
import { SimilarShopsModal } from "./SimilarShopsModal";
import { DiagnosticTestSuite } from "./DiagnosticTestSuite";
import { ProductCatalogSection } from "@/components/products/ProductCatalogSection";
import { PRODUCTS_SEED_DATA } from "@/data/products";
import { Product } from "@/types/product";
import { Edit3 } from "lucide-react";

export const ShopProfileClient: React.FC = () => {
  const searchParams = useSearchParams();
  const boutiqueId = searchParams.get("id");
  const [shop, setShop] = useState<ShopProfile>(SEED_SHOP_PROFILE);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [isMetadataOpen, setIsMetadataOpen] = useState<boolean>(false);
  const [isSimilarShopsOpen, setIsSimilarShopsOpen] = useState<boolean>(false);
  const [isTestSuiteOpen, setIsTestSuiteOpen] = useState<boolean>(false);
  const [isHydrated, setIsHydrated] = useState<boolean>(false);

  // Dynamic Boutique Hydration from URL parameter or localStorage
  useEffect(() => {
    if (boutiqueId) {
      const found = BOUTIQUES_DATA.find((b) => b.id === boutiqueId);
      if (found) {
        // Check if there are boutique-specific saved edits
        const stored = localStorage.getItem(`ds_shop_profile_${found.id}`);
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            if (parsed && parsed.name && parsed.contentBlocks) {
              setShop(parsed);
              setIsHydrated(true);
              return;
            }
          } catch (e) {}
        }

        // Construct customized boutique profile
        const adapted: ShopProfile = {
          ...SEED_SHOP_PROFILE,
          id: found.id,
          slug: found.id,
          name: found.name,
          subtitle: found.tagline || SEED_SHOP_PROFILE.subtitle,
          city: found.city,
          precinct: `${found.neighborhood}, ${found.city}`,
          categories: [found.category.toUpperCase(), "AUSTRALIAN DESIGN", "CURATED SPACE"],
          address: {
            street: found.address.split(",")[0] || found.address,
            suburb: found.neighborhood,
            state: found.city === "Sydney" ? "NSW" : found.city === "Brisbane" ? "QLD" : found.city === "Perth" ? "WA" : "VIC",
            postcode: "3000",
            formatted: found.address,
          },
          coordinates:
            found.city === "Sydney"
              ? { lat: -33.886, lng: 151.216 }
              : found.city === "Brisbane"
              ? { lat: -27.4578, lng: 153.0401 }
              : found.city === "Perth"
              ? { lat: -31.948, lng: 115.861 }
              : { lat: -37.8064, lng: 144.9785 },
          heroImage: {
            id: `hero-${found.id}`,
            url: found.image || "/images/hero/hero-main.jpg",
            alt: `${found.name} storefront in ${found.neighborhood}`,
            caption: `${found.neighborhood} architectural facade & entrance`,
            aspectRatio: "16:10",
            photographerCredit: "DS/ Editorial Archive",
          },
          contentBlocks: [
            {
              id: `block-what-we-love-${found.id}`,
              type: "text_with_image",
              order: 0,
              heading: "WHAT WE LOVE",
              bodyText: `${found.description}\n\n${found.curatorNote}`,
              images: [
                {
                  id: `img-${found.id}`,
                  url: found.image || "/images/hero/hero-main.jpg",
                  alt: `${found.name} interior`,
                  caption: `${found.name} collection display`,
                  aspectRatio: "4:5",
                  photographerCredit: "Elena Roche for DS/",
                },
              ],
            },
            {
              id: `block-quote-${found.id}`,
              type: "pull_quote",
              order: 1,
              quote: {
                text: found.curatorNote || found.description,
                author: found.name,
                role: "Curator Selection · 2026",
              },
            },
            {
              id: `block-duo-${found.id}`,
              type: "image_duo",
              order: 2,
              images: [
                {
                  id: `duo-1-${found.id}`,
                  url: found.image || "/images/hero/hero-main.jpg",
                  alt: `${found.name} detail view`,
                  caption: "Bespoke architectural joinery",
                  aspectRatio: "4:5",
                },
                {
                  id: `duo-2-${found.id}`,
                  url: "/images/explore/explore-handbag.jpg",
                  alt: `${found.name} material focus`,
                  caption: "Tactile materials and finishes",
                  aspectRatio: "4:5",
                },
              ],
            },
            {
              id: `block-roster-${found.id}`,
              type: "designer_roster",
              order: 3,
              designers: [
                { id: "des-1", name: "Christopher Esber", discipline: "Tailoring" },
                { id: "des-2", name: "Song for the Mute", discipline: "Textiles" },
                { id: "des-3", name: "Studio Henry Wilson", discipline: "Cast Bronze" },
              ],
            },
          ],
        };

        setShop(adapted);
        setIsHydrated(true);
        return;
      }
    }

    // Default Hydration from localStorage
    try {
      const stored = localStorage.getItem("ds_shop_profile_v1");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.name && parsed.contentBlocks) {
          setShop(parsed);
        }
      }
    } catch (e) {
      console.warn("Could not hydrate shop profile from localStorage", e);
    }
    setIsHydrated(true);
  }, [boutiqueId]);

  // Save to localStorage whenever shop profile updates
  const handleUpdateShop = (updated: ShopProfile) => {
    setShop(updated);
    try {
      localStorage.setItem("ds_shop_profile_v1", JSON.stringify(updated));
      if (updated.id) {
        localStorage.setItem(`ds_shop_profile_${updated.id}`, JSON.stringify(updated));
      }
    } catch (e) {
      console.warn("Could not persist shop profile to localStorage", e);
    }
  };

  // Handle Preset Switching
  const handleSelectPreset = (presetKey: string) => {
    let selected: ShopProfile;
    if (presetKey === "stitch-and-tickle") {
      selected = PRESET_STITCH_AND_TICKLE;
    } else {
      selected = SEED_SHOP_PROFILE;
    }
    handleUpdateShop(selected);
  };

  // Reset to seed
  const handleResetToSeed = () => {
    try {
      localStorage.removeItem("ds_shop_profile_v1");
    } catch (e) {
      // ignore
    }
    setShop(SEED_SHOP_PROFILE);
  };

  // Similar shop selection (for navigating or loading another profile)
  const handleSelectSimilarShop = (slug: string) => {
    if (slug === "stitch-and-tickle" || slug === "atelier-04") {
      handleUpdateShop(PRESET_STITCH_AND_TICKLE);
    } else {
      handleUpdateShop(SEED_SHOP_PROFILE);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-900 font-sans selection:bg-stone-200">
      {/* Studio CMS & Reader Floating Toolbar */}
      <EditorialToolbar
        isEditMode={isEditMode}
        onToggleEditMode={() => setIsEditMode(!isEditMode)}
        shop={shop}
        onImportShop={handleUpdateShop}
        onResetToSeed={handleResetToSeed}
        onSelectPreset={handleSelectPreset}
        onOpenTestSuite={() => setIsTestSuiteOpen(true)}
      />

      {/* Main Shop Profile Container */}
      <main className="max-w-[1280px] mx-auto px-4 sm:px-8 py-8 sm:py-10">
        {/* ROW 1: Synchronized Media Header (Map on Left 4-Cols, Storefront Banner on Right 8-Cols) */}
        <section
          data-testid="synchronized-media-header"
          className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start mb-10"
        >
          {/* Top-Left Cell: Precinct Map Container */}
          <div className="lg:col-span-4 w-full h-[280px] lg:h-[340px]">
            <PrecinctMap
              coordinates={shop.coordinates}
              shopName={shop.name}
              precinct={shop.precinct}
              addressFormatted={shop.address.formatted}
            />
          </div>

          {/* Top-Right Cell: Storefront Hero Banner */}
          <div className="lg:col-span-8 w-full h-[280px] lg:h-[340px] relative overflow-hidden bg-stone-200 border border-stone-200/60 group">
            <Image
              src={shop.heroImage.url}
              alt={shop.heroImage.alt || shop.name}
              fill
              priority
              className="object-cover w-full h-full transition-transform duration-700 ease-out group-hover:scale-[1.01]"
              sizes="(max-width: 1024px) 100vw, 840px"
            />

            {/* Subtle Gradient & Caption Overlay */}
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

            {/* Edit Banner Button in CMS Mode */}
            {isEditMode && (
              <button
                type="button"
                onClick={() => setIsMetadataOpen(true)}
                className="absolute top-3 right-3 bg-white/90 hover:bg-white text-stone-800 text-[10px] font-editorial-sans uppercase tracking-[0.16em] px-2.5 py-1.5 rounded shadow-md border border-stone-300 flex items-center gap-1.5 transition-all"
              >
                <Edit3 className="w-3 h-3" />
                <span>Edit Hero Banner</span>
              </button>
            )}
          </div>
        </section>

        {/* ROW 2: Sticky Directory Sidebar + Dynamic Editorial Feed */}
        <section
          data-testid="shop-profile-body-grid"
          className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start"
        >
          {/* Left Column: Sticky Directory Sidebar (4 Cols) */}
          <div className="lg:col-span-4 w-full">
            <DirectorySidebar
              shop={shop}
              isEditMode={isEditMode}
              onEditMetadata={() => setIsMetadataOpen(true)}
              onManageSimilarShops={() => setIsSimilarShopsOpen(true)}
              onSelectSimilarShop={handleSelectSimilarShop}
            />
          </div>

          {/* Right Column: Dynamic Editorial Feed (8 Cols) */}
          <div className="lg:col-span-8 w-full space-y-12">
            <EditorialFeed
              blocks={shop.contentBlocks}
              isEditMode={isEditMode}
              onUpdateBlocks={(newBlocks) =>
                handleUpdateShop({ ...shop, contentBlocks: newBlocks })
              }
            />

            {/* Curated Dynamic Products for this Boutique */}
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
      </main>

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

      {/* Diagnostic Test Runner Drawer */}
      <DiagnosticTestSuite
        isOpen={isTestSuiteOpen}
        onClose={() => setIsTestSuiteOpen(false)}
        shop={shop}
      />
    </div>
  );
};

