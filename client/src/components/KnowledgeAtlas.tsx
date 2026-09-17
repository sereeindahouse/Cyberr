import { useMemo, useState } from "react";
import { ArrowUpRight, Crosshair, FileText, Hash, Target } from "lucide-react";
import type { Track } from "@/data/roadmapTracks";
import {
  buildAtlasGraph,
  layoutGraph,
  type DiagramReport,
  type PositionedNode,
} from "@/lib/visualModel";
import GraphCanvas from "./GraphCanvas";

export type KnowledgeAtlasProps = {
  reports: DiagramReport[];
  tracks: Track[];
  trackProgress?: Record<string, boolean>;
  onOpenReport?: (reportId: number) => void;
  onOpenTrack?: (trackId: string) => void;
};

const SOURCES = ["THM", "picoCTF", "HTB", "Cloud", "Cyber"] as const;

/**
 * Knowledge Atlas ("Мэдлэгийн газрын зураг") — an interactive concept map over
 * the whole vault: roadmap tracks → reports → shared tags. Pan/zoom is handled
 * by GraphCanvas; this component owns the filtering and the focus panel.
 */
export default function KnowledgeAtlas({
  reports,
  tracks,
  trackProgress = {},
  onOpenReport,
  onOpenTrack,
}: KnowledgeAtlasProps) {
  const [query, setQuery] = useState("");
  const [source, setSource] = useState<"All" | (typeof SOURCES)[number]>("All");
  const [showTags, setShowTags] = useState(true);
  const [selected, setSelected] = useState<PositionedNode | null>(null);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return reports.filter(report => {
      if (source !== "All" && report.source !== source) return false;
      if (!needle) return true;
      const haystack = `${report.title} ${report.stage} ${report.room ?? ""} ${(report.tags ?? []).join(" ")}`;
      return haystack.toLowerCase().includes(needle);
    });
  }, [reports, query, source]);

  const graph = useMemo(
    () =>
      buildAtlasGraph(filtered, tracks, trackProgress, {
        tagLimit: showTags ? 8 : 0,
        reportLimit: 120,
      }),
    [filtered, tracks, trackProgress, showTags]
  );

  const positioned = useMemo(() => layoutGraph(graph, "mindmap"), [graph]);

  const neighbours = useMemo(() => {
    if (!selected) return [];
    const ids = new Set<string>();
    for (const edge of graph.edges) {
      if (edge.source === selected.id) ids.add(edge.target);
      if (edge.target === selected.id) ids.add(edge.source);
    }
    return [...ids]
      .map(id => positioned.nodes.find(node => node.id === id))
      .filter((node): node is PositionedNode => Boolean(node))
      .slice(0, 40);
  }, [selected, graph.edges, positioned.nodes]);

  const hiddenCount = Math.max(0, filtered.length - Math.min(filtered.length, 120));

  return (
    <div className="atlas-module">
      <div className="atlas-controls">
        <div className="atlas-search">
          <Crosshair size={13} />
          <input
            value={query}
            onChange={event => setQuery(event.target.value)}
            placeholder="Тайлан, шошго, stage-аар шүүх…"
            aria-label="Атласаас хайх"
          />
        </div>
        <div className="atlas-chips">
          <button
            className={`atlas-chip ${source === "All" ? "active" : ""}`}
            onClick={() => setSource("All")}
          >
            Бүгд <small>{reports.length}</small>
          </button>
          {SOURCES.map(item => (
            <button
              key={item}
              className={`atlas-chip ${source === item ? "active" : ""}`}
              onClick={() => setSource(item)}
            >
              {item}{" "}
              <small>{reports.filter(report => report.source === item).length}</small>
            </button>
          ))}
          <button
            className={`atlas-chip ${showTags ? "active" : ""}`}
            onClick={() => setShowTags(current => !current)}
            title="Шошгоны зангилааг харуулах/нуух"
          >
            <Hash size={11} /> Шошго
          </button>
        </div>
      </div>

      <div className="atlas-body">
        <GraphCanvas
          graph={positioned}
          selectedId={selected?.id ?? null}
          onSelect={setSelected}
          onOpenNode={node => {
            if (node.reportId && onOpenReport) onOpenReport(node.reportId);
            else if (node.trackId && onOpenTrack) onOpenTrack(node.trackId);
          }}
          height={620}
          exportName="knowledge-atlas"
          emptyLabel="Шүүлтэд тохирох тайлан алга."
        />

        <aside className="atlas-focus">
          <div className="section-kicker">Focus</div>
          {selected ? (
            <>
              <h3>{selected.label}</h3>
              {selected.detail && <p className="atlas-focus-detail">{selected.detail}</p>}
              <div className="atlas-focus-actions">
                {selected.reportId && onOpenReport && (
                  <button className="export-button" onClick={() => onOpenReport(selected.reportId!)}>
                    <FileText size={13} /> Тайланг нээх
                  </button>
                )}
                {selected.trackId && onOpenTrack && (
                  <button className="export-button" onClick={() => onOpenTrack(selected.trackId!)}>
                    <Target size={13} /> Track-ыг нээх
                  </button>
                )}
                {selected.url && (
                  <a className="export-button" href={selected.url} target="_blank" rel="noreferrer">
                    Эх сурвалж <ArrowUpRight size={13} />
                  </a>
                )}
              </div>
              <div className="section-kicker atlas-focus-kicker">Холбоос ({neighbours.length})</div>
              <div className="atlas-neighbours">
                {neighbours.length ? (
                  neighbours.map(node => (
                    <button
                      key={node.id}
                      className={`atlas-neighbour graph-node--${node.kind}`}
                      onClick={() => setSelected(node)}
                    >
                      {node.label}
                      {node.detail ? <small>{node.detail}</small> : null}
                    </button>
                  ))
                ) : (
                  <p className="tiny">Зангилаа сонгоогүй эсвэл холбоос алга.</p>
                )}
              </div>
            </>
          ) : (
            <p className="atlas-hint">
              Зангилаа дээр дарж фокус хийнэ үү. Хулганы дугуйгаар томруулж, чирж
              шилжүүлнэ. <b>Давхар дарвал</b> тайлан/track руу шууд шилжинэ.
            </p>
          )}
          <div className="atlas-stats">
            <div>
              <strong>{graph.nodes.length}</strong>
              <small>зангилаа</small>
            </div>
            <div>
              <strong>{graph.edges.length}</strong>
              <small>холбоос</small>
            </div>
            <div>
              <strong>{filtered.length}</strong>
              <small>тайлан</small>
            </div>
          </div>
          {hiddenCount > 0 && (
            <p className="tiny">
              Атлас хамгийн ихдээ 120 тайлан зурдаг — {hiddenCount} тайлан шүүлтээр нуугдсан.
            </p>
          )}
        </aside>
      </div>
    </div>
  );
}
