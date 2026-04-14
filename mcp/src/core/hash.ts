import { createHash } from "node:crypto";

/**
 * Generates a SHA-256 hex digest for the given content string.
 * Used as a content-addressable key for deduplication.
 *
 * @param content - The text content to hash
 * @returns 64-character lowercase hex string
 */
export function generateHash(content: string): string {
  return createHash("sha256").update(content, "utf8").digest("hex");
}
