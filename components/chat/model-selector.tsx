"use client";

import { ModelOption } from "@/lib/types/chat";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { ChevronDown } from "lucide-react";

interface ModelSelectorProps {
  selectedModel: ModelOption;
  onModelChange: (model: ModelOption) => void;
  models: ModelOption[];
  disabled?: boolean;
}

export function ModelSelector({ selectedModel, onModelChange, models, disabled }: ModelSelectorProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger disabled={disabled} className="flex items-center gap-2 rounded-xl bg-zinc-900/50 hover:bg-zinc-800 px-3 py-1.5 text-sm text-zinc-300 transition-colors border border-zinc-800/50 cursor-pointer disabled:cursor-not-allowed">
        <span>{selectedModel.label}</span>
        <ChevronDown className="h-3 w-3 text-zinc-500" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="w-[280px] bg-zinc-900 border-zinc-800 text-zinc-100 p-2 rounded-xl shadow-xl max-h-[300px] overflow-y-auto"
      >
        {models.map((model) => (
          <DropdownMenuItem
            key={model.model}
            onClick={() => onModelChange(model)}
            className={`flex flex-col items-start gap-1 p-3 rounded-lg cursor-pointer ${
              selectedModel.model === model.model
                ? "bg-zinc-850"
                : "hover:bg-zinc-800/50 focus:bg-zinc-800/50"
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <span className="font-medium text-sm">{model.label}</span>
              <Badge variant="secondary" className="bg-zinc-800 text-xs text-zinc-400 border-none font-normal">
                {model.badge}
              </Badge>
            </div>
            <span className="text-xs text-zinc-500">{model.description}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
