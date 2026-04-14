import { describe, it, expect } from "vitest";
import { cleanContent, filterNoise, processContent } from "../../core/cleaner.js";

describe("cleanContent", () => {
  it("should normalize \\r\\n to \\n", () => {
    expect(cleanContent("hello\r\nworld")).toBe("hello\nworld");
  });

  it("should collapse 3+ blank lines into 2", () => {
    const result = cleanContent("a\n\n\n\nb");
    expect(result).toBe("a\n\nb");
  });

  it("should trim trailing whitespace on each line", () => {
    expect(cleanContent("hello   \nworld  ")).toBe("hello\nworld");
  });
});

describe("filterNoise", () => {
  it("should pass valid content", () => {
    const result = filterNoise("This is a meaningful architectural decision about database design.");
    expect(result.passed).toBe(true);
  });

  it("should reject content below minimum length", () => {
    const result = filterNoise("hi");
    expect(result.passed).toBe(false);
    expect(result.reason).toContain("minimum length");
  });

  it("should reject simple greetings", () => {
    expect(filterNoise("hello").passed).toBe(false);
    expect(filterNoise("thanks!").passed).toBe(false);
  });

  it("should reject yes/no responses", () => {
    expect(filterNoise("ok").passed).toBe(false);
    expect(filterNoise("yeah").passed).toBe(false);
    expect(filterNoise("nope").passed).toBe(false);
  });

  it("should reject highly repetitive content", () => {
    const result = filterNoise("aaaaaaaaaaaaaaaaaaaaaa");
    expect(result.passed).toBe(false);
    expect(result.reason).toContain("repetition");
  });
});

describe("processContent", () => {
  it("should return cleaned content for valid input", () => {
    const result = processContent("This is a valid code snippet.\r\n  It has useful content.");
    expect(result.content).not.toBeNull();
    expect(result.content).toContain("valid code snippet");
  });

  it("should return null for noise", () => {
    const result = processContent("ok");
    expect(result.content).toBeNull();
    expect(result.reason).toBeDefined();
  });
});
