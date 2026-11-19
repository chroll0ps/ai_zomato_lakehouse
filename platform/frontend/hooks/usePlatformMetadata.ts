"use client";

import { useState, useEffect, useCallback } from "react";
import { PlatformMetadata, PlatformHealth } from "@/types/chat";
import { getMetadata, getHealth } from "@/lib/api";

export function usePlatformMetadata() {
  const [metadata, setMetadata] = useState<PlatformMetadata>({
    cities: ["All Cities"],
    model: "qwen/qwen3.8-27b",
    total_reviews: 500,
  });

  const [health, setHealth] = useState<PlatformHealth | null>(null);
  const [status, setStatus] = useState<"checking" | "connected" | "offline">("checking");

  const checkStatus = useCallback(async () => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    try {
      const [metaRes, healthRes] = await Promise.all([
        getMetadata(controller.signal),
        getHealth(controller.signal),
      ]);
      setMetadata(metaRes);
      setHealth(healthRes);
      setStatus("connected");
    } catch {
      setStatus("offline");
    } finally {
      clearTimeout(timeoutId);
    }
  }, []);

  useEffect(() => {
    checkStatus();
    // Poll health periodically every 30 seconds
    const interval = setInterval(checkStatus, 30000);
    return () => clearInterval(interval);
  }, [checkStatus]);

  return {
    metadata,
    health,
    status,
    refresh: checkStatus,
  };
}

