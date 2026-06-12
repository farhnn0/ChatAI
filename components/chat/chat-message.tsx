"use client";

import { Message } from "@/lib/types/chat";
import { Copy, RotateCcw, Check } from "lucide-react";
import { useState } from "react";
import { MarkdownViewer } from "./markdown-viewer";

interface ChatMessageProps {
  message: Message;
  onRegenerate?: (messageId: string) => void;
  isGenerating?: boolean;
}

export function ChatMessage({ message, onRegenerate, isGenerating }: ChatMessageProps) {
  const isUser = message.role === "user";
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy message:", err);
    }
  };

  return (
    <div className="w-full py-3 group">
      <div className={`flex flex-col w-full ${isUser ? "items-end" : "items-start"}`}>
        <div
          className={`max-w-[85%] md:max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-7 ${
            isUser
              ? "bg-zinc-800 text-zinc-100 rounded-tr-xs"
              : "bg-zinc-900 border border-zinc-800/80 text-zinc-300 rounded-tl-xs"
          }`}
        >
          {isUser ? (
            <div className="whitespace-pre-wrap break-words">{message.content}</div>
          ) : (
            <div className="whitespace-pre-wrap break-words">
              <MarkdownViewer content={message.content} />
            </div>
          )}
        </div>
        
        {/* Action buttons row below bubble */}
        <div
          className={`flex items-center gap-2.5 mt-1.5 h-5 opacity-0 group-hover:opacity-100 transition-opacity text-zinc-500 text-xs px-1 ${
            isUser ? "justify-end" : "justify-start"
          }`}
        >
          <button
            onClick={handleCopy}
            title="Copy message"
            className="flex items-center gap-1 hover:text-zinc-300 transition-colors cursor-pointer select-none"
          >
            {copied ? (
              <>
                <Check className="h-3 w-3 text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="h-3 w-3" />
                <span>Copy</span>
              </>
            )}
          </button>
          
          {!isUser && onRegenerate && (
            <>
              <span className="text-zinc-800 select-none">|</span>
              <button
                onClick={() => onRegenerate(message.id)}
                disabled={isGenerating}
                title="Regenerate response"
                className="flex items-center gap-1 hover:text-zinc-300 transition-colors cursor-pointer disabled:opacity-40 select-none"
              >
                <RotateCcw className="h-3 w-3" />
                <span>Regenerate</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
