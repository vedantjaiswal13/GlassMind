/**
 * Module 6 — "How confidence improved"
 *
 * Replaces the SVG line chart with an animated vertical milestone journey.
 * Each milestone: stage name, confidence %, visual progress bar, human explanation.
 * Staggered entrance animations. Zero chart complexity.
 */

"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  MessageCircle,
  Search,
  ShieldCheck,
  Scale,
  Sparkles,
  ArrowDown,
} from "lucide-react";

interface Milestone {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  stage: string;
  confidence: number;
  explanation: string;
}

const MILESTONES: Milestone[] = [
  {
    id: "planning",
    icon: MessageCircle,
    stage: "Understood your question",
    confidence: 20,
    explanation: "Started with a baseline understanding of what you were asking.",
  },
  {
    id: "found",
    icon: Search,
    stage: "Found relevant sources",
    confidence: 62,
    explanation: "Confidence jumped after finding 16 matching sections in your documents.",
  },
  {
    id: "verified",
    icon: ShieldCheck,
    stage: "Verified source reliability",
    confidence: 84,
    explanation: "Confirmed that the sources were recent, credible, and consistent with each other.",
  },
  {
    id: "compared",
    icon: Scale,
    stage: "Compared evidence across sources",
    confidence: 92,
    explanation: "Cross-referencing showed strong agreement — 14 out of 16 sections reached the same conclusion.",
  },
  {
    id: "final",
    icon: Sparkles,
    stage: "Generated final answer",
    confidence: 96,
    explanation: "Applied final checks and composed the response using only verified information.",
  },
];

function MilestoneCard({ milestone, index, prevConfidence }: { milestone: Milestone; index: number; prevConfidence: number }) {
  const Icon = milestone.icon;
  const isLast = index === MILESTONES.length - 1;
  const gain = milestone.confidence - prevConfidence;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.12, duration: 0.35, ease: "easeOut" }}
      className="relative flex gap-4"
    >
      {/* Vertical connector */}
      {!isLast && (
        <div className="absolute left-[19px] top-[48px] bottom-[-8px] w-px bg-gradient-to-b from-[#4F46E5]/25 to-[#4F46E5]/8" />
      )}

      {/* Icon */}
      <div className="relative z-10 shrink-0">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: index * 0.12 + 0.1, type: "spring", stiffness: 400, damping: 20 }}
          className={`flex size-10 items-center justify-center rounded-2xl border shadow-xs ${
            isLast
              ? "bg-[#F0FDF4] border-[#16A34A]/25 text-[#16A34A]"
              : "bg-[#EEF2FF] border-[#4F46E5]/20 text-[#4F46E5]"
          }`}
        >
          <Icon className="size-4.5" />
        </motion.div>
      </div>

      {/* Content */}
      <div className="flex-1 pb-5">
        <div className="rounded-2xl border border-[#E5E7EB] bg-[#FFFFFF] p-4 shadow-2xs hover:shadow-xs transition-shadow">
          {/* Title + confidence */}
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-[13px] font-semibold text-[#111827]">
              {milestone.stage}
            </h4>
            <div className="flex items-center gap-2">
              {gain > 0 && (
                <span className="text-[10px] font-semibold text-[#16A34A] bg-[#F0FDF4] px-1.5 py-0.5 rounded font-mono">
                  +{gain}%
                </span>
              )}
              <span className={`text-sm font-bold font-mono ${isLast ? "text-[#16A34A]" : "text-[#4F46E5]"}`}>
                {milestone.confidence}%
              </span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-2.5 w-full rounded-full bg-[#F3F5F7] overflow-hidden mb-2.5">
            <motion.div
              className={`h-full rounded-full ${isLast ? "bg-[#16A34A]" : "bg-[#4F46E5]"}`}
              initial={{ width: 0 }}
              animate={{ width: `${milestone.confidence}%` }}
              transition={{ delay: index * 0.12 + 0.15, duration: 0.5, ease: "easeOut" }}
            />
          </div>

          {/* Human explanation */}
          <p className="text-[12px] text-[#6B7280] leading-relaxed">
            {milestone.explanation}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export function ConfidenceEvolution() {
  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center gap-2.5">
        <div className="flex size-8 items-center justify-center rounded-2xl bg-[#EEF2FF] text-[#4F46E5] border border-[#4F46E5]/20">
          <TrendingUp className="size-4" />
        </div>
        <div>
          <h3 className="text-[13px] font-bold text-[#111827]">
            📈 How confidence improved
          </h3>
          <p className="text-[11px] text-[#6B7280]">
            Watch how each step made the AI more confident in its answer.
          </p>
        </div>
      </div>

      {/* Summary bar */}
      <div className="flex items-center justify-between rounded-xl bg-gradient-to-r from-[#EEF2FF] to-[#F0FDF4] border border-[#E5E7EB] px-4 py-2.5 text-[12px]">
        <span className="text-[#6B7280]">
          Confidence grew from <span className="font-bold text-[#4F46E5] font-mono">20%</span> to{" "}
          <span className="font-bold text-[#16A34A] font-mono">96%</span> across 5 stages
        </span>
        <div className="flex items-center gap-1 text-[#16A34A] font-semibold">
          <TrendingUp className="size-3.5" />
          <span className="font-mono">+76%</span>
        </div>
      </div>

      {/* Milestone Journey */}
      <div className="pl-0.5">
        {MILESTONES.map((milestone, index) => (
          <MilestoneCard
            key={milestone.id}
            milestone={milestone}
            index={index}
            prevConfidence={index === 0 ? 0 : MILESTONES[index - 1].confidence}
          />
        ))}
      </div>
    </div>
  );
}
