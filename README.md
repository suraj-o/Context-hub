# 🧠 MCP Brain Server v2.0

An Enterprise-Grade, Centralized Long-Term Memory Server for AI IDEs (Cursor, VS Code, Claude Desktop, Antigravity) built with the Model Context Protocol (MCP).

This server provides autonomous, semantic persistence via PostgreSQL + `pgvector`, Redis caching, and a robust data processing pipeline to keep your AI agents continuously aware of your design decisions, codebase architecture, and historical context across multiple projects.

---

## 🌟 Key Features

- **Multi-Tenant Architecture:** Strict data isolation through a Users → Workspaces → Projects hierarchy.
- **Hybrid Search Engine:** Combines PostgreSQL full-text search (keyword) and pgvector cosine similarity (semantic) using Reciprocal Rank Fusion (70/30 weighting).
- **Intelligent Processing Pipeline:** Automatically cleans whitespace, filters conversational noise, and chunks large content with overlapping boundaries before embedding.
- **Ranking Boosts:** Sorts search results with multipliers based on recency, importance, and historical access frequency.
- **Fully Local Protocol:** Communicates locally and securely over standard I/O (stdio transport). No external port exposure required.
- **Auto-Sync Watcher:** Includes a configurable file watcher (`chokidar`) to automatically index `.ts`, `.js`, `.py`, `.go`, and `.rs` changes in the background.

---

## 🛠 Tech Stack

- **Runtime:** Node.js 20+ & TypeScript 5.x
- **Protocol:** `@modelcontextprotocol/sdk`
- **Database:** PostgreSQL 16 + `pgvector`
- **ORM:** Prisma 6.x
- **Cache:** Redis 7 (`ioredis`)
- **Embeddings:** OpenAI `text-embedding-3-small` (1536 dims)
- **Testing:** Vitest

---

## 🔧 Installation & Setup

### 1. Prerequisites
- Docker & Docker Compose
- Node.js (v20+)
- `pnpm` (or `npm`)

### 2. Quickstart
Clone the repository, configure your environment, and spin up the database and Redis containers.

```bash
# 1. Install dependencies
pnpm install

# 2. Setup your environment
cp .env.example .env
# Important: Open .env and add your actual OPENAI_API_KEY
```

### 3. Build & Bootstrap
We've included a handy script to automatically start docker, wait for database readiness, and start the development server.

```bash
# Make the script executable
chmod +x run.sh

# Run the bootstrap script
./run.sh
```

If you prefer to run the steps manually:
```bash
docker compose up -d
pnpm run db:migrate
pnpm run db:generate
pnpm run build
```

---

## 🏗 Seeding & First-Time Use

Because the MCP server uses strict multi-tenant isolation, every piece of context belongs to a **Project UUID**. You must seed the database on your first run.

```bash
npx tsx scripts/seed.ts
```
This will create a default User, Workspace, and Project. **Copy the outputted Project UUID**, you will need it for your IDE.

*(Optional View)* To manually inspect your database and rows, run Prisma Studio:
```bash
pnpm dlx prisma studio --url "postgresql://mcp_user:mcp_password@localhost:5432/mcp_brain?schema=public"
```

---

## 🔌 Connecting to your AI IDE

This server connects to standard AI IDEs via the `stdio` transport layer. To avoid placing your API keys directly into IDE config files, we use Node's `--env-file` approach.

Add the following to your IDE's MCP Configuration:

**Cursor** (`~/.cursor/mcp.json`), **Claude Desktop** (`~/.config/claude/claude_desktop_config.json`), or **VS Code/Cline** (`.vscode/mcp.json`):

```json
{
  "mcpServers": {
    "mcp-brain": {
      "command": "node",
      "args": [
        "--env-file=/absolute/path/to/ai-context-shared-mcp/.env",
        "/absolute/path/to/ai-context-shared-mcp/dist/index.js"
      ]
    }
  }
}
```
*Note: Replace `/absolute/path/to/...` with your actual system path to this repository.*

---

## 💡 How to Interact with the AI

Your AI agent now has access to **6 Tools**:
1. `save_context`: Save code, architecture, or notes.
2. `search_context`: Hybrid search via natural language.
3. `get_context`: Retrieve context ID and bump access stats.
4. `update_context`: Modify specific fields or content.
5. `delete_context`: Soft/hard delete.
6. `manage_project`: CRUD for workspaces/projects.

### Prompt Best Practices
To ensure the AI always uses the right database partition flawlessly, paste your **Project UUID** in your IDE's custom instructions or "Rules for AI" settings:

> *"You have access to my MCP Brain Memory Server. My Project UUID is `your-project-uuid-here`. Always use this ID when searching or saving context."*

### Example Chat Commands
- **Store Memory:** *"We decided to use Redis for rate limiting instead of Mongo. Save this architectural decision in the MCP brain so we have it for later."*
- **Recall Memory:** *"I need to build a new payment module. Search the MCP brain for how we structured the Stripe webhooks last month."*
- **Update Memory:** *"Search the brain for our Node.js version. It says v18, please update that context entry to reflect that we are now using Node v20."*

---

## 🧪 Testing

The codebase maintains strict typing and validation. You can verify system integrity at any time:

```bash
# Type check without emitting
npx tsc --noEmit

# Run unit tests
pnpm test
```
