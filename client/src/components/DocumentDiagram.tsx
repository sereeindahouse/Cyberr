import { ReactNode, useEffect, useMemo, useState } from "react";
import { FileText, GitBranch, Network, RotateCcw, Sparkles, Waypoints } from "lucide-react";
import type {
  DiagramKind,
  PositionedGraph,
  PositionedNode,
} from "@/lib/visualModel";
import {
  applyEdit,
  addEdge as editAddEdge,
  addNode as editAddNode,
  clearEdit,
  moveNode as editMoveNode,
  renameNode as editRenameNode,
  removeEdge as editRemoveEdge,
  removeNode as editRemoveNode,
  newNodeId,
  readEdit,
  writeEdit,
  type GraphEdit,
} from "@/lib/graphEdits";
import GraphCanvas from "./GraphCanvas";
import type { Insight } from "../../../server/insights";

export const DIAGRAM_KINDS: { key: DiagramKind; label: string; icon: typeof Network; hint: string }[] = [
  { key: "mindmap", label: "Mind-map", icon: Waypoints, hint: "Гарчиг (##/###) бүтцээр салаалсан мод" },
  { key: "flowchart", label: "Flowchart", icon: GitBranch, hint: "Дугаарлагдсан алхмуудын дараалал" },
  { key: "network", label: "Network", icon: Network, hint: "Гол ойлголтууд ба хамтдаа тохиолдох холбоос" },
  { key: "tree", label: "Tree", icon: Waypoints, hint: "Roadmap track: track → section → item" },
];

export type DocumentDiagramProps = {
  title: string;
  subtitle?: string;
  graph: PositionedGraph;
  kind: DiagramKind;
  /** Which diagram kinds the current source supports. */
  kinds?: DiagramKind[];
  onKindChange?: (kind: DiagramKind) => void;
  onOpenReport?: (reportId: number) => void;
  onOpenTrack?: (trackId: string) => void;
  /** Extra buttons (e.g. the optional AI analysis) rendered in the header. */
  actions?: ReactNode;
  exportName?: string;
  height?: number;
  editKeyName: string;
  aiInsight?: Insight | null;
  onRefreshInsights?: () => void;
  refreshing?: boolean;
};

/**
 * Document-to-Diagram ("Диаграм") — the shared shell for every diagram view:
 * kind switcher + pan/zoom canvas + a footer describing the selected node.
 */
