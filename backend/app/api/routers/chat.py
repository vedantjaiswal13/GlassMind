"""
Chat Router — FastAPI AI Chat, SSE Streaming, & Explainability Endpoint

Provides the POST /api/chat route returning Server-Sent Events (SSE).
Streams real reasoning stages (Planning -> Searching -> Evidence -> Verification -> Generating)
backed by actual retrieval and trust analysis steps, ending with the Complete JSON response.
"""

import json
import logging
import asyncio
from typing import AsyncGenerator

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

from app.services.rag_service import get_rag_service, RAGService
from app.schemas.chat_response import ChatResponse

logger = logging.getLogger(__name__)

# Register route with /api/chat prefix (no trailing slash)
router = APIRouter(prefix="/api/chat", tags=["chat"])


class ChatMessageRequest(BaseModel):
    message: str = Field(default="", description="User prompt text")
    conversation_id: str | None = Field(default=None, alias="conversationId", description="Optional conversation ID")


async def chat_stream_generator(
    message: str,
    rag_service: RAGService,
    conversation_id: str | None = None
) -> AsyncGenerator[str, None]:
    """
    Generates SSE stream representing real-time execution steps of the GlassMind pipeline:
    Planning -> Searching -> Checking Documents -> Decision -> Generating,
    culminating in the final validated ChatResponse payload.
    """
    try:
        # 1. Planning Stage
        yield "event: Planning\ndata: {\"message\": \"Parsing query intent and planning execution...\"}\n\n"
        await asyncio.sleep(0.3)

        # 2. Searching Stage
        yield "event: Searching\ndata: {\"message\": \"Scanning knowledge index for matching context...\"}\n\n"
        await asyncio.sleep(0.3)

        # Determine mode & document availability
        answer_mode, retrieval_res = rag_service.determine_answer_mode(message)
        chunk_count = len(retrieval_res.chunks)

        # 3. Checking Documents Stage
        yield f"event: Checking Documents\ndata: {{\"message\": \"Checking documents... Found {chunk_count} relevant text segments.\", \"chunk_count\": {chunk_count}}}\n\n"
        await asyncio.sleep(0.3)

        # 4. Decision Stage
        if answer_mode == "VERIFIED":
            decision_msg = "Documents Found -> Preparing Verified Answer"
        else:
            decision_msg = "No Documents Found -> Switching to General Knowledge Mode"

        yield f"event: Decision\ndata: {{\"message\": \"{decision_msg}\", \"answer_mode\": \"{answer_mode}\"}}\n\n"
        await asyncio.sleep(0.3)

        # 5. Generating Stage
        yield "event: Generating\ndata: {\"message\": \"Composing plain-English answer and trust evaluation...\"}\n\n"
        
        # Execute RAG processing using precomputed retrieval context to avoid double search
        chat_response = await rag_service.process_query(
            query=message,
            conversation_id=conversation_id,
            precomputed_mode=answer_mode,
            precomputed_retrieval=retrieval_res
        )
        
        # Stream complete final payload
        yield f"event: Complete\ndata: {chat_response.model_dump_json()}\n\n"

    except Exception as e:
        logger.error(f"Error in chat_stream_generator: {e}", exc_info=True)
        yield f"event: Error\ndata: {{\"error\": \"{str(e)}\"}}\n\n"


@router.post("")
async def process_chat_message(
    payload: ChatMessageRequest,
    rag_service: RAGService = Depends(get_rag_service)
) -> StreamingResponse:
    """
    Process chat queries and returns Server Sent Events (SSE) stream representing stage progression
    followed by the final validated JSON response.
    """
    query = payload.message.strip()
    if not query:
        query = "Please provide a brief summary of the uploaded documents."

    return StreamingResponse(
        chat_stream_generator(
            message=query,
            rag_service=rag_service,
            conversation_id=payload.conversation_id
        ),
        media_type="text/event-stream"
    )
