/**
 * WikiMarkdown — Markdown renderer with Obsidian-style `[[wiki-links]]`.
 *
 * After the standard marked → DOMPurify pipeline, text nodes are scanned for
 * `[[target]]` / `[[target|alias]]` and each occurrence is replaced with a
 * real <a> element (built via DOM APIs, never innerHTML, so link targets
 * can't inject markup):
 *
 *  - resolved links open the note on click and show a hover popover preview
 *    (excerpt + tags + read time, Wikipedia/Obsidian style);
 *  - unresolved links render dashed-red; clicking them asks the parent to
 *    create the missing note pre-filled with that title.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { Clock3, FilePlus2, FileText, Tag } from "lucide-react";
import {
  buildTitleIndex,
  parseWikiLinks,
  resolveWikiLink,
  type WikiLink,
} from "@shared/wikiLinks";
import { attachCodeCopyButtons, renderMarkdownHtml } from "@/lib/markdown";

export type WikiReportLike = {
  id: number;
  title: string;
  excerpt: string;
  tags: string[];
  readTime: string;
  date: string;
  status?: string;
};

export type WikiMarkdownProps = {
  content: string;
  reports: readonly WikiReportLike[];
  onOpenReport?: (reportId: number) => void;
  onCreateReport?: (title: string) => void;
  className?: string;
};

type PopoverState = {
  x: number;
  y: number;
  /** Place above the link when there is no room below. */
  above: boolean;
  link: WikiLink;
  target: WikiReportLike | null;
};

const HOVER_DELAY_MS = 220;
const HIDE_DELAY_MS = 140;
const POPOVER_WIDTH = 300;
const POPOVER_MAX_HEIGHT = 260;

