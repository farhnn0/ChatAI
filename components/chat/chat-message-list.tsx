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
      <div className="mx-auto w-full max-w-4xl px-4 py-8 pb-32 flex flex-col">
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
          <div className="w-full py-2.5">
            <div className="flex w-full justify-start">
              <div className="max-w-[75%] md:max-w-[70%] rounded-2xl rounded-tl-xs bg-zinc-900 border border-zinc-800/80 px-4 py-3 text-sm flex items-center gap-2 text-zinc-500">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Thinking...</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
