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
  models: ModelOption[];
  isGenerating: boolean;
}

export function ChatComposer({
  onSendMessage,
  selectedModel,
  onModelChange,
  models,
  isGenerating
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
    <div className="w-full max-w-4xl mx-auto px-4 pb-6 pt-2">
      <div className="relative flex flex-col w-full bg-zinc-900 border border-zinc-800 rounded-2xl shadow-sm focus-within:border-zinc-700 focus-within:ring-1 focus-within:ring-zinc-700 transition-all">
        <Textarea
          ref={textareaRef}
          value={content}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder="Message your AI..."
          className="min-h-[56px] w-full resize-none bg-transparent border-0 focus-visible:ring-0 text-zinc-100 text-sm pt-4 pb-12 px-4 shadow-none"
          rows={1}
        />
        
        <div className="absolute bottom-2 right-2 flex items-center justify-end gap-2">
          <ModelSelector
            selectedModel={selectedModel}
            onModelChange={onModelChange}
            models={models}
            disabled={isGenerating}
          />
          
          <Button
            onClick={handleSend}
            disabled={!content.trim() || isGenerating}
            size="icon"
            className="h-8 w-8 rounded-xl bg-zinc-100 text-zinc-900 hover:bg-zinc-200 disabled:opacity-50 disabled:bg-zinc-800 disabled:text-zinc-500"
          >
            <SendHorizonal className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="text-center mt-2">
        <span className="text-[11px] text-zinc-500">
          Enter to send, Shift + Enter for new line.
        </span>
      </div>
    </div>
  );
}
