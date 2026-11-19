"use client";

import React from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import { QueryMode } from "@/types/chat";

interface EmptyStateProps {
  onSelectPrompt: (prompt: string, mode: QueryMode) => void;
}

const STARTER_CARDS = [
  {
    num: "01",
    title: "SQL Analytics",
    tag: "MARTS LAYER",
    desc: "Query Snowflake MARTS for top cities by GMV, cuisine demand, cancel rates, and delivery SLAs.",
    prompt: "Top 10 cities by GMV",
    mode: "sql" as QueryMode,
  },
  {
    num: "02",
    title: "Reviews RAG",
    tag: "LOCAL VECTORS",
    desc: "Search local embeddings over customer reviews to surface complaints, delivery feedback, and praise.",
    prompt: "Why are customers in Delhi complaining lately?",
    mode: "rag" as QueryMode,
  },
  {
    num: "03",
    title: "Dual Intelligence",
    tag: "SQL + RAG",
    desc: "Combine Snowflake GMV rankings with real customer review complaints in a single flagship view.",
    prompt: "Top cities by GMV and main complaints in Delhi?",
    mode: "auto" as QueryMode,
  },
];

const QUICK_PILLS = [
  "Which cuisine has the most orders?",
  "Average delivery time by city, worst first",
  "Cancel rate by payment method",
  "What do customers praise about packaging?",
];

export const EmptyState: React.FC<EmptyStateProps> = ({ onSelectPrompt }) => {
  return (
    <div className="mx-auto flex max-w-5xl flex-col justify-center pt-2 sm:pt-6">
      {/* Eyebrow Badge */}
      <div className="mb-4 flex items-center">
        <div className="inline-flex items-center gap-2 rounded-full border-[1.5px] border-[#141413] bg-white px-3.5 py-1 text-[11px] font-black tracking-wider text-[#141413] shadow-[2px_2px_0px_#141413]">
          <span className="h-2.5 w-2.5 rounded-[3px] border border-[#141413] bg-[#F2C94C]" />
          <span>ZOMATO REVIEW &amp; DATA INTELLIGENCE</span>
        </div>
      </div>

      {/* High-Contrast Display Headline */}
      <h1 className="max-w-3xl text-3xl font-black leading-[1.15] tracking-tight text-[#141413] sm:text-5xl">
        Ask real questions across your{" "}
        <span className="marker-underline">Zomato data &amp; reviews.</span>
      </h1>
      <p className="mt-3 max-w-2xl text-sm font-medium text-[#57534E] sm:text-base">
        Query Snowflake{" "}
        <span className="font-mono font-bold text-[#141413]">MARTS</span> with
        live SQL or semantically search local{" "}
        <span className="font-mono font-bold text-[#141413]">STG_REVIEWS</span>{" "}
        embeddings—unified inside one flagship workspace.
      </p>

      {/* 3 Numbered Starter Cards */}
      <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-3">
        {STARTER_CARDS.map((card) => (
          <button
            key={card.num}
            type="button"
            onClick={() => onSelectPrompt(card.prompt, card.mode)}
            className="flagship-card flagship-card-interactive group flex flex-col justify-between rounded-2xl bg-white p-5 text-left"
          >
            <div>
              <div className="mb-5 flex items-center justify-between">
                <span className="inline-flex items-center justify-center rounded-lg border-[1.5px] border-[#141413] bg-[#F2C94C] px-2.5 py-1 text-xs font-black text-[#141413] shadow-[2px_2px_0px_#141413]">
                  {card.num}
                </span>
                <span className="rounded-full border border-[#141413]/20 bg-[#F7F3EA] px-2.5 py-0.5 text-[10px] font-extrabold tracking-wider text-[#57534E]">
                  {card.tag}
                </span>
              </div>

              <h3 className="text-xl font-black tracking-tight text-[#141413]">
                {card.title}
              </h3>
              <p className="mt-2 text-xs font-medium leading-relaxed text-[#57534E] sm:text-sm">
                {card.desc}
              </p>
            </div>

            <div className="mt-6 flex items-center justify-between border-t-[1.5px] border-[#141413]/15 pt-3.5 text-xs font-extrabold text-[#141413]">
              <span className="truncate pr-2">&ldquo;{card.prompt}&rdquo;</span>
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#141413] text-[#F7F3EA] transition-transform group-hover:translate-x-0.5">
                <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* Row of 4 Compact Quick Prompt Pills */}
      <div className="mt-7">
        <span className="mb-2.5 block text-[11px] font-extrabold uppercase tracking-wider text-[#57534E]">
          Quick Prompts
        </span>
        <div className="flex flex-wrap gap-2.5">
          {QUICK_PILLS.map((pill) => (
            <button
              key={pill}
              type="button"
              onClick={() => onSelectPrompt(pill, "auto")}
              className="inline-flex items-center gap-1.5 rounded-full border-[1.5px] border-[#141413] bg-white px-3.5 py-2 text-xs font-bold text-[#141413] shadow-[2px_2px_0px_#141413] transition-all hover:-translate-y-[1px] hover:bg-[#F2C94C] active:translate-y-0"
            >
              <Sparkles className="h-3.5 w-3.5 shrink-0" />
              <span>{pill}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

