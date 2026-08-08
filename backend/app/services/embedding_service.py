"""
GlassMind Embedding Service — Local Text Embeddings

Generates vector embeddings locally using sentence-transformers/all-MiniLM-L6-v2.
Model is loaded lazily and cached for optimal backend startup times.
"""

import logging
from functools import lru_cache

logger = logging.getLogger(__name__)

# Global placeholder for the model instance to avoid reloading
_MODEL_INSTANCE = None


def _load_model():
    """Lazily load the SentenceTransformer model."""
    global _MODEL_INSTANCE
    if _MODEL_INSTANCE is None:
        logger.info("Initializing SentenceTransformer model 'all-MiniLM-L6-v2'...")
        try:
            from sentence_transformers import SentenceTransformer
            _MODEL_INSTANCE = SentenceTransformer("all-MiniLM-L6-v2")
            logger.info("SentenceTransformer model loaded successfully.")
        except Exception as e:
            logger.critical(f"Failed to load sentence-transformers model: {e}")
            raise RuntimeError(f"Failed to load sentence-transformers model: {e}") from e
    return _MODEL_INSTANCE


class EmbeddingService:
    """Service to compute dense vector embeddings for chunks and queries."""

    def __init__(self):
        # Trigger lazy model loading setup
        pass

    def embed_text(self, text: str) -> list[float]:
        """
        Embed a single text string.
        
        Returns:
            list[float]: 384-dimensional dense vector.
        """
        if not text:
            return [0.0] * 384
        model = _load_model()
        embedding = model.encode(text, convert_to_numpy=True)
        return embedding.tolist()

    def embed_batch(self, texts: list[str]) -> list[list[float]]:
        """
        Embed a list of text strings in batch.
        
        Returns:
            list[list[float]]: List of 384-dimensional dense vectors.
        """
        if not texts:
            return []
        model = _load_model()
        embeddings = model.encode(texts, convert_to_numpy=True, batch_size=32)
        return embeddings.tolist()


@lru_cache
def get_embedding_service() -> EmbeddingService:
    """Dependency provider that returns a cached EmbeddingService instance."""
    return EmbeddingService()
