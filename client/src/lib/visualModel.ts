/**
 * Round 4 — graph model + layout engine behind two visual modules:
 *
 *   • Knowledge Atlas ("Мэдлэгийн газрын зураг") — concept map over every
 *     report and every roadmap track.
 *   • Document-to-Diagram ("Диаграм") — a report rendered as a mind-map,
 *     flowchart or network diagram; a roadmap track rendered as a tree.
 *
 * Everything here is framework-free (no React, no DOM): the components only
 * draw what these functions return, which keeps the behaviour unit-testable.
 */

import type { Track } from "@/data/roadmapTracks";

/** The subset of a report the visual modules need (keeps this file decoupled
 *  from Home.tsx, which would otherwise create an import cycle). */
export type DiagramReport = {
  id: number;
  title: string;
  source: string;
  stage: string;
  tags: string[];
  content: string;
  excerpt?: string;
  status?: string;
  room?: string;
};

export type NodeKind =
  | "root"
  | "topic"
  | "step"
  | "concept"
  | "track"
  | "section"
  | "item"
  | "report"
  | "tag";

export type GraphNode = {
  id: string;
  label: string;
  kind: NodeKind;
  /** Second line / tooltip text. */
  detail?: string;
  /** Set when the node maps to a report (used by "Тайланг нээх"). */
  reportId?: number;
  /** Set when the node maps to a roadmap track. */
  trackId?: string;
  url?: string;
  done?: boolean;
  count?: number;
};

export type GraphEdge = {
  id: string;
  source: string;
  target: string;
  label?: string;
  /** Cross-links (report → tag) render as dashed lines. */
  dashed?: boolean;
};

export type Graph = {
  id: string;
  title: string;
  nodes: GraphNode[];
  edges: GraphEdge[];
};

export type DiagramKind = "mindmap" | "flowchart" | "network" | "tree";

export type PositionedNode = GraphNode & {
  /** Centre point of the node box. */
  x: number;
  y: number;
  width: number;
  height: number;
  depth: number;
};

export type PositionedGraph = {
  title: string;
  nodes: PositionedNode[];
  edges: GraphEdge[];
  /** Bounding box of the laid-out graph (already normalised so minX/minY = padding). */
  width: number;
  height: number;
};

/* ------------------------------------------------------------------ *
 * Shared markdown helpers (re-exported so callers only need one import)
 * ------------------------------------------------------------------ */

import {
  cleanInline,
  dedupe,
  extractConcepts,
  extractHeadings,
  extractListItems,
  slug,
  truncateLabel,
  type Heading,
  type ListItem,
} from "@shared/textModel";

export {
  cleanInline,
  dedupe,
  extractConcepts,
  extractHeadings,
  extractListItems,
  slug,
  truncateLabel,
};
export type { Heading, ListItem };

/* ------------------------------------------------------------------ *
 * Graph builders
 * ------------------------------------------------------------------ */

function nodeId(prefix: string, seed: string | number): string {
  return `${prefix}:${String(seed)}`;
}

function edgeId(source: string, target: string): string {
  return `${source}->${target}`;
}

/** `##`/`###` structure → mind-map (root on the left, branches to the right). */
export function reportToMindMap(report: DiagramReport): Graph {
  const nodes: GraphNode[] = [
    {
      id: nodeId("root", report.id),
      label: truncateLabel(report.title, 30),
      kind: "root",
      detail: `${report.source} · ${report.stage}`,
      reportId: report.id,
    },
  ];
  const edges: GraphEdge[] = [];
  const headings = extractHeadings(report.content).filter(h => h.level >= 2);

  const addTopic = (text: string, parentId: string, key: string, kind: NodeKind) => {
    const id = nodeId(key, `${report.id}-${nodes.length}`);
    if (nodes.some(node => node.id === id)) return id;
    nodes.push({ id, label: truncateLabel(text), kind, reportId: report.id });
    edges.push({ id: edgeId(parentId, id), source: parentId, target: id });
    return id;
  };

  if (headings.length) {
    const minLevel = Math.min(...headings.map(h => h.level));
    const stack: { level: number; id: string }[] = [
      { level: minLevel - 1, id: nodes[0].id },
    ];
    for (const heading of headings) {
      while (stack.length > 1 && stack[stack.length - 1].level >= heading.level) {
        stack.pop();
      }
      const parent = stack[stack.length - 1].id;
      const id = addTopic(
        heading.text,
        parent,
        "topic",
        heading.level === minLevel ? "topic" : "concept"
      );
      stack.push({ level: heading.level, id });
    }
  } else {
    // No headings — fall back to bullet lists, then tags.
    const bullets = extractListItems(report.content).slice(0, 10);
    const fallbacks = bullets.length
      ? bullets.map(item => item.text)
      : (report.tags ?? []).map(tag => `#${tag}`);
    for (const text of fallbacks.slice(0, 10)) {
      addTopic(text, nodes[0].id, "topic", "topic");
    }
  }

  return { id: `mindmap-${report.id}`, title: report.title, nodes, edges };
}

