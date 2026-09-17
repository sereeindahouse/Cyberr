import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Link2, Maximize2, Minimize2, Plus, RotateCcw, ZoomIn, ZoomOut } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import type {
  NodeKind,
  PositionedGraph,
  PositionedNode,
} from "@/lib/visualModel";

export type NodeStyle = { fill: string; stroke: string; text: string };

export type GraphPalette = {
  canvas: string;
  edge: string;
  edgeLabel: string;
  selected: string;
  done: NodeStyle;
  node: Record<NodeKind, NodeStyle>;
};

/**
 * Colours live in JS (not only CSS) on purpose: the "SVG export" feature
 * serialises the live <svg>, and a standalone file cannot see the app's
 * stylesheet. Presentation attributes therefore carry the palette.
 */
export function graphPalette(theme: "light" | "dark"): GraphPalette {
  if (theme === "dark") {
    return {
      canvas: "#0f1510",
      edge: "#3a4a3b",
      edgeLabel: "#8a978a",
      selected: "#74c295",
      done: { fill: "#1e2f23", stroke: "#3f6b4f", text: "#dae4d7" },
      node: {
        root: { fill: "#74c295", stroke: "#8fd7ae", text: "#0c110d" },
        topic: { fill: "#16201a", stroke: "#2f5a3f", text: "#c6d4c5" },
        step: { fill: "#15221a", stroke: "#24402f", text: "#c6d4c5" },
        concept: { fill: "#1a241c", stroke: "#29382b", text: "#a9b8a8" },
        track: { fill: "#1f3527", stroke: "#2f5a3f", text: "#dae4d7" },
        section: { fill: "#16201a", stroke: "#29382b", text: "#c6d4c5" },
        item: { fill: "#141c15", stroke: "#232f26", text: "#a9b8a8" },
        report: { fill: "#132018", stroke: "#24402f", text: "#c6d4c5" },
        tag: { fill: "#33271b", stroke: "#4a3a26", text: "#d9a05c" },
      },
    };
  }
  return {
    canvas: "#f7f8f5",
    edge: "#b9c4bb",
    edgeLabel: "#7f8781",
    selected: "#276c4f",
    done: { fill: "#dbeade", stroke: "#276c4f", text: "#1b201d" },
    node: {
      root: { fill: "#276c4f", stroke: "#1f5a41", text: "#ffffff" },
      topic: { fill: "#edf1ed", stroke: "#c7ddca", text: "#3e4a42" },
      step: { fill: "#f0f6f0", stroke: "#c7ddca", text: "#3e4a42" },
      concept: { fill: "#e2e9e2", stroke: "#cbd2cc", text: "#536059" },
      track: { fill: "#dbeade", stroke: "#a8c9ad", text: "#1b201d" },
      section: { fill: "#eef2ee", stroke: "#cbd2cc", text: "#2c3a30" },
      item: { fill: "#f7f8f5", stroke: "#dfe4df", text: "#536059" },
      report: { fill: "#eef5ee", stroke: "#c7ddca", text: "#2c3a30" },
      tag: { fill: "#f4e4d4", stroke: "#e0c9ad", text: "#a36b38" },
    },
  };
}

const MIN_SCALE = 0.2;
const MAX_SCALE = 4;

type View = { x: number; y: number; w: number; h: number };

export type GraphCanvasProps = {
  graph: PositionedGraph;
  selectedId?: string | null;
  onSelect?: (node: PositionedNode) => void;
  /** Double-click / "open" action (e.g. jump to the report). */
  onOpenNode?: (node: PositionedNode) => void;
  height?: number;
  expandedHeight?: number;
  emptyLabel?: string;
  /** File name (without extension) for the SVG export. */
  exportName?: string;
  editable?: boolean;
  onMoveNode?: (id: string, x: number, y: number) => void;
  onRenameNode?: (id: string, label: string) => void;
  onAddNode?: () => void;
  onDeleteNode?: (id: string) => void;
  onAddEdge?: (source: string, target: string) => void;
  onDeleteEdge?: (edgeId: string) => void;
  onResetLayout?: () => void;
};

