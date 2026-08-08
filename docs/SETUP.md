# GlassMind — Setup Guide

## Prerequisites

| Tool | Version | Purpose |
|------|---------|---------|
| Node.js | ≥ 20.x | Frontend runtime |
| npm | ≥ 10.x | Package management |
| Python | ≥ 3.12 | Backend runtime |
| Docker | ≥ 24.x | Containerization |
| Docker Compose | ≥ 2.x | Multi-container orchestration |
| Git | ≥ 2.x | Version control |

## Quick Setup

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/glassmind.git
cd glassmind
```

### 2. Environment Variables

```bash
# Root level
cp .env.example .env

# Backend
cp backend/.env.example backend/.env
```

Edit the `.env` files and fill in your actual values (API keys, database credentials, etc.).

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env.local` file:
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_NAME=GlassMind
```

### 4. Backend Setup

```bash
cd backend
python -m venv .venv

# Linux/macOS
source .venv/bin/activate

# Windows
.venv\Scripts\activate

pip install -r requirements.txt
```

### 5. Database Setup

Start PostgreSQL, Redis, and Qdrant (via Docker):

```bash
docker compose up -d postgres redis qdrant
```

Run migrations:
```bash
cd backend
alembic upgrade head
```

### 6. Start Development Servers

**Frontend** (Terminal 1):
```bash
cd frontend
npm run dev
```

**Backend** (Terminal 2):
```bash
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 7. Docker (Full Stack)

To run everything in Docker:

```bash
docker compose up -d
```

Access:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

## Troubleshooting

| Issue | Solution |
|-------|----------|
| `npm install` fails | Delete `node_modules/` and `package-lock.json`, then retry |
| Python imports fail | Ensure you're in the virtual environment and ran `pip install -r requirements.txt` |
| Database connection refused | Check that PostgreSQL is running on port 5432 |
| Port already in use | Kill the process using the port or change the port in `.env` |