/** Ordered/bullet steps → sequential flowchart. */
export function reportToFlowchart(report: DiagramReport): Graph {
  const rootId = nodeId("root", report.id);
  const nodes: GraphNode[] = [
    {
      id: rootId,
      label: truncateLabel(report.title, 30),
      kind: "root",
      detail: `${report.source} · ${report.stage}`,
      reportId: report.id,
    },
  ];
  const edges: GraphEdge[] = [];

  const items = extractListItems(report.content);
  const ordered = items.filter(item => item.ordered);
  let steps = (
    ordered.length >= 2
      ? ordered
      : (items.length >= 2
          ? items
          : extractHeadings(report.content)
              .filter(h => h.level >= 2)
              .map(h => ({ ordered: false, text: h.text })))
  ).slice(0, 14);

  // Notes imported from Obsidian often have no lists at all — fall back to the
  // extracted concepts (then the tags) so the flowchart is never a lone node.
  if (!steps.length) {
    steps = extractConcepts(report.content, 6).map(text => ({ ordered: false, text }));
  }
  if (!steps.length) {
    steps = (report.tags ?? []).slice(0, 6).map(tag => ({ ordered: false, text: `#${tag}` }));
  }

  let previous = rootId;
  steps.forEach((step, index) => {
    const id = nodeId("step", `${report.id}-${index}`);
    nodes.push({
      id,
      label: truncateLabel(step.text, 34),
      kind: "step",
      detail: `Алхам ${index + 1}`,
      reportId: report.id,
    });
    edges.push({
      id: edgeId(previous, id),
      source: previous,
      target: id,
      label: String(index + 1),
    });
    previous = id;
  });

  return { id: `flowchart-${report.id}`, title: report.title, nodes, edges };
}

