import { ChatRequest, ChatResponse } from "@/lib/types/chat";

export const handleGroqRequest = async (
  request: ChatRequest
): Promise<ChatResponse> => {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("Groq API key is not configured.");
  }

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: request.model,
      messages: request.messages,
      stream: false,
      temperature: 0.7,
      max_tokens: 4096,
    }),
  });

  if (!response.ok) {
    let errorDetails = "Unknown error";
    try {
      const errJson = await response.json();
      errorDetails = errJson.error?.message || JSON.stringify(errJson);
    } catch {
      try {
        errorDetails = await response.text();
      } catch {}
    }
    throw new Error(`Groq API Error (Status ${response.status}): ${errorDetails}`);
  }

  const data = await response.json();

  return {
    content: data.choices[0]?.message?.content || "",
    provider: "groq",
    model: request.model,
  };
};

export const handleGroqStream = async (
  request: ChatRequest
): Promise<ReadableStream> => {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("Groq API key is not configured. Please add GROQ_API_KEY to your .env.local file.");
  }

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: request.model,
      messages: request.messages,
      stream: true,
      temperature: 0.7,
      max_tokens: 4096,
    }),
  });

  if (!response.ok) {
    let errorDetails = "Unknown error";
    try {
      const errJson = await response.json();
      errorDetails = errJson.error?.message || JSON.stringify(errJson);
    } catch {
      try {
        errorDetails = await response.text();
      } catch {}
    }
    throw new Error(`Groq API Error (Status ${response.status}): ${errorDetails}`);
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

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          
          buffer = lines.pop() || "";

          for (const line of lines) {
            const cleanLine = line.trim();
            if (!cleanLine) continue;

            if (cleanLine.startsWith("data: ")) {
              const dataStr = cleanLine.slice(6).trim();
              if (dataStr === "[DONE]") {
                break;
              }
              try {
                const json = JSON.parse(dataStr);
                const chunkText = json.choices?.[0]?.delta?.content || "";
                if (chunkText) {
                  controller.enqueue(encoder.encode(chunkText));
                }
              } catch (e) {
                console.error("Failed to parse Groq SSE JSON chunk:", dataStr, e);
              }
            }
          }
        }
      } catch (err) {
        controller.error(err);
      } finally {
        controller.close();
      }
    },
  });
};
