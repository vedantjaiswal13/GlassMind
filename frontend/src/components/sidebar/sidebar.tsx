/**
 * Left Sidebar Component — Apple & Linear Inspired Floating Navigation
 *
 * Soft background #FCFCFD, subtle border #E5E7EB.
 * Active item with left accent bar #4F46E5, soft background #F3F5F7, medium font weight.
 */

"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Search,
  MessageSquare,
  FileText,
  User,
  LogOut,
  Sliders,
  Sparkles,
  FolderOpen,
  Settings,
} from "lucide-react";

import { useAppStore } from "@/store/app-store";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SearchModal } from "@/components/sidebar/search-modal";

export function Sidebar() {
  const {
    sidebarOpen,
    sidebarWidth,
    setSidebarWidth,
    conversations,
    documents,
    activeConversationId,
    setActiveConversation,
    addConversation,
    setSearchModalOpen,
  } = useAppStore();

  const [isResizing, setIsResizing] = React.useState(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);

    const handleMouseMove = (moveEvent: MouseEvent) => {
      setSidebarWidth(moveEvent.clientX);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  return (
    <>
      <SearchModal />

      <AnimatePresence initial={false}>
        {sidebarOpen && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: sidebarWidth, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 280, damping: 26 }}
            style={{ width: sidebarWidth }}
            className="relative flex h-full flex-col border-r border-[#E5E7EB] bg-[#FCFCFD] text-[#111827] select-none"
          >
            {/* Top Brand Logo & New Chat Action */}
            <div className="flex flex-col gap-2.5 p-3.5 pb-2">
              <div className="flex items-center gap-2.5 px-1 py-1">
                <div className="flex size-7 items-center justify-center rounded-xl bg-[#4F46E5] text-white shadow-xs">
                  <Sparkles className="size-4" />
                </div>
                <span className="text-sm font-bold tracking-tight text-[#111827]">
                  GlassMind
                </span>
                <span className="ml-auto rounded-md bg-[#EEF2FF] px-1.5 py-0.5 text-[9px] font-bold text-[#4F46E5] uppercase">
                  XAI OS
                </span>
              </div>

              <Button
                variant="outline"
                size="md"
                onClick={() => addConversation("New Conversation")}
                className="w-full justify-start gap-2.5 rounded-xl border-[#E5E7EB] bg-[#FFFFFF] text-[#111827] hover:bg-[#EEF2FF]/60 hover:border-[#4F46E5]/40 shadow-2xs transition-all h-9"
              >
                <Plus className="size-3.5 text-[#4F46E5]" />
                <span className="text-xs font-semibold tracking-tight">New Chat</span>
              </Button>

              {/* Demo Mode & Run Full Demo Button */}
              <div className="flex flex-col gap-1.5 p-2 rounded-xl border border-[#EEF2FF] bg-[#F4F5FF]">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#4F46E5] flex items-center gap-1.5">
                    <Sparkles className="size-3.5" />
                    <span>Presentation Demo Mode</span>
                  </span>
                  <input
                    type="checkbox"
                    className="size-4 accent-[#4F46E5] cursor-pointer"
                    onChange={(e) => {
                      const enabled = e.target.checked;
                      if (enabled) {
                        // Preload sample conversations and preloaded docs
                        useAppStore.setState({
                          documents: [
                            { id: "d-1", name: "WHO Diabetes Guidelines.pdf", size: "3.2 MB", type: "application/pdf", uploadedAt: "Aug 2026", groundingStatus: "Verified", evidenceChunks: 8, citationCount: 6, similarityScore: 0.94 },
                            { id: "d-2", name: "Indian Rental Rights Guide.pdf", size: "2.1 MB", type: "application/pdf", uploadedAt: "Aug 2026", groundingStatus: "Verified", evidenceChunks: 5, citationCount: 4, similarityScore: 0.91 },
                            { id: "d-3", name: "RBI Investment Handbook.pdf", size: "4.5 MB", type: "application/pdf", uploadedAt: "Aug 2026", groundingStatus: "Verified", evidenceChunks: 7, citationCount: 5, similarityScore: 0.89 },
                          ]
                        });
                      }
                    }}
                  />
                </div>

                <Button
                  size="sm"
                  onClick={() => {
                    // Trigger custom end-to-end demo event on window
                    window.dispatchEvent(new CustomEvent("run-full-glassmind-demo"));
                  }}
                  className="w-full h-7 text-[11px] bg-[#4F46E5] hover:bg-[#4338CA] text-white font-semibold rounded-lg shadow-2xs gap-1.5"
                >
                  <Sparkles className="size-3" />
                  <span>Run Full Demo</span>
                </Button>
              </div>

              <button
                onClick={() => setSearchModalOpen(true)}
                className="flex w-full items-center justify-between rounded-xl border border-[#E5E7EB] bg-[#FFFFFF] px-3 py-1.5 text-xs text-[#6B7280] hover:bg-[#F3F5F7] hover:text-[#111827] transition-all outline-none"
              >
                <span className="flex items-center gap-2">
                  <Search className="size-3.5 text-[#9CA3AF]" />
                  <span>Search...</span>
                </span>
                <kbd className="rounded bg-[#F3F5F7] px-1.5 py-0.5 text-[10px] font-mono text-[#6B7280] border border-[#E5E7EB]">
                  ⌘K
                </kbd>
              </button>
            </div>

            <Separator className="my-1 bg-[#E5E7EB]" />

            {/* Scrollable Navigation Sections */}
            <ScrollArea className="flex-1 min-h-0 px-2.5 py-2">
              {/* Recent Conversations */}
              <div className="mb-6">
                <div className="mb-2 flex items-center justify-between px-2 text-[10px] font-semibold tracking-widest text-[#9CA3AF] uppercase">
                  <span>Recent Conversations</span>
                  <span className="text-[10px] font-mono text-[#9CA3AF]">
                    {conversations.length}
                  </span>
                </div>
                <div className="flex flex-col gap-0.5">
                  {conversations.map((conv) => {
                    const isActive = conv.id === activeConversationId;
                    return (
                      <button
                        key={conv.id}
                        onClick={() => setActiveConversation(conv.id, conv.title)}
                        className={`group relative flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-xs transition-all duration-150 ${
                          isActive
                            ? "bg-[#F3F5F7] font-semibold text-[#111827]"
                            : "text-[#6B7280] hover:bg-[#F3F5F7]/70 hover:text-[#111827]"
                        }`}
                      >
                        {isActive && (
                          <motion.div
                            layoutId="linear-active-bar"
                            className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-[#4F46E5]"
                            transition={{ type: "spring", stiffness: 300, damping: 28 }}
                          />
                        )}
                        <MessageSquare
                          className={`size-3.5 shrink-0 transition-colors ${
                            isActive ? "text-[#4F46E5]" : "text-[#9CA3AF] group-hover:text-[#6B7280]"
                          }`}
                        />
                        <span className="truncate flex-1">{conv.title}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Uploaded Knowledge Base Documents */}
              <div className="mb-4">
                <div className="mb-2 flex items-center justify-between px-2 text-[10px] font-semibold tracking-widest text-[#9CA3AF] uppercase">
                  <span className="flex items-center gap-1.5">
                    <FolderOpen className="size-3" />
                    <span>Uploaded Documents</span>
                  </span>
                </div>
                <div className="flex flex-col gap-0.5">
                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center gap-2.5 rounded-xl px-2.5 py-1.5 text-xs text-[#6B7280] hover:bg-[#F3F5F7] hover:text-[#111827] transition-colors cursor-pointer"
                    >
                      <FileText className="size-3.5 shrink-0 text-[#4F46E5]" />
                      <span className="truncate flex-1">{doc.name}</span>
                      <span className="text-[9px] font-mono text-[#9CA3AF]">
                        {doc.size}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollArea>

            <Separator className="bg-[#E5E7EB]" />

            {/* User Profile & Settings Footer */}
            <div className="p-2.5">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex w-full items-center gap-3 rounded-xl p-2 text-left transition-colors duration-150 hover:bg-[#F3F5F7] outline-none">
                    <Avatar size="sm" className="border border-[#E5E7EB]">
                      <AvatarImage src="/avatar-placeholder.jpg" alt="User" />
                      <AvatarFallback className="bg-[#EEF2FF] text-[#4F46E5] text-xs font-bold">
                        VJ
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-1 flex-col overflow-hidden">
                      <span className="truncate text-xs font-semibold text-[#111827]">
                        Vedant Jaiswal
                      </span>
                      <span className="truncate text-[10px] text-[#6B7280]">
                        Pro • OpenAI GPT-4o
                      </span>
                    </div>
                    <Settings className="size-3.5 text-[#9CA3AF]" />
                  </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="start" className="w-56 bg-[#FFFFFF] border-[#E5E7EB] text-[#111827]">
                  <DropdownMenuLabel className="text-[#6B7280]">Account Settings</DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-[#E5E7EB]" />
                  <DropdownMenuItem className="gap-2 text-xs focus:bg-[#F3F5F7]">
                    <User className="size-3.5" />
                    <span>Profile Preferences</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="gap-2 text-xs focus:bg-[#F3F5F7]">
                    <Sliders className="size-3.5" />
                    <span>Model Parameters</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="gap-2 text-xs focus:bg-[#F3F5F7]">
                    <Sparkles className="size-3.5 text-[#4F46E5]" />
                    <span>SHAP Explainability</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-[#E5E7EB]" />
                  <DropdownMenuItem className="gap-2 text-xs text-[#DC2626] focus:bg-[#FEF2F2] focus:text-[#DC2626]">
                    <LogOut className="size-3.5" />
                    <span>Log Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Resize Handle */}
            <div
              onMouseDown={handleMouseDown}
              className={`absolute top-0 right-0 h-full w-1 cursor-col-resize hover:bg-[#4F46E5]/30 transition-colors ${
                isResizing ? "bg-[#4F46E5]/50" : "bg-transparent"
              }`}
            />
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
