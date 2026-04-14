import { config } from "./config.js";

/**
 * Content cleaner and noise filter.
 *
 * Filters out low-quality content before embedding to prevent memory bloat.
 * Returns `null` if content is considered noise; otherwise returns cleaned text.
 */

// ── Noise Patterns ─────────────────────────────────────────

const NOISE_PATTERNS: RegExp[] = [
  /^(hi|hello|hey|thanks?|thank you)\s*[.!]?\s*$/i,
  /^(ok|okay|k|yeah|yes|yep|yup|sure)\s*[.!]?\s*$/i,
  /^(no|nah|nope|nothing|none)\s*[.!]?\s*$/i,
  /^(can you|could you|would you|please)\s+/i,
  /^\.{3,}\s*$/m,
  /^\s+$/,
];

// ── Cleaner ────────────────────────────────────────────────

/**
 * Clean raw content by normalizing whitespace and trimming.
 */
export function cleanContent(raw: string): string {
  return raw
    // Normalize line endings
    .replace(/\r\n/g, "\n")
    // Collapse 3+ blank lines into 2
    .replace(/\n{3,}/g, "\n\n")
    // Trim trailing whitespace on each line
    .replace(/[ \t]+$/gm, "")
    // Trim overall
    .trim();
}

// ── Noise Filter ───────────────────────────────────────────

export interface FilterResult {
  passed: boolean;
  reason?: string;
}

/**
 * Check if content passes quality filters.
 *
 * @param content - Cleaned content string
 * @returns `passed: true` if content is worth storing
 */
export function filterNoise(content: string): FilterResult {
  // Check minimum length
  if (content.length < config.minContentLength) {
    return { passed: false, reason: `Below minimum length (${config.minContentLength} chars)` };
  }

  // Check noise patterns
  for (const pattern of NOISE_PATTERNS) {
    if (pattern.test(content)) {
      return { passed: false, reason: `Matches noise pattern: ${pattern.source}` };
    }
  }

  // Check for high repetition ratio (same char > 70% of content)
  const charFrequency = new Map<string, number>();
  for (const char of content) {
    charFrequency.set(char, (charFrequency.get(char) ?? 0) + 1);
  }
  const maxFreq = Math.max(...charFrequency.values());
  if (maxFreq / content.length > 0.7) {
    return { passed: false, reason: "High character repetition ratio (>70%)" };
  }

  return { passed: true };
}

/**
 * Full processing: clean + filter.
 * Returns cleaned content or null if filtered as noise.
 */
export function processContent(raw: string): { content: string | null; reason?: string } {
  const cleaned = cleanContent(raw);
  const filterResult = filterNoise(cleaned);

  if (!filterResult.passed) {
    return { content: null, reason: filterResult.reason };
  }

  return { content: cleaned };
}
