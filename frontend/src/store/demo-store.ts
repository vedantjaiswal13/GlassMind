/**
 * Demo Store — Zustand state for Demo Mode orchestration
 *
 * Manages the guided demo experience: step sequencing, pause/resume,
 * presentation mode, fullscreen, and auto-replay loop.
 */

import { create } from "zustand";
import { devtools } from "zustand/middleware";

export interface DemoStep {
  id: string;
  sectionId: string;
  label: string;
  description: string;
  dwellMs: number;
}

export const DEMO_STEPS: DemoStep[] = [
  {
    id: "brain",
    sectionId: "demo-section-brain",
    label: "AI Brain",
    description:
      "Neural execution graph — each node represents an AI reasoning agent processing your query in real-time.",
    dwellMs: 7000,
  },
  {
    id: "timeline",
    sectionId: "demo-section-timeline",
    label: "Timeline",
    description:
      "Chronological stage breakdown — latency, evidence chunks, and confidence metrics for each execution phase.",
    dwellMs: 7000,
  },
  {
    id: "evidence",
    sectionId: "demo-section-evidence",
    label: "Evidence",
    description:
      "Claims mapped to source documents — constellation view showing AI reasoning grounded in your uploaded PDFs.",
    dwellMs: 8000,
  },
  {
    id: "trust",
    sectionId: "demo-section-trust",
    label: "Trust",
    description:
      "DNA-inspired confidence helix — each base pair represents a trust dimension scored independently.",
    dwellMs: 7000,
  },
  {
    id: "counterfactual",
    sectionId: "demo-section-counterfactual",
    label: "Counterfactual",
    description:
      "What-if analysis — perturb inputs and observe how the AI reasoning shifts. Validates logical stability.",
    dwellMs: 7000,
  },
];

interface DemoStoreState {
  isDemoMode: boolean;
  isPaused: boolean;
  isPresentation: boolean;
  isFullscreen: boolean;
  autoReplay: boolean;
  currentStepIndex: number;
  demoSpeed: number;

  startDemo: () => void;
  stopDemo: () => void;
  pauseDemo: () => void;
  resumeDemo: () => void;
  restartDemo: () => void;
  nextStep: () => void;
  prevStep: () => void;
  setStepIndex: (index: number) => void;
  togglePresentation: () => void;
  toggleFullscreen: () => void;
  toggleAutoReplay: () => void;
}

export const useDemoStore = create<DemoStoreState>()(
  devtools(
    (set, get) => ({
      isDemoMode: false,
      isPaused: false,
      isPresentation: false,
      isFullscreen: false,
      autoReplay: true,
      currentStepIndex: 0,
      demoSpeed: 1,

      startDemo: () => {
        set({
          isDemoMode: true,
          isPaused: false,
          currentStepIndex: 0,
        });
      },

      stopDemo: () => {
        set({
          isDemoMode: false,
          isPaused: false,
          isPresentation: false,
          currentStepIndex: 0,
        });
        // Exit fullscreen if active
        if (document.fullscreenElement) {
          document.exitFullscreen().catch(() => {});
        }
      },

      pauseDemo: () => set({ isPaused: true }),

      resumeDemo: () => set({ isPaused: false }),

      restartDemo: () => {
        set({
          currentStepIndex: 0,
          isPaused: false,
        });
      },

      nextStep: () => {
        const { currentStepIndex, autoReplay } = get();
        const nextIndex = currentStepIndex + 1;
        if (nextIndex >= DEMO_STEPS.length) {
          if (autoReplay) {
            set({ currentStepIndex: 0 });
          } else {
            set({ isPaused: true });
          }
        } else {
          set({ currentStepIndex: nextIndex });
        }
      },

      prevStep: () => {
        const { currentStepIndex } = get();
        set({ currentStepIndex: Math.max(0, currentStepIndex - 1) });
      },

      setStepIndex: (index) => {
        if (index >= 0 && index < DEMO_STEPS.length) {
          set({ currentStepIndex: index, isPaused: false });
        }
      },

      togglePresentation: () =>
        set((s) => ({ isPresentation: !s.isPresentation })),

      toggleFullscreen: () => {
        const { isFullscreen } = get();
        if (!isFullscreen) {
          document.documentElement
            .requestFullscreen()
            .then(() => set({ isFullscreen: true }))
            .catch(() => {});
        } else {
          document
            .exitFullscreen()
            .then(() => set({ isFullscreen: false }))
            .catch(() => {});
        }
      },

      toggleAutoReplay: () => set((s) => ({ autoReplay: !s.autoReplay })),
    }),
    { name: "glassmind-demo-store" }
  )
);
