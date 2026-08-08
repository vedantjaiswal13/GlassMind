"""
Unit tests for EmbeddingService.
"""

from unittest.mock import MagicMock, patch
import pytest

from app.services.embedding_service import EmbeddingService


def test_embed_text():
    service = EmbeddingService()
    
    mock_model = MagicMock()
    mock_model.encode.return_value.tolist.return_value = [0.1] * 384
    
    with patch("app.services.embedding_service._load_model", return_value=mock_model):
        res = service.embed_text("test query")
        assert len(res) == 384
        assert res[0] == 0.1


def test_embed_batch():
    service = EmbeddingService()
    
    mock_model = MagicMock()
    mock_model.encode.return_value.tolist.return_value = [[0.2] * 384, [0.3] * 384]
    
    with patch("app.services.embedding_service._load_model", return_value=mock_model):
        res = service.embed_batch(["text one", "text two"])
        assert len(res) == 2
        assert len(res[0]) == 384
        assert res[0][0] == 0.2
        assert res[1][0] == 0.3
