import { ModelOption } from "@/lib/types/chat";

export const modelOptions: ModelOption[] = [
  {
    provider: "ollama",
    model: "qwen2.5-coder:7b",
    label: "Local Qwen Coder",
    badge: "Free",
    description: "Local model for daily coding and experiments.",
  },
  {
    provider: "deepseek",
    model: "deepseek-v4-flash",
    label: "DeepSeek Flash",
    badge: "Cheap Cloud",
    description: "Low-cost cloud model for fast responses.",
  },
  {
    provider: "deepseek",
    model: "deepseek-v4-pro",
    label: "DeepSeek Pro",
    badge: "Heavy Task",
    description: "Stronger cloud model for complex coding tasks.",
  },
];

export const defaultModel = modelOptions[0];
