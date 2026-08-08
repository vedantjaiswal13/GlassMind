/**
 * Citation Pill — Answer citation with cross-module sync
 */

"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { FileText } from "lucide-react";

import {
  useIsCitationHighlighted,
  useSyncHoverActions,
} from "@/hooks/use-sync-highlight";
import { useAppStore } from "@/store/app-store";
import type { CitationMeta } from "@/types/explainability";

interface CitationPillProps {
  citation: CitationMeta;
}

export const CitationPill = React.memo(function CitationPill({ citation }: CitationPillProps) {
  const isHighlighted = useIsCitationHighlighted(citation.id);
  const { dispatchHover, dispatchClear } = useSyncHoverActions();
  const toggleSourcesPanel = useAppStore((s) => s.toggleSourcesPanel);

  const handleMouseEnter = React.useCallback(() => {
    dispatchHover({ origin: "citation", targetType: "citation", targetId: citation.id });
  }, [dispatchHover, citation.id]);

  const handleMouseLeave = React.useCallback(() => {
    dispatchClear("citation");
  }, [dispatchClear]);

  return (
    <motion.button
      onClick={toggleSourcesPanel}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      animate={{
        scale: isHighlighted ? 1.04 : 1,
        boxShadow: isHighlighted
          ? "0 0 0 3px rgba(79, 70, 229, 0.25)"
          : "0 0 0 0px rgba(79, 70, 229, 0)",
      }}
      transition={{ type: "spring", stiffness: 500, damping: 28 }}
      className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-secondary transition-colors shadow-xs ${
        isHighlighted
          ? "border-[#4F46E5] bg-[#EEF2FF] text-[#4F46E5]"
          : "border-[#E5E7EB] bg-[#FFFFFF] text-[#6B7280] hover:border-[#4F46E5] hover:text-[#4F46E5]"
      }`}
    >
      <FileText className="size-3.5 text-[#4F46E5]" />
      <span>Cited: {citation.label}</span>
    </motion.button>
  );
});
