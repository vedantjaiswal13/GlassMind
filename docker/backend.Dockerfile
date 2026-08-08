# ================================
# GlassMind Backend — Dockerfile
# Multi-stage build for production
# ================================

# ---- Stage 1: Dependencies ----
FROM python:3.12-slim AS deps
WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt

# ---- Stage 2: Production ----
FROM python:3.12-slim AS runner
WORKDIR /app

# Create non-root user
RUN groupadd --system --gid 1001 glassmind \
    && useradd --system --uid 1001 --gid glassmind glassmind

# Copy installed packages from deps stage
COPY --from=deps /install /usr/local

# Copy application code
COPY . .

# Remove unnecessary files
RUN rm -rf tests/ .env.example .venv/

USER glassmind

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]
