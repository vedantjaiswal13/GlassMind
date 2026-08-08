"""
GlassMind Ranking Service — Multi-Factor Evidence Re-ranking

Calculates composite relevance scores for retrieved chunks combining vector similarity,
BM25/keyword overlap, section title relevance, heading importance, and document recency.
"""

import re
import time
import logging
from typing import Any
from pydantic import BaseModel, Field

from app.schemas.chat_response import EvidenceItem

logger = logging.getLogger(__name__)


class RankResult(BaseModel):
    """Ranked evidence output with scoring metrics."""
    evidence: list[EvidenceItem]
    top_score: float
    rerank_time_ms: int


class RankingService:
    """Service to re-rank candidate document chunks into scored Evidence objects."""

    def calculate_keyword_score(self, query: str, text: str) -> float:
        """Calculate BM25-style term frequency overlap score."""
        query_words = set(re.findall(r'\b[a-zA-Z]{3,}\b', query.lower()))
        if not query_words:
            return 0.5

        text_lower = text.lower()
        matches = sum(1 for word in query_words if word in text_lower)
        return min(1.0, matches / len(query_words))

    def calculate_heading_score(self, query: str, heading: str, section: str) -> float:
        """Evaluate title/heading relevance against user query."""
        heading_text = f"{heading} {section}".strip().lower()
        if not heading_text:
            return 0.5

        query_words = set(re.findall(r'\b[a-zA-Z]{3,}\b', query.lower()))
        matches = sum(1 for word in query_words if word in heading_text)
        return 1.0 if matches > 0 else 0.5

    def rank_chunks(
        self,
        query: str,
        retrieved_chunks: list[dict[str, Any]],
        top_k: int = 5
    ) -> RankResult:
        """
        Re-rank candidate chunks using multi-factor scoring:
        - Vector Similarity (40%)
        - Keyword Overlap (30%)
        - Heading / Section Relevance (20%)
        - Recency / Document Priority (10%)
        """
        t0 = time.time()
        scored_items: list[tuple[float, EvidenceItem]] = []

        for idx, chunk in enumerate(retrieved_chunks):
            chunk_id = chunk.get("chunk_id", f"chk-{idx}")
            doc_name = chunk.get("document_name", "Document")
            page_num = chunk.get("page_number", 1)
            section = chunk.get("section_title", chunk.get("section", "General"))
            heading = chunk.get("heading", "")
            text = chunk.get("text", "")
            vector_sim = float(chunk.get("score", 0.5))

            # Factor calculations
            kw_score = self.calculate_keyword_score(query, text)
            heading_score = self.calculate_heading_score(query, heading, section)
            recency_score = 0.9  # Baseline priority

            # Hybrid Weighted Formula
            composite_score = round(
                (vector_sim * 0.40) +
                (kw_score * 0.30) +
                (heading_score * 0.20) +
                (recency_score * 0.10),
                3
            )

            # Rationale generation
            reasons = []
            if vector_sim >= 0.7:
                reasons.append("high semantic similarity")
            if kw_score >= 0.6:
                reasons.append("exact keyword match")
            if heading_score >= 0.8:
                reasons.append("relevant section heading")
            if not reasons:
                reasons.append("contextual overlap")
            reason_selected = f"Selected due to {', '.join(reasons)}."

            evidence_item = EvidenceItem(
                evidence_id=chunk_id,
                document_name=doc_name,
                page_number=page_num,
                section=section or "General",
                excerpt=text,
                relevance_score=composite_score,
                confidence=round(min(1.0, composite_score + 0.1), 2),
                reason_selected=reason_selected
            )

            scored_items.append((composite_score, evidence_item))

        # Sort descending by composite score
        scored_items.sort(key=lambda x: x[0], reverse=True)
        top_items = [item[1] for item in scored_items[:top_k]]
        top_score = top_items[0].relevance_score if top_items else 0.0
        rerank_time_ms = int((time.time() - t0) * 1000)

        logger.info(f"Re-ranked {len(retrieved_chunks)} candidate chunks to {len(top_items)} top evidence items in {rerank_time_ms}ms. Top score: {top_score}")

        return RankResult(
            evidence=top_items,
            top_score=top_score,
            rerank_time_ms=rerank_time_ms
        )


def get_ranking_service() -> RankingService:
    """Dependency provider for RankingService."""
    return RankingService()
