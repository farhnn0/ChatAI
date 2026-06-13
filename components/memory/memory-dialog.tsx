"use client";

import { useState, useEffect } from "react";
import { UserMemory } from "@/lib/types/memory";
import { getMemories, deleteMemory, clearMemories } from "@/lib/storage/chat-storage";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { MemoryList } from "./memory-list";
import { Brain, Trash2 } from "lucide-react";

interface MemoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MemoryDialog({ open, onOpenChange }: MemoryDialogProps) {
  const [memories, setMemories] = useState<UserMemory[]>([]);

  useEffect(() => {
    if (open) {
      setMemories(getMemories());
    }
  }, [open]);

  const handleDelete = (id: string) => {
    deleteMemory(id);
    setMemories(getMemories());
  };

  const handleClearAll = () => {
    if (confirm("Are you sure you want to clear all saved memories?")) {
      clearMemories();
      setMemories([]);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-950 border-zinc-850 text-zinc-100 max-w-md rounded-xl shadow-xl">
        <DialogHeader className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300">
              <Brain className="h-4 w-4" />
            </div>
            <DialogTitle className="text-sm font-semibold tracking-tight text-zinc-100">
              Memory Management
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-zinc-500">
            View or delete persistent facts that the AI references to personalize your conversation context.
          </DialogDescription>
        </DialogHeader>

        <div className="py-2">
          <MemoryList memories={memories} onDeleteMemory={handleDelete} />
        </div>

        {memories.length > 0 && (
          <div className="flex justify-end pt-2 border-t border-zinc-900">
            <button
              onClick={handleClearAll}
              className="flex items-center gap-1.5 text-xs text-zinc-450 hover:text-red-400 px-3 py-1.5 rounded-lg hover:bg-zinc-900/60 transition-all cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Clear all memory</span>
            </button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
