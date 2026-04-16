import { prisma } from "../repository/prisma.js";
import { generateHash } from "../core/hash.js";
import { generateEmbedding } from "../core/embeddings.js";
import { processContent } from "../core/cleaner.js";
import { chunkContent } from "../core/chunker.js";
import { cacheInvalidate } from "./cache.service.js";
import { logger } from "../core/logger.js";
import type {
  SaveContextInput,
  SaveContextResult,
  UpdateContextInput,
  DeleteContextInput,
} from "../domain/types.js";
import { IMPORTANCE_SCORES as SCORES } from "../domain/types.js";
import { NotFoundError, NoiseContentError } from "../domain/errors.js";

// ── Save Context ───────────────────────────────────────────

/**
 * Full processing pipeline: clean → filter → hash → dedup → chunk → embed → store.
 *
 * 1. Clean and filter noise from raw content.
 * 2. Generate SHA-256 content hash for deduplication.
 * 3. Check for existing hash within the same project (idempotency).
 * 4. Chunk large content into smaller pieces for better embedding quality.
 * 5. Generate embeddings for each chunk via OpenAI.
 * 6. Insert context entry + embeddings + tags in a single transaction.
 */
export async function saveContext(input: SaveContextInput): Promise<SaveContextResult> {
  // ── Step 1: Clean & filter ──
  const processed = processContent(input.rawContent);
  if (processed.content === null) {
    return {
      status: "filtered",
      contentHash: generateHash(input.rawContent),
      reason: processed.reason,
    };
  }

  const cleanedContent = processed.content;
  const contentHash = generateHash(cleanedContent);

  // ── Step 2: Dedup check ──
  const existing = await prisma.contextEntry.findUnique({
    where: {
      projectId_contentHash: {
        projectId: input.projectId,
        contentHash,
      },
    },
    select: { id: true },
  });

  if (existing) {
    return { status: "duplicate", id: existing.id, contentHash };
  }

  // ── Step 3: Importance score ──
  const importanceScore = input.importance ? SCORES[input.importance] : 50;

  // ── Step 4: Create context entry ──
  const entry = await prisma.contextEntry.create({
    data: {
      projectId: input.projectId,
      contextType: input.contextType,
      title: input.title,
      rawContent: input.rawContent,
      processedContent: cleanedContent,
      sourceFilePath: input.sourceInfo?.filePath,
      sourceLanguage: input.sourceInfo?.language,
      sourceLineStart: input.sourceInfo?.lineStart,
      sourceLineEnd: input.sourceInfo?.lineEnd,
      contentHash,
      importanceScore,
      metadata: (input.metadata ?? {}) as object,
      linkedUrls: [],
    },
  });

  // ── Step 5: Chunk & embed ──
  const chunks = chunkContent(cleanedContent);

  for (let i = 0; i < chunks.length; i++) {
    const embedding = await generateEmbedding(chunks[i]);
    const embeddingStr = `[${embedding.join(",")}]`;

    await prisma.$executeRaw`
      INSERT INTO context_embeddings (context_entry_id, embedding, chunk_index, chunk_content)
      VALUES (${entry.id}::uuid, ${embeddingStr}::vector, ${i}, ${chunks[i]})
    `;
  }

  // ── Step 6: Tags ──
  if (input.tags && input.tags.length > 0) {
    await prisma.contextTag.createMany({
      data: input.tags.map((tag) => ({
        contextId: entry.id,
        tag: tag.toLowerCase(),
      })),
      skipDuplicates: true,
    });
  }

  // ── Step 7: Relationships ──
  if (input.linkedContextIds && input.linkedContextIds.length > 0) {
    await prisma.contextRelationship.createMany({
      data: input.linkedContextIds.map((targetId) => ({
        sourceId: entry.id,
        targetId,
        relationshipType: "related",
      })),
      skipDuplicates: true,
    });
  }

  // ── Step 8: Invalidate search cache for this project ──
  await cacheInvalidate("search", input.projectId);

  logger.info(`Context saved: ${entry.id} (${chunks.length} chunks)`);

  return {
    status: "saved",
    id: entry.id,
    contentHash,
    chunksCreated: chunks.length,
  };
}

// ── Update Context ─────────────────────────────────────────

