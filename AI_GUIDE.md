# 🧠 The Definitive Master Guide: MCP Brain Server

This is the comprehensive technical and operational manual for mastering your long-term memory server. It bridges the gap between raw database physics and conversational AI logic, evolving with you from a **Beginner** to an **Advanced Power-User**.

---

## 🚀 Phase 1: Bootstrapping Your Universe (Infrastructure)

Before you can save context, you need a place for it to live. The Brain Server uses a strict hierarchy: **User → Workspace → Project**.

### 🏢 Scenario: Creating Your First Workspace
If you only have a User ID, start here.
> **User Prompt:** *"Use my User ID `your-user-id` to create a new workspace called 'Main Development'. Let me know the new Workspace ID."*

### 🚀 Scenario: Creating Your First Project
Projects live inside workspaces and are the primary storage for your code.
> **User Prompt:** *"In workspace `your-workspace-id`, create a new project called 'My Application'. Set the repository URL to `https://github.com/user/repo`. Give me the **Project UUID** when you're done."*

### ⚡ Scenario: The "Total Setup" (One-Shot)
The fastest way to jumpstart a new environment.
> **User Prompt:** *"I'm starting fresh. 1. Create a workspace 'Client Alpha'. 2. Inside it, create a project 'Booking API'. 3. Give me the new Project UUID so I can pin it."*

---

## 📌 Phase 2: The Handshake (Activation & Settings)

Now that you have a **Project UUID**, you must teach your AI to use it flawlessly.

### Settings: The Global Rule
Paste this into your IDE's **Custom Instructions** or **Rules for AI**.
> **Master Rules for AI Memory:**
> - **Primary UUID:** `92106197-043b-4bcf-87fd-91937d50d2af`
> - **Categorization:** For structural changes, use `importance: "critical"` and `context_type: "arch_decision"`.
> - **Deduplication:** Before saving a new state, `search_context` for matches and use `update_context` to refine rather than duplicate.

### Session Activation: The "Pinning" Prompt
In every **new chat**, run this as your first message:
> **User Prompt:** *"I am working on Project UUID `your-project-uuid`. Pin this ID for all subsequent MCP tool calls. Search the brain for our latest `arch_decision` to sync your context now."*

---

## ⚡ Phase 3: The "Day 1" Workflow (Starting Features)

Once setup is complete, here is how you move from a blank screen to a productive session.

### Step 1: Initialize the Tech Stack
Set the ground rules so the AI doesn't hallucinate old technologies.
> **User Prompt:** *"Save our core tech stack as an `arch_decision` with `critical` importance. We are using Node 20, Next.js 14, and Prisma 6."*

### Step 2: Start a Feature with History
Never build in a vacuum. Check if the "Brain" already knows something.
> **User Prompt:** *"I'm about to build the 'Payment Gateway'. Search the brain for 'authentication' or 'billing' patterns in this workspace to see what we've done before."*

---

## 💾 Phase 4: High-Resolution Saving (Continuous Persistence)

The goal is **100% memory fidelity**. Do not wait for the end of the day; save after every "Unit of Work."

### 📝 TASK SAVE SUMMARY PROTOCOL
Every time you finish a function, fix a bug, or add a route, say:
> *"Generate a **📝 TASK SAVE SUMMARY** following the mandated **Files-Places-Why-What** format and save it to the brain."*

#### Mandated Output Format:
````markdown
---
### 📝 TASK SAVE SUMMARY
**Task:** [Task Description]
**Type:** [Feature / Bug Fix / Refactor]

**📂 Files Involved:**
- `src/services/auth.ts` (Example)

**📍 Specific Places:**
- `validateJWT` function, lines 45-60.

**🎯 The "Why":**
- Business Logic: Ensured tokens expire after 24 hours.

**💻 The "What":**
```typescript
// Implementation snippet here
```
---
````

---

## 🧬 Phase 5: The Science of the Brain (Retrieval Physics)

Understanding the "math" behind the search engine helps you prompt like a pro.

### The Hybrid Engine (RRF)
We use **Reciprocal Rank Fusion**. We search **Semantics (70%)** for meaning and **Keywords (30%)** for exact technical terms.

### The "0.6" Threshold
If your search query shares less than 60% similarity with a memory, you get **0 results**.
- **Amateur Search:** *"Where is the code?"* (Low similarity).
- **Pro Search:** *"Search for the JWT validation logic in the Auth middleware."* (High similarity).

---

## 🎭 Phase 6: Professional Scenario Masterclass

Master these strategies to maintain a clean "Knowledge Graph."

### 🐛 Scenario: The Deep-Dive Bug Fix
Include the "Place" and "Why" to prevent the bug from ever returning.
> **User Prompt:** *"We fixed the JSON-RPC parse error. Save as `task`. **Files:** `server.ts`. **Place:** `try-catch block`. **Why:** Inputs weren't being trimmed. **What:** Added `.trim()` to the schema."*

### 🔎 Scenario: Synthesis & Review (Overall)
> **User Prompt:** *"I need a total overview of our Caching system. Search the brain for all `arch_decision` and `task` entries related to 'Redis'. Summarize how they fit together."*

