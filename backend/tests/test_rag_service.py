"""
Unit tests for RAGService.
"""

import pytest
from unittest.mock import AsyncMock, MagicMock

from app.services.rag_service import RAGService
from app.services.retrieval_service import RetrievalResult, RetrievedChunk
from app.services.trust_engine import TrustResult, TrustMetricDetail


@pytest.mark.asyncio
async def test_process_query_success():
    # Mock retrieval service
    mock_retrieval = MagicMock()
    mock_retrieval.qdrant_service.has_uploaded_documents.return_value = True
    mock_retrieval.retrieve.return_value = RetrievalResult(
        query="What is GlassMind?",
        chunks=[
            RetrievedChunk(
                text="Grounded spec fact",
                score=0.9,
                document_name="GlassMind_Arch.pdf",
                page_number=1,
                chunk_id="doc_1-p1-c0",
                document_id="doc_1"
            )
        ],
        average_score=0.9
    )
    
    # Mock gemini service
    mock_gemini = MagicMock()
    mock_response = MagicMock()
    mock_response.answer = "This is a grounded answer."
    mock_response.thinking_summary = "Thought process description."
    mock_response.trust_summary = "Factual grounding summary."
    mock_response.sources_used = ["GlassMind_Arch.pdf"]
    mock_response.ignored_information = []
    mock_response.confidence = 0.95
    mock_response.timeline = ["Planning", "Searching", "Checking Documents", "Decision", "Generating"]
    
    mock_gemini.generate_json = AsyncMock(return_value=mock_response)
    
    # Mock prompt service
    mock_prompt = MagicMock()
    mock_prompt.get_system_prompt.return_value = "System settings"
    mock_prompt.get_answer_prompt.return_value = "Answer guide"
    mock_prompt.get_reasoning_prompt.return_value = "Reasoning guide"
    mock_prompt.get_trust_prompt.return_value = "Trust guide"
    
    # Mock trust engine
    mock_trust = MagicMock()
    mock_trust.compute_trust.return_value = TrustResult(
        score=0.96,
        level="Verified",
        summary="Grounded consensus verified.",
        factors=[
            TrustMetricDetail(factor="Source Grounding", score=0.9, explanation="Matched details.", status="pass")
        ]
    )
    
    rag_service = RAGService(
        retrieval_service=mock_retrieval,
        gemini_service=mock_gemini,
        prompt_service=mock_prompt,
        trust_engine=mock_trust
    )
    
    res = await rag_service.process_query("What is GlassMind?")
    
    # Assert output structure mapping matches the nested schema exactly
    assert res.answer_mode == "VERIFIED"
    assert res.answer == "This is a grounded answer."
    assert res.trust.score == 96.0
    assert res.trust.badge == "Verified"
    assert len(res.thinking_steps) == 5
    assert res.thinking_steps[0].description  # Dynamic description is non-empty
    assert res.thinking_steps[0].duration
    assert res.thinking_steps[0].confidence_gain
    assert res.explanation.why_this_answer == "Grounded consensus verified."
    assert res.content == "This is a grounded answer."
    # Validate dynamic summary_card
    assert res.summary_card.title == "Verified Answer"
    assert res.summary_card.color == "green"
    assert res.summary_card.icon == "shield-check"
    assert res.summary_card.grounding_status == "Verified"
    assert "%" in res.summary_card.trust_level


@pytest.mark.asyncio
async def test_process_query_general_mode():
    # Mock retrieval service with no uploaded documents
    mock_retrieval = MagicMock()
    mock_retrieval.qdrant_service.has_uploaded_documents.return_value = False
    mock_retrieval.retrieve.return_value = RetrievalResult(
        query="What is general knowledge?",
        chunks=[],
        average_score=0.0
    )
    
    # Mock gemini service
    mock_gemini = MagicMock()
    mock_response = MagicMock()
    mock_response.answer = "This is a general knowledge answer."
    mock_response.thinking_summary = "Processed using general knowledge interpreter."
    mock_response.trust_summary = "General knowledge."
    mock_response.sources_used = []
    mock_response.ignored_information = []
    mock_response.confidence = 0.65
    mock_response.timeline = ["Planning", "Searching", "Checking Documents", "Decision", "Generating"]
    
    mock_gemini.generate_json = AsyncMock(return_value=mock_response)
    
    mock_prompt = MagicMock()
    mock_trust = MagicMock()
    
    rag_service = RAGService(
        retrieval_service=mock_retrieval,
        gemini_service=mock_gemini,
        prompt_service=mock_prompt,
        trust_engine=mock_trust
    )
    
    res = await rag_service.process_query("What is general knowledge?")
    
    assert res.answer_mode == "GENERAL"
    assert res.trust.badge == "General"
    assert res.trust.level == "General Knowledge"
    assert res.explanation.recommendation == "Upload trusted documents to receive a fully verified answer."
    # Validate dynamic summary_card
    assert res.summary_card.title == "General Knowledge"
    assert res.summary_card.color == "orange"
    assert res.summary_card.icon == "sparkles"
    assert res.summary_card.grounding_status == "Unavailable"
    # Validate dynamic thinking steps
    assert len(res.thinking_steps) == 5
    assert res.thinking_steps[2].title == "Checked uploaded documents"
    assert "No uploaded documents" in res.thinking_steps[2].description

