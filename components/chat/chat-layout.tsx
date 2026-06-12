"use client";

import { useState, useEffect } from "react";
import { ChatSidebar } from "./chat-sidebar";
import { ChatHeader } from "./chat-header";
import { ChatMessageList } from "./chat-message-list";
import { ChatComposer } from "./chat-composer";
import { ChatSession, Message, ModelOption, ChatRequest } from "@/lib/types/chat";
import { defaultModel, modelOptions } from "@/lib/ai/models";
import { getStoredSessions, saveSessions } from "@/lib/storage/chat-storage";
import { v4 as uuidv4 } from "uuid";
import { SidebarProvider } from "@/components/ui/sidebar";

export function ChatLayout() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<ModelOption>(defaultModel);
  const [isGenerating, setIsGenerating] = useState(false);
  const [models, setModels] = useState<ModelOption[]>(modelOptions);

  useEffect(() => {
    // Load state from localStorage on mount
    const stored = getStoredSessions();
    setSessions(stored);
    
    if (stored.length > 0) {
      setCurrentSessionId(stored[0].id);
    } else {
      createNewSession();
    }

    const fetchModels = async () => {
      try {
        const res = await fetch("/api/models");
        if (res.ok) {
          const data = await res.json();
          setModels(data);
        }
      } catch (err) {
        console.warn("Failed to fetch dynamic models", err);
      }
    };
    fetchModels();
  }, []);

  const createNewSession = () => {
    const newSession: ChatSession = {
      id: uuidv4(),
      title: "New chat",
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      model: selectedModel.model,
      provider: selectedModel.provider,
    };
    
    const updatedSessions = [newSession, ...sessions];
    setSessions(updatedSessions);
    setCurrentSessionId(newSession.id);
    saveSessions(updatedSessions);
  };

  const handleSendMessage = async (content: string) => {
    if (!currentSessionId) return;
    
    setIsGenerating(true);
    
    const userMsg: Message = {
      id: uuidv4(),
      role: "user",
      content,
      createdAt: Date.now(),
    };
    
    let currentSession = sessions.find(s => s.id === currentSessionId);
    if (!currentSession) return;
    
    // Auto-generate title on first message
    let newTitle = currentSession.title;
    if (currentSession.messages.length === 0) {
      newTitle = content.slice(0, 30) + (content.length > 30 ? "..." : "");
    }
    
    const updatedMessages = [...currentSession.messages, userMsg];
    
    currentSession = {
      ...currentSession,
      title: newTitle,
      messages: updatedMessages,
      updatedAt: Date.now(),
      model: selectedModel.model,
      provider: selectedModel.provider
    };
    
    // Update state immediately for user message
    updateSession(currentSession);
    
    try {
      // Build context (last 10 messages)
      const contextMessages = updatedMessages.slice(-10).map(m => ({
        role: m.role,
        content: m.content
      }));

      const payload: ChatRequest = {
        provider: selectedModel.provider,
        model: selectedModel.model,
        messages: contextMessages
      };

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Failed to generate response");
      }
      
      const aiMsg: Message = {
        id: uuidv4(),
        role: "assistant",
        content: data.content,
        createdAt: Date.now(),
        model: data.model,
        provider: data.provider
      };
      
      currentSession = {
        ...currentSession,
        messages: [...currentSession.messages, aiMsg],
        updatedAt: Date.now()
      };
      
      updateSession(currentSession);
      
    } catch (err: any) {
      // Add error message to chat
      const errorMsg: Message = {
        id: uuidv4(),
        role: "assistant",
        content: `Error: ${err.message}`,
        createdAt: Date.now(),
        model: "System"
      };
      
      currentSession = {
        ...currentSession,
        messages: [...currentSession.messages, errorMsg],
        updatedAt: Date.now()
      };
      
      updateSession(currentSession);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTogglePin = (id: string) => {
    const updated = sessions.map(s => {
      if (s.id === id) {
        return { ...s, isPinned: !s.isPinned, updatedAt: Date.now() };
      }
      return s;
    });
    setSessions(updated);
    saveSessions(updated);
  };

  const handleRenameSession = (id: string, newTitle: string) => {
    if (!newTitle.trim()) return;
    const updated = sessions.map(s => {
      if (s.id === id) {
        return { ...s, title: newTitle.trim(), updatedAt: Date.now() };
      }
      return s;
    });
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
      } else {
        // Create new session if list is empty
        const newSession: ChatSession = {
          id: uuidv4(),
          title: "New chat",
          messages: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
          model: selectedModel.model,
          provider: selectedModel.provider,
        };
        const newSessions = [newSession];
        setSessions(newSessions);
        setCurrentSessionId(newSession.id);
        saveSessions(newSessions);
      }
    }
  };

  const updateSession = (updatedSession: ChatSession) => {
    setSessions(prev => {
      const newSessions = prev.map(s => s.id === updatedSession.id ? updatedSession : s);
      // Move updated to top
      const sorted = [updatedSession, ...newSessions.filter(s => s.id !== updatedSession.id)];
      saveSessions(sorted);
      return sorted;
    });
  };

  const currentSession = sessions.find(s => s.id === currentSessionId);

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full overflow-hidden bg-[#09090B] text-zinc-100">
        <ChatSidebar 
          sessions={sessions}
          currentSessionId={currentSessionId}
          onSelectSession={setCurrentSessionId}
          onNewChat={createNewSession}
          onTogglePin={handleTogglePin}
          onRenameSession={handleRenameSession}
          onDeleteSession={handleDeleteSession}
        />
        
        <div className="flex-1 flex flex-col min-w-0">
          <ChatHeader 
            title={currentSession?.title || ""}
          />
          
          <ChatMessageList 
            messages={currentSession?.messages || []}
            isGenerating={isGenerating}
          />
          
          <ChatComposer 
            onSendMessage={handleSendMessage}
            selectedModel={selectedModel}
            onModelChange={setSelectedModel}
            models={models}
            isGenerating={isGenerating}
          />
        </div>
      </div>
    </SidebarProvider>
  );
}
