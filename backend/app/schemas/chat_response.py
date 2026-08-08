"""
GlassMind Chat Response Schema — Multi-stage Explainability

Defines the structure for verified, grounded chat responses containing trust metrics,
reasoning journey steps, source metadata, and confidence scores.
"""

from typing import Any, Literal
from pydantic import BaseModel, Field, field_validator


class TrustSection(BaseModel):
    """Trust rating section including overall score, label, badge, and summary."""
    score: float = Field(..., description="Overall trust score (0 to 100 or 0.0 to 1.0)")
    level: str = Field(..., description="Trust classification level (e.g. High, General Knowledge, Verified)")
    badge: Literal["Verified", "General", "Partially Verified", "Needs Review"] = Field(default="Verified", description="UI badge classification: Verified, General, Partially Verified, Needs Review")
    summary: str = Field(default="", description="Factual, plain-English summary of answer reliability")



class SummaryCardSection(BaseModel):
    """Dynamic explainability summary card returned by AI backend."""
    title: str = Field(..., description="Card title (e.g. Verified Answer, General Knowledge, Low Confidence)")
    description: str = Field(..., description="Card explanation text")
    grounding_status: str = Field(..., description="Grounding status label (e.g. Verified, Unavailable, Weak)")
    trust_level: str = Field(..., description="Trust rating representation (e.g. 96%, General Knowledge, 48%)")
    recommendation: str = Field(..., description="Actionable guidance for the user")
    color: Literal["green", "orange", "yellow", "red", "blue"] = Field(default="green", description="Color scheme for UI rendering")
    icon: str = Field(default="shield-check", description="Lucide icon identifier")


class ThinkingStepSection(BaseModel):
    """A single step in the agent's internal reasoning chain."""
    title: str = Field(..., description="The name of the reasoning step performed")
    description: str = Field(default="", description="Detailed step explanation")
    duration: str = Field(default="0.1s", description="Step execution time")
    confidence_gain: str = Field(default="+0%", description="Confidence score change")
    status: str = Field(default="completed", description="Status of the step")
    icon: str = Field(default="brain", description="Icon identifier")


class TimelineSection(BaseModel):
    """Pipeline execution phase showing duration and milestones."""
    step: str = Field(..., description="Stage name (e.g. Planning, Searching)")
    timestamp: str = Field(..., description="Human-readable elapsed duration (e.g. 0.3s)")


class SourceSection(BaseModel):
    """Grounding citation referencing a retrieved page chunk."""
    document: str = Field(..., description="Name of the source document")
    page: int = Field(..., description="Page number of the matching section")
    confidence: float = Field(..., description="Match confidence / relevance score (0.0 to 1.0)")


class ExplanationSection(BaseModel):
    """Deep human-centric explainability explanations without AI jargon."""
    summary: str = Field(default="", description="High-level summary explanation")
    recommendation: str = Field(default="", description="Actionable user recommendation")
    why_this_answer: str = Field(default="", description="Plain-English explanation of how the answer was reached")
    evidence_summary: str = Field(default="", description="High-level summary of sources and consensus")
    confidence_reason: str = Field(default="", description="Explanation of how the confidence score was determined")


class ConfidenceSection(BaseModel):
    """Quantitative scoring across the four core dimensions."""
    grounding: float = Field(..., description="Retrieval similarity score (0.0 to 1.0)")
    reasoning: float = Field(..., description="Logical consistency rating (0.0 to 1.0)")
    verification: float = Field(..., description="Fact alignment verification check (0.0 to 1.0)")
    uncertainty: float = Field(..., description="Query ambiguity / context noise factor (0.0 to 1.0)")


class HumanExplanationSection(BaseModel):
    """Plain-English answers to the 5 core human questions."""
    why_this_answer: str = Field(..., description="Why this answer was generated in simple terms")
    where_it_came_from: str = Field(..., description="Plain-English summary of source documents used")
    why_trust_it: str = Field(..., description="Explanation of why the user should trust it")
    what_could_change_it: str = Field(..., description="What factors or new information could change this answer")
    how_to_verify: str = Field(..., description="Actionable guidance on how the user can verify it independently")


class IgnoredItem(BaseModel):
    """Information or query section that was excluded and why."""
    title: str = Field(..., description="Excluded document section or query topic")
    reason: str = Field(..., description="Plain-English explanation of why it was ignored")


class ConflictAnalysisSection(BaseModel):
    """Contradiction detection across source documents."""
    has_conflict: bool = Field(default=False, description="Whether contradicting evidence was detected")
    description: str = Field(default="No conflicting information detected across sources.", description="Summary of conflict")
    disagreeing_documents: list[str] = Field(default_factory=list, description="List of documents with conflicting statements")
    resolution_reason: str = Field(default="", description="How GlassMind resolved the disagreement")


