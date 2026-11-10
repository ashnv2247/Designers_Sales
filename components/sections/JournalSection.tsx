"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { JOURNAL_ARTICLES } from "@/data/journal";
import { ArrowUpRight } from "lucide-react";

export const JournalSection: React.FC = () => {
  return (
    <section id="journal" className="w-full py-10 sm:py-14 bg-background select-none">
      <div className="w-full max-w-[1400px] mx-auto px-5 sm:px-8 lg:px-9">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between pb-6 border-b border-editorial-border gap-3">
          <div>
            <span className="font-editorial-sans text-[8.5px] sm:text-[9px] tracking-[0.24em] uppercase text-editorial-accent font-semibold">
              THE DESIGNERSALE JOURNAL
            </span>
            <h2 className="font-editorial-serif text-[32px] sm:text-[38px] leading-tight font-normal text-foreground mt-1">
              Essays, City Edits & Conversations
            </h2>
          </div>
          <Link
            href="#journal"
            className="inline-flex items-center gap-1 font-editorial-sans text-[8.5px] sm:text-[9.5px] uppercase tracking-[0.20em] font-medium text-foreground pb-0.5 border-b border-foreground hover:opacity-75 transition-opacity"
          >
            <span>VIEW ALL DISPATCHES</span>
            <span className="text-[11px] leading-none">↗</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
          {JOURNAL_ARTICLES.map((article) => (
            <article
              key={article.id}
              className="flex flex-col group cursor-pointer"
            >
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-surface-card shadow-sm">
                <Image
                  src={article.image}
                  alt={article.title}
                  fill
                  className="object-cover object-center transition-transform duration-700 group-hover:scale-[1.03]"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                <div className="absolute top-3 left-3 bg-background/90 backdrop-blur-sm px-2 py-0.5 text-[8px] uppercase tracking-[0.18em] font-semibold text-editorial-accent">
                  {article.category}
                </div>
              </div>

              <div className="pt-3.5 pb-1 flex flex-col justify-between flex-1">
                <div>
                  <div className="flex items-center gap-3 text-editorial-caption">
                    <span className="font-editorial-sans text-[8px] uppercase tracking-[0.20em]">
                      {article.date}
                    </span>
                    <span>•</span>
                    <span className="font-editorial-sans text-[8px] uppercase tracking-[0.20em]">
                      {article.readTime}
                    </span>
                  </div>

                  <h3 className="font-editorial-serif text-[20px] sm:text-[22px] leading-snug font-normal text-foreground group-hover:opacity-85 transition-opacity mt-2">
                    {article.title}
                  </h3>

                  <p className="font-editorial-serif italic text-[13px] leading-relaxed text-foreground/75 mt-2 line-clamp-3">
                    {article.excerpt}
                  </p>
                </div>

                <div className="pt-4 mt-3 border-t border-editorial-border/60 flex items-center justify-between">
                  <span className="font-editorial-sans text-[8px] uppercase tracking-[0.20em] text-editorial-caption">
                    WORDS BY {article.author}
                  </span>
                  <span className="inline-flex items-center gap-1 font-editorial-sans text-[8.5px] uppercase tracking-[0.20em] font-semibold text-foreground group-hover:translate-x-0.5 transition-transform">
                    <span>READ</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default JournalSection;

