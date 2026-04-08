# 🧠 The Definitive Master Guide: MCP Brain Server

This is the definitive technical and operational manual for mastering your long-term memory server. It bridges the gap between raw database physics and conversational AI logic.

---

## 🛠 1. Power-User Setup

To ensure your AI agent operates with perfect context, paste this into your IDE's **Custom Instructions** or **Rules for AI**.

> **Master Rules for AI Memory:**
> - **Primary UUID:** `92106197-043b-4bcf-87fd-91937d50d2af`
> - **Categorization:** For structural changes, use `importance: "critical"` and `context_type: "arch_decision"`.
> - **Deduplication:** Before saving a new state for a known feature, `search_context` for existing matches and use `update_context` to refine the record.
> - **Recency Focus:** When I ask about "recent" history, always set `sort_by: "recency"` in your search tool.

---

## 🧬 2. The Science of Memory: Retrieval Physics

### The Hybrid Engine (RRF)
Our server uses **Reciprocal Rank Fusion (RRF)**, blending **Semantic (70%)** and **Keyword (30%)** results.

### Accuracy Strategies: Overall vs. Specific
1.  **Overall Context (Broad Discovery):** Use general feature names and business logic terms.
    *   *Prompt:* *"Search the brain for everything related to 'Workspace Management architecture'."*
2.  **Specific Context (Technical Precision):** Use exact function names, file paths, or unique error codes.
    *   *Prompt:* *"Use `search_context` for the exact implementation of the `RRFCombine` function in `query.service.ts`."*

### The "0.6" Threshold
Queries sharing less than 60% similarity return **0 results**. If a search fails, add more specific technical keywords to raise the similarity score.

---

## 🔄 3. Continuous Workflow: High-Resolution Saving

**CRITICAL:** Every time you complete a distinct unit of work, immediately save it using the **Files-Places-Why-What** format.

### 📝 TASK SAVE SUMMARY TEMPLATE
> *"Generate a **📝 TASK SAVE SUMMARY** and save it. Mandate the following fields:"*

**Format:**
- **📂 Files Involved:** Which specific files were touched?
- **📍 Specific Places:** Which functions or line ranges were changed?
- **🎯 The "Why":** What was the business logic or bug we addressed?
- **💻 The "What":** Brief summary of the implementation code.
- **🔗 Connections:** Any IDs of related architectural decisions.

#### Recommended Output Format:
````markdown
---
### 📝 TASK SAVE SUMMARY
**Task:** [Task Name]
**Type:** [Feature / Bug Fix / Refactor]

**📄 Context & Objective:**
[Description of work]

**📂 Files Involved:**
- `path/to/file.ts`

**💻 Implementation:**
```typescript
// Implementation logic
```
---
````

---

## 🚀 4. The Continuity Protocol (Handover)

### 📤 Step A: Snapshot (The Exit)
Before ending a session or hitting token limits:
> *"Capture our state for a handover. List all modified files, summarize uncompleted work, and save a `task` context titled 'Handover Checkpoint [Date/Feature]' with `high` importance."*

### 📥 Step B: Hydrate (The Entry)
In the new session:
> *"Load our memory. `search_context` for 'Handover Checkpoint' sorted by `recency`. Read the newest entry and resume exactly as the previous agent instructed."*

---

## 🎭 5. Scenario Masterclass: High-Fidelity Interaction

### 🐛 Scenario: The Granular Bug Fix
Include the "Place" and the "Why" to prevent regression.
> **Prompt:** *"We fixed the JSON-RPC parse error. Save it as a `task`. Title: 'Bug Fix: Gateway Parse Error'. **Files:** `server.ts`. **Place:** `try-catch block in handler`. **Why:** String inputs were not being trimmed. **What:** added `.trim()` to the Zod schema."*

### 🔎 Scenario: Getting the "Big Picture" (Overall Retrieval)
> **Prompt:** *"I need a total feature overview of our caching system. Search the brain for all `arch_decision` and `task` entries related to 'Redis' and 'IORedis'. Summarize how they all fit together."*

### 🎯 Scenario: Deep-Dive Retrieval (Specific Detail)
> **Prompt:** *"I need the exact logic we used for the SHA-256 hashing last month. Search for the keyword `SHA-256` and `hash.service.ts` to find the specific code snippet."*

---

## 🛠 6. Troubleshooting for Humans

| Symptom | The Fix |
| :--- | :--- |
| **"No results found"** | Query too vague. Add specific file names or function names to the search. |
| **"AI is using old info"** | Duplicate contexts exist. Search by title, find IDs, and `delete_context` the old ones. |
| **"AI is being lazy"** | The AI is guessing from local names. Command: *"Force a `search_context` call now."* |
| **"Tool call failed"** | Local server is down. Run `pnpm run build` and restart your IDE. |

---

## 🏗 7. Autonomous Bootstrapping: Creating Your Environment

If you are starting from scratch and only have a **User ID**, you can command the AI to build your entire hierarchical infrastructure (Workspaces and Projects) autonomously.

### 🏢 Scenario: Creating a New Workspace
Use this when you want a new container for multiple related projects.
> **User Prompt:** *"Use my user ID `your-user-id` to create a new workspace called 'Enterprise Development'. After creating it, list all my workspaces to confirm."*

### 🚀 Scenario: Creating a New Project
Projects live inside workspaces. You need a `workspace_id` to create one.
> **User Prompt:** *"In workspace `your-workspace-id`, create a new project called 'MCP Brain Server'. Set the repository URL to `https://github.com/user/repo`. Tell me the new Project UUID when you are done."*

### ⚡ Scenario: The "Total Setup" (One-Shot)
The most efficient way to start a new engagement.
> **User Prompt:** *"I'm starting a new project. 
> 1. Use my user ID `your-user-id` to create a workspace called 'Client Alpha'. 
> 2. Inside that new workspace, create a project called 'Booking Engine'. 
> 3. Give me the new Project UUID so I can pin it in my settings."*

### 🔍 Scenario: Infrastructure Discovery
If you lost your IDs or want to see what is available.
> **User Prompt:** *"Use my user ID `your-user-id` to list all my workspaces. Then, for the 'Enterprise' workspace, list all projects. I need to find the correct UUID to start saving context."*
