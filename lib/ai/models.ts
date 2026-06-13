import { ModelOption } from "@/lib/types/chat";

export const modelOptions: ModelOption[] = [
  {
    provider: "ollama",
    model: "llama3.1:8b",
    label: "Local Llama 3.1",
    badge: "Free Local",
    description: "General purpose local model for conversation and general tasks.",
  },
  {
    provider: "groq",
    model: "llama-3.3-70b-versatile",
    label: "Groq Llama 3.3 70B",
    badge: "Free Cloud",
    description: "Flagship high-speed cloud model for complex coding and logic.",
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
