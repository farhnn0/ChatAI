import { ChatRequest, ChatResponse } from "@/lib/types/chat";

export const handleDeepSeekRequest = async (
  request: ChatRequest
): Promise<ChatResponse> => {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    throw new Error("DeepSeek API key is not configured.");
  }

  // Map custom UI model IDs to actual DeepSeek API model endpoints
  let actualModel = request.model;
  if (actualModel === "deepseek-v4-flash") {
    actualModel = "deepseek-chat";
  } else if (actualModel === "deepseek-v4-pro") {
    actualModel = "deepseek-reasoner";
  }

  // Use OpenAI compatible endpoint for DeepSeek
  const response = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: actualModel,
      messages: request.messages,
      stream: false,
      temperature: 0.7,
      max_tokens: 4096,
      top_p: 0.9,
      frequency_penalty: 0.3,
      presence_penalty: 0.2,
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
