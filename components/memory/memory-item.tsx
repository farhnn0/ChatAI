"use client";

import { UserMemory } from "@/lib/types/memory";
import { Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface MemoryItemProps {
  memory: UserMemory;
  onDelete: (id: string) => void;
}

export function MemoryItem({ memory, onDelete }: MemoryItemProps) {
  const getCategoryColor = (cat: UserMemory["category"]) => {
    switch (cat) {
      case "preference":
        return "bg-teal-950/60 text-teal-400 border-teal-900/60";
      case "project":
        return "bg-blue-950/60 text-blue-400 border-blue-900/60";
      case "technical":
        return "bg-purple-950/60 text-purple-400 border-purple-900/60";
      case "profile":
        return "bg-amber-950/60 text-amber-400 border-amber-900/60";
      default:
        return "bg-zinc-800/80 text-zinc-400 border-zinc-700/60";
    }
  };

  return (
    <div className="flex items-start justify-between gap-4 p-3 rounded-lg border border-zinc-800 bg-zinc-900/40 hover:bg-zinc-900/70 transition-colors">
      <div className="flex flex-col gap-1.5 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className={`text-[10px] px-1.5 py-0 capitalize ${getCategoryColor(memory.category)}`}>
            {memory.category}
          </Badge>
          <span className="text-[10px] text-zinc-500">
            {new Date(memory.createdAt).toLocaleDateString()}
          </span>
        </div>
        <p className="text-xs text-zinc-300 break-words leading-relaxed">
          {memory.content}
        </p>
      </div>
      
      <button
        onClick={() => onDelete(memory.id)}
        className="p-1 text-zinc-550 hover:text-red-400 rounded-md hover:bg-zinc-800/50 transition-colors shrink-0 cursor-pointer"
        title="Delete memory"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
