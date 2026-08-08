import time
import logging
from dataclasses import dataclass
from typing import Any

from app.services.embedding_service import get_embedding_service, EmbeddingService
from app.services.qdrant_service import get_qdrant_service, QdrantService
from app.services.ranking_service import get_ranking_service, RankingService, RankResult
from app.schemas.chat_response import EvidenceItem

logger = logging.getLogger(__name__)


@dataclass
class RetrievedChunk:
    """A matched document segment containing context and metadata."""
    text: str
    score: float
    document_name: str
    page_number: int
    chunk_id: str
    document_id: str
    section_title: str = "General"
    heading: str = ""


@dataclass
class RetrievalResult:
    """Collection of retrieved document chunks matched and re-ranked for a query."""
    query: str
    chunks: list[RetrievedChunk]
    average_score: float
    evidence: list[EvidenceItem]
    total_scanned: int = 0
    retrieval_time_ms: int = 0
    rerank_time_ms: int = 0


class RetrievalService:
    """Service to fetch relevant context from the vector database for a user query."""

    def __init__(
        self,
        embedding_service: EmbeddingService,
        qdrant_service: QdrantService,
        ranking_service: RankingService | None = None
    ):
        self.embedding_service = embedding_service
        self.qdrant_service = qdrant_service
        self.ranking_service = ranking_service or get_ranking_service()

    def retrieve(self, query: str, top_k: int = 5) -> RetrievalResult:
        """
        Embed the query, search vector index, and re-rank candidates into evidence objects.
        """
        if not query.strip() or top_k == 0:
            return RetrievalResult(
                query=query,
                chunks=[],
                average_score=0.0,
                evidence=[],
                total_scanned=0,
                retrieval_time_ms=0,
                rerank_time_ms=0
            )

        t0 = time.time()
        # 1. Embed query
        query_vector = self.embedding_service.embed_text(query)

        # 2. Search Qdrant candidates (fetch extra candidates for re-ranking)
        candidate_matches = self.qdrant_service.search(query_vector, limit=max(top_k * 2, 10))
        retrieval_time_ms = int((time.time() - t0) * 1000)
        total_scanned = self.qdrant_service.get_total_chunk_count()

        # 3. Re-rank candidate chunks using RankingService
        rank_result: RankResult = self.ranking_service.rank_chunks(
            query=query,
            retrieved_chunks=candidate_matches,
            top_k=top_k
        )

        # 4. Construct legacy RetrievedChunk wrappers for compatibility
        chunks: list[RetrievedChunk] = []
        scores: list[float] = []
        for item in rank_result.evidence:
            chunks.append(RetrievedChunk(
                text=item.excerpt,
                score=item.relevance_score,
                document_name=item.document_name,
                page_number=item.page_number,
                chunk_id=item.evidence_id,
                document_id=item.document_name.replace(" ", "_"),
                section_title=item.section,
                heading=item.section
            ))
            scores.append(item.relevance_score)

        avg_score = sum(scores) / len(scores) if scores else 0.0

        logger.info(
            f"Hybrid retrieval complete: {len(chunks)} chunks re-ranked. "
            f"Avg score: {avg_score:.3f} | Retrieval: {retrieval_time_ms}ms | Rerank: {rank_result.rerank_time_ms}ms"
        )

        return RetrievalResult(
            query=query,
            chunks=chunks,
            average_score=avg_score,
            evidence=rank_result.evidence,
            total_scanned=total_scanned,
            retrieval_time_ms=retrieval_time_ms,
            rerank_time_ms=rank_result.rerank_time_ms
        )


def get_retrieval_service() -> RetrievalService:
    """Dependency provider that initializes the retrieval service components."""
    embedding_service = get_embedding_service()
    qdrant_service = get_qdrant_service()
    ranking_service = get_ranking_service()
    return RetrievalService(
        embedding_service=embedding_service,
        qdrant_service=qdrant_service,
        ranking_service=ranking_service
    )
