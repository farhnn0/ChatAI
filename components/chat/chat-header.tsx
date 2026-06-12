"use client";

import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Trash2 } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ChatHeaderProps {
  title: string;
}

export function ChatHeader({ title }: ChatHeaderProps) {
  return (
    <header className="h-14 flex items-center justify-between px-4 border-b border-zinc-850 bg-zinc-950/50 backdrop-blur-sm sticky top-0 z-10">
      <div className="flex items-center gap-3">
        <SidebarTrigger className="h-8 w-8 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50 md:hidden" />
        
        <h1 className="text-sm font-medium text-zinc-200 truncate max-w-[200px] md:max-w-md">
          {title || "New chat"}
        </h1>
      </div>
    </header>
  );
}
