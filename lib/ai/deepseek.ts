import { ChatRequest, ChatResponse } from "@/lib/types/chat";

export const handleDeepSeekRequest = async (
  request: ChatRequest
): Promise<ChatResponse> => {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    throw new Error("DeepSeek API key is not configured.");
  }

  // Use OpenAI compatible endpoint for DeepSeek
  const response = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: request.model,
      messages: request.messages,
      stream: false,
    }),
  });

  if (!response.ok) {
    throw new Error("DeepSeek request failed. Check your API key or account balance.");
  }

  const data = await response.json();

  return {
    content: data.choices[0]?.message?.content || "",
    provider: "deepseek",
    model: request.model,
  };
};
