import { ChatRequest, ChatResponse } from "@/lib/types/chat";
import { handleOllamaRequest, handleOllamaStream } from "./ollama";
import { handleDeepSeekRequest, handleDeepSeekStream } from "./deepseek";
import { SYSTEM_PROMPT } from "./system-prompt";

export const routeChatRequest = async (
  request: ChatRequest
): Promise<ChatResponse> => {
  const systemMessage = {
    role: "system" as const,
    content: SYSTEM_PROMPT,
  };

  const modifiedRequest: ChatRequest = {
    ...request,
    messages: [systemMessage, ...request.messages],
  };

  if (modifiedRequest.provider === "ollama") {
    return handleOllamaRequest(modifiedRequest);
  } else if (modifiedRequest.provider === "deepseek") {
    return handleDeepSeekRequest(modifiedRequest);
  } else {
    throw new Error(`Unsupported provider: ${modifiedRequest.provider}`);
  }
};

export const routeChatRequestStream = async (
  request: ChatRequest
): Promise<ReadableStream> => {
  const systemMessage = {
    role: "system" as const,
    content: SYSTEM_PROMPT,
  };

  const modifiedRequest: ChatRequest = {
    ...request,
    messages: [systemMessage, ...request.messages],
  };

  if (modifiedRequest.provider === "ollama") {
    return handleOllamaStream(modifiedRequest);
  } else if (modifiedRequest.provider === "deepseek") {
    return handleDeepSeekStream(modifiedRequest);
  } else {
    throw new Error(`Unsupported provider: ${modifiedRequest.provider}`);
  }
};
