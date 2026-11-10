"use client";

import React, { useState } from "react";
import { Plus, Minus, MapPin, ExternalLink, Navigation } from "lucide-react";

interface PrecinctMapProps {
  coordinates: {
    lat: number;
    lng: number;
  };
  shopName: string;
  precinct: string;
  addressFormatted?: string;
}

export const PrecinctMap: React.FC<PrecinctMapProps> = ({
  coordinates,
  shopName,
  precinct,
  addressFormatted = "",
}) => {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isTooltipOpen, setIsTooltipOpen] = useState(true);

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.25, 2.0));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.25, 0.75));
  };

  const handleReset = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  };

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    addressFormatted || `${coordinates.lat},${coordinates.lng}`
  )}`;

  return (
    <div
      data-testid="precinct-map"
      className="h-[280px] lg:h-[340px] w-full bg-[#F3EFEA] border border-stone-200 relative overflow-hidden select-none group"
      aria-label={`Interactive map of ${precinct}`}
    >
      {/* SVG Canvas Map with Muted Sepia/Monochrome Grid */}
      <div
        className="w-full h-full cursor-grab active:cursor-grabbing transition-transform duration-300 flex items-center justify-center relative"
        style={{
          transform: `scale(${zoomLevel}) translate(${panOffset.x}px, ${panOffset.y}px)`,
        }}
      >
        <svg
          viewBox="0 0 500 400"
          className="w-[600px] h-[480px] text-stone-300"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Muted background tint */}
          <rect width="500" height="400" fill="#F4EFEA" />

          {/* Urban Grid Blocks */}
          <g fill="#EAE4DC" opacity="0.6">
            <rect x="40" y="40" width="80" height="60" />
            <rect x="140" y="40" width="90" height="60" />
            <rect x="250" y="40" width="90" height="60" />
            <rect x="360" y="40" width="100" height="60" />

            <rect x="40" y="120" width="80" height="100" />
            <rect x="140" y="120" width="90" height="100" />
            <rect x="250" y="120" width="90" height="100" />
            <rect x="360" y="120" width="100" height="100" />

            <rect x="40" y="240" width="80" height="120" />
            <rect x="140" y="240" width="90" height="120" />
            <rect x="250" y="240" width="90" height="120" />
            <rect x="360" y="240" width="100" height="120" />
          </g>

          {/* Park / Greenery zone (e.g. Carlton Gardens / Fitzroy Garden) */}
          <path
            d="M 10 300 Q 60 280 110 320 L 110 390 L 10 390 Z"
            fill="#E3E8DC"
            opacity="0.7"
          />
          <text
            x="30"
            y="350"
            className="text-[9px] fill-stone-500 font-sans tracking-[0.1em] font-medium"
          >
            CARLTON GDNS
          </text>

          {/* Street Grid Lines (Major & Minor) */}
          {/* Vertical Cross Streets */}
          <line x1="130" y1="20" x2="130" y2="380" stroke="#DDD6CC" strokeWidth="6" />
          <line x1="240" y1="20" x2="240" y2="380" stroke="#DDD6CC" strokeWidth="8" />
          <line x1="350" y1="20" x2="350" y2="380" stroke="#DDD6CC" strokeWidth="6" />

          {/* Horizontal Arterials */}
          <line x1="20" y1="110" x2="480" y2="110" stroke="#DDD6CC" strokeWidth="6" />
          {/* Main Boulevard: Gertrude Street */}
          <line x1="20" y1="230" x2="480" y2="230" stroke="#CFBFAD" strokeWidth="12" />
          <line x1="20" y1="370" x2="480" y2="370" stroke="#DDD6CC" strokeWidth="7" />

          {/* Street Labels */}
          <text
            x="245"
            y="70"
            transform="rotate(90 245 70)"
            className="text-[8.5px] fill-stone-500 font-sans uppercase tracking-[0.2em]"
          >
            Brunswick St
          </text>
          <text
            x="355"
            y="70"
            transform="rotate(90 355 70)"
            className="text-[8px] fill-stone-400 font-sans uppercase tracking-[0.2em]"
          >
            Smith St
          </text>
          <text
            x="135"
            y="70"
            transform="rotate(90 135 70)"
            className="text-[8px] fill-stone-400 font-sans uppercase tracking-[0.2em]"
          >
            Napier St
          </text>

          {/* Gertrude Street Banner Label */}
          <text
            x="70"
            y="226"
            className="text-[10px] fill-stone-700 font-sans uppercase tracking-[0.25em] font-medium"
          >
            Gertrude Street
          </text>

          {/* High-Contrast Charcoal Pin at exact coordinates */}
          {/* Center Coordinates on Gertrude St between Napier and Brunswick */}
          <g
            className="cursor-pointer transition-transform duration-300 hover:scale-110"
            onClick={() => setIsTooltipOpen(!isTooltipOpen)}
          >
            {/* Pulsing ring */}
            <circle cx="210" cy="230" r="14" fill="#1C1917" opacity="0.15">
              <animate
                attributeName="r"
                values="10;22;10"
                dur="3s"
                repeatCount="indefinite"
              />
              <animate
                attributeName="opacity"
                values="0.25;0;0.25"
                dur="3s"
                repeatCount="indefinite"
              />
            </circle>

            {/* Solid Pin Body */}
            <circle cx="210" cy="230" r="7" fill="#1C1917" stroke="#FAF8F5" strokeWidth="2.5" />
            <circle cx="210" cy="230" r="2.5" fill="#FAF8F5" />
          </g>
        </svg>

        {/* Pin Tooltip Box */}
        {isTooltipOpen && (
          <div
            className="absolute top-[48%] left-[42%] -translate-x-1/2 -translate-y-full mb-3 bg-[#1C1917] text-[#FAF8F5] px-3 py-1.5 shadow-xl border border-stone-700 pointer-events-none z-20 whitespace-nowrap"
          >
            <div className="font-editorial-sans text-[8.5px] uppercase tracking-[0.22em] font-semibold text-emerald-400">
              {precinct}
            </div>
            <div className="font-editorial-serif text-[12px] font-normal leading-tight text-white mt-0.5">
              {shopName}
            </div>
            <div className="font-mono text-[7.5px] text-stone-400 mt-0.5">
              {coordinates.lat.toFixed(4)}, {coordinates.lng.toFixed(4)}
            </div>
            {/* Tooltip caret */}
            <div className="w-2 h-2 bg-[#1C1917] rotate-45 absolute -bottom-1 left-1/2 -translate-x-1/2" />
          </div>
        )}
      </div>

      {/* Map Header / Location Badge */}
      <div className="absolute top-3 left-3 bg-[#FAF8F5]/90 backdrop-blur-sm border border-stone-200 px-2.5 py-1 z-10">
        <div className="flex items-center gap-1.5">
          <Navigation className="w-3 h-3 text-stone-700 stroke-[2]" />
          <span className="font-editorial-sans text-[8.5px] uppercase tracking-[0.22em] font-semibold text-stone-800">
            {precinct}
          </span>
        </div>
      </div>

      {/* Map Controls Toolbar */}
      <div className="absolute bottom-3 right-3 flex items-center gap-1.5 z-10">
        <button
          onClick={handleZoomIn}
          className="w-7 h-7 bg-white/95 border border-stone-200 text-stone-800 hover:bg-stone-50 flex items-center justify-center transition-colors shadow-sm"
          aria-label="Zoom in"
          title="Zoom In"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2]" />
        </button>
        <button
          onClick={handleZoomOut}
          className="w-7 h-7 bg-white/95 border border-stone-200 text-stone-800 hover:bg-stone-50 flex items-center justify-center transition-colors shadow-sm"
          aria-label="Zoom out"
          title="Zoom Out"
        >
          <Minus className="w-3.5 h-3.5 stroke-[2]" />
        </button>
        <button
          onClick={handleReset}
          className="px-2 h-7 bg-white/95 border border-stone-200 text-stone-700 hover:text-stone-900 font-editorial-sans text-[8px] uppercase tracking-[0.16em] flex items-center justify-center transition-colors shadow-sm font-semibold"
          title="Reset View"
        >
          RESET
        </button>
        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="h-7 px-2.5 bg-[#1C1917] text-[#FAF8F5] hover:bg-stone-800 font-editorial-sans text-[8.5px] uppercase tracking-[0.18em] flex items-center gap-1 transition-colors shadow-sm font-medium"
          title="Open in Google Maps"
        >
          <span>MAPS</span>
          <ExternalLink className="w-2.5 h-2.5" />
        </a>
      </div>
    </div>
  );
};

export default PrecinctMap;

