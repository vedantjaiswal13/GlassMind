/**
 * Conversation View Component — Editorial Reading Column
 *
 * Max width 960px reading column with generous whitespace and 8px grid alignment.
 */

"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight, ShieldCheck, Cpu, GitBranch } from "lucide-react";

import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageItem, Message } from "@/components/chat/message-item";

interface ConversationViewProps {
  messages: Message[];
  onSelectPrompt?: (prompt: string) => void;
}

const STARTER_PROMPTS = [
  {
    icon: ShieldCheck,
    title: "Healthcare Intelligence",
    description: "Detailed cellular overview, grounding evidence, and medical trust context.",
    prompt: "What is cancer?",
  },
  {
    icon: GitBranch,
    title: "Financial Intelligence",
    description: "Passive index tracking, expense ratios, and asset risk analysis.",
    prompt: "What is an index fund?",
  },
  {
    icon: Cpu,
    title: "Legal Intelligence",
    description: "Contractual obligations, material vs minor breach, and legal remedies.",
    prompt: "What does breach of contract mean?",
  },
];

export function ConversationView({
  messages,
  onSelectPrompt,
}: ConversationViewProps) {
  const isEmpty = messages.length === 0;

  return (
    <ScrollArea className="flex-1 w-full h-full">
      <div className="mx-auto flex min-h-[calc(100vh-12rem)] max-w-[960px] flex-col justify-between px-8 py-8">
        {isEmpty ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="my-auto flex flex-col items-center justify-center text-center py-12"
          >
            <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-[#EEF2FF] text-[#4F46E5] border border-[#4F46E5]/20 shadow-xs">
              <Sparkles className="size-7 text-[#4F46E5]" />
            </div>

            <h2 className="text-2xl font-bold mb-2 text-[#111827]">
              Welcome to GlassMind
            </h2>
            <p className="max-w-md text-sm text-[#4B5563] font-medium leading-relaxed mb-6">
              &ldquo;AI that explains itself.&rdquo; Verifiable, transparent AI assistant designed for non-technical human understanding.
            </p>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
              <button
                onClick={() => {
                  const uploadBtn = document.querySelector<HTMLButtonElement>("button:has(svg), [aria-label*='upload']");
                  if (uploadBtn) uploadBtn.click();
                }}
                className="flex items-center gap-2 rounded-xl bg-[#4F46E5] px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#4338CA] transition-all"
              >
                <span>Upload Document</span>
              </button>
              <button
                onClick={() => onSelectPrompt?.("What are the key findings in our uploaded spec documents?")}
                className="flex items-center gap-2 rounded-xl border border-[#E5E7EB] bg-[#FFFFFF] px-4 py-2 text-xs font-semibold text-[#374151] shadow-2xs hover:bg-[#F9FAFB] transition-all"
              >
                <span>Try Demo</span>
              </button>
              <button
                onClick={() => {
                  const input = document.querySelector<HTMLInputElement>("input[placeholder*='Ask']");
                  if (input) input.focus();
                }}
                className="flex items-center gap-2 rounded-xl border border-[#E5E7EB] bg-[#FFFFFF] px-4 py-2 text-xs font-semibold text-[#374151] shadow-2xs hover:bg-[#F9FAFB] transition-all"
              >
                <span>Ask a Question</span>
              </button>
            </div>

            <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-3">
              {STARTER_PROMPTS.map((starter, idx) => {
                const Icon = starter.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => onSelectPrompt?.(starter.prompt)}
                    className="group flex flex-col items-start text-left rounded-2xl border border-[#E5E7EB] bg-[#FFFFFF] p-5 transition-all duration-200 hover:border-[#4F46E5]/40 hover:bg-[#FCFCFD] hover:shadow-sm outline-none cursor-pointer"
                  >
                    <div className="mb-3 flex size-8 items-center justify-center rounded-xl bg-[#F3F5F7] text-[#111827] group-hover:bg-[#4F46E5] group-hover:text-white transition-colors">
                      <Icon className="size-4" />
                    </div>
                    <span className="text-sm font-semibold text-[#111827] mb-1 group-hover:text-[#4F46E5] transition-colors">
                      {starter.title}
                    </span>
                    <p className="text-xs text-[#6B7280] leading-relaxed line-clamp-2">
                      {starter.description}
                    </p>
                    <div className="mt-4 flex items-center gap-1 text-xs font-medium text-[#6B7280] group-hover:text-[#4F46E5]">
                      <span>Try prompt</span>
                      <ArrowRight className="size-3 transition-transform group-hover:translate-x-1" />
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.div>
        ) : (
          <div className="flex flex-col space-y-6">
            {messages.map((msg) => (
              <MessageItem key={msg.id} message={msg} />
            ))}
          </div>
        )}
      </div>
    </ScrollArea>
  );
}
