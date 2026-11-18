"use client";

import { useState, useEffect, useRef } from "react";
import { ChatSidebar } from "./chat-sidebar";
import { ChatHeader } from "./chat-header";
import { ChatMessageList } from "./chat-message-list";
import { ChatComposer } from "./chat-composer";
import { ChatSession, Message, ModelOption, ChatRequest } from "@/lib/types/chat";
import { defaultModel } from "@/lib/ai/models";
import {
  getSessions,
  saveSessions,
  getActiveSessionId,
  setActiveSessionId
} from "@/lib/storage/chat-storage";
import { v4 as uuidv4 } from "uuid";
import { SidebarProvider } from "@/components/ui/sidebar";
import { MemoryDialog } from "../memory/memory-dialog";
import { buildSystemPrompt } from "@/lib/memory/memory-context";
import { detectAndSaveMemory, autoExtractMemories } from "@/lib/memory/memory-detector";

interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  cost: number;
}

export function ChatLayout() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<ModelOption>(defaultModel);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isMemoryOpen, setIsMemoryOpen] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const stored = getSessions();
    setSessions(stored);
    
    const activeId = getActiveSessionId();
    if (activeId && stored.some(s => s.id === activeId)) {
      setCurrentSessionId(activeId);
    } else if (stored.length > 0) {
      setCurrentSessionId(stored[0].id);
      setActiveSessionId(stored[0].id);
    } else {
      createNewSession(stored);
    }
  }, []);

  const createNewSession = (currentList = sessions) => {
    const newSession: ChatSession = {
      id: uuidv4(),
      title: "New chat",
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      model: selectedModel.model,
      provider: selectedModel.provider,
    };
    
    const updatedSessions = [newSession, ...currentList];
    setSessions(updatedSessions);
    setCurrentSessionId(newSession.id);
    setActiveSessionId(newSession.id);
    saveSessions(updatedSessions);
  };

  const handleSelectSession = (id: string) => {
    setCurrentSessionId(id);
    setActiveSessionId(id);
  };

  const processStream = async (aiMsgId: string, controller: AbortController, currentSessionId: string, onComplete: (content: string, usage?: TokenUsage) => void) => {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ provider: selectedModel.provider, model: selectedModel.model, messages: [] }),
      signal: controller.signal
    });
    if (!res.ok) throw new Error("Failed to generate response");
    const reader = res.body?.getReader();
    if (!reader) throw new Error("No reader");
    const decoder = new TextDecoder();
    let streamedContent = "";
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      streamedContent += decoder.decode(value, { stream: true });
      const metaIndex = streamedContent.indexOf("\n__METADATA__:");
      const cleanContent = metaIndex !== -1 ? streamedContent.slice(0, metaIndex) : streamedContent;
      setSessions(prev => prev.map(s => s.id === currentSessionId ? { ...s, messages: s.messages.map(m => m.id === aiMsgId ? { ...m, content: cleanContent } : m) } : s));
    }
    onComplete(streamedContent);
  };

  const handleSendMessage = async (content: string) => {
    if (!currentSessionId) return;
    setIsGenerating(true);
    const userMsg: Message = { id: uuidv4(), role: "user", content, createdAt: new Date().toISOString() };
    let currentSession = sessions.find(s => s.id === currentSessionId);
    if (!currentSession) return;
    const updatedMessages = [...currentSession.messages, userMsg];
    updateSession({ ...currentSession, messages: updatedMessages, updatedAt: new Date().toISOString() });
    const memoryResult = detectAndSaveMemory(content);
    if (memoryResult.isMemoryAction) {
      setIsGenerating(false);
      return;
    }
    const aiMsgId = uuidv4();
    const initialAiMsg: Message = { id: aiMsgId, role: "assistant", content: "", createdAt: new Date().toISOString(), model: selectedModel.model, provider: selectedModel.provider };
    updateSession({ ...currentSession, messages: [...updatedMessages, initialAiMsg], updatedAt: new Date().toISOString() });
    const controller = new AbortController();
    abortControllerRef.current = controller;
    try {
      await processStream(aiMsgId, controller, currentSessionId, () => setIsGenerating(false));
    } catch (err: unknown) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsGenerating(false);
  };

  const handleRegenerate = async (messageId: string) => {
    if (isGenerating || !currentSessionId) return;
    let currentSession = sessions.find(s => s.id === currentSessionId);
    if (!currentSession) return;
    const aiIndex = currentSession.messages.findIndex(m => m.id === messageId);
    if (aiIndex === -1) return;
    setIsGenerating(true);
    const aiMsgId = uuidv4();
    const initialAiMsg: Message = { id: aiMsgId, role: "assistant", content: "", createdAt: new Date().toISOString(), model: selectedModel.model, provider: selectedModel.provider };
    updateSession({ ...currentSession, messages: [...currentSession.messages.slice(0, aiIndex), initialAiMsg], updatedAt: new Date().toISOString() });
    const controller = new AbortController();
    abortControllerRef.current = controller;
    try {
      await processStream(aiMsgId, controller, currentSessionId, () => setIsGenerating(false));
    } catch (err: unknown) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTogglePin = (id: string) => {
    const updated = sessions.map(s => s.id === id ? { ...s, isPinned: !s.isPinned, updatedAt: new Date().toISOString() } : s);
    setSessions(updated);
    saveSessions(updated);
  };

  const handleRenameSession = (id: string, newTitle: string) => {
    if (!newTitle.trim()) return;
    const updated = sessions.map(s => s.id === id ? { ...s, title: newTitle.trim(), updatedAt: new Date().toISOString() } : s);
    setSessions(updated);
    saveSessions(updated);
  };

  const handleDeleteSession = (id: string) => {
    const updated = sessions.filter(s => s.id !== id);
    setSessions(updated);
    saveSessions(updated);
    if (currentSessionId === id) {
      if (updated.length > 0) {
        setCurrentSessionId(updated[0].id);
        setActiveSessionId(updated[0].id);
      } else {
        createNewSession(updated);
      }
    }
  };

  const updateSession = (updatedSession: ChatSession) => {
    setSessions(prev => {
      const newSessions = prev.map(s => s.id === updatedSession.id ? updatedSession : s);
      const sorted = [updatedSession, ...newSessions.filter(s => s.id !== updatedSession.id)];
      saveSessions(sorted);
      return sorted;
    });
  };

  const currentSession = sessions.find(s => s.id === currentSessionId);

  return (
    <SidebarProvider>
      <div className="flex h-dvh w-full overflow-hidden bg-[#09090B] text-zinc-100">
        <ChatSidebar 
          sessions={sessions}
          currentSessionId={currentSessionId}
          onSelectSession={handleSelectSession}
          onNewChat={() => createNewSession()}
          onTogglePin={handleTogglePin}
          onRenameSession={handleRenameSession}
          onDeleteSession={handleDeleteSession}
          onOpenMemory={() => setIsMemoryOpen(true)}
        />
        <div className="flex-1 flex flex-col min-w-0 min-h-0">
          <ChatHeader title={currentSession?.title || ""} />
          <ChatMessageList 
            messages={currentSession?.messages || []}
            isGenerating={isGenerating}
            onRegenerate={handleRegenerate}
          />
          <ChatComposer 
            onSendMessage={handleSendMessage}
            selectedModel={selectedModel}
            onModelChange={setSelectedModel}
            isGenerating={isGenerating}
            onStopGeneration={handleStopGeneration}
          />
        </div>
      </div>
      <MemoryDialog open={isMemoryOpen} onOpenChange={setIsMemoryOpen} />
    </SidebarProvider>
  );
}
