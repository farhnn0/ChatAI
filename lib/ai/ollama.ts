import { ChatRequest, ChatResponse } from "@/lib/types/chat";

export const handleOllamaRequest = async (
  request: ChatRequest
): Promise<ChatResponse> => {
  const baseUrl = process.env.OLLAMA_BASE_URL || "http://127.0.0.1:11434";
  
  const response = await fetch(`${baseUrl}/api/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: request.model,
      messages: request.messages,
      stream: false,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to connect to local Ollama server`);
  }

  const data = await response.json();

  return {
    content: data.message?.content || "",
    provider: "ollama",
    model: request.model,
  };
};
