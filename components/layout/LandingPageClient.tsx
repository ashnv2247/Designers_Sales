"use client";

import React, { useState, useEffect } from "react";
import MainHeader from "@/components/layout/MainHeader";
import MobileNavigation from "@/components/layout/MobileNavigation";
import HeroSection from "@/components/sections/HeroSection";
import ExploreSection from "@/components/sections/ExploreSection";
import LatestDiscoveries from "@/components/sections/LatestDiscoveries";
import FeaturedGuide from "@/components/sections/FeaturedGuide";
import StatsBanner from "@/components/sections/StatsBanner";
import DirectorySection from "@/components/sections/DirectorySection";
import DesignerSpotlight from "@/components/sections/DesignerSpotlight";
import NeighborhoodsSection from "@/components/sections/NeighborhoodsSection";
import JournalSection from "@/components/sections/JournalSection";
import Footer from "@/components/layout/Footer";
import { ProductCatalogSection } from "@/components/products/ProductCatalogSection";
import { PRODUCTS_SEED_DATA } from "@/data/products";
import { Product } from "@/types/product";

export const LandingPageClient: React.FC = () => {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [productsList, setProductsList] = useState<Product[]>(PRODUCTS_SEED_DATA);

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((data) => {
        if (data.products && data.products.length > 0) {
          setProductsList(data.products);
        }
      })
      .catch((err) => console.warn("Using local product seed:", err));
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col relative selection:bg-surface-warm">
      <MainHeader onToggleMobileNav={() => setMobileNavOpen(!mobileNavOpen)} />
      <MobileNavigation
        isOpen={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
      />

      <main className="flex-1 w-full">
        {/* Core Reference Re-creation (Pixel Accurate) */}
        <HeroSection />
        <ExploreSection />
        <LatestDiscoveries />
        <FeaturedGuide />

        {/* Dynamic Products Showcase from Boutiques */}
        <ProductCatalogSection initialProducts={productsList} />

        {/* Extended High-Quality Data & Editorial Sections */}
        <StatsBanner />
        <DirectorySection />
        <DesignerSpotlight />
        <NeighborhoodsSection />
        <JournalSection />
      </main>

      {/* Comprehensive Editorial Footer */}
      <Footer />
    </div>
  );
};

export default LandingPageClient;
