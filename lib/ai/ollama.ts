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
      options: {
        temperature: 0.7,
        top_p: 0.9,
        top_k: 40,
        num_ctx: 8192,
        repeat_penalty: 1.15,
        num_predict: 1024,
      },
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

export const handleOllamaStream = async (
  request: ChatRequest
): Promise<ReadableStream> => {
  const baseUrl = process.env.OLLAMA_BASE_URL || "http://127.0.0.1:11434";
  
  const response = await fetch(`${baseUrl}/api/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: request.model,
      messages: request.messages,
      stream: true,
      options: {
        temperature: 0.7,
        top_p: 0.9,
        top_k: 40,
        num_ctx: 8192,
        repeat_penalty: 1.15,
        num_predict: 1024,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to connect to local Ollama server`);
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
          
          // Save the last partial line back to buffer
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (!line.trim()) continue;
            try {
              const json = JSON.parse(line);
              const chunkText = json.message?.content || "";
              if (chunkText) {
                controller.enqueue(encoder.encode(chunkText));
              }
            } catch (e) {
              console.error("Failed to parse Ollama stream line JSON:", line, e);
            }
          }
        }

        // Process final remaining buffer
        if (buffer.trim()) {
          try {
            const json = JSON.parse(buffer);
            const chunkText = json.message?.content || "";
            if (chunkText) {
              controller.enqueue(encoder.encode(chunkText));
            }
          } catch (e) {
            // Ignore trailing partial line parsing errors
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
