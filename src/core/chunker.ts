import { config } from "./config.js";

/**
 * Text chunker for large content.
 *
 * Splits content into overlapping chunks at natural boundaries
 * (paragraph breaks, then sentence endings) to preserve context
 * across chunk boundaries. Each chunk gets its own embedding.
 */

const OVERLAP_RATIO = 0.1; // 10% overlap between chunks

/**
 * Split text into chunks of approximately `maxSize` characters.
 * Prefers splitting at paragraph breaks (\n\n), then newlines (\n),
 * then sentence endings (. ! ?).
 *
 * @param content - The text to chunk
 * @param maxSize - Max characters per chunk (default from config)
 * @returns Array of content chunks. Returns single-element array if content fits.
 */
export function chunkContent(
  content: string,
  maxSize: number = config.maxChunkSize
): string[] {
  if (content.length <= maxSize) {
    return [content];
  }

  const chunks: string[] = [];
  const overlap = Math.floor(maxSize * OVERLAP_RATIO);
  let start = 0;

  while (start < content.length) {
    let end = Math.min(start + maxSize, content.length);

    // If we're not at the end, find a good break point
    if (end < content.length) {
      const window = content.slice(start, end);

      // Try paragraph break first
      const paragraphBreak = window.lastIndexOf("\n\n");
      if (paragraphBreak > maxSize * 0.5) {
        end = start + paragraphBreak + 2;
      } else {
        // Try line break
        const lineBreak = window.lastIndexOf("\n");
        if (lineBreak > maxSize * 0.5) {
          end = start + lineBreak + 1;
        } else {
          // Try sentence ending
          const sentenceEnd = Math.max(
            window.lastIndexOf(". "),
            window.lastIndexOf("! "),
            window.lastIndexOf("? ")
          );
          if (sentenceEnd > maxSize * 0.3) {
            end = start + sentenceEnd + 2;
          }
          // Otherwise just cut at maxSize
        }
      }
    }

    let rawChunk = content.slice(start, end).trim();
    // Strip isolated surrogates to avoid DB encoding errors
    rawChunk = rawChunk.replace(/[\uD800-\uDBFF](?![\uDC00-\uDFFF])|([^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/g, '$1');
    chunks.push(rawChunk);

    // Move start forward, applying overlap
    const nextStart = end - overlap;
    // Guard: if overlap causes no forward progress, jump to end
    start = nextStart >= start + 1 ? nextStart : end;
  }

  return chunks.filter((chunk) => chunk.length > 0);
}
