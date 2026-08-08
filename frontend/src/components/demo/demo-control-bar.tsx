/**
 * Demo Control Bar — Floating glassmorphism control bar for Demo Mode
 *
 * Apple Keynote-inspired presentation controls.
 * Appears at bottom-center when demo mode is active.
 * Contains: Prev, Play/Pause, Next, Step indicators, Auto Replay, Presentation, Fullscreen.
 */

"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  SkipBack,
  Play,
  Pause,
  SkipForward,
  Repeat,
  Monitor,
  Maximize,
  Minimize,
  RotateCcw,
  X,
} from "lucide-react";

import { useDemoStore, DEMO_STEPS } from "@/store/demo-store";

function ControlButton({
  onClick,
  active,
  label,
  children,
  size = "default",
}: {
  onClick: () => void;
  active?: boolean;
  label: string;
  children: React.ReactNode;
  size?: "default" | "large";
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.92 }}
      onClick={onClick}
      aria-label={label}
      className={`flex items-center justify-center rounded-xl transition-colors ${
        size === "large" ? "size-10" : "size-8"
      } ${
        active
          ? "bg-[#4F46E5] text-white shadow-md shadow-[#4F46E5]/25"
          : "text-[#6B7280] hover:bg-[#F3F5F7] hover:text-[#111827]"
      }`}
    >
      {children}
    </motion.button>
  );
}

function StepIndicator({
  step,
  isActive,
  isCompleted,
  onClick,
}: {
  step: (typeof DEMO_STEPS)[number];
  isActive: boolean;
  isCompleted: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="flex items-center gap-1.5 group cursor-pointer"
      aria-label={`Go to ${step.label}`}
    >
      {/* Dot */}
      <motion.div
        animate={{
          backgroundColor: isActive
            ? "#4F46E5"
            : isCompleted
            ? "#16A34A"
            : "#D1D5DB",
          scale: isActive ? 1.3 : 1,
        }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className="size-2 rounded-full"
      />

      {/* Label — only visible on larger screens */}
      <span
        className={`text-[10px] font-medium tracking-wide hidden lg:inline transition-colors ${
          isActive
            ? "text-[#4F46E5]"
            : isCompleted
            ? "text-[#16A34A]"
            : "text-[#9CA3AF] group-hover:text-[#6B7280]"
        }`}
      >
        {step.label}
      </span>
    </motion.button>
  );
}

export function DemoControlBar() {
  const isDemoMode = useDemoStore((s) => s.isDemoMode);
  const isPaused = useDemoStore((s) => s.isPaused);
  const isPresentation = useDemoStore((s) => s.isPresentation);
  const isFullscreen = useDemoStore((s) => s.isFullscreen);
  const autoReplay = useDemoStore((s) => s.autoReplay);
  const currentStepIndex = useDemoStore((s) => s.currentStepIndex);

  const pauseDemo = useDemoStore((s) => s.pauseDemo);
  const resumeDemo = useDemoStore((s) => s.resumeDemo);
  const restartDemo = useDemoStore((s) => s.restartDemo);
  const nextStep = useDemoStore((s) => s.nextStep);
  const prevStep = useDemoStore((s) => s.prevStep);
  const setStepIndex = useDemoStore((s) => s.setStepIndex);
  const stopDemo = useDemoStore((s) => s.stopDemo);
  const togglePresentation = useDemoStore((s) => s.togglePresentation);
  const toggleFullscreen = useDemoStore((s) => s.toggleFullscreen);
  const toggleAutoReplay = useDemoStore((s) => s.toggleAutoReplay);

  return (
    <AnimatePresence>
      {isDemoMode && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 28 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] select-none"
        >
          <div className="flex items-center gap-1 rounded-2xl border border-[#E5E7EB]/60 bg-white/80 backdrop-blur-xl px-3 py-2 shadow-2xl shadow-black/[0.08]">
            {/* === Transport Controls === */}
            <div className="flex items-center gap-0.5">
              <ControlButton onClick={prevStep} label="Previous step">
                <SkipBack className="size-3.5" />
              </ControlButton>

              <ControlButton
                onClick={isPaused ? resumeDemo : pauseDemo}
                label={isPaused ? "Resume" : "Pause"}
                size="large"
                active={!isPaused}
              >
                {isPaused ? (
                  <Play className="size-4 ml-0.5" />
                ) : (
                  <Pause className="size-4" />
                )}
              </ControlButton>

              <ControlButton onClick={nextStep} label="Next step">
                <SkipForward className="size-3.5" />
              </ControlButton>
            </div>

            {/* === Divider === */}
            <div className="mx-1.5 h-6 w-px bg-[#E5E7EB]" />

            {/* === Step Progress === */}
            <div className="flex items-center gap-2 px-1">
              {/* Connecting line behind dots */}
              <div className="relative flex items-center gap-3">
                {/* Background track */}
                <div className="absolute top-1/2 left-1 right-1 h-px bg-[#E5E7EB] -translate-y-1/2 pointer-events-none" />

                {/* Progress fill */}
                <motion.div
                  className="absolute top-1/2 left-1 h-px bg-[#4F46E5] -translate-y-1/2 pointer-events-none origin-left"
                  animate={{
                    width: `${(currentStepIndex / Math.max(1, DEMO_STEPS.length - 1)) * 100}%`,
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />

                {DEMO_STEPS.map((step, idx) => (
                  <StepIndicator
                    key={step.id}
                    step={step}
                    isActive={idx === currentStepIndex}
                    isCompleted={idx < currentStepIndex}
                    onClick={() => setStepIndex(idx)}
                  />
                ))}
              </div>
            </div>

            {/* === Divider === */}
            <div className="mx-1.5 h-6 w-px bg-[#E5E7EB]" />

            {/* === Mode Controls === */}
            <div className="flex items-center gap-0.5">
              <ControlButton
                onClick={restartDemo}
                label="Restart demo"
              >
                <RotateCcw className="size-3.5" />
              </ControlButton>

              <ControlButton
                onClick={toggleAutoReplay}
                active={autoReplay}
                label={autoReplay ? "Disable auto replay" : "Enable auto replay"}
              >
                <Repeat className="size-3.5" />
              </ControlButton>

              <ControlButton
                onClick={togglePresentation}
                active={isPresentation}
                label={isPresentation ? "Exit presentation" : "Presentation mode"}
              >
                <Monitor className="size-3.5" />
              </ControlButton>

              <ControlButton
                onClick={toggleFullscreen}
                label={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
              >
                {isFullscreen ? (
                  <Minimize className="size-3.5" />
                ) : (
                  <Maximize className="size-3.5" />
                )}
              </ControlButton>
            </div>

            {/* === Divider === */}
            <div className="mx-1 h-6 w-px bg-[#E5E7EB]" />

            {/* === Close === */}
            <ControlButton onClick={stopDemo} label="Exit demo mode">
              <X className="size-3.5" />
            </ControlButton>
          </div>

          {/* Step counter label */}
          <motion.div
            key={currentStepIndex}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-2 text-center text-[10px] font-medium text-[#9CA3AF]"
          >
            Step {currentStepIndex + 1} of {DEMO_STEPS.length} —{" "}
            {DEMO_STEPS[currentStepIndex]?.label}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
