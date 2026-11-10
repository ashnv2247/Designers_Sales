import type { Metadata } from "next";
import MainHeader from "@/components/layout/MainHeader";
import Footer from "@/components/layout/Footer";
import { DirectoryListingClient } from "@/components/directory/DirectoryListingClient";

export const metadata: Metadata = {
  title: "Complete Directory Index — Explore Australian Boutiques | DESIGNERSALE (DS/)",
  description:
    "Explore independent boutiques, fashion archives, and handcrafted design spaces across Melbourne, Sydney, Brisbane, and Perth.",
};

export default function DirectoryPage() {
  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-900 flex flex-col relative selection:bg-stone-200">
      <MainHeader />
      <main className="flex-1">
        <DirectoryListingClient />
      </main>
      <Footer />
    </div>
  );
}

