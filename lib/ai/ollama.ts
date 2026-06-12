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
        // Temperature: slightly above default for more creative/natural responses.
        // Too high (>1.0) causes incoherence in 7B models.
        temperature: 0.7,

        // Top-p (nucleus sampling): keeps outputs diverse but coherent.
        top_p: 0.9,

        // Top-k: limits token pool per step — prevents wild hallucinations.
        top_k: 40,

        // Context window: use full 8192 tokens so the model can see
        // the entire conversation history + system prompt.
        num_ctx: 8192,

        // Repeat penalty: discourages the model from repeating phrases
        // like "mantap bro" over and over. Default is 1.1, we push to 1.15.
        repeat_penalty: 1.15,

        // Minimum predicted tokens: prevents the model from stopping too early.
        // This forces at least ~256 tokens of output.
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
