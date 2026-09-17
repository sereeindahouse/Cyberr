import { describe, expect, it } from "vitest";
import {
  buildAtlasGraph,
  buildConceptNetwork,
  buildReportDiagram,
  buildTrackDiagram,
  extractConcepts,
  extractHeadings,
  extractListItems,
  layoutGraph,
  layoutHierarchy,
  layoutRadial,
  reportToFlowchart,
  reportToMindMap,
  reportToNetwork,
  trackIdForReport,
  trackToFullTree,
  trackToTree,
  type DiagramReport,
} from "./visualModel";
import { roadmapTracks } from "@/data/roadmapTracks";

const report: DiagramReport = {
  id: 7,
  title: "Linux Privilege Escalation",
  source: "THM",
  stage: "Live Fire",
  tags: ["linux", "suid", "privesc"],
  content: [
    "# Linux Privilege Escalation",
    "",
    "## Enumeration",
    "",
    "Run `linpeas` and check `sudo -l` for the current user.",
    "",
    "### Kernel exploits",
    "",
    "Compare the kernel version against known exploits.",
    "",
    "## Exploitation",
    "",
    "1. Upload the exploit binary",
    "2. Compile with gcc",
    "3. Run and grab the root shell",
    "",
    "```bash",
    "## not a heading inside a fence",
    "```",
  ].join("\n"),
};

describe("markdown helpers", () => {
  it("reads headings but ignores fenced code blocks", () => {
    const headings = extractHeadings(report.content);
    expect(headings.map(h => `${h.level}:${h.text}`)).toEqual([
      "1:Linux Privilege Escalation",
      "2:Enumeration",
      "3:Kernel exploits",
      "2:Exploitation",
    ]);
  });

  it("detects ordered and bullet list items", () => {
    const items = extractListItems(report.content);
    expect(items.filter(item => item.ordered).map(item => item.text)).toEqual([
      "Upload the exploit binary",
      "Compile with gcc",
      "Run and grab the root shell",
    ]);
  });

  it("ranks technical concepts deterministically", () => {
    const concepts = extractConcepts(report.content, 6);
    expect(concepts.length).toBeGreaterThan(0);
    expect(concepts).toContain("linux");
    expect(new Set(concepts).size).toBe(concepts.length);
    // Same input → same output (no hidden randomness).
    expect(extractConcepts(report.content, 6)).toEqual(concepts);
  });
});

describe("report diagrams", () => {
  it("builds a mind-map from the heading hierarchy", () => {
    const graph = reportToMindMap(report);
    expect(graph.nodes[0]).toMatchObject({ kind: "root", reportId: 7 });
    expect(graph.nodes.map(node => node.label)).toContain("Enumeration");
    expect(graph.nodes.map(node => node.label)).toContain("Kernel exploits");
    // root → Enumeration → Kernel exploits
    const kernel = graph.nodes.find(node => node.label === "Kernel exploits")!;
    const parentEdge = graph.edges.find(edge => edge.target === kernel.id)!;
    const parent = graph.nodes.find(node => node.id === parentEdge.source)!;
    expect(parent.label).toBe("Enumeration");
  });

  it("builds a sequential flowchart from ordered steps", () => {
    const graph = reportToFlowchart(report);
    expect(graph.nodes.filter(node => node.kind === "step")).toHaveLength(3);
    const steps = graph.nodes.filter(node => node.kind === "step");
    expect(graph.edges.filter(edge => edge.label).length).toBe(3);
    // chain: root → step1 → step2 → step3
    expect(graph.edges.some(e => e.source === graph.nodes[0].id && e.target === steps[0].id)).toBe(true);
    expect(graph.edges.some(e => e.source === steps[0].id && e.target === steps[1].id)).toBe(true);
  });

  it("falls back to concepts for unstructured notes (never a lone node)", () => {
    const note: DiagramReport = {
      id: 42,
      title: "netcat",
      source: "Cyber",
      stage: "Foundations",
      tags: ["ks-import"],
      content:
        "> ==**Title: Netcat Swiss Army Knife**==\n> TCP Banner Grab: ==nc [TARGET_IP] [PORT]==\n> Catch reverse shells: ==nc -lvnp [PORT]==\n",
    };
    const flowchart = reportToFlowchart(note);
    expect(flowchart.nodes.length).toBeGreaterThan(1);
    expect(flowchart.nodes.filter(node => node.kind === "step").length).toBeGreaterThan(0);
  });

  it("builds a network diagram with tags first", () => {
    const graph = reportToNetwork(report, 6);
    expect(graph.nodes[0].kind).toBe("root");
    expect(graph.nodes.filter(node => node.kind === "concept").length).toBeGreaterThan(1);
    const concepts = graph.nodes.filter(n => n.kind === "concept").map(n => n.label);
    expect(concepts.slice(0, 3)).toEqual(["linux", "suid", "privesc"]);
  });

  it("falls back to tags when the report has no structure", () => {
    const flat: DiagramReport = {
      id: 9,
      title: "Flat note",
      source: "Cyber",
      stage: "Foundations",
      tags: ["alpha", "beta"],
      content: "Just one paragraph of prose with no headings at all.",
    };
    const graph = reportToMindMap(flat);
    expect(graph.nodes.length).toBeGreaterThan(1);
    expect(graph.nodes.map(node => node.label)).toContain("#alpha");
  });
});

