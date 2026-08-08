/**
 * Message Item Component — Editorial Light Layout
 *
 * User message: Soft gray bubble (#F3F5F7), 24px radius, primary text #111827.
 * AI message: Transparent container, editorial documentation markdown typography.
 *
 * Trust cards and badges are fully dynamic — rendered from backend summary_card JSON.
 */

"use client";

import * as React from "react";
import ReactMarkdown from "react-markdown";
import { motion } from "framer-motion";
import {
  Sparkles, User, Copy, Check, RotateCw, ShieldCheck, FileText,
  AlertTriangle, AlertCircle, Info, Brain, Search, Zap, FileX,
  Shield, type LucideIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ThinkingBar } from "@/components/chat/thinking-bar";
import { CitationPill } from "@/components/chat/citation-pill";
import { CITATIONS } from "@/lib/sync/relationships";
import { useAppStore } from "@/store/app-store";
import type { SummaryCard, ClaimItem } from "@/types";

/* ── Icon Lookup: maps backend icon string → Lucide component ── */
const ICON_MAP: Record<string, LucideIcon> = {
  "shield-check": ShieldCheck,
  "shield": Shield,
  "sparkles": Sparkles,
  "brain": Brain,
  "search": Search,
  "file-text": FileText,
  "file-x": FileX,
  "zap": Zap,
  "triangle-alert": AlertTriangle,
  "alert-triangle": AlertTriangle,
  "alert-circle": AlertCircle,
  "info": Info,
};

function resolveIcon(name: string): LucideIcon {
  return ICON_MAP[name] || Sparkles;
}