export default function GraphCanvas({
  graph,
  selectedId,
  onSelect,
  onOpenNode,
  height = 520,
  expandedHeight,
  emptyLabel = "Диаграм зурахад хангалттай өгөгдөл алга.",
  exportName = "diagram",
  editable = false,
  onMoveNode,
  onRenameNode,
  onAddNode,
  onDeleteNode,
  onAddEdge,
  onDeleteEdge,
  onResetLayout,
}: GraphCanvasProps) {
  const { theme } = useTheme();
  const palette = useMemo(() => graphPalette(theme), [theme]);
  const viewportRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [view, setView] = useState<View>({ x: 0, y: 0, w: 1000, h: 600 });
  const [expanded, setExpanded] = useState(false);
  const dragRef = useRef<{ x: number; y: number; view: View } | null>(null);

  // editable states
  const [connectFrom, setConnectFrom] = useState<string | null>(null);
  const [connectMode, setConnectMode] = useState(false);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [renameId, setRenameId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const nodeDragRef = useRef<{
    id: string;
    startX: number;
    startY: number;
    origX: number;
    origY: number;
    scale: number;
  } | null>(null);

  const bounds = useMemo(
    () => ({
      x: 0,
      y: 0,
      w: Math.max(320, graph.width || 320),
      h: Math.max(240, graph.height || 240),
    }),
    [graph.width, graph.height]
  );

  const fit = useCallback(() => {
    setView({ x: bounds.x, y: bounds.y, w: bounds.w, h: bounds.h });
  }, [bounds]);

  // Re-fit whenever the graph itself changes (new report, new kind, filter…).
  useEffect(() => {
    fit();
  }, [fit]);

  // Clear selections when graph changes
  useEffect(() => {
    setSelectedEdgeId(null);
    setConnectFrom(null);
    setConnectMode(false);
    setRenameId(null);
  }, [graph]);

  // Scroll guard: while the canvas is expanded the page behind it must not
  // scroll (wheel-zoom and drag both happen inside the overlay).
  useEffect(() => {
    if (!expanded) return;
    document.body.classList.add("graph-modal-open");
    return () => document.body.classList.remove("graph-modal-open");
  }, [expanded]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && expanded) {
        setExpanded(false);
        return;
      }
      const target = event.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) {
        if (event.key === "Escape" && renameId) {
          setRenameId(null);
        }
        return;
      }
      if (event.key === "Delete" || event.key === "Backspace") {
        if (selectedEdgeId && onDeleteEdge) {
          onDeleteEdge(selectedEdgeId);
          setSelectedEdgeId(null);
        } else if (selectedId && onDeleteNode) {
          onDeleteNode(selectedId);
        }
      }
      if (event.key === "Escape") {
        if (renameId) setRenameId(null);
        if (connectMode) {
          setConnectMode(false);
          setConnectFrom(null);
        }
        if (selectedEdgeId) setSelectedEdgeId(null);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [expanded, selectedEdgeId, selectedId, onDeleteEdge, onDeleteNode, renameId, connectMode]);

  /** Pixel → viewBox mapping that respects `preserveAspectRatio="xMidYMid meet"`. */
  const metrics = useCallback(() => {
    const el = viewportRef.current;
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    const scale = Math.min(rect.width / view.w, rect.height / view.h) || 1;
    const contentW = view.w * scale;
    const contentH = view.h * scale;
    return {
      rect,
      scale,
      offsetX: (rect.width - contentW) / 2,
      offsetY: (rect.height - contentH) / 2,
      contentW,
      contentH,
    };
  }, [view]);

  const zoomAt = useCallback(
    (factor: number, clientX?: number, clientY?: number) => {
      const m = metrics();
      if (!m) return;
      const fx =
        clientX === undefined
          ? 0.5
          : clamp((clientX - m.rect.left - m.offsetX) / (m.contentW || 1), 0, 1);
      const fy =
        clientY === undefined
          ? 0.5
          : clamp((clientY - m.rect.top - m.offsetY) / (m.contentH || 1), 0, 1);
      setView(current => {
        const nextW = clamp(current.w / factor, bounds.w / MAX_SCALE, bounds.w / MIN_SCALE);
        const nextH = (nextW / current.w) * current.h;
        // Keep the point under the cursor anchored while zooming.
        const dx = (current.w - nextW) * fx;
        const dy = (current.h - nextH) * fy;
        return { x: current.x + dx, y: current.y + dy, w: nextW, h: nextH };
      });
    },
    [bounds, metrics]
  );

  // Wheel must be a non-passive native listener to be able to preventDefault
  // (React's onWheel is passive, so the page would scroll behind the canvas).
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      const factor = event.deltaY < 0 ? 1.12 : 1 / 1.12;
      zoomAt(factor, event.clientX, event.clientY);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [zoomAt]);

  const startNodeDrag = useCallback(
    (node: PositionedNode, event: React.PointerEvent) => {
      if (!editable) return;
      if (connectMode) return;
      if (renameId) return;
      event.stopPropagation();
      const m = metrics();
      nodeDragRef.current = {
        id: node.id,
        startX: event.clientX,
        startY: event.clientY,
        origX: node.x,
        origY: node.y,
        scale: m?.scale ?? 1,
      };
      (event.currentTarget as Element).setPointerCapture?.(event.pointerId);
    },
    [editable, connectMode, renameId, metrics]
  );

  const onPointerDown = (event: React.PointerEvent<SVGSVGElement>) => {
    if (event.button !== 0) return;
    if (nodeDragRef.current) return;
    dragRef.current = { x: event.clientX, y: event.clientY, view };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: React.PointerEvent<SVGSVGElement>) => {
    const nodeDrag = nodeDragRef.current;
    if (nodeDrag) {
      const m = metrics();
      const scale = m?.scale ?? nodeDrag.scale ?? 1;
      const dx = (event.clientX - nodeDrag.startX) / scale;
      const dy = (event.clientY - nodeDrag.startY) / scale;
      onMoveNode?.(nodeDrag.id, nodeDrag.origX + dx, nodeDrag.origY + dy);
      return;
    }
    const drag = dragRef.current;
    const m = metrics();
    if (!drag || !m || !m.scale) return;
    const dx = (event.clientX - drag.x) / m.scale;
    const dy = (event.clientY - drag.y) / m.scale;
    setView({ ...drag.view, x: drag.view.x - dx, y: drag.view.y - dy });
  };

  const endDrag = (event: React.PointerEvent<SVGSVGElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    if (nodeDragRef.current) {
      nodeDragRef.current = null;
    }
    dragRef.current = null;
  };

  const handleNodeClick = (node: PositionedNode) => {
    if (connectMode) {
      if (!connectFrom) {
        setConnectFrom(node.id);
      } else {
        if (connectFrom !== node.id) {
          onAddEdge?.(connectFrom, node.id);
        }
        setConnectFrom(null);
        setConnectMode(false);
      }
      return;
    }
    onSelect?.(node);
    setSelectedEdgeId(null);
  };

  const exportSvg = () => {
    const svg = svgRef.current;
    if (!svg) return;
    const clone = svg.cloneNode(true) as SVGSVGElement;
    clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    clone.setAttribute("viewBox", `0 0 ${Math.round(bounds.w)} ${Math.round(bounds.h)}`);
    clone.setAttribute("width", String(Math.round(bounds.w)));
    clone.setAttribute("height", String(Math.round(bounds.h)));
    clone.setAttribute(
      "style",
      "font-family: 'Manrope', ui-sans-serif, system-ui, sans-serif;"
    );
    clone.querySelectorAll("[data-selection='true']").forEach(node => {
      node.removeAttribute("data-selection");
    });
    // Remove hit paths
    clone.querySelectorAll(".graph-edge-hit").forEach(n => n.remove());
    const background = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    background.setAttribute("x", "0");
    background.setAttribute("y", "0");
    background.setAttribute("width", String(Math.round(bounds.w)));
    background.setAttribute("height", String(Math.round(bounds.h)));
    background.setAttribute("fill", palette.canvas);
    clone.insertBefore(background, clone.firstChild);
    const source = `<?xml version="1.0" encoding="UTF-8"?>\n${new XMLSerializer().serializeToString(clone)}`;
    const blob = new Blob([source], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${slugFile(exportName)}.svg`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const selectedNode = selectedId ? graph.nodes.find(n => n.id === selectedId) ?? null : null;

  const canvas = (
    <div
      className={`graph-viewport ${expanded ? "expanded" : ""}`}
      ref={viewportRef}
      style={{ height: expanded ? expandedHeight ?? "72vh" : height }}
    >
      {graph.nodes.length === 0 ? (
        <div className="graph-empty">{emptyLabel}</div>
      ) : (
        <svg
          ref={svgRef}
          className="graph-svg"
          role="img"
          aria-label={graph.title}
          viewBox={`${view.x} ${view.y} ${view.w} ${view.h}`}
          preserveAspectRatio="xMidYMid meet"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerLeave={endDrag}
          onPointerCancel={endDrag}
        >
          <defs>
            <marker
              id="graph-arrow"
              viewBox="0 0 10 10"
              refX="9"
              refY="5"
              markerWidth="7"
              markerHeight="7"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill={palette.edge} />
            </marker>
            <marker
              id="graph-arrow-selected"
              viewBox="0 0 10 10"
              refX="9"
              refY="5"
              markerWidth="7"
              markerHeight="7"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill={palette.selected} />
            </marker>
          </defs>

          {/* Edges first so nodes paint on top of them. */}
          <g>
            {graph.edges.map(edge => {
              const from = graph.nodes.find(node => node.id === edge.source);
              const to = graph.nodes.find(node => node.id === edge.target);
              if (!from || !to) return null;
              const a = borderPoint(from, to.x, to.y);
              const b = borderPoint(to, from.x, from.y);
              const isSelectedEdge = selectedEdgeId === edge.id;
              return (
                <g key={edge.id}>
                  <path
                    className="graph-edge"
                    d={curve(a, b)}
                    fill="none"
                    stroke={isSelectedEdge ? palette.selected : palette.edge}
                    strokeWidth={isSelectedEdge ? 2.4 : 1.4}
                    strokeDasharray={edge.dashed ? "4 4" : undefined}
                    opacity={edge.dashed ? 0.65 : 1}
                    markerEnd={
                      edge.dashed ? undefined : isSelectedEdge ? "url(#graph-arrow-selected)" : "url(#graph-arrow)"
                    }
                  />
                  {editable && (
                    <path
                      className="graph-edge-hit"
                      d={curve(a, b)}
                      fill="none"
                      stroke="transparent"
                      strokeWidth={14}
                      onPointerDown={e => e.stopPropagation()}
                      onClick={e => {
                        e.stopPropagation();
                        setSelectedEdgeId(edge.id);
                      }}
                    />
                  )}
                </g>
              );
            })}
          </g>

          {/* Nodes */}
          <g>
            {graph.nodes.map(node => {
              const style = node.done
                ? palette.done
                : palette.node[node.kind] ?? palette.node.topic;
              const isSelected = selectedId === node.id;
              const isConnectFrom = connectFrom === node.id;
              return (
                <g
                  key={node.id}
                  className={`graph-node graph-node--${node.kind} ${isSelected ? "selected" : ""} ${isConnectFrom ? "connect-from" : ""}`}
                  tabIndex={0}
                  role="button"
                  aria-label={node.detail ? `${node.label} — ${node.detail}` : node.label}
                  data-selection={isSelected ? "true" : undefined}
                  onPointerDown={e => startNodeDrag(node, e)}
                  onClick={e => {
                    e.stopPropagation();
                    handleNodeClick(node);
                  }}
                  onDoubleClick={e => {
                    e.stopPropagation();
                    onOpenNode?.(node);
                  }}
                  onPointerUp={e => {
                    if (nodeDragRef.current) {
                      (e.currentTarget as Element).releasePointerCapture?.(e.pointerId);
                      nodeDragRef.current = null;
                    }
                  }}
                  onKeyDown={event => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      onSelect?.(node);
                    }
                    if (event.key === "Enter" && event.metaKey) onOpenNode?.(node);
                  }}
                >
                  <rect
                    x={node.x - node.width / 2}
                    y={node.y - node.height / 2}
                    width={node.width}
                    height={node.height}
                    rx={7}
                    fill={style.fill}
                    stroke={isConnectFrom ? palette.selected : isSelected ? palette.selected : style.stroke}
                    strokeWidth={isSelected || isConnectFrom ? 2.5 : 1}
                  />
                  <text
                    x={node.x}
                    y={node.y + 1}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize={node.kind === "root" ? 12 : 11}
                    fontWeight={node.kind === "root" || node.kind === "track" ? 700 : 500}
                    fill={style.text}
                  >
                    {node.label}
                  </text>
                  {node.done ? (
                    <circle
                      cx={node.x - node.width / 2 + 8}
                      cy={node.y - node.height / 2 + 8}
                      r={3}
                      fill={palette.selected}
                    />
                  ) : null}
                </g>
              );
            })}
          </g>
        </svg>
      )}

      <div className="graph-toolbar" onPointerDown={event => event.stopPropagation()}>
        {editable && (
          <>
            <button className="graph-tool" onClick={() => onAddNode?.()} title="Зангилаа нэмэх" aria-label="Зангилаа нэмэх">
              <Plus size={14} />
            </button>
            <button
              className={`graph-tool ${connectMode ? "active" : ""}`}
              onClick={() => {
                if (connectMode) {
                  setConnectMode(false);
                  setConnectFrom(null);
                } else {
                  setConnectMode(true);
                  if (selectedId) setConnectFrom(selectedId);
                }
              }}
              title={connectMode ? "Холбох горим идэвхтэй" : "Холбох"}
              aria-label="Холбох"
            >
              <Link2 size={14} />
            </button>
            <button className="graph-tool" onClick={() => onResetLayout?.()} title="Анхны байрлалд буцаах" aria-label="Анхны байрлалд буцаах">
              <RotateCcw size={14} />
            </button>
          </>
        )}
        <button className="graph-tool" onClick={() => zoomAt(1 / 1.2)} title="Жигнэх" aria-label="Жигнэх">
          <ZoomOut size={14} />
        </button>
        <span className="graph-zoom mono">
          {Math.round(clamp(bounds.w / (view.w || 1), MIN_SCALE, MAX_SCALE) * 100)}%
        </span>
        <button className="graph-tool" onClick={() => zoomAt(1.2)} title="Томруулах" aria-label="Томруулах">
          <ZoomIn size={14} />
        </button>
        <button className="graph-tool" onClick={fit} title="Бүхэлд нь харах">
          Fit
        </button>
        <button className="graph-tool" onClick={exportSvg} title="SVG татах">
          SVG
        </button>
        <button
          className="graph-tool"
          onClick={() => setExpanded(current => !current)}
          title={expanded ? "Багасгах" : "Дэлгэц дүүрэн"}
          aria-label={expanded ? "Багасгах" : "Дэлгэц дүүрэн"}
        >
          {expanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
        </button>
      </div>

      {editable && (
        <div className="graph-editbar" onPointerDown={e => e.stopPropagation()}>
          {renameId ? (
            <div className="graph-rename">
              <input
                value={renameValue}
                onChange={e => setRenameValue(e.target.value)}
                placeholder="Нэр оруулна уу"
                autoFocus
                onKeyDown={e => {
                  if (e.key === "Enter") {
                    if (renameValue.trim()) {
                      onRenameNode?.(renameId, renameValue.trim());
                    }
                    setRenameId(null);
                  }
                  if (e.key === "Escape") setRenameId(null);
                }}
              />
              <button
                className="secondary-button"
                onClick={() => {
                  if (renameValue.trim()) onRenameNode?.(renameId, renameValue.trim());
                  setRenameId(null);
                }}
              >
                Хадгалах
              </button>
              <button className="quiet-button" onClick={() => setRenameId(null)}>
                Болих
              </button>
            </div>
          ) : selectedEdgeId ? (
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <span className="graph-hint-strong">Ирмэг сонгогдсон</span>
              <button
                className="graph-tool danger"
                onClick={() => {
                  onDeleteEdge?.(selectedEdgeId);
                  setSelectedEdgeId(null);
                }}
              >
                Устгах
              </button>
            </div>
          ) : selectedNode ? (
            <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
              <span className="graph-hint-strong">{selectedNode.label}</span>
              <button
                className="graph-tool"
                onClick={() => {
                  setRenameId(selectedNode.id);
                  setRenameValue(selectedNode.label);
                }}
              >
                Нэрлэх
              </button>
              <button
                className="graph-tool"
                onClick={() => {
                  setConnectMode(true);
                  setConnectFrom(selectedNode.id);
                }}
              >
                Холбох
              </button>
              <button className="graph-tool danger" onClick={() => onDeleteNode?.(selectedNode.id)}>
                Устгах
              </button>
            </div>
          ) : connectMode ? (
            <span className="graph-hint">
              <span className="graph-hint-strong">Холбох горим:</span>{" "}
              {connectFrom ? "Хоёр дахь зангилааг сонгоно уу" : "Эхний зангилааг сонгоно уу"} — Esc дарж болих
            </span>
          ) : (
            <span className="graph-hint">Зангилаа чирж байрлуулна. Давхар дарж нээнэ. Delete дарж устгана.</span>
          )}
        </div>
      )}
    </div>
  );

  if (expanded) {
    return (
      <div className="graph-modal" role="dialog" aria-modal="true" aria-label={graph.title}>
        <div className="graph-modal-inner">{canvas}</div>
      </div>
    );
  }

  return canvas;
}

/* ------------------------------------------------------------------ */

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function slugFile(value: string): string {
  return (
    value
      .toLowerCase()
      .replace(/[^\p{L}\p{N}]+/gu, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "diagram"
  );
}

/** Point where the line to (tx, ty) leaves the node's box. */
function borderPoint(
  node: PositionedNode,
  tx: number,
  ty: number
): { x: number; y: number } {
  const dx = tx - node.x;
  const dy = ty - node.y;
  if (!dx && !dy) return { x: node.x, y: node.y };
  const halfW = node.width / 2 + 3;
  const halfH = node.height / 2 + 3;
  const scale = Math.min(
    Math.abs(dx) > 0.01 ? halfW / Math.abs(dx) : Infinity,
    Math.abs(dy) > 0.01 ? halfH / Math.abs(dy) : Infinity
  );
  const k = Number.isFinite(scale) ? Math.min(scale, 1) : 1;
  return { x: node.x + dx * k, y: node.y + dy * k };
}

/** Cubic connector that bends along the dominant axis. */
function curve(
  a: { x: number; y: number },
  b: { x: number; y: number }
): string {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  if (Math.abs(dx) >= Math.abs(dy)) {
    const bend = dx / 2;
    return `M ${a.x} ${a.y} C ${a.x + bend} ${a.y}, ${b.x - bend} ${b.y}, ${b.x} ${b.y}`;
  }
  const bend = dy / 2;
  return `M ${a.x} ${a.y} C ${a.x} ${a.y + bend}, ${b.x} ${b.y - bend}, ${b.x} ${b.y}`;
}
