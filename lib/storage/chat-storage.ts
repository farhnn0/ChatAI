import { ChatSession } from "@/lib/types/chat";
import { UserMemory } from "@/lib/types/memory";

const SESSIONS_KEY = "ai-chat:sessions";
const ACTIVE_SESSION_ID_KEY = "ai-chat:active-session-id";
const USER_MEMORY_KEY = "ai-chat:user-memory";

// Sessions Storage Helpers
export const getSessions = (): ChatSession[] => {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(SESSIONS_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveSession = (session: ChatSession) => {
  if (typeof window === "undefined") return;
  const sessions = getSessions();
  const index = sessions.findIndex((s) => s.id === session.id);
  if (index !== -1) {
    sessions[index] = session;
  } else {
    sessions.push(session);
  }
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
};

export const deleteSession = (id: string) => {
  if (typeof window === "undefined") return;
  const sessions = getSessions();
  const updated = sessions.filter((s) => s.id !== id);
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(updated));
};

// Active Session Storage Helpers
export const getActiveSessionId = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACTIVE_SESSION_ID_KEY);
};

export const setActiveSessionId = (id: string | null) => {
  if (typeof window === "undefined") return;
  if (id === null) {
    localStorage.removeItem(ACTIVE_SESSION_ID_KEY);
  } else {
    localStorage.setItem(ACTIVE_SESSION_ID_KEY, id);
  }
};

export const getActiveSession = (): ChatSession | null => {
  const activeId = getActiveSessionId();
  if (!activeId) return null;
  const sessions = getSessions();
  return sessions.find((s) => s.id === activeId) || null;
};

export const setActiveSession = (id: string | null) => {
  setActiveSessionId(id);
};

// Memories Storage Helpers
export const getMemories = (): UserMemory[] => {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(USER_MEMORY_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveMemories = (memories: UserMemory[]) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(USER_MEMORY_KEY, JSON.stringify(memories));
};

export const addMemory = (content: string, category: UserMemory["category"] = "other"): UserMemory => {
  const memories = getMemories();
  const newMemory: UserMemory = {
    id: Math.random().toString(36).substring(2, 9),
    content,
    category,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  memories.push(newMemory);
  saveMemories(memories);
  return newMemory;
};

export const deleteMemory = (id: string) => {
  const memories = getMemories();
  const updated = memories.filter((m) => m.id !== id);
  saveMemories(updated);
};

export const clearMemories = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(USER_MEMORY_KEY);
};

// Legacy compatibility helpers (to make sure we don't break simple transitions)
export const getStoredSessions = getSessions;
export const saveSessions = (sessions: ChatSession[]) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
};

export const getStoredSettings = () => {
  if (typeof window === "undefined") return { collapsed: false };
  const data = localStorage.getItem("chatai_settings");
  return data ? JSON.parse(data) : { collapsed: false };
};

export const saveSettings = (settings: { collapsed: boolean }) => {
  if (typeof window === "undefined") return;
  localStorage.setItem("chatai_settings", JSON.stringify(settings));
};
