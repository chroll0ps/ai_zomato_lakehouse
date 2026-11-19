"use client";

import React, { useRef, useEffect } from "react";
import { ArrowUp, Layers } from "lucide-react";
import { QueryMode } from "@/types/chat";

interface ChatComposerProps {
  input: string;
  onInputChange: (val: string) => void;
  onSend: () => void;
  isLoading: boolean;
  mode: QueryMode;
  onModeChange: (mode: QueryMode) => void;
  cityFilter: string;
}

export const ChatComposer: React.FC<ChatComposerProps> = ({
  input,
  onInputChange,
  onSend,
  isLoading,
  mode,
  onModeChange,
  cityFilter,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea height
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 140)}px`;
  }, [input]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (input.trim() && !isLoading) {
        onSend();
      }
    }
  };

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-[#F7F3EA] via-[#F7F3EA]/95 to-transparent px-4 pb-5 pt-10 sm:px-6">
      <div className="pointer-events-auto mx-auto max-w-3xl">
        <div className="flagship-card rounded-2xl bg-white p-3">
          {/* Top Control Row: Segmented Mode Switcher Pill + Scope Indicator */}
          <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2">
            <div className="inline-flex rounded-full border-[1.5px] border-[#141413] bg-[#F7F3EA] p-0.5">
              {[
                { id: "auto" as QueryMode, label: "Auto" },
                { id: "rag" as QueryMode, label: "Reviews RAG" },
                { id: "sql" as QueryMode, label: "SQL Analytics" },
              ].map((item) => {
                const active = mode === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onModeChange(item.id)}
                    className={`rounded-full px-3.5 py-1 text-xs font-bold transition-all ${
                      active
                        ? "bg-[#141413] text-[#F7F3EA] shadow-sm"
                        : "text-[#141413] hover:bg-[#EFE9DC]"
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>

            <div className="hidden items-center gap-1.5 text-[11px] font-semibold text-[#57534E] sm:flex">
              <Layers className="h-3.5 w-3.5" />
              <span>
                Scope: <strong className="text-[#141413]">{cityFilter}</strong>
              </span>
            </div>
          </div>

          {/* Bottom Input Row: Auto-growing Textarea + Solid Black Send Button */}
          <div className="flex items-end gap-2.5">
            <textarea
              ref={textareaRef}
              rows={1}
              value={input}
              onChange={(e) => onInputChange(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              placeholder="Ask anything about Zomato reviews or metrics..."
              className="max-h-36 flex-1 resize-none bg-transparent px-2 py-2 text-sm font-medium text-[#141413] placeholder:text-[#57534E] focus:outline-none disabled:opacity-50"
            />

            <button
              type="button"
              onClick={onSend}
              disabled={!input.trim() || isLoading}
              className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-xl bg-[#141413] px-4 text-sm font-bold text-[#F7F3EA] transition-all hover:bg-[#262624] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <span>Send</span>
              <ArrowUp className="h-4 w-4 stroke-[2.5]" />
            </button>
          </div>
        </div>

        <p className="mt-2 text-center text-[11px] font-medium text-[#57534E]">
          Grounded on Snowflake <span className="font-mono">MARTS</span> &amp;{" "}
          <span className="font-mono">STG_REVIEWS</span> • Press{" "}
          <kbd className="rounded border border-[#141413]/30 bg-white px-1 py-0.5 font-mono text-[10px] font-bold text-[#141413]">
            Enter
          </kbd>{" "}
          to send
        </p>
      </div>
    </div>
  );
};

