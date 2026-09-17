import { measureNode, type GraphEdge, type GraphNode, type PositionedGraph, type PositionedNode } from "./visualModel";

const PAD = 28;
const STORAGE_KEY = "operator-dossier-graph-edits";

export type GraphEdit = {
  moved: Record<string, { x: number; y: number }>;
  renamed: Record<string, string>;
  addedNodes: (GraphNode & { x: number; y: number })[];
  removedNodes: string[];
  addedEdges: GraphEdge[];
  removedEdges: string[];
};

export function emptyEdit(): GraphEdit {
  return {
    moved: {},
    renamed: {},
    addedNodes: [],
    removedNodes: [],
    addedEdges: [],
    removedEdges: [],
  };
}

export function isEdited(edit: GraphEdit): boolean {
  return (
    Object.keys(edit.moved).length > 0 ||
    Object.keys(edit.renamed).length > 0 ||
    edit.addedNodes.length > 0 ||
    edit.removedNodes.length > 0 ||
    edit.addedEdges.length > 0 ||
    edit.removedEdges.length > 0
  );
}

export function moveNode(edit: GraphEdit, id: string, x: number, y: number): GraphEdit {
  return {
    ...edit,
    moved: { ...edit.moved, [id]: { x, y } },
  };
}

export function renameNode(edit: GraphEdit, id: string, label: string): GraphEdit {
  const trimmed = String(label ?? "").trim();
  if (!trimmed) return edit;
  return {
    ...edit,
    renamed: { ...edit.renamed, [id]: trimmed },
  };
}

export function addNode(edit: GraphEdit, node: GraphNode & { x: number; y: number }): GraphEdit {
  const exists = edit.addedNodes.some(n => n.id === node.id);
  const next = exists ? edit.addedNodes.map(n => (n.id === node.id ? node : n)) : [...edit.addedNodes, node];
  // If it was previously marked removed (shouldn't happen for user nodes, but guard), un-remove it.
  const removedNodes = edit.removedNodes.filter(rid => rid !== node.id);
  return { ...edit, addedNodes: next, removedNodes };
}

export function removeNode(edit: GraphEdit, id: string): GraphEdit {
  const isUser = edit.addedNodes.some(n => n.id === id);
  const moved = { ...edit.moved };
  delete moved[id];
  const renamed = { ...edit.renamed };
  delete renamed[id];

  if (isUser) {
    return {
      ...edit,
      moved,
      renamed,
      addedNodes: edit.addedNodes.filter(n => n.id !== id),
      addedEdges: edit.addedEdges.filter(e => e.source !== id && e.target !== id),
      removedEdges: edit.removedEdges.filter(eid => !eid.includes(id)),
    };
  }

  // generated node
  const removedNodes = edit.removedNodes.includes(id) ? edit.removedNodes : [...edit.removedNodes, id];
  return {
    ...edit,
    moved,
    renamed,
    removedNodes,
    addedEdges: edit.addedEdges.filter(e => e.source !== id && e.target !== id),
  };
}

export function addEdge(edit: GraphEdit, source: string, target: string): GraphEdit {
  if (source === target) return edit;
  const id = `user:${source}->${target}`;
  if (edit.addedEdges.some(e => e.id === id)) return edit;
  if (edit.addedEdges.some(e => e.source === source && e.target === target)) return edit;
  // If this edge was previously removed (user removed their own edge and now re-adding), just keep it as added.
  // Also if generated edge with same source/target was removed, we still add user edge.
  // Avoid duplicate with existing generated edge? The spec says skip duplicate, but we treat user edges as separate namespace,
  // so we allow it unless identical user edge already exists.
  const nextEdge: GraphEdge = { id, source, target };
  return { ...edit, addedEdges: [...edit.addedEdges, nextEdge] };
}

export function removeEdge(edit: GraphEdit, edgeId: string): GraphEdit {
  const isUser = edgeId.startsWith("user:") || edit.addedNodes.length >= 0 && edit.addedEdges.some(e => e.id === edgeId);
  // Actually check if it's in addedEdges
  const inAdded = edit.addedEdges.some(e => e.id === edgeId);
  if (inAdded) {
    return { ...edit, addedEdges: edit.addedEdges.filter(e => e.id !== edgeId) };
  }
  if (edit.removedEdges.includes(edgeId)) return edit;
  return { ...edit, removedEdges: [...edit.removedEdges, edgeId] };
}