export default function WikiMarkdown({
  content,
  reports,
  onOpenReport,
  onCreateReport,
  className,
}: WikiMarkdownProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [popover, setPopover] = useState<PopoverState | null>(null);
  const hoverTimer = useRef<number | null>(null);
  const hideTimer = useRef<number | null>(null);

  const html = useMemo(() => renderMarkdownHtml(content), [content]);

  const titleIndex = useMemo(
    () => buildTitleIndex(reports.map(r => ({ id: r.id, title: r.title }))),
    [reports]
  );
  const reportById = useMemo(() => new Map(reports.map(r => [r.id, r])), [reports]);

  function clearTimers() {
    if (hoverTimer.current !== null) {
      window.clearTimeout(hoverTimer.current);
      hoverTimer.current = null;
    }
    if (hideTimer.current !== null) {
      window.clearTimeout(hideTimer.current);
      hideTimer.current = null;
    }
  }

  function scheduleHide() {
    if (hoverTimer.current !== null) {
      window.clearTimeout(hoverTimer.current);
      hoverTimer.current = null;
    }
    if (hideTimer.current !== null) return;
    hideTimer.current = window.setTimeout(() => {
      hideTimer.current = null;
      setPopover(null);
    }, HIDE_DELAY_MS);
  }

  function showForAnchor(anchor: HTMLAnchorElement) {
    if (hideTimer.current !== null) {
      window.clearTimeout(hideTimer.current);
      hideTimer.current = null;
    }
    if (hoverTimer.current !== null) return;
    hoverTimer.current = window.setTimeout(() => {
      hoverTimer.current = null;
      const rect = anchor.getBoundingClientRect();
      const rawTarget = anchor.dataset.wikiTarget ?? "";
      const id = Number(anchor.dataset.wikiId ?? "");
      const target = Number.isFinite(id) && id > 0 ? (reportById.get(id) ?? null) : null;
      const x = Math.min(
        Math.max(8, rect.left + rect.width / 2 - POPOVER_WIDTH / 2),
        window.innerWidth - POPOVER_WIDTH - 8
      );
      const below = rect.bottom + 10;
      const above = below + POPOVER_MAX_HEIGHT > window.innerHeight - 8;
      setPopover({
        x,
        y: above ? Math.max(8, rect.top - POPOVER_MAX_HEIGHT - 10) : below,
        above,
        link: {
          raw: `[[${rawTarget}]]`,
          target: rawTarget,
          alias: anchor.textContent ?? rawTarget,
          anchor: null,
          start: 0,
          end: 0,
        },
        target,
      });
    }, HOVER_DELAY_MS);
  }

  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;
    attachCodeCopyButtons(root);

    // --- wiki-link pass: replace [[...]] in text nodes with <a> elements ---
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        const parent = node.parentElement;
        // Never touch code spans/blocks, existing links or copy buttons.
        if (!parent || parent.closest("a, code, pre, button, .md-copy-btn")) {
          return NodeFilter.FILTER_REJECT;
        }
        return (node.nodeValue ?? "").includes("[[")
          ? NodeFilter.FILTER_ACCEPT
          : NodeFilter.FILTER_SKIP;
      },
    });
    const textNodes: Text[] = [];
    while (walker.nextNode()) textNodes.push(walker.currentNode as Text);

    for (const node of textNodes) {
      const value = node.nodeValue ?? "";
      const links = parseWikiLinks(value);
      if (!links.length) continue;
      const fragment = document.createDocumentFragment();
      let cursor = 0;
      for (const link of links) {
        if (link.start > cursor) {
          fragment.appendChild(document.createTextNode(value.slice(cursor, link.start)));
        }
        const resolved = resolveWikiLink(link, titleIndex);
        const anchor = document.createElement("a");
        anchor.href = "#";
        anchor.textContent = link.alias;
        anchor.className = resolved ? "wiki-link" : "wiki-link unresolved";
        anchor.dataset.wikiTarget = link.target;
        if (resolved) anchor.dataset.wikiId = String(resolved.id);
        anchor.title = resolved ? resolved.title : `«${link.target}» үүсгэх`;
        fragment.appendChild(anchor);
        cursor = link.end;
      }
      if (cursor < value.length) {
        fragment.appendChild(document.createTextNode(value.slice(cursor)));
      }
      node.parentNode?.replaceChild(fragment, node);
    }

    // --- delegated click / hover -------------------------------------------
    const onClick = (event: MouseEvent) => {
      const anchor = (event.target as HTMLElement).closest?.("a.wiki-link") as HTMLAnchorElement | null;
      if (!anchor || !root.contains(anchor)) return;
      event.preventDefault();
      const id = Number(anchor.dataset.wikiId ?? "");
      if (Number.isFinite(id) && id > 0) {
        setPopover(null);
        onOpenReport?.(id);
      } else {
        setPopover(null);
        onCreateReport?.(anchor.dataset.wikiTarget ?? "");
      }
    };
    const onMouseOver = (event: MouseEvent) => {
      const anchor = (event.target as HTMLElement).closest?.("a.wiki-link") as HTMLAnchorElement | null;
      if (!anchor || !root.contains(anchor)) return;
      showForAnchor(anchor);
    };
    const onMouseOut = (event: MouseEvent) => {
      const anchor = (event.target as HTMLElement).closest?.("a.wiki-link");
      if (!anchor) return;
      const to = event.relatedTarget as HTMLElement | null;
      if (to && (to.closest?.("a.wiki-link") === anchor || to.closest?.(".wiki-popover"))) return;
      scheduleHide();
    };
    const onScroll = () => {
      clearTimers();
      setPopover(null);
    };
    root.addEventListener("click", onClick);
    root.addEventListener("mouseover", onMouseOver);
    root.addEventListener("mouseout", onMouseOut);
    window.addEventListener("scroll", onScroll, true);
    return () => {
      root.removeEventListener("click", onClick);
      root.removeEventListener("mouseover", onMouseOver);
      root.removeEventListener("mouseout", onMouseOut);
      window.removeEventListener("scroll", onScroll, true);
      clearTimers();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [html, titleIndex, reportById]);

  // Close the popover on Escape.
  useEffect(() => {
    if (!popover) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPopover(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [popover]);

  return (
    <>
      <div
        className={className ?? "markdown-preview"}
        ref={containerRef}
        dangerouslySetInnerHTML={{ __html: html }}
      />
      {popover && (
        <div
          className={`wiki-popover${popover.above ? " above" : ""}`}
          style={{ left: popover.x, top: popover.y, width: POPOVER_WIDTH }}
          onMouseEnter={() => {
            if (hideTimer.current !== null) {
              window.clearTimeout(hideTimer.current);
              hideTimer.current = null;
            }
          }}
          onMouseLeave={scheduleHide}
        >
          {popover.target ? (
            <>
              <button
                className="wiki-popover-title"
                onClick={() => {
                  setPopover(null);
                  onOpenReport?.(popover.target!.id);
                }}
                title="Тэмдэглэлийг нээх"
              >
                <FileText size={13} />
                <span>{popover.target.title}</span>
              </button>
              <p className="wiki-popover-excerpt">{popover.target.excerpt || "Товч агуулга хоосон."}</p>
              <div className="wiki-popover-meta">
                <span>
                  <Clock3 size={11} /> {popover.target.readTime}
                </span>
                <span>{popover.target.date}</span>
                {popover.target.status && (
                  <span className={`status-pill ${popover.target.status.toLowerCase()}`}>
                    {popover.target.status}
                  </span>
                )}
              </div>
              {popover.target.tags.length > 0 && (
                <div className="wiki-popover-tags">
                  <Tag size={11} />
                  {popover.target.tags.slice(0, 5).map(tag => (
                    <span key={tag}>#{tag}</span>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="wiki-popover-missing">
              <strong>«{popover.link.target}»</strong>
              <span>хуудас үүсээгүй байна.</span>
              <button
                className="secondary-button"
                onClick={() => {
                  setPopover(null);
                  onCreateReport?.(popover.link.target);
                }}
              >
                <FilePlus2 size={13} /> Шинэ тэмдэглэл үүсгэх
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
}
