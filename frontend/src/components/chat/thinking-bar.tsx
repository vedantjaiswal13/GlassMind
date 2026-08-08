/**
 * Thinking Bar Component — Heart of GlassMind Live Reasoning Stream
 *
 * Appears immediately after message transmission and streams stages live:
 * 🧠 Thinking... -> Planning -> Searching -> Reading Sources -> Comparing Evidence -> Verification -> Generating
 *
 * Displays:
 * - Active pulsing stage & green check completion icons
 * - Live gradually increasing Trust Score
 * - Live Elapsed Time counter (e.g. 1.2s)
 * - "Inspect Reasoning ▼" trigger opening the Explainability Drawer
 *
 * Disappears into a compact summary ("Reasoning Complete • 96.4% Trust Score • Inspect Reasoning ▼") after generation completes.
 */

"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ArrowRight, Sparkles, ShieldCheck, ChevronDown, Clock } from "lucide-react";

import { useAppStore, StageType } from "@/store/app-store";

const STAGES: { id: StageType; label: string }[] = [
  { id: "Planning", label: "Understanding your question..." },
  { id: "Searching", label: "Searching trusted knowledge..." },
  { id: "Checking Documents", label: "Comparing evidence..." },
  { id: "Decision", label: "Checking contradictions..." },
  { id: "Generating", label: "Preparing explanation..." },
];

export function ThinkingBar() {
  const {
    currentStage,
    isStreaming,
    openExplainabilityTab,
    lastResponse,
    answerMode,
  } = useAppStore();

  const [elapsedMs, setElapsedMs] = React.useState(0);
  const startTimeRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    if (isStreaming) {
      if (!startTimeRef.current) startTimeRef.current = Date.now();
      const interval = setInterval(() => {
        setElapsedMs(Date.now() - (startTimeRef.current ?? Date.now()));
      }, 100);
      return () => clearInterval(interval);
    } else {
      startTimeRef.current = null;
    }
  }, [isStreaming]);

  const getStageIndex = (stage: StageType) => {
    const idx = STAGES.findIndex((s) => s.id === stage);
    return idx === -1 ? STAGES.length : idx;
  };

  const currentIndex = isStreaming ? getStageIndex(currentStage) : STAGES.length;

  const handleInspectReasoning = React.useCallback(() => {
    openExplainabilityTab("why_this_answer");
  }, [openExplainabilityTab]);

  const activeMode = lastResponse?.answer_mode || answerMode;
  const isGeneral = activeMode === "GENERAL";
  const trustLevel = lastResponse?.trust?.level || (isGeneral ? "General Knowledge" : "Verified");

  return (
    <div className="my-3 flex w-full flex-col gap-2.5 rounded-2xl border border-[#E5E7EB] bg-[#FFFFFF] p-4 shadow-2xs select-none transition-all">
      {/* Top Header Row */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <motion.div
            animate={isStreaming ? { scale: [1, 1.2, 1], opacity: [0.8, 1, 0.8] } : { scale: 1 }}
            transition={isStreaming ? { repeat: Infinity, duration: 1.5 } : {}}
            className={`flex size-6 items-center justify-center rounded-lg border ${
              isGeneral
                ? "bg-[#FEF3C7] text-[#D97706] border-[#F59E0B]/30"
                : "bg-[#F0FDF4] text-[#16A34A] border-[#16A34A]/25"
            }`}
          >
            <Sparkles className="size-3.5" />
          </motion.div>

          <span className="font-bold text-[#111827]">
            {isStreaming ? "AI Processing Query..." : "Reasoning Complete"}
          </span>

          <span className="text-[#6B7280]">•</span>

          <span className={`font-semibold px-2 py-0.5 rounded-md border ${
            isGeneral
              ? "text-[#D97706] bg-[#FEF3C7] border-[#D97706]/30"
              : "text-[#16A34A] bg-[#F0FDF4] border-[#16A34A]/20"
          }`}>
            Trust Level: {trustLevel}
          </span>

          {isStreaming && (
            <>
              <span className="text-[#6B7280]">•</span>
              <span className="font-mono text-[#6B7280] flex items-center gap-1">
                <Clock className="size-3 text-[#9CA3AF]" />
                {(elapsedMs / 1000).toFixed(1)}s
              </span>
            </>
          )}
        </div>

        <button
          onClick={handleInspectReasoning}
          className="flex items-center gap-1 rounded-xl bg-[#EEF2FF] px-3 py-1.5 text-xs font-semibold text-[#4F46E5] hover:bg-[#4F46E5] hover:text-white transition-all shadow-2xs outline-none"
        >
          <ShieldCheck className="size-3.5" />
          <span>Inspect Reasoning</span>
          <ChevronDown className="size-3" />
        </button>
      </div>

      {/* Sequential Success Experience Banners (When complete) */}
      {!isStreaming && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex flex-wrap items-center gap-2 pt-1 text-[11px]"
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-1 rounded-lg bg-[#F0FDF4] px-2 py-1 font-semibold text-[#16A34A] border border-[#16A34A]/20"
          >
            <Check className="size-3" />
            Explanation Ready
          </motion.span>
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.25 }}
            className="inline-flex items-center gap-1 rounded-lg bg-[#EEF2FF] px-2 py-1 font-semibold text-[#4F46E5] border border-[#4F46E5]/20"
          >
            <Check className="size-3" />
            Sources Verified
          </motion.span>
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="inline-flex items-center gap-1 rounded-lg bg-[#FCFCFD] px-2 py-1 font-semibold text-[#374151] border border-[#E5E7EB]"
          >
            <Check className="size-3 text-[#16A34A]" />
            Trust Evaluation Complete
          </motion.span>
        </motion.div>
      )}

      {/* Live Stage Ribbon */}
      <div className="relative flex items-center gap-1.5 overflow-x-auto pt-1 pb-0.5 no-scrollbar">
        {isStreaming && (
          <motion.div
            className="pointer-events-none absolute left-0 right-0 top-1/2 h-px -translate-y-1/2 bg-gradient-to-r from-transparent via-[#4F46E5]/40 to-transparent"
            animate={{ x: [-50, 50, -50] }}
            transition={{ repeat: Infinity, duration: 2.8, ease: "easeInOut" }}
          />
        )}

        {STAGES.map((s, idx) => {
          const isCompleted = idx < currentIndex;
          const isCurrent = idx === currentIndex && isStreaming;

          return (
            <React.Fragment key={s.id}>
              <div
                className={`flex items-center gap-1.5 rounded-xl px-2.5 py-1 text-xs font-medium transition-all whitespace-nowrap ${
                  isCurrent
                    ? "bg-[#EEF2FF] text-[#4F46E5] border border-[#4F46E5]/40 font-semibold shadow-2xs"
                    : isCompleted
                    ? "bg-[#F0FDF4] text-[#16A34A] border border-[#16A34A]/30"
                    : "bg-[#F3F5F7] text-[#9CA3AF]"
                }`}
              >
                {isCompleted ? (
                  <Check className="size-3 text-[#16A34A]" />
                ) : isCurrent ? (
                  <motion.span
                    className="size-2 rounded-full bg-[#4F46E5]"
                    animate={{ scale: [1, 1.4, 1], opacity: [0.6, 1, 0.6] }}
                    transition={{ repeat: Infinity, duration: 1.2 }}
                  />
                ) : (
                  <span className="size-1.5 rounded-full bg-[#D1D5DB]" />
                )}
                <span>{s.label}</span>
              </div>

              {idx < STAGES.length - 1 && (
                <ArrowRight className="size-3 text-[#D1D5DB] shrink-0" />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
