"use client";

import { Message } from "@/lib/types/chat";

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <div className="w-full py-2.5 px-4">
      <div className={`flex w-full max-w-4xl mx-auto ${isUser ? "justify-end" : "justify-start"}`}>
        <div
          className={`max-w-[75%] md:max-w-[70%] rounded-2xl px-4 py-3 text-sm leading-6 whitespace-pre-wrap ${
            isUser
              ? "bg-zinc-800 text-zinc-100 rounded-tr-xs"
              : "bg-zinc-900 border border-zinc-800/80 text-zinc-300 rounded-tl-xs"
          }`}
        >
          {message.content}
        </div>
      </div>
    </div>
  );
}
