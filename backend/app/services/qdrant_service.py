"""
GlassMind Qdrant Service — Vector Database Interface

Manages collection initialization, document chunk upserts, and vector searches.
Gracefully falls back to an in-memory client if the remote Qdrant service is unavailable.
"""

import logging
import uuid
from functools import lru_cache
from typing import Any

from qdrant_client import QdrantClient
from qdrant_client.http import models

from app.config.settings import get_settings

logger = logging.getLogger(__name__)


class QdrantService:
    """Service to interact with Qdrant Vector DB for document embedding storage & retrieval."""

    def __init__(self, client: QdrantClient, collection_name: str = "glassmind"):
        self.client = client
        self.collection_name = collection_name
        self._ensure_collection()

    def _ensure_collection(self) -> None:
        """Create the collection if it doesn't already exist."""
        try:
            # Check if collection exists
            collections = self.client.get_collections()
            exists = any(c.name == self.collection_name for c in collections.collections)
            
            if not exists:
                logger.info(f"Creating Qdrant collection: {self.collection_name} (384 dims, Cosine)...")
                self.client.create_collection(
                    collection_name=self.collection_name,
                    vectors_config=models.VectorParams(
                        size=384,  # Match all-MiniLM-L6-v2 vector dimension
                        distance=models.Distance.COSINE,
                    )
                )
                # Create payload index for document_id
                try:
                    self.client.create_payload_index(
                        collection_name=self.collection_name,
                        field_name="document_id",
                        field_schema=models.PayloadSchemaType.KEYWORD
                    )
                except Exception as ie:
                    logger.debug(f"Payload index creation note: {ie}")
                logger.info(f"Collection {self.collection_name} created successfully.")
            else:
                logger.debug(f"Qdrant collection {self.collection_name} already exists.")
        except Exception as e:
            logger.error(f"Error ensuring Qdrant collection exists: {e}")

    def upsert_chunks(self, chunks: list, embeddings: list[list[float]]) -> None:
        """
        Store text chunks and their embeddings in the vector collection.
        """
        if not chunks or not embeddings:
            return

        points = []
        for chunk, embedding in zip(chunks, embeddings):
            point_id = str(uuid.uuid5(uuid.NAMESPACE_DNS, chunk.chunk_id))
            
            payload = {
                "chunk_id": chunk.chunk_id,
                "text": chunk.text,
                "page_number": getattr(chunk, "page_number", 1),
                "start_char": getattr(chunk, "start_char", 0),
                "end_char": getattr(chunk, "end_char", len(chunk.text)),
                "document_id": getattr(chunk, "document_id", "default"),
                "section_title": getattr(chunk, "section_title", "General"),
                "heading": getattr(chunk, "heading", ""),
                "token_count": getattr(chunk, "token_count", len(chunk.text.split())),
                "keywords": getattr(chunk, "keywords", []),
                "created_at": getattr(chunk, "created_at", time.time()),
            }
            
            points.append(
                models.PointStruct(
                    id=point_id,
                    vector=embedding,
                    payload=payload
                )
            )

        try:
            self.client.upsert(
                collection_name=self.collection_name,
                points=points
            )
            logger.info(f"Successfully upserted {len(points)} chunks into collection '{self.collection_name}'.")
        except Exception as e:
            logger.error(f"Failed to upsert chunks into Qdrant: {e}")
            raise RuntimeError(f"Failed to upsert chunks into vector database: {e}") from e

    def search(self, query_embedding: list[float], limit: int = 10, document_id: str | None = None) -> list[dict[str, Any]]:
        """
        Search for the most similar chunks with optional metadata filter.
        """
        try:
            scroll_filter = None
            if document_id:
                scroll_filter = models.Filter(
                    must=[
                        models.FieldCondition(
                            key="document_id",
                            match=models.MatchValue(value=document_id)
                        )
                    ]
                )

            # Support both search and query_points API across qdrant-client versions
            if hasattr(self.client, "search"):
                results = self.client.search(
                    collection_name=self.collection_name,
                    query_vector=query_embedding,
                    query_filter=scroll_filter,
                    limit=limit
                )
            elif hasattr(self.client, "query_points"):
                response = self.client.query_points(
                    collection_name=self.collection_name,
                    query=query_embedding,
                    query_filter=scroll_filter,
                    limit=limit
                )
                results = response.points
            else:
                logger.error("QdrantClient has neither search nor query_points method.")
                return []
            
            scored_matches = []
            for item in results:
                if hasattr(item, "payload") and item.payload:
                    doc_id = item.payload.get("document_id", "")
                    doc_name = item.payload.get("chunk_id", "").split("-p")[0].replace("_", " ")
                    scored_matches.append({
                        "text": item.payload.get("text", ""),
                        "page_number": item.payload.get("page_number", 1),
                        "document_name": doc_name or doc_id,
                        "score": getattr(item, "score", 0.0),
                        "chunk_id": item.payload.get("chunk_id", ""),
                        "document_id": doc_id,
                        "section_title": item.payload.get("section_title", "General"),
                        "heading": item.payload.get("heading", ""),
                        "token_count": item.payload.get("token_count", 0),
                        "keywords": item.payload.get("keywords", []),
                        "created_at": item.payload.get("created_at", time.time())
                    })
            return scored_matches
        except Exception as e:
            logger.error(f"Qdrant search query failed: {e}")
            return []

    def get_total_chunk_count(self) -> int:
        """Count total vectors in collection."""
        try:
            res = self.client.count(collection_name=self.collection_name)
            return res.count
        except Exception:
            return 0

    def delete_document(self, document_id: str) -> bool:
        """Delete all chunks belonging to a document ID."""
        try:
            self.client.delete(
                collection_name=self.collection_name,
                points_selector=models.FilterSelector(
                    filter=models.Filter(
                        must=[
                            models.FieldCondition(
                                key="document_id",
                                match=models.MatchValue(value=document_id)
                            )
                        ]
                    )
                )
            )
            logger.info(f"Deleted document '{document_id}' from collection '{self.collection_name}'.")
            return True
        except Exception as e:
            logger.error(f"Failed to delete document '{document_id}': {e}")
            return False

    def get_all_document_chunks(self, document_id: str) -> list[dict[str, Any]]:
        """Retrieve all chunks belonging to a document ID."""
        try:
            res, _ = self.client.scroll(
                collection_name=self.collection_name,
                scroll_filter=models.Filter(
                    must=[
                        models.FieldCondition(
                            key="document_id",
                            match=models.MatchValue(value=document_id)
                        )
                    ]
                ),
                limit=100
            )
            return [item.payload for item in res if item.payload]
        except Exception as e:
            logger.error(f"Failed to scroll document chunks: {e}")
            return []

    def has_uploaded_documents(self) -> bool:
        """Check if any document chunks exist in the vector index."""
        try:
            res, _ = self.client.scroll(
                collection_name=self.collection_name,
                limit=1
            )
            return len(res) > 0
        except Exception as e:
            logger.error(f"Error checking uploaded documents in Qdrant: {e}")
            return False


