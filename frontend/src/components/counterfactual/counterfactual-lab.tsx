/**
 * Module 5 — "What would change this answer"
 *
 * Replaces the technical Counterfactual Lab with simple, human comparison cards.
 * Each card shows a plain-English scenario, confidence change, and reason.
 * No "perturbation", "retrieval threshold", "SHAP", or "vector" vocabulary.
 */

"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  ArrowLeftRight,
  ArrowDown,
  FileX,
  CalendarPlus,
  ShieldOff,
  AlertTriangle,
} from "lucide-react";

interface ScenarioCard {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  scenario: string;
  confidenceBefore: number;
  confidenceAfter: number;
  reason: string;
  severity: "high" | "medium" | "low";
}

const SCENARIOS: ScenarioCard[] = [
  {
    id: "remove-primary",
    icon: FileX,
    scenario: "Without the Technical Specification document",
    confidenceBefore: 96,
    confidenceAfter: 72,
    reason: "Most supporting evidence came from this document. Without it, the answer would lose its strongest foundation.",
    severity: "high",
  },
  {
    id: "newer-research",
    icon: CalendarPlus,
    scenario: "If newer research becomes available",
    confidenceBefore: 96,
    confidenceAfter: 89,
    reason: "New information could update or refine some parts of the conclusion, but the core answer would likely remain similar.",
    severity: "medium",
  },
  {
    id: "skip-verification",
    icon: ShieldOff,
    scenario: "If reliability checks were disabled",
    confidenceBefore: 96,
    confidenceAfter: 52,
    reason: "Without checking sources against each other, there's no way to catch conflicting or unreliable information.",
    severity: "high",
  },
];

function ComparisonCard({ card, index }: { card: ScenarioCard; index: number }) {
  const Icon = card.icon;
  const drop = card.confidenceBefore - card.confidenceAfter;

  const severityConfig = {
    high: {
      dropColor: "text-[#EF4444]",
      dropBg: "bg-[#FEF2F2]",
      dropBorder: "border-[#EF4444]/20",
      barColor: "bg-[#EF4444]",
    },
    medium: {
      dropColor: "text-[#D97706]",
      dropBg: "bg-[#FFFBEB]",
      dropBorder: "border-[#D97706]/20",
      barColor: "bg-[#D97706]",
    },
    low: {
      dropColor: "text-[#6B7280]",
      dropBg: "bg-[#F3F5F7]",
      dropBorder: "border-[#E5E7EB]",
      barColor: "bg-[#9CA3AF]",
    },
  }[card.severity];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.3 }}
      className="rounded-2xl border border-[#E5E7EB] bg-[#FFFFFF] p-4 shadow-2xs hover:shadow-xs transition-all"
    >
      {/* Scenario title */}
      <div className="flex items-start gap-3 mb-3">
        <div className={`flex size-9 items-center justify-center rounded-xl ${severityConfig.dropBg} border ${severityConfig.dropBorder} shrink-0`}>
          <Icon className={`size-4 ${severityConfig.dropColor}`} />
        </div>
        <div>
          <h4 className="text-[13px] font-semibold text-[#111827] leading-tight">
            {card.scenario}
          </h4>
        </div>
      </div>

      {/* Confidence comparison */}
      <div className="flex items-center gap-3 mb-3 rounded-xl bg-[#FCFCFD] border border-[#E5E7EB] p-3">
        <div className="flex-1 text-center">
          <p className="text-[10px] text-[#9CA3AF] font-medium mb-1">Current confidence</p>
          <div className="flex items-center justify-center gap-1.5">
            <div className="h-2 w-full rounded-full bg-[#E5E7EB] overflow-hidden">
              <div className="h-full rounded-full bg-[#16A34A]" style={{ width: `${card.confidenceBefore}%` }} />
            </div>
            <span className="text-sm font-bold font-mono text-[#16A34A] shrink-0 w-10 text-right">
              {card.confidenceBefore}%
            </span>
          </div>
        </div>

        <ArrowDown className={`size-4 ${severityConfig.dropColor} shrink-0`} />

        <div className="flex-1 text-center">
          <p className="text-[10px] text-[#9CA3AF] font-medium mb-1">Would become</p>
          <div className="flex items-center justify-center gap-1.5">
            <div className="h-2 w-full rounded-full bg-[#E5E7EB] overflow-hidden">
              <div className={`h-full rounded-full ${severityConfig.barColor}`} style={{ width: `${card.confidenceAfter}%` }} />
            </div>
            <span className={`text-sm font-bold font-mono ${severityConfig.dropColor} shrink-0 w-10 text-right`}>
              {card.confidenceAfter}%
            </span>
          </div>
        </div>
      </div>

      {/* Drop badge */}
      <div className={`inline-flex items-center gap-1.5 rounded-lg ${severityConfig.dropBg} border ${severityConfig.dropBorder} px-2.5 py-1 text-[11px] font-semibold ${severityConfig.dropColor} mb-3`}>
        <AlertTriangle className="size-3" />
        <span>{drop} percentage point drop</span>
      </div>

      {/* Human reason */}
      <p className="text-[12px] text-[#6B7280] leading-relaxed">
        {card.reason}
      </p>
    </motion.div>
  );
}

export function CounterfactualLab() {
  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center gap-2.5">
        <div className="flex size-8 items-center justify-center rounded-2xl bg-[#EEF2FF] text-[#4F46E5] border border-[#4F46E5]/20">
          <ArrowLeftRight className="size-4" />
        </div>
        <div>
          <h3 className="text-[13px] font-bold text-[#111827]">
            🔄 What would change this answer
          </h3>
          <p className="text-[11px] text-[#6B7280]">
            See how removing sources or changing conditions would affect the answer's reliability.
          </p>
        </div>
      </div>

      {/* Comparison Cards */}
      <div className="space-y-3">
        {SCENARIOS.map((card, index) => (
          <ComparisonCard key={card.id} card={card} index={index} />
        ))}
      </div>
    </div>
  );
}
