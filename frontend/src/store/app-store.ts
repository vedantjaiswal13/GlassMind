/**
 * Zustand Store - GlassMind B2B Workspace State
 */

import { create } from "zustand";
import { devtools } from "zustand/middleware";

export interface ConversationMeta {
  id: string;
  title: string;
  updatedAt: string;
  documentCount?: number;
}

export interface DocumentMeta {
  id: string;
  name: string;
  size: string;
  type: string;
  uploadedAt: string;
  groundingStatus: "High Grounding" | "Medium Grounding" | "Verified";
  evidenceChunks: number;
  citationCount: number;
  similarityScore: number;
}

export type StageType =
  | "Planning"
  | "Searching"
  | "Checking Documents"
  | "Decision"
  | "Generating";

export type ExplainabilityTabType =
  | "why_this_answer"
  | "where_info_from"
  | "should_i_trust"
  | "how_ai_reached"
  | "brain"
  | "galaxy"
  | "genome"
  | "timeline"
  | "counterfactual"
  | "evolution"
  | "tree";

export type DrawerTabType = ExplainabilityTabType | "sources";

export type AnswerMode = "VERIFIED" | "GENERAL";

interface AppState {
  // --- Sidebar ---
  sidebarOpen: boolean;
  sidebarWidth: number;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setSidebarWidth: (width: number) => void;

  // --- Independent Sources Slide-over Panel ---
  sourcesPanelOpen: boolean;
  toggleSourcesPanel: () => void;
  setSourcesPanelOpen: (open: boolean) => void;

  // --- On-Demand Explainability Drawer ---
  explainabilityDrawerOpen: boolean;
  activeExplainabilityTab: ExplainabilityTabType;
  toggleExplainabilityDrawer: () => void;
  setExplainabilityDrawerOpen: (open: boolean) => void;
  setActiveExplainabilityTab: (tab: ExplainabilityTabType) => void;
  openExplainabilityTab: (tab?: ExplainabilityTabType) => void;

  // --- Legacy Compatibility ---
  activeDrawerTab: DrawerTabType;
  setActiveDrawerTab: (tab: DrawerTabType) => void;

  // --- Search Modal ---
  searchModalOpen: boolean;
  setSearchModalOpen: (open: boolean) => void;

  // --- Active Conversation ---
  activeConversationId: string | null;
  activeConversationTitle: string;
  setActiveConversation: (id: string, title: string) => void;

  // --- Streaming & Reasoning Stages ---
  isStreaming: boolean;
  currentStage: StageType;
  trustScoreProgress: number; // 0 to 1
  answerMode: AnswerMode;
  setIsStreaming: (streaming: boolean) => void;
  setCurrentStage: (stage: StageType) => void;
  setTrustScoreProgress: (score: number) => void;
  setAnswerMode: (mode: AnswerMode) => void;

  // --- Last RAG Response & File Upload ---
  lastResponse: any | null;
  setLastResponse: (response: any | null) => void;
  uploadingFile: boolean;
  setUploadingFile: (uploading: boolean) => void;
  addDocument: (doc: DocumentMeta) => void;

  // --- History & Knowledge Docs ---
  conversations: ConversationMeta[];
  documents: DocumentMeta[];
  addConversation: (title: string) => string;
}

