/**
 * Root Providers
 *
 * Composes all application providers into a single tree.
 * Import this in the root layout to wrap the entire application.
 *
 * Provider order (outermost → innermost):
 * 1. ThemeProvider — dark/light/system theme
 * 2. QueryProvider — TanStack Query for server state
 * 3. ToastProvider — Sonner toast notifications
 */

"use client";

import type { ReactNode } from "react";

import { QueryProvider } from "@/providers/query-provider";
import { SyncProvider } from "@/providers/sync-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import { ToastProvider } from "@/providers/toast-provider";

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider>
      <QueryProvider>
        <SyncProvider>
          {children}
        </SyncProvider>
        <ToastProvider />
      </QueryProvider>
    </ThemeProvider>
  );
}