@lru_cache
def get_qdrant_client() -> QdrantClient:
    """Initialize a singleton QdrantClient instance, falling back to in-memory mode if needed."""
    settings = get_settings()
    
    # Check if a custom Qdrant connection is desired
    if settings.QDRANT_URL and settings.QDRANT_URL != "http://localhost:6333":
        logger.info(f"Attempting connection to custom Qdrant server: {settings.QDRANT_URL}")
        try:
            client = QdrantClient(
                url=settings.QDRANT_URL,
                api_key=settings.QDRANT_API_KEY,
                timeout=5.0
            )
            # Ping database
            client.get_collections()
            logger.info("Connected to remote Qdrant successfully.")
            return client
        except Exception as e:
            logger.warning(f"Failed connection to {settings.QDRANT_URL}: {e}. Falling back to localhost/memory.")

    # Try connecting to standard local Docker instance
    try:
        client = QdrantClient(url="http://localhost:6333", timeout=2.0)
        client.get_collections()
        logger.info("Connected to local Docker Qdrant service.")
        return client
    except Exception:
        # Gracefully fall back to local in-memory execution for ease of development/demo seeding
        logger.info("Local Qdrant instance not found on port 6333. Launching in-memory Qdrant client.")
        return QdrantClient(location=":memory:")


@lru_cache
def get_qdrant_service() -> QdrantService:
    """Get the QdrantService provider."""
    client = get_qdrant_client()
    return QdrantService(client=client)
