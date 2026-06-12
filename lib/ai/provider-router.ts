import { ChatRequest, ChatResponse } from "@/lib/types/chat";
import { handleOllamaRequest } from "./ollama";
import { handleDeepSeekRequest } from "./deepseek";

export const routeChatRequest = async (
  request: ChatRequest
): Promise<ChatResponse> => {
  if (request.provider === "ollama") {
    return handleOllamaRequest(request);
  } else if (request.provider === "deepseek") {
    return handleDeepSeekRequest(request);
  } else {
    throw new Error(`Unsupported provider: ${request.provider}`);
  }
};
