/**
 * Application Constants
 *
 * Centralized configuration constants used across the application.
 * Environment-specific values are read from NEXT_PUBLIC_* env vars.
 */

// --- API ---
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

// --- App ---
export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME ?? "GlassMind";
export const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION ?? "0.1.0";

// --- Routes ---
export const ROUTES = {
  HOME: "/",
  CHAT: "/chat",
  DASHBOARD: "/dashboard",
  SETTINGS: "/settings",
} as const;

// --- Query Keys ---
export const QUERY_KEYS = {
  HEALTH: ["health"] as const,
} as const;

// --- Local Storage Keys ---
export const STORAGE_KEYS = {
  THEME: "glassmind-theme",
  SIDEBAR_STATE: "glassmind-sidebar",
} as const;

// --- Animation Durations (ms) ---
export const ANIMATION = {
  FAST: 150,
  DEFAULT: 300,
  SLOW: 500,
} as const;
