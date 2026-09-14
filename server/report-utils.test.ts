import { describe, expect, it } from "vitest";
import { filterReports, toggleReportStatus } from "../client/src/lib/report-utils";

type Fixture = { id: number; title: string; room: string; tags: string[]; status: "Draft" | "Published" };

const fixtures: Fixture[] = [
  { id: 1, title: "Linux PrivEsc", room: "THM", tags: ["linux", "suid"], status: "Published" },
  { id: 2, title: "AWS IAM Policy", room: "CloudGoat", tags: ["aws", "iam"], status: "Draft" },
];

describe("report utilities", () => {
  it("filters by status and searches title, room, and tags", () => {
    expect(filterReports(fixtures, "iam", "All").map((report) => report.id)).toEqual([2]);
    expect(filterReports(fixtures, "", "Published").map((report) => report.id)).toEqual([1]);
    expect(filterReports(fixtures, "", "All", "suid").map((report) => report.id)).toEqual([1]);
  });

  it("toggles only the requested report status", () => {
    const next = toggleReportStatus(fixtures, 2);
    expect(next[0].status).toBe("Published");
    expect(next[1].status).toBe("Published");
    expect(toggleReportStatus(next, 1)[0].status).toBe("Draft");
  });
});
