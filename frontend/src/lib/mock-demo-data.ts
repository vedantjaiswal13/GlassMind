/**
 * Realistic Mock Demo Dataset for GlassMind End-to-End Healthcare Demo
 */

import type { ChatResponseData } from "@/types";

export const MOCK_HEALTHCARE_DEMO_RESPONSE: ChatResponseData = {
  answer_mode: "VERIFIED",
  answer: "Your symptoms—fever, persistent cough, and chest pain over 5 days—are classic indicators of a lower respiratory tract infection, most commonly Acute Bronchitis or Community-Acquired Pneumonia. Based on verified clinical guidelines in WHO Respiratory Guidelines.pdf (Page 14), a persistent cough accompanied by chest discomfort warrants clinical evaluation to rule out pleurisy or bacterial lung infection.",
  content: "Your symptoms—fever, persistent cough, and chest pain over 5 days—are classic indicators of a lower respiratory tract infection, most commonly Acute Bronchitis or Community-Acquired Pneumonia. Based on verified clinical guidelines in WHO Respiratory Guidelines.pdf (Page 14), a persistent cough accompanied by chest discomfort warrants clinical evaluation to rule out pleurisy or bacterial lung infection.",
  summary_card: {
    title: "Healthcare Clinical Guidance",
    description: "Cross-referenced and validated against uploaded WHO Clinical Guidelines and Medical Reference manuals.",
    grounding_status: "Verified",
    trust_level: "Verified",
    recommendation: "Consult a healthcare professional or primary physician for diagnostic lung examination.",
    color: "green",
    icon: "shield-check"
  },
  trust: {
    score: 96,
    level: "Verified Clinical Grounding",
    badge: "Verified",
    summary: "This answer directly matches clinical consensus in uploaded WHO Guidelines and Medical Manuals."
  },
  thinking_steps: [
    { title: "GlassMind understood your question", description: "Analyzed query intent and identified key symptoms for Healthcare mode.", duration: "0.1s", confidence_gain: "+10%", status: "completed", icon: "brain" },
    { title: "Determined topic: Healthcare", description: "Selected reliability rules for medical clinical guidance.", duration: "0.1s", confidence_gain: "+15%", status: "completed", icon: "zap" },
    { title: "Searched your uploaded knowledge base", description: "Scanned indexed medical documents across 3 files.", duration: "0.2s", confidence_gain: "+30%", status: "completed", icon: "search" },
    { title: "Compared trusted information", description: "Cross-referenced matched symptoms with WHO Guidelines.", duration: "0.2s", confidence_gain: "+25%", status: "completed", icon: "file-text" },
    { title: "Checked for contradictions", description: "No conflicting medical evidence detected.", duration: "0.1s", confidence_gain: "+10%", status: "completed", icon: "shield-check" },
    { title: "Generated a simplified explanation", description: "Composed plain-English medical summary without AI jargon.", duration: "0.2s", confidence_gain: "+6%", status: "completed", icon: "check-circle" }
  ],
  timeline: [
    { step: "Planning & Intent Analysis", timestamp: "0.1s" },
    { step: "Qdrant Hybrid Vector Search", timestamp: "0.2s" },
    { step: "Evidence Alignment & SHAP Reranking", timestamp: "0.2s" },
    { step: "Plain-English Answer Composition", timestamp: "0.2s" }
  ],
  sources: [
    { document: "WHO Diabetes & Respiratory Guidelines.pdf", page: 14, confidence: 0.96 },
    { document: "Clinical Emergency Handbook.pdf", page: 8, confidence: 0.91 }
  ],
  explanation: {
    summary: "High consensus between symptoms described and documented clinical respiratory guidelines.",
    recommendation: "Seek primary physician evaluation for chest auscultation.",
    why_this_answer: "GlassMind matched your symptoms against verified medical literature.",
    evidence_summary: "Two medical documents confirmed symptoms match lower respiratory tract conditions.",
    confidence_reason: "High similarity score across medical guidelines."
  },
  confidence: {
    grounding: 0.96,
    reasoning: 0.94,
    verification: 0.98,
    uncertainty: 0.05
  },
  domain: "healthcare",
  domain_mode: "Healthcare",
  domain_context: {
    title: "Healthcare Clinical Guidance",
    description: "This answer is based on medical references but cannot replace professional medical diagnosis or treatment."
  },
  warning_card: {
    type: "emergency",
    title: "🚨 Emergency Warning: Monitor Severe Symptoms",
    description: "If you experience severe chest tightness, high fever over 103°F, shortness of breath at rest, or coughing up blood, seek emergency medical care immediately."
  },
  follow_up_questions: [
    "What symptoms should I monitor closely over the next 48 hours?",
    "What diagnostic tests are commonly used to confirm pneumonia?",
    "When should I go to an urgent care or emergency room?"
  ],
  story: [
    { title: "GlassMind understood your question", description: "Analyzed query intent and identified key symptoms for Healthcare mode.", status: "completed", duration: "0.1s", icon: "brain" },
    { title: "Determined topic: Healthcare", description: "Selected reliability rules for Healthcare Clinical Guidance.", status: "completed", duration: "0.1s", icon: "zap" },
    { title: "Searched your uploaded knowledge base", description: "Scanned WHO Guidelines and retrieved matching sections.", status: "completed", duration: "0.2s", icon: "search" },
    { title: "Compared trusted information", description: "Cross-referenced document facts for consistency and agreement.", status: "completed", duration: "0.2s", icon: "file-text" },
    { title: "Filtered out outdated or unrelated content", description: "Excluded non-respiratory sections to preserve diagnostic accuracy.", status: "completed", duration: "0.1s", icon: "filter" },
    { title: "Checked for contradictions", description: "No conflicting clinical information detected across sources.", status: "completed", duration: "0.1s", icon: "shield-check" },
    { title: "Generated a simplified explanation", description: "Composed direct answer in plain-English without technical AI jargon.", status: "completed", duration: "0.2s", icon: "check-circle" }
  ],
  documents_used: [
    {
      document_name: "WHO Diabetes & Respiratory Guidelines.pdf",
      title: "WHO Respiratory Clinical Guidelines 2026",
      type: "PDF Document",
      publication_date: "Jan 2026",
      pages_used: [14, 15],
      contribution: "Primary source defining symptom matches for bronchitis and pneumonia.",
      why_selected: "Highest clinical relevance score (0.96) for lower respiratory infections.",
      strength: "Primary Evidence",
      supporting_sections: ["Section 4: Respiratory Infection Differential Diagnosis"],
      supports: ["Fever and cough indicate bronchial inflammation", "Chest pain warrants pleurisy screening"],
      conflicts: [],
      evidence_count: 5,
      reliability_score: 0.96,
      ignored_sections: ["Section 12: Pediatric Dosage Tables"],
      conflicting_sections: [],
      excerpt: "Persistent cough exceeding 3 days accompanied by mild fever and pleuritic chest discomfort should be evaluated for lower respiratory infection.",
      excerpt_relevance: "Directly corroborates the user's reported 5-day symptom timeline."
    }
  ],
  confidenceScore: 0.96,
  thinkingSteps: [
    { id: "s-1", label: "Intent Parsing & Healthcare Domain Check" },
    { id: "s-2", label: "Vector Search on WHO Guidelines" },
    { id: "s-3", label: "Evidence Alignment & Recommendation Check" }
  ]
};
