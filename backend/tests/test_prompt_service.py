import os
import pytest
from unittest.mock import MagicMock, patch

from app.services.prompt_service import PromptService
from app.schemas.chat_response import (
    ChatResponse,
    TrustSection,
    ThinkingStepSection,
    TimelineSection,
    SourceSection,
    ExplanationSection,
    ConfidenceSection,
    CompatibilityThinkingStep,
    CompatibilityCitation,
)


def test_prompt_service_loading(tmp_path):
    # Setup temporary prompt files
    prompts_dir = tmp_path / "prompts"
    prompts_dir.mkdir()
    
    system_file = prompts_dir / "system.txt"
    system_file.write_text("System Prompt Content", encoding="utf-8")
    
    trust_file = prompts_dir / "trust.txt"
    trust_file.write_text("Trust Prompt Content", encoding="utf-8")

    service = PromptService(prompts_dir=str(prompts_dir))

    # Test loading
    assert service.get_system_prompt() == "System Prompt Content"
    assert service.get_trust_prompt() == "Trust Prompt Content"
    assert service.get_answer_prompt() == ""  # Creates empty file when missing


@patch("app.services.prompt_service.get_settings")
def test_prompt_service_caching(mock_get_settings, tmp_path):
    prompts_dir = tmp_path / "prompts"
    prompts_dir.mkdir()
    
    system_file = prompts_dir / "system.txt"
    system_file.write_text("First Version", encoding="utf-8")

    # Mock settings to return production mode
    mock_settings = MagicMock()
    mock_settings.APP_ENV = "production"
    mock_settings.APP_DEBUG = False
    mock_get_settings.return_value = mock_settings

    service = PromptService(prompts_dir=str(prompts_dir))

    # Load first time
    assert service.get_system_prompt() == "First Version"

    # Modify file contents
    system_file.write_text("Second Version", encoding="utf-8")

    # In production, it should return cached version
    assert service.get_system_prompt() == "First Version"


@patch("app.services.prompt_service.get_settings")
def test_prompt_service_development_reload(mock_get_settings, tmp_path):
    prompts_dir = tmp_path / "prompts"
    prompts_dir.mkdir()
    
    system_file = prompts_dir / "system.txt"
    system_file.write_text("First Version", encoding="utf-8")

    # Mock settings to return development mode
    mock_settings = MagicMock()
    mock_settings.APP_ENV = "development"
    mock_settings.APP_DEBUG = True
    mock_get_settings.return_value = mock_settings

    service = PromptService(prompts_dir=str(prompts_dir))

    # Load first time
    assert service.get_system_prompt() == "First Version"

    # Modify file contents
    system_file.write_text("Second Version", encoding="utf-8")

    # In development, it should reload from disk automatically
    assert service.get_system_prompt() == "Second Version"


def test_schemas_validation():
    # Valid model validation using nested schemas
    response = ChatResponse(
        answer="Hello World",
        trust=TrustSection(score=0.95, level="Verified", summary="Solid grounding"),
        thinking_steps=[ThinkingStepSection(title="Stage 1", status="completed")],
        timeline=[TimelineSection(step="Planning", timestamp="0.1s")],
        sources=[SourceSection(document="Doc 1", page=1, confidence=0.95)],
        explanation=ExplanationSection(
            why_this_answer="Detailed reason",
            evidence_summary="Summary of evidence",
            confidence_reason="Confidence score evaluation"
        ),
        confidence=ConfidenceSection(grounding=0.95, reasoning=0.95, verification=0.95, uncertainty=0.05),
        content="Hello World",
        confidenceScore=0.95,
        thinkingSteps=[CompatibilityThinkingStep(id="s-1", label="Stage 1")],
        citations=[CompatibilityCitation(id="c-1", source_id="d-1", label="Doc 1")]
    )
    assert response.answer == "Hello World"
    assert response.trust.score == 0.95
