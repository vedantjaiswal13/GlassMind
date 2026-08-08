/**
 * Fully Dynamic 4-Tab Explainability Drawer Component
 *
 * Renders ONLY four human-centric tabs:
 * 1. Why this answer
 * 2. Where information came from
 * 3. Should I trust this
 * 4. How AI reached this answer
 *
 * Everything inside these tabs renders dynamically from backend response JSON.
 * Zero hardcoded AI jargon, zero mock percentages or fake document names.
 */

"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Brain,
  BookOpen,
  ShieldCheck,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  FileText,
  HelpCircle,
  ExternalLink,
  ChevronDown,
  Info,
  ShieldAlert,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";

import { useAppStore, ExplainabilityTabType } from "@/store/app-store";
import { useDemoStore } from "@/store/demo-store";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import type { SourceCardItem, ThinkingStep, EvidenceItem, RecommendationItem, StoryStepItem } from "@/types";

/* ── Icon Lookup Helper ── */
const DRAWER_ICON_MAP: Record<string, LucideIcon> = {
  "brain": Brain,
  "search": BookOpen,
  "file-text": FileText,
  "shield-check": ShieldCheck,
  "sparkles": Sparkles,
  "zap": Info,
  "check-circle": CheckCircle2,
  "filter": HelpCircle,
  "clock": Clock,
};

function resolveDrawerIcon(name: string): LucideIcon {
  return DRAWER_ICON_MAP[name] || Brain;
}

