/**
 * Memoized sync highlight selectors — granular subscriptions per module
 */

import { useCallback } from "react";
import { useShallow } from "zustand/react/shallow";

import { isHighlighted } from "@/lib/sync/sync-engine";
import { useSyncStore } from "@/store/sync-store";
import type { SyncOrigin } from "@/types/explainability";

export function useHighlightContext() {
  return useSyncStore(useShallow((s) => s.highlightContext));
}

export function useIsNodeHighlighted(nodeId: string): boolean {
  return useSyncStore(
    useCallback(
      (s) =>
        s.highlightContext.nodeIds.has(nodeId) ||
        s.selectedNodeId === nodeId,
      [nodeId]
    )
  );
}

export function useIsSourceHighlighted(sourceId: string): boolean {
  return useSyncStore(
    useCallback(
      (s) => s.highlightContext.sourceIds.has(sourceId),
      [sourceId]
    )
  );
}

export function useIsClaimHighlighted(claimId: string): boolean {
  return useSyncStore(
    useCallback(
      (s) => s.highlightContext.claimIds.has(claimId),
      [claimId]
    )
  );
}

export function useIsGenomeHighlighted(pairId: string): boolean {
  return useSyncStore(
    useCallback(
      (s) => s.highlightContext.genomePairIds.has(pairId),
      [pairId]
    )
  );
}

export function useIsCitationHighlighted(citationId: string): boolean {
  return useSyncStore(
    useCallback(
      (s) => s.highlightContext.citationIds.has(citationId),
      [citationId]
    )
  );
}

export function useSyncHoverActions() {
  return useSyncStore(
    useShallow((s) => ({
      dispatchHover: s.dispatchHover,
      dispatchClear: s.dispatchClear,
    }))
  );
}

export function useSyncSelectActions() {
  return useSyncStore(
    useShallow((s) => ({
      selectedNodeId: s.selectedNodeId,
      dispatchSelect: s.dispatchSelect,
    }))
  );
}

export function useSyncReplay() {
  return useSyncStore(
    useShallow((s) => ({
      isReplaying: s.isReplaying,
      replaySpeed: s.replaySpeed,
      replayStepIndex: s.replayStepIndex,
      nodeStates: s.nodeStates,
      startReplay: s.startReplay,
      stopReplay: s.stopReplay,
      setReplaySpeed: s.setReplaySpeed,
    }))
  );
}

export function useCitationScrollTarget() {
  return useSyncStore(
    useShallow((s) => ({
      scrollToCitationId: s.scrollToCitationId,
      acknowledgeCitationScroll: s.acknowledgeCitationScroll,
    }))
  );
}

export function useHighlightCheck(
  type: "node" | "source" | "claim" | "citation" | "genome",
  id: string
): boolean {
  const ctx = useHighlightContext();
  return isHighlighted(ctx, type, id);
}

export function createHoverHandler(
  origin: SyncOrigin,
  targetType: HoverEvent["targetType"],
  dispatchHover: ReturnType<typeof useSyncHoverActions>["dispatchHover"],
  dispatchClear: ReturnType<typeof useSyncHoverActions>["dispatchClear"]
) {
  return {
    onMouseEnter: (targetId: string) =>
      dispatchHover({ origin, targetType, targetId }),
    onMouseLeave: () => dispatchClear(origin),
  };
}

// Re-export HoverEvent type for handler convenience
import type { HoverEvent } from "@/types/explainability";

export type { HoverEvent };
