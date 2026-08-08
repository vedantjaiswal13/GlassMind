"""
GlassMind Prompt Service — Prompt File Loading and Caching

Automatically loads and caches prompt templates from backend/app/prompts/.
Enables hot-reloading of prompts during development.
"""

import os
import logging
from functools import lru_cache

from app.config.settings import get_settings

logger = logging.getLogger(__name__)

# Base prompts directory path relative to this file
PROMPTS_DIR = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "prompts"
)


class PromptService:
    """Service to load, cache, and hot-reload prompt templates."""

    def __init__(self, prompts_dir: str = PROMPTS_DIR):
        self.prompts_dir = prompts_dir
        self._cache: dict[str, str] = {}

    def _read_prompt_file(self, filename: str) -> str:
        """Read a prompt file's content, creating it if missing."""
        filepath = os.path.join(self.prompts_dir, filename)
        if not os.path.exists(filepath):
            logger.warning(f"Prompt file not found: {filepath}. Creating empty file.")
            try:
                os.makedirs(os.path.dirname(filepath), exist_ok=True)
                with open(filepath, "w", encoding="utf-8") as f:
                    f.write("")
            except Exception as e:
                logger.error(f"Failed to create missing prompt file {filepath}: {e}")
            return ""
            
        try:
            with open(filepath, "r", encoding="utf-8") as f:
                return f.read()
        except Exception as e:
            logger.error(f"Error reading prompt file {filepath}: {e}")
            return ""

    def _get_prompt(self, filename: str) -> str:
        """Get prompt content with development-mode auto-reloading."""
        settings = get_settings()
        
        # Bypass caching in development mode for live reload capabilities
        if settings.APP_ENV == "development" or settings.APP_DEBUG:
            return self._read_prompt_file(filename)

        # Retrieve from cache in production/other modes
        if filename not in self._cache:
            self._cache[filename] = self._read_prompt_file(filename)
        return self._cache[filename]

    def get_system_prompt(self) -> str:
        """Retrieve the system role definition and instruction prompt."""
        return self._get_prompt("system.txt")

    def get_answer_prompt(self) -> str:
        """Retrieve the prompt guiding standard answering logic."""
        return self._get_prompt("answer.txt")

    def get_reasoning_prompt(self) -> str:
        """Retrieve the prompt structuring reasoning and explainability logs."""
        return self._get_prompt("reasoning.txt")

    def get_trust_prompt(self) -> str:
        """Retrieve the prompt detailing trust factors and evaluations."""
        return self._get_prompt("trust.txt")

    def get_timeline_prompt(self) -> str:
        """Retrieve the prompt detailing timeline execution milestones."""
        return self._get_prompt("timeline.txt")

    def format_verified_prompt(self, query: str, context_str: str) -> str:
        """Assemble complete user prompt for VERIFIED mode using prompt templates."""
        answer_guidance = self.get_answer_prompt()
        reasoning_guidance = self.get_reasoning_prompt()
        trust_guidance = self.get_trust_prompt()

        return (
            f"User Query: {query}\n\n"
            f"Verified Document Context:\n{context_str}\n\n"
            f"Answering Instructions:\n{answer_guidance}\n\n"
            f"Reasoning Instructions:\n{reasoning_guidance}\n\n"
            f"Trust Evaluation Instructions:\n{trust_guidance}\n"
        )

    def format_general_prompt(self, query: str) -> str:
        """Assemble complete user prompt for GENERAL mode using prompt templates."""
        answer_guidance = self.get_answer_prompt()
        trust_guidance = self.get_trust_prompt()

        return (
            f"User Query: {query}\n\n"
            "Operating Mode: General Knowledge (No local documents available/matched)\n\n"
            f"Answering Instructions:\n{answer_guidance}\n\n"
            f"Trust Instructions:\n{trust_guidance}\n"
        )


@lru_cache
def get_prompt_service() -> PromptService:
    """Dependency provider that returns a cached PromptService instance."""
    return PromptService()
