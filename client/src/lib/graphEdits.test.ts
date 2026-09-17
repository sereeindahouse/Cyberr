import { describe, expect, it, beforeEach } from "vitest";
import {
  emptyEdit,
  isEdited,
  moveNode,
  renameNode,
  addNode,
  removeNode,
  addEdge,
  removeEdge,
  applyEdit,
  newNodeId,
  loadEditStore,
  saveEditStore,
  readEdit,
  writeEdit,
  clearEdit,
  editKey,
  type GraphEdit,
} from "./graphEdits";
import type { PositionedGraph } from "./visualModel";

function makeGraph(): PositionedGraph {
  return {
    title: "Test",
    nodes: [
      { id: "report:1", label: "Report One", kind: "report", x: 0, y: 0, width: 100, height: 32, depth: 0 },
      { id: "report:2", label: "Report Two", kind: "report", x: 200, y: 0, width: 100, height: 32, depth: 1 },
    ],
    edges: [
      { id: "report:1->report:2", source: "report:1", target: "report:2" },
    ],
    width: 300,
    height: 100,
  };
}

describe("graphEdits", () => {
  beforeEach(() => {
    try {
      localStorage.clear();
    } catch {}
  });

  it("empty edit is not considered edited", () => {
    const edit = emptyEdit();
    expect(isEdited(edit)).toBe(false);
    expect(edit.addedNodes).toHaveLength(0);
    expect(edit.removedNodes).toHaveLength(0);
  });

  it("moveNode stores position and keeps inside viewBox after apply", () => {
    const graph = makeGraph();
    let edit = emptyEdit();
    edit = moveNode(edit, "report:1", -500, -300);
    const applied = applyEdit(graph, edit);
    const node = applied.nodes.find(n => n.id === "report:1")!;
    // After normalization min extent = PAD (28), so node should be >= 28 - width/2 etc.
    expect(node.x).toBeGreaterThanOrEqual(20);
    expect(node.y).toBeGreaterThanOrEqual(20);
    // relative position preserved
    const node2 = applied.nodes.find(n => n.id === "report:2")!;
    expect(node2.x).toBeGreaterThan(node.x);
  });

  it("renameNode recalculates width", () => {
    const graph = makeGraph();
    let edit = emptyEdit();
    edit = renameNode(edit, "report:1", "A very very long renamed label that exceeds width");
    const applied = applyEdit(graph, edit);
    const node = applied.nodes.find(n => n.id === "report:1")!;
    expect(node.label).toBe("A very very long renamed label that exceeds width");
    expect(node.width).toBeGreaterThan(100);
  });

  it("empty rename is ignored", () => {
    let edit = emptyEdit();
    edit = renameNode(edit, "report:1", "   ");
    expect(isEdited(edit)).toBe(false);
    expect(edit.renamed["report:1"]).toBeUndefined();
  });

  it("addNode adds a custom node", () => {
    const graph = makeGraph();
    let edit = emptyEdit();
    edit = addNode(edit, { id: "custom:abc", label: "Custom", kind: "concept", x: 50, y: 50 });
    const applied = applyEdit(graph, edit);
    expect(applied.nodes.some(n => n.id === "custom:abc")).toBe(true);
    expect(applied.nodes).toHaveLength(3);
  });

  it("addEdge skips self-loop and duplicate", () => {
    let edit = emptyEdit();
    edit = addEdge(edit, "report:1", "report:1");
    expect(edit.addedEdges).toHaveLength(0);
    edit = addEdge(edit, "report:1", "report:2");
    expect(edit.addedEdges).toHaveLength(1);
    edit = addEdge(edit, "report:1", "report:2");
    expect(edit.addedEdges).toHaveLength(1);
  });

  it("removeNode removes generated node and its edges", () => {
    const graph = makeGraph();
    let edit = emptyEdit();
    edit = removeNode(edit, "report:2");
    const applied = applyEdit(graph, edit);
    expect(applied.nodes.some(n => n.id === "report:2")).toBe(false);
    expect(applied.edges).toHaveLength(0);
    expect(edit.removedNodes).toContain("report:2");
  });

  it("removeNode completely deletes user-added node", () => {
    let edit = emptyEdit();
    edit = addNode(edit, { id: "custom:xyz", label: "Temp", kind: "concept", x: 10, y: 10 });
    expect(edit.addedNodes).toHaveLength(1);
    edit = removeNode(edit, "custom:xyz");
    expect(edit.addedNodes).toHaveLength(0);
    expect(edit.removedNodes).not.toContain("custom:xyz");
  });

  it("removeEdge handles generated and user edges", () => {
    const graph = makeGraph();
    let edit = emptyEdit();
    edit = removeEdge(edit, "report:1->report:2");
    let applied = applyEdit(graph, edit);
    expect(applied.edges).toHaveLength(0);
    expect(edit.removedEdges).toContain("report:1->report:2");

    let edit2 = emptyEdit();
    edit2 = addEdge(edit2, "report:1", "report:2");
    const userEdgeId = edit2.addedEdges[0].id;
    edit2 = removeEdge(edit2, userEdgeId);
    expect(edit2.addedEdges).toHaveLength(0);
    expect(edit2.removedEdges).not.toContain(userEdgeId);
  });

  it("applyEdit skips edits pointing to missing nodes", () => {
    const graph = makeGraph();
    let edit = emptyEdit();
    edit = addEdge(edit, "report:1", "nonexistent");
    const applied = applyEdit(graph, edit);
    // Edge to missing node should be skipped
    expect(applied.edges.filter(e => e.source === "report:1" && e.target === "nonexistent")).toHaveLength(0);
  });

  it("localStorage round-trip", () => {
    const key = editKey.atlas();
    let edit = emptyEdit();
    edit = moveNode(edit, "report:1", 123, 456);
    writeEdit(key, edit);
    const loaded = readEdit(key);
    expect(loaded.moved["report:1"]).toEqual({ x: 123, y: 456 });
    clearEdit(key);
    expect(isEdited(readEdit(key))).toBe(false);
  });

  it("edit keys are distinct", () => {
    const k1 = editKey.atlas();
    const k2 = editKey.report(1, "mindmap");
    const k3 = editKey.report(1, "flowchart");
    const k4 = editKey.track("thm-free-path");
    expect(new Set([k1, k2, k3, k4]).size).toBe(4);
  });

  it("newNodeId generates unique ids", () => {
    const a = newNodeId();
    const b = newNodeId();
    expect(a).not.toBe(b);
    expect(a.startsWith("custom:")).toBe(true);
    const c = newNodeId("track");
    expect(c.startsWith("track:")).toBe(true);
  });
});