class RecommendationItem(BaseModel):
    """Actionable user recommendation tailored to domain."""
    type: str = Field(default="general", description="Recommendation category (healthcare, finance, law, education, general)")
    message: str = Field(..., description="Clear action recommendation for the user")
    urgency: str = Field(default="info", description="Urgency level (info, warning, critical)")


class DrawerTabItem(BaseModel):
    """Dynamic explainability drawer tab configuration returned by backend."""
    id: str = Field(..., description="Tab key identifier (brain, galaxy, genome, timeline, counterfactual, evolution)")
    label: str = Field(..., description="Human-friendly tab label")
    icon: str = Field(default="brain", description="Icon identifier")
    badge: str = Field(default="", description="Optional pill count or indicator")


class EvidenceItem(BaseModel):
    """Structured evidence object extracted from a retrieved chunk."""
    evidence_id: str = Field(..., description="Unique identifier for the evidence snippet")
    document_name: str = Field(..., description="Source document file name")
    page_number: int = Field(default=1, description="Page number where snippet appears")
    section: str = Field(default="General", description="Section heading or title")
    excerpt: str = Field(..., description="Direct text excerpt supporting the claim")
    relevance_score: float = Field(..., description="Hybrid re-ranking relevance score (0.0 to 1.0)")
    confidence: float = Field(default=0.85, description="Confidence level in this evidence item")
    reason_selected: str = Field(default="", description="Human-readable explanation of why this evidence was chosen")


class SourceCardItem(BaseModel):
    """Structured summary card for an ingested document source with Source Intelligence."""
    document_name: str = Field(..., description="Name of the document")
    title: str = Field(default="", description="Human-friendly document title")
    type: str = Field(default="PDF Document", description="Document file type (PDF, DOCX, TXT)")
    publication_date: str = Field(default="Recent", description="Publication or upload date")
    pages_used: list[int] = Field(default_factory=list, description="List of page numbers referenced")
    contribution: str = Field(default="", description="How this source contributed to the answer")
    why_selected: str = Field(default="", description="Why AI selected this source over others")
    strength: str = Field(default="Primary Evidence", description="Source strength label (Primary Evidence, Strong Supporting Evidence, Supporting Evidence, Background Information)")
    supporting_sections: list[str] = Field(default_factory=list, description="Section headings matched")
    supports: list[str] = Field(default_factory=list, description="Key statements supported by this source")
    conflicts: list[str] = Field(default_factory=list, description="Statements or other documents this source conflicts with")
    evidence_count: int = Field(default=0, description="Total evidence items extracted from this source")
    reliability_score: float = Field(default=0.9, description="Source reliability rating (0.0 to 1.0)")
    ignored_sections: list[str] = Field(default_factory=list, description="Sections deemed irrelevant")
    conflicting_sections: list[str] = Field(default_factory=list, description="Sections with contradictory statements")
    excerpt: str = Field(default="", description="Direct supporting text excerpt from the document")
    excerpt_relevance: str = Field(default="", description="Explanation of why this excerpt matters to the answer")


class CitationItem(BaseModel):
    """Structured citation referencing exact evidence and text."""
    citation_id: str = Field(..., description="Unique citation identifier")
    document_name: str = Field(..., description="Name of the source document")
    page_number: int = Field(default=1, description="Page number of citation")
    evidence_id: str = Field(..., description="Referenced evidence item ID")
    supporting_text: str = Field(..., description="Direct sentence supporting the statement")


class RetrievalStats(BaseModel):
    """Execution statistics for the hybrid retrieval & ranking pipeline."""
    total_chunks_scanned: int = Field(default=0, description="Total chunks in collection")
    chunks_retrieved: int = Field(default=0, description="Number of candidate chunks retrieved")
    top_relevance_score: float = Field(default=0.0, description="Highest hybrid relevance score")
    retrieval_time_ms: int = Field(default=0, description="Retrieval latency in milliseconds")
    rerank_time_ms: int = Field(default=0, description="Re-ranking latency in milliseconds")


# Compatibility models for existing frontend components
class CompatibilityThinkingStep(BaseModel):
    id: str
    label: str


class CompatibilityCitation(BaseModel):
    id: str
    source_id: str
    label: str


class StoryStepItem(BaseModel):
    """Dynamic step in the human-centric Reasoning Story Mode."""
    title: str = Field(..., description="Step title (e.g. GlassMind understood your question)")
    description: str = Field(..., description="Short explanation of what occurred during this step")
    status: Literal["completed", "active", "pending"] = Field(default="completed", description="Status of the story step")
    duration: str = Field(default="0.1s", description="Step execution time")
    icon: str = Field(default="brain", description="Lucide icon identifier")


