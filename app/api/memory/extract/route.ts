import { NextResponse } from "next/server";

const EXTRACTION_PROMPT = `You are a memory extraction system. Analyze the conversation below and extract any NEW important facts about the user that should be remembered for future conversations.

Rules:
- Return ONLY a valid JSON array. No markdown, no explanation, no code fences.
- Each item must have "content" (string, concise fact) and "category" (one of: preference, project, technical, profile, other).
- Only extract facts that are personal, specific, and worth remembering long-term.
- Extract things like: user preferences, tools they use, their name, their job, projects they work on, hardware they have, languages they speak, coding style preferences.
- Do NOT extract: general knowledge questions, temporary topics, greetings, or things the AI said.
- Do NOT repeat facts that are already listed in the existing memories section below.
- If there is nothing new worth remembering, return an empty array: []
- Keep each fact short and clear (1 sentence max).

Example output:
[{"content":"User prefers dark-only UI with no emoji","category":"preference"},{"content":"User is named Farhan","category":"profile"}]`;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { provider, model, recentMessages, existingMemories } = body;

    if (!provider || !model || !recentMessages || !Array.isArray(recentMessages)) {
      return NextResponse.json({ extracted: [] });
    }

    // Build the extraction request with existing memories for deduplication
    const existingMemoryList = (existingMemories || [])
      .map((m: { content: string }) => `- ${m.content}`)
      .join("\n");

    const contextBlock = recentMessages
      .map((m: { role: string; content: string }) => `${m.role}: ${m.content}`)
      .join("\n");

    const fullPrompt = `${EXTRACTION_PROMPT}

Existing memories (do NOT repeat these):
${existingMemoryList || "(none)"}

Conversation to analyze:
${contextBlock}

Return ONLY the JSON array:`;

    let responseText = "";

    if (provider === "ollama") {
      const baseUrl = process.env.OLLAMA_BASE_URL || "http://127.0.0.1:11434";
      const res = await fetch(`${baseUrl}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: "You are a JSON-only extraction bot. Return only valid JSON arrays." },
            { role: "user", content: fullPrompt }
          ],
          stream: false,
          options: {
            temperature: 0.1,
            top_p: 0.5,
            num_predict: 512,
          },
        }),
      });

      if (!res.ok) {
        console.error("Ollama memory extraction failed:", res.status);
        return NextResponse.json({ extracted: [] });
      }

      const data = await res.json();
      responseText = data.message?.content || "";
    } else if (provider === "deepseek") {
      const apiKey = process.env.DEEPSEEK_API_KEY;
      if (!apiKey) {
        return NextResponse.json({ extracted: [] });
      }

      const res = await fetch("https://api.deepseek.com/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [
            { role: "system", content: "You are a JSON-only extraction bot. Return only valid JSON arrays." },
            { role: "user", content: fullPrompt }
          ],
          stream: false,
          temperature: 0.1,
          max_tokens: 512,
        }),
      });

      if (!res.ok) {
        console.error("DeepSeek memory extraction failed:", res.status);
        return NextResponse.json({ extracted: [] });
      }

      const data = await res.json();
      responseText = data.choices?.[0]?.message?.content || "";
    }

    // Parse JSON from the response — handle cases where model wraps in code fences
    let extracted: { content: string; category: string }[] = [];
    try {
      // Strip markdown code fences if present
      const cleaned = responseText
        .replace(/```json\s*/gi, "")
        .replace(/```\s*/g, "")
        .trim();

      const parsed = JSON.parse(cleaned);
      if (Array.isArray(parsed)) {
        extracted = parsed.filter(
          (item: any) =>
            typeof item.content === "string" &&
            item.content.trim().length > 0 &&
            typeof item.category === "string"
        );
      }
    } catch {
      // If JSON parsing fails, try to find a JSON array in the text
      const match = responseText.match(/\[[\s\S]*?\]/);
      if (match) {
        try {
          const parsed = JSON.parse(match[0]);
          if (Array.isArray(parsed)) {
            extracted = parsed.filter(
              (item: any) =>
                typeof item.content === "string" &&
                item.content.trim().length > 0
            );
          }
        } catch {
          // Give up gracefully
        }
      }
    }

    return NextResponse.json({ extracted });
  } catch (error) {
    console.error("Memory extraction error:", error);
    return NextResponse.json({ extracted: [] });
  }
}
