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

export function ChatLayout() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<ModelOption>(defaultModel);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isMemoryOpen, setIsMemoryOpen] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    // Load state from localStorage on mount
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

  const handleSendMessage = async (content: string) => {
    if (!currentSessionId) return;
    
    setIsGenerating(true);
    
    const userMsg: Message = {
      id: uuidv4(),
      role: "user",
      content,
      createdAt: new Date().toISOString(),
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
      updatedAt: new Date().toISOString(),
      model: selectedModel.model,
      provider: selectedModel.provider
    };
    
    // Update state immediately for user message
    updateSession(currentSession);

    // 1. Memory Detection (Manual trigger intercept)
    const memoryResult = detectAndSaveMemory(content);
    if (memoryResult.isMemoryAction) {
      const feedbackMsg: Message = {
        id: uuidv4(),
        role: "assistant",
        content: memoryResult.feedbackMessage || "Saved to memory.",
        createdAt: new Date().toISOString(),
        model: selectedModel.model,
        provider: selectedModel.provider
      };

      const finalSession = {
        ...currentSession,
        messages: [...updatedMessages, feedbackMsg],
        updatedAt: new Date().toISOString()
      };

      updateSession(finalSession);
      setIsGenerating(false);
      return;
    }
    
    const aiMsgId = uuidv4();
    const initialAiMsg: Message = {
      id: aiMsgId,
      role: "assistant",
      content: "",
      createdAt: new Date().toISOString(),
      model: selectedModel.model,
      provider: selectedModel.provider
    };

    // Update session state with both user and initial empty assistant message
    const generatingSession = {
      ...currentSession,
      messages: [...updatedMessages, initialAiMsg],
      updatedAt: new Date().toISOString()
    };
    updateSession(generatingSession);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      // 2. Build Context (Slice to last 15 messages for token optimization)
      const sliced = updatedMessages.slice(-15);
      
      // Build dynamic system message including active memories
      const systemMsg = {
        role: "system" as const,
        content: buildSystemPrompt()
      };

      const contextMessages = [
        systemMsg,
        ...sliced.map(m => ({
          role: m.role,
          content: m.content
        }))
      ];

      const payload: ChatRequest = {
        provider: selectedModel.provider,
        model: selectedModel.model,
        messages: contextMessages
      };

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal
      });
      
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to generate response");
      }
      
      const reader = res.body?.getReader();
      if (!reader) throw new Error("No reader in response body");

      const decoder = new TextDecoder();
      let streamedContent = "";
      
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        streamedContent += chunk;
        
        // Update sessions state directly to reflect stream chunks in real-time
        setSessions(prev => {
          return prev.map(s => {
            if (s.id === currentSessionId) {
              return {
                ...s,
                messages: s.messages.map(m => {
                  if (m.id === aiMsgId) {
                    return { ...m, content: streamedContent };
                  }
                  return m;
                })
              };
            }
            return s;
          });
        });
      }

      // Save the final state to localStorage once streaming is complete
      setSessions(prev => {
        const finalSessions = prev.map(s => {
          if (s.id === currentSessionId) {
            return {
              ...s,
              updatedAt: new Date().toISOString()
            };
          }
          return s;
        });
        saveSessions(finalSessions);
        return finalSessions;
      });

      // Fire-and-forget: auto-extract memories from the conversation
      const lastMessages = [...updatedMessages.slice(-6), { role: "assistant" as const, content: streamedContent }];
      autoExtractMemories(
        selectedModel.provider,
        selectedModel.model,
        lastMessages.map(m => ({ role: m.role, content: m.content }))
      ).catch(() => {});
      
    } catch (err: any) {
      if (err.name === "AbortError") {
        // If aborted, save the current state as-is to localStorage
        setSessions(prev => {
          const finalSessions = prev.map(s => {
            if (s.id === currentSessionId) {
              return {
                ...s,
                updatedAt: new Date().toISOString()
              };
            }
            return s;
          });
          saveSessions(finalSessions);
          return finalSessions;
        });
      } else {
        // Update the empty assistant message with the error details
        setSessions(prev => {
          const updated = prev.map(s => {
            if (s.id === currentSessionId) {
              return {
                ...s,
                messages: s.messages.map(m => {
                  if (m.id === aiMsgId) {
                    return { ...m, content: `Error: ${err.message}` };
                  }
                  return m;
                }),
                updatedAt: new Date().toISOString()
              };
            }
            return s;
          });
          saveSessions(updated);
          return updated;
        });
      }
    } finally {
      setIsGenerating(false);
      abortControllerRef.current = null;
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

    const messages = currentSession.messages;
    const aiIndex = messages.findIndex(m => m.id === messageId);
    if (aiIndex === -1) return;

    const userIndex = aiIndex - 1;
    if (userIndex < 0 || messages[userIndex].role !== "user") return;

    setIsGenerating(true);

    // Trim messages to keep only up to the user message
    const trimmedMessages = messages.slice(0, aiIndex);

    // Create a new empty assistant message
    const aiMsgId = uuidv4();
    const initialAiMsg: Message = {
      id: aiMsgId,
      role: "assistant",
      content: "",
      createdAt: new Date().toISOString(),
      model: selectedModel.model,
      provider: selectedModel.provider
    };

    // Update state with trimmed messages and new empty assistant message
    const generatingSession = {
      ...currentSession,
      messages: [...trimmedMessages, initialAiMsg],
      updatedAt: new Date().toISOString()
    };
    updateSession(generatingSession);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      // Build context (last 15 messages from the trimmed list)
      const sliced = trimmedMessages.slice(-15);
      
      const systemMsg = {
        role: "system" as const,
        content: buildSystemPrompt()
      };

      const contextMessages = [
        systemMsg,
        ...sliced.map(m => ({
          role: m.role,
          content: m.content
        }))
      ];

      const payload: ChatRequest = {
        provider: selectedModel.provider,
        model: selectedModel.model,
        messages: contextMessages
      };

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal
      });
      
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to generate response");
      }
      
      const reader = res.body?.getReader();
      if (!reader) throw new Error("No reader in response body");

      const decoder = new TextDecoder();
      let streamedContent = "";
      
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        streamedContent += chunk;
        
        // Update sessions state directly to reflect stream chunks in real-time
        setSessions(prev => {
          return prev.map(s => {
            if (s.id === currentSessionId) {
              return {
                ...s,
                messages: s.messages.map(m => {
                  if (m.id === aiMsgId) {
                    return { ...m, content: streamedContent };
                  }
                  return m;
                })
              };
            }
            return s;
          });
        });
      }

      // Save the final state to localStorage once streaming is complete
      setSessions(prev => {
        const finalSessions = prev.map(s => {
          if (s.id === currentSessionId) {
            return {
              ...s,
              updatedAt: new Date().toISOString()
            };
          }
          return s;
        });
        saveSessions(finalSessions);
        return finalSessions;
      });

      // Fire-and-forget: auto-extract memories from the regenerated conversation
      const lastMessages = [...trimmedMessages.slice(-6), { role: "assistant" as const, content: streamedContent }];
      autoExtractMemories(
        selectedModel.provider,
        selectedModel.model,
        lastMessages.map(m => ({ role: m.role, content: m.content }))
      ).catch(() => {});
      
    } catch (err: any) {
      if (err.name === "AbortError") {
        setSessions(prev => {
          const finalSessions = prev.map(s => {
            if (s.id === currentSessionId) {
              return {
                ...s,
                updatedAt: new Date().toISOString()
              };
            }
            return s;
          });
          saveSessions(finalSessions);
          return finalSessions;
        });
      } else {
        setSessions(prev => {
          const updated = prev.map(s => {
            if (s.id === currentSessionId) {
              return {
                ...s,
                messages: s.messages.map(m => {
                  if (m.id === aiMsgId) {
                    return { ...m, content: `Error: ${err.message}` };
                  }
                  return m;
                }),
                updatedAt: new Date().toISOString()
              };
            }
            return s;
          });
          saveSessions(updated);
          return updated;
        });
      }
    } finally {
      setIsGenerating(false);
      abortControllerRef.current = null;
    }
  };

  const handleTogglePin = (id: string) => {
    const updated = sessions.map(s => {
      if (s.id === id) {
        return { ...s, isPinned: !s.isPinned, updatedAt: new Date().toISOString() };
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
        return { ...s, title: newTitle.trim(), updatedAt: new Date().toISOString() };
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
          <ChatHeader 
            title={currentSession?.title || ""}
          />
          
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

      <MemoryDialog 
        open={isMemoryOpen}
        onOpenChange={setIsMemoryOpen}
      />
    </SidebarProvider>
  );
}
