"use client";

import { useEffect, useRef } from "react";
import { Message } from "@/lib/types/chat";
import { ChatMessage } from "./chat-message";
import { Loader2 } from "lucide-react";

interface ChatMessageListProps {
  messages: Message[];
  isGenerating: boolean;
  onRegenerate?: (messageId: string) => void;
}

export function ChatMessageList({ messages, isGenerating, onRegenerate }: ChatMessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const prevLengthRef = useRef(messages.length);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const currentLength = messages.length;
    const hasNewMessage = currentLength > prevLengthRef.current;
    prevLengthRef.current = currentLength;

    // Check if the user is close to the bottom (within a 150px threshold)
    const isAtBottom = container.scrollHeight - container.scrollTop - container.clientHeight <= 150;

    // Scroll to bottom if:
    // 1. A new message has been added (e.g., user just submitted a message)
    // 2. The AI is generating and the user is already at the bottom (pin to bottom during streaming)
    if (hasNewMessage || (isGenerating && isAtBottom)) {
      container.scrollTop = container.scrollHeight;
    }
  }, [messages, isGenerating]);

  // Show "Thinking..." indicator only if AI is generating AND the assistant's message is empty/not started
  const lastMessage = messages[messages.length - 1];
  const showThinking = isGenerating && (
    !lastMessage || 
    lastMessage.role !== "assistant" || 
    !lastMessage.content.trim()
  );

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
        <h2 className="text-xl font-semibold text-zinc-200 mb-2">What are you working on?</h2>
        <p className="text-sm text-zinc-500 max-w-sm">
          Choose a model and start a conversation. Ask anything about code, debugging, or your project.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-0 flex-1 overflow-y-auto scrollbar-thin" ref={scrollRef}>
      <div className="mx-auto w-full max-w-4xl px-4 py-8 pb-40 flex flex-col gap-1">
        {messages.map((message) => {
          // Hide rendering of empty assistant message (which is handled by Thinking...)
          if (message.role === "assistant" && !message.content.trim()) {
            return null;
          }
          return (
            <ChatMessage 
              key={message.id} 
              message={message} 
              onRegenerate={onRegenerate}
              isGenerating={isGenerating}
            />
          );
        })}
        
        {showThinking && (
          <div className="w-full py-4 flex justify-start">
            <div className="flex w-full max-w-[90%] md:max-w-3xl lg:max-w-4xl items-start gap-4">
              <div className="shrink-0 pt-1 hidden sm:flex opacity-60">
                <div className="h-8 w-8 rounded-full bg-[#131316] border border-zinc-800/80 flex items-center justify-center text-zinc-300 shadow-sm">
                  <Loader2 className="h-4 w-4 animate-spin text-zinc-500" />
                </div>
              </div>
              <div className="flex flex-col min-w-0 w-full items-start">
                <div className="flex items-center gap-2 mb-1.5 ml-1 select-none opacity-60">
                  <span className="text-xs font-medium text-zinc-400">AI Assistant</span>
                </div>
                <div className="rounded-[20px] rounded-tl-sm bg-[#131316] border border-zinc-800/60 px-5 py-4 text-sm flex items-center gap-2.5 text-zinc-400 shadow-sm">
                  <Loader2 className="h-4 w-4 animate-spin text-zinc-500" />
                  <span className="animate-pulse">Thinking...</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
