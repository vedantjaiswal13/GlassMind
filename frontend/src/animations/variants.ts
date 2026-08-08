/**
 * Framer Motion — Animation Variants
 *
 * Reusable animation presets for consistent motion across the app.
 * Import variants and pass to <motion.div variants={fadeIn} />.
 */

import type { Variants } from "framer-motion";

// --- Fade In ---
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.3, ease: "easeOut" },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.2, ease: "easeIn" },
  },
};

// --- Fade In Up ---
export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" },
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: { duration: 0.2, ease: "easeIn" },
  },
};

// --- Fade In Down ---
export const fadeInDown: Variants = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

// --- Scale In ---
export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.3, ease: "easeOut" },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: { duration: 0.2, ease: "easeIn" },
  },
};

// --- Slide In from Left ---
export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.4, ease: "easeOut" },
  },
  exit: {
    opacity: 0,
    x: -40,
    transition: { duration: 0.3, ease: "easeIn" },
  },
};

// --- Slide In from Right ---
export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.4, ease: "easeOut" },
  },
  exit: {
    opacity: 0,
    x: 40,
    transition: { duration: 0.3, ease: "easeIn" },
  },
};

// --- Stagger Container ---
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

// --- Stagger Item ---
export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: "easeOut" },
  },
};

// --- Sync Glow (Highlight) ---
export const syncGlow: Variants = {
  idle: {
    scale: 1,
    boxShadow: "0 0 0 0px rgba(79, 70, 229, 0)",
    transition: { type: "spring", stiffness: 400, damping: 30 },
  },
  highlighted: {
    scale: 1.03,
    boxShadow: "0 0 0 4px rgba(79, 70, 229, 0.25)",
    transition: { type: "spring", stiffness: 400, damping: 30 },
  },
};

// --- Sync Pulse (Active Node) ---
export const syncPulse: Variants = {
  idle: {
    scale: 1,
    opacity: 1,
    transition: { type: "spring", stiffness: 400, damping: 30 },
  },
  pulsing: {
    scale: [1, 1.06, 1],
    opacity: 1,
    transition: { repeat: Infinity, duration: 1.2, ease: "easeInOut" },
  },
};

// --- Sync Dim (Dimmed Background) ---
export const syncDim: Variants = {
  active: {
    opacity: 1,
    scale: 1,
    filter: "saturate(1)",
    transition: { type: "spring", stiffness: 400, damping: 30 },
  },
  dimmed: {
    opacity: 0.3,
    scale: 0.98,
    filter: "saturate(0.5)",
    transition: { type: "spring", stiffness: 400, damping: 30 },
  },
};
