"use client";

import React, { useState } from "react";
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

export const LandingPageClient: React.FC = () => {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

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
