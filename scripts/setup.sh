#!/usr/bin/env bash
# GlassMind — Project Setup Script (Linux/macOS)
# Usage: chmod +x scripts/setup.sh && ./scripts/setup.sh

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "╔══════════════════════════════════════╗"
echo "║     GlassMind — Project Setup        ║"
echo "╚══════════════════════════════════════╝"
echo ""

# ---- Colors ----
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# ---- Check Prerequisites ----
log_info "Checking prerequisites..."

command -v node >/dev/null 2>&1 || { log_error "Node.js is required but not installed."; exit 1; }
command -v npm >/dev/null 2>&1 || { log_error "npm is required but not installed."; exit 1; }
command -v python3 >/dev/null 2>&1 || { log_error "Python 3 is required but not installed."; exit 1; }

NODE_VERSION=$(node --version)
PYTHON_VERSION=$(python3 --version)
log_info "Node.js: $NODE_VERSION"
log_info "Python: $PYTHON_VERSION"

# ---- Environment Variables ----
log_info "Setting up environment variables..."

if [ ! -f "$PROJECT_ROOT/.env" ]; then
    cp "$PROJECT_ROOT/.env.example" "$PROJECT_ROOT/.env"
    log_info "Created .env from .env.example"
else
    log_warn ".env already exists, skipping"
fi

if [ ! -f "$PROJECT_ROOT/backend/.env" ]; then
    cp "$PROJECT_ROOT/backend/.env.example" "$PROJECT_ROOT/backend/.env"
    log_info "Created backend/.env from .env.example"
else
    log_warn "backend/.env already exists, skipping"
fi

# ---- Frontend Setup ----
log_info "Setting up frontend..."

cd "$PROJECT_ROOT/frontend"
npm install
log_info "Frontend dependencies installed"

if [ ! -f ".env.local" ]; then
    echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local
    echo "NEXT_PUBLIC_APP_NAME=GlassMind" >> .env.local
    log_info "Created frontend/.env.local"
fi

# ---- Backend Setup ----
log_info "Setting up backend..."

cd "$PROJECT_ROOT/backend"

if [ ! -d ".venv" ]; then
    python3 -m venv .venv
    log_info "Created Python virtual environment"
fi

source .venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
log_info "Backend dependencies installed"

# ---- Done ----
echo ""
echo "╔══════════════════════════════════════╗"
echo "║        Setup Complete! 🚀            ║"
echo "╚══════════════════════════════════════╝"
echo ""
log_info "To start the frontend:  cd frontend && npm run dev"
log_info "To start the backend:   cd backend && source .venv/bin/activate && uvicorn app.main:app --reload"
log_info "To start with Docker:   docker compose up -d"
