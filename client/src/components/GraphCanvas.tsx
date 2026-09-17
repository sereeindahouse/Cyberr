import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Maximize2, Minimize2, ZoomIn, ZoomOut } from "lucide-react";
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
}: GraphCanvasProps) {
  const { theme } = useTheme();
  const palette = useMemo(() => graphPalette(theme), [theme]);
  const viewportRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [view, setView] = useState<View>({ x: 0, y: 0, w: 1000, h: 600 });
  const [expanded, setExpanded] = useState(false);
  const dragRef = useRef<{ x: number; y: number; view: View } | null>(null);

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

  // Scroll guard: while the canvas is expanded the page behind it must not
  // scroll (wheel-zoom and drag both happen inside the overlay).
  useEffect(() => {
    if (!expanded) return;
    document.body.classList.add("graph-modal-open");
    return () => document.body.classList.remove("graph-modal-open");
  }, [expanded]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && expanded) setExpanded(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [expanded]);

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

  const onPointerDown = (event: React.PointerEvent<SVGSVGElement>) => {
    if (event.button !== 0) return;
    dragRef.current = { x: event.clientX, y: event.clientY, view };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: React.PointerEvent<SVGSVGElement>) => {
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
    dragRef.current = null;
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
          </defs>

          {/* Edges first so nodes paint on top of them. */}
          <g>
            {graph.edges.map(edge => {
              const from = graph.nodes.find(node => node.id === edge.source);
              const to = graph.nodes.find(node => node.id === edge.target);
              if (!from || !to) return null;
              const a = borderPoint(from, to.x, to.y);
              const b = borderPoint(to, from.x, from.y);
              return (
                <path
                  key={edge.id}
                  className="graph-edge"
                  d={curve(a, b)}
                  fill="none"
                  stroke={palette.edge}
                  strokeWidth={1.4}
                  strokeDasharray={edge.dashed ? "4 4" : undefined}
                  opacity={edge.dashed ? 0.65 : 1}
                  markerEnd={edge.dashed ? undefined : "url(#graph-arrow)"}
                />
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
              return (
                <g
                  key={node.id}
                  className={`graph-node graph-node--${node.kind} ${isSelected ? "selected" : ""}`}
                  tabIndex={0}
                  role="button"
                  aria-label={node.detail ? `${node.label} — ${node.detail}` : node.label}
                  data-selection={isSelected ? "true" : undefined}
                  onPointerDown={event => event.stopPropagation()}
                  onClick={() => onSelect?.(node)}
                  onDoubleClick={() => onOpenNode?.(node)}
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
                    stroke={isSelected ? palette.selected : style.stroke}
                    strokeWidth={isSelected ? 2 : 1}
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
