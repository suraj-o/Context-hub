import { prisma } from "../repository/prisma.js";
import { generateEmbedding } from "../core/embeddings.js";
import { cacheGet, cacheSet } from "./cache.service.js";
import { logger } from "../core/logger.js";
import type {
  SearchContextInput,
  SearchContextOutput,
  SearchResult,
  SearchMode,
} from "../domain/types.js";

// ── Types ──────────────────────────────────────────────────

interface RawSemanticRow {
  id: string;
  title: string;
  processed_content: string;
  context_type: string;
  importance_score: number;
  access_count: number;
  last_accessed_at: Date;
  created_at: Date;
  metadata: Record<string, unknown>;
  semantic_score: number;
}

interface RawKeywordRow {
  id: string;
  title: string;
  processed_content: string;
  context_type: string;
  importance_score: number;
  access_count: number;
  last_accessed_at: Date;
  created_at: Date;
  metadata: Record<string, unknown>;
  keyword_score: number;
  snippet: string;
}

// ── Helpers ────────────────────────────────────────────────

function daysSince(date: Date): number {
  return (Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24);
}

/**
 * Apply ranking boosts based on recency, importance, and access frequency.
 *
 * Boost factors:
 *  - Recency: 1.3× if accessed in last 7 days, 1.1× if last 30 days
 *  - Importance: linear scale normalized to 1.0 at score=50
 *  - Frequency: logarithmic boost based on access_count
 */
function applyBoosts(results: SearchResult[]): SearchResult[] {
  return results
    .map((r) => {
      let boost = 1.0;

      // Recency boost
      const age = daysSince(r.lastAccessedAt);
      if (age < 7) boost *= 1.3;
      else if (age < 30) boost *= 1.1;

      // Importance boost (normalized: 50=1.0, 100=2.0, 25=0.5)
      boost *= r.importanceScore / 50;

      // Access frequency boost (logarithmic)
      boost *= Math.log10(r.accessCount + 1) + 1;

      return { ...r, finalScore: r.similarity * boost };
    })
    .sort((a, b) => b.finalScore - a.finalScore);
}

// ── Semantic Search ────────────────────────────────────────

/**
 * pgvector cosine similarity search.
 * Uses the `<=>` operator (cosine distance); similarity = 1 - distance.
 * Filters results below 0.6 similarity threshold.
 */
async function semanticSearch(
  queryEmbedding: number[],
  projectId: string,
  limit: number
): Promise<SearchResult[]> {
  const embeddingStr = `[${queryEmbedding.join(",")}]`;

  const rows = await prisma.$queryRaw<RawSemanticRow[]>`
    SELECT
      ce.id,
      ce.title,
      ce.processed_content,
      ce.context_type,
      ce.importance_score,
      ce.access_count,
      ce.last_accessed_at,
      ce.created_at,
      ce.metadata,
      1 - (emb.embedding <=> ${embeddingStr}::vector) AS semantic_score
    FROM context_entries ce
    JOIN context_embeddings emb ON ce.id = emb.context_entry_id
    WHERE ce.project_id = ${projectId}::uuid
      AND ce.deleted_at IS NULL
      AND 1 - (emb.embedding <=> ${embeddingStr}::vector) > 0.6
    ORDER BY emb.embedding <=> ${embeddingStr}::vector
    LIMIT ${limit}
  `;

  return rows.map((r: RawSemanticRow) => ({
    id: r.id,
    title: r.title,
    content: r.processed_content,
    contextType: r.context_type as SearchResult["contextType"],
    similarity: Number(r.semantic_score),
    finalScore: Number(r.semantic_score),
    importanceScore: r.importance_score,
    accessCount: r.access_count,
    lastAccessedAt: r.last_accessed_at,
    createdAt: r.created_at,
    metadata: r.metadata,
    tags: [],
  }));
}

// ── Keyword Search ─────────────────────────────────────────

/**
 * PostgreSQL full-text search using tsvector + websearch_to_tsquery.
 * Weights: title (A), processed_content (B).
 * Returns highlighted snippets via ts_headline.
 */
