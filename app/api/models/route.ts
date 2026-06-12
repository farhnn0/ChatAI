import { NextResponse } from "next/server";
import { ModelOption } from "@/lib/types/chat";

export const dynamic = "force-dynamic";

export async function GET() {
  const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || "http://127.0.0.1:11434";
  const models: ModelOption[] = [];

  // 1. Try to fetch models from local Ollama
  try {
    const res = await fetch(`${OLLAMA_BASE_URL}/api/tags`, {
      // 1.5 seconds timeout to avoid blocking if Ollama is not running
      signal: AbortSignal.timeout(1500),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.models && Array.isArray(data.models)) {
        data.models.forEach((m: any) => {
          const name = m.name;
          // Format size for readability
          const sizeGB = (m.size / (1024 * 1024 * 1024)).toFixed(1);
          
          models.push({
            provider: "ollama",
            model: name,
            label: `Local ${name.split(":")[0]}`,
            badge: "Local",
            description: `Ollama model: ${name} (${sizeGB} GB)`,
          });
        });
      }
    }
  } catch (err) {
    // Ollama is offline or not reachable
  }

  // Fallback default local model if Ollama request failed or returned empty
  if (models.filter((m) => m.provider === "ollama").length === 0) {
    models.push({
      provider: "ollama",
      model: "qwen2.5-coder:7b",
      label: "Local Qwen Coder",
      badge: "Free",
      description: "Default local model for daily coding and experiments.",
    });
  }

  // 2. Add DeepSeek cloud models
  models.push(
    {
      provider: "deepseek",
      model: "deepseek-v4-flash",
      label: "DeepSeek Flash",
      badge: "Cloud",
      description: "Low-cost cloud model for fast responses.",
    },
    {
      provider: "deepseek",
      model: "deepseek-v4-pro",
      label: "DeepSeek Pro",
      badge: "Cloud",
      description: "Stronger cloud model for complex coding tasks.",
    }
  );

  return NextResponse.json(models);
}