export function applyEdit(graph: PositionedGraph, edit: GraphEdit): PositionedGraph {
  // 1. filter removed, apply rename & moved
  const filteredNodes: PositionedNode[] = [];
  for (const node of graph.nodes) {
    if (edit.removedNodes.includes(node.id)) continue;
    const label = edit.renamed[node.id] ?? node.label;
    if (!label) continue; // guard, though rename shouldn't be empty
    const moved = edit.moved[node.id];
    const x = moved ? moved.x : node.x;
    const y = moved ? moved.y : node.y;
    const measured = measureNode(label);
    filteredNodes.push({
      ...node,
      label,
      x,
      y,
      width: measured.width,
      height: 32,
    });
  }

  // 2. added nodes
  const existingIds = new Set(filteredNodes.map(n => n.id));
  for (const added of edit.addedNodes) {
    if (edit.removedNodes.includes(added.id)) continue;
    if (existingIds.has(added.id)) continue;
    const measured = measureNode(added.label);
    filteredNodes.push({
      ...added,
      x: added.x,
      y: added.y,
      width: measured.width,
      height: 32,
      depth: 0,
    } as PositionedNode);
    existingIds.add(added.id);
  }

  // 3. empty case
  if (filteredNodes.length === 0) {
    return { title: graph.title, nodes: [], edges: [], width: 0, height: 0 };
  }

  // 4. normalize so min extent = PAD (dragged nodes don't leave viewBox)
  const minX = Math.min(...filteredNodes.map(n => n.x - n.width / 2));
  const minY = Math.min(...filteredNodes.map(n => n.y - n.height / 2));
  const shiftX = PAD - minX;
  const shiftY = PAD - minY;
  const shiftedNodes = filteredNodes.map(n => ({ ...n, x: n.x + shiftX, y: n.y + shiftY }));

  const nodeIdSet = new Set(shiftedNodes.map(n => n.id));

  // 5. edges
  const finalEdges: GraphEdge[] = [];
  const edgeIdSet = new Set<string>();
  for (const edge of graph.edges) {
    if (edit.removedEdges.includes(edge.id)) continue;
    if (!nodeIdSet.has(edge.source) || !nodeIdSet.has(edge.target)) continue;
    finalEdges.push(edge);
    edgeIdSet.add(edge.id);
  }
  for (const edge of edit.addedEdges) {
    if (edit.removedEdges.includes(edge.id)) continue;
    if (!nodeIdSet.has(edge.source) || !nodeIdSet.has(edge.target)) continue;
    if (edgeIdSet.has(edge.id)) continue;
    // also skip if same source/target already exists (different id but same link)
    if (finalEdges.some(e => e.source === edge.source && e.target === edge.target)) {
      // Allow user edges even if generated edge exists? The spec says skip duplicate.
      // To avoid visual duplication, skip if exact source/target already present.
      continue;
    }
    finalEdges.push(edge);
    edgeIdSet.add(edge.id);
  }

  // 6. width/height = max extent + PAD
  const maxX = Math.max(...shiftedNodes.map(n => n.x + n.width / 2));
  const maxY = Math.max(...shiftedNodes.map(n => n.y + n.height / 2));

  return {
    title: graph.title,
    nodes: shiftedNodes,
    edges: finalEdges,
    width: maxX + PAD,
    height: maxY + PAD,
  };
}

export function newNodeId(prefix = "custom"): string {
  const rand = Math.random().toString(36).slice(2, 6);
  return `${prefix}:${Date.now().toString(36)}${rand}`;
}

let memoryFallback: Record<string, GraphEdit> | null = null;

function getStorage(): Storage | null {
  try {
    if (typeof localStorage !== "undefined") return localStorage as unknown as Storage;
    if (typeof window !== "undefined" && (window as any).localStorage) return (window as any).localStorage as Storage;
    if (typeof globalThis !== "undefined" && (globalThis as any).localStorage) return (globalThis as any).localStorage as Storage;
    return null;
  } catch {
    return null;
  }
}

export function loadEditStore(): Record<string, GraphEdit> {
  try {
    const storage = getStorage();
    if (!storage) {
      return memoryFallback ? { ...memoryFallback } : {};
    }
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as Record<string, GraphEdit>;
    }
    return {};
  } catch {
    return {};
  }
}

export function saveEditStore(store: Record<string, GraphEdit>): void {
  try {
    const storage = getStorage();
    if (!storage) {
      memoryFallback = { ...store };
      return;
    }
    storage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    // ignore quota errors etc.
  }
}

export function readEdit(key: string): GraphEdit {
  const store = loadEditStore();
  return store[key] ?? emptyEdit();
}

export function writeEdit(key: string, edit: GraphEdit): void {
  const store = loadEditStore();
  if (!isEdited(edit)) {
    if (store[key]) {
      delete store[key];
      saveEditStore(store);
    }
    return;
  }
  store[key] = edit;
  saveEditStore(store);
}

export function clearEdit(key: string): void {
  const store = loadEditStore();
  if (store[key]) {
    delete store[key];
    saveEditStore(store);
  }
}

export const editKey = {
  atlas: () => "atlas",
  report: (id: number, kind: string) => `report:${id}:${kind}`,
  track: (id: string) => `track:${id}`,
};
