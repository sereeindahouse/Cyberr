export type ReportStatus = "Draft" | "Published";

type ReportLike = {
  id: number;
  title: string;
  room: string;
  tags: string[];
  status: ReportStatus;
};

export function filterReports<T extends ReportLike>(reports: T[], query: string, status: "All" | ReportStatus, tag = "All"): T[] {
  const normalizedQuery = query.trim().toLowerCase();
  return reports.filter((report) => {
    const matchesStatus = status === "All" || report.status === status;
    const matchesTag = tag === "All" || report.tags.includes(tag);
    const haystack = `${report.title} ${report.room} ${report.tags.join(" ")}`.toLowerCase();
    return matchesStatus && matchesTag && haystack.includes(normalizedQuery);
  });
}

export function toggleReportStatus<T extends ReportLike>(reports: T[], reportId: number): T[] {
  return reports.map((report) => report.id === reportId
    ? { ...report, status: report.status === "Published" ? "Draft" : "Published" }
    : report);
}