async function keywordSearch(
  query: string,
  projectId: string,
  limit: number
): Promise<SearchResult[]> {
  const rows = await prisma.$queryRaw<RawKeywordRow[]>`
    SELECT
      ce.id,
      ce.title,
      ce.processed_content,
      ce.context_type,
      ce.importance_score,
      ce.access_count,
      ce.last_accessed_at,
      ce.created_at,
      ce.metadata,
      ts_rank(search_vector, websearch_to_tsquery('english', ${query})) AS keyword_score,
      ts_headline('english', processed_content, websearch_to_tsquery('english', ${query}), 'MaxWords=50') AS snippet
    FROM context_entries ce
    WHERE search_vector @@ websearch_to_tsquery('english', ${query})
      AND ce.project_id = ${projectId}::uuid
      AND ce.deleted_at IS NULL
    ORDER BY keyword_score DESC
    LIMIT ${limit}
  `;

  return rows.map((r: RawKeywordRow) => ({
    id: r.id,
    title: r.title,
    content: r.processed_content,
    contextType: r.context_type as SearchResult["contextType"],
    similarity: Number(r.keyword_score),
    keywordScore: Number(r.keyword_score),
    finalScore: Number(r.keyword_score),
    importanceScore: r.importance_score,
    accessCount: r.access_count,
    lastAccessedAt: r.last_accessed_at,
    createdAt: r.created_at,
    metadata: r.metadata,
    tags: [],
    snippet: r.snippet,
  }));
}

// ── Hybrid Search (Reciprocal Rank Fusion) ─────────────────

/**
 * Combines keyword and semantic search using Reciprocal Rank Fusion (RRF).
 *
 * RRF formula: score = 1 / (k + rank), where k=60 is a smoothing constant.
 * Keyword results get 30% weight; semantic results get 70% weight.
 * This balances exact-match precision with semantic understanding.
 */
async function hybridSearch(
  query: string,
  queryEmbedding: number[],
  projectId: string,
  limit: number
): Promise<SearchResult[]> {
  const [kwResults, semResults] = await Promise.all([
    keywordSearch(query, projectId, limit * 2),
    semanticSearch(queryEmbedding, projectId, limit * 2),
  ]);

  // Reciprocal Rank Fusion
  const fusedScores = new Map<
    string,
    { result: SearchResult; score: number }
  >();

  const K = 60; // RRF smoothing constant

  // Keyword contribution (30% weight)
  kwResults.forEach((result, index) => {
    const rrScore = 1 / (K + index + 1);
    const existing = fusedScores.get(result.id);
    fusedScores.set(result.id, {
      result: existing?.result ?? result,
      score: (existing?.score ?? 0) + 0.3 * rrScore,
    });
  });

  // Semantic contribution (70% weight)
  semResults.forEach((result, index) => {
    const rrScore = 1 / (K + index + 1);
    const existing = fusedScores.get(result.id);
    fusedScores.set(result.id, {
      result: existing?.result ?? result,
      score: (existing?.score ?? 0) + 0.7 * rrScore,
    });
  });

  return Array.from(fusedScores.values())
    .map(({ result, score }) => ({
      ...result,
      similarity: score,
      finalScore: score,
    }))
    .sort((a, b) => b.finalScore - a.finalScore)
    .slice(0, limit);
}

// ── Main Search Entry Point ────────────────────────────────

/**
 * Search context entries using keyword, semantic, or hybrid mode.
 * Results are cached in Redis for repeated queries.
 */
export async function searchContext(
  input: SearchContextInput
): Promise<SearchContextOutput> {
  const {
    query,
    projectId,
    limit = 20,
    searchMode = "hybrid",
  } = input;

  if (!projectId) {
    throw new Error("projectId is required for search");
  }

  // ── Cache check ──
  const cacheKey = `${projectId}:${searchMode}:${query}:${limit}`;
  const cached = await cacheGet<SearchContextOutput>("search", cacheKey);
  if (cached) {
    logger.debug("Search cache hit", { query, projectId });
    return cached;
  }

  // ── Execute search ──
  let results: SearchResult[];

  switch (searchMode) {
    case "keyword": {
      results = await keywordSearch(query, projectId, limit);
      break;
    }
    case "semantic": {
      const embedding = await generateEmbedding(query);
      results = await semanticSearch(embedding, projectId, limit);
      break;
    }
    case "hybrid":
    default: {
      const embedding = await generateEmbedding(query);
      results = await hybridSearch(query, embedding, projectId, limit);
      break;
    }
  }

  // ── Apply ranking boosts ──
  results = applyBoosts(results);

  // ── Filter by context types if specified ──
  if (input.contextTypes && input.contextTypes.length > 0) {
    results = results.filter((r) =>
      input.contextTypes!.includes(r.contextType)
    );
  }

  // ── Paginate ──
  const offset = input.offset ?? 0;
  results = results.slice(offset, offset + limit);

  const output: SearchContextOutput = {
    results,
    query,
    totalResults: results.length,
    searchMode,
  };

  // ── Cache result ──
  await cacheSet("search", [cacheKey], output);

  logger.info(`Search: "${query}" returned ${results.length} results (${searchMode})`);
  return output;
}
