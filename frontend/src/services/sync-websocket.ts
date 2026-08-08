/**
 * Sync WebSocket Service — Remote explainability event ingress
 *
 * Connects backend WebSocket events directly to the global sync store.
 * Falls back gracefully when no backend is available.
 */

import { useSyncStore } from "@/store/sync-store";
import { useAppStore, type StageType } from "@/store/app-store";
import type { HoverEvent } from "@/types/explainability";

const WS_URL =
  process.env.NEXT_PUBLIC_SYNC_WS_URL ?? "ws://localhost:8000/ws/explainability";

type WsMessage =
  | { type: "hover"; payload: HoverEvent }
  | { type: "replay:start"; payload: { speed: number } }
  | { type: "stage:change"; payload: { stage: StageType } }
  | { type: "trust:update"; payload: { progress: number } };

class SyncWebSocketService {
  private ws: WebSocket | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private disposed = false;

  connect(): void {
    if (typeof window === "undefined" || this.disposed) return;

    try {
      this.ws = new WebSocket(WS_URL);

      this.ws.onopen = () => {
        if (this.reconnectTimer) {
          clearTimeout(this.reconnectTimer);
          this.reconnectTimer = null;
        }
      };

      this.ws.onmessage = (event) => {
        try {
          const msg: WsMessage = JSON.parse(event.data);
          this.handleMessage(msg);
        } catch {
          // Ignore malformed messages
        }
      };

      this.ws.onclose = () => {
        this.scheduleReconnect();
      };

      this.ws.onerror = () => {
        this.ws?.close();
      };
    } catch {
      this.scheduleReconnect();
    }
  }

  private handleMessage(msg: WsMessage): void {
    switch (msg.type) {
      case "hover":
        useSyncStore.getState().ingestRemoteHover(msg.payload);
        break;
      case "replay:start":
        useSyncStore.getState().startReplay();
        break;
      case "stage:change":
        useAppStore.getState().setCurrentStage(msg.payload.stage);
        break;
      case "trust:update":
        useAppStore.getState().setTrustScoreProgress(msg.payload.progress);
        break;
    }
  }

  send(event: WsMessage): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(event));
    }
  }

  private scheduleReconnect(): void {
    if (this.disposed || this.reconnectTimer) return;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, 5000);
  }

  disconnect(): void {
    this.disposed = true;
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.ws?.close();
    this.ws = null;
  }
}

export const syncWebSocket = new SyncWebSocketService();
