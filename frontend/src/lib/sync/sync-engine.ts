/**
 * Sync Engine — Computes context-aware highlight bundles from hover events
 */

import type { StageType } from "@/store/app-store";
import type { HighlightContext, HoverEvent } from "@/types/explainability";
import {
  CLAIM_TO_NODES,
  CITATIONS,
  GENOME_TO_NODES,
  GENOME_TO_SOURCES,
  NODE_TO_CLAIMS,
  NODE_TO_GENOME,
  NODE_TO_SOURCES,
  NODE_TO_STAGE,
  SOURCE_TO_CLAIMS,
  SOURCE_TO_NODES,
} from "./relationships";

const EMPTY_CONTEXT: HighlightContext = {
  nodeIds: new Set(),
  sourceIds: new Set(),
  claimIds: new Set(),
  citationIds: new Set(),
  genomePairIds: new Set(),
  chunkIds: new Set(),
  stage: null,
  dimOthers: false,
};

function mergeFromNode(ctx: HighlightContext, nodeId: string): void {
  ctx.nodeIds.add(nodeId);
  ctx.stage = NODE_TO_STAGE[nodeId] ?? ctx.stage;
  NODE_TO_SOURCES[nodeId]?.forEach((id) => ctx.sourceIds.add(id));
  NODE_TO_CLAIMS[nodeId]?.forEach((id) => ctx.claimIds.add(id));
  NODE_TO_GENOME[nodeId]?.forEach((id) => ctx.genomePairIds.add(id));
}

function mergeFromSource(ctx: HighlightContext, sourceId: string): void {
  ctx.sourceIds.add(sourceId);
  SOURCE_TO_NODES[sourceId]?.forEach((id) => {
    ctx.nodeIds.add(id);
    ctx.stage = NODE_TO_STAGE[id] ?? ctx.stage;
  });
  SOURCE_TO_CLAIMS[sourceId]?.forEach((id) => ctx.claimIds.add(id));
  CITATIONS.filter((c) => c.sourceId === sourceId).forEach((c) => {
    ctx.citationIds.add(c.id);
    c.claimIds.forEach((id) => ctx.claimIds.add(id));
    c.nodeIds.forEach((id) => ctx.nodeIds.add(id));
  });
  if (sourceId === "doc-1" || sourceId === "doc-2") {
    ctx.genomePairIds.add("grounding");
    ctx.genomePairIds.add("evidence");
  }
}

function mergeFromClaim(ctx: HighlightContext, claimId: string): void {
  ctx.claimIds.add(claimId);
  CLAIM_TO_NODES[claimId]?.forEach((id) => mergeFromNode(ctx, id));
  CITATIONS.filter((c) => c.claimIds.includes(claimId)).forEach((c) =>
    ctx.citationIds.add(c.id)
  );
}

function mergeFromGenome(ctx: HighlightContext, pairId: string): void {
  ctx.genomePairIds.add(pairId);
  GENOME_TO_NODES[pairId]?.forEach((id) => mergeFromNode(ctx, id));
  GENOME_TO_SOURCES[pairId]?.forEach((id) => ctx.sourceIds.add(id));
}

function mergeFromCitation(ctx: HighlightContext, citationId: string): void {
  const citation = CITATIONS.find((c) => c.id === citationId);
  if (!citation) return;
  ctx.citationIds.add(citationId);
  ctx.sourceIds.add(citation.sourceId);
  citation.claimIds.forEach((id) => ctx.claimIds.add(id));
  citation.nodeIds.forEach((id) => mergeFromNode(ctx, id));
}

export function computeHighlightContext(
  event: HoverEvent | null,
  replayHighlights?: Partial<HighlightContext> | null
): HighlightContext {
  if (replayHighlights) {
    return {
      nodeIds: new Set(replayHighlights.nodeIds ?? []),
      sourceIds: new Set(replayHighlights.sourceIds ?? []),
      claimIds: new Set(replayHighlights.claimIds ?? []),
      citationIds: new Set(replayHighlights.citationIds ?? []),
      genomePairIds: new Set(replayHighlights.genomePairIds ?? []),
      chunkIds: new Set(replayHighlights.chunkIds ?? []),
      stage: replayHighlights.stage ?? null,
      dimOthers: true,
    };
  }

  if (!event?.targetId) return { ...EMPTY_CONTEXT };

  const ctx: HighlightContext = {
    nodeIds: new Set(),
    sourceIds: new Set(),
    claimIds: new Set(),
    citationIds: new Set(),
    genomePairIds: new Set(),
    chunkIds: new Set(),
    stage: null,
    dimOthers: true,
  };

  switch (event.targetType) {
    case "node":
    case "timeline":
      mergeFromNode(ctx, event.targetId);
      break;
    case "source":
    case "pdf":
      mergeFromSource(ctx, event.targetId);
      break;
    case "claim":
    case "evidence":
      mergeFromClaim(ctx, event.targetId);
      break;
    case "genome":
      mergeFromGenome(ctx, event.targetId);
      break;
    case "citation":
      mergeFromCitation(ctx, event.targetId);
      break;
  }

  return ctx;
}

export function isHighlighted(
  ctx: HighlightContext,
  type: "node" | "source" | "claim" | "citation" | "genome",
  id: string
): boolean {
  switch (type) {
    case "node":
      return ctx.nodeIds.has(id);
    case "source":
      return ctx.sourceIds.has(id);
    case "claim":
      return ctx.claimIds.has(id);
    case "citation":
      return ctx.citationIds.has(id);
    case "genome":
      return ctx.genomePairIds.has(id);
  }
}

export function resolveStage(ctx: HighlightContext): StageType | null {
  return ctx.stage;
}
