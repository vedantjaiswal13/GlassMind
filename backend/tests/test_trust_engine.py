"""
Unit tests for TrustEngine.
"""

from app.services.trust_engine import TrustEngine
from app.services.retrieval_service import RetrievedChunk


def test_compute_trust_empty_chunks():
    engine = TrustEngine()
    res = engine.compute_trust("Query", "Answer", [])
    
    assert res.score == 0.15
    assert res.level == "Low Grounding"
    assert len(res.factors) == 1


def test_compute_trust_high_alignment():
    engine = TrustEngine()
    chunks = [
        RetrievedChunk(
            text="GlassMind is a multi-stage explainable AI platform designed to explain reasoning.",
            score=0.9,
            document_name="GlassMind_Arch.pdf",
            page_number=1,
            chunk_id="doc_1-p1-c0",
            document_id="doc_1"
        ),
        RetrievedChunk(
            text="The backend consists of FastAPI and the frontend is built using Next.js.",
            score=0.85,
            document_name="GlassMind_Arch.pdf",
            page_number=2,
            chunk_id="doc_1-p2-c0",
            document_id="doc_1"
        )
    ]
    
    res = engine.compute_trust(
        query="What is GlassMind?",
        answer="GlassMind is a multi-stage explainable AI platform containing FastAPI and Next.js.",
        retrieved_chunks=chunks
    )
    
    assert res.score >= 0.75
    assert len(res.factors) == 4
    # All check status should be pass
    for f in res.factors:
        assert f.status in ("pass", "warning")
