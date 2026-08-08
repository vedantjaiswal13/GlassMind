# GlassMind

**Explainable AI Platform** — Making AI decisions transparent, interpretable, and trustworthy.

---

## 🏗️ Architecture

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 15 (App Router), React 19, TypeScript, TailwindCSS v4, shadcn/ui |
| **Backend** | FastAPI, Python 3.12, LangGraph, LangChain |
| **Database** | PostgreSQL, Redis, Qdrant |
| **DevOps** | Docker, Docker Compose, GitHub Actions |

## 📁 Project Structure

```
glassmind/
├── frontend/          # Next.js 15 application
├── backend/           # FastAPI application
├── shared/            # Shared types, contracts, and events
├── docs/              # Project documentation
├── scripts/           # Setup and utility scripts
├── docker/            # Dockerfiles
├── .github/           # GitHub Actions workflows
├── docker-compose.yml # Container orchestration
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** ≥ 20.x
- **Python** ≥ 3.12
- **Docker** & **Docker Compose** v2
- **PostgreSQL** 16+
- **Redis** 7+

### Setup

#### Option 1: Automated Setup

**Linux/macOS:**
```bash
chmod +x scripts/setup.sh
./scripts/setup.sh
```

**Windows (PowerShell):**
```powershell
.\scripts\setup.ps1
```

#### Option 2: Manual Setup

```bash
# Frontend
cd frontend
npm install
cp .env.example .env.local
npm run dev

# Backend
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload
```

#### Option 3: Docker

```bash
docker compose up -d
```

## 🔧 Development

| Command | Description |
|---------|-------------|
| `npm run dev` | Start frontend dev server |
| `npm run build` | Build frontend for production |
| `npm run lint` | Lint frontend code |
| `npm run format` | Format frontend code |
| `uvicorn app.main:app --reload` | Start backend dev server |
| `alembic upgrade head` | Run database migrations |
| `docker compose up -d` | Start all services |
| `docker compose down` | Stop all services |

## 📖 Documentation

- [Architecture Overview](docs/ARCHITECTURE.md)
- [Setup Guide](docs/SETUP.md)
- [Contributing](docs/CONTRIBUTING.md)

## 🤝 Contributing

Please read our [Contributing Guide](docs/CONTRIBUTING.md) before submitting a Pull Request.

## 📄 License

This project is proprietary. All rights reserved.
