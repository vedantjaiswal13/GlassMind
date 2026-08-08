/**
 * Module 2 — "Where this information came from"
 *
 * Replaces the constellation graph with beautiful, readable source cards.
 * Each card shows: document title, how many parts of the answer it supported,
 * reliability score, and upload date.
 *
 * Hovering a card highlights connected answer sentences (via sync store).
 * Zero technical jargon — no "chunks", "embeddings", "vectors", or "similarity".
 */

"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  FileText,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Quote,
  Calendar,
} from "lucide-react";

import {
  useSyncHoverActions,
} from "@/hooks/use-sync-highlight";

interface SourceDocument {
  id: string;
  title: string;
  filename: string;
  uploadDate: string;
  reliability: number;
  citationsInAnswer: number;
  usedInAnswer: boolean;
  supportDescription: string;
  status: "strong" | "conflicting" | "partial";
  excerpts: string[];
}

const SOURCE_DOCUMENTS: SourceDocument[] = [
  {
    id: "doc-1",
    title: "GlassMind Technical Specification",
    filename: "GlassMind_Spec.pdf",
    uploadDate: "Aug 2, 2026",
    reliability: 96,
    citationsInAnswer: 4,
    usedInAnswer: true,
    supportDescription: "This document supported four parts of the answer, including the core architecture and reasoning pipeline details.",
    status: "strong",
    excerpts: [
      "FastAPI handles API routing and multi-agent execution.",
      "The reasoning pipeline uses a multi-stage verification process.",
      "Documents are indexed and matched against incoming queries.",
      "Final answers include inline citations back to source material.",
    ],
  },
  {
    id: "doc-2",
    title: "Explainable AI Benchmark Report",
    filename: "XAI_Benchmark.pdf",
    uploadDate: "Jul 28, 2026",
    reliability: 88,
    citationsInAnswer: 2,
    usedInAnswer: true,
    supportDescription: "This report confirmed two key claims and provided supporting benchmark data.",
    status: "strong",
    excerpts: [
      "Scenario testing validates reasoning stability under different conditions.",
      "Confidence scoring improves with multi-source verification.",
    ],
  },
  {
    id: "doc-3",
    title: "Legacy Architecture Notes (2024)",
    filename: "Legacy_Notes_2024.pdf",
    uploadDate: "Mar 15, 2024",
    reliability: 62,
    citationsInAnswer: 0,
    usedInAnswer: false,
    supportDescription: "This older document contained conflicting information and was given less importance because it was outdated.",
    status: "conflicting",
    excerpts: [
      "Used a different processing approach that has since been replaced.",
    ],
  },
];

