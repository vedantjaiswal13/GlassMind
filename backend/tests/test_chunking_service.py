"""
Unit tests for ChunkingService.
"""

from app.services.chunking_service import ChunkingService


def test_split_text_to_sentences():
    service = ChunkingService()
    text = "Hello world! This is sentence two. Is this sentence three?"
    sentences = service.split_text_to_sentences(text)
    assert len(sentences) == 3
    assert sentences[0] == "Hello world!"
    assert sentences[1] == "This is sentence two."
    assert sentences[2] == "Is this sentence three?"


def test_chunk_page_basic():
    service = ChunkingService(chunk_size=100, overlap=20)
    page_text = "This is a long sentence that should easily fit in a single chunk. And this is another sentence."
    chunks = service.chunk_page(page_text, page_number=1, document_id="doc_1")
    
    assert len(chunks) > 0
    for chunk in chunks:
        assert chunk.document_id == "doc_1"
        assert chunk.page_number == 1
        assert len(chunk.text) <= 100


def test_chunk_document():
    service = ChunkingService(chunk_size=50, overlap=10)
    pages = [
        "First page content lines.",
        "Second page content lines."
    ]
    chunks = service.chunk_document("test.pdf", pages)
    assert len(chunks) >= 2