class DomainContextSection(BaseModel):
    """Domain-specific communication context."""
    title: str = Field(..., description="Domain title (e.g. Healthcare Clinical Guidance, Legal Jurisdiction Context, Financial Risk Assessment)")
    description: str = Field(..., description="Plain-English domain context description")


class WarningCardSection(BaseModel):
    """Domain special warning banner (e.g. Emergency Warning, Jurisdiction Notice, Investment Risk)."""
    type: Literal["emergency", "legal_notice", "financial_risk", "general_warning"] = Field(default="general_warning", description="Warning card type")
    title: str = Field(..., description="Warning banner title")
    description: str = Field(..., description="Detailed warning message")


class ClaimSchema(BaseModel):
    """Major factual claim extracted from answer."""
    id: str = Field(..., description="Unique claim identifier e.g. claim-1")
    text: str = Field(..., description="Factual claim sentence")
    support_level: str = Field(default="Strong Support", description="Support classification: Strong Support, Moderate Support, Limited Support")
    evidence_ids: list[str] = Field(default_factory=list, description="IDs or source names supporting this claim")
    supported_by: list[str] = Field(default_factory=list, description="Names of sources supporting this claim")


class ChallengeSchema(BaseModel):
    """Adversarial challenge analysis of the answer."""
    unsupported_claims: list[str] = Field(default_factory=list)
    conflicting_claims: list[str] = Field(default_factory=list)
    outdated_information: list[str] = Field(default_factory=list)
    missing_context: list[str] = Field(default_factory=list)
    overall_result: str = Field(default="✓ 4 claims supported • No major contradictions found • Individual circumstances may apply")


class EvidenceAnalysisSchema(BaseModel):
    """Coverage, agreement, conflicts and missing info breakdown."""
    coverage_text: str = Field(default="4 of 5 major claims supported — Strong coverage")
    agreement_text: str = Field(default="Sources broadly agree on core definitions")
    conflicts: list[str] = Field(default_factory=list)
    missing_information: list[str] = Field(default_factory=list)


class SourceItemSchema(BaseModel):
    """Structured web or document source used for grounding."""
    id: str = Field(default="src-1", description="Unique source identifier")
    name: str = Field(..., description="Website / organization name")
    title: str = Field(..., description="Page or document title")
    url: str = Field(default="", description="Source URL if available")
    type: str = Field(default="Medical Reference", description="Source classification type")
    quality_tier: str = Field(default="Tier 1", description="Source quality classification: Tier 1 (Gov/Medical/Academic), Tier 2 (Educational/Prof), Tier 3 (Secondary), Tier 4 (Unverified)")
    quality_reason: str = Field(default="", description="Explanation of source quality tier classification")
    date: str = Field(default="2025", description="Publication date or recency status")
    relevance: str = Field(..., description="Why this source was relevant to the question")
    supports_claims: list[str] = Field(default_factory=list, description="Which specific part or claim of the answer this source supports")


class TrustFactorDetail(BaseModel):
    """Component factor in the trust engine calculation."""
    score: float = Field(..., description="Achieved score for this factor")
    max: float = Field(..., description="Maximum possible score for this factor")
    explanation: str = Field(..., description="Human-readable evidence-based explanation for this score")


class TrustFactorsSchema(BaseModel):
    """The 5 evidence-calculated trust factors."""
    source_quality: TrustFactorDetail = Field(..., description="Source quality score (max 30)")
    source_agreement: TrustFactorDetail = Field(..., description="Source agreement score (max 25)")
    evidence_coverage: TrustFactorDetail = Field(..., description="Evidence coverage score (max 25)")
    recency: TrustFactorDetail = Field(..., description="Recency score (max 10)")
    contradiction_penalty: TrustFactorDetail = Field(..., description="Contradiction penalty score (max 0 to -10)")


class TrustEngineSchema(BaseModel):
    """Complete evidence-calculated trust breakdown."""
    score: int = Field(..., description="Final evidence trust score normalized to 0-100")
    label: str = Field(..., description="Human-readable evidence trust label (Very Strong Evidence, Strong Evidence, Moderate Evidence, Limited Evidence, Needs Verification)")
    factors: TrustFactorsSchema = Field(..., description="Detailed 5-factor breakdown")
    overall_explanation: str = Field(..., description="Why this trust score was given based on available evidence")
    limitations: str = Field(..., description="What could make this answer wrong (domain-aware limitations)")


