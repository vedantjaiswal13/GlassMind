"""
GlassMind Backend — Application Settings

Centralized configuration using Pydantic BaseSettings.
Values are loaded from environment variables and .env files.
"""

from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )

    # ---- General ----
    APP_NAME: str = "GlassMind"
    APP_VERSION: str = "0.1.0"
    APP_ENV: str = "development"
    APP_DEBUG: bool = True
    APP_HOST: str = "0.0.0.0"
    APP_PORT: int = 8000
    SECRET_KEY: str = "change-me-in-production"

    # ---- Database (PostgreSQL) ----
    DATABASE_URL: str = "postgresql+asyncpg://glassmind:glassmind@localhost:5432/glassmind"

    # ---- Redis ----
    REDIS_URL: str = "redis://localhost:6379/0"

    # ---- Qdrant (Vector DB) ----
    QDRANT_URL: str = "http://localhost:6333"
    QDRANT_API_KEY: str = ""

    # ---- AI / LLM (Gemini) ----
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-2.0-flash"
    GEMINI_MAX_CONCURRENT: int = 10
    GEMINI_RPM_LIMIT: int = 60
    LANGCHAIN_TRACING_V2: bool = False
    LANGCHAIN_API_KEY: str = ""

    # ---- Logging ----
    LOG_LEVEL: str = "INFO"

    # ---- CORS ----
    CORS_ORIGINS: list[str] = ["http://localhost:3000"]

    @property
    def is_production(self) -> bool:
        """Check if running in production environment."""
        return self.APP_ENV == "production"


@lru_cache
def get_settings() -> Settings:
    """Get cached application settings singleton."""
    return Settings()
