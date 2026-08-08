# GlassMind — Project Setup Script (Windows PowerShell)
# Usage: .\scripts\setup.ps1

$ErrorActionPreference = "Stop"

$ProjectRoot = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)

Write-Host ""
Write-Host "╔══════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║     GlassMind — Project Setup        ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

function Log-Info { param([string]$Message); Write-Host "[INFO] $Message" -ForegroundColor Green }
function Log-Warn { param([string]$Message); Write-Host "[WARN] $Message" -ForegroundColor Yellow }
function Log-Error { param([string]$Message); Write-Host "[ERROR] $Message" -ForegroundColor Red }

# ---- Check Prerequisites ----
Log-Info "Checking prerequisites..."

try { $nodeVersion = node --version } catch { Log-Error "Node.js is required but not installed."; exit 1 }
try { $npmVersion = npm --version } catch { Log-Error "npm is required but not installed."; exit 1 }
try { $pythonVersion = python --version } catch { Log-Error "Python is required but not installed."; exit 1 }

Log-Info "Node.js: $nodeVersion"
Log-Info "Python: $pythonVersion"

# ---- Environment Variables ----
Log-Info "Setting up environment variables..."

if (-not (Test-Path "$ProjectRoot\.env")) {
    Copy-Item "$ProjectRoot\.env.example" "$ProjectRoot\.env"
    Log-Info "Created .env from .env.example"
} else {
    Log-Warn ".env already exists, skipping"
}

if (-not (Test-Path "$ProjectRoot\backend\.env")) {
    Copy-Item "$ProjectRoot\backend\.env.example" "$ProjectRoot\backend\.env"
    Log-Info "Created backend\.env from .env.example"
} else {
    Log-Warn "backend\.env already exists, skipping"
}

# ---- Frontend Setup ----
Log-Info "Setting up frontend..."

Push-Location "$ProjectRoot\frontend"
npm install
Log-Info "Frontend dependencies installed"

if (-not (Test-Path ".env.local")) {
    @"
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_NAME=GlassMind
"@ | Out-File -FilePath ".env.local" -Encoding utf8
    Log-Info "Created frontend\.env.local"
}
Pop-Location

# ---- Backend Setup ----
Log-Info "Setting up backend..."

Push-Location "$ProjectRoot\backend"

if (-not (Test-Path ".venv")) {
    python -m venv .venv
    Log-Info "Created Python virtual environment"
}

& ".venv\Scripts\Activate.ps1"
python -m pip install --upgrade pip
pip install -r requirements.txt
Log-Info "Backend dependencies installed"

Pop-Location

# ---- Done ----
Write-Host ""
Write-Host "╔══════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║        Setup Complete! 🚀            ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""
Log-Info "To start the frontend:  cd frontend; npm run dev"
Log-Info "To start the backend:   cd backend; .venv\Scripts\Activate.ps1; uvicorn app.main:app --reload"
Log-Info "To start with Docker:   docker compose up -d"
