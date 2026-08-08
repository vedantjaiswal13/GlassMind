/**
 * API Types
 *
 * Shared type definitions for API communication.
 * These types mirror the backend Pydantic schemas.
 */

// --- Generic API Response ---
export interface ApiResponse<T> {
  data: T;
  status: "success" | "error";
  message?: string;
}

// --- Pagination ---
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// --- Error ---
export interface ApiError {
  status: number;
  message: string;
  detail?: string;
}

// --- Dynamic Explainability Card (mirrors backend SummaryCardSection) ---
export interface SummaryCard {
  title: string;
  description: string;
  grounding_status: string;
  trust_level: string;
  recommendation: string;
  color: "green" | "orange" | "yellow" | "red" | "blue";
  icon: string;
}

// --- Dynamic Thinking Step (mirrors backend ThinkingStepSection) ---
export interface ThinkingStep {
  title: string;
  description: string;
  duration: string;
  confidence_gain: string;
  status: string;
  icon: string;
}

export interface HumanExplanation {
  why_this_answer: string;
  where_it_came_from: string;
  why_trust_it: string;
  what_could_change_it: string;
  how_to_verify: string;
}

export interface IgnoredItem {
  title: string;
  reason: string;
}

export interface ConflictAnalysis {
  has_conflict: boolean;
  description: string;
  disagreeing_documents: string[];
  resolution_reason: string;
}

export interface RecommendationItem {
  type: string;
  message: string;
  urgency: "info" | "warning" | "critical";
}

export interface DrawerTabItem {
  id: string;
  label: string;
  icon: string;
  badge?: string;
}

export interface EvidenceItem {
  evidence_id: string;
  document_name: string;
  page_number: number;
  section: string;
  excerpt: string;
  relevance_score: number;
  confidence: number;
  reason_selected: string;
}

export interface SourceCardItem {
  document_name: string;
  title?: string;
  type?: string;
  publication_date?: string;
  pages_used: number[];
  contribution?: string;
  why_selected?: string;
  strength?: string;
  supporting_sections: string[];
  supports?: string[];
  conflicts?: string[];
  evidence_count: number;
  reliability_score: number;
  ignored_sections: string[];
  conflicting_sections: string[];
  excerpt?: string;
  excerpt_relevance?: string;
}

export interface StoryStepItem {
  title: string;
  description: string;
  status: "completed" | "active" | "pending";
  duration: string;
  icon?: string;
}

export interface CitationItem {
  citation_id: string;
  document_name: string;
  page_number: number;
  evidence_id: string;
  supporting_text: string;
}

export interface DomainContext {
  title: string;
  description: string;
}

export interface WarningCard {
  type: "emergency" | "legal_notice" | "financial_risk" | "general_warning";
  title: string;
  description: string;
}

export interface StructuredSourceItem {
  name: string;
  title: string;
  url: string;
  type: string;
  quality_tier: string;
  relevance: string;
  supports_claims: string[];
}

export interface TrustFactorDetail {
  score: number;
  max: number;
  explanation: string;
}

export interface TrustEngineData {
  score: number;
  label: string;
  factors: {
    source_quality: TrustFactorDetail;
    source_agreement: TrustFactorDetail;
    evidence_coverage: TrustFactorDetail;
    recency: TrustFactorDetail;
    contradiction_penalty: { score: number; explanation: string };
  };
  overall_explanation: string;
  limitations: string;
}

export interface ClaimItem {
  id: string;
  text: string;
  support_level: string;
  evidence_ids?: string[];
  supported_by?: string[];
}

export interface ChallengeData {
  unsupported_claims: string[];
  conflicting_claims: string[];
  outdated_information: string[];
  missing_context: string[];
  overall_result: string;
}

export interface EvidenceAnalysisData {
  coverage_text: string;
  agreement_text: string;
  conflicts: string[];
  missing_information: string[];
}

// --- Full Chat Response Data ---
export interface ChatResponseData {
  question?: string;
  answer_mode: "VERIFIED" | "GENERAL";
  answer: string;
  content: string;
  simple_answer?: string;
  claims?: ClaimItem[];
  challenge?: ChallengeData;
  evidence_analysis?: EvidenceAnalysisData;
  what_would_change_answer?: string[];
  summary_card: SummaryCard;
  thinking_steps: ThinkingStep[];
  timeline: Array<{ step: string; timestamp: string }>;
  trust: { score: number; level: string; badge: string; summary: string };
  trust_engine?: TrustEngineData;
  sources: Array<{ document: string; page: number; confidence: number }>;
  structured_sources?: StructuredSourceItem[];
  explanation: { summary: string; recommendation: string; why_this_answer: string; evidence_summary: string; confidence_reason: string };
  confidence: { grounding: number; reasoning: number; verification: number; uncertainty: number };
  human_explanation?: HumanExplanation;
  ignored_information?: IgnoredItem[];
  conflict_analysis?: ConflictAnalysis;
  recommendations?: RecommendationItem[];
  verification_steps?: string[];
  domain_mode?: string;
  drawer_tabs?: DrawerTabItem[];
  story?: StoryStepItem[];
  domain?: string;
  domain_context?: DomainContext;
  warning_card?: WarningCard;
  follow_up_questions?: string[];
  documents_used?: SourceCardItem[];
  evidence?: EvidenceItem[];
  citations?: CitationItem[];
  confidenceScore: number;
  thinkingSteps: Array<{ id: string; label: string }>;
  citations_legacy?: Array<{ id: string; source_id: string; label: string }>;
}

