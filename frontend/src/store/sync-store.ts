/**
 * Sync Store — Global Zustand store for explainability synchronization
 *
 * Single source of truth for all cross-module interaction state.
 * Uses subscribeWithSelector for granular subscriptions and memoized
 * highlight context to avoid unnecessary rerenders across modules.
 */

import { create } from "zustand";
import { devtools, subscribeWithSelector } from "zustand/middleware";

import { computeHighlightContext } from "@/lib/sync/sync-engine";
import { REPLAY_SEQUENCE } from "@/lib/sync/relationships";
import { useAppStore, type StageType } from "@/store/app-store";
import type {
  HighlightContext,
  HoverEvent,
  NodeState,
  SyncOrigin,
} from "@/types/explainability";

const INITIAL_NODE_STATES: Record<string, NodeState> = {
  planner: "completed",
  retriever: "completed",
  memory: "completed",
  evidence: "completed",
  reasoner: "completed",
  verification: "completed",
  answer: "completed",
};

const IDLE_CONTEXT: HighlightContext = {
  nodeIds: new Set(),
  sourceIds: new Set(),
  claimIds: new Set(),
  citationIds: new Set(),
  genomePairIds: new Set(),
  chunkIds: new Set(),
  stage: null,
  dimOthers: false,
};

let replayTimers: ReturnType<typeof setTimeout>[] = [];

function clearReplayTimers(): void {
  replayTimers.forEach(clearTimeout);
  replayTimers = [];
}

type WsNotifier = (event: HoverEvent) => void;
let wsNotifierCallback: WsNotifier | null = null;

export function registerWsNotifier(notifier: WsNotifier | null): void {
  wsNotifierCallback = notifier;
}

interface SyncStoreState {
  syncOrigin: SyncOrigin | null;
  activeHover: HoverEvent | null;
  highlightContext: HighlightContext;
  selectedNodeId: string | null;
  scrollToCitationId: string | null;

  isReplaying: boolean;
  replaySpeed: 0.5 | 1 | 2;
  replayStepIndex: number;
  nodeStates: Record<string, NodeState>;

  dispatchHover: (event: HoverEvent) => void;
  dispatchClear: (origin: SyncOrigin) => void;
  dispatchSelect: (nodeId: string | null) => void;
  ingestRemoteHover: (event: HoverEvent) => void;
  startReplay: () => void;
  stopReplay: () => void;
  setReplaySpeed: (speed: 0.5 | 1 | 2) => void;
  acknowledgeCitationScroll: () => void;
}

export const useSyncStore = create<SyncStoreState>()(
  subscribeWithSelector(
    devtools(
      (set, get) => ({
        syncOrigin: null,
        activeHover: null,
        highlightContext: IDLE_CONTEXT,
        selectedNodeId: null,
        scrollToCitationId: null,

        isReplaying: false,
        replaySpeed: 1,
        replayStepIndex: -1,
        nodeStates: { ...INITIAL_NODE_STATES },

        dispatchHover: (event) => {
          if (get().isReplaying) return;

          const highlightContext = computeHighlightContext(event);
          const scrollToCitationId =
            highlightContext.citationIds.size > 0
              ? [...highlightContext.citationIds][0]
              : null;

          set({
            syncOrigin: event.origin,
            activeHover: event,
            highlightContext,
            scrollToCitationId,
          });

          if (highlightContext.stage) {
            useAppStore.getState().setCurrentStage(highlightContext.stage);
          }

          if (event.targetId && wsNotifierCallback && event.origin !== "websocket") {
            wsNotifierCallback(event);
          }
        },

        ingestRemoteHover: (event) => {
          if (get().isReplaying) return;

          if (!event.targetId) {
            if (get().syncOrigin === "websocket") {
              set({
                syncOrigin: null,
                activeHover: null,
                highlightContext: IDLE_CONTEXT,
                scrollToCitationId: null,
              });
            }
            return;
          }

          const highlightContext = computeHighlightContext(event);
          const scrollToCitationId =
            highlightContext.citationIds.size > 0
              ? [...highlightContext.citationIds][0]
              : null;

          set({
            syncOrigin: "websocket",
            activeHover: event,
            highlightContext,
            scrollToCitationId,
          });

          if (highlightContext.stage) {
            useAppStore.getState().setCurrentStage(highlightContext.stage);
          }
        },

        dispatchClear: (origin) => {
          if (get().isReplaying) return;
          const { syncOrigin } = get();
          if (syncOrigin !== origin) return;

          set({
            syncOrigin: null,
            activeHover: null,
            highlightContext: IDLE_CONTEXT,
            scrollToCitationId: null,
          });
        },

        dispatchSelect: (nodeId) => {
          set({ selectedNodeId: nodeId });
        },

        startReplay: () => {
          clearReplayTimers();
          const speed = get().replaySpeed;
          const baseDelay = 380 / speed;

          const inactiveStates: Record<string, NodeState> = {};
          REPLAY_SEQUENCE.forEach((step) => {
            inactiveStates[step.nodeId] = "inactive";
          });

          set({
            isReplaying: true,
            replayStepIndex: 0,
            syncOrigin: "replay",
            activeHover: null,
            nodeStates: inactiveStates,
            highlightContext: IDLE_CONTEXT,
            scrollToCitationId: null,
          });

          REPLAY_SEQUENCE.forEach((step, idx) => {
            const startTimer = setTimeout(() => {
              const replayContext = computeHighlightContext(null, {
                nodeIds: new Set([step.nodeId]),
                sourceIds: new Set(step.sourceIds),
                claimIds: new Set(step.claimIds),
                genomePairIds: new Set(step.genomePairIds),
                stage: step.stage,
              });

              set((state) => ({
                replayStepIndex: idx,
                nodeStates: { ...state.nodeStates, [step.nodeId]: "active" },
                highlightContext: replayContext,
              }));

              useAppStore.getState().setCurrentStage(step.stage);
              useAppStore.getState().setTrustScoreProgress(step.trustProgress);

              if (step.sourceIds.length > 0) {
                const citeId = step.sourceIds.includes("doc-1")
                  ? "cite-doc-1"
                  : "cite-doc-2";
                set({ scrollToCitationId: citeId });
              }

              const completeTimer = setTimeout(() => {
                set((state) => ({
                  nodeStates: { ...state.nodeStates, [step.nodeId]: "completed" },
                }));

                if (idx === REPLAY_SEQUENCE.length - 1) {
                  const endTimer = setTimeout(() => {
                    set({
                      isReplaying: false,
                      replayStepIndex: -1,
                      syncOrigin: null,
                      highlightContext: IDLE_CONTEXT,
                      nodeStates: { ...INITIAL_NODE_STATES },
                      scrollToCitationId: null,
                    });
                    useAppStore.getState().setCurrentStage("Generating" as StageType);
                    useAppStore.getState().setTrustScoreProgress(0.964);
                  }, baseDelay * 0.3);
                  replayTimers.push(endTimer);
                }
              }, baseDelay * 0.7);

              replayTimers.push(completeTimer);
            }, idx * baseDelay);

            replayTimers.push(startTimer);
          });
        },

        stopReplay: () => {
          clearReplayTimers();
          set({
            isReplaying: false,
            replayStepIndex: -1,
            syncOrigin: null,
            highlightContext: IDLE_CONTEXT,
            nodeStates: { ...INITIAL_NODE_STATES },
            scrollToCitationId: null,
          });
        },

        setReplaySpeed: (speed) => set({ replaySpeed: speed }),

        acknowledgeCitationScroll: () => set({ scrollToCitationId: null }),
      }),
      { name: "glassmind-sync-store" }
    )
  )
);
