import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, Crosshair, FileText, Hash, RotateCcw, Sparkles, Target } from "lucide-react";
import type { Track } from "@/data/roadmapTracks";
import {
  buildAtlasGraph,
  layoutGraph,
  slug,
  truncateLabel,
  type DiagramReport,
  type PositionedNode,
  type GraphEdge,
} from "@/lib/visualModel";
import {
  applyEdit,
  addEdge as editAddEdge,
  addNode as editAddNode,
  clearEdit,
  editKey,
  moveNode as editMoveNode,
  newNodeId,
  readEdit,
  removeEdge as editRemoveEdge,
  removeNode as editRemoveNode,
  renameNode as editRenameNode,
  writeEdit,
  type GraphEdit,
} from "@/lib/graphEdits";
import GraphCanvas from "./GraphCanvas";

export type AtlasInsights = {
  snapshot: InsightsSnapshot;
  insights: Insight[];
  relations: Relation[];
};

// type-only imports to avoid bundling server code
import type { Insight, InsightsSnapshot, Relation } from "../../../server/insights";

export type KnowledgeAtlasProps = {
  reports: DiagramReport[];
  tracks: Track[];
  trackProgress?: Record<string, boolean>;
  onOpenReport?: (reportId: number) => void;
  onOpenTrack?: (trackId: string) => void;
  insights?: AtlasInsights | null;
  onRefreshInsights?: () => void;
  refreshing?: boolean;
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
  insights,
  onRefreshInsights,
  refreshing = false,
}: KnowledgeAtlasProps) {
  const [query, setQuery] = useState("");
  const [source, setSource] = useState<"All" | (typeof SOURCES)[number]>("All");
  const [showTags, setShowTags] = useState(true);
  const [showAiLinks, setShowAiLinks] = useState(true);
  const [selected, setSelected] = useState<PositionedNode | null>(null);
  const [editable, setEditable] = useState(false);
  const [edit, setEdit] = useState<GraphEdit>(() => readEdit(editKey.atlas()));

  const updateEdit = (next: GraphEdit) => {
    setEdit(next);
    writeEdit(editKey.atlas(), next);
  };

  useEffect(() => {
    setEdit(readEdit(editKey.atlas()));
  }, []);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return reports.filter(report => {
      if (source !== "All" && report.source !== source) return false;
      if (!needle) return true;
      const haystack = `${report.title} ${report.stage} ${report.room ?? ""} ${(report.tags ?? []).join(" ")}`;
      return haystack.toLowerCase().includes(needle);
    });
  }, [reports, query, source]);

  const baseGraph = useMemo(
    () =>
      buildAtlasGraph(filtered, tracks, trackProgress, {
        tagLimit: showTags ? 8 : 0,
        reportLimit: 120,
      }),
    [filtered, tracks, trackProgress, showTags]
  );

  const enrichedGraph = useMemo(() => {
    let nodes = [...baseGraph.nodes];
    let edges: GraphEdge[] = [...baseGraph.edges];

    if (insights?.insights?.length) {
      // Count concepts across insights
      const conceptCounts = new Map<string, number>();
      for (const ins of insights.insights) {
        for (const c of ins.concepts ?? []) {
          const key = c.trim();
          if (!key) continue;
          conceptCounts.set(key, (conceptCounts.get(key) ?? 0) + 1);
        }
      }
      const topConcepts = [...conceptCounts.entries()]
        .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
        .slice(0, 10);

      for (const [concept] of topConcepts) {
        const id = `concept:${slug(concept)}`;
        if (nodes.some(n => n.id === id)) continue;
        nodes.push({
          id,
          label: `#${truncateLabel(concept, 20)}`,
          kind: "concept",
          count: conceptCounts.get(concept),
        });
        edges.push({
          id: `atlas:root->${id}`,
          source: "atlas:root",
          target: id,
        });
      }

      if (showAiLinks && insights.relations?.length) {
        const visibleReportIds = new Set(filtered.map(r => `report:${r.id}`));
        for (const rel of insights.relations) {
          const sourceId = `report:${rel.source}`;
          const targetId = `report:${rel.target}`;
          if (!visibleReportIds.has(sourceId) || !visibleReportIds.has(targetId)) continue;
          const edgeId = `rel:${rel.source}-${rel.target}`;
          if (edges.some(e => e.id === edgeId)) continue;
          edges.push({
            id: edgeId,
            source: sourceId,
            target: targetId,
            dashed: true,
            label: rel.reason ? truncateLabel(rel.reason, 18) : undefined,
          });
        }
      }
    }

    return { ...baseGraph, nodes, edges };
  }, [baseGraph, insights, filtered, showAiLinks]);

  const positionedBase = useMemo(() => layoutGraph(enrichedGraph, "mindmap"), [enrichedGraph]);
  const positioned = useMemo(() => applyEdit(positionedBase, edit), [positionedBase, edit]);

  const neighbours = useMemo(() => {
    if (!selected) return [];
    const ids = new Set<string>();
    for (const edge of enrichedGraph.edges) {
      if (edge.source === selected.id) ids.add(edge.target);
      if (edge.target === selected.id) ids.add(edge.source);
    }
    return [...ids]
      .map(id => positioned.nodes.find(node => node.id === id))
      .filter((node): node is PositionedNode => Boolean(node))
      .slice(0, 40);
  }, [selected, enrichedGraph.edges, positioned.nodes]);

  const hiddenCount = Math.max(0, filtered.length - Math.min(filtered.length, 120));

  return (
    <div className="atlas-module">
      <div className="atlas-toolbar">
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <button
            className={`secondary-button ${editable ? "active" : ""}`}
            onClick={() => setEditable(v => !v)}
          >
            Газрын зургийг өөрчлөх
          </button>
          {editable && (
            <button
              className="quiet-button"
              onClick={() => {
                clearEdit(editKey.atlas());
                setEdit(readEdit(editKey.atlas()));
              }}
            >
              <RotateCcw size={13} /> Өөрчлөлтийг арилгах
            </button>
          )}
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          {insights?.snapshot && (
            <span className="ai-badge" title={`${insights.snapshot.provider} · ${insights.snapshot.analyzed}/${insights.snapshot.total}`}>
              {insights.snapshot.provider === "moonshot" && insights.snapshot.model
                ? `AI (${insights.snapshot.model})`
                : `Орон нутгийн шинжилгээ`}{" "}
              · {insights.snapshot.analyzed}/{insights.snapshot.total}
            </span>
          )}
          {onRefreshInsights && (
            <button className="secondary-button" onClick={onRefreshInsights} disabled={refreshing}>
              <RotateCcw size={13} className={refreshing ? "spin" : ""} /> Дахин шинжлэх
            </button>
          )}
        </div>
      </div>

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
          <button
            className={`atlas-chip ${showAiLinks ? "active" : ""}`}
            onClick={() => setShowAiLinks(v => !v)}
            title="AI холбоосыг харуулах/нуух"
          >
            <Sparkles size={11} /> AI холбоос
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
          editable={editable}
          onMoveNode={(id, x, y) => updateEdit(editMoveNode(edit, id, x, y))}
          onRenameNode={(id, label) => updateEdit(editRenameNode(edit, id, label))}
          onAddNode={() => {
            const id = newNodeId("custom");
            const label = `Шинэ зангилаа ${edit.addedNodes.length + 1}`;
            updateEdit(
              editAddNode(edit, {
                id,
                label,
                kind: "concept",
                x: positioned.width / 2 + (Math.random() * 80 - 40),
                y: positioned.height / 2 + (Math.random() * 80 - 40),
              })
            );
          }}
          onDeleteNode={id => updateEdit(editRemoveNode(edit, id))}
          onAddEdge={(s, t) => updateEdit(editAddEdge(edit, s, t))}
          onDeleteEdge={id => updateEdit(editRemoveEdge(edit, id))}
          onResetLayout={() => {
            clearEdit(editKey.atlas());
            setEdit(readEdit(editKey.atlas()));
          }}
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
              <strong>{enrichedGraph.nodes.length}</strong>
              <small>зангилаа</small>
            </div>
            <div>
              <strong>{enrichedGraph.edges.length}</strong>
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
          {editable && <p className="diagram-edited-note">Засварлах горим идэвхтэй — өөрчлөлтүүд локалд хадгалагдана.</p>}
        </aside>
      </div>
    </div>
  );
}
