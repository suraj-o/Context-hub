import { prisma } from "../repository/prisma.js";
import { generateEmbedding } from "../core/embeddings.js";

// ── Types ──────────────────────────────────────────────────

export interface SearchMemoryInput {
  projectId: string;
  query: string;
  limit?: number;
}

export interface SearchResult {
  content: string;
  metadata: Record<string, unknown>;
  type: string;
  similarity: number;
}

export interface SearchMemoryOutput {
  results: SearchResult[];
  query: string;
  totalResults: number;
}

// ── Service ────────────────────────────────────────────────

/**
 * Performs semantic search over stored contexts using pgvector cosine similarity.
 *
 * Flow:
 *  1. Generate an embedding for the search query text.
 *  2. Execute a cosine similarity search against the context_store table.
 *     The operator `<=>` computes cosine distance; `1 - distance = similarity`.
 *  3. Results are ordered by similarity (highest first) and capped at `limit`.
 *
 * @param input - Project ID, query text, and optional result limit
 * @returns Ranked list of context entries with similarity scores
 */
export async function searchMemory(
  input: SearchMemoryInput
): Promise<SearchMemoryOutput> {
  const limit = input.limit ?? 10;

  // ── Generate query embedding ──
  const embedding = await generateEmbedding(input.query);
  const embeddingStr = `[${embedding.join(",")}]`;

  // ── Cosine similarity search via pgvector ──
  const results = await prisma.$queryRaw<SearchResult[]>`
    SELECT
      content,
      metadata,
      type,
      1 - (embedding <=> ${embeddingStr}::vector) AS similarity
    FROM context_store
    WHERE project_id = ${input.projectId}
    ORDER BY embedding <=> ${embeddingStr}::vector
    LIMIT ${limit}
  `;

  return {
    results,
    query: input.query,
    totalResults: results.length,
  };
}
