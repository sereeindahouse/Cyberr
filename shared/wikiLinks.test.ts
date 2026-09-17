import { describe, expect, it } from "vitest";
import {
  allWikiEdges,
  buildTitleIndex,
  findBacklinks,
  findUnresolvedTargets,
  normalizeWikiTitle,
  outgoingWikiLinks,
  parseWikiLinks,
  resolveWikiLink,
  stripWikiSyntax,
} from "./wikiLinks";

describe("parseWikiLinks", () => {
  it("parses a plain link", () => {
    const [link] = parseWikiLinks("see [[Linux PrivEsc]] for details");
    expect(link.target).toBe("Linux PrivEsc");
    expect(link.alias).toBe("Linux PrivEsc");
    expect(link.anchor).toBeNull();
  });

  it("parses alias and anchor forms", () => {
    const links = parseWikiLinks("[[Linux PrivEsc|privesc]] and [[AWS IAM#policies]]");
    expect(links[0].target).toBe("Linux PrivEsc");
    expect(links[0].alias).toBe("privesc");
    expect(links[1].target).toBe("AWS IAM");
    expect(links[1].anchor).toBe("policies");
    expect(links[1].alias).toBe("AWS IAM");
  });

  it("skips links inside fenced code blocks", () => {
    const md = "before [[Real]]\n```bash\necho [[Fake]]\n```\nafter [[Also Real]]";
    const targets = parseWikiLinks(md).map(l => l.target);
    expect(targets).toEqual(["Real", "Also Real"]);
  });

  it("ignores pure anchors and empty targets", () => {
    expect(parseWikiLinks("[[#intro]]")).toEqual([]);
    expect(parseWikiLinks("[[   ]]")).toEqual([]);
  });

  it("records source offsets", () => {
    const text = "a [[B]] c";
    const [link] = parseWikiLinks(text);
    expect(text.slice(link.start, link.end)).toBe("[[B]]");
  });
});

describe("normalizeWikiTitle / resolveWikiLink", () => {
  it("matches case- and punctuation-insensitively", () => {
    expect(normalizeWikiTitle("Linux_PrIV-Esc!")).toBe(normalizeWikiTitle("linux priv esc"));
    const index = buildTitleIndex([{ id: 7, title: "Linux PrivEsc" }]);
    const [link] = parseWikiLinks("[[linux  privesc]]");
    expect(resolveWikiLink(link, index)?.id).toBe(7);
  });

  it("returns null for unknown titles", () => {
    const index = buildTitleIndex([{ id: 1, title: "A" }]);
    const [link] = parseWikiLinks("[[Missing]]");
    expect(resolveWikiLink(link, index)).toBeNull();
  });
});

const vault = [
  { id: 1, title: "Linux PrivEsc", content: "see also [[SUID Cheat]]" },
  { id: 2, title: "SUID Cheat", content: "part of [[Linux PrivEsc]]" },
  { id: 3, title: "AWS IAM", content: "unrelated note" },
  { id: 4, title: "Lab Journal", content: "today: [[Linux PrivEsc|privesc]] + [[Ghost Note]]" },
];

describe("findBacklinks", () => {
  it("finds notes linking to a report, with context", () => {
    const backlinks = findBacklinks(1, vault);
    expect(backlinks.map(b => b.id).sort()).toEqual([2, 4]);
    const journal = backlinks.find(b => b.id === 4)!;
    expect(journal.snippet).toContain("privesc");
    expect(journal.snippet).not.toContain("[[");
  });

  it("returns an empty list when nobody links here", () => {
    expect(findBacklinks(3, vault)).toEqual([]);
  });
});

describe("outgoingWikiLinks / allWikiEdges", () => {
  it("lists resolved outgoing links without self-links or dupes", () => {
    const out = outgoingWikiLinks(vault[3], vault);
    expect(out).toEqual([{ from: 4, to: 1, alias: "privesc" }]);
  });

  it("collects every vault edge", () => {
    const edges = allWikiEdges(vault);
    expect(edges).toHaveLength(3);
    expect(edges).toContainEqual({ from: 1, to: 2, alias: "SUID Cheat" });
  });
});

describe("findUnresolvedTargets", () => {
  it("groups broken links by target with usage", () => {
    const unresolved = findUnresolvedTargets(vault);
    expect(unresolved).toHaveLength(1);
    expect(unresolved[0].target).toBe("Ghost Note");
    expect(unresolved[0].usedBy).toEqual([{ id: 4, title: "Lab Journal" }]);
  });
});

describe("stripWikiSyntax", () => {
  it("replaces links with display text", () => {
    expect(stripWikiSyntax("a [[B|bee]] c [[D]]")).toBe("a bee c D");
  });
});
