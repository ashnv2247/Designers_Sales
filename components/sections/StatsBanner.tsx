"use client";

import React from "react";

const STATS = [
  {
    number: "480+",
    label: "CURATED BOUTIQUES",
    description: "Independently owned designer shops, studios and concept spaces across Australia.",
  },
  {
    number: "12",
    label: "CITIES & COASTAL TOWNS",
    description: "From Melbourne laneways and Sydney terraces to James Street and Byron Bay.",
  },
  {
    number: "100%",
    label: "VERIFIED INDEPENDENT",
    description: "Strictly independent, local proprietors and authentic craftspeople.",
  },
  {
    number: "WEEKLY",
    label: "CURATED UPDATES",
    description: "Continuously refreshed by our local editorial scouts on the ground.",
  },
];

export const StatsBanner: React.FC = () => {
  return (
    <section className="w-full py-8 sm:py-10 bg-[#EFE8DD] border-y border-editorial-border select-none">
      <div className="w-full max-w-[1400px] mx-auto px-5 sm:px-8 lg:px-9">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 divide-y sm:divide-y-0 sm:divide-x divide-foreground/15">
          {STATS.map((stat, i) => (
            <div
              key={stat.label}
              className={`flex flex-col items-start ${i > 0 ? "pt-4 sm:pt-0 sm:pl-6 lg:pl-8" : ""}`}
            >
              <span className="font-editorial-serif text-[32px] sm:text-[38px] lg:text-[42px] leading-none font-normal text-foreground">
                {stat.number}
              </span>
              <span className="font-editorial-sans text-[8.5px] sm:text-[9px] uppercase tracking-[0.24em] font-medium text-foreground mt-2">
                {stat.label}
              </span>
              <p className="font-editorial-serif italic text-[11.5px] sm:text-[12.5px] leading-relaxed text-foreground/75 mt-1 max-w-[220px]">
                {stat.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsBanner;

