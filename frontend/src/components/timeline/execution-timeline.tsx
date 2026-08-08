/**
 * Module 4 — "What happened behind the scenes"
 *
 * Replaces technical execution rows with a beautiful human-language timeline.
 * Each event uses icons and conversational language:
 * "Read your question" → "Found relevant documents" → etc.
 */

"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  Clock,
  MessageCircle,
  Search,
  FileCheck2,
  Scale,
  ShieldOff,
  Sparkles,
  CheckCircle2,
} from "lucide-react";

interface TimelineEvent {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  time: string;
  action: string;
  detail: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

const TIMELINE_EVENTS: TimelineEvent[] = [
  {
    id: "read",
    icon: MessageCircle,
    time: "0.0s",
    action: "Read your question",
    detail: "Identified the main topic, keywords, and intent behind what you asked.",
    color: "text-[#4F46E5]",
    bgColor: "bg-[#EEF2FF]",
    borderColor: "border-[#4F46E5]/20",
  },
  {
    id: "found",
    icon: Search,
    time: "0.1s",
    action: "Found relevant documents",
    detail: "Searched your uploaded files and found 16 relevant sections across 2 documents.",
    color: "text-[#4F46E5]",
    bgColor: "bg-[#EEF2FF]",
    borderColor: "border-[#4F46E5]/20",
  },
  {
    id: "matched",
    icon: FileCheck2,
    time: "0.3s",
    action: "Matched information to your question",
    detail: "Ranked and selected the most relevant sections based on how closely they matched your question.",
    color: "text-[#4F46E5]",
    bgColor: "bg-[#EEF2FF]",
    borderColor: "border-[#4F46E5]/20",
  },
  {
    id: "compared",
    icon: Scale,
    time: "0.5s",
    action: "Compared information across sources",
    detail: "Cross-referenced 14 agreeing sections and identified 2 conflicting ones from older sources.",
    color: "text-[#4F46E5]",
    bgColor: "bg-[#EEF2FF]",
    borderColor: "border-[#4F46E5]/20",
  },
  {
    id: "filtered",
    icon: ShieldOff,
    time: "0.7s",
    action: "Removed conflicting evidence",
    detail: "Reduced the weight of 2 older sections that disagreed with the majority of recent sources.",
    color: "text-[#D97706]",
    bgColor: "bg-[#FFFBEB]",
    borderColor: "border-[#D97706]/20",
  },
  {
    id: "generated",
    icon: Sparkles,
    time: "0.9s",
    action: "Generated final response",
    detail: "Composed the answer using only verified information and added citations to the original sources.",
    color: "text-[#16A34A]",
    bgColor: "bg-[#F0FDF4]",
    borderColor: "border-[#16A34A]/20",
  },
];

export function ExecutionTimeline() {
  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center gap-2.5">
        <div className="flex size-8 items-center justify-center rounded-2xl bg-[#EEF2FF] text-[#4F46E5] border border-[#4F46E5]/20">
          <Clock className="size-4" />
        </div>
        <div>
          <h3 className="text-[13px] font-bold text-[#111827]">
            ⏱ What happened behind the scenes
          </h3>
          <p className="text-[11px] text-[#6B7280]">
            A second-by-second view of how your answer was created.
          </p>
        </div>
      </div>

      {/* Total time summary */}
      <div className="flex items-center gap-2 rounded-xl bg-[#F3F5F7] border border-[#E5E7EB] px-4 py-2.5 text-[12px]">
        <Clock className="size-3.5 text-[#9CA3AF]" />
        <span className="text-[#6B7280]">Total time:</span>
        <span className="font-bold text-[#111827] font-mono">0.9 seconds</span>
        <span className="text-[#9CA3AF]">•</span>
        <span className="text-[#6B7280]">6 steps completed</span>
        <CheckCircle2 className="size-3.5 text-[#16A34A] ml-auto" />
      </div>

      {/* Timeline Events */}
      <div className="relative pl-1">
        {TIMELINE_EVENTS.map((event, index) => {
          const Icon = event.icon;
          const isLast = index === TIMELINE_EVENTS.length - 1;

          return (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
              className="relative flex gap-4 pb-1"
            >
              {/* Vertical connector */}
              {!isLast && (
                <div className="absolute left-[19px] top-[44px] bottom-[-4px] w-px bg-gradient-to-b from-[#E5E7EB] to-[#E5E7EB]/40" />
              )}

              {/* Time badge + Icon */}
              <div className="relative z-10 shrink-0 flex flex-col items-center gap-1">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.1 + 0.05, type: "spring", stiffness: 400, damping: 20 }}
                  className={`flex size-10 items-center justify-center rounded-2xl ${event.bgColor} border ${event.borderColor}`}
                >
                  <Icon className={`size-4.5 ${event.color}`} />
                </motion.div>
              </div>

              {/* Content */}
              <div className="flex-1 pb-5">
                <div className="rounded-2xl border border-[#E5E7EB] bg-[#FFFFFF] p-3.5 shadow-2xs hover:shadow-xs transition-shadow">
                  <div className="flex items-center justify-between mb-1.5">
                    <h4 className="text-[13px] font-semibold text-[#111827]">
                      {event.action}
                    </h4>
                    <span className="text-[11px] font-mono text-[#9CA3AF] bg-[#F3F5F7] px-2 py-0.5 rounded-md">
                      {event.time}
                    </span>
                  </div>
                  <p className="text-[12px] text-[#6B7280] leading-relaxed">
                    {event.detail}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
