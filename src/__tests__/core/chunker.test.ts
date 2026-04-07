import { describe, it, expect } from "vitest";
import { chunkContent } from "../../core/chunker.js";

describe("chunkContent", () => {
  it("should return single chunk if content fits within maxSize", () => {
    const content = "Short content.";
    const chunks = chunkContent(content, 1000);
    expect(chunks).toHaveLength(1);
    expect(chunks[0]).toBe(content);
  });

  it("should split large content into multiple chunks", () => {
    const content = "A".repeat(5000);
    const chunks = chunkContent(content, 2000);
    expect(chunks.length).toBeGreaterThan(1);
  });

  it("should split at paragraph boundaries when possible", () => {
    const paragraph1 = "First paragraph. " + "A".repeat(800);
    const paragraph2 = "Second paragraph. " + "B".repeat(800);
    const content = `${paragraph1}\n\n${paragraph2}`;
    const chunks = chunkContent(content, 1000);

    expect(chunks.length).toBeGreaterThan(1);
    // First chunk should end at or near the paragraph break
    expect(chunks[0]).toContain("First paragraph");
  });

  it("should not produce empty chunks", () => {
    const content = "Hello world.\n\n" + "X".repeat(3000);
    const chunks = chunkContent(content, 500);
    chunks.forEach((chunk) => {
      expect(chunk.length).toBeGreaterThan(0);
    });
  });

  it("should handle content with only whitespace after trim", () => {
    const chunks = chunkContent("   ", 100);
    // After trim, this is empty — should give one empty-ish result or empty
    expect(chunks.length).toBeLessThanOrEqual(1);
  });
});
