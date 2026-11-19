"use client";

import React, { useState, useCallback } from "react";
import { useChatThreads } from "@/hooks/useChatThreads";
import { usePlatformMetadata } from "@/hooks/usePlatformMetadata";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopHeader } from "@/components/layout/TopHeader";
import { EmptyState } from "@/components/chat/EmptyState";
import { MessageList } from "@/components/chat/MessageList";
import { ChatComposer } from "@/components/chat/ChatComposer";
import { sendChatMessage } from "@/lib/api";
import { QueryMode } from "@/types/chat";

export default function PlatformPage() {
  const {
    threads,
    activeThreadId,
    activeMessages,
    cityFilter,
    setCityFilter,
    createNewThread,
    selectThread,
    deleteThread,
    clearActiveThread,
    addUserMessage,
    addAssistantMessage,
    addErrorMessage,
  } = useChatThreads();

  const { metadata, status, refresh } = usePlatformMetadata();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [mode, setMode] = useState<QueryMode>("auto");
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState("");

  const handleSend = useCallback(
    async (overridePrompt?: string, overrideMode?: QueryMode) => {
      const promptText = (overridePrompt ?? input).trim();
      if (!promptText || isLoading) return;

      const effectiveMode = overrideMode || mode;
      setInput("");
      setIsLoading(true);

      setLoadingStage(
        effectiveMode === "sql"
          ? "Generating Snowflake SQL & querying MARTS via Groq..."
          : effectiveMode === "rag"
          ? "Searching local review embeddings & querying Groq..."
          : "Analyzing query intent across Snowflake MARTS & local reviews..."
      );

      // 1. Add user message to thread
      const { threadId } = addUserMessage(promptText);

      // 2. Call live FastAPI bridge
      try {
        const response = await sendChatMessage({
          question: promptText,
          mode: effectiveMode,
          city: cityFilter !== "All Cities" ? cityFilter : undefined,
        });

        addAssistantMessage(threadId, response);
      } catch (err: unknown) {
        const errorMsg =
          err instanceof Error
            ? err.message
            : "An unexpected error occurred while communicating with the API.";
        addErrorMessage(threadId, errorMsg);
      } finally {
        setIsLoading(false);
      }
    },
    [input, isLoading, mode, cityFilter, addUserMessage, addAssistantMessage, addErrorMessage]
  );

  return (
    <div className="relative flex h-screen w-full overflow-hidden bg-[#F7F3EA] text-[#141413] antialiased">
      {/* Desktop Collapsible Left Sidebar */}
      {sidebarOpen && (
        <aside className="hidden h-full w-[280px] shrink-0 border-r-[1.5px] border-[#141413] md:block">
          <Sidebar
            threads={threads}
            activeThreadId={activeThreadId}
            cityFilter={cityFilter}
            onCityFilterChange={setCityFilter}
            cities={metadata.cities}
            onNewChat={createNewThread}
            onSelectThread={selectThread}
            onDeleteThread={deleteThread}
            onCloseSidebar={() => setSidebarOpen(false)}
            status={status}
            modelName={metadata.model}
            onRefreshStatus={refresh}
          />
        </aside>
      )}

      {/* Mobile Slide-Over Sidebar Drawer */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-[#141413]/40 backdrop-blur-[1px]"
            onClick={() => setMobileDrawerOpen(false)}
          />
          <aside className="relative z-10 h-full w-[280px] border-r-[1.5px] border-[#141413] shadow-2xl">
            <Sidebar
              threads={threads}
              activeThreadId={activeThreadId}
              cityFilter={cityFilter}
              onCityFilterChange={(city) => {
                setCityFilter(city);
                setMobileDrawerOpen(false);
              }}
              cities={metadata.cities}
              onNewChat={() => {
                createNewThread();
                setMobileDrawerOpen(false);
              }}
              onSelectThread={(id) => {
                selectThread(id);
                setMobileDrawerOpen(false);
              }}
              onDeleteThread={deleteThread}
              onCloseSidebar={() => setMobileDrawerOpen(false)}
              status={status}
              modelName={metadata.model}
              onRefreshStatus={refresh}
            />
          </aside>
        </div>
      )}

      {/* Main Flagship ChatGPT Viewport */}
      <main className="relative flex min-w-0 flex-1 flex-col overflow-hidden bg-[#F7F3EA]">
        <TopHeader
          sidebarOpen={sidebarOpen}
          onOpenSidebar={() => setSidebarOpen(true)}
          onOpenMobileDrawer={() => setMobileDrawerOpen(true)}
          modelName={metadata.model}
          cityFilter={cityFilter}
          hasMessages={activeMessages.length > 0}
          onClearThread={clearActiveThread}
        />

        {/* Scrollable Chat Canvas */}
        <div className="custom-scroll flex-1 overflow-y-auto px-4 pb-44 pt-6 sm:px-8">
          {activeMessages.length === 0 ? (
            <EmptyState
              onSelectPrompt={(prompt, selectedMode) => {
                setMode(selectedMode);
                handleSend(prompt, selectedMode);
              }}
            />
          ) : (
            <MessageList
              messages={activeMessages}
              isLoading={isLoading}
              loadingStage={loadingStage}
            />
          )}
        </div>

        {/* Floating Bottom Flagship Composer */}
        <ChatComposer
          input={input}
          onInputChange={setInput}
          onSend={() => handleSend()}
          isLoading={isLoading}
          mode={mode}
          onModeChange={setMode}
          cityFilter={cityFilter}
        />
      </main>
    </div>
  );
}

