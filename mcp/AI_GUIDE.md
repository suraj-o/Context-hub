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

---

## 📚 Phase 9: The Master Scenario Bank (40 Pro Examples)

### 💾 10 Scenarios for SAVING Context
1.  **Bug Fix:** *"Save the fix for the 404 router error in `App.js`. Use `high` importance."*
2.  **UI/UX:** *"Save the new Figma color tokens as an `arch_decision`. Tag it `#design-system`."*
3.  **Security:** *"Save the JWT expiration fix. Mark it `critical` importance and tag it `#security`."*
4.  **Meeting:** *"Summarize our discussion on the new API schema and save it as a `conversation`."*
5.  **Refactor:** *"I just refactored the `UserService`. Save a code snippet showing the new generic interface."*
6.  **Database:** *"Save the new Prisma migration logic. Link it to our 'Database Strategy' ID."*
7.  **Test:** *"Save the unit test boilerplate for our controllers as a `code_snippet`."*
8.  **WIP:** *"I'm halfway through the login page. Save my current progress as a `task` so we don't lose it."*
9.  **API:** *"Save the new endpoint spec for `/v1/orders`. Mark it as `high` importance."*
10. **Session Finish:** *"Execute a **📝 TASK SAVE SUMMARY** for everything we did in the last 2 hours."*

### 🔍 10 Scenarios for QUERYING Context
11. **Session Start:** *"Search for 'Handover Checkpoint' to see what we need to do next."*
12. **Technical Deep-Dive:** *"Search my brain for the exact logic of the `validateToken` function."*
13. **Fuzzy Meaning:** *"Search for anything related to how we handle user 'permissions' or 'roles'."*
14. **Error Debugging:** *"Search for the keyword 'ECONNREFUSED' to see how we fixed it last time."*
15. **Historical Review:** *"Search for all `arch_decision` entries from last month to see our tech stack evolution."*
16. **Pattern Retrieval:** *"Find our standard pattern for 'error handling in Express middleware'."*
17. **Dependency Check:** *"Search for all mentions of 'Redis' to see which modules depend on it."*
18. **ID Lookup:** *"Find the ID of our 'Deployment Guide' so I can update it."*
19. **Specific File:** *"Search for all tasks involving `auth.service.ts` sorted by recency."*
20. **Broad Discovery:** *"Search for everything related to the 'Client Alpha' project."*

### 🔄 10 Scenarios for UPDATING Context
21. **Feature Completion:** *"Find the ID of the 'Login Feature' task and update its status to 'DONE'."*
22. **Title Cleanup:** *"Update the title of context ID `uid-123` to be more descriptive."*
23. **Adding Metadata:** *"Update ID `uid-456` and add `{ "vulnerable": false }` to the metadata."*
24. **Content Refresh:** *"Our API changed. Update the 'API Spec' ID with the new endpoint list."*
25. **Importance Move:** *"This bug fix is more important than we thought. Update it to `critical` importance."*
26. **Tag Enrichment:** *"Update ID `uid-789` and add the tag `#urgent`."*
27. **Deprecation:** *"ID `uid-000` is old logic. Update the title to '[DEPRECATED]' and add a warning."*
28. **Linking:** *"Update this code snippet to link it to the new 'Auth Design' ID."*
29. **Mistake Correction:** *"I gave you wrong info. Update ID `uid-abc` with the corrected logic."*
30. **Status Sync:** *"Update our 'Progress Report' task with the 3 things we finished this afternoon."*

### 🗑️ 10 Scenarios for DELETING Context
31. **Duplicate Cleanup:** *"I accidentally saved the same note twice. Find the IDs and delete the duplicate."*
32. **Outdated Logic:** *"We no longer use the 'OldCheckout' service. Delete its context ID permanently."*
33. **Privacy Cleanse:** *"I accidentally saved an API key. Find that ID and delete it permanently now."*
34. **Hallucination Correction:** *"You hallucinated a 'PaymentWorker'. Delete those records to fix your memory."*
35. **Space Management:** *"Search for all `low` importance notes older than 6 months and delete them."*
36. **Mistaken Task:** *"Delete the 'Test Task' I just created; it was a mistake."*
37. **Experiment End:** *"We are not going with the 'Svelte' experiment. Delete all related `arch_decision` entries."*
38. **Filing Error:** *"I saved this to the wrong project. Delete it here so I can save it to the correct project."*
39. **Conflict Resolution:** *"This note conflicts with our new design. Find it and delete it."*
40. **Fresh Start:** *"Delete our 'WIP Landing Page' task; I'm starting from scratch."*

---

## ♾️ Phase 10: Full Context Hydration (Feeding the Full Brain)

Use this protocol when you start a mission-critical session and need the AI to be **"Omniscient"** about the project's history.

### 🐳 The "Full Feed" Prompt
> *"I'm starting a major refactor. Perform a **Full Context Hydration**:
> 1. `search_context` for the last 5 `arch_decision` entries and summarize them.
> 2. `search_context` for the last 5 `task` entries to see current progress.
> 3. List every file we've modified in the last 48 hours.
> Once done, tell me our 'Current Reality' and let's begin."*

---

## 🧼 Best Practices for Memory Hygiene

To keep your Brain Server fast and accurate as your project grows to 10,000+ memories:

1.  **The Weekly Prune:** Once a week, ask the AI: *"List our 10 oldest `task` entries. Let me know which ones I should delete or update to 'DONE'."*
2.  **Keyword Precision:** Always use the unique technical name of your feature (e.g., `BraintreeHelper` vs. `PaymentFile`).
3.  **Title Discipline:** Ensure titles are descriptive. `Refactor` is bad; `Refactor: JWT Token Refresh Logic` is perfect.
4.  **Importance Scaling:** Use `low` for notes, `medium` for tasks, `high` for code, and `critical` for foundational architecture.
