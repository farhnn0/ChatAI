"use client";

import { useState, useRef } from "react";
import { ModelSelector } from "./model-selector";
import { ModelOption } from "@/lib/types/chat";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SendHorizonal } from "lucide-react";

interface ChatComposerProps {
  onSendMessage: (content: string) => void;
  selectedModel: ModelOption;
  onModelChange: (model: ModelOption) => void;
  isGenerating: boolean;
  onStopGeneration: () => void;
}

export function ChatComposer({
  onSendMessage,
  selectedModel,
  onModelChange,
  isGenerating,
  onStopGeneration
}: ChatComposerProps) {
  const [content, setContent] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (!content.trim() || isGenerating) return;
    onSendMessage(content.trim());
    setContent("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(e.target.scrollHeight, 200)}px`;
    }
  };

  return (
    <footer className="shrink-0 border-t border-zinc-800/80 bg-[#09090B] px-4 py-4">
      <div className="mx-auto w-full max-w-4xl">
        <div className="relative flex flex-col w-full bg-zinc-900 border border-zinc-800 rounded-2xl shadow-sm focus-within:border-zinc-700 focus-within:ring-1 focus-within:ring-zinc-700 transition-all">
          <Textarea
            ref={textareaRef}
            value={content}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder="Message your AI..."
            className="min-h-[56px] w-full resize-none bg-transparent border-0 focus-visible:ring-0 text-zinc-100 font-medium text-sm pt-4 pb-12 px-4 shadow-none"
            rows={1}
          />
          
          <div className="absolute bottom-2 right-2 flex items-center justify-end gap-2">
            <ModelSelector
              selectedModel={selectedModel}
              onModelChange={onModelChange}
              disabled={isGenerating}
            />
            
            {isGenerating ? (
              <Button
                onClick={onStopGeneration}
                size="icon"
                className="h-8 w-8 rounded-xl bg-zinc-100 text-zinc-900 hover:bg-zinc-200 transition-colors"
              >
                <span className="h-2.5 w-2.5 bg-zinc-900 rounded-xs" />
              </Button>
            ) : (
              <Button
                onClick={handleSend}
                disabled={!content.trim()}
                size="icon"
                className="h-8 w-8 rounded-xl bg-zinc-100 text-zinc-900 hover:bg-zinc-200 disabled:opacity-50 disabled:bg-zinc-800 disabled:text-zinc-500 transition-colors"
              >
                <SendHorizonal className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        <div className="text-center mt-2">
          <span className="text-[11px] text-zinc-500">
            Enter to send, Shift + Enter for new line.
          </span>
        </div>
      </div>
    </footer>
  );
}
