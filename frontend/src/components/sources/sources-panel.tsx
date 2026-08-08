/**
 * Independent Sources Panel Component — PDF Document & Grounding Inspector
 *
 * Dedicated document drawer opened exclusively via top-right "Sources" button.
 * Displays retrieved PDFs, similarity scores, grounding status, evidence chunks,
 * and active citations without heavy explainability charts.
 */

"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  FileText,
  CheckCircle2,
  ExternalLink,
  Layers,
  Hash,
  Sparkles,
  ShieldCheck,
} from "lucide-react";

import { useAppStore, DocumentMeta } from "@/store/app-store";
import { useDemoStore } from "@/store/demo-store";
import { useIsSourceHighlighted, useSyncHoverActions } from "@/hooks/use-sync-highlight";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

const DocumentSourceCard = React.memo(function DocumentSourceCard({
  doc,
}: {
  doc: DocumentMeta;
}) {
  const isHighlighted = useIsSourceHighlighted(doc.id);
  const { dispatchHover, dispatchClear } = useSyncHoverActions();

  const handleMouseEnter = React.useCallback(() => {
    dispatchHover({
      origin: "pdf",
      targetType: "source",
      targetId: doc.id,
    });
  }, [dispatchHover, doc.id]);

  const handleMouseLeave = React.useCallback(() => {
    dispatchClear("pdf");
  }, [dispatchClear]);

  return (
    <motion.div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.18 }}
      className={`group rounded-2xl border p-4 transition-all cursor-pointer ${
        isHighlighted
          ? "border-[#4F46E5] bg-[#FFFFFF] shadow-md shadow-[#4F46E5]/10 ring-2 ring-[#4F46E5]/20"
          : "border-[#E5E7EB] bg-[#FFFFFF] hover:border-[#D1D5DB] hover:shadow-xs"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#EEF2FF] text-[#4F46E5] border border-[#4F46E5]/20">
            <FileText className="size-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-[#111827] group-hover:text-[#4F46E5] transition-colors">
              {doc.name}
            </h4>
            <div className="mt-1 flex items-center gap-2 text-xs text-[#6B7280]">
              <span>{doc.size}</span>
              <span>•</span>
              <span>{doc.type}</span>
              <span>•</span>
              <span className="font-mono">{doc.uploadedAt}</span>
            </div>
          </div>
        </div>

        <Badge
          variant="outline"
          className="border-[#16A34A]/30 bg-[#F0FDF4] text-xs font-semibold text-[#16A34A] shrink-0"
        >
          {doc.groundingStatus}
        </Badge>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 text-xs pt-3 border-t border-[#E5E7EB]">
        <div className="flex items-center gap-1.5 text-[#6B7280]">
          <CheckCircle2 className="size-3.5 text-[#16A34A]" />
          <span>Verified Grounded</span>
        </div>
        <div className="flex items-center gap-1.5 text-[#6B7280] justify-end font-mono">
          <Layers className="size-3.5 text-[#4F46E5]" />
          <span>{(doc.similarityScore * 100).toFixed(0)}% Similarity</span>
        </div>
        <div className="flex items-center gap-1.5 text-[#6B7280]">
          <Hash className="size-3.5 text-purple-600" />
          <span>{doc.evidenceChunks} chunks extracted</span>
        </div>
        <div className="flex items-center gap-1.5 text-[#6B7280] justify-end">
          <Sparkles className="size-3.5 text-[#D97706]" />
          <span>{doc.citationCount} active citations</span>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between pt-2">
        <span className="text-[11px] font-medium text-[#4F46E5] group-hover:underline">
          Hover to highlight connected claims in conversation
        </span>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-xs gap-1 text-[#6B7280] hover:text-[#4F46E5]"
        >
          <span>Open PDF</span>
          <ExternalLink className="size-3" />
        </Button>
      </div>
    </motion.div>
  );
});

export function SourcesPanel() {
  const { sourcesPanelOpen, setSourcesPanelOpen, documents, lastResponse, answerMode } = useAppStore();
  const isDemoMode = useDemoStore((s) => s.isDemoMode);

  const effectiveMode = lastResponse?.answer_mode || answerMode || "VERIFIED";
  const isGeneral = effectiveMode === "GENERAL" || documents.length === 0;

  const handleClose = React.useCallback(() => {
    if (isDemoMode) return;
    setSourcesPanelOpen(false);
  }, [isDemoMode, setSourcesPanelOpen]);

  return (
    <AnimatePresence>
      {sourcesPanelOpen && (
        <motion.aside
          initial={{ x: "100%", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: "100%", opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 28 }}
          className="fixed right-0 top-0 bottom-0 z-40 w-full sm:w-[480px] lg:w-[520px] rounded-l-[24px] border-l border-[#E5E7EB] bg-[#FFFFFF] text-[#111827] shadow-2xl flex flex-col select-none"
        >
          {/* Header */}
          <div className="flex h-14 items-center justify-between border-b border-[#E5E7EB] px-6 shrink-0 bg-[#FFFFFF]">
            <div className="flex items-center gap-2">
              {isGeneral ? (
                <Sparkles className="size-5 text-[#D97706]" />
              ) : (
                <ShieldCheck className="size-5 text-[#16A34A]" />
              )}
              <div>
                <h3 className="text-page-title font-semibold text-[#111827]">
                  {isGeneral ? "Source Grounding Status" : "Retrieved Knowledge Base Sources"}
                </h3>
                <p className="text-xs text-[#6B7280]">
                  {isGeneral
                    ? "Operating in General Knowledge Mode"
                    : "Document sources supporting grounded AI responses"}
                </p>
              </div>
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

          {/* Content */}
          <ScrollArea className="flex-1 min-h-0 px-6 py-6">
            {isGeneral ? (
              <div className="flex flex-col items-center justify-center text-center py-12 px-4 rounded-2xl border border-dashed border-[#F59E0B]/40 bg-[#FEF3C7]/20">
                <div className="size-12 rounded-2xl bg-[#FEF3C7] border border-[#F59E0B]/30 flex items-center justify-center text-[#D97706] mb-3">
                  <Sparkles className="size-6" />
                </div>
                <h4 className="font-bold text-[#111827] text-sm">No Uploaded Documents</h4>
                <p className="text-xs text-[#6B7280] max-w-xs mt-1.5 leading-relaxed">
                  GlassMind is using <span className="font-semibold text-[#D97706]">Gemini General Knowledge</span> for this answer.
                </p>
                <div className="mt-5 p-3 rounded-xl bg-[#FFFFFF] border border-[#E5E7EB] text-left text-xs space-y-1.5 w-full">
                  <div className="flex justify-between text-[#6B7280]">
                    <span>Grounding Status:</span>
                    <span className="font-semibold text-[#D97706]">Not Available</span>
                  </div>
                  <div className="flex justify-between text-[#6B7280]">
                    <span>Vector Context:</span>
                    <span className="font-semibold text-[#111827]">0 Chunks Matched</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs text-[#6B7280] font-medium mb-1">
                  <span>{documents.length} Active PDF Documents</span>
                  <span>High Grounding Consensus</span>
                </div>

                {documents.map((doc) => (
                  <DocumentSourceCard key={doc.id} doc={doc} />
                ))}
              </div>
            )}
          </ScrollArea>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
