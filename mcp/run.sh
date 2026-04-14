#!/usr/bin/env bash
set -euo pipefail

# ──────────────────────────────────────────────
# MCP Brain Server — Single-Command Bootstrap
# Usage: chmod +x run.sh && ./run.sh
# ──────────────────────────────────────────────

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

log()  { echo -e "${CYAN}[MCP-BRAIN]${NC} $1"; }
warn() { echo -e "${YELLOW}[MCP-BRAIN]${NC} $1"; }
ok()   { echo -e "${GREEN}[MCP-BRAIN]${NC} $1"; }

# ── Step 1: Create .env if missing ──
if [ ! -f .env ]; then
  log "Creating .env from .env.example..."
  cp .env.example .env
  warn "⚠  Please edit .env with your OPENAI_API_KEY before using the server."
fi

set -a
source .env
set +a

# # ── Step 2: Install dependencies ──
# log "Installing npm dependencies..."
# npm install --silent

# # ── Step 3: Start Docker services ──
# log "Starting PostgreSQL + Redis..."
# docker compose up -d --wait

# ── Step 4: Wait for PostgreSQL ──
log "Waiting for PostgreSQL..."
RETRIES=30
until docker exec mcp-brain-db pg_isready -U mcp_user -d mcp_brain > /dev/null 2>&1; do
  RETRIES=$((RETRIES - 1))
  if [ $RETRIES -le 0 ]; then
    echo "❌ PostgreSQL failed to start."
    exit 1
  fi
  sleep 1
done
ok "PostgreSQL is ready."

# ── Step 5: Wait for Redis ──
log "Waiting for Redis..."
RETRIES=15
until docker exec mcp-brain-redis redis-cli ping > /dev/null 2>&1; do
  RETRIES=$((RETRIES - 1))
  if [ $RETRIES -le 0 ]; then
    echo "❌ Redis failed to start."
    exit 1
  fi
  sleep 1
done
ok "Redis is ready."

# # ── Step 6: Prisma migrate & generate ──
# log "Running Prisma migrations..."
# npx prisma migrate deploy

# log "Generating Prisma client..."
# npx prisma generate

# ── Step 7: Start the MCP server ──
ok "🚀 Starting MCP Brain Server..."
npm run dev:watch
