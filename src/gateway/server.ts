import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { saveContext } from "../services/write.service.js";
import { searchMemory } from "../services/query.service.js";

// ── MCP Server Instance ────────────────────────────────────

export const server = new McpServer(
  {
    name: "mcp-brain-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      logging: {},
    },
  }
);

// ── Tool: save_context ─────────────────────────────────────

server.tool(
  "save_context",
  "Save a context entry (code snippet, architectural decision, task, or conversation) " +
    "to long-term memory with automatic deduplication and semantic embedding.",
  {
    projectId: z.string().describe("Unique project identifier"),
    type: z
      .enum(["code_snippet", "arch_decision", "task", "conversation"])
      .describe("Type of context being saved"),
    content: z.string().describe("The text content to store"),
    metadata: z
      .record(z.unknown())
      .optional()
      .describe("Optional key-value metadata (JSON object)"),
  },
  async ({ projectId, type, content, metadata }) => {
    try {
      const result = await saveContext({
        projectId,
        type,
        content,
        metadata: metadata as Record<string, unknown> | undefined,
      });

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown error";
      return {
        content: [
          {
            type: "text" as const,
            text: `Error saving context: ${message}`,
          },
        ],
        isError: true,
      };
    }
  }
);

// ── Tool: search_memory ────────────────────────────────────

server.tool(
  "search_memory",
  "Search long-term memory using semantic similarity. " +
    "Returns the most relevant stored contexts ranked by cosine similarity.",
  {
    projectId: z.string().describe("Project to search within"),
    query: z.string().describe("Natural language search query"),
    limit: z
      .number()
      .int()
      .min(1)
      .max(50)
      .optional()
      .default(10)
      .describe("Maximum number of results to return (1–50, default 10)"),
  },
  async ({ projectId, query, limit }) => {
    try {
      const result = await searchMemory({ projectId, query, limit });

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown error";
      return {
        content: [
          {
            type: "text" as const,
            text: `Error searching memory: ${message}`,
          },
        ],
        isError: true,
      };
    }
  }
);