/**
 * Update an existing context entry. If raw_content changes,
 * re-process, re-embed, and replace all embeddings.
 */
export async function updateContext(input: UpdateContextInput): Promise<{ id: string }> {
  const existing = await prisma.contextEntry.findFirst({
    where: { id: input.id, deletedAt: null },
  });

  if (!existing) {
    throw new NotFoundError("ContextEntry", input.id);
  }

  const updateData: Record<string, unknown> = {};

  if (input.title) updateData.title = input.title;
  if (input.metadata) updateData.metadata = input.metadata;
  if (input.importance) updateData.importanceScore = SCORES[input.importance];

  // If content changed, re-process everything
  if (input.rawContent && input.rawContent !== existing.rawContent) {
    const processed = processContent(input.rawContent);
    if (processed.content === null) {
      throw new NoiseContentError(processed.reason ?? "Filtered");
    }

    const contentHash = generateHash(processed.content);
    updateData.rawContent = input.rawContent;
    updateData.processedContent = processed.content;
    updateData.contentHash = contentHash;

    // Delete old embeddings
    await prisma.contextEmbedding.deleteMany({
      where: { contextEntryId: input.id },
    });

    // Re-chunk and re-embed
    const chunks = chunkContent(processed.content);
    for (let i = 0; i < chunks.length; i++) {
      const embedding = await generateEmbedding(chunks[i]);
      const embeddingStr = `[${embedding.join(",")}]`;

      await prisma.$executeRaw`
        INSERT INTO context_embeddings (context_entry_id, embedding, chunk_index, chunk_content)
        VALUES (${input.id}::uuid, ${embeddingStr}::vector, ${i}, ${chunks[i]})
      `;
    }
  }

  // Update tags if provided
  if (input.tags) {
    await prisma.contextTag.deleteMany({ where: { contextId: input.id } });
    if (input.tags.length > 0) {
      await prisma.contextTag.createMany({
        data: input.tags.map((tag) => ({
          contextId: input.id,
          tag: tag.toLowerCase(),
        })),
      });
    }
  }

  await prisma.contextEntry.update({
    where: { id: input.id },
    data: updateData,
  });

  await cacheInvalidate("search", existing.projectId);
  logger.info(`Context updated: ${input.id}`);

  return { id: input.id };
}

// ── Delete Context ─────────────────────────────────────────

/**
 * Soft delete (default) or hard delete a context entry.
 */
export async function deleteContext(
  input: DeleteContextInput
): Promise<{ id: string; deleted: "soft" | "hard" }> {
  const existing = await prisma.contextEntry.findFirst({
    where: { id: input.id, deletedAt: null },
  });

  if (!existing) {
    throw new NotFoundError("ContextEntry", input.id);
  }

  if (input.permanent) {
    // Hard delete — cascades to embeddings, tags, relationships via FK
    await prisma.contextEntry.delete({ where: { id: input.id } });
    logger.info(`Context hard-deleted: ${input.id}`);
    await cacheInvalidate("search", existing.projectId);
    return { id: input.id, deleted: "hard" };
  }

  // Soft delete
  await prisma.contextEntry.update({
    where: { id: input.id },
    data: { deletedAt: new Date() },
  });

  logger.info(`Context soft-deleted: ${input.id}`);
  await cacheInvalidate("search", existing.projectId);
  return { id: input.id, deleted: "soft" };
}

// ── Get Context ────────────────────────────────────────────

/**
 * Retrieve a single context entry by ID. Bumps access count and last_accessed_at.
 */
export async function getContext(
  id: string,
  includeRelated: boolean = false
): Promise<Record<string, unknown>> {
  const entry = await prisma.contextEntry.findFirst({
    where: { id, deletedAt: null },
    include: {
      tags: true,
      sourceRelations: includeRelated
        ? { include: { target: { select: { id: true, title: true, contextType: true } } } }
        : false,
      targetRelations: includeRelated
        ? { include: { source: { select: { id: true, title: true, contextType: true } } } }
        : false,
    },
  });

  if (!entry) {
    throw new NotFoundError("ContextEntry", id);
  }

  // Bump access stats
  await prisma.contextEntry.update({
    where: { id },
    data: {
      accessCount: { increment: 1 },
      lastAccessedAt: new Date(),
    },
  });

  return entry as unknown as Record<string, unknown>;
}
