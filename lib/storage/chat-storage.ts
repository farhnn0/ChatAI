import { ChatSession } from "@/lib/types/chat";

const STORAGE_KEY = "chatai_sessions";

export const getStoredSessions = (): ChatSession[] => {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveSessions = (sessions: ChatSession[]) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
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
