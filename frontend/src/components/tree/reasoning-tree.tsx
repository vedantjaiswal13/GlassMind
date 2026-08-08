/**
 * Reasoning Tree Component — Query Decomposition & Sub-Task Hierarchy
 *
 * Visualizes hierarchical query decomposition into intent, retrieval sub-tasks,
 * verification gates, and consensus synthesis.
 */

"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Network, ChevronRight, CheckCircle2, Cpu, Database, ShieldCheck, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface TreeNode {
  id: string;
  label: string;
  type: "root" | "intent" | "subquery" | "retriever" | "verification" | "synthesis";
  status: "completed" | "active" | "pending";
  confidence?: number;
  children?: TreeNode[];
}

const TREE_DATA: TreeNode = {
  id: "node-root",
  label: "User Query: Multi-Agent XAI Architecture & Confidence Scoring",
  type: "root",
  status: "completed",
  confidence: 96.4,
  children: [
    {
      id: "node-intent",
      label: "Intent Parser: Decompose query into 2 parallel sub-tasks",
      type: "intent",
      status: "completed",
      confidence: 98.0,
      children: [
        {
          id: "node-sub1",
          label: "Sub-task A: FastAPI & Vector Index Architecture",
          type: "subquery",
          status: "completed",
          confidence: 94.0,
          children: [
            {
              id: "node-ret1",
              label: "Qdrant Dense Vector Search (4 chunks retrieved)",
              type: "retriever",
              status: "completed",
              confidence: 94.0,
            },
          ],
        },
        {
          id: "node-sub2",
          label: "Sub-task B: SHAP Feature Attribution & Trust Score",
          type: "subquery",
          status: "completed",
          confidence: 91.5,
          children: [
            {
              id: "node-ver1",
              label: "Zero-Hallucination Bound Verification",
              type: "verification",
              status: "completed",
              confidence: 96.4,
            },
          ],
        },
      ],
    },
    {
      id: "node-synthesis",
      label: "Consensus Engine: Answer Synthesis & Citation Grounding",
      type: "synthesis",
      status: "completed",
      confidence: 96.4,
    },
  ],
};

function TreeNodeRow({ node, depth = 0 }: { node: TreeNode; depth?: number }) {
  const [expanded, setExpanded] = React.useState(true);
  const hasChildren = node.children && node.children.length > 0;

  const getIcon = (type: TreeNode["type"]) => {
    switch (type) {
      case "root":
        return <Sparkles className="size-3.5 text-[#4F46E5]" />;
      case "intent":
        return <Cpu className="size-3.5 text-purple-600" />;
      case "subquery":
        return <Network className="size-3.5 text-blue-600" />;
      case "retriever":
        return <Database className="size-3.5 text-indigo-600" />;
      case "verification":
        return <ShieldCheck className="size-3.5 text-[#16A34A]" />;
      case "synthesis":
        return <CheckCircle2 className="size-3.5 text-[#16A34A]" />;
    }
  };

  return (
    <div className="flex flex-col space-y-1.5 select-none">
      <div
        onClick={() => hasChildren && setExpanded(!expanded)}
        style={{ paddingLeft: `${depth * 16}px` }}
        className={`group flex items-center justify-between rounded-xl border p-2.5 transition-all cursor-pointer ${
          depth === 0
            ? "border-[#4F46E5]/40 bg-[#EEF2FF]/40 shadow-2xs"
            : "border-[#E5E7EB] bg-[#FFFFFF] hover:border-[#D1D5DB] hover:bg-[#FCFCFD]"
        }`}
      >
        <div className="flex items-center gap-2 overflow-hidden">
          {hasChildren ? (
            <ChevronRight
              className={`size-3.5 text-[#6B7280] transition-transform duration-200 shrink-0 ${
                expanded ? "rotate-90" : ""
              }`}
            />
          ) : (
            <span className="size-3.5 shrink-0" />
          )}

          <div className="flex size-6 shrink-0 items-center justify-center rounded-lg bg-[#F3F5F7] group-hover:bg-[#EEF2FF]">
            {getIcon(node.type)}
          </div>

          <span className="truncate text-xs font-medium text-[#111827]">
            {node.label}
          </span>
        </div>

        {node.confidence && (
          <Badge
            variant="outline"
            className="border-[#16A34A]/30 bg-[#F0FDF4] text-[10px] font-mono text-[#16A34A] shrink-0 ml-2"
          >
            {node.confidence}%
          </Badge>
        )}
      </div>

      {hasChildren && expanded && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-1.5 overflow-hidden border-l border-[#E5E7EB] ml-3 pl-1"
          >
            {node.children!.map((child) => (
              <TreeNodeRow key={child.id} node={child} depth={depth + 1} />
            ))}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}

export function ReasoningTree() {
  return (
    <div className="flex w-full flex-col rounded-[20px] border border-[#E5E7EB] bg-[#FFFFFF] p-4 shadow-xs select-none space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-xl bg-[#EEF2FF] text-[#4F46E5] border border-[#4F46E5]/20">
            <Network className="size-4" />
          </div>
          <div>
            <h3 className="text-body font-semibold text-[#111827]">
              🌲 Reasoning Tree
            </h3>
            <p className="text-secondary text-[#6B7280]">
              Hierarchical query decomposition & sub-task execution tree.
            </p>
          </div>
        </div>
      </div>

      {/* Tree Content */}
      <div className="rounded-2xl border border-[#E5E7EB] bg-[#FCFCFD] p-3 space-y-2">
        <TreeNodeRow node={TREE_DATA} />
      </div>
    </div>
  );
}
