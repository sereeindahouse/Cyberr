import {
  Archive,
  ArrowDownRight,
  ArrowUpRight,
  BookOpen,
  CalendarDays,
  Check,
  ChevronDown,
  Database,
  Download,
  Circle,
  Clock3,
  FileText,
  Filter,
  FolderKanban,
  Hash,
  ImagePlus,
  LayoutDashboard,
  Menu,
  MoreHorizontal,
  Paperclip,
  Plus,
  Printer,
  Search,
  Shield,
  Sparkles,
  Target,
  TerminalSquare,
  Upload,
  X,
} from "lucide-react";
import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import { filterReports, toggleReportStatus } from "@/lib/report-utils";
import { trpc } from "@/lib/trpc";

type ReportStatus = "Draft" | "Published";
type Report = {
  id: number;
  title: string;
  room: string;
  source: "THM" | "picoCTF" | "HTB" | "Cloud" | "Cyber";
  stage: string;
  tags: string[];
  status: ReportStatus;
  readTime: string;
  date: string;
  excerpt: string;
  content: string;
  image?: string;
};

const initialReports: Report[] = [
  {
    id: 1,
    title: "Linux Privilege Escalation",
    room: "Linux PrivEsc",
    source: "THM",
    stage: "Live Fire",
    tags: ["linux", "permissions", "suid"],
    status: "Published",
    readTime: "12 min",
    date: "Sep 14, 2026",
    excerpt:
      "SUID бинар болон системийн эмзэг тохиргоог ашиглан root эрх авах техникийн тэмдэглэл.",
    content:
      "## Үйл ажиллагааны хураангуй\n\nLinux системийн SUID бит тохируулагдсан файлуудыг шалгаж, эрх ахиулах боломжит арга замыг тодорхойлов.\n\n## Үндсэн шалтгаан (Root cause)\n\nХандалтын буруу эрх бүхий захиалгат скрипт нь root эрхээр дуудагдаж байсныг илрүүлэв.",
  },
  {
    id: 2,
    title: "AWS IAM Policy Reasoning",
    room: "CloudGoat: IAM",
    source: "Cloud",
    stage: "Foundations",
    tags: ["aws", "iam", "policy"],
    status: "Published",
    readTime: "08 min",
    date: "Sep 12, 2026",
    excerpt:
      "AWS IAM бодлогын хязгаарлалт ба нөхцөлт эрхийн алдаатай бүтцийг илрүүлсэн тухай шинжилгээ.",
    content:
      "## Үйл ажиллагааны хураангуй\n\nХандалтын бодлогын Wildcard Action болон Resource тохиргоог шинжилж үзэв.\n\n## Үндсэн шалтгаан (Root cause)\n\nХэт өргөн хүрээтэй 'iam:*' зөвшөөрөл нь давуу эрхтэй роль руу шилжих боломж олгосон.",
  },
  {
    id: 3,
    title: "Packet Anatomy: SYN to Session",
    room: "Networking Basics",
    source: "THM",
    stage: "Foundations",
    tags: ["tcp", "packets", "osi"],
    status: "Published",
    readTime: "05 min",
    date: "Sep 09, 2026",
    excerpt:
      "TCP three-way handshake болон сүлжээний багцын бүтцийн шинжилгээний тэмдэглэл.",
    content:
      "## Үйл ажиллагааны хураангуй\n\nWireshark ашиглан TCP холболт үүсэх явц болон RST багцын төлөвийг ажиглав.\n\n## Үндсэн шалтгаан (Root cause)\n\nБагцын толгой хэсэг дэх төлөвийн тугнууд болон дарааллын дугаарлалтын зүй тогтол.",
  },
  {
    id: 4,
    title: "Windows Event Logs: First Pass",
    room: "Intro to Windows",
    source: "THM",
    stage: "Foundations",
    tags: ["windows", "logs", "detection"],
    status: "Draft",
    readTime: "06 min",
    date: "Sep 07, 2026",
    excerpt:
      "Windows аюулгүй байдлын үйл явдлын лог (Event ID 4624, 4625)-д дүн шинжилгээ хийх анхны тэмдэглэл.",
    content:
      "## Үйл ажиллагааны хураангуй\n\nНэвтрэх оролдлогууд болон процесс үүсэх үйл явдлыг Event Viewer дээр хянах.\n\n## Үндсэн шалтгаан (Root cause)\n\nАмжилтгүй нэвтрэлтийн дараа дараалсан администраторын хандалт бүртгэгдсэн.",
  },
];

const navItems = [
  { label: "Ерөнхий", icon: LayoutDashboard },
  { label: "Тайлан", icon: FileText },
  { label: "Сургалт", icon: BookOpen },
  { label: "Замын зураг", icon: Target },
];

