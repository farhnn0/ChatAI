"use client";

import { useState } from "react";
import { ChatSession } from "@/lib/types/chat";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuAction,
  SidebarGroup,
  SidebarGroupContent,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { PenSquare, MessageSquare, Search, Settings, MoreHorizontal, Pin, Edit2, Trash2, Brain } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

interface ChatSidebarProps {
  sessions: ChatSession[];
  currentSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  onTogglePin: (id: string) => void;
  onRenameSession: (id: string, newTitle: string) => void;
  onDeleteSession: (id: string) => void;
  onOpenMemory: () => void;
}

export function ChatSidebar({
  sessions,
  currentSessionId,
  onSelectSession,
  onNewChat,
  onTogglePin,
  onRenameSession,
  onDeleteSession,
  onOpenMemory,
}: ChatSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");

  const handleStartRename = (session: ChatSession) => {
    setEditingSessionId(session.id);
    setEditingTitle(session.title);
  };

  const handleSaveRename = (id: string) => {
    if (editingTitle.trim()) {
      onRenameSession(id, editingTitle.trim());
    }
    setEditingSessionId(null);
  };

  const filteredSessions = sessions.filter(session =>
    session.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    session.messages.some(m => m.content.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Sort sessions: pinned first, then by updatedAt desc
  const sortedSessions = [...filteredSessions].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return b.updatedAt.localeCompare(a.updatedAt);
  });

  return (
    <Sidebar collapsible="icon" className="border-r border-zinc-850">
      <SidebarHeader className="p-2 gap-2 flex flex-col">
        {/* Row 1: Logo & Sidebar Toggle Trigger */}
        <div className="flex items-center justify-between w-full group-data-[collapsible=icon]:justify-center">
          <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest pl-1.5 group-data-[collapsible=icon]:hidden">
            Workspace
          </span>
          <SidebarTrigger className="h-7 w-7 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50 rounded-lg shrink-0" />
        </div>

        {/* Row 2: New Chat button */}
        <div className="flex items-center w-full">
          <button
            onClick={onNewChat}
            className="flex-1 flex items-center justify-start gap-2 h-8 px-2.5 bg-zinc-900 border border-zinc-800/50 hover:bg-zinc-855 text-zinc-300 hover:text-zinc-100 rounded-lg text-xs transition-colors group-data-[collapsible=icon]:h-8 group-data-[collapsible=icon]:w-8 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:justify-center shrink-0 cursor-pointer"
            title="New Chat"
          >
            <PenSquare className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate group-data-[collapsible=icon]:hidden font-medium">New chat</span>
          </button>
        </div>

        {/* Row 3: Search bar */}
        <div className="relative w-full group-data-[collapsible=icon]:hidden">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-650" />
          <Input
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 bg-zinc-900/40 border-zinc-800/40 rounded-lg text-xs placeholder:text-zinc-600 text-zinc-350 h-7 focus-visible:ring-1 focus-visible:ring-zinc-800 focus-visible:border-zinc-800"
          />
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup className="py-1">
          <SidebarGroupContent>
            <SidebarMenu>
              {sortedSessions.map((session) => (
                <SidebarMenuItem key={session.id}>
                  <SidebarMenuButton
                    onClick={() => {
                      if (editingSessionId !== session.id) {
                        onSelectSession(session.id);
                      }
                    }}
                    isActive={currentSessionId === session.id}
                    tooltip={session.title}
                    className={`w-full justify-start gap-2 px-2.5 py-4.5 rounded-lg font-normal transition-colors relative group/btn ${
                      currentSessionId === session.id
                        ? "bg-zinc-850 text-zinc-100"
                        : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/30"
                    }`}
                  >
                    {session.isPinned ? (
                      <Pin className="h-3.5 w-3.5 text-amber-500 fill-amber-500 shrink-0 rotate-45" />
                    ) : (
                      <MessageSquare className="h-3.5 w-3.5 shrink-0" />
                    )}
                    
                    {editingSessionId === session.id ? (
                      <input
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        onBlur={() => handleSaveRename(session.id)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSaveRename(session.id);
                          if (e.key === "Escape") setEditingSessionId(null);
                        }}
                        className="bg-zinc-800 text-zinc-100 border border-zinc-700 rounded px-1.5 py-0.5 text-xs w-full focus:outline-none focus:border-zinc-500"
                        autoFocus
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <span className="truncate group-data-[collapsible=icon]:hidden text-xs">
                        {session.title}
                      </span>
                    )}
                  </SidebarMenuButton>

                  {/* Dropdown Actions */}
                  <DropdownMenu>
                    <DropdownMenuTrigger render={
                      <SidebarMenuAction 
                        showOnHover
                        className="text-zinc-500 hover:text-zinc-300 hover:bg-zinc-850 rounded-md cursor-pointer"
                      >
                        <MoreHorizontal className="h-3.5 w-3.5" />
                      </SidebarMenuAction>
                    } />
                    <DropdownMenuContent align="start" side="right" className="w-36 bg-zinc-900 border-zinc-800 text-zinc-350">
                      <DropdownMenuItem 
                        onClick={() => onTogglePin(session.id)} 
                        className="flex items-center gap-2 text-xs py-1.5 focus:bg-zinc-850 focus:text-zinc-100 cursor-pointer"
                      >
                        <Pin className="h-3.5 w-3.5" />
                        <span>{session.isPinned ? "Unpin" : "Pin"}</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleStartRename(session)} 
                        className="flex items-center gap-2 text-xs py-1.5 focus:bg-zinc-850 focus:text-zinc-100 cursor-pointer"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                        <span>Rename</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => onDeleteSession(session.id)} 
                        className="flex items-center gap-2 text-xs py-1.5 text-red-400 focus:bg-red-950/20 focus:text-red-300 cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>Delete</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </SidebarMenuItem>
              ))}
              {sortedSessions.length === 0 && (
                <div className="px-4 py-8 text-center text-xs text-zinc-600 group-data-[collapsible=icon]:hidden">
                  No chats found.
                </div>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-2 mt-auto border-t border-zinc-850/50">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={onOpenMemory}
              tooltip="Memory"
              className="w-full justify-start gap-2 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/30 rounded-lg cursor-pointer"
            >
              <Brain className="h-4 w-4 shrink-0" />
              <span className="group-data-[collapsible=icon]:hidden text-xs">Memory</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Settings"
              className="w-full justify-start gap-2 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/30 rounded-lg"
            >
              <Settings className="h-4 w-4 shrink-0" />
              <span className="group-data-[collapsible=icon]:hidden text-xs">Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
