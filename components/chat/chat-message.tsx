"use client";

import { Message } from "@/lib/types/chat";
import { Copy, RotateCcw, Check, Bot, User } from "lucide-react";
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
        <div className={`flex items-start gap-4 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
          
          {/* Avatar Area */}
          <div className="shrink-0 pt-1 hidden sm:flex">
            {isUser ? (
              <div className="h-8 w-8 rounded-full bg-zinc-800/80 border border-zinc-700/50 flex items-center justify-center text-zinc-400">
                <User className="h-4 w-4" />
              </div>
            ) : (
              <div className="h-8 w-8 rounded-full bg-[#131316] border border-zinc-800/80 flex items-center justify-center text-zinc-300 shadow-sm">
                <Bot className="h-4 w-4" />
              </div>
            )}
          </div>

          {/* Message Content Container */}
          <div className={`flex flex-col min-w-0 w-full ${isUser ? "items-end" : "items-start"}`}>
            
            {/* Metadata (Model name, time, etc.) */}
            {!isUser && (
              <div className="flex items-center gap-2 mb-1.5 ml-1 select-none">
                <span className="text-xs font-medium text-zinc-400 capitalize">
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
                <span className="text-xs font-medium text-zinc-400">You</span>
              </div>
            )}

            {/* Bubble */}
            <div
              className={`w-full rounded-[20px] px-5 py-4 ${
                isUser
                  ? "bg-zinc-800/50 border border-zinc-700/30 text-zinc-100 rounded-tr-sm"
                  : "bg-[#131316] border border-zinc-800/60 text-zinc-300 rounded-tl-sm shadow-sm"
              }`}
            >
              {isUser ? (
                <div className="whitespace-pre-wrap break-words leading-7 text-[15px]">{message.content}</div>
              ) : (
                <div className="w-full min-w-0">
                  <MarkdownViewer content={message.content} />
                </div>
              )}
            </div>
            
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
    </div>
  );
}
