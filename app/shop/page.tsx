import React, { Suspense } from "react";
import type { Metadata } from "next";
import MainHeader from "@/components/layout/MainHeader";
import Footer from "@/components/layout/Footer";
import { ShopProfileClient } from "@/components/shop/ShopProfileClient";

export const metadata: Metadata = {
  title: "Shop Profile & Editorial CMS — DESIGNERSALE (DS/)",
  description:
    "Explore independent boutique architecture, designer labels, and dynamic editorial curation in Melbourne and Sydney.",
};

export default function ShopPage() {
  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-900 flex flex-col relative selection:bg-stone-200">
      <MainHeader />
      <div className="flex-1">
        <Suspense fallback={<div className="min-h-screen bg-[#FAF8F5] p-12 text-stone-500 font-mono text-xs">Loading Boutique Profile & Editorial Feed...</div>}>
          <ShopProfileClient />
        </Suspense>
      </div>
      <Footer />
    </div>
  );
}

