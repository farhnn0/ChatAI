"use client";

import { useEffect, useRef } from "react";
import { Message } from "@/lib/types/chat";
import { ChatMessage } from "./chat-message";
import { Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ChatMessageListProps {
  messages: Message[];
  isGenerating: boolean;
}

export function ChatMessageList({ messages, isGenerating }: ChatMessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isGenerating]);

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
    <ScrollArea className="flex-1" ref={scrollRef}>
      <div className="flex flex-col pb-4">
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
        {isGenerating && (
          <div className="w-full py-2.5 px-4">
            <div className="flex w-full max-w-4xl mx-auto justify-start">
              <div className="max-w-[75%] md:max-w-[70%] rounded-2xl rounded-tl-xs bg-zinc-900 border border-zinc-800/80 px-4 py-3 text-sm flex items-center gap-2 text-zinc-500">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Thinking...</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </ScrollArea>
  );
}
