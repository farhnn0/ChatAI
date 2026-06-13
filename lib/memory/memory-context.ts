import { getMemories } from "@/lib/storage/chat-storage";

export const buildSystemPrompt = (): string => {
  const memories = getMemories();
  const memoryLines = memories.length > 0
    ? memories.map((m) => `* ${m.content}`).join("\n")
    : "* No specific user facts saved yet.";

  return `You are a helpful AI assistant for the user.

User memory:
${memoryLines}

Project context:
The user is building a local/cloud AI chat app using Next.js, shadcn/ui, Ollama, and DeepSeek.

Design preference:
Use dark-only UI, no emoji, no gradient, clean developer-focused style.`;
};
