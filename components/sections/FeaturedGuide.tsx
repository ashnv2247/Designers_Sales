"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";

export const FeaturedGuide: React.FC = () => {
  return (
    <section id="featured-guide-section" className="w-full pt-2 sm:pt-2.5 pb-2 select-none">
      <div className="w-full max-w-[1400px] mx-auto px-5 sm:px-8 lg:px-9">
        <div className="w-full bg-[#EBE3D7] relative flex flex-col md:flex-row items-stretch justify-between md:h-[118px] overflow-hidden shadow-sm">
          {/* Clean botanical leaf shadow with zero ghosted text */}
          <div
            className="absolute top-0 left-0 w-[180px] h-full pointer-events-none opacity-50 mix-blend-multiply bg-no-repeat bg-contain"
            style={{
              backgroundImage: "url('/images/texture/clean-leaf-shadow.svg')",
            }}
            aria-hidden="true"
          />

          {/* Left Block: FEATURED GUIDE label */}
          <div className="relative z-10 px-5 sm:px-7 py-4 sm:py-0 flex flex-col justify-center items-start md:w-[180px] flex-shrink-0">
            <span className="font-editorial-sans text-[8.5px] sm:text-[9px] uppercase tracking-[0.24em] font-medium text-foreground/85">
              FEATURED GUIDE
            </span>
            <div className="w-7 h-[1px] bg-foreground/40 mt-2" />
          </div>

          {/* Center Block: The Melbourne Edit */}
          <div className="relative z-10 px-4 sm:px-6 py-2 sm:py-0 flex-1 flex flex-col justify-center items-start">
            <h2 className="font-editorial-serif italic font-normal text-[32px] sm:text-[36px] md:text-[38px] leading-[1.05] text-foreground tracking-[-0.01em]">
              The Melbourne Edit
            </h2>
            <p className="font-editorial-serif italic text-[12px] sm:text-[13px] leading-relaxed text-foreground/80 mt-1">
              Our favourite independent fashion boutiques, from Fitzroy to Armadale.
            </p>
          </div>

          {/* Right Action: READ THE GUIDE */}
          <div className="relative z-10 px-5 sm:px-6 py-3 sm:py-0 flex items-center justify-start md:justify-center flex-shrink-0">
            <Link
              href="/guides/melbourne-edit"
              className="inline-flex items-center gap-1 font-editorial-sans text-[8.5px] sm:text-[9px] uppercase tracking-[0.22em] font-medium text-foreground pb-0.5 border-b border-foreground hover:opacity-75 transition-opacity"
            >
              <span>READ THE GUIDE</span>
              <span className="text-[11px] leading-none">↗</span>
            </Link>
          </div>

          {/* Far Right: Classical Heritage Archway Photograph */}
          <div className="relative w-full md:w-[87px] h-[100px] md:h-[118px] flex-shrink-0 bg-surface-card overflow-hidden">
            <Image
              src="/images/guides/guide-arch.jpg"
              alt="Ornate Melbourne heritage architectural archway"
              fill
              className="object-cover object-center transition-transform duration-700 hover:scale-[1.03]"
              sizes="87px"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedGuide;
