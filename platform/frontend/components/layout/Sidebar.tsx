"use client";

import React from "react";
import {
  Plus,
  PanelLeftClose,
  SlidersHorizontal,
  ChevronDown,
  MessageSquare,
  Trash2,
  Database,
  Wifi,
  WifiOff,
  RefreshCw,
} from "lucide-react";
import { ChatThread } from "@/types/chat";

interface SidebarProps {
  threads: ChatThread[];
  activeThreadId: string | null;
  cityFilter: string;
  onCityFilterChange: (city: string) => void;
  cities: string[];
  onNewChat: () => void;
  onSelectThread: (threadId: string) => void;
  onDeleteThread: (threadId: string) => void;
  onCloseSidebar: () => void;
  status: "checking" | "connected" | "offline";
  modelName: string;
  onRefreshStatus: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  threads,
  activeThreadId,
  cityFilter,
  onCityFilterChange,
  cities,
  onNewChat,
  onSelectThread,
  onDeleteThread,
  onCloseSidebar,
  status,
  modelName,
  onRefreshStatus,
}) => {
  return (
    <div className="flex h-full flex-col justify-between bg-[#EFE9DC] p-4 text-[#141413]">
      <div className="flex flex-col space-y-5 overflow-hidden">
        {/* Brand Header */}
        <div className="flex items-center justify-between pt-0.5">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black tracking-tight text-[#141413]">
              Zomato
            </span>
            <span className="inline-flex items-center justify-center rounded-md border-[1.5px] border-[#141413] bg-[#F2C94C] px-1.5 py-0.5 text-xs font-black text-[#141413] shadow-[2px_2px_0px_#141413]">
              AI
            </span>
          </div>
          <button
            type="button"
            onClick={onCloseSidebar}
            title="Collapse sidebar"
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-transparent text-[#141413] transition-colors hover:border-[#141413]/20 hover:bg-[#E5DEC9]"
          >
            <PanelLeftClose className="h-4 w-4" />
          </button>
        </div>

        {/* Full-Width Solid Black "+ New Chat" Button */}
        <button
          type="button"
          onClick={onNewChat}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#141413] px-4 py-3 text-sm font-bold text-[#F7F3EA] shadow-[3px_3px_0px_#F2C94C] transition-all hover:bg-[#262624] active:translate-y-[1px]"
        >
          <Plus className="h-4 w-4 stroke-[2.5]" />
          <span>New Chat</span>
        </button>

        {/* City Filter Dropdown */}
        <div className="space-y-1.5">
          <label
            htmlFor="city-filter"
            className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-[#141413]"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            City Filter
          </label>
          <div className="relative">
            <select
              id="city-filter"
              value={cityFilter}
              onChange={(e) => onCityFilterChange(e.target.value)}
              className="w-full appearance-none rounded-xl border-[1.5px] border-[#141413] bg-white px-3.5 py-2.5 pr-9 text-sm font-semibold text-[#141413] shadow-[2px_2px_0px_#141413] transition-colors focus:outline-none focus:ring-2 focus:ring-[#F2C94C]"
            >
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#141413]" />
          </div>
        </div>

        {/* Recent Chats List */}
        <div className="flex min-h-0 flex-1 flex-col space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#57534E]">
              Recent Chats
            </span>
            <span className="rounded-md bg-[#141413]/10 px-1.5 py-0.5 font-mono text-[10px] font-bold text-[#141413]">
              {threads.length}
            </span>
          </div>

          <div className="flex-1 space-y-1.5 overflow-y-auto pr-1 custom-scroll">
            {threads.length === 0 ? (
              <p className="rounded-xl border border-dashed border-[#141413]/25 p-3 text-xs text-[#57534E]">
                No saved conversations yet. Submit a query below to begin.
              </p>
            ) : (
              threads.map((thread) => {
                const isActive = thread.id === activeThreadId;
                return (
                  <div
                    key={thread.id}
                    onClick={() => onSelectThread(thread.id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        onSelectThread(thread.id);
                      }
                    }}
                    className={`group flex cursor-pointer items-center justify-between gap-2 rounded-xl border-[1.5px] px-3 py-2.5 text-xs transition-all ${
                      isActive
                        ? "border-[#141413] bg-white font-bold text-[#141413] shadow-[2px_2px_0px_#141413]"
                        : "border-transparent bg-transparent font-medium text-[#141413]/85 hover:border-[#141413]/25 hover:bg-white/60"
                    }`}
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <MessageSquare
                        className={`h-3.5 w-3.5 shrink-0 ${
                          isActive ? "text-[#141413]" : "text-[#57534E]"
                        }`}
                      />
                      <span className="truncate">{thread.title}</span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteThread(thread.id);
                      }}
                      title="Delete thread"
                      className="rounded-md p-1 text-[#57534E] opacity-0 transition-opacity hover:bg-[#141413] hover:text-[#F7F3EA] group-hover:opacity-100"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Bottom Live Pipeline Status Card */}
      <div className="mt-4 rounded-xl border-[1.5px] border-[#141413] bg-white p-3 shadow-[3px_3px_0px_#141413]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-extrabold text-[#141413]">
            <Database className="h-4 w-4 shrink-0" />
            <span className="truncate">Snowflake + Groq</span>
          </div>
          <button
            type="button"
            onClick={onRefreshStatus}
            title="Refresh connection status"
            className="rounded p-1 text-[#57534E] hover:text-[#141413]"
          >
            <RefreshCw className="h-3 w-3" />
          </button>
        </div>

        <p className="mt-0.5 truncate font-mono text-[11px] font-semibold text-[#57534E]">
          {modelName}
        </p>

        <div className="mt-2.5 flex items-center justify-between rounded-lg border border-[#141413]/20 bg-[#F7F3EA] px-2.5 py-1.5 text-[11px] font-bold text-[#141413]">
          <span className="inline-flex items-center gap-1.5 truncate">
            {status === "connected" ? (
              <Wifi className="h-3 w-3 shrink-0 text-emerald-700" />
            ) : status === "checking" ? (
              <RefreshCw className="h-3 w-3 shrink-0 animate-spin text-[#F2C94C]" />
            ) : (
              <WifiOff className="h-3 w-3 shrink-0 text-rose-600" />
            )}
            <span className="truncate">
              {status === "connected"
                ? "FastAPI :8000 Live"
                : status === "checking"
                ? "Connecting..."
                : "API :8000 Offline"}
            </span>
          </span>
          <span
            className={`ml-1.5 h-2 w-2 shrink-0 rounded-full border border-[#141413] ${
              status === "connected"
                ? "bg-emerald-500"
                : status === "checking"
                ? "bg-[#F2C94C]"
                : "bg-rose-500"
            }`}
          />
        </div>
      </div>
    </div>
  );
};

