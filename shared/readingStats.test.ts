import { describe, expect, it } from "vitest";
import { readingStats } from "./readingStats";

describe("readingStats", () => {
  it("counts words, characters and lines", () => {
    const s = readingStats("hello world\nsecond line");
    expect(s.words).toBe(4);
    expect(s.characters).toBe("hello world\nsecond line".length);
    expect(s.charactersNoSpaces).toBe("helloworldsecondline".length);
    expect(s.lines).toBe(2);
  });

  it("estimates reading time at 200 wpm, minimum 1 minute", () => {
    expect(readingStats("short note").readMinutes).toBe(1);
    expect(readingStats("short note").readTime).toBe("01 min");
    expect(readingStats("word ".repeat(400)).readMinutes).toBe(2);
  });

  it("handles empty input", () => {
    const s = readingStats("   ");
    expect(s.words).toBe(0);
    expect(s.readMinutes).toBe(0);
    expect(s.readTime).toBe("00 min");
  });
});
