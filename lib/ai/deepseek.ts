import { ChatRequest, ChatResponse } from "@/lib/types/chat";

const getActualModel = (model: string) => {
  if (model === "deepseek-v4-flash") return "deepseek-chat";
  if (model === "deepseek-v4-pro") return "deepseek-reasoner";
  return model;
};

const handleApiError = async (response: Response) => {
  let errorDetails = "Unknown error";
  try {
    const errJson = await response.json();
    errorDetails = errJson.error?.message || JSON.stringify(errJson);
  } catch {
    try {
      errorDetails = await response.text();
    } catch (e) {
      console.error("Failed to parse error response body:", e);
    }
  }
  throw new Error(`DeepSeek API Error (Status ${response.status}): ${errorDetails}`);
};

export const handleDeepSeekRequest = async (
  request: ChatRequest
): Promise<ChatResponse> => {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    throw new Error("DeepSeek API key is not configured.");
  }

  const actualModel = getActualModel(request.model);

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
    await handleApiError(response);
  }

  const data = await response.json();

  return {
    content: data.choices[0]?.message?.content || "",
    provider: "deepseek",
    model: request.model,
  };
};

export const handleDeepSeekStream = async (
  request: ChatRequest
): Promise<ReadableStream> => {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    throw new Error("DeepSeek API key is not configured.");
  }

  const actualModel = getActualModel(request.model);

  const response = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: actualModel,
      messages: request.messages,
      stream: true,
      stream_options: {
        include_usage: true
      },
      temperature: 0.7,
      max_tokens: 4096,
      top_p: 0.9,
      frequency_penalty: 0.3,
      presence_penalty: 0.2,
    }),
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  return new ReadableStream({
    async start(controller) {
      if (!response.body) {
        controller.close();
        return;
      }

      const reader = response.body.getReader();
      let buffer = "";
      let finalUsage: any = null;

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            const cleanLine = line.trim();
            if (!cleanLine || !cleanLine.startsWith("data: ")) continue;

            const dataStr = cleanLine.slice(6).trim();
            if (dataStr === "[DONE]") continue;

            try {
              const json = JSON.parse(dataStr);
              const chunkText = json.choices?.[0]?.delta?.content || "";
              if (chunkText) controller.enqueue(encoder.encode(chunkText));
              if (json.usage) finalUsage = json.usage;
            } catch (e) {
              console.error("Failed to parse DeepSeek SSE JSON chunk:", dataStr, e);
            }
          }
        }

        if (finalUsage) {
          controller.enqueue(encoder.encode(`\n__METADATA__:${JSON.stringify(finalUsage)}`));
        }
      } catch (err) {
        controller.error(err);
      } finally {
        controller.close();
      }
    },
  });
};
