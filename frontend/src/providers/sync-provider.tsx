/**
 * SyncProvider — Initializes WebSocket wiring and sync store notifier
 */

"use client";

import * as React from "react";

import { registerWsNotifier } from "@/store/sync-store";
import { syncWebSocket } from "@/services/sync-websocket";
import type { HoverEvent } from "@/types/explainability";

export function SyncProvider({ children }: { children: React.ReactNode }) {
  React.useEffect(() => {
    syncWebSocket.connect();

    registerWsNotifier((event: HoverEvent) => {
      syncWebSocket.send({ type: "hover", payload: event });
    });

    return () => {
      registerWsNotifier(null);
      syncWebSocket.disconnect();
    };
  }, []);

  return <>{children}</>;
}
