/**
 * Explainability Sync Types — Cross-module synchronization contracts
 */

import type { StageType } from "@/store/app-store";

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

export type NodeState = "inactive" | "active" | "completed";

export type HoverTargetType =
  | "node"
  | "source"
  | "claim"
  | "citation"
  | "genome"
  | "timeline"
  | "evidence"
  | "pdf";

export interface HoverEvent {
  origin: SyncOrigin;
  targetType: HoverTargetType;
  targetId: string | null;
}

export interface HighlightContext {
  nodeIds: Set<string>;
  sourceIds: Set<string>;
  claimIds: Set<string>;
  citationIds: Set<string>;
  genomePairIds: Set<string>;
  chunkIds: Set<string>;
  stage: StageType | null;
  dimOthers: boolean;
}

export interface ReplayStep {
  nodeId: string;
  stage: StageType;
  sourceIds: string[];
  claimIds: string[];
  genomePairIds: string[];
  trustProgress: number;
}



export interface CitationMeta {
  id: string;
  sourceId: string;
  label: string;
  claimIds: string[];
  nodeIds: string[];
}
