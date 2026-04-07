import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { saveContext, getContext, updateContext, deleteContext } from "../services/write.service.js";
import { searchContext } from "../services/query.service.js";
import { manageProject } from "../services/project.service.js";
import { logger } from "../core/logger.js";
import type { ContextType, ImportanceLevel, SearchMode, SortBy } from "../domain/types.js";

// ── MCP Server Instance ────────────────────────────────────

export const server = new McpServer(
  {
    name: "mcp-brain-server",
    version: "2.0.0",
  },
  {
    capabilities: {
      logging: {},
    },
  }
);

// ── Helper ─────────────────────────────────────────────────

function toolResult(data: unknown, isError = false) {
  return {
    content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
    isError,
  };
}

function errorResult(error: unknown) {
  const message = error instanceof Error ? error.message : "Unknown error";
  logger.error("Tool error", error);
  return toolResult({ error: message }, true);
}

// ── Tool 1: save_context ───────────────────────────────────

server.tool(
  "save_context",
  "Save a context entry to long-term memory with automatic deduplication, " +
    "noise filtering, chunking, and semantic embedding. Supports code snippets, " +
    "architectural decisions, tasks, conversations, and notes.",
  {
    project_id: z.string().uuid().describe("Project UUID"),
    context_type: z
      .enum(["code_snippet", "arch_decision", "task", "conversation", "note"])
      .describe("Type of context being saved"),
    title: z.string().min(1).describe("Short descriptive title for the context"),
    raw_content: z.string().min(1).describe("The raw text content to process and save"),
    source_info: z
      .object({
        file_path: z.string().optional(),
        language: z.string().optional(),
        line_start: z.number().int().optional(),
        line_end: z.number().int().optional(),
      })
      .optional()
      .describe("Source file information for code snippets"),
    tags: z.array(z.string()).optional().describe("Tags for filtering and organization"),
    importance: z
      .enum(["low", "medium", "high", "critical"])
      .optional()
      .default("medium")
      .describe("Importance level (affects search ranking)"),
    metadata: z.record(z.unknown()).optional().describe("Additional metadata (JSON)"),
    linked_context_ids: z
      .array(z.string().uuid())
      .optional()
      .describe("UUIDs of related context entries to link"),
  },
  async (args) => {
    try {
      const result = await saveContext({
        projectId: args.project_id,
        contextType: args.context_type as ContextType,
        title: args.title,
        rawContent: args.raw_content,
        sourceInfo: args.source_info
          ? {
              filePath: args.source_info.file_path,
              language: args.source_info.language,
              lineStart: args.source_info.line_start,
              lineEnd: args.source_info.line_end,
            }
          : undefined,
        tags: args.tags,
        importance: args.importance as ImportanceLevel,
        metadata: args.metadata as Record<string, unknown>,
        linkedContextIds: args.linked_context_ids,
      });
      return toolResult(result);
    } catch (error) {
      return errorResult(error);
    }
  }
);

// ── Tool 2: search_context ─────────────────────────────────

server.tool(
  "search_context",
  "Search long-term memory using hybrid search (keyword + semantic + Reciprocal Rank Fusion). " +
    "Results are ranked by relevance, recency, importance, and access frequency.",
  {
    project_id: z.string().uuid().describe("Project to search within"),
    query: z.string().min(1).describe("Natural language search query"),
    context_types: z
      .array(z.enum(["code_snippet", "arch_decision", "task", "conversation", "note"]))
      .optional()
      .describe("Filter by context types"),
    tags: z.array(z.string()).optional().describe("Filter by tags"),
    limit: z.number().int().min(1).max(50).optional().default(20).describe("Max results (1–50)"),
    offset: z.number().int().min(0).optional().default(0).describe("Pagination offset"),
    search_mode: z
      .enum(["keyword", "semantic", "hybrid"])
      .optional()
      .default("hybrid")
      .describe("Search strategy"),
    sort_by: z
      .enum(["relevance", "recency", "importance"])
      .optional()
      .default("relevance")
      .describe("Sort order"),
  },
  async (args) => {
    try {
      const result = await searchContext({
        projectId: args.project_id,
        query: args.query,
        contextTypes: args.context_types as ContextType[],
        tags: args.tags,
        limit: args.limit,
        offset: args.offset,
        searchMode: args.search_mode as SearchMode,
        sortBy: args.sort_by as SortBy,
      });
      return toolResult(result);
    } catch (error) {
      return errorResult(error);
    }
  }
);

// ── Tool 3: get_context ────────────────────────────────────

server.tool(
  "get_context",
  "Retrieve a single context entry by its UUID. " +
    "Bumps access count and last-accessed timestamp for ranking.",
  {
    id: z.string().uuid().describe("Context entry UUID"),
    include_related: z
      .boolean()
      .optional()
      .default(false)
      .describe("Include linked/related context entries"),
  },
  async (args) => {
    try {
      const result = await getContext(args.id, args.include_related);
      return toolResult(result);
    } catch (error) {
      return errorResult(error);
    }
  }
);

// ── Tool 4: update_context ─────────────────────────────────

server.tool(
  "update_context",
  "Update an existing context entry. If content changes, " +
    "re-processes through the full pipeline (clean → chunk → re-embed).",
  {
    id: z.string().uuid().describe("Context entry UUID to update"),
    title: z.string().optional().describe("New title"),
    raw_content: z.string().optional().describe("New raw content (triggers re-embedding)"),
    importance: z
      .enum(["low", "medium", "high", "critical"])
      .optional()
      .describe("New importance level"),
    tags: z.array(z.string()).optional().describe("Replace all tags"),
    metadata: z.record(z.unknown()).optional().describe("Merge metadata"),
  },
  async (args) => {
    try {
      const result = await updateContext({
        id: args.id,
        title: args.title,
        rawContent: args.raw_content,
        importance: args.importance as ImportanceLevel,
        tags: args.tags,
        metadata: args.metadata as Record<string, unknown>,
      });
      return toolResult(result);
    } catch (error) {
      return errorResult(error);
    }
  }
);

// ── Tool 5: delete_context ─────────────────────────────────

server.tool(
  "delete_context",
  "Delete a context entry. Soft delete by default (recoverable); " +
    "set permanent=true for hard delete.",
  {
    id: z.string().uuid().describe("Context entry UUID to delete"),
    permanent: z
      .boolean()
      .optional()
      .default(false)
      .describe("Hard delete (irreversible) if true"),
  },
  async (args) => {
    try {
      const result = await deleteContext({
        id: args.id,
        permanent: args.permanent,
      });
      return toolResult(result);
    } catch (error) {
      return errorResult(error);
    }
  }
);

// ── Tool 6: manage_project ─────────────────────────────────

server.tool(
  "manage_project",
  "Create, update, list, or delete projects. " +
    "Projects provide data isolation within workspaces.",
  {
    action: z.enum(["create", "update", "list", "delete"]).describe("CRUD action"),
    project_id: z.string().uuid().optional().describe("Project UUID (for update/delete)"),
    workspace_id: z.string().uuid().optional().describe("Workspace UUID (for create/list)"),
    name: z.string().optional().describe("Project name (for create/update)"),
    repository_url: z.string().url().optional().describe("Git repository URL"),
  },
  async (args) => {
    try {
      const result = await manageProject({
        action: args.action,
        projectId: args.project_id,
        workspaceId: args.workspace_id,
        name: args.name,
        repositoryUrl: args.repository_url,
      });
      return toolResult(result);
    } catch (error) {
      return errorResult(error);
    }
  }
);
