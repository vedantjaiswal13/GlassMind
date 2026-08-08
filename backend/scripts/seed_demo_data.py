"""
GlassMind Demo Seeding Script — Vector DB Population

Fills the Qdrant index with initial document chunks and embeddings, mimicking
the existence of two uploaded knowledge base files:
1. GlassMind_Architecture_Spec.pdf
2. XAI_Model_Interpretability_Benchmark.pdf
"""

import os
import sys
import logging

# Ensure parent directory is in python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.services.chunking_service import ChunkingService, TextChunk
from app.services.embedding_service import EmbeddingService
from app.services.qdrant_service import get_qdrant_service

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("seed_demo")

# Sample document text data representing pages of the mock PDFs
DOCUMENTS = {
    "GlassMind_Architecture_Spec.pdf": [
        # Page 1
        "GlassMind is a multi-stage Explainable AI (XAI) pipeline architecture. "
        "The backend is built using FastAPI in Python, providing low-latency streaming endpoints. "
        "The frontend uses Next.js with React Server Components, styled with vanilla CSS and animated using framer-motion. "
        "The core data stack consists of PostgreSQL for metadata, Redis for session cache, and Qdrant as the vector database. "
        "The primary goal of GlassMind is to make complex AI models transparent and trustworthy for business users.",
        # Page 2
        "The RAG (Retrieval-Augmented Generation) pipeline in GlassMind works as follows: "
        "First, text is extracted from uploaded PDF documents using PyMuPDF. "
        "Second, the text is split into chunks of 800 characters with a 150-character overlap. "
        "Third, embeddings are computed using the sentence-transformers all-MiniLM-L6-v2 model. "
        "Fourth, the chunks are indexed in Qdrant using Cosine distance. "
        "Finally, when a query arrives, matched chunks are retrieved to ground the answer.",
        # Page 3
        "The Trust Engine evaluates response reliability across four dimensions: "
        "1. Source Similarity: Measures the average similarity score of retrieved chunks in Qdrant. "
        "2. Source Count: Checks the number of unique documents supporting the answer. "
        "3. Answer Consistency: Computes vocabulary overlap between the answer and source chunks. "
        "4. Factual Verification: Evaluates whether claims are directly traceable to document sources. "
        "The overall trust score is mapped to categories: Verified, High Grounding, Medium Grounding, or Low Grounding.",
    ],
    "XAI_Model_Interpretability_Benchmark.pdf": [
        # Page 1
        "Explainable AI (XAI) models require standard benchmarks for evaluation. "
        "Traditional neural networks are black boxes. GlassMind introduces human-centric explainability "
        "by presenting visual aids instead of mathematical formulas. These visual aids include "
        "the confidence helix, the reasoning tree, counterfactual simulations, and feature attributions (SHAP scores). "
        "Users can inspect what would change if input scenarios were perturbed.",
        # Page 2
        "In credit risk classification benchmarks, GlassMind's counterfactual engine successfully "
        "illustrates how minor changes in income or debt ratios can alter decision outcomes. "
        "The consensus engine ensures that the primary LLM answers are grounded, eliminating hallucinations. "
        "Older documents are given lower weightings when conflicting data is identified, maintaining data freshness."
    ]
}


def seed():
    logger.info("Initializing GlassMind seed services...")
    
    chunking_service = ChunkingService()
    embedding_service = EmbeddingService()
    qdrant_service = get_qdrant_service()
    
    total_chunks = 0
    
    for filename, pages in DOCUMENTS.items():
        logger.info(f"Processing and indexing mock document: {filename}...")
        
        # Format pages as objects
        page_objs = [{"page_number": idx + 1, "text": text} for idx, text in enumerate(pages)]
        
        # Chunk document
        chunks = chunking_service.chunk_document(filename, page_objs)
        logger.info(f"Created {len(chunks)} chunks for {filename}.")
        
        if not chunks:
            continue
            
        # Embed and index
        chunk_texts = [c.text for c in chunks]
        embeddings = embedding_service.embed_batch(chunk_texts)
        
        logger.info(f"Upserting vectors into Qdrant collection '{qdrant_service.collection_name}'...")
        qdrant_service.upsert_chunks(chunks, embeddings)
        total_chunks += len(chunks)
        
    logger.info(f"Demo database seeding completed successfully. Indexed {total_chunks} total chunks.")


if __name__ == "__main__":
    seed()