export const useAppStore = create<AppState>()(
  devtools(
    (set) => ({
      // --- Sidebar ---
      sidebarOpen: true,
      sidebarWidth: 260,
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      setSidebarWidth: (width) => set({ sidebarWidth: Math.max(200, Math.min(340, width)) }),

      // --- Sources Panel ---
      sourcesPanelOpen: false,
      toggleSourcesPanel: () =>
        set((state) => ({
          sourcesPanelOpen: !state.sourcesPanelOpen,
          explainabilityDrawerOpen: !state.sourcesPanelOpen ? false : state.explainabilityDrawerOpen,
        })),
      setSourcesPanelOpen: (open) =>
        set((state) => ({
          sourcesPanelOpen: open,
          explainabilityDrawerOpen: open ? false : state.explainabilityDrawerOpen,
        })),

      // --- Explainability Drawer ---
      explainabilityDrawerOpen: false,
      activeExplainabilityTab: "why_this_answer",
      toggleExplainabilityDrawer: () =>
        set((state) => ({
          explainabilityDrawerOpen: !state.explainabilityDrawerOpen,
          sourcesPanelOpen: !state.explainabilityDrawerOpen ? false : state.sourcesPanelOpen,
        })),
      setExplainabilityDrawerOpen: (open) =>
        set((state) => ({
          explainabilityDrawerOpen: open,
          sourcesPanelOpen: open ? false : state.sourcesPanelOpen,
        })),
      setActiveExplainabilityTab: (tab) => set({ activeExplainabilityTab: tab, activeDrawerTab: tab }),
      openExplainabilityTab: (tab) =>
        set((state) => ({
          explainabilityDrawerOpen: true,
          sourcesPanelOpen: false,
          activeExplainabilityTab: tab ?? state.activeExplainabilityTab,
          activeDrawerTab: tab ?? state.activeExplainabilityTab,
        })),

      // --- Legacy Compatibility ---
      activeDrawerTab: "why_this_answer",
      setActiveDrawerTab: (tab) =>
        set({
          activeDrawerTab: tab,
          activeExplainabilityTab: tab === "sources" ? "why_this_answer" : tab,
        }),

      // --- Search Modal ---
      searchModalOpen: false,
      setSearchModalOpen: (open) => set({ searchModalOpen: open }),

      // --- Active Conversation ---
      activeConversationId: "conv-1",
      activeConversationTitle: "Explainable AI Architecture & Reasoning Pipelines",
      setActiveConversation: (id, title) =>
        set({ activeConversationId: id, activeConversationTitle: title }),

      // --- Streaming & Reasoning Stages ---
      isStreaming: false,
      currentStage: "Generating",
      trustScoreProgress: 0.964,
      answerMode: "VERIFIED",
      setIsStreaming: (streaming) => set({ isStreaming: streaming }),
      setCurrentStage: (stage) => set({ currentStage: stage }),
      setTrustScoreProgress: (score) => set({ trustScoreProgress: score }),
      setAnswerMode: (mode) => set({ answerMode: mode }),

      // --- Last RAG Response & File Upload ---
      lastResponse: null,
      setLastResponse: (response) => set({ lastResponse: response }),
      uploadingFile: false,
      setUploadingFile: (uploading) => set({ uploadingFile: uploading }),
      addDocument: (doc) => set((state) => ({ documents: [doc, ...state.documents] })),

      // --- Mock Conversations ---
      conversations: [
        {
          id: "conv-1",
          title: "Explainable AI Architecture & Reasoning Pipelines",
          updatedAt: "Just now",
          documentCount: 2,
        },
        {
          id: "conv-2",
          title: "Counterfactual Analysis for Transformer Models",
          updatedAt: "2h ago",
          documentCount: 1,
        },
        {
          id: "conv-3",
          title: "SHAP vs LIME Feature Importance in Financial Risk",
          updatedAt: "Yesterday",
          documentCount: 3,
        },
        {
          id: "conv-4",
          title: "LangGraph Multi-Agent Orchestration Blueprint",
          updatedAt: "3 days ago",
        },
      ],

      // --- Mock Knowledge Base Documents ---
      documents: [
        {
          id: "doc-1",
          name: "GlassMind_Architecture_Spec.pdf",
          size: "2.4 MB",
          type: "application/pdf",
          uploadedAt: "Today, 10:15 AM",
          groundingStatus: "High Grounding",
          evidenceChunks: 4,
          citationCount: 3,
          similarityScore: 0.94,
        },
        {
          id: "doc-2",
          name: "XAI_Model_Interpretability_Benchmark.pdf",
          size: "4.1 MB",
          type: "application/pdf",
          uploadedAt: "Yesterday, 4:30 PM",
          groundingStatus: "Medium Grounding",
          evidenceChunks: 2,
          citationCount: 1,
          similarityScore: 0.88,
        },
      ],

      addConversation: (title) => {
        const id = `conv-${Date.now()}`;
        set((state) => ({
          conversations: [
            { id, title, updatedAt: "Just now" },
            ...state.conversations,
          ],
          activeConversationId: id,
          activeConversationTitle: title,
        }));
        return id;
      },
    }),
    { name: "glassmind-saas-store" }
  )
);
