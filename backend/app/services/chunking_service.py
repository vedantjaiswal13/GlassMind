import re
import time
import logging
from dataclasses import dataclass, field

logger = logging.getLogger(__name__)


@dataclass
class TextChunk:
    """A single chunk of text with enriched structural metadata."""
    chunk_id: str
    text: str
    page_number: int
    start_char: int
    end_char: int
    document_id: str
    token_count: int = 0
    section_title: str = "General"
    heading: str = ""
    keywords: list[str] = field(default_factory=list)
    created_at: float = field(default_factory=time.time)


class ChunkingService:
    """Service to divide extracted page content into smart overlapping character/token chunks."""

    def __init__(self, target_tokens: int = 600, overlap_percent: float = 0.20):
        # Rough token approximation: 1 token ≈ 4 characters
        self.target_tokens = target_tokens
        self.chunk_size = target_tokens * 4  # ~2400 chars
        self.overlap = int(self.chunk_size * overlap_percent)  # ~480 chars

    def extract_keywords(self, text: str, top_k: int = 5) -> list[str]:
        """Extract key non-stopword terms from chunk text."""
        words = re.findall(r'\b[a-zA-Z]{4,}\b', text.lower())
        stopwords = {
            "this", "that", "with", "from", "have", "they", "which", "would",
            "there", "their", "what", "about", "which", "when", "make", "can",
            "like", "time", "just", "know", "take", "people", "into", "year",
            "your", "good", "some", "could", "them", "see", "other", "than"
        }
        filtered = [w for w in words if w not in stopwords]
        freq: dict[str, int] = {}
        for w in filtered:
            freq[w] = freq.get(w, 0) + 1
        sorted_words = sorted(freq.keys(), key=lambda k: freq[k], reverse=True)
        return sorted_words[:top_k]

    def split_text_to_sentences(self, text: str) -> list[str]:
        """Split text into sentences using regex heuristics."""
        if not text:
            return []
        sentence_end = re.compile(r'(?<=[.!?])\s+')
        sentences = sentence_end.split(text)
        return [s.strip() for s in sentences if s.strip()]

    def chunk_page(
        self,
        page_text: str,
        page_number: int,
        document_id: str,
        section_title: str = "General",
        heading: str = ""
    ) -> list[TextChunk]:
        """
        Divide a single page's text into chunks of target token size with 20% overlap.
        Preserves paragraph and sentence boundaries where possible.
        """
        chunks: list[TextChunk] = []
        if not page_text or not page_text.strip():
            return chunks

        sentences = self.split_text_to_sentences(page_text)
        current_chunk_parts: list[str] = []
        current_len = 0
        chunk_idx = 0

        for sentence in sentences:
            sentence_len = len(sentence)

            if current_len + (1 if current_len > 0 else 0) + sentence_len > self.chunk_size:
                if current_chunk_parts:
                    chunk_text = " ".join(current_chunk_parts)
                    start_char = page_text.find(chunk_text)
                    if start_char == -1:
                        start_char = 0

                    token_count = max(1, len(chunk_text.split()))
                    keywords = self.extract_keywords(chunk_text)

                    chunks.append(
                        TextChunk(
                            chunk_id=f"{document_id}-p{page_number}-c{chunk_idx}",
                            text=chunk_text,
                            page_number=page_number,
                            start_char=start_char,
                            end_char=start_char + len(chunk_text),
                            document_id=document_id,
                            token_count=token_count,
                            section_title=section_title,
                            heading=heading,
                            keywords=keywords,
                            created_at=time.time()
                        )
                    )
                    chunk_idx += 1

                # Setup backtrack overlap
                overlap_target = self.overlap
                backtrack_parts: list[str] = []
                backtrack_len = 0
                for part in reversed(current_chunk_parts):
                    if backtrack_len + len(part) <= overlap_target:
                        backtrack_parts.insert(0, part)
                        backtrack_len += len(part) + 1
                    else:
                        break

                current_chunk_parts = backtrack_parts
                current_len = sum(len(p) for p in current_chunk_parts) + (len(current_chunk_parts) - 1 if current_chunk_parts else 0)

            current_chunk_parts.append(sentence)
            current_len += (1 if current_len > 0 else 0) + sentence_len

        if current_chunk_parts:
            chunk_text = " ".join(current_chunk_parts)
            start_char = page_text.find(chunk_text)
            if start_char == -1:
                start_char = 0

            token_count = max(1, len(chunk_text.split()))
            keywords = self.extract_keywords(chunk_text)

            chunks.append(
                TextChunk(
                    chunk_id=f"{document_id}-p{page_number}-c{chunk_idx}",
                    text=chunk_text,
                    page_number=page_number,
                    start_char=start_char,
                    end_char=start_char + len(chunk_text),
                    document_id=document_id,
                    token_count=token_count,
                    section_title=section_title,
                    heading=heading,
                    keywords=keywords,
                    created_at=time.time()
                )
            )

        return chunks

    def chunk_document(self, doc_filename: str, pages: list) -> list[TextChunk]:
        """
        Chunk an entire document by iterating over its pages/sections.
        """
        all_chunks: list[TextChunk] = []
        document_id = doc_filename.replace(" ", "_").replace(".", "_")

        for idx, page in enumerate(pages):
            page_num = idx + 1
            section_title = "General"
            heading = ""

            if hasattr(page, "text"):  # PDFService.PageContent
                text = page.text
                page_num = page.page_number
                if getattr(page, "headings", None):
                    heading = page.headings[0]
                    section_title = heading
            elif isinstance(page, dict) and "text" in page:
                text = page["text"]
                page_num = page.get("page_number", page_num)
                heading = page.get("heading", "")
                section_title = heading or "General"
            else:
                text = str(page)

            page_chunks = self.chunk_page(text, page_num, document_id, section_title, heading)
            all_chunks.extend(page_chunks)

        logger.info(f"Chunked document '{doc_filename}' into {len(all_chunks)} enriched chunks.")
        return all_chunks


def get_chunking_service() -> ChunkingService:
    """Dependency provider for ChunkingService."""
    return ChunkingService()


def get_chunking_service() -> ChunkingService:
    """Dependency provider for ChunkingService."""
    return ChunkingService()