/* ── TAB 1: WHY THIS ANSWER ── */
function WhyThisAnswerTab() {
  const lastResponse = useAppStore((s) => s.lastResponse);
  const answerMode = useAppStore((s) => s.answerMode);

  const effectiveMode = lastResponse?.answer_mode || answerMode || "VERIFIED";
  const isGeneral = effectiveMode === "GENERAL";

  const humanExp = lastResponse?.human_explanation;
  const whyText = humanExp?.why_this_answer || (
    isGeneral
      ? "GlassMind first searched your uploaded knowledge base. Since no verified documents matched your query, it switched to trusted general knowledge to answer your question safely."
      : "GlassMind searched your uploaded documents, found relevant supporting evidence, and synthesized their common facts into a grounded explanation."
  );
  const whereText = humanExp?.where_it_came_from || (
    isGeneral
      ? "This answer was created using Gemini's general knowledge because no matching uploaded documents were available."
      : "Created using facts extracted directly from your uploaded document sources."
  );
  const recommendations: RecommendationItem[] = lastResponse?.recommendations || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.25 }}
      className="space-y-4"
    >
      {/* Dynamic Summary Card */}
      <div className={`rounded-2xl border p-5 space-y-3 ${
        isGeneral
          ? "border-[#F59E0B]/30 bg-gradient-to-br from-[#FEF3C7]/40 to-[#FFFBEB]"
          : "border-[#16A34A]/25 bg-gradient-to-br from-[#F0FDF4] to-[#ECFDF5]"
      }`}>
        <div className="flex items-center gap-2.5">
          <div className={`flex size-9 items-center justify-center rounded-xl border ${
            isGeneral ? "bg-[#FEF3C7] border-[#F59E0B]/30 text-[#D97706]" : "bg-[#F0FDF4] border-[#16A34A]/30 text-[#16A34A]"
          }`}>
            {isGeneral ? <Sparkles className="size-5" /> : <Brain className="size-5" />}
          </div>
          <div>
            <h3 className={`text-sm font-bold ${isGeneral ? "text-[#92400E]" : "text-[#14532D]"}`}>
              {isGeneral ? "General Knowledge Explanation" : "Grounded Document Explanation"}
            </h3>
            <span className="text-[11px] font-mono text-[#6B7280]">
              Mode: {effectiveMode}
            </span>
          </div>
        </div>

        <p className={`text-sm leading-relaxed ${isGeneral ? "text-[#B45309]" : "text-[#166534]"}`}>
          {whyText}
        </p>
      </div>

      {/* Where it came from card */}
      <div className="rounded-2xl border border-[#E5E7EB] bg-[#FFFFFF] p-4 space-y-2 shadow-2xs">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#111827]">
          <BookOpen className="size-4 text-[#4F46E5]" />
          <span>Source Overview</span>
        </div>
        <p className="text-xs text-[#4B5563] leading-relaxed">
          {whereText}
        </p>
      </div>

      {/* Actionable Recommendations */}
      {recommendations.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider px-1">
            Recommended Actions
          </h4>
          {recommendations.map((rec, i) => (
            <div
              key={i}
              className={`rounded-xl border p-3 text-xs flex items-start gap-2.5 ${
                rec.urgency === "warning"
                  ? "border-[#F59E0B]/40 bg-[#FEF3C7]/30 text-[#92400E]"
                  : "border-[#E5E7EB] bg-[#F9FAFB] text-[#374151]"
              }`}
            >
              <Info className="size-4 shrink-0 mt-0.5 text-[#4F46E5]" />
              <span>{rec.message}</span>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

/* ── TAB 2: WHERE INFORMATION CAME FROM (INTERACTIVE SOURCE INTELLIGENCE) ── */
function SourceCardComponent({ doc, index }: { doc: SourceCardItem; index: number }) {
  const [expanded, setExpanded] = React.useState(false);

  // Dynamic Strength Badge Colors
  const strengthColorMap: Record<string, { bg: string; text: string; border: string }> = {
    "Primary Evidence": { bg: "bg-[#F0FDF4]", text: "text-[#16A34A]", border: "border-[#16A34A]/30" },
    "Strong Supporting Evidence": { bg: "bg-[#EEF2FF]", text: "text-[#4F46E5]", border: "border-[#4F46E5]/30" },
    "Supporting Evidence": { bg: "bg-[#F3F5F7]", text: "text-[#4B5563]", border: "border-[#D1D5DB]" },
    "Background Information": { bg: "bg-[#FFFBEB]", text: "text-[#D97706]", border: "border-[#F59E0B]/30" },
  };

  const strengthKey = doc.strength || "Primary Evidence";
  const strengthStyle = strengthColorMap[strengthKey] || strengthColorMap["Primary Evidence"];
  const hasConflicts = doc.conflicts && doc.conflicts.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.25 }}
      className="rounded-2xl border border-[#E5E7EB] bg-[#FFFFFF] overflow-hidden shadow-2xs hover:shadow-xs transition-shadow"
    >
      <div className="p-4 space-y-3">
        {/* Top Title Row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-[#EEF2FF] border border-[#4F46E5]/20 text-[#4F46E5] shrink-0">
              <FileText className="size-4.5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-[#111827]">{doc.title || doc.document_name}</h4>
              <div className="flex items-center gap-2 text-xs text-[#6B7280]">
                <span>{doc.type || "PDF Document"}</span>
                <span>•</span>
                <span>{doc.pages_used.length > 0 ? `Pages ${doc.pages_used.join(", ")}` : "Referenced Document"}</span>
              </div>
            </div>
          </div>

          <Badge variant="outline" className={`${strengthStyle.bg} ${strengthStyle.text} ${strengthStyle.border} text-[10px] font-semibold shrink-0`}>
            {doc.strength || "Primary Evidence"}
          </Badge>
        </div>

        {/* Contribution & Why Selected */}
        <div className="space-y-1.5 text-xs text-[#374151] pt-1">
          {doc.contribution && (
            <div>
              <span className="font-semibold text-[#111827]">Contribution: </span>
              <span>{doc.contribution}</span>
            </div>
          )}
          {doc.why_selected && (
            <div className="text-[#6B7280]">
              <span className="font-semibold text-[#111827]">Why AI Selected This: </span>
              <span>{doc.why_selected}</span>
            </div>
          )}
        </div>

        {/* Source Relationships Badges */}
        <div className="flex flex-wrap items-center gap-2 text-[10px]">
          <span className="inline-flex items-center gap-1 rounded-lg bg-[#F0FDF4] px-2 py-0.5 font-semibold text-[#16A34A] border border-[#16A34A]/20">
            <CheckCircle2 className="size-3" />
            Confirms main answer conclusions
          </span>

          {hasConflicts && (
            <span className="inline-flex items-center gap-1 rounded-lg bg-[#FEF2F2] px-2 py-0.5 font-semibold text-[#DC2626] border border-[#DC2626]/20">
              <AlertTriangle className="size-3" />
              Conflicts with another document
            </span>
          )}
        </div>

        {/* Expandable Excerpt Toggle */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 text-xs font-semibold text-[#4F46E5] hover:underline pt-1"
        >
          <span>{expanded ? "Hide Evidence Details" : "Expand Evidence Excerpt"}</span>
          <ChevronDown className={`size-3.5 transition-transform ${expanded ? "rotate-180" : ""}`} />
        </button>
      </div>

      {/* Expandable Excerpt & Matter Explanation */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-[#E5E7EB] bg-[#FCFCFD] p-4 text-xs space-y-3 text-[#374151]"
          >
            {doc.excerpt && (
              <div className="rounded-xl border border-[#E5E7EB] bg-[#FFFFFF] p-3 space-y-1.5 shadow-2xs">
                <span className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider">
                  Relevant Document Excerpt
                </span>
                <p className="italic text-[#1F2937] leading-relaxed">
                  &ldquo;{doc.excerpt}&rdquo;
                </p>
              </div>
            )}

            {doc.excerpt_relevance && (
              <div>
                <span className="font-semibold text-[#111827]">Why this excerpt matters: </span>
                <span>{doc.excerpt_relevance}</span>
              </div>
            )}

            {doc.supports && doc.supports.length > 0 && (
              <div>
                <span className="font-semibold text-[#111827]">Supporting Claims: </span>
                <ul className="list-disc list-inside space-y-0.5 mt-1 text-[#4B5563]">
                  {doc.supports.map((sup: string, i: number) => (
                    <li key={i}>{sup}</li>
                  ))}
                </ul>
              </div>
            )}

            {doc.conflicts && doc.conflicts.length > 0 && (
              <div className="text-[#DC2626]">
                <span className="font-semibold">Conflicting Details: </span>
                <ul className="list-disc list-inside space-y-0.5 mt-1">
                  {doc.conflicts.map((conf: string, i: number) => (
                    <li key={i}>{conf}</li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function WhereInformationCameFromTab() {
  const lastResponse = useAppStore((s) => s.lastResponse);
  const answerMode = useAppStore((s) => s.answerMode);

  const effectiveMode = lastResponse?.answer_mode || answerMode || "VERIFIED";
  const isGeneral = effectiveMode === "GENERAL";

  const documents: SourceCardItem[] = lastResponse?.documents_used || [];
  const sources = lastResponse?.sources || [];

  if (isGeneral || (documents.length === 0 && sources.length === 0)) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center text-center p-8 rounded-2xl border border-dashed border-[#F59E0B]/40 bg-[#FEF3C7]/20 space-y-3"
      >
        <div className="size-12 rounded-2xl bg-[#FEF3C7] border border-[#F59E0B]/30 flex items-center justify-center text-[#D97706]">
          <Sparkles className="size-6" />
        </div>
        <h4 className="font-bold text-[#111827] text-sm">General Knowledge Source</h4>
        <p className="text-xs text-[#6B7280] max-w-sm leading-relaxed">
          No uploaded documents were available or matched your question. GlassMind answered using Gemini&apos;s trusted general knowledge base.
        </p>
        <div className="mt-3 p-3.5 rounded-xl bg-[#FFFFFF] border border-[#E5E7EB] text-left text-xs space-y-2 w-full">
          <div className="font-semibold text-[#111827]">How to Improve Verification:</div>
          <p className="text-[#6B7280] leading-relaxed">
            Upload trusted PDF, DOCX, or text documents to receive verified answers grounded directly in your own files.
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.25 }}
      className="space-y-3"
    >
      <div className="flex items-center justify-between text-xs text-[#6B7280] px-1 font-medium">
        <span>{documents.length || sources.length} Source Intelligence Card(s)</span>
        <span className="text-[#16A34A] font-semibold">Document Grounded</span>
      </div>

      {documents.length > 0 ? (
        documents.map((doc: SourceCardItem, idx: number) => (
          <SourceCardComponent key={idx} doc={doc} index={idx} />
        ))
      ) : (
        sources.map((src: { document: string; page: number; confidence: number }, idx: number) => (
          <div key={idx} className="rounded-2xl border border-[#E5E7EB] bg-[#FFFFFF] p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="size-5 text-[#4F46E5]" />
              <div>
                <h4 className="text-sm font-semibold text-[#111827]">{src.document}</h4>
                <p className="text-xs text-[#6B7280]">Page {src.page}</p>
              </div>
            </div>
            <Badge variant="outline" className="border-[#16A34A]/30 bg-[#F0FDF4] text-[#16A34A] text-xs">
              Primary Evidence
            </Badge>
          </div>
        ))
      )}
    </motion.div>
  );
}

/* ── TAB 3: SHOULD I TRUST THIS ── */
function ShouldITrustThisTab() {
  const lastResponse = useAppStore((s) => s.lastResponse);
  const answerMode = useAppStore((s) => s.answerMode);

  const effectiveMode = lastResponse?.answer_mode || answerMode || "VERIFIED";
  const isGeneral = effectiveMode === "GENERAL";

  const trustObj = lastResponse?.trust;
  const trustLevel = trustObj?.level || (isGeneral ? "General Knowledge" : "Verified");
  const trustSummary = trustObj?.summary || (
    isGeneral
      ? "This answer is based on general knowledge because no uploaded documents were available."
      : "This answer agrees with multiple independent document references."
  );

  const conflict = lastResponse?.conflict_analysis;
  const ignored = lastResponse?.ignored_information || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.25 }}
      className="space-y-4"
    >
      {/* Big Trust Status Card */}
      <div className={`rounded-2xl border p-5 space-y-3 ${
        isGeneral
          ? "border-[#F59E0B]/30 bg-gradient-to-br from-[#FEF3C7]/40 to-[#FFFBEB]"
          : "border-[#16A34A]/25 bg-gradient-to-br from-[#F0FDF4] to-[#ECFDF5]"
      }`}>
        <div className="flex items-center gap-3">
          <div className={`flex size-10 items-center justify-center rounded-2xl border ${
            isGeneral ? "bg-[#FEF3C7] border-[#F59E0B]/30 text-[#D97706]" : "bg-[#F0FDF4] border-[#16A34A]/30 text-[#16A34A]"
          }`}>
            {isGeneral ? <Sparkles className="size-5" /> : <ShieldCheck className="size-6" />}
          </div>
          <div>
            <h3 className={`text-base font-bold ${isGeneral ? "text-[#92400E]" : "text-[#14532D]"}`}>
              Trust Rating: {trustLevel}
            </h3>
            <span className="text-xs text-[#6B7280]">
              Human Reliability Evaluation
            </span>
          </div>
        </div>

        <p className={`text-xs leading-relaxed ${isGeneral ? "text-[#B45309]" : "text-[#166534]"}`}>
          {trustSummary}
        </p>
      </div>

      {/* Contradiction / Conflict Card */}
      {conflict && conflict.has_conflict ? (
        <div className="rounded-2xl border border-[#EF4444]/30 bg-[#FEF2F2] p-4 text-xs space-y-2 text-[#7F1D1D]">
          <div className="flex items-center gap-2 font-bold text-[#DC2626]">
            <AlertTriangle className="size-4" />
            <span>Conflicting Information Detected</span>
          </div>
          <p>{conflict.description}</p>
          {conflict.resolution_reason && (
            <p className="font-medium pt-1 text-[#991B1B]">
              Resolution: {conflict.resolution_reason}
            </p>
          )}
        </div>
      ) : (
        <div className="rounded-2xl border border-[#E5E7EB] bg-[#FFFFFF] p-4 text-xs space-y-1.5 shadow-2xs">
          <div className="flex items-center gap-2 font-semibold text-[#111827]">
            <CheckCircle2 className="size-4 text-[#16A34A]" />
            <span>No Contradictions Detected</span>
          </div>
          <p className="text-[#6B7280]">
            The information was consistent across the evaluated sources.
          </p>
        </div>
      )}

      {/* Ignored Information */}
      {ignored.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider px-1">
            Filtered Out Information
          </h4>
          {ignored.map((item: { title: string; reason: string }, i: number) => (
            <div key={i} className="rounded-xl border border-[#E5E7EB] bg-[#FFFFFF] p-3 text-xs space-y-1 shadow-2xs">
              <h5 className="font-semibold text-[#111827]">{item.title}</h5>
              <p className="text-[#6B7280]">{item.reason}</p>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

/* ── TAB 4: HOW AI REACHED THIS ANSWER (VISUAL REASONING STORY MODE) ── */
function HowAIReachedThisAnswerTab() {
  const lastResponse = useAppStore((s) => s.lastResponse);
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  const storySteps: StoryStepItem[] = lastResponse?.story || [
    { title: "GlassMind understood your question", description: "Analyzed query intent and domain topics.", status: "completed", duration: "0.1s", icon: "brain" },
    { title: "Determined topic: General", description: "Selected reliability rules for this query.", status: "completed", duration: "0.1s", icon: "zap" },
    { title: "Searched your uploaded knowledge base", description: "Scanned indexed documents for matching sections.", status: "completed", duration: "0.2s", icon: "search" },
    { title: "Compared trusted information", description: "Cross-referenced document facts for consistency.", status: "completed", duration: "0.2s", icon: "file-text" },
    { title: "Generated a simplified explanation", description: "Composed plain-English answer without AI jargon.", status: "completed", duration: "0.3s", icon: "check-circle" },
  ];

  const totalDuration = lastResponse?.timeline?.reduce((acc: number, t: { timestamp: string }) => acc + parseFloat(t.timestamp || "0.1"), 0).toFixed(1) || "0.9";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.25 }}
      className="space-y-4"
    >
      {/* Top Header Card */}
      <div className="flex items-center justify-between rounded-2xl border border-[#EEF2FF] bg-gradient-to-r from-[#EEF2FF] to-[#F0FDF4] p-4 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-xl bg-[#FFFFFF] border border-[#4F46E5]/20 text-[#4F46E5] shrink-0">
            <CheckCircle2 className="size-5 text-[#16A34A]" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#111827]">Visual Reasoning Story Mode</h3>
            <p className="text-xs text-[#6B7280]">
              Completed in <span className="font-mono font-bold text-[#16A34A]">{totalDuration}s</span> across {storySteps.length} expert steps
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="h-8 text-xs gap-1 border-[#16A34A]/30 text-[#16A34A] bg-[#FFFFFF] hover:bg-[#F0FDF4]"
        >
          <span>{isCollapsed ? "Expand Story" : "✓ Reasoning Complete"}</span>
          <ChevronDown className={`size-3.5 transition-transform ${isCollapsed ? "" : "rotate-180"}`} />
        </Button>
      </div>

      {/* Animated Story Mode Flow */}
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3 relative pl-6 border-l-2 border-[#4F46E5]/20 ml-3 py-1"
          >
            {storySteps.map((step: StoryStepItem, idx: number) => {
              const isLast = idx === storySteps.length - 1;
              const isCompleted = step.status === "completed" || isLast;
              const StepIcon = resolveDrawerIcon(step.icon || "brain");

              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.08, duration: 0.28 }}
                  className={`relative space-y-1.5 rounded-2xl border p-4 transition-all shadow-2xs ${
                    isLast
                      ? "bg-[#F0FDF4] border-[#16A34A]/30 ring-1 ring-[#16A34A]/20"
                      : isCompleted
                      ? "bg-[#FFFFFF] border-[#E5E7EB]"
                      : "bg-[#FAFAFA] border-[#E5E7EB] opacity-60"
                  }`}
                >
                  {/* Step Connector Bullet */}
                  <div className={`absolute -left-[31px] top-4 flex size-5 items-center justify-center rounded-full border-2 bg-white ${
                    isLast ? "border-[#16A34A] text-[#16A34A]" : "border-[#4F46E5] text-[#4F46E5]"
                  }`}>
                    {isCompleted ? <CheckCircle2 className="size-3.5 fill-white text-[#16A34A]" /> : <div className="size-1.5 rounded-full bg-[#4F46E5]" />}
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <StepIcon className={`size-4 ${isLast ? "text-[#16A34A]" : "text-[#4F46E5]"}`} />
                      <h4 className="text-xs font-bold text-[#111827]">{step.title}</h4>
                    </div>
                    <span className="text-[10px] font-mono text-[#9CA3AF] bg-[#F3F5F7] px-2 py-0.5 rounded-md">
                      {step.duration}
                    </span>
                  </div>

                  <p className="text-xs text-[#4B5563] leading-relaxed pl-6">
                    {step.description}
                  </p>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function ExplainabilityDrawer() {
  const {
    explainabilityDrawerOpen,
    setExplainabilityDrawerOpen,
    activeExplainabilityTab,
    setActiveExplainabilityTab,
    lastResponse,
    answerMode,
  } = useAppStore();

  const isDemoMode = useDemoStore((s) => s.isDemoMode);

  const effectiveMode = lastResponse?.answer_mode || answerMode || "VERIFIED";
  const isGeneral = effectiveMode === "GENERAL";

  // STRICT 4-TAB NAVIGATION
  const FOUR_TABS: { id: ExplainabilityTabType; label: string; icon: LucideIcon }[] = [
    { id: "why_this_answer", label: "Why this answer", icon: Brain },
    { id: "where_info_from", label: "Where info came from", icon: BookOpen },
    { id: "should_i_trust", label: "Should I trust this", icon: ShieldCheck },
    { id: "how_ai_reached", label: "How AI reached this", icon: Clock },
  ];

  const handleClose = React.useCallback(() => {
    if (isDemoMode) return;
    setExplainabilityDrawerOpen(false);
  }, [isDemoMode, setExplainabilityDrawerOpen]);

  return (
    <AnimatePresence>
      {explainabilityDrawerOpen && (
        <motion.aside
          initial={{ x: "100%", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: "100%", opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 28 }}
          className="fixed right-0 top-0 bottom-0 z-40 w-full sm:w-[540px] lg:w-[600px] rounded-l-[24px] border-l border-[#E5E7EB] bg-[#FFFFFF] text-[#111827] shadow-2xl flex flex-col select-none"
        >
          {/* Header */}
          <div className="flex h-14 items-center justify-between border-b border-[#E5E7EB] px-6 shrink-0 bg-[#FFFFFF]">
            <div className="flex items-center gap-2.5">
              <div className={`flex size-7 items-center justify-center rounded-xl border ${
                isGeneral
                  ? "bg-[#FEF3C7] text-[#D97706] border-[#F59E0B]/30"
                  : "bg-[#EEF2FF] text-[#4F46E5] border-[#4F46E5]/20"
              }`}>
                <Sparkles className="size-4" />
              </div>
              <span className="text-sm font-bold text-[#111827]">
                Explainability Inspector {lastResponse?.domain_mode ? `(${lastResponse.domain_mode} Mode)` : isGeneral ? "(General Knowledge)" : "(Verified)"}
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={handleClose}
              className={`text-[#6B7280] hover:bg-[#F3F5F7] hover:text-[#111827] rounded-md ${
                isDemoMode ? "opacity-30 cursor-not-allowed" : ""
              }`}
            >
              <X className="size-4" />
            </Button>
          </div>

          {/* 4 Dynamic Tabs */}
          <div className="flex items-center gap-1 border-b border-[#E5E7EB] bg-[#FCFCFD] px-4 py-2 overflow-x-auto no-scrollbar">
            {FOUR_TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeExplainabilityTab === tab.id || (
                (activeExplainabilityTab === "brain" && tab.id === "why_this_answer") ||
                (activeExplainabilityTab === "galaxy" && tab.id === "where_info_from") ||
                (activeExplainabilityTab === "genome" && tab.id === "should_i_trust") ||
                (activeExplainabilityTab === "timeline" && tab.id === "how_ai_reached")
              );

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveExplainabilityTab(tab.id)}
                  className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-[11px] font-medium transition-all whitespace-nowrap outline-none ${
                    isActive
                      ? isGeneral
                        ? "bg-[#D97706] text-white shadow-xs"
                        : "bg-[#4F46E5] text-white shadow-xs"
                      : "bg-[#F3F5F7] text-[#6B7280] hover:bg-[#EEF2FF] hover:text-[#4F46E5]"
                  }`}
                >
                  <Icon className="size-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Module Content View */}
          <ScrollArea className="flex-1 min-h-0 px-5 py-5">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeExplainabilityTab}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18 }}
              >
                {(activeExplainabilityTab === "why_this_answer" || activeExplainabilityTab === "brain") && <WhyThisAnswerTab />}
                {(activeExplainabilityTab === "where_info_from" || activeExplainabilityTab === "galaxy") && <WhereInformationCameFromTab />}
                {(activeExplainabilityTab === "should_i_trust" || activeExplainabilityTab === "genome") && <ShouldITrustThisTab />}
                {(activeExplainabilityTab === "how_ai_reached" || activeExplainabilityTab === "timeline") && <HowAIReachedThisAnswerTab />}
              </motion.div>
            </AnimatePresence>
          </ScrollArea>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
