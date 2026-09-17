import { ReactNode, useEffect, useMemo, useState } from "react";
import { FileText, GitBranch, Network, Sparkles, Waypoints } from "lucide-react";
import type {
  DiagramKind,
  PositionedGraph,
  PositionedNode,
} from "@/lib/visualModel";
import GraphCanvas from "./GraphCanvas";

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
  /** Extra buttons (e.g. the optional AI analysis) rendered in the header. */
  actions?: ReactNode;
  exportName?: string;
  height?: number;
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
  actions,
  exportName = "diagram",
  height = 560,
}: DocumentDiagramProps) {
  const available = useMemo(
    () => DIAGRAM_KINDS.filter(item => !kinds || kinds.includes(item.key)),
    [kinds]
  );
  const [selected, setSelected] = useState<PositionedNode | null>(null);

  // Selection from a previous source must not leak into the next diagram.
  useEffect(() => {
    setSelected(null);
  }, [graph]);

  const activeHint = available.find(item => item.key === kind)?.hint;

  return (
    <div className="diagram-module">
      <div className="diagram-header">
        <div>
          <div className="section-kicker">{subtitle ?? "Диаграм"}</div>
          <h2>{title}</h2>
          {activeHint && <p className="tiny">{activeHint}</p>}
        </div>
        <div className="diagram-header-actions">{actions}</div>
      </div>

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
        graph={graph}
        selectedId={selected?.id ?? null}
        onSelect={setSelected}
        onOpenNode={node => {
          if (node.reportId && onOpenReport) onOpenReport(node.reportId);
          else if (node.url) window.open(node.url, "_blank", "noopener,noreferrer");
        }}
        height={height}
        exportName={exportName}
        emptyLabel="Энэ диаграмыг зурахад хангалттай бүтэц олдсонгүй."
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
    </div>
  );
}
