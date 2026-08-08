import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from pydantic import BaseModel

from app.services.llm.gemini_service import (
    GeminiService,
    GeminiServiceError,
    GeminiResponse,
)
from google.genai.errors import APIError


class UserSchema(BaseModel):
    name: str
    age: int


@pytest.fixture
def mock_genai_client():
    client = MagicMock()
    client.aio = MagicMock()
    client.aio.models = MagicMock()
    client.aio.models.generate_content = AsyncMock()
    client.aio.models.generate_content_stream = AsyncMock()
    return client


@pytest.mark.asyncio
async def test_generate_success(mock_genai_client):
    mock_response = MagicMock()
    mock_response.text = "Hello, I am Gemini!"
    
    mock_usage = MagicMock()
    mock_usage.prompt_token_count = 10
    mock_usage.candidates_token_count = 5
    mock_usage.total_token_count = 15
    mock_response.usage_metadata = mock_usage
    
    mock_genai_client.aio.models.generate_content.return_value = mock_response

    service = GeminiService(client=mock_genai_client)
    res = await service.generate("Hi")

    assert isinstance(res, GeminiResponse)
    assert res.text == "Hello, I am Gemini!"
    assert res.model_name == "gemini-2.5-flash"
    assert res.usage_metadata is not None
    assert res.usage_metadata["total_token_count"] == 15
    mock_genai_client.aio.models.generate_content.assert_called_once()


@pytest.mark.asyncio
async def test_generate_json_success(mock_genai_client):
    mock_response = MagicMock()
    mock_response.text = '{"name": "Alice", "age": 30}'
    mock_genai_client.aio.models.generate_content.return_value = mock_response

    service = GeminiService(client=mock_genai_client)
    res = await service.generate_json("Generate user details", UserSchema)

    assert isinstance(res, UserSchema)
    assert res.name == "Alice"
    assert res.age == 30


@pytest.mark.asyncio
async def test_stream_success(mock_genai_client):
    async def async_generator():
        yield MagicMock(text="Part 1 ")
        yield MagicMock(text="Part 2")

    mock_genai_client.aio.models.generate_content_stream.return_value = async_generator()

    service = GeminiService(client=mock_genai_client)
    chunks = []
    async for chunk in service.stream("Stream something"):
        chunks.append(chunk)

    assert chunks == ["Part 1 ", "Part 2"]


@pytest.mark.asyncio
async def test_api_error_handling(mock_genai_client):
    # Construct an APIError using the correct signature
    api_error = APIError(
        code=429,
        response_json={"error": {"message": "Resource exhausted", "status": "RESOURCE_EXHAUSTED"}}
    )
    mock_genai_client.aio.models.generate_content.side_effect = api_error

    service = GeminiService(client=mock_genai_client)
    with pytest.raises(GeminiServiceError) as exc_info:
        await service.generate("Hi")
    
    assert "Gemini API Error occurred" in str(exc_info.value)
    assert "Resource exhausted" in str(exc_info.value)
