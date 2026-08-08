"""
Upload Router — PDF Ingestion and Knowledge Grounding Pipeline

Provides the POST /api/upload route to accept PDF files, extract page text,
split content into overlapping chunks, compute vector embeddings, and store
them in the Qdrant index.
"""

import logging
from fastapi import APIRouter, Depends, File, UploadFile, HTTPException, status
from pydantic import BaseModel, Field

from app.services.pdf_service import get_pdf_service, PDFService
from app.services.chunking_service import get_chunking_service, ChunkingService
from app.services.embedding_service import get_embedding_service, EmbeddingService
from app.services.qdrant_service import get_qdrant_service, QdrantService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/upload", tags=["upload"])

# Maximum size limit: 50MB in bytes
MAX_FILE_SIZE = 50 * 1024 * 1024


class UploadResponse(BaseModel):
    """Metadata response for a successfully ingested document."""
    id: str = Field(..., description="Unique document key identifier")
    name: str = Field(..., description="Ingested file name")
    pages: int = Field(..., description="Total pages processed")
    word_count: int = Field(default=0, description="Total words extracted")
    chunks: int = Field(..., description="Number of text chunks created")
    size_mb: float = Field(..., description="Size of file in megabytes")
    status: str = Field(default="indexed", description="Processing status")
    processing_time: str = Field(default="0.5s", description="Pipeline latency duration")


@router.post("", response_model=UploadResponse)
async def upload_document(
    file: UploadFile = File(..., description="Document file to ingest (.pdf, .docx, .txt, .md)"),
    pdf_service: PDFService = Depends(get_pdf_service),
    chunking_service: ChunkingService = Depends(get_chunking_service),
    embedding_service: EmbeddingService = Depends(get_embedding_service),
    qdrant_service: QdrantService = Depends(get_qdrant_service)
) -> UploadResponse:
    """
    Ingests PDF, DOCX, TXT, or MD file: extract text -> chunk -> embed -> save to Qdrant.
    """
    import time
    t0 = time.time()

    # 1. Validate File Format
    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Filename missing."
        )

    ext = file.filename.lower().rsplit(".", 1)[-1] if "." in file.filename else ""
    if ext not in ("pdf", "docx", "txt", "md"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file format. Supported formats: .pdf, .docx, .txt, .md"
        )

    # 2. Read File Bytes and Validate Size
    try:
        content_bytes = await file.read()
        file_size = len(content_bytes)
        if file_size > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=f"File exceeds maximum allowed limit of {MAX_FILE_SIZE // (1024 * 1024)}MB."
            )
    except Exception as e:
        logger.error(f"Error reading upload file stream: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to read uploaded file."
        )

    # 3. Extract Document Content
    try:
        doc = pdf_service.extract_from_bytes(content_bytes, file.filename)
    except Exception as e:
        logger.error(f"Document extraction error: {e}")
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Unable to parse document content: {str(e)}"
        )

    # 4. Segment Text into Chunks
    try:
        chunks = chunking_service.chunk_document(doc.filename, doc.pages)
    except Exception as e:
        logger.error(f"Chunking error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to segment document text: {str(e)}"
        )

    # 5. Generate Chunk Embeddings and Store in Qdrant
    if chunks:
        try:
            chunk_texts = [c.text for c in chunks]
            embeddings = embedding_service.embed_batch(chunk_texts)
            qdrant_service.upsert_chunks(chunks, embeddings)
        except Exception as e:
            logger.error(f"Embedding/Vector DB upsert failed: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to index document embeddings: {str(e)}"
            )
    else:
        logger.warning(f"Uploaded document '{file.filename}' yielded zero text content.")

    size_mb = round(file_size / (1024 * 1024), 2)
    doc_id = doc.filename.replace(" ", "_").replace(".", "_")
    processing_time_sec = round(time.time() - t0, 2)

    return UploadResponse(
        id=doc_id,
        name=doc.filename,
        pages=doc.page_count,
        word_count=getattr(doc, "total_words", 0),
        chunks=len(chunks),
        size_mb=size_mb,
        status="indexed",
        processing_time=f"{processing_time_sec}s"
    )
