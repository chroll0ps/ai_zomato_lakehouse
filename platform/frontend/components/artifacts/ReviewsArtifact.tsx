"use client";

import React, { useState } from "react";
import { Search, ChevronUp, ChevronDown, Star, MapPin } from "lucide-react";
import { ReviewSource } from "@/types/chat";

interface ReviewsArtifactProps {
  sources: ReviewSource[];
  defaultOpen?: boolean;
}

export const ReviewsArtifact: React.FC<ReviewsArtifactProps> = ({
  sources,
  defaultOpen = true,
}) => {
  const [showReviews, setShowReviews] = useState(defaultOpen);

  if (!sources || sources.length === 0) return null;

  return (
    <div className="flex flex-col rounded-xl border-[1.5px] border-[#141413]/25 bg-[#F7F3EA] p-4">
      <button
        type="button"
        onClick={() => setShowReviews((prev) => !prev)}
        className="flex w-full items-center justify-between rounded-xl bg-[#141413] px-4 py-2.5 text-xs font-bold text-[#F7F3EA] transition-all hover:bg-[#262624] active:scale-[0.99]"
      >
        <span className="inline-flex items-center gap-2">
          <Search className="h-3.5 w-3.5 text-[#F2C94C]" />
          Inspect {sources.length} Retrieved Reviews
        </span>
        {showReviews ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </button>

      {showReviews && (
        <div className="mt-3 max-h-[260px] space-y-2.5 overflow-y-auto pr-1 custom-scroll">
          {sources.map((src, idx) => (
            <div
              key={idx}
              className="rounded-xl border-[1.5px] border-[#141413] bg-white p-3 transition-transform hover:-translate-y-[1px]"
            >
              <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-md border-[1.5px] border-[#141413] bg-[#F2C94C] px-2 py-0.5 text-[11px] font-black text-[#141413]">
                    {src.rating}/5
                    <Star className="h-2.5 w-2.5 fill-[#141413] text-[#141413]" />
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-[#141413]">
                    <MapPin className="h-3 w-3 text-[#57534E]" />
                    {src.city}
                  </span>
                </div>
                {typeof src.score === "number" && (
                  <span className="rounded-full border border-[#141413]/20 bg-[#F7F3EA] px-2 py-0.5 font-mono text-[10px] font-bold text-[#57534E]">
                    {Math.round(src.score * 100)}% match
                  </span>
                )}
              </div>
              <p className="text-xs leading-relaxed text-[#141413]">
                {src.comment}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

