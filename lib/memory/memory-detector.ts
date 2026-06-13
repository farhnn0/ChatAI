import { addMemory, getMemories } from "@/lib/storage/chat-storage";
import { UserMemory } from "@/lib/types/memory";
import { Message } from "@/lib/types/chat";

// ── Manual Triggers ──
// These still work as instant shortcuts (no API call needed)

const MANUAL_REGEXES = [
  /^(?:ingat\s+(?:bahwa\s+)?|remember\s+(?:that\s+)?|simpan\s+(?:bahwa\s+)?)(.+)/i,
  /^(?:ingat|remember|simpan)\s*:\s*(.+)/i
];

export interface DetectionResult {
  isMemoryAction: boolean;
  content?: string;
  category?: UserMemory["category"];
  feedbackMessage?: string;
}

export const detectManualMemory = (messageText: string): DetectionResult => {
  const text = messageText.trim();
  
  for (const regex of MANUAL_REGEXES) {
    const match = text.match(regex);
    if (match && match[1]) {
      const content = match[1].trim();
      const category = guessCategory(content);
      addMemory(content, category);
      
      return {
        isMemoryAction: true,
        content,
        category,
        feedbackMessage: "Saved to memory."
      };
    }
  }

  return { isMemoryAction: false };
};

// ── Auto Extraction ──
// Runs in the background after each AI response completes.
// Sends recent messages to the model to extract important facts.

export const autoExtractMemories = async (
  provider: string,
  model: string,
  recentMessages: Pick<Message, "role" | "content">[]
): Promise<number> => {
  try {
    const existingMemories = getMemories();

    const res = await fetch("/api/memory/extract", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        provider,
        model,
        recentMessages,
        existingMemories: existingMemories.map(m => ({
          content: m.content,
          category: m.category
        }))
      })
    });

    if (!res.ok) return 0;

    const data = await res.json();
    const extracted: { content: string; category: string }[] = data.extracted || [];

    if (extracted.length === 0) return 0;

    // Deduplicate against existing memories (fuzzy match)
    const validCategories = ["preference", "project", "technical", "profile", "other"];
    let savedCount = 0;

    for (const item of extracted) {
      const normalizedContent = item.content.trim().toLowerCase();
      
      // Skip if a very similar memory already exists
      const isDuplicate = existingMemories.some(existing => {
        const existingNorm = existing.content.trim().toLowerCase();
        // Exact match or high overlap
        return existingNorm === normalizedContent || 
               existingNorm.includes(normalizedContent) || 
               normalizedContent.includes(existingNorm);
      });

      if (isDuplicate) continue;

      const category = validCategories.includes(item.category)
        ? (item.category as UserMemory["category"])
        : "other";

      addMemory(item.content.trim(), category);
      savedCount++;
    }

    return savedCount;
  } catch (err) {
    // Silently fail — memory extraction is a background enhancement
    console.error("Auto memory extraction failed:", err);
    return 0;
  }
};

// ── Helpers ──

function guessCategory(content: string): UserMemory["category"] {
  const lower = content.toLowerCase();

  if (lower.includes("prefer") || lower.includes("suka") || lower.includes("lebih memilih") || lower.includes("favorit") || lower.includes("style")) {
    return "preference";
  }
  if (lower.includes("project") || lower.includes("aplikasi") || lower.includes("app") || lower.includes("projek") || lower.includes("building")) {
    return "project";
  }
  if (lower.includes("use") || lower.includes("pakai") || lower.includes("teknologi") || lower.includes("framework") || lower.includes("stack") || lower.includes("bahasa")) {
    return "technical";
  }
  if (lower.includes("nama") || lower.includes("umur") || lower.includes("saya adalah") || lower.includes("pekerjaan") || lower.includes("profesi") || lower.includes("name")) {
    return "profile";
  }

  return "other";
}

// Legacy alias for backward compatibility
export const detectAndSaveMemory = detectManualMemory;