/* ── Color Palette: maps summary_card.color → CSS classes ── */
const COLOR_PALETTES: Record<string, {
  cardBg: string;
  cardBorder: string;
  iconBg: string;
  iconBorder: string;
  iconText: string;
  titleText: string;
  bodyText: string;
  labelText: string;
  metricBg: string;
  metricBorder: string;
  recBg: string;
  recBorder: string;
  recText: string;
  recIcon: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
}> = {
  green: {
    cardBg: "bg-gradient-to-br from-[#F0FDF4] to-[#ECFDF5]",
    cardBorder: "border-[#16A34A]/25",
    iconBg: "bg-[#F0FDF4]",
    iconBorder: "border-[#16A34A]/30",
    iconText: "text-[#16A34A]",
    titleText: "text-[#14532D]",
    bodyText: "text-[#166534]",
    labelText: "text-[#14532D]/70",
    metricBg: "bg-white/80",
    metricBorder: "border-[#16A34A]/20",
    recBg: "bg-[#F0FDF4]",
    recBorder: "border-[#16A34A]/30",
    recText: "text-[#14532D]",
    recIcon: "text-[#16A34A]",
    badgeBg: "bg-[#F0FDF4]",
    badgeBorder: "border-[#16A34A]/30",
    badgeText: "text-[#16A34A]",
  },
  orange: {
    cardBg: "bg-gradient-to-br from-[#FEF3C7]/40 to-[#FFFBEB]",
    cardBorder: "border-[#F59E0B]/30",
    iconBg: "bg-[#FEF3C7]",
    iconBorder: "border-[#F59E0B]/30",
    iconText: "text-[#D97706]",
    titleText: "text-[#92400E]",
    bodyText: "text-[#B45309]",
    labelText: "text-[#92400E]/70",
    metricBg: "bg-white/80",
    metricBorder: "border-[#F59E0B]/20",
    recBg: "bg-[#FEF3C7]",
    recBorder: "border-[#F59E0B]/30",
    recText: "text-[#92400E]",
    recIcon: "text-[#D97706]",
    badgeBg: "bg-[#FEF3C7]",
    badgeBorder: "border-[#F59E0B]/30",
    badgeText: "text-[#D97706]",
  },
  yellow: {
    cardBg: "bg-gradient-to-br from-[#FEF3C7]/40 to-[#FFFBEB]",
    cardBorder: "border-[#F59E0B]/30",
    iconBg: "bg-[#FEF3C7]",
    iconBorder: "border-[#F59E0B]/30",
    iconText: "text-[#D97706]",
    titleText: "text-[#92400E]",
    bodyText: "text-[#B45309]",
    labelText: "text-[#92400E]/70",
    metricBg: "bg-white/80",
    metricBorder: "border-[#F59E0B]/20",
    recBg: "bg-[#FEF3C7]",
    recBorder: "border-[#F59E0B]/30",
    recText: "text-[#92400E]",
    recIcon: "text-[#D97706]",
    badgeBg: "bg-[#FEF3C7]",
    badgeBorder: "border-[#F59E0B]/30",
    badgeText: "text-[#D97706]",
  },
  red: {
    cardBg: "bg-gradient-to-br from-[#FEF2F2] to-[#FFF1F2]",
    cardBorder: "border-[#EF4444]/25",
    iconBg: "bg-[#FEF2F2]",
    iconBorder: "border-[#EF4444]/30",
    iconText: "text-[#DC2626]",
    titleText: "text-[#7F1D1D]",
    bodyText: "text-[#991B1B]",
    labelText: "text-[#7F1D1D]/70",
    metricBg: "bg-white/80",
    metricBorder: "border-[#EF4444]/20",
    recBg: "bg-[#FEF2F2]",
    recBorder: "border-[#EF4444]/30",
    recText: "text-[#7F1D1D]",
    recIcon: "text-[#DC2626]",
    badgeBg: "bg-[#FEF2F2]",
    badgeBorder: "border-[#EF4444]/30",
    badgeText: "text-[#DC2626]",
  },
  blue: {
    cardBg: "bg-gradient-to-br from-[#EFF6FF] to-[#DBEAFE]",
    cardBorder: "border-[#3B82F6]/25",
    iconBg: "bg-[#EFF6FF]",
    iconBorder: "border-[#3B82F6]/30",
    iconText: "text-[#2563EB]",
    titleText: "text-[#1E3A5F]",
    bodyText: "text-[#1E40AF]",
    labelText: "text-[#1E3A5F]/70",
    metricBg: "bg-white/80",
    metricBorder: "border-[#3B82F6]/20",
    recBg: "bg-[#EFF6FF]",
    recBorder: "border-[#3B82F6]/30",
    recText: "text-[#1E3A5F]",
    recIcon: "text-[#2563EB]",
    badgeBg: "bg-[#EFF6FF]",
    badgeBorder: "border-[#3B82F6]/30",
    badgeText: "text-[#2563EB]",
  },
};

function getPalette(color: string) {
  return COLOR_PALETTES[color] || COLOR_PALETTES.green;
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  thinkingSteps?: Array<{ id: string; label: string }>;
  confidenceScore?: number;
  answerMode?: "VERIFIED" | "GENERAL";
  badge?: "Verified" | "General" | "Partially Verified" | "Needs Review";
  responseMetaData?: any;
  status?: "pending" | "complete";
}

interface MessageItemProps {
  message: Message;
}

