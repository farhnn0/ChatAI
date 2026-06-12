export type Role = "system" | "user" | "assistant";

export type Message = {
  id: string;
  role: Role;
  content: string;
  model?: string;
  provider?: string;
  createdAt: number;
};

export type ChatSession = {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
  model: string;
  provider: string;
  isPinned?: boolean;
};

export type ModelOption = {
  provider: "ollama" | "deepseek";
  model: string;
  label: string;
  badge: string;
  description: string;
};

export type ChatRequest = {
  provider: "ollama" | "deepseek";
  model: string;
  messages: {
    role: Role;
    content: string;
  }[];
};

export type ChatResponse = {
  content: string;
  provider: "ollama" | "deepseek";
  model: string;
};

export type ChatErrorResponse = {
  error: string;
  provider?: "ollama" | "deepseek";
};