describe("roadmap track diagrams", () => {
  const track = roadmapTracks[0];

  it("renders track → sections → items as a tree", () => {
    const tree = trackToTree(track);
    expect(tree.nodes[0]).toMatchObject({ kind: "root", trackId: track.id });
    expect(tree.nodes.filter(node => node.kind === "section")).toHaveLength(
      track.sections.length
    );
    const full = trackToFullTree(track, { [`${track.id}:${track.sections[0].items[0].id}`]: true });
    const items = full.nodes.filter(node => node.kind === "item");
    expect(items).toHaveLength(track.sections.reduce((sum, s) => sum + s.items.length, 0));
    expect(items.filter(item => item.done)).toHaveLength(1);
  });

  it("maps reports to a track by source (and by keyword)", () => {
    expect(trackIdForReport(report, roadmapTracks)).toBe("thm-free-path");
    expect(
      trackIdForReport(
        { source: "Cyber", stage: "Live Fire", tags: [], title: "BloodHound AD path" },
        roadmapTracks
      )
    ).toBe("thm-paid-ad");
    expect(
      trackIdForReport({ source: "Cloud", stage: "Deployment", tags: [], title: "AWS S3" }, roadmapTracks)
    ).toBe("oscp-cloud");
  });
});

describe("knowledge atlas", () => {
  const progress: Record<string, boolean> = {};
  const graph = buildAtlasGraph([report, { ...report, id: 8, title: "Windows AD", source: "THM" }], roadmapTracks, progress);

  it("connects tracks to the root and reports to their track", () => {
    expect(graph.nodes[0]).toMatchObject({ id: "atlas:root", kind: "root" });
    expect(graph.nodes.filter(node => node.kind === "track")).toHaveLength(roadmapTracks.length);
    const reportNodes = graph.nodes.filter(node => node.kind === "report");
    expect(reportNodes).toHaveLength(2);
    const parentOf = (nodeId: string) =>
      graph.edges.find(edge => edge.target === nodeId)!.source;
    // THM Linux report → THM Free Path; the AD-titled one → the AD track.
    expect(parentOf("report:7")).toBe("track:thm-free-path");
    expect(parentOf("report:8")).toBe("track:thm-paid-ad");
  });

  it("adds dashed cross-links to shared tags", () => {
    const dashed = graph.edges.filter(edge => edge.dashed);
    expect(dashed.length).toBeGreaterThan(0);
    expect(dashed.every(edge => edge.source.startsWith("report:"))).toBe(true);
  });

  it("can switch tag nodes off and caps the report count", () => {
    const withoutTags = buildAtlasGraph([report], roadmapTracks, progress, { tagLimit: 0 });
    expect(withoutTags.nodes.filter(node => node.kind === "tag")).toHaveLength(0);
    const many = Array.from({ length: 200 }, (_, i) => ({ ...report, id: 100 + i }));
    const capped = buildAtlasGraph(many, roadmapTracks, progress, { reportLimit: 50 });
    expect(capped.nodes.filter(node => node.kind === "report")).toHaveLength(50);
  });
});

describe("layout engine", () => {
  it("lays a hierarchy out without overlaps or NaN", () => {
    const laid = layoutHierarchy(reportToMindMap(report), { orientation: "horizontal" });
    expect(laid.nodes.length).toBeGreaterThan(1);
    for (const node of laid.nodes) {
      expect(Number.isFinite(node.x)).toBe(true);
      expect(Number.isFinite(node.y)).toBe(true);
    }
    const root = laid.nodes[0];
    const children = laid.nodes.filter(node => node.depth === 1);
    expect(children.every(child => child.x > root.x)).toBe(true);
    // Leaf nodes never overlap vertically.
    const leaves = laid.nodes.filter(node => node.depth === 2).sort((a, b) => a.y - b.y);
    for (let i = 1; i < leaves.length; i += 1) {
      expect(leaves[i].y - leaves[i - 1].y).toBeGreaterThanOrEqual(leaves[i].height);
    }
    expect(laid.width).toBeGreaterThan(0);
    expect(laid.height).toBeGreaterThan(0);
  });

  it("places network diagrams radially around the root", () => {
    const laid = layoutRadial(reportToNetwork(report, 8));
    const root = laid.nodes[0];
    for (const node of laid.nodes.slice(1)) {
      const distance = Math.hypot(node.x - root.x, node.y - root.y);
      expect(distance).toBeGreaterThan(50);
      expect(Number.isFinite(distance)).toBe(true);
    }
  });

  it("supports every diagram kind end to end", () => {
    for (const kind of ["mindmap", "flowchart", "network"] as const) {
      const laid = buildReportDiagram(report, kind);
      expect(laid.nodes.length).toBeGreaterThan(0);
      expect(laid.width).toBeGreaterThan(0);
    }
    const tree = buildTrackDiagram(roadmapTracks[0], {}, { full: true });
    expect(tree.nodes.length).toBeGreaterThan(roadmapTracks[0].sections.length);
  });

  it("handles an empty graph without throwing", () => {
    const laid = layoutGraph({ id: "empty", title: "empty", nodes: [], edges: [] }, "tree");
    expect(laid.nodes).toHaveLength(0);
    expect(laid.width).toBe(0);
  });

  it("builds a concept network from analyzer output", () => {
    const graph = buildConceptNetwork({ id: "x", title: "Report", concepts: ["sudo", "sudo", "suid"] });
    expect(graph.nodes.filter(node => node.kind === "concept").map(n => n.label)).toEqual([
      "sudo",
      "suid",
    ]);
  });
});
