"use client";

import { UserMemory } from "@/lib/types/memory";
import { MemoryItem } from "./memory-item";
import { Brain } from "lucide-react";

interface MemoryListProps {
  memories: UserMemory[];
  onDeleteMemory: (id: string) => void;
}

export function MemoryList({ memories, onDeleteMemory }: MemoryListProps) {
  if (memories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <div className="h-10 w-10 rounded-full bg-zinc-900 border border-zinc-850 flex items-center justify-center text-zinc-500 mb-3">
          <Brain className="h-5 w-5" />
        </div>
        <p className="text-xs text-zinc-400 font-medium mb-1">No memory saved yet</p>
        <p className="text-[11px] text-zinc-500 max-w-[240px] leading-relaxed">
          Type "remember that..." or "ingat bahwa..." in chat to manually save facts about yourself or your project.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 max-h-[350px] overflow-y-auto pr-1 scrollbar-thin">
      {memories.map((memory) => (
        <MemoryItem
          key={memory.id}
          memory={memory}
          onDelete={onDeleteMemory}
        />
      ))}
    </div>
  );
}
