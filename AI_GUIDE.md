# 🤖 AI Prompting Guide for MCP Brain Server

Because your MCP Brain strictly isolates data by **Project UUID**, the AI needs to know which project to act on. 

The most effective way to use this setup is to "pin" your Project UUID into your IDE's system prompts so that you don't have to keep repeating yourself during natural conversations.

## 1. Configure the "Rules for AI"

Add a variation of the following text to your Cursor/Cline "Rules for AI", Custom Instructions, or System Prompts:

> "You have access to my MCP Brain Memory Server. My Project UUID is `92106197-043b-4bcf-87fd-91937d50d2af`. Always prioritize storing and searching for context using this ID so that architectural decisions and vital code are remembered across sessions."

*(Make sure to replace the UUID above with your actual Project UUID if it differs. You can get yours by running `npx tsx scripts/seed.ts`).*

---

## 2. Example Chat Prompts

Once configured, the AI will automatically handle the underlying `mcp_brain_search` and `mcp_brain_save` tool payloads behind the scenes. 
You can interact with the AI exactly like a normal conversation. Here are some powerful examples of how to query your local brain instance:

### 💾 Saving Important Decisions
If the AI solves a difficult bug or writes a great system design, explicitly tell it to save it:
> *"We just figured out how to fix the historical balance recalculation. Please save this architecture decision and the related code snippet to the MCP brain so we remember it for next time."*

### 🔍 Recalling Context Across Projects
If you know something was documented previously, ask the AI to retrieve it before tackling a new problem:
> *"I need to build an authentication flow. Search the MCP brain for how we did the JWT interceptors in the modular booking frontend last month, and use that same pattern here."*

### 🐛 Analyzing Logs or Errors
Save hard-to-figure-out error logs so the AI can debug itself faster in the future:
> *"I'm getting a Prisma unique constraint error on the User table. Have we solved this before? Search the brain for 'PrismaClientKnownRequestError P2002'."*

### 🔄 Updating Outdated Info
If architectural parameters change, tell the AI to use the `update_context` tool instead of saving a duplicate:
> *"Our tech stack changed from Node 18 to Node 20. Update the tech stack context entry in the MCP brain to reflect this."*

---

## What Happens Behind the Scenes?

When you ask those queries, the AI will autonomously:
1. Parse your request.
2. Select the correct tool (`save_context`, `search_context`, `update_context`).
3. Inject the `project_id` from its system prompt.
4. Auto-generate semantic tags.
5. Store or summarize the data accurately for the duration of the project.
