/**
 * Demo Sequencer Hook — Orchestrates the demo flow
 *
 * Manages auto-scrolling through sections, triggering sync store replay,
 * opening the sources panel, and advancing steps on a timer.
 */

"use client";

import { useEffect, useRef, useCallback } from "react";

import { useDemoStore, DEMO_STEPS } from "@/store/demo-store";
import { useSyncStore } from "@/store/sync-store";
import { useAppStore } from "@/store/app-store";

export function useDemoSequencer() {
  const isDemoMode = useDemoStore((s) => s.isDemoMode);
  const isPaused = useDemoStore((s) => s.isPaused);
  const currentStepIndex = useDemoStore((s) => s.currentStepIndex);
  const autoReplay = useDemoStore((s) => s.autoReplay);
  const nextStep = useDemoStore((s) => s.nextStep);

  const startReplay = useSyncStore((s) => s.startReplay);
  const stopReplay = useSyncStore((s) => s.stopReplay);
  const isReplaying = useSyncStore((s) => s.isReplaying);

  const setSourcesPanelOpen = useAppStore((s) => s.setSourcesPanelOpen);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasStartedReplayRef = useRef(false);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // --- On demo start: open explainability drawer
  useEffect(() => {
    if (isDemoMode) {
      useAppStore.getState().openExplainabilityTab("brain");
      hasStartedReplayRef.current = false;
    } else {
      clearTimer();
      stopReplay();
      hasStartedReplayRef.current = false;
    }
  }, [isDemoMode, clearTimer, stopReplay]);

  // --- Switch tab based on demo step
  useEffect(() => {
    if (!isDemoMode) return;
    const step = DEMO_STEPS[currentStepIndex];
    if (!step) return;

    const tabMap: Record<string, any> = {
      brain: "brain",
      timeline: "timeline",
      evidence: "galaxy",
      trust: "genome",
      counterfactual: "counterfactual",
    };

    const targetTab = tabMap[step.id];
    if (targetTab) {
      useAppStore.getState().openExplainabilityTab(targetTab);
    }
  }, [isDemoMode, currentStepIndex]);

  // --- Trigger replay when brain step is active
  useEffect(() => {
    if (!isDemoMode) return;

    const step = DEMO_STEPS[currentStepIndex];
    if (step?.id === "brain" && !hasStartedReplayRef.current && !isPaused) {
      hasStartedReplayRef.current = true;
      // Small delay to let the panel open and scroll
      const t = setTimeout(() => {
        startReplay();
      }, 600);
      return () => clearTimeout(t);
    }
  }, [isDemoMode, currentStepIndex, isPaused, startReplay]);

  // --- Auto-advance timer
  useEffect(() => {
    if (!isDemoMode || isPaused) {
      clearTimer();
      return;
    }

    const step = DEMO_STEPS[currentStepIndex];
    if (!step) return;

    // For the brain step, wait for replay to finish before advancing
    if (step.id === "brain" && isReplaying) {
      return;
    }

    timerRef.current = setTimeout(() => {
      nextStep();
    }, step.dwellMs);

    return clearTimer;
  }, [isDemoMode, isPaused, currentStepIndex, isReplaying, nextStep, clearTimer]);

  // --- When replay finishes on brain step, start the dwell timer
  useEffect(() => {
    if (!isDemoMode || isPaused) return;
    const step = DEMO_STEPS[currentStepIndex];

    if (step?.id === "brain" && !isReplaying && hasStartedReplayRef.current) {
      timerRef.current = setTimeout(() => {
        nextStep();
      }, 1500); // Short pause after replay completes
      return clearTimer;
    }
  }, [isDemoMode, isPaused, currentStepIndex, isReplaying, nextStep, clearTimer]);

  // --- Reset replay flag when stepping away from brain
  useEffect(() => {
    const step = DEMO_STEPS[currentStepIndex];
    if (step?.id !== "brain") {
      hasStartedReplayRef.current = false;
    }
  }, [currentStepIndex]);

  // --- Listen for fullscreen changes
  useEffect(() => {
    const handler = () => {
      if (!document.fullscreenElement) {
        useDemoStore.setState({ isFullscreen: false });
      }
    };
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  return {
    isDemoMode,
    isPaused,
    currentStepIndex,
    currentStep: DEMO_STEPS[currentStepIndex] ?? null,
    totalSteps: DEMO_STEPS.length,
    autoReplay,
  };
}