const roadmap = [
  {
    stage: "01",
    name: "Суурь",
    detail: "THM Free Path",
    progress: 68,
    active: true,
  },
  {
    stage: "02",
    name: "Бодит туршилт",
    detail: "picoCTF / CyLab",
    progress: 24,
    active: true,
  },
  {
    stage: "03",
    name: "Гүн довтолгоо",
    detail: "AD / THM Paid",
    progress: 4,
    active: false,
  },
  {
    stage: "04",
    name: "Мэргэжлийн талбар",
    detail: "HTB / flAWS",
    progress: 0,
    active: false,
  },
  {
    stage: "05",
    name: "Хэрэглээ",
    detail: "OSCP / Cloud",
    progress: 0,
    active: false,
  },
];

const reportTemplates = [
  {
    key: "custom",
    label: "Кибер талбарын тэмдэглэл",
    source: "Cyber" as const,
    stage: "Foundations",
    tags: ["field-notes"],
    content: "## Даалгаврын тойм\n\nАрхитектур болон халдлагын гадаргуу, итгэмжлэгдсэн хил хязгаарыг тодорхойлох.\n\n## Үндсэн шалтгаан\n\n",
  },
  {
    key: "thm",
    label: "THM room тайлан",
    source: "THM" as const,
    stage: "Foundations",
    tags: ["tryhackme", "room-debrief"],
    content: "## Room-ийн зорилго\n\nЭмзэг байдлыг илрүүлэх болон нэвтрэх дараалал.\n\n## Ашигласан техникүүд\n\n",
  },
  {
    key: "picoctf",
    label: "picoCTF challenge тайлан",
    source: "picoCTF" as const,
    stage: "Live Fire",
    tags: ["picoctf", "challenge"],
    content: "## Challenge-ийн ангилал\n\nReverse engineering / Web exploitation шинжилгээ.\n\n## Flag олдсон арга\n\n",
  },
  {
    key: "htb",
    label: "HTB машин тайлан",
    source: "HTB" as const,
    stage: "Pro Arena",
    tags: ["hackthebox", "machine"],
    content: "## Машины мэдээлэл\n\nАнхны хандалт (User shell) ба эрх ахиулалт (Root flag).\n\n## Эмзэг байдал\n\n",
  },
  {
    key: "cloud",
    label: "Cloud security довтолгооны төлөвлөгөө",
    source: "Cloud" as const,
    stage: "Deployment",
    tags: ["cloud", "iam"],
    content: "## Клауд орчны бүтэц\n\nIAM, S3, болон дэд бүтцийн тохиргооны шалгалт.\n\n## Эрсдэлийн үнэлгээ\n\n",
  },
];

function readReports(): Report[] {
  try {
    const saved = localStorage.getItem("operator-dossier-reports");
    return saved ? JSON.parse(saved) : initialReports;
  } catch {
    return initialReports;
  }
}

function saveReports(reports: Report[]) {
  localStorage.setItem("operator-dossier-reports", JSON.stringify(reports));
}

function getWorkspaceKey() {
  const existing = localStorage.getItem("operator-dossier-workspace-key");
  if (existing) return existing;
  const next = `workspace-${crypto.randomUUID()}`;
  localStorage.setItem("operator-dossier-workspace-key", next);
  return next;
}

function reportToMarkdown(report: Report) {
  return `---\ntitle: ${report.title}\nroom: ${report.room}\nsource: ${report.source}\nstage: ${report.stage}\ntags: [${report.tags.join(", ")}]\nstatus: ${report.status}\ndate: ${report.date}\n---\n\n# ${report.title}\n\n> ${report.excerpt}\n\n${report.content}\n`;
}

