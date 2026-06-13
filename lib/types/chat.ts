export type Role = "system" | "user" | "assistant";

export type ChatMessage = {
  id: string;
  role: Role;
  content: string;
  model?: string;
  provider?: string;
  createdAt: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    cost?: number;
  };
};

// Alias to maintain compatibility with existing message list and UI code
export type Message = ChatMessage;

export type ChatSession = {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
  model?: string;
  provider?: string;
  isPinned?: boolean;
};

export type ModelOption = {
  provider: "ollama" | "deepseek" | "groq";
  model: string;
  label: string;
  badge: string;
  description: string;
};

export type ChatRequest = {
  provider: "ollama" | "deepseek" | "groq";
  model: string;
  messages: {
    role: Role;
    content: string;
  }[];
};

export type ChatResponse = {
  content: string;
  provider: "ollama" | "deepseek" | "groq";
  model: string;
};

export type ChatErrorResponse = {
  error: string;
  provider?: "ollama" | "deepseek" | "groq";
};
