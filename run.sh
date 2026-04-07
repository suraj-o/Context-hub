#!/usr/bin/env bash
set -euo pipefail

# ──────────────────────────────────────────────
# MCP Brain Server — Single-Command Bootstrap
# Usage: chmod +x run.sh && ./run.sh
# ──────────────────────────────────────────────

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

log()  { echo -e "${CYAN}[MCP-BRAIN]${NC} $1"; }
warn() { echo -e "${YELLOW}[MCP-BRAIN]${NC} $1"; }
ok()   { echo -e "${GREEN}[MCP-BRAIN]${NC} $1"; }

# ── Step 1: Create .env if missing ──
if [ ! -f .env ]; then
  log "Creating .env from .env.example..."
  cp .env.example .env
  warn "⚠  Please edit .env with your OPENAI_API_KEY before using the server."
fi

# Source env vars
set -a
source .env
set +a

# ── Step 2: Install dependencies ──
log "Installing npm dependencies..."
npm install --silent

# ── Step 3: Start PostgreSQL via Docker ──
log "Starting PostgreSQL (pgvector/pgvector:pg16)..."
docker compose up -d --wait

# ── Step 4: Wait for PostgreSQL readiness ──
log "Waiting for PostgreSQL to be ready..."
RETRIES=30
until docker exec mcp-brain-db pg_isready -U mcp_user -d mcp_brain > /dev/null 2>&1; do
  RETRIES=$((RETRIES - 1))
  if [ $RETRIES -le 0 ]; then
    echo "❌ PostgreSQL failed to start. Check docker logs."
    exit 1
  fi
  sleep 1
done
ok "PostgreSQL is ready."

# ── Step 5: Run Prisma migrations & generate client ──
log "Running Prisma migrations..."
npx prisma migrate deploy

log "Generating Prisma client..."
npx prisma generate

# ── Step 6: Start the MCP server in dev mode ──
ok "🚀 Starting MCP Brain Server..."
npm run dev:watch
