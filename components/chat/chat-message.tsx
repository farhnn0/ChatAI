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
    <div className={`w-full py-4 group flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`flex flex-col max-w-[90%] md:max-w-3xl lg:max-w-4xl w-full`}>
        <div className={`flex flex-col min-w-0 w-full ${isUser ? "items-end" : "items-start"}`}>
          
          {/* Metadata (Model name, time, etc.) */}
          {!isUser && (
            <div className="flex items-center gap-2 mb-1.5 ml-1 select-none">
              <span className="text-xs font-semibold text-zinc-300 capitalize">
                {message.model || message.provider || "AI Assistant"}
              </span>
              <span className="text-[10px] text-zinc-600">
                {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          )}
          {isUser && (
            <div className="flex items-center gap-2 mb-1.5 mr-1 select-none">
              <span className="text-[10px] text-zinc-600">
                {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
              <span className="text-xs font-semibold text-zinc-300">You</span>
            </div>
          )}

          {/* Bubble / Content */}
          <div
            className={`${
              isUser
                ? "bg-zinc-700/80 border border-zinc-600/40 text-white rounded-[20px] rounded-tr-sm px-5 py-3 text-[16.5px] leading-7 max-w-[85%] w-fit break-words"
                : "w-full text-white font-medium pt-1"
            }`}
          >
            {isUser ? (
              <div className="whitespace-pre-wrap break-words leading-7 text-[16.5px] text-white font-medium">{message.content}</div>
            ) : (
              <div className="w-full min-w-0 text-white font-medium">
                <MarkdownViewer content={message.content} />
              </div>
            )}
          </div>
            
          {/* Token Usage Display */}
          {!isUser && message.usage && (
            <div className="text-[11px] text-zinc-500 mt-1.5 select-none font-normal pl-1">
              {message.usage.totalTokens.toLocaleString()} tokens &middot; Cost: ${message.usage.cost?.toFixed(5)} (~Rp {message.usage.cost ? Math.round(message.usage.cost * 15500).toLocaleString("id-ID") : 0})
            </div>
          )}
            
          {/* Action buttons row below bubble */}
          <div
            className={`flex items-center gap-2.5 mt-2 h-5 opacity-0 group-hover:opacity-100 transition-opacity text-zinc-500 text-xs px-2 ${
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
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
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
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Regenerate</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