function SourceCard({ doc, index }: { doc: SourceDocument; index: number }) {
  const { dispatchHover, dispatchClear } = useSyncHoverActions();
  const [isExpanded, setIsExpanded] = React.useState(false);

  const handleMouseEnter = React.useCallback(() => {
    dispatchHover({ origin: "evidence", targetType: "source", targetId: doc.id });
  }, [dispatchHover, doc.id]);

  const handleMouseLeave = React.useCallback(() => {
    dispatchClear("evidence");
  }, [dispatchClear]);

  const statusConfig = {
    strong: {
      badge: "Used in answer",
      badgeBg: "bg-[#F0FDF4]",
      badgeBorder: "border-[#16A34A]/20",
      badgeText: "text-[#16A34A]",
      icon: CheckCircle2,
      iconColor: "text-[#16A34A]",
    },
    conflicting: {
      badge: "Conflicting — less weight given",
      badgeBg: "bg-[#FFFBEB]",
      badgeBorder: "border-[#D97706]/20",
      badgeText: "text-[#D97706]",
      icon: AlertTriangle,
      iconColor: "text-[#D97706]",
    },
    partial: {
      badge: "Partially used",
      badgeBg: "bg-[#F3F5F7]",
      badgeBorder: "border-[#9CA3AF]/20",
      badgeText: "text-[#6B7280]",
      icon: CheckCircle2,
      iconColor: "text-[#6B7280]",
    },
  }[doc.status];

  const StatusIcon = statusConfig.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.3 }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="rounded-2xl border border-[#E5E7EB] bg-[#FFFFFF] p-4 shadow-2xs hover:shadow-xs hover:border-[#4F46E5]/30 transition-all cursor-pointer"
    >
      {/* Top row: icon, title, status badge */}
      <div className="flex items-start justify-between gap-3 mb-2.5">
        <div className="flex items-start gap-3">
          <div className="flex size-9 items-center justify-center rounded-xl bg-[#EEF2FF] border border-[#4F46E5]/15 shrink-0">
            <FileText className="size-4 text-[#4F46E5]" />
          </div>
          <div>
            <h4 className="text-[13px] font-semibold text-[#111827] leading-tight">
              {doc.title}
            </h4>
            <p className="text-[11px] text-[#9CA3AF] mt-0.5">{doc.filename}</p>
          </div>
        </div>

        <div className={`flex items-center gap-1 rounded-lg ${statusConfig.badgeBg} border ${statusConfig.badgeBorder} px-2 py-0.5 text-[10px] font-semibold ${statusConfig.badgeText} whitespace-nowrap shrink-0`}>
          <StatusIcon className="size-3" />
          <span>{statusConfig.badge}</span>
        </div>
      </div>

      {/* Human description */}
      <p className="text-[12px] text-[#6B7280] leading-relaxed mb-3">
        {doc.supportDescription}
      </p>

      {/* Metrics row */}
      <div className="flex items-center gap-3 text-[11px] mb-3">
        {doc.citationsInAnswer > 0 && (
          <div className="flex items-center gap-1 rounded-lg bg-[#EEF2FF] px-2 py-1 text-[#4F46E5] font-medium">
            <Quote className="size-3" />
            <span>{doc.citationsInAnswer} citation{doc.citationsInAnswer !== 1 ? "s" : ""} in answer</span>
          </div>
        )}
        <div className="flex items-center gap-1 rounded-lg bg-[#F3F5F7] px-2 py-1 text-[#6B7280]">
          <Calendar className="size-3 text-[#9CA3AF]" />
          <span>{doc.uploadDate}</span>
        </div>
        <div className="ml-auto flex items-center gap-1.5 text-[#6B7280]">
          <span>Reliability</span>
          <span className={`font-bold font-mono ${doc.reliability >= 80 ? "text-[#16A34A]" : doc.reliability >= 60 ? "text-[#D97706]" : "text-[#EF4444]"}`}>
            {doc.reliability}%
          </span>
        </div>
      </div>

      {/* Expandable excerpts */}
      {doc.excerpts.length > 0 && (
        <div>
          <button
            onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
            className="text-[11px] font-medium text-[#4F46E5] hover:text-[#4338CA] transition-colors"
          >
            {isExpanded ? "Hide excerpts ▲" : `Show ${doc.excerpts.length} excerpt${doc.excerpts.length !== 1 ? "s" : ""} ▼`}
          </button>

          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-2 space-y-1.5"
            >
              {doc.excerpts.map((excerpt, i) => (
                <div key={i} className="flex items-start gap-2 rounded-lg bg-[#FCFCFD] border border-[#E5E7EB] px-3 py-2 text-[11px] text-[#374151] leading-relaxed">
                  <Quote className="size-3 text-[#9CA3AF] shrink-0 mt-0.5" />
                  <span>{excerpt}</span>
                </div>
              ))}
            </motion.div>
          )}
        </div>
      )}
    </motion.div>
  );
}

export function EvidenceGalaxy() {
  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center gap-2.5">
        <div className="flex size-8 items-center justify-center rounded-2xl bg-[#EEF2FF] text-[#4F46E5] border border-[#4F46E5]/20">
          <BookOpen className="size-4" />
        </div>
        <div>
          <h3 className="text-[13px] font-bold text-[#111827]">
            📚 Where this information came from
          </h3>
          <p className="text-[11px] text-[#6B7280]">
            Every part of the answer is traceable to your uploaded documents.
          </p>
        </div>
      </div>

      {/* Source Cards */}
      <div className="space-y-3">
        {SOURCE_DOCUMENTS.map((doc, index) => (
          <SourceCard key={doc.id} doc={doc} index={index} />
        ))}
      </div>
    </div>
  );
}
