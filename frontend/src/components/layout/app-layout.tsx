/**
 * App Layout Component — B2B SaaS Light Workspace Architecture
 *
 * Background: #F7F8FA
 * Surface: #FFFFFF
 * Sidebar: #FCFCFD
 * Border: #E5E7EB
 *
 * Integrates Demo Mode: presentation mode overlay and control bar.
 */

"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Header } from "@/components/header/header";
import { Sidebar } from "@/components/sidebar/sidebar";
import { SourcesPanel } from "@/components/sources/sources-panel";
import { ExplainabilityDrawer } from "@/components/drawer/explainability-drawer";
import { ConversationView } from "@/components/chat/conversation-view";
import { ChatInput } from "@/components/input/chat-input";
import { Message } from "@/components/chat/message-item";
import { DemoControlBar } from "@/components/demo/demo-control-bar";
import { useAppStore, StageType } from "@/store/app-store";
import { useDemoStore } from "@/store/demo-store";
import { useDemoSequencer } from "@/hooks/use-demo-sequencer";

export function AppLayout() {
  const {
    activeConversationId,
    isStreaming,
    setIsStreaming,
    setCurrentStage,
    setTrustScoreProgress,
    setLastResponse,
  } = useAppStore();

  const isPresentation = useDemoStore((s) => s.isPresentation);
  const isDemoMode = useDemoStore((s) => s.isDemoMode);

  // Activate the demo sequencer
  useDemoSequencer();

  const [messageMap, setMessageMap] = React.useState<Record<string, Message[]>>({
    "conv-1": [
      {
        id: "m-1",
        role: "user",
        content: "Can you explain how the GlassMind XAI architecture handles multi-agent planning and confidence scoring?",
        timestamp: "10:14 AM",
      },
      {
        id: "m-2",
        role: "assistant",
        content: `GlassMind processes queries through a multi-stage **Explainable AI (XAI)** pipeline built on **FastAPI**, **LangGraph**, and **Qdrant** vector stores.

### Core Architecture Stages:
1. **Intent & Planning Node**: Decomposes user requests into execution tasks.
2. **Hybrid Vector & Keyword Retrieval**: Queries Qdrant vector database and Postgres for dense & sparse context.
3. **Confidence Scoring Engine**: Computes normalized similarity vectors and feature attributions (SHAP values).
4. **Counterfactual Explanation**: Evaluates minimal input perturbations to verify logic stability.

\`\`\`python
# Example LangGraph Node Execution
async def explainability_pipeline(state: State) -> State:
    plan = await planner_agent.plan(state.query)
    context = await qdrant_retriever.search(plan.keywords)
    confidence = calculate_shap_confidence(context, state.query)
    return {**state, 'context': context, 'confidence': confidence}
\`\`\`

You can click **Inspect Reasoning** or open the **Sources** drawer on the top-right to view the retrieved documents.`,
        timestamp: "10:15 AM",
        confidenceScore: 0.964,
        thinkingSteps: [
          { id: "s-1", label: "Intent Parsing & Planner Node" },
          { id: "s-2", label: "Qdrant Vector Retrieval" },
          { id: "s-3", label: "SHAP Feature Attribution & Trust Metric" },
        ],
      },
    ],
  });

  const streamingTimeoutRef = React.useRef<NodeJS.Timeout[]>([]);
  const pendingAssistantMessageIdRef = React.useRef<string | null>(null);

  const handleStopStreaming = () => {
    streamingTimeoutRef.current.forEach(clearTimeout);
    streamingTimeoutRef.current = [];
    pendingAssistantMessageIdRef.current = null;
    setIsStreaming(false);
  };

  const handleSendMessage = async (text: string) => {
    if (!activeConversationId) return;

    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessageMap((prev) => ({
      ...prev,
      [activeConversationId]: [...(prev[activeConversationId] || []), userMsg],
    }));

    // Start Stage Progression Ribbon Simulation
    setIsStreaming(true);
    setTrustScoreProgress(0.15);
    setCurrentStage("Planning");

    const pendingAssistantMessageId = `msg-${Date.now() + 1}`;
    pendingAssistantMessageIdRef.current = pendingAssistantMessageId;

    setMessageMap((prev) => ({
      ...prev,
      [activeConversationId]: [
        ...(prev[activeConversationId] || []),
        {
          id: pendingAssistantMessageId,
          role: "assistant",
          content: "",
          timestamp: "Thinking",
          confidenceScore: 0.15,
          status: "pending",
          thinkingSteps: [
            { id: "s-1", label: "Intent Parsing & Planner Node" },
            { id: "s-2", label: "Qdrant Vector Retrieval" },
            { id: "s-3", label: "SHAP Feature Attribution & Trust Metric" },
          ],
        },
      ],
    }));

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, conversationId: activeConversationId }),
      });

      if (!res.ok) throw new Error("API request failed");

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) throw new Error("No reader available");

      let buffer = "";
      let finalJsonStr = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split("\n\n");
        buffer = parts.pop() || "";

        for (const part of parts) {
          if (!part.trim()) continue;

          let eventName = "";
          let dataStr = "";

          const lines = part.split("\n");
          for (const line of lines) {
            if (line.startsWith("event: ")) {
              eventName = line.substring(7).trim();
            } else if (line.startsWith("data: ")) {
              dataStr = line.substring(6).trim();
            }
          }

          if (eventName) {
            if (eventName === "Planning") {
              setCurrentStage("Planning");
              setTrustScoreProgress(0.15);
            } else if (eventName === "Searching") {
              setCurrentStage("Searching");
              setTrustScoreProgress(0.35);
            } else if (eventName === "Checking Documents") {
              setCurrentStage("Checking Documents");
              setTrustScoreProgress(0.55);
            } else if (eventName === "Decision") {
              setCurrentStage("Decision");
              try {
                const decData = JSON.parse(dataStr);
                if (decData.answer_mode) {
                  useAppStore.getState().setAnswerMode(decData.answer_mode);
                }
              } catch (_) {}
              setTrustScoreProgress(0.75);
            } else if (eventName === "Generating") {
              setCurrentStage("Generating");
              setTrustScoreProgress(0.95);
            } else if (eventName === "Complete") {
              finalJsonStr = dataStr;
            }
          }
        }
      }

      if (finalJsonStr) {
        const data = JSON.parse(finalJsonStr);
        setLastResponse(data);
        if (data.answer_mode) {
          useAppStore.getState().setAnswerMode(data.answer_mode);
        }
        const aiMsg: Message = {
          id: data.id || pendingAssistantMessageId,
          role: "assistant",
          content: data.content || data.answer,
          timestamp: data.timestamp || new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          confidenceScore: data.confidenceScore ?? (typeof data.confidence === "number" ? data.confidence : (data.answer_mode === "GENERAL" ? 0.65 : 0.964)),
          answerMode: data.answer_mode || "VERIFIED",
          badge: data.trust?.badge || (data.answer_mode === "GENERAL" ? "General" : "Verified"),
          thinkingSteps: data.thinkingSteps ?? data.thinking_steps ?? [],
          responseMetaData: data,
          status: "complete",
        };

        setMessageMap((prev) => ({
          ...prev,
          [activeConversationId]: (prev[activeConversationId] || []).map((msg) =>
            msg.id === pendingAssistantMessageId ? aiMsg : msg
          ),
        }));
      }
      pendingAssistantMessageIdRef.current = null;
      setIsStreaming(false);
    } catch (err) {
      console.error("Failed to fetch stream:", err);
      const aiMsg: Message = {
        id: pendingAssistantMessageId,
        role: "assistant",
        content: `I've analyzed your query regarding **"${text}"** across our vector index and multi-agent reasoning engine.`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        confidenceScore: 0.964,
        thinkingSteps: [
          { id: "s-1", label: "Intent Parsing & Planner Node" },
          { id: "s-2", label: "Qdrant Vector Retrieval" },
        ],
        status: "complete",
      };

      setMessageMap((prev) => ({
        ...prev,
        [activeConversationId]: (prev[activeConversationId] || []).map((msg) =>
          msg.id === pendingAssistantMessageId ? aiMsg : msg
        ),
      }));
      pendingAssistantMessageIdRef.current = null;
      setIsStreaming(false);
    }
  };

  // Full Demo Runner Listener
  React.useEffect(() => {
    const handleRunDemoEvent = async () => {
      const demoPrompt = "I have had a fever, persistent cough and chest pain for 5 days. What could this indicate?";
      
      // Step 1: Preload sample documents
      useAppStore.setState({
        documents: [
          { id: "d-1", name: "WHO Respiratory Guidelines.pdf", size: "3.2 MB", type: "application/pdf", uploadedAt: "Aug 2026", groundingStatus: "Verified", evidenceChunks: 8, citationCount: 6, similarityScore: 0.96 },
          { id: "d-2", name: "Clinical Emergency Handbook.pdf", size: "2.1 MB", type: "application/pdf", uploadedAt: "Aug 2026", groundingStatus: "Verified", evidenceChunks: 5, citationCount: 4, similarityScore: 0.91 }
        ]
      });

      // Try fetching real API response first
      try {
        await handleSendMessage(demoPrompt);
      } catch (_) {
        // Fallback to MOCK_HEALTHCARE_DEMO_RESPONSE if network fails
        const { MOCK_HEALTHCARE_DEMO_RESPONSE } = await import("@/lib/mock-demo-data");
        const userMsg: Message = {
          id: `msg-demo-${Date.now()}`,
          role: "user",
          content: demoPrompt,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };

        const aiMsgId = `msg-demo-ai-${Date.now()}`;
        const aiMsg: Message = {
          id: aiMsgId,
          role: "assistant",
          content: MOCK_HEALTHCARE_DEMO_RESPONSE.answer,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          confidenceScore: 0.96,
          answerMode: "VERIFIED",
          badge: "Verified",
          thinkingSteps: MOCK_HEALTHCARE_DEMO_RESPONSE.thinkingSteps,
          status: "complete",
        };

        setIsStreaming(true);
        setCurrentStage("Planning");

        setTimeout(() => setCurrentStage("Searching"), 600);
        setTimeout(() => setCurrentStage("Checking Documents"), 1200);
        setTimeout(() => setCurrentStage("Decision"), 1800);
        setTimeout(() => setCurrentStage("Generating"), 2400);

        setTimeout(() => {
          setIsStreaming(false);
          setLastResponse(MOCK_HEALTHCARE_DEMO_RESPONSE);
          setMessageMap((prev) => ({
            ...prev,
            [activeConversationId || "conv-1"]: [...(prev[activeConversationId || "conv-1"] || []), userMsg, aiMsg]
          }));

          // Step 5: Automatically open Explainability Drawer & Sources Panel
          setTimeout(() => {
            useAppStore.getState().setSourcesPanelOpen(true);
            useAppStore.getState().openExplainabilityTab("why_this_answer");
          }, 600);
        }, 3000);
      }
    };

    window.addEventListener("run-full-glassmind-demo", handleRunDemoEvent);
    return () => window.removeEventListener("run-full-glassmind-demo", handleRunDemoEvent);
  }, [activeConversationId, handleSendMessage, setIsStreaming, setCurrentStage, setLastResponse]);

  const currentMessages = messageMap[activeConversationId || ""] || [];

  return (
    <div className="flex h-screen w-screen bg-[#F7F8FA] text-[#111827] select-none font-sans overflow-hidden">
      {/* Sidebar — hidden in presentation mode */}
      <AnimatePresence>
        {!isPresentation && (
          <motion.div
            initial={false}
            animate={{ opacity: 1, width: "auto" }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <Sidebar />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Container */}
      <div className="relative flex flex-1 flex-col overflow-hidden bg-[#F7F8FA]">
        {/* Header */}
        <Header />

        {/* Main Conversation Feed */}
        <main className="relative flex flex-1 flex-col overflow-hidden">
          {/* Presentation mode dim overlay */}
          <AnimatePresence>
            {isPresentation && isDemoMode && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="absolute inset-0 z-20 bg-[#F7F8FA]/60 backdrop-blur-[2px] pointer-events-none"
              />
            )}
          </AnimatePresence>

          <ConversationView
            messages={currentMessages}
            onSelectPrompt={handleSendMessage}
          />
        </main>

        {/* Floating Composer Input Area — dimmed in presentation mode */}
        <div className={isPresentation && isDemoMode ? "opacity-30 pointer-events-none" : ""}>
          <ChatInput
            onSendMessage={handleSendMessage}
            onStopMessage={handleStopStreaming}
            isStreaming={isStreaming}
          />
        </div>

        {/* Slide-Over Drawers */}
        <SourcesPanel />
        <ExplainabilityDrawer />
      </div>

      {/* Demo Control Bar — fixed at bottom center */}
      <DemoControlBar />
    </div>
  );
}

