import { describe, expect, it } from "vitest";
import { buildChatSnippets } from "./chatContext";

const reports = [
  {
    id: 1,
    title: "Linux Privilege Escalation",
    room: "Linux PrivEsc",
    tags: ["linux", "suid"],
    content: "SUID and sudo misconfigurations let a low-privileged user reach root.",
    source: "THM",
  },
  {
    id: 2,
    title: "AWS IAM notes",
    room: "CloudGoat",
    tags: ["aws", "iam"],
    content: "IAM policy review and privilege escalation vectors.",
    source: "Cloud",
  },
];

const playbooks = [
  {
    id: "linux-privesc",
    title: "Linux PrivEsc playbook",
    category: "linux",
    description: "SUID and sudo checks",
    commands: [{ label: "SUID", cmd: "find / -perm -u=s -type f 2>/dev/null" }],
  },
  {
    id: "cloud-iam",
    title: "Cloud IAM playbook",
    category: "cloud",
    description: "AWS IAM privilege escalation vectors",
    commands: [{ label: "Whoami", cmd: "aws sts get-caller-identity" }],
  },
];

const rooms = [
  { id: "thm-level-2-linuxprivesc", levelId: "level-2", title: "Linux PrivEsc", slug: "linuxprivesc" },
  { id: "thm-level-1-linuxfundamentalspart1", levelId: "level-1", title: "Linux Fundamentals Part 1", slug: "linuxfundamentalspart1" },
  { id: "thm-level-1-defensivesecurityintro", levelId: "level-1", title: "Intro to Defensive Security", slug: "defensivesecurityintro" },
];

describe("buildChatSnippets", () => {
  it("surfaces linux-tagged reports, playbooks, and rooms for a linux question", () => {
    const result = buildChatSnippets("linux privesc yaj hiih ve", { reports, playbooks, rooms });
    expect(result.some(s => s.kind === "room" && s.title === "Linux PrivEsc")).toBe(true);
    expect(result.some(s => s.kind === "playbook" && s.title === "Linux PrivEsc playbook")).toBe(true);
    expect(result.some(s => s.kind === "report" && s.id === "1")).toBe(true);
    // Unrelated cloud items should not crowd out the linux-specific match.
    expect(result.some(s => s.title === "Cloud IAM playbook")).toBe(false);
  });

  it("matches cloud/aws questions to the IAM playbook and report", () => {
    const result = buildChatSnippets("aws iam privilege escalation", { reports, playbooks, rooms });
    expect(result.some(s => s.title === "Cloud IAM playbook")).toBe(true);
    expect(result.some(s => s.title === "AWS IAM notes")).toBe(true);
  });

  it("falls back to starter rooms when nothing matches", () => {
    const result = buildChatSnippets("zzz unrelated qqq", { reports: [], playbooks: [], rooms });
    expect(result.length).toBeGreaterThan(0);
    expect(result[0].kind).toBe("room");
  });

  it("returns an empty list when there is truly nothing to fall back to", () => {
    const result = buildChatSnippets("hello", { reports: [], playbooks: [], rooms: [] });
    expect(result).toEqual([]);
  });
});
