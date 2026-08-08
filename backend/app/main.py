"""
GlassMind Backend — Application Factory

Minimal FastAPI application with CORS, health check, and lifespan management.
Business logic, routes, and services are registered in their respective modules.
"""

from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config.settings import get_settings


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """
    Application lifespan manager.

    Startup: Initialize Qdrant collection, warm embedding model.
    Shutdown: Release resources.
    """
    import logging
    settings = get_settings()
    logging.basicConfig(
        level=getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO),
        format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    )
    logger = logging.getLogger(__name__)
    
    # --- Startup ---
    logger.info("GlassMind startup — initializing services...")
    
    # 1. Initialize Qdrant collection (runs _ensure_collection in __init__)
    try:
        from app.services.qdrant_service import get_qdrant_service
        get_qdrant_service()
        logger.info("Qdrant collection initialized")
    except Exception as e:
        logger.warning(f"Qdrant init skipped (non-fatal): {e}")
    
    # 2. Warm up embedding model (lazy load on first call)
    try:
        from app.services.embedding_service import get_embedding_service
        embed_svc = get_embedding_service()
        embed_svc.embed_text("warmup")
        logger.info("Embedding model warmed up")
    except Exception as e:
        logger.warning(f"Embedding warmup skipped (non-fatal): {e}")

    # 3. Validate Gemini configuration
    try:
        from app.services.llm.gemini_service import get_gemini_service
        get_gemini_service()
        logger.info("Gemini service initialized successfully")
    except Exception as e:
        logger.warning(f"Gemini service initialization warning: {e}")
    
    logger.info("GlassMind startup complete")
    yield
    # --- Shutdown ---
    logger.info("GlassMind shutting down...")


def create_app() -> FastAPI:
    """Create and configure the FastAPI application."""
    settings = get_settings()

    app = FastAPI(
        title=settings.APP_NAME,
        version=settings.APP_VERSION,
        debug=settings.APP_DEBUG,
        lifespan=lifespan,
    )

    # --- CORS Middleware ---
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # --- Root & Health Check ---
    @app.get("/", tags=["system"])
    async def root() -> dict[str, str]:
        return {
            "name": settings.APP_NAME,
            "version": settings.APP_VERSION,
            "status": "online",
            "docs": "/docs",
            "health": "/health",
        }

    @app.get("/health", tags=["system"])
    async def health_check() -> dict[str, str]:
        return {"status": "healthy", "service": settings.APP_NAME}

    # --- Register Routers ---
    from app.api.routers.chat import router as chat_router
    from app.api.routers.upload import router as upload_router
    app.include_router(chat_router)
    app.include_router(upload_router)

    return app


# Application instance for uvicorn
app = create_app()
