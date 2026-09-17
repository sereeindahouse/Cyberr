/**
 * ReportTabs — VS Code маягийн олон табт ажлын талбар.
 *
 * Each tab preserves its reader scroll position (owned by the parent via
 * onActivate/onClose so tab state survives navigation). Middle-click closes
 * a tab, like a real browser.
 */
import { useEffect, useRef } from "react";
import { FileText, X } from "lucide-react";

export type ReportTabsProps = {
  tabs: readonly number[];
  activeId: number | undefined;
  titles: Map<number, { title: string; status: string }>;
  onActivate: (reportId: number) => void;
  onClose: (reportId: number) => void;
};

export default function ReportTabs({ tabs, activeId, titles, onActivate, onClose }: ReportTabsProps) {
  const stripRef = useRef<HTMLDivElement>(null);

  // Keep the active tab visible inside the scrollable strip.
  useEffect(() => {
    const strip = stripRef.current;
    if (!strip) return;
    const active = strip.querySelector<HTMLElement>(".report-tab.active");
    active?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [activeId, tabs.length]);

  if (tabs.length === 0) return null;

  return (
    <div className="report-tabs" role="tablist" aria-label="Нээлттэй тэмдэглэлүүд" ref={stripRef}>
      {tabs.map(id => {
        const meta = titles.get(id);
        const isActive = id === activeId;
        return (
          <div
            key={id}
            role="tab"
            aria-selected={isActive}
            className={`report-tab${isActive ? " active" : ""}`}
            onClick={() => onActivate(id)}
            onMouseDown={e => {
              if (e.button === 1) {
                e.preventDefault();
                onClose(id);
              }
            }}
            title={meta?.title ?? `Тайлан ${id}`}
          >
            <FileText size={12} className="report-tab-icon" />
            <span className="report-tab-title">{meta?.title ?? `Тайлан ${id}`}</span>
            <span
              className={`report-tab-dot ${(meta?.status ?? "draft").toLowerCase()}`}
              title={meta?.status ?? ""}
            />
            <button
              className="report-tab-close"
              aria-label={`${meta?.title ?? id} табыг хаах`}
              onClick={e => {
                e.stopPropagation();
                onClose(id);
              }}
            >
              <X size={12} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
