import { prisma } from "../repository/prisma.js";
import { generateHash } from "../core/hash.js";
import { generateEmbedding } from "../core/embeddings.js";

// ── Types ──────────────────────────────────────────────────

export interface SaveContextInput {
  projectId: string;
  type: "code_snippet" | "arch_decision" | "task" | "conversation";
  content: string;
  metadata?: Record<string, unknown>;
}

export interface SaveContextResult {
  status: "saved" | "duplicate";
  id?: string;
  contentHash: string;
}

// ── Service ────────────────────────────────────────────────

/**
 * Saves a context entry to the database with deduplication.
 *
 * Flow:
 *  1. Generate SHA-256 hash of the content.
 *  2. Check if the hash already exists (idempotency guard).
 *  3. Generate an embedding vector via OpenAI.
 *  4. INSERT using raw SQL (required for the pgvector column).
 */
export async function saveContext(
  input: SaveContextInput
): Promise<SaveContextResult> {
  const contentHash = generateHash(input.content);

  // ── Dedup check ──
  const existing = await prisma.contextStore.findUnique({
    where: { contentHash },
    select: { id: true },
  });

  if (existing) {
    return { status: "duplicate", id: existing.id, contentHash };
  }

  // ── Generate embedding ──
  const embedding = await generateEmbedding(input.content);
  const embeddingStr = `[${embedding.join(",")}]`;

  // ── Insert via raw SQL (pgvector requires this) ──
  const result = await prisma.$queryRaw<Array<{ id: string }>>`
    INSERT INTO context_store (project_id, type, content, metadata, embedding, content_hash)
    VALUES (
      ${input.projectId},
      ${input.type},
      ${input.content},
      ${JSON.stringify(input.metadata ?? {})}::jsonb,
      ${embeddingStr}::vector,
      ${contentHash}
    )
    RETURNING id
  `;

  return {
    status: "saved",
    id: result[0].id,
    contentHash,
  };
}
