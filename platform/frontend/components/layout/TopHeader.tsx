"use client";

import React from "react";
import { PanelLeft, RotateCcw, MapPin } from "lucide-react";

interface TopHeaderProps {
  sidebarOpen: boolean;
  onOpenSidebar: () => void;
  onOpenMobileDrawer: () => void;
  modelName: string;
  cityFilter: string;
  hasMessages: boolean;
  onClearThread: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  sidebarOpen,
  onOpenSidebar,
  onOpenMobileDrawer,
  modelName,
  cityFilter,
  hasMessages,
  onClearThread,
}) => {
  return (
    <header className="z-20 flex shrink-0 items-center justify-between border-b-[1.5px] border-[#141413]/15 bg-[#F7F3EA]/90 px-4 py-3 backdrop-blur-sm sm:px-6">
      <div className="flex items-center gap-2.5">
        {/* Mobile Drawer Trigger */}
        <button
          type="button"
          onClick={onOpenMobileDrawer}
          aria-label="Open menu"
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#141413] text-[#F7F3EA] transition-colors hover:bg-[#262624] md:hidden"
        >
          <PanelLeft className="h-4 w-4" />
        </button>

        {/* Desktop Reopen Sidebar Button */}
        {!sidebarOpen && (
          <button
            type="button"
            onClick={onOpenSidebar}
            title="Open sidebar"
            className="hidden h-9 w-9 items-center justify-center rounded-xl bg-[#141413] text-[#F7F3EA] transition-colors hover:bg-[#262624] md:flex"
          >
            <PanelLeft className="h-4 w-4" />
          </button>
        )}

        {/* Model Pill Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border-[1.5px] border-[#141413] bg-white px-3.5 py-1.5 text-xs font-bold text-[#141413] shadow-[2px_2px_0px_#141413]">
          <span className="h-2.5 w-2.5 rounded-full border border-[#141413] bg-[#F2C94C]" />
          <span className="font-mono">{modelName}</span>
        </div>

        {/* City Scope Pill */}
        {cityFilter !== "All Cities" && (
          <span className="hidden items-center gap-1 rounded-full border-[1.5px] border-[#141413] bg-[#F2C94C] px-2.5 py-1 text-[11px] font-black text-[#141413] sm:inline-flex">
            <MapPin className="h-3 w-3" />
            {cityFilter}
          </span>
        )}
      </div>

      {/* Right Header Action: Clear Thread */}
      <button
        type="button"
        onClick={onClearThread}
        disabled={!hasMessages}
        className="inline-flex items-center gap-1.5 rounded-xl bg-[#141413] px-4 py-2 text-xs font-bold text-[#F7F3EA] transition-all hover:bg-[#262624] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <RotateCcw className="h-3.5 w-3.5" />
        <span>Clear Thread</span>
      </button>
    </header>
  );
};

