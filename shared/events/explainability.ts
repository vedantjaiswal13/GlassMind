/**
 * Shared Explainability Events — Cross-package event contracts
 */

export type SyncOrigin =
  | "brain"
  | "timeline"
  | "evidence"
  | "citation"
  | "genome"
  | "pdf"
  | "counterfactual"
  | "replay"
  | "websocket";

export type SyncEventType =
  | "hover:start"
  | "hover:end"
  | "select:node"
  | "replay:start"
  | "replay:step"
  | "replay:end"
  | "stage:change"
  | "trust:update"
  | "scroll:citation";

export interface SyncWsHoverEvent {
  origin: SyncOrigin;
  targetType: "node" | "source" | "claim" | "citation" | "genome" | "timeline" | "pdf";
  targetId: string | null;
}

export interface SyncWsReplayStepEvent {
  nodeId: string;
  stage: string;
  sourceIds: string[];
  claimIds: string[];
  genomePairIds: string[];
  trustProgress: number;
}

export interface SyncWsMessage {
  type: SyncEventType;
  payload: unknown;
  timestamp?: number;
}
