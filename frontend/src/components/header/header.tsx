/**
 * Header Component — Linear & Apple Inspired Light Header
 *
 * Reduced height, zero clutter.
 * Contains GlassMind Logo, Active Conversation Title, Demo Mode Toggle, and Sources Trigger.
 */

"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { PanelLeft, Sparkles, Layers, Play, Square } from "lucide-react";

import { useAppStore } from "@/store/app-store";
import { useDemoStore } from "@/store/demo-store";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export function Header() {
  const {
    sidebarOpen,
    toggleSidebar,
    sourcesPanelOpen,
    toggleSourcesPanel,
    activeConversationTitle,
    documents,
  } = useAppStore();

  const isDemoMode = useDemoStore((s) => s.isDemoMode);
  const isStreaming = useAppStore((s) => s.isStreaming);
  const startDemo = useDemoStore((s) => s.startDemo);
  const stopDemo = useDemoStore((s) => s.stopDemo);

  return (
    <header className="sticky top-0 z-30 flex h-12 w-full items-center justify-between border-b border-[#E5E7EB] bg-[#F7F8FA] px-4 select-none">
      {/* Left: Sidebar Toggle & GlassMind Logo */}
      <div className="flex items-center gap-3">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={toggleSidebar}
                className="text-[#6B7280] hover:bg-[#F3F5F7] hover:text-[#111827] rounded-md"
                aria-label={sidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
              >
                <PanelLeft className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs bg-[#111827] text-white">
              {sidebarOpen ? "Hide Sidebar" : "Show Sidebar"}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <div className="flex items-center gap-2">
          <motion.div
            animate={{ scale: [1, 1.1, 1], opacity: [0.9, 1, 0.9] }}
            transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut" }}
            className="flex size-5.5 items-center justify-center rounded-md bg-[#4F46E5] text-white shadow-xs"
          >
            <Sparkles className="size-3" />
          </motion.div>
          <span className="text-sm font-bold tracking-tight text-[#111827]">
            GlassMind
          </span>
        </div>
      </div>

      {/* Middle: Conversation Title */}
      <div className="mx-4 flex max-w-md flex-1 items-center justify-center overflow-hidden">
        <motion.h1
          key={activeConversationTitle}
          initial={{ opacity: 0, y: -2 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.18 }}
          className="truncate text-xs font-medium text-[#6B7280]"
        >
          {activeConversationTitle || "New Conversation"}
        </motion.h1>
      </div>

      {/* Right: Demo Mode + Sources Button */}
      <div className="flex items-center gap-1.5">
        {/* Demo Mode Toggle */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.95 }}
                onClick={isDemoMode ? stopDemo : startDemo}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 h-8 text-xs font-medium transition-all border ${
                  isDemoMode
                    ? "bg-[#4F46E5] text-white border-[#4F46E5] shadow-md shadow-[#4F46E5]/25"
                    : "bg-white text-[#6B7280] border-[#E5E7EB] hover:border-[#4F46E5]/40 hover:text-[#4F46E5] hover:bg-[#EEF2FF]/50"
                }`}
                aria-label={isDemoMode ? "Exit Demo Mode" : "Start Demo Mode"}
              >
                {isDemoMode ? (
                  <>
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                    >
                      <Square className="size-3" />
                    </motion.div>
                    <span className="hidden sm:inline">Stop Demo</span>
                  </>
                ) : (
                  <>
                    <Play className="size-3" />
                    <span className="hidden sm:inline">Demo Mode</span>
                  </>
                )}
              </motion.button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs bg-[#111827] text-white">
              {isDemoMode ? "Exit guided demo experience" : "Start guided demo for judges"}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Sources Button */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={sourcesPanelOpen ? "secondary" : "ghost"}
                size="sm"
                onClick={toggleSourcesPanel}
                className={`gap-1.5 rounded-lg px-2.5 h-8 text-xs transition-all ${
                  sourcesPanelOpen
                    ? "bg-[#FFFFFF] text-[#111827] border border-[#E5E7EB] shadow-xs font-medium"
                    : "text-[#6B7280] hover:bg-[#F3F5F7] hover:text-[#111827]"
                }`}
              >
                <Layers className="size-3.5" />
                <span className="hidden sm:inline font-medium">Sources</span>
                {documents.length > 0 && (
                  <span className="flex size-4 items-center justify-center rounded-full bg-[#EEF2FF] text-[10px] font-semibold text-[#4F46E5]">
                    {documents.length}
                  </span>
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" align="end" className="text-xs bg-[#111827] text-white">
              Sources & Grounding Drawer
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </header>
  );
}