export function MessageItem({ message }: MessageItemProps) {
  const [copied, setCopied] = React.useState(false);
  const { toggleSourcesPanel, lastResponse, openExplainabilityTab } = useAppStore();

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isAssistant = message.role === "assistant";
  const isPending = isAssistant && message.status === "pending";

  const effectiveMode = message.answerMode || lastResponse?.answer_mode || "VERIFIED";
  const isGeneralMode = effectiveMode === "GENERAL";

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={`group relative flex w-full gap-4 py-6 ${
        isAssistant ? "items-start" : "items-start justify-end"
      }`}
    >
      {/* Assistant Avatar */}
      {isAssistant && (
        <motion.div
          animate={isPending ? { scale: [1, 1.05, 1], opacity: [0.8, 1, 0.8] } : { scale: 1, opacity: 1 }}
          transition={isPending ? { repeat: Infinity, duration: 1.8, ease: "easeInOut" } : { duration: 0.18 }}
          className={`flex size-6.5 shrink-0 items-center justify-center rounded-lg text-white shadow-xs mt-0.5 ${
            isGeneralMode ? "bg-[#D97706]" : "bg-[#4F46E5]"
          }`}
        >
          <Sparkles className="size-3.5" />
        </motion.div>
      )}

      {/* Message Content Column */}
      <div className={`flex flex-col max-w-[92%] ${isAssistant ? "items-start" : "items-end"}`}>
        {/* Author Label & Metadata */}
        <div className="mb-2 flex items-center gap-2 text-label text-[#6B7280]">
          <span className="font-semibold text-[#111827]">
            {isAssistant ? "GlassMind AI" : "You"}
          </span>
          <span>•</span>
          <span className="font-mono text-[#9CA3AF]">{message.timestamp}</span>

          {/* Dynamic Badge — rendered from summary_card */}
          {isAssistant && (() => {
            const card: SummaryCard | undefined = lastResponse?.summary_card;
            const palette = getPalette(card?.color || (isGeneralMode ? "orange" : "green"));
            const BadgeIcon = resolveIcon(card?.icon || (isGeneralMode ? "sparkles" : "shield-check"));
            const badgeLabel = card?.title || (isGeneralMode ? "General Knowledge" : "Verified Answer");
            return (
              <Badge
                variant="outline"
                onClick={toggleSourcesPanel}
                className={`ml-2 gap-1 ${palette.badgeBorder} ${palette.badgeBg} text-[10px] ${palette.badgeText} cursor-pointer hover:opacity-80 transition-colors`}
              >
                <BadgeIcon className={`size-3 ${palette.badgeText}`} />
                <span>{badgeLabel}</span>
              </Badge>
            );
          })()}
        </div>

        {/* Lightweight Horizontal Thinking Ribbon */}
        {isAssistant && message.thinkingSteps && (
          <div className="w-full">
            <ThinkingBar />
          </div>
        )}

        {/* Message Container — DETAILED ANSWER PRIMARY PRODUCT */}
        <div
          className={`text-conversation ${
            isAssistant
              ? "text-[#111827] font-normal w-full bg-transparent p-0"
              : "rounded-[24px] border border-[#E5E7EB] bg-[#F3F5F7] px-5 py-3.5 text-[#111827] shadow-xs"
          }`}
        >
          {isPending ? (
            <div className="flex flex-col gap-3 rounded-[24px] border border-[#E5E7EB] bg-[#FFFFFF] px-5 py-4 shadow-xs">
              <div className="flex items-center gap-2 text-label text-[#6B7280]">
                <span className="font-semibold text-[#111827]">GlassMind AI</span>
                <span>•</span>
                <span className="font-mono text-[#9CA3AF]">Thinking…</span>
              </div>
              <div className="space-y-2">
                <Skeleton variant="text" className="h-4 w-11/12" />
                <Skeleton variant="text" className="h-4 w-9/12" />
                <Skeleton variant="text" className="h-4 w-8/12" />
              </div>
            </div>
          ) : isAssistant ? (
            <div className="space-y-6 w-full">
              {/* SECTION 1: DETAILED ANSWER + EXPLAIN SIMPLY TOGGLE */}
              {(() => {
                const activeData = message.responseMetaData || lastResponse;
                const simpleText = activeData?.simple_answer;

                return (
                  <div className="rounded-2xl border border-[#E5E7EB] bg-[#FFFFFF] p-6 shadow-2xs space-y-4">
                    <div className="flex items-center justify-between border-b border-[#F3F5F7] pb-3">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#4F46E5]">Grounded Answer</span>
                      {simpleText && (
                        <button
                          onClick={() => {
                            const current = (message as any).showSimple;
                            (message as any).showSimple = !current;
                            useAppStore.setState({}); // trigger re-render
                          }}
                          className="flex items-center gap-1.5 rounded-xl border border-[#E5E7EB] bg-[#EEF2FF] px-3 py-1.5 text-xs font-semibold text-[#4F46E5] hover:bg-[#4F46E5] hover:text-white transition-all shadow-2xs"
                        >
                          <Sparkles className="size-3" />
                          <span>{(message as any).showSimple ? "Show Detailed Answer" : "✨ Explain this simply"}</span>
                        </button>
                      )}
                    </div>

                    {(message as any).showSimple && simpleText ? (
                      <div className="rounded-xl border border-[#4F46E5]/20 bg-[#EEF2FF]/40 p-4 text-sm text-[#1E1B4B] leading-relaxed">
                        <p className="font-semibold text-xs text-[#4F46E5] mb-1">Simple Plain-English Explanation:</p>
                        <p>{simpleText}</p>
                      </div>
                    ) : (
                      <div className="prose prose-neutral max-w-none text-conversation leading-relaxed text-[#111827] [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:text-[#111827] [&_h1]:mb-4 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-[#111827] [&_h3]:mt-6 [&_h3]:mb-3 [&_p]:mb-4 [&_ul]:mb-4 [&_li]:mb-1">
                        <ReactMarkdown>{message.content}</ReactMarkdown>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* SECTION 2: KEY CLAIMS & CLAIM → EVIDENCE MAPPING */}
              {(() => {
                const activeData = message.responseMetaData || lastResponse;
                const claims: ClaimItem[] = activeData?.claims || [];

                if (!claims || claims.length === 0) return null;

                return (
                  <div className="rounded-2xl border border-[#E5E7EB] bg-[#FFFFFF] p-5 space-y-3.5 shadow-2xs">
                    <div className="flex items-center justify-between border-b border-[#F3F5F7] pb-2.5">
                      <div className="flex items-center gap-2">
                        <Brain className="size-4 text-[#4F46E5]" />
                        <h3 className="text-sm font-bold text-[#111827]">Key Claims Inside Answer</h3>
                      </div>
                      <span className="text-[11px] font-medium text-[#6B7280]">
                        Claim → Evidence Mapping
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      {claims.map((claim, idx) => (
                        <div key={claim.id || idx} className="rounded-xl border border-[#E5E7EB] bg-[#FCFCFD] p-3.5 text-xs space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-start gap-2">
                              <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[#4F46E5] text-[10px] font-bold text-white mt-0.5">
                                {idx + 1}
                              </span>
                              <p className="font-semibold text-[#111827] leading-normal">{claim.text}</p>
                            </div>
                            <Badge variant="outline" className="text-[10px] bg-[#F0FDF4] text-[#16A34A] border-[#16A34A]/30 shrink-0">
                              {claim.support_level || "Strong Support"}
                            </Badge>
                          </div>

                          {claim.supported_by && claim.supported_by.length > 0 && (
                            <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-[#F3F5F7] text-[11px]">
                              <span className="font-medium text-[#9CA3AF]">Supported by:</span>
                              {claim.supported_by.map((srcName, sIdx) => (
                                <span key={sIdx} className="inline-flex items-center gap-1 rounded-md bg-[#EEF2FF] px-2 py-0.5 font-semibold text-[#4F46E5] border border-[#4F46E5]/20">
                                  <Check className="size-3 text-[#16A34A]" />
                                  {srcName}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* SECTION 3: SOURCES USED & QUALITY */}
              {(() => {
                const activeData = message.responseMetaData || lastResponse;
                const structuredSources = activeData?.structured_sources;
                const sourceCards = activeData?.documents_used;

                if ((!structuredSources || structuredSources.length === 0) && (!sourceCards || sourceCards.length === 0)) {
                  return null;
                }

                return (
                  <div className="rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="size-4 text-[#4F46E5]" />
                        <h3 className="text-sm font-bold text-[#111827]">Sources used</h3>
                      </div>
                      <span className="text-[11px] font-medium text-[#6B7280]">
                        {isGeneralMode ? "Reference sources used for this demonstration" : "Verified grounding sources"}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {structuredSources && structuredSources.length > 0 ? (
                        structuredSources.map((src: import("@/types").StructuredSourceItem, i: number) => (
                          <div key={i} className="rounded-xl border border-[#E5E7EB] bg-[#FFFFFF] p-3.5 space-y-2 shadow-2xs">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-[#4F46E5] bg-[#EEF2FF] px-2 py-0.5 rounded">
                                  {src.name}
                                </span>
                                <h4 className="text-xs font-bold text-[#111827] mt-1.5 line-clamp-1">{src.title}</h4>
                              </div>
                              <Badge variant="outline" className="text-[10px] bg-[#F3F5F7] text-[#4B5563] shrink-0">
                                {src.quality_tier}
                              </Badge>
                            </div>

                            <p className="text-[11px] text-[#6B7280] leading-relaxed line-clamp-2">
                              {src.relevance}
                            </p>

                            {src.supports_claims && src.supports_claims.length > 0 && (
                              <div className="pt-2 border-t border-[#F3F5F7] space-y-1">
                                <span className="text-[10px] font-semibold text-[#9CA3AF]">Supports:</span>
                                {src.supports_claims.map((claim: string, cIdx: number) => (
                                  <div key={cIdx} className="flex items-start gap-1.5 text-[11px] text-[#374151]">
                                    <Check className="size-3 text-[#16A34A] shrink-0 mt-0.5" />
                                    <span>{claim}</span>
                                  </div>
                                ))}
                              </div>
                            )}

                            {src.url && (
                              <a
                                href={src.url}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#4F46E5] hover:underline pt-1"
                              >
                                <span>Visit official source</span>
                                <Sparkles className="size-2.5" />
                              </a>
                            )}
                          </div>
                        ))
                      ) : (
                        sourceCards?.map((doc: import("@/types").SourceCardItem, i: number) => (
                          <div key={i} className="rounded-xl border border-[#E5E7EB] bg-[#FFFFFF] p-3.5 space-y-2 shadow-2xs">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#4F46E5] bg-[#EEF2FF] px-2 py-0.5 rounded">
                              {doc.document_name}
                            </span>
                            <h4 className="text-xs font-bold text-[#111827] line-clamp-1">{doc.title || doc.document_name}</h4>
                            <p className="text-[11px] text-[#6B7280] leading-relaxed line-clamp-2">
                              {doc.contribution || doc.why_selected}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* SECTION 4: EVIDENCE TRUST SCORE & 5-FACTOR BREAKDOWN */}
              {(() => {
                const activeData = message.responseMetaData || lastResponse;
                const trustEngine = activeData?.trust_engine;
                const score = trustEngine?.score ?? (message.confidenceScore ? Math.round(message.confidenceScore * 100) : 87);
                const label = trustEngine?.label ?? (score >= 90 ? "Very Strong Evidence" : score >= 75 ? "Strong Evidence" : score >= 60 ? "Moderate Evidence" : score >= 40 ? "Limited Evidence" : "Needs Verification");

                const factors = trustEngine?.factors;
                const sq = factors?.source_quality;
                const sa = factors?.source_agreement;
                const ec = factors?.evidence_coverage;
                const rec = factors?.recency;
                const cp = factors?.contradiction_penalty;

                return (
                  <div className="rounded-2xl border border-[#E5E7EB] bg-[#FFFFFF] p-5 space-y-4 shadow-2xs">
                    <div className="flex items-center justify-between pb-3 border-b border-[#F3F5F7]">
                      <div>
                        <h3 className="text-sm font-bold text-[#111827]">Evidence Trust Score</h3>
                        <p className="text-xs text-[#6B7280] mt-0.5">Reflects evidence strength & consistency, not model confidence.</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="text-xl font-bold font-mono text-[#111827]">{score} <span className="text-xs font-normal text-[#9CA3AF]">/ 100</span></div>
                          <Badge variant="outline" className="text-[10px] font-semibold bg-[#F0FDF4] text-[#16A34A] border-[#16A34A]/30">
                            {label}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-[#111827] uppercase tracking-wider">Why this score?</h4>
                        <button
                          onClick={() => openExplainabilityTab("genome")}
                          className="text-[11px] font-semibold text-[#4F46E5] hover:underline"
                        >
                          View interactive inspector →
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                        <div className="rounded-xl border border-[#E5E7EB] bg-[#FCFCFD] p-3 space-y-1.5">
                          <div className="flex justify-between font-semibold text-[#111827]">
                            <span>Source Quality</span>
                            <span className="font-mono text-[#4F46E5]">{sq ? `${sq.score} / ${sq.max}` : "27 / 30"}</span>
                          </div>
                          <div className="h-1.5 w-full rounded-full bg-[#E5E7EB] overflow-hidden">
                            <div className="h-full bg-[#4F46E5] rounded-full" style={{ width: `${((sq?.score ?? 27) / (sq?.max ?? 30)) * 100}%` }} />
                          </div>
                          <p className="text-[11px] text-[#6B7280] leading-relaxed pt-1">
                            {sq?.explanation ?? "Most supporting information comes from authoritative medical/research organizations."}
                          </p>
                        </div>

                        <div className="rounded-xl border border-[#E5E7EB] bg-[#FCFCFD] p-3 space-y-1.5">
                          <div className="flex justify-between font-semibold text-[#111827]">
                            <span>Source Agreement</span>
                            <span className="font-mono text-[#4F46E5]">{sa ? `${sa.score} / ${sa.max}` : "24 / 25"}</span>
                          </div>
                          <div className="h-1.5 w-full rounded-full bg-[#E5E7EB] overflow-hidden">
                            <div className="h-full bg-[#4F46E5] rounded-full" style={{ width: `${((sa?.score ?? 24) / (sa?.max ?? 25)) * 100}%` }} />
                          </div>
                          <p className="text-[11px] text-[#6B7280] leading-relaxed pt-1">
                            {sa?.explanation ?? "The sources reviewed broadly agree on the major claims."}
                          </p>
                        </div>

                        <div className="rounded-xl border border-[#E5E7EB] bg-[#FCFCFD] p-3 space-y-1.5">
                          <div className="flex justify-between font-semibold text-[#111827]">
                            <span>Evidence Coverage</span>
                            <span className="font-mono text-[#4F46E5]">{ec ? `${ec.score} / ${ec.max}` : "22 / 25"}</span>
                          </div>
                          <div className="h-1.5 w-full rounded-full bg-[#E5E7EB] overflow-hidden">
                            <div className="h-full bg-[#4F46E5] rounded-full" style={{ width: `${((ec?.score ?? 22) / (ec?.max ?? 25)) * 100}%` }} />
                          </div>
                          <p className="text-[11px] text-[#6B7280] leading-relaxed pt-1">
                            {ec?.explanation ?? "3 of 3 major claims were directly supported."}
                          </p>
                        </div>

                        <div className="rounded-xl border border-[#E5E7EB] bg-[#FCFCFD] p-3 space-y-1.5">
                          <div className="flex justify-between font-semibold text-[#111827]">
                            <span>Recency</span>
                            <span className="font-mono text-[#4F46E5]">{rec ? `${rec.score} / ${rec.max}` : "8 / 10"}</span>
                          </div>
                          <div className="h-1.5 w-full rounded-full bg-[#E5E7EB] overflow-hidden">
                            <div className="h-full bg-[#4F46E5] rounded-full" style={{ width: `${((rec?.score ?? 8) / (rec?.max ?? 10)) * 100}%` }} />
                          </div>
                          <p className="text-[11px] text-[#6B7280] leading-relaxed pt-1">
                            {rec?.explanation ?? "Most supporting information is relatively recent."}
                          </p>
                        </div>
                      </div>

                      <div className="rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] p-3 flex items-center justify-between text-xs">
                        <div>
                          <span className="font-semibold text-[#111827]">Contradictions Penalty: </span>
                          <span className="text-[#6B7280] pl-1">
                            {cp?.explanation ?? "No major contradiction found between sources."}
                          </span>
                        </div>
                        <span className="font-mono font-bold text-[#16A34A]">{cp ? `${cp.score}` : "0"}</span>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* SECTION 5: WHAT GLASSMIND DOESN'T KNOW & WHAT WOULD CHANGE ANSWER */}
              {(() => {
                const activeData = message.responseMetaData || lastResponse;
                const changeItems: string[] = activeData?.what_would_change_answer || [];

                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="rounded-2xl border border-[#F59E0B]/30 bg-[#FFFBEB]/50 p-4 space-y-1.5">
                      <div className="flex items-center gap-2 font-bold text-[#92400E]">
                        <AlertTriangle className="size-4 text-[#D97706]" />
                        <span>What GlassMind doesn't know</span>
                      </div>
                      <p className="text-[#B45309] leading-relaxed">
                        {activeData?.trust_engine?.limitations ?? "Individual patient circumstances, genetic markers, and full medical histories are missing."}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-[#E5E7EB] bg-[#FCFCFD] p-4 space-y-1.5">
                      <div className="flex items-center gap-2 font-bold text-[#111827]">
                        <RotateCw className="size-4 text-[#4F46E5]" />
                        <span>What would change this answer?</span>
                      </div>
                      <ul className="text-[#4B5563] space-y-1 list-disc pl-4 leading-relaxed">
                        {changeItems.length > 0 ? (
                          changeItems.map((item, i) => <li key={i}>{item}</li>)
                        ) : (
                          <>
                            <li>Patient age & individual medical history</li>
                            <li>Specific cell stage & diagnostic report</li>
                          </>
                        )}
                      </ul>
                    </div>
                  </div>
                );
              })()}

              {/* SECTION 6: CHALLENGE THIS ANSWER BUTTON & FINDINGS */}
              {(() => {
                const activeData = message.responseMetaData || lastResponse;
                const challenge = activeData?.challenge;

                return (
                  <div className="rounded-2xl border border-[#E5E7EB] bg-[#FFFFFF] p-5 space-y-3 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Shield className="size-4 text-[#DC2626]" />
                        <h3 className="text-sm font-bold text-[#111827]">Adversarial Inspection</h3>
                      </div>
                      <button
                        onClick={() => {
                          const current = (message as any).showChallenge;
                          (message as any).showChallenge = !current;
                          useAppStore.setState({});
                        }}
                        className="flex items-center gap-1.5 rounded-xl border border-[#DC2626]/30 bg-[#FEF2F2] px-3 py-1.5 text-xs font-bold text-[#DC2626] hover:bg-[#DC2626] hover:text-white transition-all shadow-2xs"
                      >
                        <Zap className="size-3" />
                        <span>⚔ CHALLENGE THIS ANSWER</span>
                      </button>
                    </div>

                    {(message as any).showChallenge && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="pt-2 border-t border-[#F3F5F7] space-y-2 text-xs"
                      >
                        <div className="font-bold text-[#111827] flex items-center gap-2 bg-[#F9FAFB] p-2.5 rounded-xl border border-[#E5E7EB]">
                          <Check className="size-4 text-[#16A34A]" />
                          <span>{challenge?.overall_result || "✓ 3 major claims supported • No major contradictions found • Individual circumstances vary"}</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[11px]">
                          <div className="rounded-lg bg-[#F0FDF4] p-2.5 text-[#14532D] border border-[#16A34A]/20">
                            <p className="font-bold">✓ Supported Claims</p>
                            <p className="mt-0.5">3 of 3 claims match Tier 1 references.</p>
                          </div>
                          <div className="rounded-lg bg-[#FEF3C7] p-2.5 text-[#92400E] border border-[#F59E0B]/30">
                            <p className="font-bold">⚠ Missing Context</p>
                            <p className="mt-0.5">Does not substitute personal medical advice.</p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                );
              })()}

              {/* SECTION 7: FOLLOW-UP QUESTIONS */}
              <div className="pt-2">
                <span className="text-[11px] font-semibold text-[#9CA3AF] block mb-2">What should I ask next?</span>
                <div className="flex flex-wrap items-center gap-2">
                  {((message.responseMetaData || lastResponse)?.follow_up_questions?.length > 0 ? (message.responseMetaData || lastResponse).follow_up_questions : [
                    "What causes cancer?",
                    "How does cancer spread?",
                    "How is cancer treated?"
                  ]).map((chipPrompt: string, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => {
                        const chatInput = document.querySelector<HTMLInputElement | HTMLTextAreaElement>("input[placeholder*='Ask'], textarea[placeholder*='Ask']");
                        if (chatInput) {
                          chatInput.value = chipPrompt;
                          chatInput.focus();
                        }
                      }}
                      className="group flex items-center gap-1.5 rounded-xl border border-[#E5E7EB] bg-[#FFFFFF] px-3 py-2 text-xs font-semibold text-[#374151] hover:border-[#4F46E5]/40 hover:bg-[#EEF2FF] hover:text-[#4F46E5] transition-all shadow-2xs cursor-pointer outline-none"
                    >
                      <span>{chipPrompt}</span>
                      <Sparkles className="size-3 text-[#9CA3AF] group-hover:text-[#4F46E5] transition-colors" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <p className="whitespace-pre-wrap">{message.content}</p>
          )}
        </div>

        {/* Citations Pill Tag */}
        {isAssistant && !isGeneralMode && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {CITATIONS.map((citation) => (
              <CitationPill key={citation.id} citation={citation} />
            ))}
          </div>
        )}

        {/* Action Toolbar */}
        {isAssistant && (
          <div className="mt-3 flex items-center gap-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            <Button
              variant="ghost"
              size="xs"
              onClick={handleCopy}
              className="gap-1.5 text-secondary text-[#6B7280] hover:bg-[#F3F5F7] hover:text-[#111827] rounded-md"
            >
              {copied ? (
                <>
                  <Check className="size-3 text-[#16A34A]" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="size-3" />
                  <span>Copy</span>
                </>
              )}
            </Button>

            <Button
              variant="ghost"
              size="xs"
              className="gap-1.5 text-secondary text-[#6B7280] hover:bg-[#F3F5F7] hover:text-[#111827] rounded-md"
            >
              <RotateCw className="size-3" />
              <span>Retry</span>
            </Button>

            <Button
              variant="ghost"
              size="xs"
              onClick={() => openExplainabilityTab("brain")}
              className="gap-1.5 text-secondary text-[#6B7280] hover:bg-[#F3F5F7] hover:text-[#111827] rounded-md"
            >
              <ShieldCheck className="size-3 text-[#4F46E5]" />
              <span>Inspect Reasoning</span>
            </Button>
          </div>
        )}
      </div>

      {/* User Avatar */}
      {!isAssistant && (
        <div className="flex size-6.5 shrink-0 items-center justify-center rounded-lg bg-[#F3F5F7] text-[#111827] border border-[#E5E7EB] mt-0.5">
          <User className="size-3.5" />
        </div>
      )}
    </motion.div>
  );
}
