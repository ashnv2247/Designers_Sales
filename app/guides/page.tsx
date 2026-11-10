import type { Metadata } from "next";
import MainHeader from "@/components/layout/MainHeader";
import Footer from "@/components/layout/Footer";
import { MelbourneGuideClient } from "@/components/guides/MelbourneGuideClient";

export const metadata: Metadata = {
  title: "The Melbourne Edit — Curated City Guide | DESIGNERSALE (DS/)",
  description:
    "An insider's journey through Melbourne's architectural boutiques, rare bookrooms, and independent ateliers — from Fitzroy to High Street Armadale.",
};

export default function GuidesPage() {
  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-900 flex flex-col relative selection:bg-stone-200">
      <MainHeader />
      <main className="flex-1">
        <MelbourneGuideClient />
      </main>
      <Footer />
    </div>
  );
}
