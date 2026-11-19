"use client";

import React, { useRef, useEffect } from "react";
import { ChatMessage } from "@/types/chat";
import { UserMessage } from "./UserMessage";
import { AssistantCard } from "./AssistantCard";

interface MessageListProps {
  messages: ChatMessage[];
  isLoading: boolean;
  loadingStage: string;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  isLoading,
  loadingStage,
}) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, isLoading]);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {messages.map((msg, idx) => {
        const isLatest = idx === messages.length - 1;
        if (msg.role === "user") {
          return <UserMessage key={msg.id} content={msg.content} />;
        }
        return (
          <AssistantCard
            key={msg.id}
            message={msg}
            isLatest={isLatest}
          />
        );
      })}

      {/* Thinking Indicator */}
      {isLoading && (
        <div className="flex justify-start">
          <div className="flagship-card inline-flex items-center gap-3 rounded-2xl bg-white px-5 py-3.5 text-xs font-bold text-[#141413]">
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 animate-bounce rounded-full border border-[#141413] bg-[#F2C94C] [animation-delay:-0.25s]" />
              <span className="h-2 w-2 animate-bounce rounded-full border border-[#141413] bg-[#F2C94C] [animation-delay:-0.12s]" />
              <span className="h-2 w-2 animate-bounce rounded-full border border-[#141413] bg-[#F2C94C]" />
            </span>
            <span>{loadingStage}</span>
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
};

