import { describe, it, expect } from "vitest";
import { generateHash } from "../../core/hash.js";

describe("generateHash", () => {
  it("should return a 64-character hex string", () => {
    const hash = generateHash("hello world");
    expect(hash).toHaveLength(64);
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
  });

  it("should produce deterministic output", () => {
    const a = generateHash("test content");
    const b = generateHash("test content");
    expect(a).toBe(b);
  });

  it("should produce different hashes for different content", () => {
    const a = generateHash("alpha");
    const b = generateHash("beta");
    expect(a).not.toBe(b);
  });

  it("should handle empty string", () => {
    const hash = generateHash("");
    expect(hash).toHaveLength(64);
  });

  it("should handle unicode content", () => {
    const hash = generateHash("こんにちは世界 🌍");
    expect(hash).toHaveLength(64);
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
  });
});
