"""
GlassMind LLM Service — Google Gemini Integration

Provides a centralized service for interacting with Google's Gemini models
using the official unified google-genai SDK.
"""

import logging
from collections.abc import AsyncGenerator
from functools import lru_cache
from typing import Any, Type, TypeVar

from google import genai
from google.genai import types
from google.genai.errors import APIError
from pydantic import BaseModel, Field

from app.config.settings import get_settings

logger = logging.getLogger(__name__)

# Type variable for structured JSON output validation
T = TypeVar("T", bound=BaseModel)


class GeminiResponse(BaseModel):
    """Typed response model for standard text generation."""
    text: str = Field(..., description="The generated text content")
    model_name: str = Field(..., description="The name of the model that generated the content")
    usage_metadata: dict[str, Any] | None = Field(default=None, description="Token usage details")


class GeminiServiceError(Exception):
    """Custom exception raised by GeminiService operations."""
    pass


class GeminiService:
    """Service for interacting with Google's Gemini API using the latest google-genai SDK."""

    def __init__(self, client: genai.Client, default_model: str = "gemini-2.0-flash"):
        """
        Initialize the GeminiService.

        Args:
            client: The shared genai.Client instance.
            default_model: The default model to use for generation (defaults to gemini-2.5-flash).
        """
        import asyncio
        self.client = client
        self.default_model = default_model
        settings = get_settings()
        self._semaphore = asyncio.Semaphore(settings.GEMINI_MAX_CONCURRENT)

    async def generate(
        self,
        prompt: str,
        system_instruction: str | None = None,
        model: str | None = None,
        **kwargs: Any
    ) -> GeminiResponse:
        """
        Generate plain text using Gemini.
        """
        import time
        model_name = model or self.default_model
        
        config = types.GenerateContentConfig(
            system_instruction=system_instruction,
            **kwargs
        )

        start_time = time.time()
        async with self._semaphore:
            try:
                response = await self.client.aio.models.generate_content(
                    model=model_name,
                    contents=prompt,
                    config=config,
                )
                duration = round(time.time() - start_time, 3)
                
                usage = None
                if response.usage_metadata:
                    usage = {
                        "prompt_token_count": response.usage_metadata.prompt_token_count,
                        "candidates_token_count": response.usage_metadata.candidates_token_count,
                        "total_token_count": response.usage_metadata.total_token_count,
                    }

                logger.info(
                    f"Gemini generate completed in {duration}s | Model: {model_name} | "
                    f"Tokens: {usage.get('total_token_count') if usage else 'N/A'}"
                )

                text = response.text or ""
                return GeminiResponse(
                    text=text,
                    model_name=model_name,
                    usage_metadata=usage
                )

            except APIError as e:
                logger.error(f"Gemini API Error: {e.message} (Code: {e.code})")
                raise GeminiServiceError(f"Gemini API Error occurred: {e.message}") from e
            except Exception as e:
                logger.error(f"Unexpected error in generate(): {str(e)}")
                raise GeminiServiceError(f"An unexpected error occurred during generation: {str(e)}") from e

    async def generate_json(
        self,
        prompt: str,
        response_schema: Type[T],
        system_instruction: str | None = None,
        model: str | None = None,
        **kwargs: Any
    ) -> T:
        """
        Generate structured JSON content validated against a Pydantic model.
        """
        import time
        model_name = model or self.default_model
        
        config = types.GenerateContentConfig(
            system_instruction=system_instruction,
            response_mime_type="application/json",
            response_schema=response_schema,
            **kwargs
        )

        start_time = time.time()
        async with self._semaphore:
            try:
                response = await self.client.aio.models.generate_content(
                    model=model_name,
                    contents=prompt,
                    config=config,
                )
                duration = round(time.time() - start_time, 3)
                
                response_text = response.text or ""
                if not response_text:
                    raise GeminiServiceError("Model returned empty response for structured JSON generation")
                
                usage = None
                if response.usage_metadata:
                    usage = response.usage_metadata.total_token_count

                logger.info(
                    f"Gemini generate_json completed in {duration}s | Model: {model_name} | "
                    f"Tokens: {usage if usage else 'N/A'} | Schema: {response_schema.__name__}"
                )
                    
                return response_schema.model_validate_json(response_text)

            except APIError as e:
                logger.error(f"Gemini API Error (Structured JSON): {e.message} (Code: {e.code})")
                raise GeminiServiceError(f"Gemini API Error during JSON generation: {e.message}") from e
            except Exception as e:
                logger.error(f"Validation or processing error in generate_json(): {str(e)}")
                raise GeminiServiceError(f"Failed to generate structured JSON: {str(e)}") from e

    async def stream(
        self,
        prompt: str,
        system_instruction: str | None = None,
        model: str | None = None,
        **kwargs: Any
    ) -> AsyncGenerator[str, None]:
        """
        Stream the text response chunks.
        """
        model_name = model or self.default_model
        
        config = types.GenerateContentConfig(
            system_instruction=system_instruction,
            **kwargs
        )

        async with self._semaphore:
            try:
                response_stream = await self.client.aio.models.generate_content_stream(
                    model=model_name,
                    contents=prompt,
                    config=config,
                )
                
                async for chunk in response_stream:
                    if chunk.text:
                        yield chunk.text

            except APIError as e:
                logger.error(f"Gemini Streaming API Error: {e.message} (Code: {e.code})")
                raise GeminiServiceError(f"Gemini API Error during streaming: {e.message}") from e
            except Exception as e:
                logger.error(f"Unexpected error in stream(): {str(e)}")
                raise GeminiServiceError(f"Streaming failed: {str(e)}") from e


@lru_cache
def get_gemini_client() -> genai.Client:
    """
    Get or create the cached, singleton genai.Client instance.
    Configures retry settings automatically for transient errors.
    """
    settings = get_settings()
    api_key = settings.GEMINI_API_KEY
    
    if not api_key:
        logger.error("GEMINI_API_KEY is not set in settings or environment")
        raise ValueError("GEMINI_API_KEY must be configured in environment variables or .env file")
        
    # Configure default HTTP retry options for transient errors
    retry_options = types.HttpRetryOptions(
        initial_delay=1.0,  # 1 second
        attempts=5,         # Retry up to 5 times
    )
    
    http_options = types.HttpOptions(
        retry_options=retry_options,
        timeout=120 * 1000,  # 120 seconds in milliseconds
    )
    
    # Initialize the unified client.
    # NEVER log or print the api_key value.
    return genai.Client(
        api_key=api_key,
        http_options=http_options
    )


def get_gemini_service(
    client: genai.Client | None = None,
) -> GeminiService:
    """
    Dependency provider for GeminiService.
    Works both as a FastAPI Depends() and when called directly from other services.
    """
    if client is None:
        client = get_gemini_client()
    settings = get_settings()
    return GeminiService(client=client, default_model=settings.GEMINI_MODEL)
