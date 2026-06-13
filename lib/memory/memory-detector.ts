import { addMemory } from "@/lib/storage/chat-storage";
import { UserMemory } from "@/lib/types/memory";

const DETECTOR_REGEXES = [
  /^(?:ingat\s+bahwa|remember\s+that|simpan\s+bahwa)\s+(.+)/i,
  /^(?:ingat|remember|simpan)\s*:\s*(.+)/i
];

export interface DetectionResult {
  isMemoryAction: boolean;
  content?: string;
  category?: UserMemory["category"];
  feedbackMessage?: string;
}

export const detectAndSaveMemory = (messageText: string): DetectionResult => {
  const text = messageText.trim();
  
  for (const regex of DETECTOR_REGEXES) {
    const match = text.match(regex);
    if (match && match[1]) {
      const content = match[1].trim();
      
      // Basic category deduction based on text keywords
      let category: UserMemory["category"] = "other";
      const lowerContent = content.toLowerCase();
      
      if (lowerContent.includes("prefer") || lowerContent.includes("suka") || lowerContent.includes("lebih memilih") || lowerContent.includes("favorit")) {
        category = "preference";
      } else if (lowerContent.includes("project") || lowerContent.includes("aplikasi") || lowerContent.includes("app") || lowerContent.includes("projek")) {
        category = "project";
      } else if (lowerContent.includes("use") || lowerContent.includes("pakai") || lowerContent.includes("teknologi") || lowerContent.includes("bahasa") || lowerContent.includes("framework") || lowerContent.includes("stack")) {
        category = "technical";
      } else if (lowerContent.includes("nama saya") || lowerContent.includes("umur") || lowerContent.includes("saya adalah") || lowerContent.includes("pekerjaan") || lowerContent.includes("profesi")) {
        category = "profile";
      }

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