function downloadText(
  filename: string,
  content: string,
  type = "text/markdown"
) {
  const blob = new Blob([content], { type: `${type};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function parseObsidianMarkdown(
  markdown: string,
  filename: string
): Partial<Report> {
  const frontmatterMatch = markdown.match(/^---\n([\s\S]*?)\n---\n?/);
  const frontmatter = frontmatterMatch?.[1] || "";
  const getValue = (key: string) =>
    frontmatter.match(new RegExp(`^${key}:\\s*(.*)$`, "m"))?.[1]?.trim() || "";
  const title =
    getValue("title") ||
    markdown.match(/^#\s+(.+)$/m)?.[1]?.trim() ||
    filename.replace(/\.md$/i, "");
  const tagsValue = getValue("tags").replace(/[\[\]]/g, "");
  const tags = tagsValue
    .split(",")
    .map(tag => tag.trim().replace(/^#/, ""))
    .filter(Boolean);
  const body = frontmatterMatch
    ? markdown.slice(frontmatterMatch[0].length).trim()
    : markdown.trim();
  const wordCount = body.split(/\s+/).filter(Boolean).length;
  const estimatedMin = Math.max(1, Math.round(wordCount / 150));
  return {
    title,
    room: getValue("room") || "Obsidian import",
    source: (getValue("source") as Report["source"]) || "THM",
    stage: getValue("stage") || "Foundations",
    tags: tags.length ? tags : ["obsidian-import"],
    status: "Draft",
    readTime: `${estimatedMin < 10 ? '0' : ''}${estimatedMin} min`,
    date: getValue("date") || "Sep 14, 2026",
    excerpt: body
      .replace(/^#+\s+/gm, "")
      .replace(/\s+/g, " ")
      .slice(0, 150),
    content: body,
  };
}

function MiniCalendar() {
  const days = Array.from({ length: 30 }, (_, index) => index + 1);
  return (
    <div className="calendar-wrap">
      <div className="month-row">
        <span>2026 оны 9-р сар</span>
        <div className="month-arrows">
          <ChevronDown size={12} className="rotate-90" />
          <ChevronDown size={12} className="-rotate-90" />
        </div>
      </div>
      <div className="weekday-row">
        {["M", "T", "W", "T", "F", "S", "S"].map((day, index) => (
          <span key={`${day}-${index}`}>{day}</span>
        ))}
      </div>
      <div className="calendar-grid">
        <span className="muted-day">31</span>
        {days.map(day => (
          <span
            key={day}
            className={
              day === 14
                ? "today-day"
                : day === 9 || day === 21
                  ? "marked-day"
                  : ""
            }
          >
            {day}
          </span>
        ))}
      </div>
    </div>
  );
}

function Heatmap() {
  const cells = Array.from({ length: 126 }, (_, index) => {
    if (index % 19 === 0) return "heat-4";
    if (index % 11 === 0) return "heat-3";
    if (index % 7 === 0) return "heat-2";
    if (index % 3 === 0) return "heat-1";
    return "";
  });
  return (
    <div className="heatmap-card">
      <div className="heatmap-head">
        <span>Үйл ажиллагааны идэвх</span>
        <span className="mono">Сүүлийн 18 долоо хоног</span>
      </div>
      <div className="heatmap-grid">
        {cells.map((level, index) => (
          <span key={index} className={level} />
        ))}
      </div>
      <div className="heatmap-foot">
        <span>Идэвх</span>
        <span className="legend">
          Бага <i className="heat-1" />
          <i className="heat-2" />
          <i className="heat-3" />
          <i className="heat-4" /> Их
        </span>
      </div>
    </div>
  );
}

function StatCard({
  value,
  label,
  accent,
}: {
  value: string;
  label: string;
  accent?: "green" | "orange";
}) {
  return (
    <div className="stat-card">
      <span className={`stat-value ${accent || ""}`}>{value}</span>
      <span className="stat-label">{label}</span>
    </div>
  );
}

function MarkdownPreview({ content }: { content: string }) {
  return (
    <div className="markdown-preview">
      {content.split("\n").map((line, index) => {
        if (line.startsWith("## "))
          return <h4 key={index}>{line.replace("## ", "")}</h4>;
        if (!line.trim()) return <div className="line-break" key={index} />;
        return <p key={index}>{line}</p>;
      })}
    </div>
  );
}

export default function Home() {
  const [activeNav, setActiveNav] = useState("Ерөнхий");
  const [reports, setReports] = useState<Report[]>(readReports);
  const [workspaceKey] = useState(() => getWorkspaceKey());
  const [selectedId, setSelectedId] = useState(1);
  const [statusFilter, setStatusFilter] = useState<"All" | ReportStatus>("All");
  const [tagFilter, setTagFilter] = useState("All");
  const [query, setQuery] = useState("");
  const [editorOpen, setEditorOpen] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newRoom, setNewRoom] = useState("");
  const [newStage, setNewStage] = useState("Foundations");
  const [newSource, setNewSource] = useState<Report["source"]>("Cyber");
  const [templateKey, setTemplateKey] = useState("custom");
  const [newContent, setNewContent] = useState(
    "## Mission brief\n\nStart with the architecture. Record the attack surface, the trust boundary, and the evidence.\n\n## Root cause\n\n"
  );
  const [attachment, setAttachment] = useState<string | undefined>();
  const fileInput = useRef<HTMLInputElement>(null);
  const obsidianInput = useRef<HTMLInputElement>(null);
  const mongoHydrated = useRef(false);
  const mongoReports = trpc.reports.list.useQuery(
    { workspaceKey },
    { retry: false }
  );
  const persistReports = trpc.reports.upsertMany.useMutation();

  useEffect(() => {
    if (!mongoReports.data || mongoHydrated.current) return;
    if (mongoReports.data.length) {
      setReports(mongoReports.data as Report[]);
      setSelectedId(mongoReports.data[0]?.id || 1);
    }
    mongoHydrated.current = true;
  }, [mongoReports.data]);

  useEffect(() => {
    saveReports(reports);
    if (mongoHydrated.current && reports.length) {
      persistReports.mutate({ workspaceKey, reports });
    }
  }, [reports, workspaceKey]);

  const availableTags = useMemo(
    () => Array.from(new Set(reports.flatMap(report => report.tags))).sort(),
    [reports]
  );
  const filteredReports = useMemo(
    () => filterReports(reports, query, statusFilter, tagFilter),
    [reports, statusFilter, tagFilter, query]
  );

  const selectedReport =
    reports.find(report => report.id === selectedId) || reports[0];
  const publishedCount = reports.filter(
    report => report.status === "Published"
  ).length;
  const draftCount = reports.filter(report => report.status === "Draft").length;

  function openEditor() {
    setNewTitle("");
    setNewRoom("");
    setNewStage("Foundations");
    setNewSource("Cyber");
    setTemplateKey("custom");
    setNewContent(reportTemplates[0].content);
    setAttachment(undefined);
    setEditorOpen(true);
  }

  function applyTemplate(key: string) {
    const template =
      reportTemplates.find(item => item.key === key) || reportTemplates[0];
    setTemplateKey(template.key);
    setNewSource(template.source);
    setNewStage(template.stage);
    setNewContent(template.content);
  }

  function handleAttachment(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setAttachment(String(reader.result));
    reader.readAsDataURL(file);
  }

  function createReport() {
    if (!newTitle.trim()) return;
    const wordCount = newContent.split(/\s+/).filter(Boolean).length;
    const est = Math.max(1, Math.round(wordCount / 150));
    const report: Report = {
      id: Date.now(),
      title: newTitle.trim(),
      room: newRoom.trim() || "Unassigned room",
      source: newSource as Report["source"],
      stage: newStage,
      tags: Array.from(
        new Set([
          newStage.toLowerCase().replace(" ", "-"),
          ...(reportTemplates.find(item => item.key === templateKey)?.tags || [
            "field-notes",
          ]),
        ])
      ),
      status: "Draft",
      readTime: `${est < 10 ? '0' : ''}${est} min`,
      date: "Sep 14, 2026",
      excerpt: newContent
        .replace(/^#+\s+/gm, "")
        .replace(/\s+/g, " ")
        .slice(0, 140) || "Шинэ тайлангийн тэмдэглэл.",
      content: newContent,
      image: attachment,
    };
    setReports(current => [report, ...current]);
    setSelectedId(report.id);
    setEditorOpen(false);
    setActiveNav("Тайлан");
  }

  function exportSelectedMarkdown() {
    if (!selectedReport) return;
    const safeTitle = selectedReport.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    downloadText(
      `${safeTitle || "operator-report"}.md`,
      reportToMarkdown(selectedReport)
    );
  }

  function exportAllMarkdown() {
    const bundle = reports.map(reportToMarkdown).join("\n---\n\n");
    downloadText("operator-dossier-all-reports.md", bundle);
  }

  function exportSelectedPdf() {
    if (!selectedReport) return;
    document.body.classList.add("print-report-mode");
    window.setTimeout(() => {
      window.print();
      document.body.classList.remove("print-report-mode");
    }, 50);
  }

  function handleObsidianImport(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const parsed = parseObsidianMarkdown(String(reader.result), file.name);
      const imported: Report = {
        id: Date.now(),
        title: parsed.title || file.name.replace(/\.md$/i, ""),
        room: parsed.room || "Obsidian import",
        source: parsed.source || "THM",
        stage: parsed.stage || "Foundations",
        tags: parsed.tags || ["obsidian-import"],
        status: "Draft",
        readTime: parsed.readTime || "05 min",
        date: parsed.date || "Sep 14, 2026",
        excerpt: parsed.excerpt || "Obsidian-аас импорт хийсэн тэмдэглэл.",
        content: parsed.content || "",
        image: undefined,
      };
      setReports(current => [imported, ...current]);
      setSelectedId(imported.id);
      setActiveNav("Тайлан");
    };
    reader.readAsText(file);
    event.target.value = "";
  }

  function togglePublished(reportId: number) {
    setReports(current => toggleReportStatus(current, reportId));
  }

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileNav ? "sidebar-open" : ""}`}>
        <div className="brand-block">
          <div className="brand-mark">
            <TerminalSquare size={17} />
          </div>
          <div>
            <div className="brand-name">OPERATOR</div>
            <div className="brand-sub">KNOWLEDGE DOSSIER</div>
          </div>
          <button className="mobile-close" onClick={() => setMobileNav(false)}>
            <X size={16} />
          </button>
        </div>
        <div className="side-section-label">Ажлын талбар</div>
        <nav className="side-nav">
          {navItems.map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                className={`side-nav-item ${activeNav === item.label ? "active" : ""}`}
                onClick={() => {
                  setActiveNav(item.label);
                  setMobileNav(false);
                }}
              >
                <Icon size={15} />
                <span>{item.label}</span>
                {item.label === "Тайлан" && (
                  <span className="nav-count">{reports.length}</span>
                )}
              </button>
            );
          })}
        </nav>
        <div className="side-section-label roadmap-label">Замын зураг</div>
        <div className="side-roadmap">
          {roadmap.map(item => (
            <div
              key={item.stage}
              className={`side-roadmap-row ${item.active ? "roadmap-active" : ""}`}
            >
              <span className="stage-number">{item.stage}</span>
              <div>
                <strong>{item.name}</strong>
                <small>{item.detail}</small>
              </div>
              <span className="mini-progress">{item.progress}%</span>
            </div>
          ))}
        </div>
        <div className="sidebar-footer">
          <div className="profile-dot">O</div>
          <div>
            <strong>Operator</strong>
            <small>Ulaanbaatar, MN</small>
          </div>
          <MoreHorizontal size={15} className="muted-icon" />
        </div>
      </aside>

      <main className="main-canvas">
        <header className="topbar">
          <button className="mobile-menu" onClick={() => setMobileNav(true)}>
            <Menu size={18} />
          </button>
          <div className="breadcrumb">
            <span>Ажлын талбар</span>
            <span className="slash">/</span>
            <strong>{activeNav}</strong>
          </div>
          <div className="top-actions">
            <button className="icon-button">
              <Search size={16} />
            </button>
            <button className="icon-button">
              <BellDot />
            </button>
            <div className="top-avatar">O</div>
          </div>
        </header>

        {activeNav === "Ерөнхий" && (
          <>
            <section className="hero-row">
              <div>
                <div className="eyebrow">
                  <span className="signal-dot" /> Систем идэвхтэй
                </div>
                <h1>
                  Операторын кибер сан.
                  <br />
                  <em>Аюулгүй байдлын тайлан</em>
                </h1>
                <p className="hero-copy">
                  Өрөөний тайлан, үндсэн шалтгааны шинжилгээ болон суурь
                  ойлголтоос клауд аюулгүй байдлын архитектур хүртэлх
                  бүртгэлийн сан.
                </p>
              </div>
              <div className="hero-brief">
                <div className="brief-kicker">Шуурхай зорилт</div>
                <div className="brief-title">
                  Linux PrivEsc өрөөний тайланг баталгаажуулах.
                </div>
                <div className="brief-meta">
                  <span>
                    <CalendarDays size={13} /> 09 / 14 / 2026
                  </span>
                  <span>
                    <MapPinIcon /> Улаанбаатар
                  </span>
                </div>
              </div>
            </section>
            <section className="dashboard-grid">
              <div className="left-column">
                <MiniCalendar />
                <div className="completion-ring">
                  <div className="ring">
                    <span>25%</span>
                  </div>
                  <div>
                    <strong>9 / 14 өдрийн мөчлөг</strong>
                    <small>Хэрэгжилт хэвийн байна</small>
                  </div>
                </div>
                <Heatmap />
                <div className="weekly-stats">
                  <div className="section-kicker">7 хоногийн статистик</div>
                  <div className="stat-row">
                    <StatCard
                      value={String(publishedCount)}
                      label="Нийтлэгдсэн тайлан"
                      accent="green"
                    />
                    <StatCard value="3.0" label="Үнэлгээний индекс" />
                    <StatCard
                      value="11"
                      label="Судалсан техник"
                      accent="orange"
                    />
                  </div>
                </div>
              </div>
              <div className="right-column">
                <div className="section-header">
                  <div>
                    <div className="section-kicker">Гүйцэтгэх дараалал</div>
                    <h2>Одоогийн ажлууд</h2>
                  </div>
                  <button
                    className="text-button"
                    onClick={() => setActiveNav("Тайлан")}
                  >
                    Бүх тайлан <ArrowUpRight size={14} />
                  </button>
                </div>
                <div className="task-stack">
                  <div className="task-group">
                    <div className="task-heading">
                      <span className="group-rule green-rule" /> Өнөөдөр{" "}
                      <span className="task-count">02</span>
                    </div>
                    <button
                      className="task-row highlighted"
                      onClick={() => {
                        setSelectedId(1);
                        setActiveNav("Тайлан");
                      }}
                    >
                      <span className="task-check" />
                      <div>
                        <strong>Write Linux PrivEsc report</strong>
                        <small>THM / Linux PrivEsc / Live Fire</small>
                      </div>
                      <span className="task-date">Өнөөдөр</span>
                    </button>
                    <button className="task-row" onClick={openEditor}>
                      <span className="task-check" />
                      <div>
                        <strong>Capture the cloud IAM logic</strong>
                        <small>CloudGoat / IAM / Foundations</small>
                      </div>
                      <span className="task-date">Ноорог</span>
                    </button>
                  </div>
                  <div className="task-group">
                    <div className="task-heading">
                      <span className="group-rule orange-rule" /> Маргааш{" "}
                      <span className="task-count">01</span>
                    </div>
                    <button className="task-row">
                      <span className="task-check" />
                      <div>
                        <strong>Finish packet anatomy notes</strong>
                        <small>THM / Networking Basics / Foundations</small>
                      </div>
                      <span className="task-date">Маргааш</span>
                    </button>
                  </div>
                  <div className="task-group">
                    <div className="task-heading">
                      <span className="group-rule gray-rule" /> Дараагийн{" "}
                      <span className="task-count">01</span>
                    </div>
                    <button className="task-row">
                      <span className="task-check" />
                      <div>
                        <strong>Build Windows log triage card</strong>
                        <small>THM / Intro to Windows / Foundations</small>
                      </div>
                      <span className="task-date">9-р сарын 18</span>
                    </button>
                  </div>
                </div>
                <div className="rule-note">
                  <Shield size={16} />
                  <div>
                    <strong>Операторын дүрэм</strong>
                    <span>
                      Синтакс хямд, харин логик үнэтэй. Тайлан бүр үндсэн
                      шалтгааныг тодорхойлсон байх шаардлагатай.
                    </span>
                  </div>
                </div>
              </div>
            </section>
            <section className="roadmap-section">
              <div className="section-header">
                <div>
                  <div className="section-kicker">Үе шатууд</div>
                  <h2>Ур чадварын замын зураг</h2>
                </div>
                <span className="mono tiny">5 Шатлал</span>
              </div>
              <div className="roadmap-track">
                {roadmap.map((item, index) => (
                  <div
                    key={item.stage}
                    className={`roadmap-card ${item.active ? "is-active" : ""}`}
                  >
                    <div className="roadmap-card-top">
                      <span>{item.stage}</span>
                      {item.active ? (
                        <span className="roadmap-live">Идэвхтэй</span>
                      ) : (
                        <span className="roadmap-lock">Түгжигдсэн</span>
                      )}
                    </div>
                    <strong>{item.name}</strong>
                    <small>{item.detail}</small>
                    <div className="progress-line">
                      <i style={{ width: `${item.progress}%` }} />
                    </div>
                    <div className="progress-meta">
                      <span>{item.progress}% Биелэлт</span>
                      {index < roadmap.length - 1 && (
                        <ArrowDownRight size={13} />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}

        {activeNav === "Тайлан" && (
          <section className="reports-page">
            <div className="page-title-row">
              <div>
                <div className="eyebrow">
                  <span className="signal-dot" /> Мэдээллийн сан
                </div>
                <h1>Судалгааны тайлангууд</h1>
                <p>Нэвтрэх туршилт, CTF болон лабын дүн шинжилгээний бүртгэлүүд.</p>
              </div>
              <div className="report-header-actions">
                <input
                  ref={obsidianInput}
                  type="file"
                  accept=".md,text/markdown"
                  onChange={handleObsidianImport}
                  hidden
                />
                <button
                  className="secondary-button"
                  onClick={() => obsidianInput.current?.click()}
                >
                  <Upload size={14} /> Obsidian импорт
                </button>
                <button className="primary-button" onClick={openEditor}>
                  <Plus size={16} /> Шинэ тайлан
                </button>
                <span
                  className={`db-status ${mongoReports.isSuccess ? "connected" : "local"}`}
                >
                  <Database size={13} />
                  {mongoReports.isSuccess ? " Клауд холбогдсон" : " Локал хадгалалт"}
                </span>
              </div>
            </div>
            <div className="reports-layout">
              <div className="report-list-panel">
                <div className="report-toolbar">
                  <div className="search-field">
                    <Search size={14} />
                    <input
                      value={query}
                      onChange={event => setQuery(event.target.value)}
                      placeholder="Тайлан хайх (гарчиг, room, шошго)..."
                    />
                  </div>
                  <div className="filter-pills">
                    <button
                      className={statusFilter === "All" ? "selected" : ""}
                      onClick={() => setStatusFilter("All")}
                    >
                      Бүгд
                    </button>
                    <button
                      className={statusFilter === "Published" ? "selected" : ""}
                      onClick={() => setStatusFilter("Published")}
                    >
                      Нийтлэгдсэн
                    </button>
                    <button
                      className={statusFilter === "Draft" ? "selected" : ""}
                      onClick={() => setStatusFilter("Draft")}
                    >
                      Ноорог
                    </button>
                  </div>
                </div>
                <div className="tag-filter-row">
                  <span className="tag-filter-label">Шошго:</span>
                  <button
                    className={
                      tagFilter === "All" ? "tag-chip selected" : "tag-chip"
                    }
                    onClick={() => setTagFilter("All")}
                  >
                    Бүгд
                  </button>
                  {availableTags.map(tag => (
                    <button
                      key={tag}
                      className={
                        tagFilter === tag ? "tag-chip selected" : "tag-chip"
                      }
                      onClick={() => setTagFilter(tag)}
                    >
                      #{tag}
                    </button>
                  ))}
                  {tagFilter !== "All" && (
                    <button
                      className="clear-filter"
                      onClick={() => setTagFilter("All")}
                    >
                      <X size={12} /> Цэвэрлэх
                    </button>
                  )}
                </div>
                <div className="list-meta">
                  <span>Нийт {filteredReports.length} тайлан</span>
                  <span className="mono">
                    Эрэмбэ: Сүүлийнх <ChevronDown size={12} />
                  </span>
                </div>
                {filteredReports.map(report => (
                  <button
                    key={report.id}
                    className={`report-list-item ${selectedReport?.id === report.id ? "selected" : ""}`}
                    onClick={() => setSelectedId(report.id)}
                  >
                    <div className="report-item-icon">
                      <FileText size={16} />
                    </div>
                    <div className="report-item-copy">
                      <div className="report-item-head">
                        <strong>{report.title}</strong>
                        <span
                          className={`status-pill ${report.status.toLowerCase()}`}
                        >
                          {report.status}
                        </span>
                      </div>
                      <span className="report-excerpt">{report.excerpt}</span>
                      <div className="report-item-meta">
                        <span>
                          {report.source} / {report.room}
                        </span>
                        <span>{report.date}</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              <div className="report-detail-panel">
                {selectedReport && (
                  <>
                    <div className="detail-top">
                      <div className="detail-kicker">
                        {selectedReport.source} /{" "}
                        {selectedReport.stage.toUpperCase()}
                      </div>
                      <button className="icon-button">
                        <MoreHorizontal size={16} />
                      </button>
                    </div>
                    <h2>{selectedReport.title}</h2>
                    <div className="detail-meta">
                      <span>
                        <Clock3 size={13} /> {selectedReport.readTime}
                      </span>
                      <span>
                        <CalendarDays size={13} /> {selectedReport.date}
                      </span>
                    </div>
                    <div className="tag-row">
                      {selectedReport.tags.map(tag => (
                        <button key={tag} onClick={() => setTagFilter(tag)}>
                          #{tag}
                        </button>
                      ))}
                    </div>
                    <div className="detail-divider" />
                    <MarkdownPreview content={selectedReport.content} />
                    {selectedReport.image && (
                      <img
                        className="report-image"
                        src={selectedReport.image}
                        alt="Report attachment"
                      />
                    )}
                    <div className="detail-actions">
                      <button
                        className="export-button"
                        onClick={exportSelectedMarkdown}
                      >
                        <Download size={14} /> Markdown
                      </button>
                      <button
                        className="export-button"
                        onClick={exportSelectedPdf}
                      >
                        <Printer size={14} /> Хэвлэх (PDF)
                      </button>
                      <button
                        className="secondary-button"
                        onClick={() => togglePublished(selectedReport.id)}
                      >
                        <Check size={14} />
                        {selectedReport.status === "Published" ? " Ноорог болгох" : " Нийтлэх"}
                      </button>
                      <button className="quiet-button">
                        <Archive size={14} /> Архивлах
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </section>
        )}

        {activeNav === "Сургалт" && (
          <section className="simple-page">
            <div className="page-title-row">
              <div>
                <div className="eyebrow">
                  <span className="signal-dot" /> Гарын авлага
                </div>
                <h1>Ажиллагааны тактик &amp; Playbook</h1>
                <p>Шалгалтын үед хэрэглэгдэх стандарт дараалал ба санамжууд.</p>
              </div>
              <button className="primary-button" onClick={openEditor}>
                <Plus size={16} /> Шинэ playbook
              </button>
            </div>
            <div className="playbook-grid">
              <div className="playbook-card dark-card">
                <Sparkles size={18} />
                <h3>Эрх ахиулах арга зүй</h3>
                <p>
                  Linux SUID, Capabilities, Cronjobs болон Sudoers тохиргоог
                  шалгах стандарт алгоритм.
                </p>
              </div>
              <div className="playbook-card">
                <Hash size={18} />
                <h3>Сүлжээний багц шинжилгээ</h3>
                <p>
                  Wireshark болон tcpdump ашиглан сэжигтэй урсгал, handshake
                  алдааг илрүүлэх.
                </p>
              </div>
              <div className="playbook-card">
                <Shield size={18} />
                <h3>Клауд IAM үнэлгээ</h3>
                <p>
                  AWS IAM бодлогын хэт өргөн эрхүүд болон Privilege Escalation
                  vectors илрүүлэх.
                </p>
              </div>
              <div className="playbook-card">
                <FolderKanban size={18} />
                <h3>Windows лог триаж</h3>
                <p>
                  Event 4624, 4625, 4688 бүртгэлүүдээс Process Injection болон
                  халдлагыг ангилах.
                </p>
              </div>
            </div>
          </section>
        )}

        {activeNav === "Замын зураг" && (
          <section className="simple-page">
            <div className="page-title-row">
              <div>
                <div className="eyebrow">
                  <span className="signal-dot" /> Хөгжлийн замнал
                </div>
                <h1>Мэргэжлийн замын зураг</h1>
                <p>
                  Суурь мэдлэгээс эхлэн клауд аюулгүй байдлын мэргэжилтэн болох
                  5 шатлал.
                </p>
              </div>
            </div>
            <div className="roadmap-large">
              {roadmap.map(item => (
                <div
                  className={`roadmap-large-row ${item.active ? "active" : ""}`}
                  key={item.stage}
                >
                  <div className="large-stage">{item.stage}</div>
                  <div className="large-stage-copy">
                    <div className="large-stage-title">
                      <h3>{item.name}</h3>
                      <span>{item.active ? "Идэвхтэй шат" : "Түгжигдсэн"}</span>
                    </div>
                    <p>{item.detail}</p>
                    <div className="progress-line">
                      <i style={{ width: `${item.progress}%` }} />
                    </div>
                  </div>
                  <div className="large-percent">{item.progress}%</div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      {editorOpen && (
        <div
          className="editor-overlay"
          onClick={event => {
            if (event.target === event.currentTarget) setEditorOpen(false);
          }}
        >
          <div className="editor-panel">
            <div className="editor-head">
              <div>
                <div className="section-kicker">Тайлангийн засварлагч</div>
                <h2>Шинэ тайлан үүсгэх</h2>
              </div>
              <button
                className="icon-button"
                onClick={() => setEditorOpen(false)}
              >
                <X size={17} />
              </button>
            </div>
            <label>
              Загвар сонгох
              <select
                value={templateKey}
                onChange={event => applyTemplate(event.target.value)}
              >
                {reportTemplates.map(template => (
                  <option key={template.key} value={template.key}>
                    {template.label}
                  </option>
                ))}
              </select>
            </label>
            <div className="template-note">
              <Sparkles size={13} /> Бүтэц, эх сурвалж, үе шат болон шошгыг автоматаар бөглөнө. Хадгалахаасаа өмнө хүссэнээрээ засах боломжтой.
            </div>
            <label>
              Тайлангийн гарчиг
              <input
                value={newTitle}
                onChange={event => setNewTitle(event.target.value)}
                placeholder="Жишээ: SSRF: trust boundary notes"
                autoFocus
              />
            </label>
            <div className="two-fields">
              <label>
                Room / Лаб
                <input
                  value={newRoom}
                  onChange={event => setNewRoom(event.target.value)}
                  placeholder="Room / challenge"
                />
              </label>
              <label>
                Эх сурвалж
                <select
                  value={newSource}
                  onChange={event => setNewSource(event.target.value as Report["source"])}
                >
                  <option>THM</option>
                  <option>picoCTF</option>
                  <option>HTB</option>
                  <option>Cloud</option>
                  <option>Cyber</option>
                </select>
              </label>
            </div>
            <label>
              Үе шат
              <select
                value={newStage}
                onChange={event => setNewStage(event.target.value)}
              >
                <option>Foundations</option>
                <option>Live Fire</option>
                <option>Deep Offensive</option>
                <option>Pro Arena</option>
                <option>Deployment</option>
              </select>
            </label>
            <label>
              Агуулга (Markdown)
              <textarea
                value={newContent}
                onChange={event => setNewContent(event.target.value)}
                rows={12}
              />
            </label>
            <div className="attachment-row">
              <input
                ref={fileInput}
                type="file"
                accept="image/*"
                onChange={handleAttachment}
                hidden
              />
              {attachment ? (
                <div className="attachment-preview">
                  <img src={attachment} alt="Attachment preview" />
                  <button onClick={() => setAttachment(undefined)}>
                    <X size={13} />
                  </button>
                </div>
              ) : (
                <button
                  className="attachment-button"
                  onClick={() => fileInput.current?.click()}
                >
                  <ImagePlus size={16} /> Скриншот хавсаргах
                </button>
              )}
              <span className="mono">PNG / JPG / WEBP</span>
            </div>
            <div className="editor-footer">
              <span className="editor-hint">
                <Paperclip size={13} /> Ноорогтой хамт хадгалагдана
              </span>
              <button className="primary-button" onClick={createReport}>
                Хадгалах <ArrowUpRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function BellDot() {
  return (
    <span className="bell-dot">
      <Circle size={14} />
    </span>
  );
}

function MapPinIcon() {
  return <span className="map-pin">•</span>;
}
