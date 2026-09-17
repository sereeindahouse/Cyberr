/**
 * BacklinksPanel — "Энэ тэмдэглэл рүү заасан бусад тэмдэглэлүүд".
 * Rendered at the end of the report detail + reader; computed purely from
 * `[[wiki-links]]` so it works fully offline.
 */
import { useMemo } from "react";
import { Link2 } from "lucide-react";
import { findBacklinks } from "@shared/wikiLinks";

export type BacklinksPanelProps = {
  reportId: number;
  reports: readonly { id: number; title: string; content: string }[];
  onOpenReport?: (reportId: number) => void;
};

export default function BacklinksPanel({ reportId, reports, onOpenReport }: BacklinksPanelProps) {
  const backlinks = useMemo(() => findBacklinks(reportId, reports), [reportId, reports]);

  return (
    <div className="backlinks-panel">
      <div className="section-kicker">
        <Link2 size={11} /> Backlinks · {backlinks.length}
      </div>
      <h4>Энэ тэмдэглэл рүү заасан бусад тэмдэглэлүүд</h4>
      {backlinks.length === 0 ? (
        <p className="backlinks-empty">
          Одоохондоо хоосон — өөр тэмдэглэл дотроо <code>[[...]]</code> холбоос үүсгэхэд энд автоматаар гарч ирнэ.
        </p>
      ) : (
        <div className="backlinks-list">
          {backlinks.map(link => (
            <button
              key={link.id}
              className="backlink-row"
              onClick={() => onOpenReport?.(link.id)}
              title="Холбосон тэмдэглэлийг нээх"
            >
              <strong>{link.title}</strong>
              <span>{link.snippet}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