class AnswerStructure(BaseModel):
    """Detailed structured answer primary product."""
    title: str = Field(..., description="Formatted answer header title")
    body: str = Field(..., description="Primary comprehensive markdown answer text")
    sections: list[dict[str, str]] = Field(default_factory=list, description="Structured answer sub-sections (e.g. What it is, How it happens)")


class ChatResponse(BaseModel):
    """Unified structured response format for GlassMind chat endpoint matching prompt spec."""
    question: str = Field(default="", description="The user question asked")
    answer_mode: Literal["VERIFIED", "GENERAL"] = Field(default="VERIFIED", description="Operating answer mode: VERIFIED or GENERAL")
    answer: str = Field(..., description="Direct answer to the user's question in plain-English")
    answer_structured: AnswerStructure | None = Field(default=None, description="Detailed structured answer breakdown")
    simple_answer: str = Field(default="", description="Plain-language simplified version of answer")
    
    claims: list[ClaimSchema] = Field(default_factory=list, description="Extracted key claims inside the answer")
    challenge: ChallengeSchema | None = Field(default=None, description="Adversarial challenge findings")
    evidence_analysis: EvidenceAnalysisSchema | None = Field(default=None, description="Detailed coverage and agreement evaluation")
    what_would_change_answer: list[str] = Field(default_factory=list, description="Factors that would alter this answer")

    summary_card: SummaryCardSection = Field(..., description="Dynamic explainability trust card details")
    trust: TrustSection = Field(..., description="Reliability breakdown details")
    trust_engine: TrustEngineSchema | None = Field(default=None, description="Exact 0-100 score & 5-factor Trust Engine breakdown")
    
    thinking_steps: list[ThinkingStepSection] = Field(..., description="Sequential steps taken by the AI agent")
    timeline: list[TimelineSection] = Field(..., description="Milestone timestamps")
    sources: list[SourceSection] = Field(..., description="List of document grounding sources used")
    structured_sources: list[SourceItemSchema] = Field(default_factory=list, description="Detailed web/reference sources used with quality tiers & supported claims")
    
    explanation: ExplanationSection = Field(..., description="Human-friendly explainability summaries")
    confidence: ConfidenceSection = Field(..., description="Quality verification scores")

    # Extended RAG Engine Fields
    documents_used: list[SourceCardItem] = Field(default_factory=list, description="Structured source cards for referenced documents")
    evidence: list[EvidenceItem] = Field(default_factory=list, description="Ranked evidence cards supporting the answer")
    citations: list[CitationItem] = Field(default_factory=list, description="Structured citation references")
    retrieval_stats: RetrievalStats = Field(default_factory=RetrievalStats, description="Retrieval pipeline performance metrics")

    # Extended AI Communication & Human Explainability Fields
    human_explanation: HumanExplanationSection | None = Field(default=None, description="Plain-English answers to the 5 core human questions")
    ignored_information: list[IgnoredItem] = Field(default_factory=list, description="Sections/topics excluded and reasons why")
    conflict_analysis: ConflictAnalysisSection = Field(default_factory=ConflictAnalysisSection, description="Contradiction analysis across documents")
    recommendations: list[RecommendationItem] = Field(default_factory=list, description="Domain-tailored actionable recommendations")
    verification_steps: list[str] = Field(default_factory=list, description="Actionable verification suggestions for the user")
    domain_mode: str = Field(default="General", description="Detected domain mode (Healthcare, Finance, Law, Education, General)")
    drawer_tabs: list[DrawerTabItem] = Field(default_factory=list, description="Dynamic tabs configuration for frontend explainability drawer")
    story: list[StoryStepItem] = Field(default_factory=list, description="Visual Story Mode steps walking through AI reasoning like a trusted expert")

    # Domain Awareness System Fields
    domain: str = Field(default="healthcare", description="Active domain mode key: healthcare, law, finance, general")
    domain_context: DomainContextSection | None = Field(default=None, description="Domain context banner details")
    warning_card: WarningCardSection | None = Field(default=None, description="Special domain warning card (Emergency, Jurisdiction, Risk)")
    follow_up_questions: list[str] = Field(default_factory=list, description="Contextual follow-up question chips")

    # Frontend Compatibility Fields
    content: str = Field(..., description="Alias for answer")
    confidenceScore: float = Field(..., description="Alias for trust score")
    thinkingSteps: list[CompatibilityThinkingStep] = Field(..., description="Legacy thinking steps list")
    citations_legacy: list[CompatibilityCitation] = Field(default_factory=list, description="Legacy citation list")

    @field_validator("answer", "content")
    @classmethod
    def non_empty_string(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Response text cannot be empty")
        return v.strip()

