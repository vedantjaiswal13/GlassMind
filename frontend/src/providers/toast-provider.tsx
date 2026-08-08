/**
 * Toast Provider
 *
 * Configures Sonner toast notifications with theme-aware styling.
 * Import and place <ToastProvider /> in the provider tree.
 */

"use client";

import { useTheme } from "next-themes";
import { Toaster } from "sonner";

export function ToastProvider() {
  const { theme = "system" } = useTheme();

  return (
    <Toaster
      theme={theme as "light" | "dark" | "system"}
      position="bottom-right"
      richColors
      closeButton
      toastOptions={{
        duration: 4000,
      }}
    />
  );
}