export default function DocumentDiagram({
  title,
  subtitle,
  graph,
  kind,
  kinds,
  onKindChange,
  onOpenReport,
  onOpenTrack,
  actions,
  exportName = "diagram",
  height = 560,
  editKeyName,
  aiInsight,
  onRefreshInsights,
  refreshing = false,
}: DocumentDiagramProps) {
  const available = useMemo(
    () => DIAGRAM_KINDS.filter(item => !kinds || kinds.includes(item.key)),
    [kinds]
  );
  const [selected, setSelected] = useState<PositionedNode | null>(null);
  const [editable, setEditable] = useState(false);
  const [edit, setEdit] = useState<GraphEdit>(() => readEdit(editKeyName));

  const updateEdit = (next: GraphEdit) => {
    setEdit(next);
    writeEdit(editKeyName, next);
  };

  useEffect(() => {
    setEdit(readEdit(editKeyName));
  }, [editKeyName]);

  // Selection from a previous source must not leak into the next diagram.
  useEffect(() => {
    setSelected(null);
  }, [graph, editKeyName]);

  const positioned = useMemo(() => applyEdit(graph, edit), [graph, edit]);

  const activeHint = available.find(item => item.key === kind)?.hint;

  return (
    <div className="diagram-module">
      <div className="diagram-header">
        <div>
          <div className="section-kicker">{subtitle ?? "Диаграм"}</div>
          <h2>{title}</h2>
          {activeHint && <p className="tiny">{activeHint}</p>}
        </div>
        <div className="diagram-header-actions">
          <button
            className={`secondary-button ${editable ? "active" : ""}`}
            onClick={() => setEditable(v => !v)}
          >
            Диаграмыг өөрчлөх
          </button>
          {editable && (
            <button
              className="quiet-button"
              onClick={() => {
                clearEdit(editKeyName);
                setEdit(readEdit(editKeyName));
              }}
            >
              <RotateCcw size={13} /> Анхны байрлалд буцаах
            </button>
          )}
          {actions}
        </div>
      </div>

      {aiInsight && (
        <div className="ai-summary-card">
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <span className="ai-badge">
              {aiInsight.provider === "moonshot" ? `Moonshot/Kimi · ${aiInsight.provider}` : "Орон нутгийн шинжилгээ"}
            </span>
            {onRefreshInsights && (
              <button className="text-button" onClick={onRefreshInsights} disabled={refreshing}>
                <RotateCcw size={12} className={refreshing ? "spin" : ""} /> Дахин шинжлэх
              </button>
            )}
          </div>
          <p>{aiInsight.summary}</p>
          {aiInsight.concepts?.length > 0 && (
            <div className="ai-concept-row">
              {aiInsight.concepts.map((c, i) => (
                <span key={`${c}-${i}`} className="ai-concept">
                  #{c}
                </span>
              ))}
            </div>
          )}
          {aiInsight.steps?.length > 0 && (
            <ol className="ai-steps">
              {aiInsight.steps.map((step, idx) => (
                <li key={`${idx}-${step}`}>{step}</li>
              ))}
            </ol>
          )}
        </div>
      )}

      {onKindChange && available.length > 1 && (
        <div className="diagram-kinds" role="tablist" aria-label="Диаграмын төрөл">
          {available.map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.key}
                role="tab"
                aria-selected={kind === item.key}
                className={`diagram-kind ${kind === item.key ? "active" : ""}`}
                onClick={() => onKindChange(item.key)}
                title={item.hint}
              >
                <Icon size={13} /> {item.label}
              </button>
            );
          })}
        </div>
      )}

      <GraphCanvas
        graph={positioned}
        selectedId={selected?.id ?? null}
        onSelect={setSelected}
        onOpenNode={node => {
          if (node.reportId && onOpenReport) onOpenReport(node.reportId);
          else if (node.trackId && onOpenTrack) onOpenTrack(node.trackId);
          else if (node.url) window.open(node.url, "_blank", "noopener,noreferrer");
        }}
        height={height}
        exportName={exportName}
        emptyLabel="Энэ диаграмыг зурахад хангалттай бүтэц олдсонгүй."
        editable={editable}
        onMoveNode={(id, x, y) => updateEdit(editMoveNode(edit, id, x, y))}
        onRenameNode={(id, label) => updateEdit(editRenameNode(edit, id, label))}
        onAddNode={() => {
          const id = newNodeId("custom");
          const nodeKind = kind === "tree" ? "item" : "step";
          updateEdit(
            editAddNode(edit, {
              id,
              label: `Шинэ ${edit.addedNodes.length + 1}`,
              kind: nodeKind as any,
              x: positioned.width / 2 + (Math.random() * 80 - 40),
              y: positioned.height / 2 + (Math.random() * 80 - 40),
            })
          );
        }}
        onDeleteNode={id => updateEdit(editRemoveNode(edit, id))}
        onAddEdge={(s, t) => updateEdit(editAddEdge(edit, s, t))}
        onDeleteEdge={id => updateEdit(editRemoveEdge(edit, id))}
        onResetLayout={() => {
          clearEdit(editKeyName);
          setEdit(readEdit(editKeyName));
        }}
      />

      <div className="diagram-footer">
        {selected ? (
          <>
            <span className={`diagram-dot graph-node--${selected.kind}`} />
            <strong>{selected.label}</strong>
            {selected.detail && <span>{selected.detail}</span>}
            {selected.reportId && onOpenReport && (
              <button
                className="text-button"
                onClick={() => onOpenReport(selected.reportId!)}
              >
                <FileText size={12} /> Тайланг нээх
              </button>
            )}
            {selected.trackId && onOpenTrack && (
              <button
                className="text-button"
                onClick={() => onOpenTrack(selected.trackId!)}
              >
                <FileText size={12} /> Track нээх
              </button>
            )}
            {selected.url && (
              <a className="text-button" href={selected.url} target="_blank" rel="noreferrer">
                Холбоос
              </a>
            )}
          </>
        ) : (
          <span className="tiny">
            <Sparkles size={11} /> Зангилаа сонгоход дэлгэрэнгүй энд харагдана. Хулганы
            дугуй = томруулах, чирэх = шилжүүлэх, давхар дарах = нээх.
          </span>
        )}
      </div>
      {editable && <p className="diagram-edited-note">Засварлах горим — өөрчлөлтүүд локалд хадгалагдана, layout шинэчлэгдсэн ч устахгүй.</p>}
    </div>
  );
}