### 🔗 Scenario: Building the Knowledge Graph
Use `linked_context_ids` to connect code to decisions.
> **User Prompt:** *"I just finished the Redis service. Find the ID of our 'Caching Architecture' decision and save this new code as a `code_snippet` linked to it."*

---

## 🚀 Advanced Pro Strategies for Context Management

These are the "Black Belt" tactics used by senior developers to ensure their AI assistants never lose focus across 1,000+ code changes.

### 🚩 Pro Strategy 1: The "Pre-Change" Snapshot
Before performing a destructive refactor or major migration, save a "frozen" version of the current logic.
- **Why:** If the AI hallucinates during the refactor, it can use the "Pre-Change" record as the truth to roll back logic mentally.
> **Prompt:** *"We are about to refactor the `PaymentHandler.ts`. Save a `task` called 'SNAPSHOT: Stable Payment Logic [v1.0]'. Summarize exactly how it works now so we have a reference for later."*

### 🧠 Pro Strategy 2: Capturing "Rejected Alternatives"
A senior developer saves not just what *was* built, but what *was not*.
- **Why:** This prevents the AI from suggesting the same failed approach two weeks later.
> **Prompt:** *"We decided NOT to use `bullmq` for this task because our Redis instance is too small. Save this in our `arch_decision` for 'Job Queue'. Note that BullMQ was rejected for memory limitations."*

### 🏷️ Pro Strategy 3: Semantic Tagging (#labels)
Use consistent hashtag labels in your descriptions and titles for instant filtering.
- **Why:** It allows you to search for `#perf` or `#security` across all task types.
> **Prompt:** *"Save this fix for the memory leak. Add the tag `#perf` and `#memory` to the metadata and title so we can track all performance fixes later."*

### 📉 Pro Strategy 4: Layered Granularity (Macro -> Micro)
Never save a massive file as one context. Layer it.
1.  **Macro (Arch):** Save the overall design of the module.
2.  **Micro (Snippet):** Link individual complex functions to the Macro decision.
> **Prompt:** *"Search the brain for the ID of our 'Data Isolation Strategy'. Now, save this `fetchUserScopedData` function as a `code_snippet` and link it to that strategy as a concrete implementation."*

---

## 🔄 The Memory Lifecycle: Updating & Deleting Like a Pro

To maintain a "High-Resolution" brain, you must actively prune and evolve your memories instead of just piling them up.

### 📝 Scenario: The "Living Task" (Incremental Update)
Keep one single task entry updated for a complex feature to avoid "context debt" (duplicates).
- **Pro Tip:** Find the existing `task` ID first.
> **User Prompt:** *"Search the brain for the 'Auth Module' task. Find its ID. Now, use `update_context` to refresh the status to 'In Progress' and add that we've finished the JWT implementation to the `raw_content`."*

### 🏛️ Scenario: The "Architecture Pivot" (Foundation Update)
When a core decision changes (e.g., REST -> GraphQL), update the foundation record.
> **User Prompt:** *"Our database strategy has changed. Search for the `arch_decision` titled 'DB Strategy'. Use its ID to update the title to 'DB Strategy: NoSQL' and replace the content to reflect our move to MongoDB."*

### 🗑️ Scenario: The "Clean House" (Targeted Deletion)
Remove hallucinated or outdated records that are causing the AI to give wrong answers.
- **Pro Tip:** Be surgical. Use `delete_context` with the specific ID.
> **User Prompt:** *"I found three duplicate entries for 'Prisma Schema' from last month causing confusion. Find their IDs. Now, permanently delete the two oldest ones so only the current version remains."*

### 📦 Scenario: The "Soft Deprecation" (Strategic Renaming)
Instead of deleting, keep the historical "Why" but tell the AI not to use it anymore.
> **User Prompt:** *"Search for the 'Legacy Stripe Helper'. Update its title to '[DEPRECATED] - Legacy Stripe Helper' and add a note to the top: 'Do not use. See new Braintree service instead.'."*

---

## 🚀 Phase 7: The Continuity Protocol (Handovers)

Use this when switching machines (Laptop -> Desktop) or when an AI agent hits its token limit.

### 📤 Step A: Snapshot (The Exit)
> **User Prompt:** *"I'm moving to another platform. Capture our state: List modified files, summarize uncompleted work, and save a `task` titled 'Handover Checkpoint [Feature Name]' with `high` importance."*

### 📥 Step B: Hydrate (The Entry)
In the new session:
> **User Prompt:** *"Load our memory. `search_context` for 'Handover Checkpoint' sorted by `recency`. Read the newest entry and resume exactly where the last agent left off."*

---

## 🕵️ Phase 8: Troubleshooting & Optimization

| Symptom | The Pro Fix |
| :--- | :--- |
| **"No results found"** | Query was too vague. Add technical keywords, file names, or specific error codes. |
| **"AI is using old info"** | Duplicate contexts exist. Search by title, find the IDs, and `delete_context` the outdated ones. |
| **"AI is being lazy"** | The AI is guessing from file names. Command it: *"Force a `search_context` call for [Feature Name] now."* |
| **"Tool call failed"** | Local server is down. Run `pnpm run build` and restart your IDE. |
