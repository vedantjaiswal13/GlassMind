/**
 * Explainability Relationship Graph
 *
 * Static mappings that drive context-aware cross-module highlighting.
 */

import type { StageType } from "@/store/app-store";
import type { CitationMeta, ReplayStep } from "@/types/explainability";

export const NODE_TO_STAGE: Record<string, StageType> = {
  planner: "Planning",
  retriever: "Searching",
  memory: "Searching",
  evidence: "Checking Documents",
  reasoner: "Checking Documents",
  verification: "Decision",
  answer: "Generating",
};

export const NODE_TO_SOURCES: Record<string, string[]> = {
  planner: [],
  retriever: ["doc-1", "doc-2"],
  memory: ["doc-1"],
  evidence: ["doc-1", "doc-2"],
  reasoner: ["doc-1"],
  verification: [],
  answer: ["doc-1"],
};

export const NODE_TO_CLAIMS: Record<string, string[]> = {
  planner: [],
  retriever: ["claim-1", "claim-2", "claim-3"],
  memory: [],
  evidence: ["claim-1", "claim-2", "claim-3", "claim-4"],
  reasoner: ["claim-2", "claim-3"],
  verification: ["claim-3"],
  answer: ["claim-1", "claim-2", "claim-3"],
};

export const NODE_TO_GENOME: Record<string, string[]> = {
  planner: ["reasoning"],
  retriever: ["retrieval", "evidence"],
  memory: ["reasoning"],
  evidence: ["grounding", "evidence"],
  reasoner: ["reasoning", "agreement"],
  verification: ["verification", "hallucination"],
  answer: ["grounding", "verification"],
};

export const SOURCE_TO_NODES: Record<string, string[]> = {
  "doc-1": ["retriever", "evidence", "answer"],
  "doc-2": ["retriever", "evidence"],
};

export const SOURCE_TO_CLAIMS: Record<string, string[]> = {
  "doc-1": ["claim-1", "claim-2", "claim-3"],
  "doc-2": ["claim-2", "claim-3", "claim-4"],
};

export const CLAIM_TO_NODES: Record<string, string[]> = {
  "claim-1": ["evidence", "answer"],
  "claim-2": ["evidence", "reasoner"],
  "claim-3": ["evidence", "verification"],
  "claim-4": ["evidence"],
};

export const GENOME_TO_NODES: Record<string, string[]> = {
  grounding: ["evidence"],
  reasoning: ["reasoner", "planner"],
  agreement: ["reasoner"],
  evidence: ["evidence", "retriever"],
  hallucination: ["verification"],
  verification: ["verification"],
  retrieval: ["retriever"],
};

export const GENOME_TO_SOURCES: Record<string, string[]> = {
  grounding: ["doc-1"],
  evidence: ["doc-1", "doc-2"],
  retrieval: ["doc-1", "doc-2"],
  hallucination: [],
  verification: [],
  reasoning: [],
  agreement: [],
};

export const CITATIONS: CitationMeta[] = [
  {
    id: "cite-doc-1",
    sourceId: "doc-1",
    label: "GlassMind_Architecture_Spec.pdf",
    claimIds: ["claim-1", "claim-2", "claim-3"],
    nodeIds: ["evidence", "answer"],
  },
  {
    id: "cite-doc-2",
    sourceId: "doc-2",
    label: "XAI_Model_Interpretability_Benchmark.pdf",
    claimIds: ["claim-2", "claim-3", "claim-4"],
    nodeIds: ["retriever", "evidence"],
  },
];

export const REPLAY_SEQUENCE: ReplayStep[] = [
  {
    nodeId: "planner",
    stage: "Planning",
    sourceIds: [],
    claimIds: [],
    genomePairIds: ["reasoning"],
    trustProgress: 0.15,
  },
  {
    nodeId: "retriever",
    stage: "Searching",
    sourceIds: ["doc-1", "doc-2"],
    claimIds: ["claim-1", "claim-2", "claim-3"],
    genomePairIds: ["retrieval"],
    trustProgress: 0.35,
  },
  {
    nodeId: "memory",
    stage: "Searching",
    sourceIds: ["doc-1"],
    claimIds: [],
    genomePairIds: ["reasoning"],
    trustProgress: 0.45,
  },
  {
    nodeId: "evidence",
    stage: "Checking Documents",
    sourceIds: ["doc-1", "doc-2"],
    claimIds: ["claim-1", "claim-2", "claim-3", "claim-4"],
    genomePairIds: ["grounding", "evidence"],
    trustProgress: 0.65,
  },
  {
    nodeId: "reasoner",
    stage: "Checking Documents",
    sourceIds: ["doc-1"],
    claimIds: ["claim-2", "claim-3"],
    genomePairIds: ["reasoning", "agreement"],
    trustProgress: 0.75,
  },
  {
    nodeId: "verification",
    stage: "Decision",
    sourceIds: [],
    claimIds: ["claim-3"],
    genomePairIds: ["verification", "hallucination"],
    trustProgress: 0.88,
  },
  {
    nodeId: "answer",
    stage: "Generating",
    sourceIds: ["doc-1"],
    claimIds: ["claim-1", "claim-2", "claim-3"],
    genomePairIds: ["grounding", "verification"],
    trustProgress: 0.964,
  },
];

export const BRAIN_NODE_ORDER = REPLAY_SEQUENCE.map((s) => s.nodeId);
