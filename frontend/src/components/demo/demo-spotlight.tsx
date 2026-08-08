/**
 * Demo Spotlight — Contextual narration overlay for each explainability section
 *
 * Renders a subtle floating pill badge with helper text below the active
 * section title. Shows a soft indigo ring glow around the active section.
 * Never intrusive — designed to feel like a keynote presenter note.
 */

"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";

import { useDemoStore, DEMO_STEPS } from "@/store/demo-store";

export function DemoSpotlight() {
  const isDemoMode = useDemoStore((s) => s.isDemoMode);
  const isPaused = useDemoStore((s) => s.isPaused);
  const currentStepIndex = useDemoStore((s) => s.currentStepIndex);

  const step = DEMO_STEPS[currentStepIndex];

  if (!isDemoMode || !step) return null;

  return (
    <>
      {/* Spotlight ring rendered around each section */}
      {DEMO_STEPS.map((s, idx) => (
        <DemoSectionHighlight
          key={s.id}
          sectionId={s.sectionId}
          isActive={idx === currentStepIndex}
          description={s.description}
          isPaused={isPaused}
        />
      ))}
    </>
  );
}

function DemoSectionHighlight({
  sectionId,
  isActive,
  description,
  isPaused,
}: {
  sectionId: string;
  isActive: boolean;
  description: string;
  isPaused: boolean;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [targetEl, setTargetEl] = React.useState<HTMLElement | null>(null);

  React.useEffect(() => {
    // Small delay for DOM to settle
    const t = setTimeout(() => {
      setTargetEl(document.getElementById(sectionId));
    }, 100);
    return () => clearTimeout(t);
  }, [sectionId]);

  if (!targetEl) return null;

  return (
    <AnimatePresence>
      {isActive && (
        <SpotlightBadge
          ref={ref}
          sectionId={sectionId}
          description={description}
          isPaused={isPaused}
        />
      )}
    </AnimatePresence>
  );
}

const SpotlightBadge = React.forwardRef<
  HTMLDivElement,
  { sectionId: string; description: string; isPaused: boolean }
>(function SpotlightBadge({ sectionId, description, isPaused }, ref) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    const t = setTimeout(() => setMounted(true), 350);
    return () => clearTimeout(t);
  }, []);

  // We render the badge inside the section using a portal-like approach
  // but since we're inside the same ScrollArea, we use a different strategy:
  // The spotlight is rendered as a fixed overlay badge tracked to the section

  const targetEl = document.getElementById(sectionId);
  if (!targetEl || !mounted) return null;

  // Create a portal-rendered badge inside the section
  const portalTarget = targetEl.querySelector("[data-demo-badge-slot]");

  if (!portalTarget) return null;

  return (
    <>
      {/* Render spotlight badge via React portal */}
      {createPortal(
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 8, scale: 0.95 }}
          animate={{
            opacity: isPaused ? 0.6 : 1,
            y: 0,
            scale: 1,
          }}
          exit={{ opacity: 0, y: -6, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 300, damping: 28 }}
          className="flex items-center gap-2 rounded-xl bg-[#4F46E5]/[0.08] border border-[#4F46E5]/20 px-3 py-1.5 mt-2 mb-1"
        >
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.7, 1, 0.7],
            }}
            transition={{
              repeat: Infinity,
              duration: 2,
              ease: "easeInOut",
            }}
          >
            <Sparkles className="size-3 text-[#4F46E5]" />
          </motion.div>
          <span className="text-[11px] leading-relaxed text-[#4F46E5]/90 font-medium">
            {description}
          </span>
        </motion.div>,
        portalTarget
      )}
    </>
  );
});
