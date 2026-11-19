"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { ChatThread, ChatMessage, ChatResponse, QueryMode } from "@/types/chat";
import { getCurrentTime } from "@/lib/utils";

const STORAGE_KEY = "zomato_ai_flagship_threads_v2";

export function useChatThreads() {
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [cityFilter, setCityFilter] = useState<string>("All Cities");
  const [isHydrated, setIsHydrated] = useState(false);

  // SSR-safe load from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setThreads(parsed);
        }
      }
    } catch {
      // Ignore storage errors in restricted environments
    } finally {
      setIsHydrated(true);
    }
  }, []);

  // Persist to localStorage when threads change
  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(threads));
    } catch {
      // Ignore storage errors
    }
  }, [threads, isHydrated]);

  const activeThread = useMemo(() => {
    if (!activeThreadId) return null;
    return threads.find((t) => t.id === activeThreadId) || null;
  }, [threads, activeThreadId]);

  const activeMessages = useMemo(() => {
    return activeThread ? activeThread.messages : [];
  }, [activeThread]);

  const createNewThread = useCallback(() => {
    setActiveThreadId(null);
  }, []);

  const selectThread = useCallback((threadId: string) => {
    setActiveThreadId(threadId);
    const target = threads.find((t) => t.id === threadId);
    if (target?.cityFilter) {
      setCityFilter(target.cityFilter);
    }
  }, [threads]);

  const deleteThread = useCallback((threadId: string) => {
    setThreads((prev) => prev.filter((t) => t.id !== threadId));
    setActiveThreadId((curr) => (curr === threadId ? null : curr));
  }, []);

  const clearActiveThread = useCallback(() => {
    if (!activeThreadId) return;
    setThreads((prev) =>
      prev.map((t) =>
        t.id === activeThreadId
          ? { ...t, messages: [], updatedAt: "Just now" }
          : t
      )
    );
  }, [activeThreadId]);

  const addUserMessage = useCallback((promptText: string): { threadId: string; userMsg: ChatMessage } => {
    const userMsg: ChatMessage = {
      id: `u-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      role: "user",
      content: promptText,
      timestamp: getCurrentTime(),
    };

    let targetThreadId = activeThreadId;

    if (!targetThreadId) {
      targetThreadId = `thread-${Date.now()}`;
      const shortTitle =
        promptText.length > 36 ? `${promptText.slice(0, 36)}…` : promptText;
      const newThread: ChatThread = {
        id: targetThreadId,
        title: shortTitle,
        updatedAt: "Just now",
        cityFilter,
        messages: [userMsg],
      };
      setThreads((prev) => [newThread, ...prev]);
      setActiveThreadId(targetThreadId);
    } else {
      setThreads((prev) =>
        prev.map((t) =>
          t.id === targetThreadId
            ? {
                ...t,
                updatedAt: "Just now",
                messages: [...t.messages, userMsg],
              }
            : t
        )
      );
    }

    return { threadId: targetThreadId, userMsg };
  }, [activeThreadId, cityFilter]);

  const addAssistantMessage = useCallback(
    (targetThreadId: string, response: ChatResponse) => {
      const assistantMsg: ChatMessage = {
        id: `a-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        role: "assistant",
        content: response.answer,
        timestamp: getCurrentTime(),
        modeUsed: response.mode_used,
        sqlResult: response.sql_result || null,
        sources: response.sources || [],
        latencyMs: response.latency_ms,
      };

      setThreads((prev) =>
        prev.map((t) =>
          t.id === targetThreadId
            ? {
                ...t,
                updatedAt: "Just now",
                messages: [...t.messages, assistantMsg],
              }
            : t
        )
      );
    },
    []
  );

  const addErrorMessage = useCallback(
    (targetThreadId: string, errorMessage: string) => {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        role: "assistant",
        content: errorMessage,
        timestamp: getCurrentTime(),
        error: errorMessage,
      };

      setThreads((prev) =>
        prev.map((t) =>
          t.id === targetThreadId
            ? {
                ...t,
                updatedAt: "Just now",
                messages: [...t.messages, errorMsg],
              }
            : t
        )
      );
    },
    []
  );

  return {
    threads,
    activeThreadId,
    activeThread,
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
    isHydrated,
  };
}

