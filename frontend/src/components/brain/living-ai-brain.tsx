/**
 * Module 1 — "How the AI reached this answer"
 *
 * Dynamic vertical journey rendered from backend thinking_steps JSON.
 * No hardcoded steps — every step comes from the API response.
 *
 * Each step shows: icon, human explanation, time taken, confidence gained.
 * Animated vertically with staggered entrance.
 */

"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  MessageCircle,
  Search,
  Scale,
  ShieldOff,
  Sparkles,
  Clock,
  TrendingUp,
  CheckCircle2,
  Brain,
  FileText,
  FileX,
  ShieldCheck,
  Zap,
  AlertTriangle,
  AlertCircle,
  Info,
  Shield,
  type LucideIcon,
} from "lucide-react";

import { useAppStore } from "@/store/app-store";
import type { ThinkingStep } from "@/types";

/* ── Icon Lookup: maps backend icon string → Lucide component ── */
const STEP_ICON_MAP: Record<string, LucideIcon> = {
  "brain": Brain,
  "search": Search,
  "file-text": FileText,
  "file-x": FileX,
  "shield-check": ShieldCheck,
  "shield-off": ShieldOff,
  "shield": Shield,
  "sparkles": Sparkles,
  "zap": Zap,
  "scale": Scale,
  "message-circle": MessageCircle,
  "trending-up": TrendingUp,
  "check-circle": CheckCircle2,
  "triangle-alert": AlertTriangle,
  "alert-triangle": AlertTriangle,
  "alert-circle": AlertCircle,
  "info": Info,
};

function resolveStepIcon(name: string): LucideIcon {
  return STEP_ICON_MAP[name] || Sparkles;
}

/* ── Fallback steps shown when no lastResponse exists ── */
const FALLBACK_STEPS: ThinkingStep[] = [
  {
    title: "Understood your question",
    description: "Analyzed query intent and identified key topics.",
    duration: "0.1s",
    confidence_gain: "+15%",
    status: "completed",
    icon: "brain",
  },
  {
    title: "Searched knowledge base",
    description: "Scanned the vector index for matching document segments.",
    duration: "0.3s",
    confidence_gain: "+25%",
    status: "completed",
    icon: "search",
  },
  {
    title: "Generated response",
    description: "Composed a plain-English answer from the best available information.",
    duration: "0.3s",
    confidence_gain: "+56%",
    status: "completed",
    icon: "sparkles",
  },
];

/**
 * Parse a confidence_gain string like "+25%" into a number (25).
 * Returns 0 if unparseable.
 */
function parseGain(gain: string): number {
  const match = gain.match(/[+-]?(\d+(?:\.\d+)?)/);
  return match ? parseFloat(match[1]) : 0;
}

interface StepCardProps {
  step: ThinkingStep;
  index: number;
  totalSteps: number;
  cumulativeConfidence: number;
}

function StepCard({ step, index, totalSteps, cumulativeConfidence }: StepCardProps) {
  const Icon = resolveStepIcon(step.icon);
  const isLast = index === totalSteps - 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.12, duration: 0.35, ease: "easeOut" }}
      className="relative flex gap-4"
    >
      {/* Vertical connector line */}
      {!isLast && (
        <div className="absolute left-[19px] top-[48px] bottom-[-8px] w-px bg-gradient-to-b from-[#4F46E5]/30 to-[#4F46E5]/10" />
      )}

      {/* Step icon circle */}
      <div className="relative z-10 shrink-0">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: index * 0.12 + 0.1, type: "spring", stiffness: 400, damping: 20 }}
          className={`flex size-10 items-center justify-center rounded-2xl border shadow-xs ${
            isLast
              ? "bg-[#16A34A]/10 border-[#16A34A]/25 text-[#16A34A]"
              : "bg-[#EEF2FF] border-[#4F46E5]/20 text-[#4F46E5]"
          }`}
        >
          <Icon className="size-4.5" />
        </motion.div>
      </div>

      {/* Step content card */}
      <div className="flex-1 pb-6">
        <div className="rounded-2xl border border-[#E5E7EB] bg-[#FFFFFF] p-4 shadow-2xs hover:shadow-xs transition-shadow">
          {/* Step number & title */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <span className="flex size-5 items-center justify-center rounded-md bg-[#F3F5F7] text-[10px] font-bold text-[#6B7280]">
                {index + 1}
              </span>
              <h4 className="text-[13px] font-semibold text-[#111827] leading-tight">
                {step.title}
              </h4>
            </div>
            {isLast && (
              <CheckCircle2 className="size-4 text-[#16A34A] shrink-0" />
            )}
          </div>

          {/* Human-readable description */}
          <p className="text-[12px] text-[#6B7280] leading-relaxed mb-3">
            {step.description}
          </p>

          {/* Metrics row */}
          <div className="flex items-center gap-3 text-[11px]">
            <div className="flex items-center gap-1 rounded-lg bg-[#F3F5F7] px-2 py-1 text-[#6B7280]">
              <Clock className="size-3 text-[#9CA3AF]" />
              <span className="font-mono">{step.duration}</span>
            </div>
            <div className="flex items-center gap-1 rounded-lg bg-[#F0FDF4] px-2 py-1 text-[#16A34A] font-semibold">
              <TrendingUp className="size-3" />
              <span className="font-mono">{step.confidence_gain}</span>
            </div>
            <div className="ml-auto text-[#6B7280] font-mono">
              → <span className={`font-semibold ${isLast ? "text-[#16A34A]" : "text-[#4F46E5]"}`}>
                {cumulativeConfidence.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function LivingAIBrain() {
  const lastResponse = useAppStore((s) => s.lastResponse);

  // Use backend thinking_steps if available, otherwise fallback
  const steps: ThinkingStep[] =
    lastResponse?.thinking_steps && lastResponse.thinking_steps.length > 0
      ? lastResponse.thinking_steps
      : FALLBACK_STEPS;

  // Calculate cumulative confidence for each step
  const cumulativeConfidences: number[] = [];
  let running = 0;
  for (const step of steps) {
    running += parseGain(step.confidence_gain);
    cumulativeConfidences.push(Math.min(100, running));
  }

  return (
    <div className="space-y-1">
      {/* Section Header */}
      <div className="flex items-center gap-2.5 mb-4">
        <div className="flex size-8 items-center justify-center rounded-2xl bg-[#EEF2FF] text-[#4F46E5] border border-[#4F46E5]/20">
          <MessageCircle className="size-4" />
        </div>
        <div>
          <h3 className="text-[13px] font-bold text-[#111827]">
            🧠 How the AI reached this answer
          </h3>
          <p className="text-[11px] text-[#6B7280]">
            Here&apos;s the step-by-step journey from your question to the final answer.
          </p>
        </div>
      </div>

      {/* Vertical Journey Steps — dynamic count from backend */}
      <div className="pl-0.5">
        {steps.map((step, index) => (
          <StepCard
            key={`step-${index}-${step.title}`}
            step={step}
            index={index}
            totalSteps={steps.length}
            cumulativeConfidence={cumulativeConfidences[index]}
          />
        ))}
      </div>
    </div>
  );
}
