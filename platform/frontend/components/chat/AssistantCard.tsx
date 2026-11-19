"use client";

import React from "react";
import { Clock, AlertCircle } from "lucide-react";
import { ChatMessage } from "@/types/chat";
import { SqlArtifact } from "../artifacts/SqlArtifact";
import { ReviewsArtifact } from "../artifacts/ReviewsArtifact";

interface AssistantCardProps {
  message: ChatMessage;
  isLatest?: boolean;
}

export const AssistantCard: React.FC<AssistantCardProps> = ({
  message,
  isLatest = false,
}) => {
  if (message.error) {
    return (
      <div className="flagship-card w-full rounded-2xl border-rose-500 bg-white p-5 shadow-[4px_4px_0px_#f43f5e] sm:p-6">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-rose-100 p-2 text-rose-700">
            <AlertCircle className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-sm font-black text-rose-700">
              Query Execution Error
            </h4>
            <p className="mt-1 text-xs font-semibold leading-relaxed text-[#141413]">
              {message.content}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const hasSQL = Boolean(message.sqlResult && message.sqlResult.rows?.length > 0);
  const hasRAG = Boolean(message.sources && message.sources.length > 0);
  const isDual = message.modeUsed === "dual" || (hasSQL && hasRAG);

  return (
    <div className="flagship-card w-full rounded-2xl bg-white p-5 sm:p-6">
      {/* Card Header: Mode Tags + Latency Chip */}
      <div className="mb-3.5 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          {(message.modeUsed === "sql" || message.modeUsed === "dual") && (
            <span className="inline-flex items-center overflow-hidden rounded-lg border-[1.5px] border-[#141413] bg-[#F2C94C] text-[11px] font-black tracking-wide text-[#141413] shadow-[2px_2px_0px_#141413]">
              <span className="border-r-[1.5px] border-[#141413] bg-[#F7D979] px-1.5 py-0.5">
                01
              </span>
              <span className="px-2 py-0.5">SQL ANALYTICS</span>
            </span>
          )}

          {(message.modeUsed === "rag" || message.modeUsed === "dual") && (
            <span className="inline-flex items-center overflow-hidden rounded-lg border-[1.5px] border-[#141413] bg-[#F2C94C] text-[11px] font-black tracking-wide text-[#141413] shadow-[2px_2px_0px_#141413]">
              <span className="border-r-[1.5px] border-[#141413] bg-[#F7D979] px-1.5 py-0.5">
                {message.modeUsed === "dual" ? "02" : "01"}
              </span>
              <span className="px-2 py-0.5">REVIEWS RAG</span>
            </span>
          )}

          {typeof message.latencyMs === "number" && (
            <span className="inline-flex items-center gap-1 rounded-full border border-[#141413]/25 bg-[#F7F3EA] px-2.5 py-0.5 text-[11px] font-semibold text-[#57534E]">
              <Clock className="h-3 w-3" />
              {message.latencyMs}ms
            </span>
          )}
        </div>
      </div>

      {/* Grounded Summary Text */}
      <div className="text-sm font-medium leading-relaxed text-[#141413] sm:text-[15px] whitespace-pre-line">
        {message.content}
      </div>

      {/* Artifacts Container: Dual Mode -> 2 Columns on desktop, 1 Column otherwise */}
      {(hasSQL || hasRAG) && (
        <div
          className={`mt-4 grid gap-4 ${
            isDual ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1"
          }`}
        >
          {hasSQL && message.sqlResult && (
            <SqlArtifact sqlResult={message.sqlResult} />
          )}

          {hasRAG && message.sources && (
            <ReviewsArtifact
              sources={message.sources}
              defaultOpen={isLatest}
            />
          )}
        </div>
      )}
    </div>
  );
};