/** Concepts + their co-occurrence → network diagram. */
export function reportToNetwork(report: DiagramReport, conceptLimit = 8): Graph {
  const rootId = nodeId("root", report.id);
  const nodes: GraphNode[] = [
    {
      id: rootId,
      label: truncateLabel(report.title, 30),
      kind: "root",
      detail: `${report.source} · ${report.stage}`,
      reportId: report.id,
    },
  ];
  const edges: GraphEdge[] = [];
  const concepts = dedupe(
    [
      ...(report.tags ?? []).map(tag => tag.replace(/^#/, "")),
      ...extractConcepts(report.content, conceptLimit),
    ],
    conceptLimit
  );

  concepts.forEach(concept => {
    const id = nodeId("concept", `${report.id}-${slug(concept)}`);
    if (nodes.some(node => node.id === id)) return;
    nodes.push({ id, label: truncateLabel(concept, 20), kind: "concept" });
    edges.push({ id: edgeId(rootId, id), source: rootId, target: id });
  });

  // Co-occurrence: two concepts mentioned under the same heading are linked.
  const paragraphs = String(report.content ?? "")
    .split(/\n\s*(?=#{1,6}\s)/)
    .map(chunk => cleanInline(chunk).toLowerCase());
  for (let i = 0; i < concepts.length; i += 1) {
    for (let j = i + 1; j < concepts.length; j += 1) {
      const a = concepts[i].toLowerCase();
      const b = concepts[j].toLowerCase();
      const together = paragraphs.some(
        chunk => chunk.includes(a) && chunk.includes(b)
      );
      if (!together) continue;
      const source = nodeId("concept", `${report.id}-${slug(concepts[i])}`);
      const target = nodeId("concept", `${report.id}-${slug(concepts[j])}`);
      edges.push({ id: edgeId(source, target), source, target, dashed: true });
    }
  }

  return { id: `network-${report.id}`, title: report.title, nodes, edges };
}

/** A roadmap track → top-down tree (track → sections → items). */
export function trackToTree(track: Track): Graph {
  const rootId = nodeId("track", track.id);
  const nodes: GraphNode[] = [
    { id: rootId, label: truncateLabel(track.name, 30), kind: "root", trackId: track.id },
  ];
  const edges: GraphEdge[] = [];

  for (const section of track.sections) {
    const sectionId = nodeId("section", `${track.id}-${section.id}`);
    nodes.push({
      id: sectionId,
      label: truncateLabel(`${section.label}: ${section.title}`, 32),
      kind: "section",
      detail: `${section.items.length} item`,
      trackId: track.id,
    });
    edges.push({ id: edgeId(rootId, sectionId), source: rootId, target: sectionId });
  }

  return { id: `tree-${track.id}`, title: track.name, nodes, edges };
}

/** Roadmap track → tree including every item (used by the "бүх item" toggle). */
export function trackToFullTree(
  track: Track,
  progress: Record<string, boolean> = {}
): Graph {
  const rootId = nodeId("track", track.id);
  let total = 0;
  let done = 0;
  const nodes: GraphNode[] = [
    { id: rootId, label: truncateLabel(track.name, 30), kind: "root", trackId: track.id },
  ];
  const edges: GraphEdge[] = [];

  for (const section of track.sections) {
    const sectionId = nodeId("section", `${track.id}-${section.id}`);
    const sectionDone = section.items.filter(
      item => progress[`${track.id}:${item.id}`]
    ).length;
    nodes.push({
      id: sectionId,
      label: truncateLabel(`${section.label}: ${section.title}`, 32),
      kind: "section",
      detail: `${sectionDone}/${section.items.length} дууссан`,
      trackId: track.id,
    });
    edges.push({ id: edgeId(rootId, sectionId), source: rootId, target: sectionId });

    for (const item of section.items) {
      total += 1;
      const isDone = Boolean(progress[`${track.id}:${item.id}`]);
      if (isDone) done += 1;
      const itemId = nodeId("item", `${track.id}-${item.id}`);
      nodes.push({
        id: itemId,
        label: truncateLabel(item.title, 30),
        kind: "item",
        detail: item.url ? "Холбоостой" : undefined,
        url: item.url,
        done: isDone,
        trackId: track.id,
      });
      edges.push({ id: edgeId(sectionId, itemId), source: sectionId, target: itemId });
    }
  }

  nodes[0].detail = `${done}/${total} дууссан`;
  nodes[0].count = total;
  return { id: `tree-full-${track.id}`, title: track.name, nodes, edges };
}

/** Concepts returned by the (optional) AI analyzer → network diagram. */
export function buildConceptNetwork(options: {
  id: string;
  title: string;
  concepts: string[];
}): Graph {
  const rootId = nodeId("root", options.id);
  const nodes: GraphNode[] = [
    { id: rootId, label: truncateLabel(options.title, 30), kind: "root" },
  ];
  const edges: GraphEdge[] = [];
  dedupe(options.concepts, 12).forEach(concept => {
    const id = nodeId("concept", `${options.id}-${slug(concept)}`);
    nodes.push({ id, label: truncateLabel(concept, 22), kind: "concept" });
    edges.push({ id: edgeId(rootId, id), source: rootId, target: id });
  });
  return { id: `concepts-${options.id}`, title: options.title, nodes, edges };
}

/* ------------------------------------------------------------------ *
 * Knowledge Atlas
 * ------------------------------------------------------------------ */

export type AtlasOptions = {
  /** Top-N tags to materialise as "concept" nodes (0 disables them). */
  tagLimit?: number;
  /** Hard cap so a 100+ report vault still renders smoothly. */
  reportLimit?: number;
};

/** Which roadmap track a report belongs to (by source, with a keyword nudge). */
export function trackIdForReport(
  report: Pick<DiagramReport, "source" | "stage" | "tags" | "title" | "room">,
  tracks: Track[]
): string | undefined {
  const haystack = `${report.title} ${report.room ?? ""} ${report.stage} ${(report.tags ?? []).join(" ")}`.toLowerCase();
  const byKeyword = tracks.find(track => {
    if (track.id === "oscp-cloud" && /oscp|cloud|aws|azure|k8s/.test(haystack)) return true;
    if (track.id === "thm-paid-ad" && /active directory|\bad\b|kerberos|bloodhound/.test(haystack))
      return true;
    if (track.id === "pico-ctf-cylab" && /picoctf|pico|ctf|juice|dvwa|vulnhub/.test(haystack))
      return true;
    if (track.id === "htb-flaws" && /htb|hackthebox|flaws/.test(haystack)) return true;
    return false;
  });
  if (byKeyword) return byKeyword.id;

  const bySource: Record<string, string> = {
    THM: "thm-free-path",
    picoCTF: "pico-ctf-cylab",
    HTB: "htb-flaws",
    Cloud: "oscp-cloud",
  };
  const mapped = bySource[report.source];
  return tracks.some(track => track.id === mapped) ? mapped : undefined;
}

export function buildAtlasGraph(
  reports: DiagramReport[],
  tracks: Track[],
  progress: Record<string, boolean> = {},
  options: AtlasOptions = {}
): Graph {
  const tagLimit = options.tagLimit ?? 8;
  const reportLimit = options.reportLimit ?? 120;

  const nodes: GraphNode[] = [
    { id: "atlas:root", label: "Мэдлэгийн атлас", kind: "root", count: reports.length },
  ];
  const edges: GraphEdge[] = [];

  // 1. Track nodes.
  for (const track of tracks) {
    let total = 0;
    let done = 0;
    for (const section of track.sections) {
      for (const item of section.items) {
        total += 1;
        if (progress[`${track.id}:${item.id}`]) done += 1;
      }
    }
    nodes.push({
      id: nodeId("track", track.id),
      label: truncateLabel(track.name, 28),
      kind: "track",
      detail: total ? `${done}/${total} · ${Math.round((done / total) * 100)}%` : undefined,
      trackId: track.id,
    });
    edges.push({
      id: edgeId("atlas:root", nodeId("track", track.id)),
      source: "atlas:root",
      target: nodeId("track", track.id),
    });
  }

  // 2. Report nodes (capped, newest first).
  const visible = [...reports]
    .sort((a, b) => b.id - a.id)
    .slice(0, Math.max(1, reportLimit));
  for (const report of visible) {
    const id = nodeId("report", report.id);
    nodes.push({
      id,
      label: truncateLabel(report.title, 28),
      kind: "report",
      detail: `${report.source} · ${report.stage}`,
      reportId: report.id,
    });
    const trackId = trackIdForReport(report, tracks);
    const parent = trackId ? nodeId("track", trackId) : "atlas:root";
    edges.push({ id: edgeId(parent, id), source: parent, target: id });
  }

  // 3. Tag (concept) nodes — the "concept map" cross-links.
  if (tagLimit > 0) {
    const counts = new Map<string, number>();
    for (const report of visible) {
      for (const tag of report.tags ?? []) {
        const key = tag.replace(/^#/, "").toLowerCase();
        if (!key) continue;
        counts.set(key, (counts.get(key) ?? 0) + 1);
      }
    }
    const topTags = [...counts.entries()]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .slice(0, tagLimit);

    for (const [tag, count] of topTags) {
      const id = nodeId("tag", slug(tag));
      nodes.push({ id, label: `#${truncateLabel(tag, 20)}`, kind: "tag", count });
      edges.push({ id: edgeId("atlas:root", id), source: "atlas:root", target: id });
    }
    const top = new Set(topTags.map(([tag]) => tag));
    for (const report of visible) {
      for (const tag of report.tags ?? []) {
        const key = tag.replace(/^#/, "").toLowerCase();
        if (!top.has(key)) continue;
        const source = nodeId("report", report.id);
        const target = nodeId("tag", slug(key));
        edges.push({ id: edgeId(source, target), source, target, dashed: true });
      }
    }
  }

  return {
    id: "atlas",
    title: "Мэдлэгийн газрын зураг",
    nodes,
    edges,
  };
}

/* ------------------------------------------------------------------ *
 * Layout engine
 * ------------------------------------------------------------------ */

export type LayoutOptions = {
  orientation?: "horizontal" | "vertical";
  /** Gap between depth columns. */
  colGap?: number;
  /** Gap between siblings. */
  rowGap?: number;
  padding?: number;
};

export function measureNode(label: string): { width: number; height: number } {
  const width = Math.max(96, Math.min(232, Math.round(label.length * 6.6) + 28));
  return { width, height: 32 };
}

type TreeIndex = {
  children: Map<string, string[]>;
  roots: string[];
};

/** First-parent-wins tree index — every node gets exactly one slot. */
function buildTree(graph: Graph): TreeIndex {
  const children = new Map<string, string[]>();
  const hasParent = new Set<string>();
  for (const node of graph.nodes) children.set(node.id, []);
  for (const edge of graph.edges) {
    if (!children.has(edge.target)) continue;
    if (hasParent.has(edge.target)) continue; // cross-links don't move nodes
    if (edge.source === edge.target) continue;
    children.get(edge.source)?.push(edge.target);
    hasParent.add(edge.target);
  }
  const roots = graph.nodes
    .map(node => node.id)
    .filter(id => !hasParent.has(id));
  return { children, roots: roots.length ? roots : graph.nodes.slice(0, 1).map(n => n.id) };
}

/** Tidy tree layout. Horizontal is used for mind-maps, vertical for trees. */
export function layoutHierarchy(graph: Graph, options: LayoutOptions = {}): PositionedGraph {
  const orientation = options.orientation ?? "horizontal";
  const colGap = options.colGap ?? 90;
  const rowGap = options.rowGap ?? 16;
  const padding = options.padding ?? 24;

  if (!graph.nodes.length) {
    return { title: graph.title, nodes: [], edges: graph.edges, width: 0, height: 0 };
  }

  const { children, roots } = buildTree(graph);
  const size = new Map<string, { width: number; height: number }>();
  for (const node of graph.nodes) size.set(node.id, measureNode(node.label));

  const depth = new Map<string, number>();
  const assignDepth = (id: string, d: number, seen: Set<string>) => {
    if (seen.has(id)) return;
    seen.add(id);
    depth.set(id, Math.min(d, depth.get(id) ?? Infinity));
    for (const child of children.get(id) ?? []) assignDepth(child, d + 1, seen);
  };
  for (const root of roots) assignDepth(root, 0, new Set());
  for (const node of graph.nodes) if (!depth.has(node.id)) depth.set(node.id, 0);

  const maxDepth = Math.max(...[...depth.values()]);
  const colSize = new Array<number>(maxDepth + 1).fill(0);
  for (const node of graph.nodes) {
    const d = depth.get(node.id) ?? 0;
    colSize[d] = Math.max(colSize[d], size.get(node.id)!.width);
  }
  const offsets: number[] = [];
  let acc = 0;
  for (let d = 0; d <= maxDepth; d += 1) {
    offsets[d] = acc;
    acc += colSize[d] + colGap;
  }

  const cross = new Map<string, number>();
  let cursor = 0;
  const place = (id: string, seen: Set<string>): number => {
    if (seen.has(id)) return cross.get(id) ?? cursor;
    seen.add(id);
    const kids = (children.get(id) ?? []).filter(child => !seen.has(child));
    const box = size.get(id)!;
    if (!kids.length) {
      const position = cursor + box.height / 2;
      cursor += box.height + rowGap;
      cross.set(id, position);
      return position;
    }
    const positions = kids.map(child => place(child, seen));
    const position = (Math.min(...positions) + Math.max(...positions)) / 2;
    cross.set(id, position);
    return position;
  };
  for (const root of roots) place(root, new Set());
  for (const node of graph.nodes) if (!cross.has(node.id)) cross.set(node.id, cursor);

  const nodes: PositionedNode[] = graph.nodes.map(node => {
    const box = size.get(node.id)!;
    const d = depth.get(node.id) ?? 0;
    const along = offsets[d] + box.width / 2;
    const across = cross.get(node.id) ?? 0;
    return {
      ...node,
      width: box.width,
      height: box.height,
      depth: d,
      x: orientation === "horizontal" ? along : across,
      y: orientation === "horizontal" ? across : along,
    };
  });

  return normalize(nodes, graph.edges, graph.title, padding);
}

/** Radial (concentric) layout — used by the network diagram. */
export function layoutRadial(
  graph: Graph,
  options: { padding?: number; ringGap?: number; minRadius?: number } = {}
): PositionedGraph {
  const padding = options.padding ?? 40;
  const ringGap = options.ringGap ?? 190;
  const minRadius = options.minRadius ?? 200;

  if (!graph.nodes.length) {
    return { title: graph.title, nodes: [], edges: graph.edges, width: 0, height: 0 };
  }

  const { children, roots } = buildTree(graph);
  const size = new Map<string, { width: number; height: number }>();
  for (const node of graph.nodes) size.set(node.id, measureNode(node.label));

  // BFS depth from the roots (undirected: cross-links are followed too).
  const neighbours = new Map<string, string[]>();
  for (const node of graph.nodes) neighbours.set(node.id, []);
  for (const edge of graph.edges) {
    neighbours.get(edge.source)?.push(edge.target);
    neighbours.get(edge.target)?.push(edge.source);
  }
  const depth = new Map<string, number>();
  const queue: string[] = [];
  for (const root of roots) {
    depth.set(root, 0);
    queue.push(root);
  }
  while (queue.length) {
    const id = queue.shift()!;
    for (const next of neighbours.get(id) ?? []) {
      if (depth.has(next)) continue;
      depth.set(next, (depth.get(id) ?? 0) + 1);
      queue.push(next);
    }
  }
  for (const node of graph.nodes) if (!depth.has(node.id)) depth.set(node.id, 1);

  const byDepth = new Map<number, string[]>();
  for (const node of graph.nodes) {
    const d = depth.get(node.id) ?? 1;
    if (d === 0) continue;
    if (!byDepth.has(d)) byDepth.set(d, []);
    byDepth.get(d)!.push(node.id);
  }

  const nodes: PositionedNode[] = graph.nodes.map(node => ({
    ...node,
    ...size.get(node.id)!,
    x: 0,
    y: 0,
    depth: depth.get(node.id) ?? 0,
  }));
  const index = new Map(nodes.map(node => [node.id, node]));

  for (const [d, ids] of [...byDepth.entries()].sort((a, b) => a[0] - b[0])) {
    const avgWidth =
      ids.reduce((sum, id) => sum + (size.get(id)?.width ?? 120), 0) / Math.max(1, ids.length);
    const circumference = ids.length * (avgWidth + 34);
    const radius = Math.max(minRadius + (d - 1) * ringGap, circumference / (2 * Math.PI));
    ids.forEach((id, i) => {
      const node = index.get(id);
      if (!node) return;
      const angle = -Math.PI / 2 + (2 * Math.PI * i) / Math.max(1, ids.length);
      node.x = Math.round(Math.cos(angle) * radius);
      node.y = Math.round(Math.sin(angle) * radius);
    });
  }

  return normalize(nodes, graph.edges, graph.title, padding);
}

function normalize(
  nodes: PositionedNode[],
  edges: GraphEdge[],
  title: string,
  padding: number
): PositionedGraph {
  if (!nodes.length) return { title, nodes, edges, width: 0, height: 0 };
  const minX = Math.min(...nodes.map(n => n.x - n.width / 2));
  const maxX = Math.max(...nodes.map(n => n.x + n.width / 2));
  const minY = Math.min(...nodes.map(n => n.y - n.height / 2));
  const maxY = Math.max(...nodes.map(n => n.y + n.height / 2));
  const shiftX = padding - minX;
  const shiftY = padding - minY;
  const moved = nodes.map(node => ({ ...node, x: node.x + shiftX, y: node.y + shiftY }));
  return {
    title,
    nodes: moved,
    edges,
    width: maxX - minX + padding * 2,
    height: maxY - minY + padding * 2,
  };
}

/** Pick the layout that matches a diagram kind. */
export function layoutGraph(graph: Graph, kind: DiagramKind): PositionedGraph {
  switch (kind) {
    case "mindmap":
      return layoutHierarchy(graph, { orientation: "horizontal", colGap: 110, rowGap: 14 });
    case "flowchart":
      return layoutHierarchy(graph, { orientation: "horizontal", colGap: 74, rowGap: 18 });
    case "tree":
      return layoutHierarchy(graph, { orientation: "vertical", colGap: 78, rowGap: 22 });
    case "network":
    default:
      return layoutRadial(graph);
  }
}

/** Build + lay out a report diagram in one call. */
export function buildReportDiagram(report: DiagramReport, kind: DiagramKind): PositionedGraph {
  const graph =
    kind === "flowchart"
      ? reportToFlowchart(report)
      : kind === "network"
        ? reportToNetwork(report)
        : reportToMindMap(report);
  return layoutGraph(graph, kind);
}

/** Build + lay out a roadmap-track tree in one call. */
export function buildTrackDiagram(
  track: Track,
  progress: Record<string, boolean> = {},
  options: { full?: boolean } = {}
): PositionedGraph {
  const graph = options.full ? trackToFullTree(track, progress) : trackToTree(track);
  return layoutGraph(graph, "tree");
}
