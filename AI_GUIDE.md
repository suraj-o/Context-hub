# 🧠 The Definitive Master Guide: MCP Brain Server

This is the comprehensive manual for mastering your long-term memory server. It bridges the gap between raw database physics and conversational AI logic, ensuring your AI assistant operates at 100% fidelity.

---

## 🛠 1. The Power-User Setup

To ensure your AI agent operates with perfect context, you must perform a one-time setup in your IDE's **Custom Instructions** or **Rules for AI**.

> **Master Rules for AI Memory:**
> - **Primary UUID:** `92106197-043b-4bcf-87fd-91937d50d2af`
> - **Categorization:** For structural changes, use `importance: "critical"` and `context_type: "arch_decision"`.
> - **Deduplication:** Before saving a new state for a known feature, `search_context` for existing matches and use `update_context` to refine the record.
> - **Recency Focus:** When I ask about "recent" history, always set `sort_by: "recency"` in your search tool.

---

## 🧬 2. The Science of Memory: How Retrieval Works

### The Hybrid Engine (RRF)
Our server uses **Reciprocal Rank Fusion (RRF)**. It blends two search results:
1. **Semantic Search (70%):** Uses `pgvector` to find "meaning" and "intent." 
2. **Keyword Search (30%):** Uses `tsvector` for exact terms (e.g., function names).

### The "0.6" Similarity Threshold
We enforce a strict **0.6 match threshold**. If a query shares less than 60% similarity with your context, the server returns **0 results**.
*   **Avoid Generic Prompts:** *"Where is my code?"* (likely 0 results).
*   **Use Rich Keywords:** *"Search for the multi-tenant isolation logic in the Prisma schema."* (likely 100% result).

### Importance Multipliers
- `medium` (50 score) = **1.0x**
- `critical` (100 score) = **2.0x** (Ensures foundational rules stay at the top of the list).

---

## 🔄 3. Continuous Workflow: "The Unit of Work"

**CRITICAL:** We operate in a continuous session. Do not wait for the end of the day to save context.

### The "Save as You Go" Protocol
Every time you complete a distinct task (e.g., a bug fix or a new feature), immediately ask the AI to log it.

**Format for Every Completed Task:**
> *"Generate a **📝 TASK SAVE SUMMARY** and save it to the brain. Include the Context, Files Modified, and the Source Code implemented."*

**Example Log Output:**
```markdown
---
### 📝 TASK SAVE SUMMARY
**Task:** Fix JWT Interceptor Token Refresh
**Type:** Bug Fix

**📄 Context & Objective:**
Resolved an issue where the token was not being replaced in the header after a 401 error.

**📂 Files Modified:**
* `src/api/client.js`

**💻 Code Snippets:**
```javascript
// Resulting logic goes here
```
---
```

---

## 🚀 4. The Continuity Protocol (Cross-Platform Handover)

Use this protocol for token exhaustion, context resets, or machine handovers.

### 📤 Step A: The "Snapshot" Protocol (The Exit)
Before finishing a session, tell the AI:
> *"I'm moving to another platform. Capture our state:
> 1. List every open file and its current status.
> 2. Summarize the uncompleted work & the next 5 specific code steps.
> 3. Save a `task` context titled 'Handover Checkpoint [Date/Feature]' with `high` importance."*

### 📥 Step B: The "Hydrate" Protocol (The Entry)
In the new session, tell the AI:
> *"Load our memory. `search_context` for 'Handover Checkpoint' sorted by `recency`. Read our previous state and resume exactly where the last agent left off."*

---

## 🎭 5. Scenario Masterclass: How to Handle Complex Tasks

### 🐛 Scenario: Squashing a Persistent Bug
Don't just save the fix. Save the **reasoning**.
> **User Prompt:** *"We fixed the race condition in the cache service. Save this as a `task`. Title it 'Bug Fix: Cache Race Condition'. Use `high` importance. Detail why it happened and how we fixed it so it never recurs."*

### 🏗 Scenario: Implementing a New Pattern
When you set a new architectural rule.
> **User Prompt:** *"We are moving to a Repository Pattern for the DB layer. Save this as an `arch_decision` with `critical` importance. Document the base classes we created."*

### ♻️ Scenario: Refactoring Legacy Code
When you change existing logic.
> **User Prompt:** *"Search the brain for the old 'UserService' logic. Find its ID. Now, `update_context` that record to show the new refactored version. Do not create a duplicate."*

---

## 🛠 6. Troubleshooting for Humans

| Symptom | The Fix |
| :--- | :--- |
| **"No results found"** | Query was too vague. Add more technical keywords or specific filenames. |
| **"AI is using old info"** | Duplicate notes exist. List them, find the IDs, and `delete_context` the outdated ones. |
| **"AI is being lazy"** | The AI is trying to guess from local files. Command it: *"Force a `search_context` call for [Feature Name]."* |
| **"Tool calling failed"** | Local server is down. Run `pnpm run build` and restart your IDE. |
