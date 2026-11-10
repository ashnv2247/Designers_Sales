"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  MapPin,
  Clock,
  ArrowUpRight,
  Compass,
  Bookmark,
  Share2,
  ChevronRight,
  Sparkles,
} from "lucide-react";

export const MelbourneGuideClient: React.FC = () => {
  const [activePrecinct, setActivePrecinct] = useState("fitzroy");
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-900 select-none pb-24">
      {/* Top Editorial Breadcrumb & Category */}
      <div className="border-b border-stone-200/80 bg-white/50 backdrop-blur-xs py-3 px-4 sm:px-8 lg:px-9">
        <div className="max-w-[1240px] mx-auto flex items-center justify-between text-xs text-stone-500">
          <div className="flex items-center gap-2 font-editorial-sans text-[8.5px] uppercase tracking-[0.2em]">
            <Link href="/" className="hover:text-stone-900 transition-colors">
              DS/ DIRECTORY
            </Link>
            <span>/</span>
            <Link href="/directory" className="hover:text-stone-900 transition-colors">
              GUIDES
            </Link>
            <span>/</span>
            <span className="text-stone-900 font-semibold">THE MELBOURNE EDIT</span>
          </div>

          <button
            type="button"
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 font-editorial-sans text-[8.5px] uppercase tracking-[0.18em] text-stone-600 hover:text-stone-900 transition-colors"
          >
            <Share2 className="w-3 h-3" />
            <span>{copied ? "Link Copied!" : "Share Guide"}</span>
          </button>
        </div>
      </div>

      <article className="max-w-[1240px] mx-auto px-4 sm:px-8 lg:px-9 pt-8 sm:pt-14">
        {/* Editorial Guide Headline Block */}
        <header className="max-w-3xl space-y-4 pb-8 border-b border-stone-200">
          <span className="font-editorial-sans text-[9px] uppercase tracking-[0.25em] font-semibold text-stone-500 block">
            01 / CURATED CITY EDITORIAL · SPRING 2026
          </span>

          <h1 className="font-editorial-serif text-[38px] sm:text-[52px] md:text-[62px] leading-[1.04] font-normal text-stone-900 tracking-[-0.01em]">
            The Melbourne Edit
          </h1>

          <p className="font-editorial-serif italic text-lg sm:text-xl md:text-2xl leading-relaxed text-stone-700">
            Our favourite independent fashion boutiques, tactile ceramic studios, and design archives from Fitzroy to Armadale.
          </p>

          <div className="pt-3 flex flex-wrap items-center gap-4 text-stone-500 text-xs font-editorial-sans text-[8.5px] uppercase tracking-[0.2em] border-t border-stone-100">
            <span>Curated by DS/ Editorial Board</span>
            <span className="text-stone-300">·</span>
            <span>Photos by Elena Roche</span>
            <span className="text-stone-300">·</span>
            <span>8 Min Read</span>
            <span className="text-stone-300">·</span>
            <span className="text-emerald-800 font-semibold">6 Boutiques Featured</span>
          </div>
        </header>

        {/* Hero Collage */}
        <section className="py-8 grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-7 relative h-[360px] md:h-[480px] bg-stone-100 overflow-hidden group">
            <Image
              src="/images/hero/hero-main.jpg"
              alt="Aesop and Parlour Archive Gertrude Street storefront"
              fill
              priority
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-4 text-white">
              <span className="font-editorial-sans text-[8px] uppercase tracking-[0.2em] text-stone-300">
                FITZROY & GERTRUDE STREET
              </span>
              <p className="font-editorial-serif italic text-sm mt-0.5">
                Historic Victorian bluestone facade draped in climbing botanical ivy
              </p>
            </div>
          </div>

          <div className="md:col-span-5 grid grid-cols-2 md:grid-cols-1 gap-4">
            <div className="relative h-[172px] md:h-[232px] bg-stone-100 overflow-hidden group">
              <Image
                src="/images/generated/melbourne-laneway.jpg"
                alt="Cobblestone laneways in Melbourne at golden hour"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-3 text-white">
                <span className="font-editorial-sans text-[7.5px] uppercase tracking-[0.18em]">
                  COLLINGWOOD & FITZROY
                </span>
                <p className="font-editorial-serif italic text-xs">
                  Bluestone laneways at twilight
                </p>
              </div>
            </div>

            <div className="relative h-[172px] md:h-[232px] bg-stone-100 overflow-hidden group">
              <Image
                src="/images/guides/guide-arch.jpg"
                alt="Historic 19th-century Melbourne archway"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-3 text-white">
                <span className="font-editorial-sans text-[7.5px] uppercase tracking-[0.18em]">
                  BLOCK ARCADE & CBD
                </span>
                <p className="font-editorial-serif italic text-xs">
                  Ornate Victorian stone archways
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Jump Precinct Filter Bar */}
        <div className="sticky top-0 z-30 bg-[#FAF8F5]/90 backdrop-blur-md py-3.5 border-y border-stone-200 mb-10 flex items-center justify-between gap-4 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-2">
            <span className="font-editorial-sans text-[8px] uppercase tracking-[0.2em] font-bold text-stone-400 mr-2">
              PRECINCTS:
            </span>
            <button
              onClick={() => setActivePrecinct("fitzroy")}
              className={`px-3 py-1 text-[9.5px] uppercase tracking-[0.16em] transition-all whitespace-nowrap ${
                activePrecinct === "fitzroy"
                  ? "bg-[#1C1917] text-white font-medium"
                  : "text-stone-600 hover:text-stone-900 bg-white border border-stone-200"
              }`}
            >
              01. Fitzroy & Gertrude
            </button>
            <button
              onClick={() => setActivePrecinct("armadale")}
              className={`px-3 py-1 text-[9.5px] uppercase tracking-[0.16em] transition-all whitespace-nowrap ${
                activePrecinct === "armadale"
                  ? "bg-[#1C1917] text-white font-medium"
                  : "text-stone-600 hover:text-stone-900 bg-white border border-stone-200"
              }`}
            >
              02. High St Armadale
            </button>
            <button
              onClick={() => setActivePrecinct("carlton")}
              className={`px-3 py-1 text-[9.5px] uppercase tracking-[0.16em] transition-all whitespace-nowrap ${
                activePrecinct === "carlton"
                  ? "bg-[#1C1917] text-white font-medium"
                  : "text-stone-600 hover:text-stone-900 bg-white border border-stone-200"
              }`}
            >
              03. Carlton & Arcades
            </button>
          </div>

          <Link
            href="/directory"
            className="text-[9.5px] font-editorial-sans uppercase tracking-[0.18em] text-stone-600 hover:text-stone-950 font-medium whitespace-nowrap hidden sm:inline-flex items-center gap-1"
          >
            <span>Directory Index</span>
            <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Longform Editorial & Boutique Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          {/* Main Story Flow */}
          <div className="lg:col-span-8 space-y-16">
            {/* PART 01: Fitzroy */}
            <section id="fitzroy" className="space-y-6">
              <div className="border-b border-stone-200 pb-2">
                <span className="font-editorial-sans text-[8.5px] uppercase tracking-[0.24em] font-semibold text-stone-500">
                  PRECINCT 01 / FITZROY
                </span>
                <h2 className="font-editorial-serif text-2xl sm:text-3xl font-normal text-stone-900 mt-1">
                  The Gertrude Street Botanical Renaissance
                </h2>
              </div>

              <div className="font-serif text-base sm:text-[17px] leading-[1.85] text-stone-700 space-y-4 text-justify">
                <p>
                  No thoroughfare in Australia embodies the quiet synthesis of heritage architecture and contemporary retail intimacy like Fitzroy&apos;s Gertrude Street. Once a working-class corridor of bootmakers and dry-goods merchants, its intact 1880s Victorian bluestone terraces now house some of the most exacting design studios in the Southern Hemisphere.
                </p>
                <p>
                  The experience begins under the plane trees outside the original Aesop flagship, where climbing Boston ivy frames an austere dark green timber shopfront. A few doors east, <strong>Parlour Archive & Atelier</strong> reinterprets retail as a private gallery exhibition, staging architectural tailoring alongside Victoria ceramicists on unlacquered brass display structures.
                </p>
              </div>

              {/* Featured Boutique Card 01 */}
              <div className="p-6 bg-white border border-stone-200 space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
                  <div>
                    <span className="font-editorial-sans text-[8px] uppercase tracking-[0.2em] text-stone-400">
                      FEATURED BOUTIQUE PROFILE
                    </span>
                    <h3 className="font-editorial-serif text-2xl text-stone-900 mt-0.5">
                      Parlour Archive & Atelier
                    </h3>
                  </div>

                  <Link
                    href="/shop"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1C1917] text-white rounded text-[10px] font-editorial-sans uppercase tracking-[0.16em] hover:bg-stone-800 transition-colors"
                  >
                    <span>View Shop Profile & CMS</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="relative aspect-[4/3] bg-stone-100 overflow-hidden">
                    <Image
                      src="/images/hero/hero-main.jpg"
                      alt="Parlour Archive"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="space-y-2 text-xs">
                    <p className="font-editorial-sans text-[9px] uppercase tracking-[0.16em] text-stone-500 font-medium">
                      DESIGNER APPAREL · CERAMICS · ART MONOGRAPHS
                    </p>
                    <p className="font-serif italic text-stone-600 leading-relaxed">
                      &ldquo;Tactile limewash walls, unlacquered brass garment racks, and an impeccably curated rotation of Australian independent tailoring.&rdquo;
                    </p>
                    <div className="pt-2 text-[11px] text-stone-500 font-mono space-y-1">
                      <div>📍 168 Gertrude Street, Fitzroy VIC 3065</div>
                      <div>🕒 Wed–Sun 10am–6pm</div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Pull Quote Break */}
            <div className="my-8 py-8 border-y border-stone-200 text-center">
              <blockquote className="font-serif italic text-xl sm:text-2xl text-stone-800 max-w-xl mx-auto">
                &ldquo;Melbourne&apos;s boutiques are not shopping destinations in the commercial sense. They are living architectural archives that preserve our tactile heritage.&rdquo;
              </blockquote>
              <span className="font-editorial-sans text-[9px] uppercase tracking-[0.2em] text-stone-500 mt-3 block">
                — Elena Rostova, DS/ Melbourne Bureau Chief
              </span>
            </div>

            {/* PART 02: Armadale */}
            <section id="armadale" className="space-y-6">
              <div className="border-b border-stone-200 pb-2">
                <span className="font-editorial-sans text-[8.5px] uppercase tracking-[0.24em] font-semibold text-stone-500">
                  PRECINCT 02 / ARMADALE
                </span>
                <h2 className="font-editorial-serif text-2xl sm:text-3xl font-normal text-stone-900 mt-1">
                  High Street: Antiquity & The Sculptural Vessel
                </h2>
              </div>

              <div className="font-serif text-base sm:text-[17px] leading-[1.85] text-stone-700 space-y-4 text-justify">
                <p>
                  Travel south along the tree-lined ridge of High Street Armadale, and the retail tempo shifts from gritty northern bohemianism to gracious European refinement. Here, nineteenth-century iron-laced verandas frame spaces dedicated to 20th-century French antiquity and rare botanical stoneware.
                </p>
                <p>
                  At <strong>Marton & Davis</strong>, mid-century Pierre Jeanneret chairs and brutalist bronze lighting share floor space with museum-grade ceramics. Two doors down, <strong>Botanica & Object</strong> pairs exotic indoor flora with unglazed Japanese vessels, creating a lush sanctuary off the bustling high street.
                </p>
              </div>

              {/* Featured Boutique Card 02 */}
              <div className="p-6 bg-white border border-stone-200 space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
                  <div>
                    <span className="font-editorial-sans text-[8px] uppercase tracking-[0.2em] text-stone-400">
                      FEATURED BOUTIQUE PROFILE
                    </span>
                    <h3 className="font-editorial-serif text-2xl text-stone-900 mt-0.5">
                      Marton & Davis
                    </h3>
                  </div>

                  <Link
                    href="/directory"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded text-[10px] font-editorial-sans uppercase tracking-[0.16em] transition-colors"
                  >
                    <span>View in Directory</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="relative aspect-[4/3] bg-stone-100 overflow-hidden">
                    <Image
                      src="/images/discoveries/marton-and-davis.jpg"
                      alt="Marton & Davis storefront"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="space-y-2 text-xs">
                    <p className="font-editorial-sans text-[9px] uppercase tracking-[0.16em] text-stone-500 font-medium">
                      MID-CENTURY ANTIQUES · LIGHTING · BRUTALIST OBJECTS
                    </p>
                    <p className="font-serif italic text-stone-600 leading-relaxed">
                      &ldquo;A seminal High Street institution housing European mid-century furniture, archival lighting, and collectible interior design pieces.&rdquo;
                    </p>
                    <div className="pt-2 text-[11px] text-stone-500 font-mono space-y-1">
                      <div>📍 1032 High Street, Armadale VIC 3143</div>
                      <div>🕒 Wed–Sun 11am–5pm</div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* PART 03: Carlton & CBD */}
            <section id="carlton" className="space-y-6">
              <div className="border-b border-stone-200 pb-2">
                <span className="font-editorial-sans text-[8.5px] uppercase tracking-[0.24em] font-semibold text-stone-500">
                  PRECINCT 03 / CARLTON & CBD
                </span>
                <h2 className="font-editorial-serif text-2xl sm:text-3xl font-normal text-stone-900 mt-1">
                  Literary Havens & Heritage Block Arcades
                </h2>
              </div>

              <div className="font-serif text-base sm:text-[17px] leading-[1.85] text-stone-700 space-y-4 text-justify">
                <p>
                  No pilgrimage through Melbourne is complete without a morning immersed in the print sanctuaries of Carlton. At <strong>Talk Story Bookstore</strong> on Elgin Street, floor-to-ceiling dark timber shelves shelter out-of-print architecture monographs, Japanese brutalist design studies, and limited-edition poetry chapbooks.
                </p>
                <p>
                  From Carlton, a short stroll south brings you to the mosaic floors and vaulted glass dome of the Block Arcade, where bespoke suiting ateliers preserve bespoke tailoring traditions established during the 1890s gold rush.
                </p>
              </div>

              {/* Featured Boutique Card 03 */}
              <div className="p-6 bg-white border border-stone-200 space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
                  <div>
                    <span className="font-editorial-sans text-[8px] uppercase tracking-[0.2em] text-stone-400">
                      FEATURED BOUTIQUE PROFILE
                    </span>
                    <h3 className="font-editorial-serif text-2xl text-stone-900 mt-0.5">
                      Talk Story Bookstore
                    </h3>
                  </div>

                  <Link
                    href="/directory"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded text-[10px] font-editorial-sans uppercase tracking-[0.16em] transition-colors"
                  >
                    <span>View in Directory</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="relative aspect-[4/3] bg-stone-100 overflow-hidden">
                    <Image
                      src="/images/discoveries/talk-story.jpg"
                      alt="Talk Story Bookstore"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="space-y-2 text-xs">
                    <p className="font-editorial-sans text-[9px] uppercase tracking-[0.16em] text-stone-500 font-medium">
                      RARE ART BOOKS · ARCHITECTURE MONOGRAPHS · PRINTS
                    </p>
                    <p className="font-serif italic text-stone-600 leading-relaxed">
                      &ldquo;An intimate sanctuary dedicated to monographs on brutalist architecture, independent poetry presses, and out-of-print art catalogs.&rdquo;
                    </p>
                    <div className="pt-2 text-[11px] text-stone-500 font-mono space-y-1">
                      <div>📍 189 Elgin Street, Carlton VIC 3053</div>
                      <div>🕒 Daily 10am–7pm</div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Sticky Editorial Sidebar */}
          <aside className="lg:col-span-4 lg:sticky lg:top-24 space-y-8">
            {/* Guide Quick Facts Card */}
            <div className="p-6 bg-white border border-stone-200 space-y-4 text-xs">
              <span className="font-editorial-sans text-[8.5px] uppercase tracking-[0.2em] font-semibold text-stone-500 block pb-2 border-b border-stone-100">
                GUIDE SUMMARY
              </span>

              <div className="space-y-3 font-sans text-stone-700">
                <div className="flex items-start gap-2.5">
                  <Compass className="w-4 h-4 text-stone-400 mt-0.5 shrink-0" />
                  <div>
                    <span className="font-editorial-sans text-[8.5px] uppercase tracking-wider text-stone-400 block">
                      BEST TIME TO EXPLORE
                    </span>
                    <span className="font-serif text-sm text-stone-900">
                      Thursday to Saturday, 10:30am–4:00pm
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-stone-400 mt-0.5 shrink-0" />
                  <div>
                    <span className="font-editorial-sans text-[8.5px] uppercase tracking-wider text-stone-400 block">
                      STARTING POINT
                    </span>
                    <span className="font-serif text-sm text-stone-900">
                      Gertrude & Napier St, Fitzroy
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <Clock className="w-4 h-4 text-stone-400 mt-0.5 shrink-0" />
                  <div>
                    <span className="font-editorial-sans text-[8.5px] uppercase tracking-wider text-stone-400 block">
                      SUGGESTED DURATION
                    </span>
                    <span className="font-serif text-sm text-stone-900">
                      Full Day (4–6 Hours with Coffee Stops)
                    </span>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="pt-3 border-t border-stone-100 space-y-2">
                <Link
                  href="/directory"
                  className="w-full inline-flex items-center justify-center gap-1.5 py-2 bg-[#1C1917] hover:bg-stone-800 text-white text-[10px] font-editorial-sans uppercase tracking-[0.16em] transition-colors"
                >
                  <span>Explore Directory (12 Boutiques)</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>

                <Link
                  href="/shop"
                  className="w-full inline-flex items-center justify-center gap-1.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 text-[10px] font-editorial-sans uppercase tracking-[0.16em] transition-colors border border-stone-200"
                >
                  <span>View Parlour Archive CMS</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Coffee & Wine Curations Card */}
            <div className="p-6 bg-stone-50 border border-stone-200/80 space-y-3 text-xs">
              <span className="font-editorial-sans text-[8.5px] uppercase tracking-[0.2em] font-semibold text-stone-500 block pb-1 border-b border-stone-200">
                CURATED ARCHITECTURAL COFFEE STOPS
              </span>

              <div className="space-y-3">
                <div>
                  <h4 className="font-editorial-serif text-sm text-stone-900 font-medium">
                    Archie&apos;s All Day
                  </h4>
                  <p className="text-[11px] text-stone-500 font-serif italic">
                    189 Gertrude St, Fitzroy · Sunlit courtyard and natural wine
                  </p>
                </div>

                <div>
                  <h4 className="font-editorial-serif text-sm text-stone-900 font-medium">
                    Market Lane Coffee
                  </h4>
                  <p className="text-[11px] text-stone-500 font-serif italic">
                    Carlton Heritage Tram Stop · Exemplary single-origin filter
                  </p>
                </div>

                <div>
                  <h4 className="font-editorial-serif text-sm text-stone-900 font-medium">
                    Mammoth Café
                  </h4>
                  <p className="text-[11px] text-stone-500 font-serif italic">
                    736 Malvern Rd, Armadale · Mid-century timber and clean fare
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </article>
    </div>
  );
};

