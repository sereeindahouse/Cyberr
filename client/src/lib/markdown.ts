/**
 * Markdown rendering pipeline shared by the reader, the split-pane editor
 * preview and the wiki-link renderer: Obsidian-dialect normalisation →
 * marked → DOMPurify. Single place to tune which HTML survives.
 */
import DOMPurify from "dompurify";
import { marked } from "marked";

/** Strip Obsidian-isms (callouts, ==highlights==, quote-soup) for clean HTML. */
export function normalizeNoteMarkdown(md: string): string {
  let out = String(md ?? "");
  out = out
    .split("\n")
    .filter(line => !line.includes("ADD THIS TO YOUR OBSIDIAN VAULT"))
    .join("\n");
  out = out.replace(/^Tags:\s*.*$/gim, "");
  out = out.replace(/^>\s*\[!note\]\s*/gim, "> ");
  const lines = out.split("\n");
  const quoteLines = lines.filter(l => l.trim().startsWith(">")).length;
  if (lines.length > 0 && quoteLines / lines.length > 0.6) {
    out = lines.map(l => l.replace(/^>\s?/, "")).join("\n");
  }
  out = out.replace(/==([^=]+)==/g, "**$1**");
  return out;
}

/** Full pipeline: markdown string → sanitized HTML string. */
export function renderMarkdownHtml(content: string): string {
  const raw = marked.parse(normalizeNoteMarkdown(content), {
    gfm: true,
    breaks: false,
    async: false,
  });
  return DOMPurify.sanitize(String(raw), { ADD_ATTR: ["target"] });
}

/**
 * Inject "Хуулах" buttons into every <pre> block of a rendered container.
 * Idempotent (skips blocks that already have one).
 */
export function attachCodeCopyButtons(root: HTMLElement): void {
  root.querySelectorAll("pre").forEach(pre => {
    if (pre.querySelector(".md-copy-btn")) return;
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "md-copy-btn";
    btn.textContent = "Хуулах";
    btn.addEventListener("click", () => {
      const text = (pre.querySelector("code") ?? pre).textContent ?? "";
      try {
        navigator.clipboard.writeText(text);
      } catch {}
      btn.textContent = "Хуулагдлаа!";
      window.setTimeout(() => (btn.textContent = "Хуулах"), 1200);
    });
    pre.appendChild(btn);
  });
}
