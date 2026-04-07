# 🤖 The Ultimate AI Prompting & Memory Management Guide

Welcome to the deep-dive guide for managing your MCP Brain Server context. 
If you are developing a product using an AI Assistant integrated with this MCP Server, your productivity hinges on how effectively you instruct the AI to store, update, and search for knowledge. 

A vague prompt gives vague context. A highly specific prompt creates a perfectly sculpted, immortal architectural memory.

---

## 🎯 1. The "Rules for AI" Cheat Sheet

Before you do anything else, you can eliminate 90% of your frustration by copy-pasting the following rules into your IDE's global "Rules for AI" (or "Custom Instructions" / "System Prompt"). 

This guarantees the AI automatically knows *how* to use the underlying tools without you needing to micromanage it:

> **MCP Brain Server Rules:**
> 1. **Identity:** I have an active MCP Server attached. My Project UUID is `92106197-043b-4bcf-87fd-91937d50d2af`. NEVER perform an MCP operation without using this UUID.
> 2. **Structural Memory:** When creating new architecture, frameworks, or fundamental features, ALWAYS save the context using `importance: "critical"` and `context_type: "arch_decision"`. This ensures these files get a 2x persistence multiplier when searched later.
> 3. **Time Sensitivity:** If I ask you for "recent changes" or "what we did last", ALWAYS pass `sort_by: "recency"` in your `search_context` tool.
> 4. **No Duplication:** NEVER save duplicate entries for the same shifting feature. If a feature evolves, use `search_context` to find its exact `id`, then use `update_context` to modify the existing document.

---

## 💾 2. Saving Context (Dictating Importance & Type)

When you simply tell the AI, *"save this,"* the AI makes assumptions. It will likely default to assigning an `importance` of "medium" and a `context_type` of "note." If the data is actually a foundational architectural decision, it may get buried by future irrelevant notes.

**The Golden Rule:** Explicitly dictate the **Importance** (`critical`, `high`, `medium`, `low`) and the **Context Type** (`arch_decision`, `code_snippet`, `task`, `conversation`, `note`).

### ❌ Bad Prompting
> *"Save what we just did to the MCP brain."*
**(Why it fails:** The AI will generate vague summary text, tag it as a generic "note", and assign standard importance.)

### ✅ Good Prompting
> *"Save this new multi-tenant database logic to the MCP brain as a **code_snippet**. Mark it as **high importance** so we don't lose it, and add tags for `prisma` and `multi-tenant`."*

> *"Save our decision to migrate to Redis as an **arch_decision**. Mark it as **critical importance**. Include exactly why we moved away from MongoDB in the raw content."*

**Deep Dive:** In our server backend, `critical` importance (score: 100) mathematically multiplies the search confidence by `2.0x`. A generic "medium" note (score: 50) multipies by `1.0x`. By explicitly calling out "critical importance", you are forcing the math to ensure you never lose that memory.

---

## 🔍 3. Retrieval Strategy (Keyword Matching vs. Recency)

Our MCP Server operates on a **Hybrid Search Engine** using Reciprocal Rank Fusion (RRF) targeting a 0.6 minimum cosine similarity threshold. A 70% weight is applied to semantic vector matches, and 30% to rigid keyword matching. 

Because of this threshold, extremely vague conversational queries (like *"What was earlier?"*) fail drastically because they have no semantic relationship to actual code.

**The Golden Rule:** Give the AI specific keywords, and proactively instruct it on *how* to map the sort filters.

### ❌ Bad Prompting
> *"Tell me what we did last."* 
**(Why it fails:** The AI sends the literal phrase "Tell me what we did last" to the embedding engine. The cosine similarity to your source code drops below 0.6 and it returns an empty array.)

### ✅ Good Prompting
> *"Search the MCP brain for the `manage_workspace` feature. Once found, explain the setup back to me."*

### ✅ Contextual Modifiers
> *"Search the MCP brain for 'Redis Cache Implementation'. Critically, force the tool to **sort by recency** so I only see the newest implementation, disregarding the legacy setups we did 6 months ago."*

---

## 🔄 4. The Updating Strategy (Preventing Context Duplication)

The most common trap developers fall into is Context Duplication. 

If you migrate from Node.js `v18` to Node.js `v20`, and you tell the AI *"Save to the brain that we use Node v20,"* the AI will happily oblige. 
Three months later when you ask what Node version you use, the AI searches the database, finds **two completely contrasting notes** ("We use v18" and "We use v20") and hallucinates a conflicting answer.

**The Golden Rule:** If it describes an evolving state or architecture, force the AI to `update_context`.

### ❌ Bad Prompting
> *"We changed the CSS framework from Tailwind to Vanilla CSS. Save this to the brain."* 
**(Why it fails:** The old Tailwind document still exists alongside the new Vanilla CSS document.)

### ✅ Good Prompting
> *"Search the MCP brain for our existing 'Frontend Tech Stack' document. Find its UUID. Once you have it, use the `update_context` tool to overwrite the content safely, removing Tailwind and adding Vanilla CSS. Do **not** create a new entry."*

**Deep Dive:** By doing this, the server invokes the `updateContext` backend service. It automatically cleans the new text, recalculates the hashes, embeds the new vectors in OpenAI, deletes the old chunks, and cleanly saves the updated vector arrays entirely in the background.

---

## 🚀 5. Advanced Autonomous Workflow Commands

You can chain MCP commands in a single prompt to let the AI do heavy lifting while you take a break:

**The Autonomous Refactoring Request:**
> *"Search our MCP Brain for the 'Authentication Flow' architectural decision. Read how we handled interceptors. Then, search the brain for any `code_snippets` related to 'Zustand Auth Store'. Combine those two pieces of context, analyze if our current open file matches those patterns. If it deviates, refactor the open file, and then finally use `update_context` to log the timestamp of this refactor into the original architecture document."* 
