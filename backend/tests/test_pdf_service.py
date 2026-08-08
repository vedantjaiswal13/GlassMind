"""
Unit tests for PDFService.
"""

from unittest.mock import MagicMock, patch
import pytest

from app.services.pdf_service import PDFService, PDFServiceError


def test_extract_from_bytes_success():
    service = PDFService()
    
    # Mock fitz Document and Page
    mock_page = MagicMock()
    mock_page.get_text.return_value = "Page content text"
    
    mock_doc = MagicMock()
    mock_doc.page_count = 2
    mock_doc.load_page.return_value = mock_page
    
    with patch("fitz.open", return_value=mock_doc) as mock_open:
        res = service.extract_from_bytes(b"pdfbytes", "test.pdf")
        
        mock_open.assert_called_once()
        assert res.filename == "test.pdf"
        assert res.page_count == 2
        assert len(res.pages) == 2
        assert res.pages[0].text == "Page content text"
        assert res.pages[0].page_number == 1
        assert res.total_chars > 0


def test_extract_from_bytes_failure():
    service = PDFService()
    
    with patch("fitz.open", side_effect=Exception("Failed to open")):
        with pytest.raises(PDFServiceError):
            service.extract_from_bytes(b"corruptbytes", "test.pdf")
