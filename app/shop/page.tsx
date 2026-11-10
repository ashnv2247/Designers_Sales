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
        <ShopProfileClient />
      </div>
      <Footer />
    </div>
  );
}

