/**
 * Live reading statistics for the split-pane editor: word / character counts
 * and an estimated reading time. Framework-free and allocation-light so it
 * can run on every keystroke.
 */

export type ReadingStats = {
  words: number;
  characters: number;
  charactersNoSpaces: number;
  lines: number;
  /** Whole minutes, minimum 1 for any non-empty text. */
  readMinutes: number;
  /** Pre-formatted label matching the rest of the UI ("08 min"). */
  readTime: string;
};

const WORDS_PER_MINUTE = 200;

export function readingStats(markdown: string): ReadingStats {
  const text = String(markdown ?? "");
  if (!text.trim()) {
    return { words: 0, characters: 0, charactersNoSpaces: 0, lines: 0, readMinutes: 0, readTime: "00 min" };
  }
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const characters = text.length;
  const charactersNoSpaces = text.replace(/\s/g, "").length;
  const lines = text.split("\n").length;
  const readMinutes = Math.max(1, Math.round(words / WORDS_PER_MINUTE));
  return {
    words,
    characters,
    charactersNoSpaces,
    lines,
    readMinutes,
    readTime: `${readMinutes < 10 ? "0" : ""}${readMinutes} min`,
  };
}
