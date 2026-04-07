# 🧠 The Ultra-Deep Dive Guide to MCP Brain Server

This is the definitive technical and operational manual for mastering your long-term memory server. It bridges the gap between raw database physics and conversational AI logic.

---

## 🛠 1. The Power-User Setup

To ensure your AI agent operates at maximum efficiency, the **Project UUID** must be prioritized.

> **Master Rules for AI:**
> - **Primary UUID:** `92106197-043b-4bcf-87fd-91937d50d2af`
> - **Architecture First:** For structural changes, use `importance: "critical"` and `context_type: "arch_decision"`.
> - **Deduplication:** Before saving, `search_context` for existing title matches. If it exists, use `update_context` to refine the record instead of creating a duplicate.
> - **Recency Bias:** When I ask what we did "last", "recently", or "before", always set `sort_by: "recency"` in your search tool.

---

## 🧬 2. The Science of Memory: How Retrieval Actually Works

Understanding the "physics" of the search engine allows you to prompt more effectively.

### The Hybrid Engine (RRF)
Our server uses **Reciprocal Rank Fusion (RRF)**. It fires two independent searches simultaneously:
1. **Semantic Search (70% weight):** Uses `pgvector` and OpenAI embeddings. It looks for "meaning" and "intent." 
2. **Keyword Search (30% weight):** Uses PostgreSQL `tsvector` and `GIN` indexes. It looks for exact terminology (e.g., specific function names or error codes).

### The "0.6" Similarity Threshold
We enforce a strict **0.6 match threshold**. If an AI's search query shares less than 60% mathematical similarity with your saved context, the server returns **0 results**.
*   **Bad Prompt:** *"Check my files."* (0% similarity to code).
*   **Good Prompt:** *"Search the brain for the multi-tenant Prisma schema and vector storage logic."* (High similarity).

### Importance Multipliers
- `medium` (50 score) = **1.0x** (Standard)
- `critical` (100 score) = **2.0x** (A critical document will rank #1 even if its similarity is lower than a medium document).

---

## 🏗 3. Advanced Categorization

Use the right tool for the right job to keep your database organized.

| Context Type | Purpose | Strategy |
| :--- | :--- | :--- |
| **`arch_decision`** | "The Why" - Patterns, frameworks, DB schema. | Save with `critical` importance. |
| **`code_snippet`** | "The How" - Function logic, API endpoints, utilities. | Save with `high` importance. |
| **`task`** | progress tracking, WIP states, TODOs. | Use `update_context` daily on a single task doc. |
| **`conversation`** | Brainstorming sessions and meeting notes. | Save at `medium` importance. |

### 🔗 Context Linking (Graph Building)
Our server supports a "Graph" of memories through `linked_context_ids`. 
**Strategy:** When saving a code snippet, find the ID of the architectural decision it implements and pass it to the `linked_context_ids` array. This allows the AI to traverse relationships: *"I found the code, and here is the architectural reasoning linked to it."*

---

## 🔄 4. The Checkpoint Protocol (Cross-Platform Handover)

Use this protocol when switching between Cursor, Claude Desktop, or after a context window reset.

### 📤 Step A: The "Snapshot" Prompt (The Exit)
Before finishing a session, tell the AI:
> *"We are ending this session. Execute a **Snapshot Task**:
> 1. List every open file and its current state.
> 2. Summarize the last 3 critical logic changes.
> 3. List the next 5 specific code steps to perform.
> 4. Save this as a `task` type with `high` importance titled 'Checkpoint: [Feature Name] - [Date]'."*

### 📥 Step B: The "Hydrate" Prompt (The Entry)
In the fresh session, tell the AI:
> *"Load our memory. `search_context` for 'Checkpoint' sorted by `recency`. Read the newest entry. Use that state to update your local `task.md` and tell me which file you are starting on."*

---

## 🛠 5. Troubleshooting "AI Laziness"

AI Assistants often try to "guess" based on local file names instead of checking the long-term memory. 

### Symptom: "The search returned no results"
**Cause:** The AI used a vague phrase (like "last tool") as the search query.
**Fix:** Force the AI to be specific: *"Use `search_context` with the keyword 'Workspace Service' and `sort_by: "recency"`."*

### Symptom: "I don't see any tools"
**Cause:** The MCP server failed to boot or environment variables are missing.
**Fix:** Run `pnpm run build` and restart your IDE. Ensure the `--env-file` path in `mcp.json` is absolute and correct.

### Symptom: "The AI is hallucinating old info"
**Cause:** You have duplicate context entries for the same feature.
**Fix:** Use `manage_workspace` to list, find the IDs, and then use `delete_context` on the outdated duplicates. 🚀
