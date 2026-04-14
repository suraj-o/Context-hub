/**
 * Domain types — shared interfaces for the entire application.
 */

// ── Context Types ──────────────────────────────────────────

export type ContextType =
  | "code_snippet"
  | "arch_decision"
  | "task"
  | "conversation"
  | "note";

export type ImportanceLevel = "low" | "medium" | "high" | "critical";

export type SearchMode = "keyword" | "semantic" | "hybrid";

export type SortBy = "relevance" | "recency" | "importance";

// ── Save Context ───────────────────────────────────────────

export interface SaveContextInput {
  projectId: string;
  contextType: ContextType;
  title: string;
  rawContent: string;
  sourceInfo?: {
    filePath?: string;
    language?: string;
    lineStart?: number;
    lineEnd?: number;
  };
  tags?: string[];
  importance?: ImportanceLevel;
  metadata?: Record<string, unknown>;
  linkedContextIds?: string[];
}

export interface SaveContextResult {
  status: "saved" | "duplicate" | "filtered";
  id?: string;
  contentHash: string;
  chunksCreated?: number;
  reason?: string;
}

// ── Search Context ─────────────────────────────────────────

export interface SearchContextInput {
  projectId?: string;
  query: string;
  contextTypes?: ContextType[];
  tags?: string[];
  limit?: number;
  offset?: number;
  searchMode?: SearchMode;
  sortBy?: SortBy;
}

export interface SearchResult {
  id: string;
  title: string;
  content: string;
  contextType: ContextType;
  similarity: number;
  keywordScore?: number;
  finalScore: number;
  importanceScore: number;
  accessCount: number;
  lastAccessedAt: Date;
  createdAt: Date;
  metadata: Record<string, unknown>;
  tags: string[];
  snippet?: string;
}

export interface SearchContextOutput {
  results: SearchResult[];
  query: string;
  totalResults: number;
  searchMode: SearchMode;
}

// ── Get / Update / Delete ──────────────────────────────────

export interface GetContextInput {
  id: string;
  includeRelated?: boolean;
}

export interface UpdateContextInput {
  id: string;
  title?: string;
  rawContent?: string;
  importance?: ImportanceLevel;
  tags?: string[];
  metadata?: Record<string, unknown>;
}

export interface DeleteContextInput {
  id: string;
  permanent?: boolean;
}

// ── Project Management ─────────────────────────────────────

export interface CreateProjectInput {
  workspaceId: string;
  name: string;
  repositoryUrl?: string;
}

export interface ManageProjectInput {
  action: "create" | "update" | "list" | "delete";
  projectId?: string;
  workspaceId?: string;
  name?: string;
  repositoryUrl?: string;
}

// ── Workspace Management ───────────────────────────────────

export interface ManageWorkspaceInput {
  action: "create" | "update" | "list" | "delete";
  workspaceId?: string;
  userId?: string;
  name?: string;
}

// ── Importance Mapping ─────────────────────────────────────

export const IMPORTANCE_SCORES: Record<ImportanceLevel, number> = {
  low: 25,
  medium: 50,
  high: 75,
  critical: 100,
};
