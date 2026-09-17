import {
  Archive,
  ArrowLeft,
  ArrowUpRight,
  Award,
  Bot,
  BookOpen,
  CalendarDays,
  ChartBar,
  Check,
  ChevronLeft,
  ChevronRight,
  Circle,
  Clock3,
  Compass,
  Copy,
  Crosshair,
  Database,
  Download,
  Eye,
  EyeOff,
  FileCode,
  FileText,
  FlaskConical,
  Hash,
  ImagePlus,
  Key,
  LayoutDashboard,
  Menu,
  Moon,
  Network,
  MoreHorizontal,
  Paperclip,
  Pencil,
  Plus,
  Printer,
  RotateCcw,
  Search,
  Server,
  Shield,
  Sparkles,
  Sun,
  Target,
  TerminalSquare,
  Trash2,
  Upload,
  User,
  Waypoints,
  X,
} from "lucide-react";
import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import DOMPurify from "dompurify";
import { marked } from "marked";
import { startLogin } from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";
import { useTheme } from "@/contexts/ThemeContext";
import {
  importedKnowledgeNotes,
  importedKnowledgePlaybooks,
} from "@/data/ksKnowledge";
import {
  defaultTrackId,
  roadmapTracks,
  trackStats,
  Track,
  TrackStats,
} from "@/data/roadmapTracks";
import { thmFreePathRooms, thmRoomUrl } from "@/data/thmFreePath";
import { filterReports, toggleReportStatus } from "@/lib/report-utils";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import AIChatBot from "@/components/AIChatBot";
import DocumentDiagram from "@/components/DocumentDiagram";
import KnowledgeAtlas from "@/components/KnowledgeAtlas";
import InsightsDashboard from "@/components/InsightsDashboard";
import { editKey } from "@/lib/graphEdits";
import {
  buildConceptNetwork,
  buildReportDiagram,
  buildTrackDiagram,
  layoutGraph,
  type DiagramKind,
  type PositionedGraph,
} from "@/lib/visualModel";
import type { AnalysisResult } from "../../../server/aiAnalyzer";

export type ReportStatus = "Draft" | "Published";
export type Report = {
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
  archived?: boolean;
  sourcePath?: string;
  category?: string;
};

export type TaskItem = {
  id: number;
  title: string;
  detail: string;
  group: "today" | "tomorrow" | "later";
  completed: boolean;
  date: string;
  reportId?: number;
};

export type PlaybookItem = {
  id: string;
  title: string;
  category: "linux" | "network" | "cloud" | "windows";
  description: string;
  methodology: string;
  commands: { label: string; cmd: string }[];
  tips: string[];
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
      "## Үйл ажиллагааны хураангуй\n\nLinux системийн SUID бит тохируулагдсан файлуудыг шалгаж, эрх ахиулах боломжит арга замыг тодорхойлов.\n\n## Үндсэн шалтгаан (Root cause)\n\nХандалтын буруу эрх бүхий захиалгат скрипт нь root эрхээр дуудагдаж байсныг илрүүлэв.\n\n## Ашигласан коммандууд\n\n```bash\nfind / -perm -u=s -type f 2>/dev/null\nstrings /usr/local/bin/backup-helper\n```",
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

const initialTasks: TaskItem[] = [
  {
    id: 1,
    title: "Write Linux PrivEsc report",
    detail: "THM / Linux PrivEsc / Live Fire",
    group: "today",
    completed: false,
    date: "Өнөөдөр",
    reportId: 1,
  },
  {
    id: 2,
    title: "Capture the cloud IAM logic",
    detail: "CloudGoat / IAM / Foundations",
    group: "today",
    completed: false,
    date: "Ноорог",
    reportId: 2,
  },
  {
    id: 3,
    title: "Finish packet anatomy notes",
    detail: "THM / Networking Basics / Foundations",
    group: "tomorrow",
    completed: false,
    date: "Маргааш",
    reportId: 3,
  },
  {
    id: 4,
    title: "Build Windows log triage card",
    detail: "THM / Intro to Windows / Foundations",
    group: "later",
    completed: false,
    date: "9-р сарын 18",
    reportId: 4,
  },
];

const initialPlaybooks: PlaybookItem[] = [
  {
    id: "linux-privesc",
    title: "Эрх ахиулах арга зүй",
    category: "linux",
    description:
      "Linux SUID, Capabilities, Cronjobs болон Sudoers тохиргоог шалгах стандарт алгоритм.",
    methodology:
      "1. Байгаа системийн мэдээллийг шалгах\n2. SUID/SGID файл хайх\n3. Sudoers эрхийг шалгах\n4. Cron job шалгах\n5. Capabilities шалгах",
    commands: [
      { label: "SUID бит хайх", cmd: "find / -perm -u=s -type f 2>/dev/null" },
      { label: "Sudo эрх шалгах", cmd: "sudo -l" },
      { label: "Capabilities хайх", cmd: "getcap -r / 2>/dev/null" },
      { label: "Cron даалгаврууд", cmd: "cat /etc/crontab /etc/cron.*/* 2>/dev/null" },
    ],
    tips: [
      "GTFOBins сайтаас тухайн SUID binary-г шалгаарай.",
      "Root эрхээр дуудагдаж байгаа writable скриптүүд анхаарал татна.",
    ],
  },
  {
    id: "packet-analysis",
    title: "Сүлжээний багц шинжилгээ",
    category: "network",
    description:
      "Wireshark болон tcpdump ашиглан сэжигтэй урсгал, handshake алдааг илрүүлэх.",
    methodology:
      "1. PCAP файлыг tcpdump/tshark-аар хураангуйлах\n2. Сэжигтэй IP хаяг болон порт хайх\n3. Stream follow хийж текст үзэх\n4. Хэвийн бус SYN/RST харьцааг тооцоолох",
    commands: [
      { label: "Трафик барих", cmd: "sudo tcpdump -i any -nn -s0 -w capture.pcap" },
      { label: "HTTP хүсэлт шүүх", cmd: "tshark -r capture.pcap -Y 'http.request' -T fields -e ip.src -e http.host -e http.request.uri" },
      { label: "DNS query шүүх", cmd: "tshark -r capture.pcap -Y 'dns.flags.response == 0' -T fields -e dns.qry.name" },
    ],
    tips: [
      "Wireshark-ийн 'Follow TCP Stream' комманд маш хурдан агуулгыг харуулдаг.",
      "TLS handshake-ийн SNI талбараар шифрлэгдсэн домэйнийг илрүүлж болно.",
    ],
  },
  {
    id: "cloud-iam",
    title: "Клауд IAM үнэлгээ",
    category: "cloud",
    description:
      "AWS IAM бодлогын хэт өргөн эрхүүд болон Privilege Escalation vectors илрүүлэх.",
    methodology:
      "1. Одоогийн identify-ийг тодорхойлох (sts get-caller-identity)\n2. Олгогдсон бодлогуудыг жагсаах\n3. PassRole, CreatePolicyVersion эрхүүд байгаа эсэхийг шалгах\n4. CloudGoat эсвэл Pacu ашиглан шалгах",
    commands: [
      { label: "Хэн болохыг шалгах", cmd: "aws sts get-caller-identity" },
      { label: "Бодлогуудыг жагсаах", cmd: "aws iam list-attached-user-policies --user-name TargetUser" },
      { label: "Бодлогын бичиглэл харах", cmd: "aws iam get-policy-version --policy-arn arn:aws:iam::... --version-id v1" },
    ],
    tips: [
      "iam:PassRole + ec2:RunInstances хослол нь root руу хүрэх хамгийн түгээмэл вектор.",
      "Condition block-д IP restriction байгаа эсэхийг байнга шалга.",
    ],
  },
  {
    id: "windows-triage",
    title: "Windows лог триаж",
    category: "windows",
    description:
      "Event 4624, 4625, 4688 бүртгэлүүдээс Process Injection болон халдлагыг ангилах.",
    methodology:
      "1. PowerShell Get-WinEvent ашиглан Security лог унших\n2. Event 4625 (Logon failure) олноор гарсан эсэхийг тоолох\n3. Event 4688 (Process creation)-аар комманд мөрийн аргументуудыг шүүх",
    commands: [
      { label: "Амжилтгүй нэвтрэлт", cmd: "Get-WinEvent -FilterHashtable @{LogName='Security';Id=4625} -MaxEvents 50" },
      { label: "Шинэ процесс үүсэх", cmd: "Get-WinEvent -FilterHashtable @{LogName='Security';Id=4688} -MaxEvents 50 | Select TimeCreated, Message" },
      { label: "Sysmon 1 (Process)", cmd: "Get-WinEvent -FilterHashtable @{LogName='Microsoft-Windows-Sysmon/Operational';Id=1} -MaxEvents 20" },
    ],
    tips: [
      "Process Creation-д CommandLine auditing асаасан байх шаардлагатай.",
      "Base64 encoded PowerShell коммандуудыг (-enc) шууд декод хийж үзээрэй.",
    ],
  },
];

const navItems = [
  { label: "Ерөнхий", icon: LayoutDashboard },
  { label: "Тайлан", icon: FileText },
  { label: "Сургалт", icon: BookOpen },
  { label: "Замын зураг", icon: Target },
  { label: "Атлас", icon: Network },
  { label: "Диаграм", icon: Waypoints },
  { label: "Дүн шинжилгээ", icon: ChartBar },
];

const trackIcons: Record<string, typeof Compass> = {
  "thm-free-path": Compass,
  "pico-ctf-cylab": FlaskConical,
  "thm-paid-ad": Server,
  "htb-flaws": Crosshair,
  "oscp-cloud": Award,
};

const reportTemplates = [
  {
    key: "custom",
    label: "Кибер талбарын тэмдэглэл",
    source: "Cyber" as const,
    stage: "Foundations",
    tags: ["pentest-report", "reconnaissance", "evidence"],
    content:
      "# Penetration Test Report\n\n## 1. Executive Summary\n\n\n## 2. Scope and Authorization\n\n- Target / room:\n- Authorized scope:\n- Date and operator:\n\n## 3. Attack Surface and Reconnaissance\n\n### Assets and services\n\n### Commands and evidence\n\n```bash\n# Add only commands run in the authorized lab\n\n```\n\n## 4. Findings\n\n### Finding 01: [Title]\n\n- Severity: Informational / Low / Medium / High / Critical\n- Asset:\n- Evidence:\n- Impact:\n- Reproduction steps:\n\n## 5. Exploitation Path\n\n1. Initial access:\n2. Discovery:\n3. Privilege escalation or lateral movement:\n4. Proof / flag:\n\n## 6. Remediation\n\n## 7. Lessons Learned\n\n## 8. Appendix\n\n- Related playbooks:\n- Related reports:\n- Screenshots / hashes:\n",
  },
  {
    key: "thm",
    label: "THM room тайлан",
    source: "THM" as const,
    stage: "Foundations",
    tags: ["tryhackme", "room-debrief"],
    content:
      "# TryHackMe Room Write-up\n\n## 1. Room Overview\n\n- Room:\n- Difficulty:\n- Objective:\n- Link:\n\n## 2. Enumeration\n\n### Services and attack surface\n\n### Commands\n\n```bash\n\n```\n\n## 3. Initial Access\n\n- Vulnerability / weakness:\n- Evidence:\n- Credentials or foothold:\n\n## 4. Privilege Escalation\n\n- Enumeration:\n- Path selected:\n- Proof:\n\n## 5. Flags and Evidence\n\n## 6. Root Cause and Remediation\n\n## 7. Lessons Learned\n\n## 8. Related Playbooks and Tags\n\n",
  },
  {
    key: "picoctf",
    label: "picoCTF challenge тайлан",
    source: "picoCTF" as const,
    stage: "Live Fire",
    tags: ["picoctf", "challenge"],
    content:
      "## Challenge-ийн ангилал\n\nReverse engineering / Web exploitation шинжилгээ.\n\n## Flag олдсон арга\n\n",
  },
  {
    key: "htb",
    label: "HTB машин тайлан",
    source: "HTB" as const,
    stage: "Pro Arena",
    tags: ["hackthebox", "machine"],
    content:
      "## Машины мэдээлэл\n\nАнхны хандалт (User shell) ба эрх ахиулалт (Root flag).\n\n## Эмзэг байдал\n\n",
  },
  {
    key: "cloud",
    label: "Cloud security довтолгооны төлөвлөгөө",
    source: "Cloud" as const,
    stage: "Deployment",
    tags: ["cloud", "iam"],
    content:
      "## Клауд орчны бүтэц\n\nIAM, S3, болон дэд бүтцийн тохиргооны шалгалт.\n\n## Эрсдэлийн үнэлгээ\n\n",
  },
];

function quickHash(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0;
  }
  return hash;
}

function normalizeNoteMarkdown(md: string): string {
  let out = String(md ?? "");
  out = out
    .split("\n")
    .filter(line => !line.includes("ADD THIS TO YOUR OBSIDIAN VAULT"))
    .join("\n");
  out = out.replace(/^Tags:\s*.*$/gim, "");
  out = out.replace(/^>\s*\[!note\]\s*/gim, "> ");
  const lines = out.split("\n");
  const quoteLines = lines.filter(l => l.trim().startsWith(">")).length;
  if (lines.length > 0 && quoteLines / lines.length > 0.6) {
    out = lines.map(l => l.replace(/^>\s?/, "")).join("\n");
  }
  out = out.replace(/==([^=]+)==/g, "**$1**");
  return out;
}

function readReports(): Report[] {
  try {
    const saved = localStorage.getItem("operator-dossier-reports");
    const reports = saved ? JSON.parse(saved) : initialReports;
    const imported = importedKnowledgeNotes.map(note => ({
      ...note,
      tags: [...note.tags],
      source: note.source as Report["source"],
      status: note.status as ReportStatus,
    }));
    const importedById = new Map<number, (typeof imported)[number]>(
      imported.map(note => [note.id, note])
    );
    const migrated = reports.map((report: Report) => {
      const current = importedById.get(report.id);
      if (!current) return report;
      return {
        ...report,
        title: current.title,
        tags: current.tags,
        sourcePath: current.sourcePath,
        category: current.category,
      };
    });
    return [...migrated, ...imported.filter(note => !reports.some((report: Report) => report.id === note.id))];
  } catch {
    return [...initialReports, ...importedKnowledgeNotes.map(note => ({
      ...note,
      tags: [...note.tags],
      source: note.source as Report["source"],
      status: note.status as ReportStatus,
    }))];
  }
}

export function formatReportDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function parseReportDate(value: string): Date | null {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

let localStorageFullWarned = false;

function safeSetItem(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch (error) {
    console.error(`[Storage] Failed to persist "${key}" to localStorage`, error);
    if (!localStorageFullWarned) {
      localStorageFullWarned = true;
      toast.warning(
        "Локал хадгалалт дүүрэн — хамгийн найдвартай хадгалалт нь клауд синхрончлол."
      );
    }
  }
}

function saveReports(reports: Report[]) {
  safeSetItem("operator-dossier-reports", JSON.stringify(reports));
}

function readTasks(): TaskItem[] {
  try {
    const saved = localStorage.getItem("operator-dossier-tasks");
    return saved ? JSON.parse(saved) : initialTasks;
  } catch {
    return initialTasks;
  }
}

function saveTasks(tasks: TaskItem[]) {
  safeSetItem("operator-dossier-tasks", JSON.stringify(tasks));
}

function readPlaybooks(): PlaybookItem[] {
  const imported = importedKnowledgePlaybooks.map(playbook => ({
    ...playbook,
    commands: playbook.commands.map(command => ({ ...command })),
    tips: [...playbook.tips],
  }));
  try {
    const saved = localStorage.getItem("operator-dossier-playbooks");
    const playbooks = saved ? JSON.parse(saved) : initialPlaybooks;
    return [
      ...playbooks,
      ...imported.filter(
        playbook => !playbooks.some((item: PlaybookItem) => item.id === playbook.id)
      ),
    ];
  } catch {
    return [...initialPlaybooks, ...imported];
  }
}

function savePlaybooks(playbooks: PlaybookItem[]) {
  localStorage.setItem("operator-dossier-playbooks", JSON.stringify(playbooks));
}

function readTrackProgress(): Record<string, boolean> {
  let next: Record<string, boolean> = {};
  try {
    const saved = localStorage.getItem("operator-dossier-track-progress");
    const parsed = saved ? JSON.parse(saved) : {};
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      next = parsed as Record<string, boolean>;
    }
  } catch {
    next = {};
  }
  try {
    const legacy = localStorage.getItem("operator-dossier-thm-progress");
    if (legacy) {
      const old = JSON.parse(legacy) as Record<string, boolean>;
      if (old && typeof old === "object") {
        for (const [roomId, done] of Object.entries(old)) {
          const key = `thm-free-path:${roomId}`;
          if (done && !next[key]) next[key] = true;
        }
      }
    }
  } catch {}
  return next;
}

function saveTrackProgress(progress: Record<string, boolean>) {
  safeSetItem("operator-dossier-track-progress", JSON.stringify(progress));
}

function getWorkspaceKey() {
  const existing = localStorage.getItem("operator-dossier-workspace-key");
  if (existing) return existing;
  const next = `workspace-${crypto.randomUUID()}`;
  localStorage.setItem("operator-dossier-workspace-key", next);
  return next;
}

function reportMetaStorageKey(workspaceKey: string) {
  return `operator-dossier-report-meta:${workspaceKey}`;
}

function readReportMeta(workspaceKey: string): Record<string, string> {
  try {
    const parsed = JSON.parse(
      localStorage.getItem(reportMetaStorageKey(workspaceKey)) ?? "{}"
    );
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as Record<string, string>;
    }
  } catch {}
  return {};
}

function saveReportMeta(workspaceKey: string, meta: Record<string, string>) {
  safeSetItem(reportMetaStorageKey(workspaceKey), JSON.stringify(meta));
}

function touchReportMeta(workspaceKey: string, id: number) {
  const meta = readReportMeta(workspaceKey);
  meta[String(id)] = new Date().toISOString();
  saveReportMeta(workspaceKey, meta);
}

const PUBLIC_VIEW_STORAGE_KEY = "operator-dossier-public-view";

function initialPublicView(): boolean {
  try {
    if (new URLSearchParams(window.location.search).has("public")) return true;
    return localStorage.getItem(PUBLIC_VIEW_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
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
    readTime: `${estimatedMin < 10 ? "0" : ""}${estimatedMin} min`,
    date: getValue("date") || formatReportDate(new Date()),
    excerpt: body
      .replace(/^#+\s+/gm, "")
      .replace(/\s+/g, " ")
      .slice(0, 150),
    content: body,
  };
}

function MarkdownPreview({ content }: { content: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  const html = useMemo(() => {
    const raw = marked.parse(normalizeNoteMarkdown(content), { gfm: true, breaks: false, async: false });
    return DOMPurify.sanitize(String(raw), { ADD_ATTR: ["target"] });
  }, [content]);

  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;
    root.querySelectorAll("pre").forEach(pre => {
      if (pre.querySelector(".md-copy-btn")) return;
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "md-copy-btn";
      btn.textContent = "Хуулах";
      btn.addEventListener("click", () => {
        const text = (pre.querySelector("code") ?? pre).textContent ?? "";
        navigator.clipboard.writeText(text);
        btn.textContent = "Хуулагдлаа!";
        window.setTimeout(() => (btn.textContent = "Хуулах"), 1200);
      });
      pre.appendChild(btn);
    });
  }, [html]);

  return (
    <div
      className="markdown-preview"
      ref={containerRef}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

export default function Home() {
  const [activeNav, setActiveNav] = useState("Ерөнхий");
  const [reports, setReports] = useState<Report[]>(readReports);
  const [tasks, setTasks] = useState<TaskItem[]>(readTasks);
  const [playbooks, setPlaybooks] = useState<PlaybookItem[]>(readPlaybooks);
  const [trackProgress, setTrackProgress] = useState<Record<string, boolean>>(readTrackProgress);
  const [activeTrackId, setActiveTrackId] = useState(
    () => localStorage.getItem("operator-dossier-active-track") || defaultTrackId
  );
  const [workspaceKey, setWorkspaceKey] = useState(() => getWorkspaceKey());
  const [editingWorkspaceKey, setEditingWorkspaceKey] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState(1);
  const { user: authUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const displayName = authUser?.name || "Operator";
  const [statusFilter, setStatusFilter] = useState<"All" | ReportStatus | "Archived">("All");
  const [tagFilter, setTagFilter] = useState("All");
  const [trackFilter, setTrackFilter] = useState("All");
  const [query, setQuery] = useState("");
  const [sortMode, setSortMode] = useState<"newest" | "oldest" | "title" | "readTime">("newest");
  const [mobileNav, setMobileNav] = useState(false);

  const [editorOpen, setEditorOpen] = useState(false);
  const [editingReportId, setEditingReportId] = useState<number | null>(null);
  const [selectedPlaybook, setSelectedPlaybook] = useState<PlaybookItem | null>(null);
  const [playbookEditorOpen, setPlaybookEditorOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [commandSearch, setCommandSearch] = useState("");
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [optionsMenuOpen, setOptionsMenuOpen] = useState(false);

  const [newTitle, setNewTitle] = useState("");
  const [newRoom, setNewRoom] = useState("");
  const [newStage, setNewStage] = useState("Foundations");
  const [newSource, setNewSource] = useState<Report["source"]>("Cyber");
  const [newTrackId, setNewTrackId] = useState("thm-free-path");
  const [newTrackSectionId, setNewTrackSectionId] = useState("level-1");
  const [newCoreTags, setNewCoreTags] = useState("");
  const [templateKey, setTemplateKey] = useState("custom");
  const [newContent, setNewContent] = useState("");
  const [attachment, setAttachment] = useState<string | undefined>();

  const [addingTaskGroup, setAddingTaskGroup] = useState<"today" | "tomorrow" | "later" | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [editingTaskTitle, setEditingTaskTitle] = useState("");
  const [editingTaskDetail, setEditingTaskDetail] = useState("");

  const [newPbTitle, setNewPbTitle] = useState("");
  const [newPbCategory, setNewPbCategory] = useState<"linux" | "network" | "cloud" | "windows">("linux");
  const [newPbDesc, setNewPbDesc] = useState("");
  const [newPbMethodology, setNewPbMethodology] = useState("");
  const [newPbCmdLabel, setNewPbCmdLabel] = useState("");
  const [newPbCmdText, setNewPbCmdText] = useState("");

  const [calMonthOffset, setCalMonthOffset] = useState(0);
  const [selectedDay, setSelectedDay] = useState<number | null>(new Date().getDate());

  const [diagramSource, setDiagramSource] = useState<
    { type: "report"; id: number } | { type: "track"; id: string }
  >({ type: "report", id: 1 });
  const [diagramKind, setDiagramKind] = useState<DiagramKind>("mindmap");
  const [trackDiagramFull, setTrackDiagramFull] = useState(false);
  const [aiResult, setAiResult] = useState<AnalysisResult | null>(null);

  const [publicView, setPublicView] = useState(initialPublicView);
  const [chatOpen, setChatOpen] = useState(false);

  function setPublicViewMode(next: boolean) {
    setPublicView(next);
    try {
      localStorage.setItem(PUBLIC_VIEW_STORAGE_KEY, next ? "1" : "0");
      const url = new URL(window.location.href);
      if (next) url.searchParams.set("public", "1");
      else url.searchParams.delete("public");
      window.history.replaceState(null, "", url.toString());
    } catch {}
  }

  function guardPublicMode(): boolean {
    if (publicView) {
      toast.info(
        "Нийтлэг горимд засвар хийх боломжгүй — бодит горимд буцаад засна уу."
      );
      return true;
    }
    return false;
  }

  const fileInput = useRef<HTMLInputElement>(null);
  const obsidianInput = useRef<HTMLInputElement>(null);
  const backupInput = useRef<HTMLInputElement>(null);
  const mongoHydrated = useRef(false);
  const workspaceSwitched = useRef(false);

  const mongoReports = trpc.reports.list.useQuery(
    { workspaceKey },
    { retry: false }
  );
  const mongoStatus = trpc.reports.status.useQuery(undefined, { retry: false });
  const persistReports = trpc.reports.sync.useMutation();
  const isCloudBackend = mongoStatus.data?.backend === "mongodb";

  const trpcUtils = trpc.useUtils();
  const insightsQuery = trpc.ai.insights.atlas.useQuery({ workspaceKey }, { retry: false, staleTime: 0 });
  const refreshInsightsMutation = trpc.ai.insights.refresh.useMutation();

  const reportsFingerprint = useMemo(() => {
    return reports
      .map(r => `${r.id}:${quickHash(r.title + r.content)}:${r.tags.join(",")}`)
      .sort()
      .join("|");
  }, [reports]);

  useEffect(() => {
    if (reportsFingerprint) {
      trpcUtils.ai.insights.atlas.invalidate({ workspaceKey });
    }
  }, [reportsFingerprint, workspaceKey, trpcUtils]);

  const aiSummary = useMemo(() => {
    const snap = insightsQuery.data?.snapshot;
    if (!snap) return null;
    const conceptCounts = new Map<string, number>();
    for (const ins of insightsQuery.data?.insights ?? []) {
      for (const c of ins.concepts ?? []) {
        const key = String(c).trim();
        if (!key) continue;
        conceptCounts.set(key, (conceptCounts.get(key) ?? 0) + 1);
      }
    }
    const topConcepts = [...conceptCounts.entries()]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .slice(0, 12)
      .map(([c]) => c);
    return {
      provider: snap.provider,
      model: snap.model,
      analyzed: snap.analyzed,
      total: snap.total,
      concepts: topConcepts,
    };
  }, [insightsQuery.data]);

  const selectedInsight = useMemo(() => {
    if (!insightsQuery.data) return null;
    return insightsQuery.data.insights.find(i => i.id === selectedId) ?? null;
  }, [insightsQuery.data, selectedId]);

  function refreshInsights() {
    refreshInsightsMutation.mutate(
      { workspaceKey },
      {
        onSuccess: () => {
          toast.success("AI шинжилгээ шинэчлэгдлээ");
          trpcUtils.ai.insights.atlas.invalidate({ workspaceKey });
        },
        onError: () => toast.error("Дахин шинжлэх амжилтгүй"),
      }
    );
  }

  useEffect(() => {
    if (!mongoReports.data || mongoHydrated.current) return;
    if (mongoReports.data.length) {
      const remoteRows = mongoReports.data as unknown as (Report & { updatedAt?: string })[];
      const imported = importedKnowledgeNotes.map(note => ({
        ...note,
        tags: [...note.tags],
        source: note.source as Report["source"],
        status: note.status as ReportStatus,
      }));
      const importedById = new Map<number, (typeof imported)[number]>(
        imported.map(note => [note.id, note])
      );
      const remoteReports = remoteRows.map(report => {
        const current = importedById.get(report.id);
        return current
          ? { ...report, title: current.title, tags: current.tags, category: current.category, sourcePath: current.sourcePath }
          : report;
      });
      const localOnly = publicView
        ? []
        : reports.filter(
            r =>
              !remoteReports.some(report => report.id === r.id) &&
              !imported.some(note => note.id === r.id)
          );
      const mergedReports = [
        ...remoteReports,
        ...imported.filter(note => !remoteReports.some(report => report.id === note.id)),
        ...localOnly,
      ];
      setReports(mergedReports);
      setSelectedId(mergedReports[0]?.id || 1);
      const meta = readReportMeta(workspaceKey);
      let metaChanged = false;
      for (const row of remoteReports) {
        if (typeof row.updatedAt === "string" && !meta[String(row.id)]) {
          meta[String(row.id)] = row.updatedAt;
          metaChanged = true;
        }
      }
      if (metaChanged) saveReportMeta(workspaceKey, meta);
    }
    mongoHydrated.current = true;
    workspaceSwitched.current = false;
  }, [mongoReports.data]);

  function adoptSyncedState(
    result:
      | { persisted: boolean; count: number; reports: (Report & { updatedAt: string })[] }
      | undefined,
    key: string
  ) {
    if (!result || !result.reports.length) return;
    const meta = readReportMeta(key);
    const nextMeta = { ...meta };
    let metaChanged = false;
    for (const row of result.reports) {
      if (nextMeta[String(row.id)] !== row.updatedAt) {
        nextMeta[String(row.id)] = row.updatedAt;
        metaChanged = true;
      }
    }
    if (metaChanged) saveReportMeta(key, nextMeta);
    setReports(current => {
      let changed = false;
      const byId = new Map<number, Report>(current.map(r => [r.id, r]));
      for (const row of result.reports) {
        const { updatedAt, ...serverReport } = row;
        const local = byId.get(row.id);
        if (!local) {
          byId.set(row.id, serverReport as Report);
          changed = true;
        } else if (meta[String(row.id)] !== row.updatedAt) {
          byId.set(row.id, { ...local, ...serverReport } as Report);
          changed = true;
        }
      }
      return changed ? Array.from(byId.values()) : current;
    });
  }

  const lastSyncFailureToast = useRef(0);
  useEffect(() => {
    saveReports(reports);
    if (
      mongoHydrated.current &&
      !workspaceSwitched.current &&
      reports.length &&
      !publicView
    ) {
      const meta = readReportMeta(workspaceKey);
      persistReports.mutate(
        {
          workspaceKey,
          reports: reports.map(report => ({
            ...report,
            updatedAt: meta[String(report.id)] ?? new Date().toISOString(),
          })),
          seenIds: Object.keys(meta).map(Number).filter(Number.isFinite),
        },
        {
          onError: (error) => {
            const now = Date.now();
            if (now - lastSyncFailureToast.current < 30_000) return;
            lastSyncFailureToast.current = now;
            const unauthorized =
              (error as { data?: { code?: string } })?.data?.code === "UNAUTHORIZED";
            toast.warning(
              unauthorized
                ? "Клауд синхрончлол нэвтрэлт шаардана — өгөгдөл одоогоор локал хадгалагдана."
                : `Клауд синхрончлол амжилтгүй: ${error.message?.split("\n")[0]?.slice(0, 120)}`
            );
          },
          onSuccess: (result) => adoptSyncedState(result, workspaceKey),
        }
      );
    }
  }, [reports, workspaceKey, publicView]);

  useEffect(() => {
    saveTasks(tasks);
  }, [tasks]);

  useEffect(() => {
    savePlaybooks(playbooks);
  }, [playbooks]);

  useEffect(() => {
    saveTrackProgress(trackProgress);
  }, [trackProgress]);

  useEffect(() => {
    try {
      localStorage.setItem("operator-dossier-active-track", activeTrackId);
    } catch {}
  }, [activeTrackId]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCommandPaletteOpen(prev => !prev);
      }
      if (e.key === "Escape") {
        setEditorOpen(false);
        setSelectedPlaybook(null);
        setPlaybookEditorOpen(false);
        setCommandPaletteOpen(false);
        setNotifOpen(false);
        setProfileOpen(false);
        setDeleteConfirmId(null);
        setOptionsMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const visibleReports = useMemo<Report[]>(
    () =>
      publicView
        ? reports.filter(report => report.status === "Published" && !report.archived)
        : reports,
    [reports, publicView]
  );

  const reportTrackOptions = useMemo(
    () => [
      { id: "thm-free-path", label: "THM Free Path", match: (report: Report) => report.source === "THM" },
      { id: "pico-ctf-cylab", label: "picoCTF / CyLab", match: (report: Report) => report.source === "picoCTF" },
      { id: "thm-paid-ad", label: "THM Paid / AD", match: (report: Report) => report.stage === "Deep Offensive" || report.tags.some(tag => /ad|active-directory|kerberos/.test(tag)) },
      { id: "htb-flaws", label: "HTB / flAWS", match: (report: Report) => report.source === "HTB" },
      { id: "oscp-cloud", label: "OSCP / Cloud", match: (report: Report) => report.source === "Cloud" || report.category === "cloud-and-credentials" },
    ],
    []
  );
  const selectedTrackOption = reportTrackOptions.find(option => option.id === trackFilter);
  const visibleSubTags = useMemo(
    () => Array.from(new Set((selectedTrackOption ? visibleReports.filter(selectedTrackOption.match) : visibleReports).flatMap(report => report.tags))).sort(),
    [selectedTrackOption, visibleReports]
  );

  const filteredReports = useMemo<Report[]>(() => {
    let list: Report[] = visibleReports;
    if (statusFilter === "Archived") {
      list = list.filter(r => r.archived);
    } else {
      list = list.filter(r => !r.archived);
      if (statusFilter !== "All") {
        list = list.filter(r => r.status === statusFilter);
      }
    }
    if (tagFilter !== "All") {
      list = list.filter(r => r.tags.includes(tagFilter));
    }
    if (selectedTrackOption) {
      list = list.filter(selectedTrackOption.match);
    }
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(
        r =>
          r.title.toLowerCase().includes(q) ||
          r.room.toLowerCase().includes(q) ||
          r.tags.some(t => t.toLowerCase().includes(q)) ||
          r.content.toLowerCase().includes(q)
      );
    }

    return [...list].sort((a, b) => {
      if (sortMode === "newest") return b.id - a.id;
      if (sortMode === "oldest") return a.id - b.id;
      if (sortMode === "title") return a.title.localeCompare(b.title);
      if (sortMode === "readTime") return parseInt(a.readTime) - parseInt(b.readTime);
      return 0;
    });
  }, [visibleReports, statusFilter, tagFilter, trackFilter, selectedTrackOption, query, sortMode]);

  const selectedReport =
    visibleReports.find(report => report.id === selectedId) || visibleReports[0];
  const publishedCount = reports.filter(
    report => report.status === "Published"
  ).length;
  const completedTasksCount = tasks.filter(t => t.completed).length;
  const trackStatsMap = useMemo(() => {
    const map: Record<string, TrackStats> = {};
    for (const track of roadmapTracks) {
      map[track.id] = trackStats(track, trackProgress);
    }
    return map;
  }, [trackProgress]);
  const activeTrack: Track =
    roadmapTracks.find(track => track.id === activeTrackId) || roadmapTracks[0];

  const atlasQuery = trpc.ai.status.useQuery(undefined, { retry: false });
  const aiAnalyze = trpc.ai.analyze.useMutation();

  const diagramReport =
    diagramSource.type === "report"
      ? visibleReports.find(report => report.id === diagramSource.id)
      : undefined;
  const diagramTrack =
    diagramSource.type === "track"
      ? roadmapTracks.find(track => track.id === diagramSource.id)
      : undefined;

  const diagramGraph = useMemo<PositionedGraph>(() => {
    if (aiResult && diagramReport) {
      return layoutGraph(
        buildConceptNetwork({
          id: String(diagramReport.id),
          title: diagramReport.title,
          concepts: aiResult.concepts,
        }),
        "network"
      );
    }
    if (diagramReport) return buildReportDiagram(diagramReport, diagramKind);
    if (diagramTrack) {
      return buildTrackDiagram(diagramTrack, trackProgress, { full: trackDiagramFull });
    }
    return { title: "", nodes: [], edges: [], width: 0, height: 0 };
  }, [aiResult, diagramReport, diagramKind, diagramTrack, trackProgress, trackDiagramFull]);

  const diagramAiInsight = useMemo(() => {
    if (!diagramReport) return null;
    if (aiResult && diagramReport) {
      return {
        id: diagramReport.id,
        title: diagramReport.title,
        source: diagramReport.source,
        stage: diagramReport.stage,
        tags: diagramReport.tags,
        summary: aiResult.summary,
        concepts: aiResult.concepts,
        steps: aiResult.steps,
        provider: aiResult.provider,
        model: aiResult.model,
      } as any;
    }
    return insightsQuery.data?.insights.find(i => i.id === diagramReport.id) ?? null;
  }, [diagramReport, aiResult, insightsQuery.data]);

  const relatedNotes = useMemo(() => {
    if (!insightsQuery.data || !selectedReport) return [];
    const rels = insightsQuery.data.relations.filter(r => r.source === selectedReport.id || r.target === selectedReport.id);
    const sorted = [...rels].sort((a, b) => b.weight - a.weight).slice(0, 6);
    return sorted.map(r => {
      const otherId = r.source === selectedReport.id ? r.target : r.source;
      const other = visibleReports.find(rep => rep.id === otherId);
      return { ...r, otherId, otherTitle: other?.title ?? `Тайлан ${otherId}` };
    });
  }, [insightsQuery.data, selectedReport, visibleReports]);

  function openReportInReader(reportId: number) {
    setSelectedId(reportId);
    setActiveNav("Тайлан-уншилт");
  }

  function openTrackInRoadmap(trackId: string) {
    setActiveTrackId(trackId);
    setActiveNav("Замын зураг");
  }

  function openDiagramForReport(reportId: number) {
    setAiResult(null);
    setDiagramSource({ type: "report", id: reportId });
    setDiagramKind("mindmap");
    setActiveNav("Диаграм");
  }

  function openDiagramForTrack(trackId: string) {
    setAiResult(null);
    setDiagramSource({ type: "track", id: trackId });
    setDiagramKind("tree");
    setActiveNav("Диаграм");
  }

  function runAiAnalysis() {
    if (!diagramReport) return;
    aiAnalyze.mutate(
      { content: diagramReport.content, maxConcepts: 9 },
      {
        onSuccess: result => {
          setAiResult(result);
          toast.success(
            result.provider === "moonshot"
              ? `AI шинжилгээ (${result.model}) бэлэн боллоо`
              : "Орон нутгийн шинжилгээ бэлэн боллоо"
          );
          if (result.note) toast.info(result.note);
        },
        onError: () => toast.error("AI шинжилгээ амжилтгүй боллоо"),
      }
    );
  }

  function openNewReportEditor() {
    if (guardPublicMode()) return;
    setEditingReportId(null);
    setNewTitle("");
    setNewRoom("");
    setNewStage("Foundations");
    setNewSource("Cyber");
    setNewTrackId("thm-free-path");
    setNewTrackSectionId("level-1");
    setNewCoreTags("");
    setTemplateKey("custom");
    setNewContent(reportTemplates[0].content);
    setAttachment(undefined);
    setEditorOpen(true);
  }

  function openRoomReportEditor(room: (typeof thmFreePathRooms)[number]) {
    setEditingReportId(null);
    setNewTitle(`${room.title} - room notes`);
    setNewRoom(`THM / ${room.title}`);
    setNewStage("Foundations");
    setNewSource("THM");
    setNewTrackId("thm-free-path");
    setNewTrackSectionId(room.levelId);
    setNewCoreTags("room-notes");
    setTemplateKey("thm");
    setNewContent(
      `## Room-ийн зорилго\n\n${room.title}\n\n## THM холбоос\n\n${thmRoomUrl(room.slug)}\n\n## Олсон зүйлс\n\n\n## Ашигласан техникүүд\n\n\n## Дүгнэлт\n\n`
    );
    setAttachment(undefined);
    setEditorOpen(true);
  }

  function toggleTrackItem(trackId: string, itemId: string) {
    if (guardPublicMode()) return;
    const key = `${trackId}:${itemId}`;
    setTrackProgress(current => ({ ...current, [key]: !current[key] }));
  }

  function openEditReport(report: Report) {
    if (guardPublicMode()) return;
    setEditingReportId(report.id);
    setNewTitle(report.title);
    setNewRoom(report.room);
    setNewStage(report.stage);
    setNewSource(report.source);
    const matchingTrack = reportTrackOptions.find(option => option.match(report));
    setNewTrackId(matchingTrack?.id ?? "thm-free-path");
    setNewTrackSectionId("level-1");
    setNewCoreTags(report.tags.filter(tag => !tag.startsWith("roadmap-") && !tag.startsWith("section-")).join(", "));
    setTemplateKey("custom");
    setNewContent(report.content);
    setAttachment(report.image);
    setEditorOpen(true);
    setOptionsMenuOpen(false);
  }

  function applyTemplate(key: string) {
    const template =
      reportTemplates.find(item => item.key === key) || reportTemplates[0];
    setTemplateKey(template.key);
    setNewSource(template.source);
    setNewStage(template.stage);
    setNewContent(template.content);
  }

  function selectedEditorTrack() {
    return roadmapTracks.find(track => track.id === newTrackId) ?? roadmapTracks[0];
  }

  function applyTrackDefaults(trackId: string) {
    setNewTrackId(trackId);
    const track = roadmapTracks.find(item => item.id === trackId) ?? roadmapTracks[0];
    setNewTrackSectionId(track.sections[0]?.id ?? "");
    if (trackId === "thm-free-path" || trackId === "thm-paid-ad") setNewSource("THM");
    else if (trackId === "pico-ctf-cylab") setNewSource("picoCTF");
    else if (trackId === "htb-flaws") setNewSource("HTB");
    else if (trackId === "oscp-cloud") setNewSource("Cloud");
  }

  function handleAttachment(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const MAX_ATTACHMENT_BYTES = 1.5 * 1024 * 1024;
    if (!file.type.startsWith("image/")) {
      toast.error("Зөвхөн зургын файл (PNG / JPG / WEBP) сонгоно уу");
      return;
    }
    if (file.size > MAX_ATTACHMENT_BYTES) {
      toast.error(
        `Скриншот хэт том (max 1.5 MB, сонгосон ${Math.round(file.size / 1024 / 102.4) / 10} MB)`
      );
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setAttachment(String(reader.result));
      toast.success("Скриншот хавсаргагдлаа");
    };
    reader.readAsDataURL(file);
  }

  function saveReport() {
    if (!newTitle.trim()) {
      toast.error("Тайлангийн гарчиг оруулна уу!");
      return;
    }
    const wordCount = newContent.split(/\s+/).filter(Boolean).length;
    const est = Math.max(1, Math.round(wordCount / 150));
    const calculatedReadTime = `${est < 10 ? "0" : ""}${est} min`;
    const calculatedExcerpt =
      newContent
        .replace(/^#+\s+/gm, "")
        .replace(/\s+/g, " ")
        .slice(0, 140) || "Шинэ тайлангийн тэмдэглэл.";

    if (editingReportId) {
      setReports(current =>
        current.map(item =>
          item.id === editingReportId
            ? {
                ...item,
                title: newTitle.trim(),
                room: newRoom.trim() || "Unassigned room",
                source: newSource,
                stage: newStage,
                content: newContent,
                excerpt: calculatedExcerpt,
                readTime: calculatedReadTime,
                image: attachment,
                category: newTrackId,
              }
            : item
        )
      );
      touchReportMeta(workspaceKey, editingReportId);
      toast.success("Тайлан амжилттай шинэчлэгдлээ!");
    } else {
      const report: Report = {
        id: Date.now(),
        title: newTitle.trim(),
        room: newRoom.trim() || "Unassigned room",
        source: newSource,
        stage: newStage,
        tags: Array.from(
          new Set([
            `roadmap-${newTrackId}`,
            `section-${newTrackSectionId}`,
            ...newCoreTags.split(",").map(tag => tag.trim().toLowerCase().replace(/\s+/g, "-")).filter(Boolean),
            ...(reportTemplates.find(item => item.key === templateKey)?.tags || [
              "field-notes",
            ]),
          ])
        ),
        status: "Draft",
        readTime: calculatedReadTime,
        date: formatReportDate(new Date()),
        excerpt: calculatedExcerpt,
        content: newContent,
        image: attachment,
        category: newTrackId,
      };
      setReports(current => [report, ...current]);
      touchReportMeta(workspaceKey, report.id);
      setSelectedId(report.id);
      toast.success("Шинэ тайлан амжилттай үүсгэгдлээ!");
    }
    setEditorOpen(false);
    setActiveNav("Тайлан");
  }

  function deleteReport(id: number) {
    if (guardPublicMode()) return;
    setReports(current => {
      const next = current.filter(r => r.id !== id);
      if (selectedId === id && next.length > 0) {
        setSelectedId(next[0].id);
      }
      return next;
    });
    setDeleteConfirmId(null);
    setOptionsMenuOpen(false);
    toast.info("Тайлан устгагдлаа");
  }

  function archiveReport(id: number) {
    if (guardPublicMode()) return;
    setReports(current =>
      current.map(r => (r.id === id ? { ...r, archived: !r.archived } : r))
    );
    touchReportMeta(workspaceKey, id);
    setOptionsMenuOpen(false);
    toast.info("Тайлангийн архив төлөв шинэчлэгдлээ");
  }

  function copyMarkdownToClipboard(report: Report) {
    navigator.clipboard.writeText(reportToMarkdown(report));
    toast.success("Markdown санах ойд хуулагдлаа!");
  }

  function copyTextToClipboard(text: string, label = "Команд") {
    navigator.clipboard.writeText(text);
    toast.success(`${label} хуулагдлаа!`);
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
    toast.success("Markdown татагдаж эхэллээ");
  }

  function exportAllMarkdown() {
    if (guardPublicMode()) return;
    const bundle = reports.map(reportToMarkdown).join("\n---\n\n");
    downloadText("operator-dossier-all-reports.md", bundle);
    toast.success("Бүх тайланг файлд нэгтгэн татлаа");
  }

  function exportBackupJson() {
    if (guardPublicMode()) return;
    const payload = {
      kind: "operator-dossier-backup",
      version: 1,
      exportedAt: new Date().toISOString(),
      workspaceKey,
      reports,
      tasks,
      playbooks,
      trackProgress,
    };
    downloadText(
      `operator-dossier-backup-${formatReportDate(new Date()).replace(/[,\\s]+/g, "-")}.json`,
      JSON.stringify(payload, null, 2),
      "application/json"
    );
    toast.success("JSON бэкап татагдаж эхэллээ");
  }

  function handleBackupImport(event: ChangeEvent<HTMLInputElement>) {
    if (guardPublicMode()) return;
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(String(reader.result));
        if (!data || typeof data !== "object" || !Array.isArray(data.reports)) {
          throw new Error("invalid backup");
        }
        const cleanReports: Report[] = data.reports
          .filter(
            (r: Report) =>
              r &&
              typeof r.id === "number" &&
              typeof r.title === "string" &&
              typeof r.content === "string"
          )
          .map((r: Report) => ({
            ...r,
            tags: Array.isArray(r.tags) ? r.tags.filter((t: unknown) => typeof t === "string") : [],
          }));
        const ok = window.confirm(
          `Бэкап дахь ${cleanReports.length} тайланг одоогийн өгөгдлийн сантай нэгтгэх үү?\n(давхар id-тэй тайлан бэкапаас авна)`
        );
        if (!ok) return;
        setReports(current => {
          const byId = new Map(current.map(r => [r.id, r]));
          for (const r of cleanReports) byId.set(r.id, r);
          return Array.from(byId.values());
        });
        for (const r of cleanReports) touchReportMeta(workspaceKey, r.id);
        if (Array.isArray(data.tasks)) setTasks(data.tasks);
        if (Array.isArray(data.playbooks)) setPlaybooks(data.playbooks);
        if (data.trackProgress && typeof data.trackProgress === "object") {
          setTrackProgress(data.trackProgress as Record<string, boolean>);
        } else if (data.thmProgress && typeof data.thmProgress === "object") {
          const migrated = (data.thmProgress as Record<string, boolean>) || {};
          setTrackProgress(current => {
            const next = { ...current };
            for (const [roomId, done] of Object.entries(migrated)) {
              if (done) next[`thm-free-path:${roomId}`] = true;
            }
            return next;
          });
        }
        toast.success("Бэкап амжилттай импортлогдлоо");
      } catch {
        toast.error("Бэкап файл алдаатай эсвэл зөв формат биш");
      }
    };
    reader.readAsText(file);
  }

  function applyWorkspaceKey() {
    if (guardPublicMode()) return;
    if (editingWorkspaceKey === null) return;
    const next = editingWorkspaceKey.trim();
    if (next.length < 12 || next.length > 160) {
      toast.error("Ажлын түлхүүр 12–160 тэмдэгтэй байх ёстой");
      return;
    }
    if (next === workspaceKey) {
      setEditingWorkspaceKey(null);
      return;
    }
    setReports([
      ...initialReports,
      ...importedKnowledgeNotes.map(note => ({
        ...note,
        tags: [...note.tags],
        source: note.source as Report["source"],
        status: note.status as ReportStatus,
      })),
    ]);
    workspaceSwitched.current = true;
    mongoHydrated.current = false;
    setWorkspaceKey(next);
    localStorage.setItem("operator-dossier-workspace-key", next);
    setEditingWorkspaceKey(null);
    toast.success("Ажлын талбар шилжлээ — өөр төхөөрөмжөө ижил түлхүүрээр нээж синхрончилна");
  }

  function exportSelectedPdf() {
    if (!selectedReport) return;
    document.body.classList.add("print-report-mode");
    window.setTimeout(() => {
      window.print();
      document.body.classList.remove("print-report-mode");
    }, 50);
  }

  function openReportReader() {
    if (!selectedReport) return;
    setOptionsMenuOpen(false);
    setActiveNav("Тайлан-уншилт");
  }

  function closeReportReader() {
    setActiveNav("Тайлан");
  }

  function moveReader(direction: -1 | 1) {
    if (!selectedReport || filteredReports.length < 2) return;
    const currentIndex = filteredReports.findIndex(report => report.id === selectedReport.id);
    const nextIndex = (currentIndex + direction + filteredReports.length) % filteredReports.length;
    setSelectedId(filteredReports[nextIndex].id);
  }

  function handleObsidianImport(event: ChangeEvent<HTMLInputElement>) {
    if (guardPublicMode()) return;
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
        tags: Array.from(new Set([
          `roadmap-${parsed.source === "THM" ? "thm-free-path" : parsed.source === "picoCTF" ? "pico-ctf-cylab" : parsed.source === "Cloud" ? "oscp-cloud" : parsed.source === "HTB" ? "htb-flaws" : "general-reference"}`,
          ...(parsed.tags || ["obsidian-import"]),
        ])),
        status: "Draft",
        readTime: parsed.readTime || "05 min",
        date: parsed.date || formatReportDate(new Date()),
        excerpt: parsed.excerpt || "Obsidian-аас импорт хийсэн тэмдэглэл.",
        content: parsed.content || "",
        image: undefined,
        category: parsed.source === "THM" ? "thm-free-path" : parsed.source === "picoCTF" ? "pico-ctf-cylab" : parsed.source === "Cloud" ? "oscp-cloud" : parsed.source === "HTB" ? "htb-flaws" : "general-reference",
      };
      setReports(current => [imported, ...current]);
      touchReportMeta(workspaceKey, imported.id);
      setSelectedId(imported.id);
      setActiveNav("Тайлан");
      toast.success(`"${imported.title}" амжилттай импортлогдлоо!`);
    };
    reader.readAsText(file);
    event.target.value = "";
  }

  function togglePublished(reportId: number) {
    if (guardPublicMode()) return;
    setReports(current => {
      const updated = toggleReportStatus(current, reportId);
      const target = updated.find(r => r.id === reportId);
      toast.info(
        target?.status === "Published"
          ? "Тайлан нийтлэгдлээ"
          : "Тайланг ноорог төлөвт шилжүүллээ"
      );
      return updated as Report[];
    });
  }

  function toggleTask(id: number) {
    if (guardPublicMode()) return;
    setTasks(current =>
      current.map(t => {
        if (t.id === id) {
          const next = !t.completed;
          if (next) toast.success("Даалгавар биеллээ!");
          return { ...t, completed: next };
        }
        return t;
      })
    );
  }

  function addTask(group: "today" | "tomorrow" | "later") {
    if (guardPublicMode()) return;
    if (!newTaskTitle.trim()) return;
    const newTask: TaskItem = {
      id: Date.now(),
      title: newTaskTitle.trim(),
      detail: "Захиалгат ажиллагааны тэмдэглэл",
      group,
      completed: false,
      date: group === "today" ? "Өнөөдөр" : group === "tomorrow" ? "Маргааш" : "Удахгүй",
    };
    setTasks(current => [...current, newTask]);
    setNewTaskTitle("");
    setAddingTaskGroup(null);
    toast.success("Шинэ даалгавар нэмэгдлээ");
  }

  function deleteTask(id: number) {
    if (guardPublicMode()) return;
    setTasks(current => current.filter(t => t.id !== id));
    if (editingTaskId === id) setEditingTaskId(null);
    toast.info("Даалгавар хасагдлаа");
  }

  function startEditTask(task: TaskItem) {
    if (guardPublicMode()) return;
    setEditingTaskId(task.id);
    setEditingTaskTitle(task.title);
    setEditingTaskDetail(task.detail);
  }

  function cancelEditTask() {
    setEditingTaskId(null);
    setEditingTaskTitle("");
    setEditingTaskDetail("");
  }

  function saveEditTask(id: number) {
    const title = editingTaskTitle.trim();
    if (!title) {
      toast.error("Даалгаврын нэр оруулна уу");
      return;
    }
    setTasks(current =>
      current.map(task =>
        task.id === id
          ? { ...task, title, detail: editingTaskDetail.trim() || "Дэлгэрэнгүй тэмдэглэлгүй" }
          : task
      )
    );
    cancelEditTask();
    toast.success("Даалгавар шинэчлэгдлээ");
  }

  function createPlaybook() {
    if (guardPublicMode()) return;
    if (!newPbTitle.trim()) {
      toast.error("Playbook-ийн нэр оруулна уу!");
      return;
    }
    const item: PlaybookItem = {
      id: `pb-${Date.now()}`,
      title: newPbTitle.trim(),
      category: newPbCategory,
      description: newPbDesc.trim() || "Шинэ тактикийн зааварчилгаа",
      methodology: newPbMethodology.trim() || "1. Шинжилгээ хийх\n2. Туршилт явуулах",
      commands: newPbCmdText.trim()
        ? [{ label: newPbCmdLabel.trim() || "Үндсэн комманд", cmd: newPbCmdText.trim() }]
        : [],
      tips: ["Шаардлагатай бол root/admin эрхээр туршина уу."],
    };
    setPlaybooks(current => [item, ...current]);
    setPlaybookEditorOpen(false);
    setNewPbTitle("");
    setNewPbDesc("");
    setNewPbMethodology("");
    setNewPbCmdLabel("");
    setNewPbCmdText("");
    toast.success("Шинэ playbook амжилттай бүртгэгдлээ!");
  }

  const now = useMemo(() => new Date(), []);
  const displayed = useMemo(() => {
    const base = new Date(now.getFullYear(), now.getMonth() + calMonthOffset, 1);
    const year = base.getFullYear();
    const month = base.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7;
    return { year, month, daysInMonth, firstWeekday };
  }, [now, calMonthOffset]);
  const currentMonthDisplay = `${displayed.year} оны ${displayed.month + 1}-р сар`;

  const reportDays = useMemo(() => {
    const set = new Set<string>();
    for (const r of visibleReports) {
      const d = parseReportDate(r.date);
      if (d) set.add(`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`);
    }
    return set;
  }, [visibleReports]);
  const dayHasReport = (day: number) =>
    reportDays.has(`${displayed.year}-${displayed.month}-${day}`);

  function selectCalendarDay(day: number) {
    setSelectedDay(day);
    const dayReports = visibleReports
      .map(r => ({ r, d: parseReportDate(r.date) }))
      .filter(
        x =>
          x.d &&
          x.d.getFullYear() === displayed.year &&
          x.d.getMonth() === displayed.month &&
          x.d.getDate() === day
      )
      .sort((a, b) => b.r.id - a.r.id);
    if (dayReports.length) {
      setSelectedId(dayReports[0].r.id);
      setActiveNav("Тайлан");
      toast.info(`${displayed.month + 1}-р сарын ${day}: ${dayReports.length} тайлан олдлоо`);
    } else {
      toast.info(`${displayed.month + 1}-р сарын ${day}-нд тайлан байхгүй`);
    }
  }

  const isCurrentMonth =
    displayed.year === now.getFullYear() && displayed.month === now.getMonth();

  const commandResults = useMemo(() => {
    if (!commandSearch.trim()) return [];
    const q = commandSearch.toLowerCase();
    const matches: { title: string; subtitle: string; category: string; onSelect: () => void }[] = [];

    visibleReports.forEach(r => {
      if (r.title.toLowerCase().includes(q) || r.tags.some(t => t.toLowerCase().includes(q))) {
        matches.push({
          title: r.title,
          subtitle: `${r.source} / ${r.room}`,
          category: "Тайлан",
          onSelect: () => {
            setSelectedId(r.id);
            setActiveNav("Тайлан");
            setCommandPaletteOpen(false);
          },
        });
      }
    });

    playbooks.forEach(p => {
      if (p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)) {
        matches.push({
          title: p.title,
          subtitle: p.description,
          category: "Сургалт",
          onSelect: () => {
            setSelectedPlaybook(p);
            setActiveNav("Сургалт");
            setCommandPaletteOpen(false);
          },
        });
      }
    });

    tasks.forEach(t => {
      if (t.title.toLowerCase().includes(q)) {
        matches.push({
          title: t.title,
          subtitle: t.detail,
          category: "Даалгавар",
          onSelect: () => {
            setActiveNav("Ерөнхий");
            setCommandPaletteOpen(false);
          },
        });
      }
    });

    return matches;
  }, [commandSearch, visibleReports, playbooks, tasks]);

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
                className={`side-nav-item ${activeNav === item.label || (item.label === "Тайлан" && activeNav === "Тайлан-уншилт") ? "active" : ""}`}
                onClick={() => {
                  setActiveNav(item.label);
                  setMobileNav(false);
                }}
              >
                <Icon size={15} />
                <span>{item.label}</span>
                {item.label === "Тайлан" && (
                  <span className="nav-count">{visibleReports.length}</span>
                )}
                {item.label === "Сургалт" && (
                  <span className="nav-count">{playbooks.length}</span>
                )}
              </button>
            );
          })}
        </nav>
        <div className="side-section-label roadmap-label">Замын зураг</div>
        <div className="side-roadmap">
          {roadmapTracks.map(track => {
            const Icon = trackIcons[track.id] || Compass;
            const stats = trackStatsMap[track.id];
            return (
              <div
                key={track.id}
                className={`side-roadmap-row clickable-card ${activeTrackId === track.id ? "roadmap-active" : ""}`}
                onClick={() => {
                  setActiveTrackId(track.id);
                  setActiveNav("Замын зураг");
                }}
                title="Энэ track-ын дэлгэрэнгүйг харах"
              >
                <span className="stage-icon">
                  <Icon size={13} />
                </span>
                <div>
                  <strong>{track.name}</strong>
                  <small>{track.detail}</small>
                </div>
                <span className="mini-progress">{stats.percent}%</span>
              </div>
            );
          })}
        </div>
        <div
          className="sidebar-footer clickable-card"
          onClick={() => setProfileOpen(true)}
          title="Операторын тохиргоо"
        >
          <div className="profile-dot">{(displayName || "O").charAt(0).toUpperCase()}</div>
          <div>
            <strong>{displayName}</strong>
            <small>{isCloudBackend ? "Cloud sync" : "Local mode"}</small>
          </div>
          <User size={15} className="muted-icon" />
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
          <div className="top-actions" style={{ position: "relative" }}>
            <button
              className={`icon-button public-toggle ${publicView ? "active" : ""}`}
              onClick={() => setPublicViewMode(!publicView)}
              title={
                publicView
                  ? "Нийтлэг горим идэвхтэй — бодит горимд буцах"
                  : "Нийтлэг горим: зөвхөн Published тайлан (link-ээр хуваалцна)"
              }
            >
              {publicView ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
            <button
              className="icon-button theme-toggle"
              onClick={() => toggleTheme?.()}
              title={theme === "dark" ? "Цагаан горимд шилжих" : "Бараан горимд шилжих"}
            >
              {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <button
              className="icon-button"
              onClick={() => setChatOpen(true)}
              title="Operator Assistant chatbot (Groq + Gemini)"
            >
              <Bot size={16} />
            </button>
            <button
              className="icon-button"
              onClick={() => setCommandPaletteOpen(true)}
              title="Шуурхай хайлт (Ctrl + K)"
            >
              <Search size={16} />
            </button>
            <button
              className="icon-button"
              onClick={() => setNotifOpen(prev => !prev)}
              title="Мэдэгдлүүд"
            >
              <BellDot />
            </button>
            <div
              className="top-avatar clickable-card"
              onClick={() => setProfileOpen(true)}
              title="Операторын профайл"
            >
              O
            </div>

            {notifOpen && (
              <div className="dropdown-popup">
                <h4>Үйлдлийн мэдэгдэл</h4>
                <div className="notif-row">
                  <strong>Клауд өгөгдлийн сан</strong>
                  <span>{isCloudBackend ? "MongoDB холбогдсон, бэлэн байна." : "Локал санах ой горимд ажиллаж байна — дахин ачагдвал устана."}</span>
                  <small>Системийн төлөв</small>
                </div>
                <div className="notif-row">
                  <strong>Сүүлийн тайлан</strong>
                  <span>{selectedReport?.title}</span>
                  <small>{selectedReport?.date}</small>
                </div>
                <div className="notif-row">
                  <strong>Биелсэн даалгавар</strong>
                  <span>{completedTasksCount} / {tasks.length} гүйцэтгэсэн</span>
                  <small>Энэ 7 хоногт</small>
                </div>
              </div>
            )}
          </div>
        </header>

        {publicView && (
          <div className="public-banner">
            <Shield size={14} />
            <span>
              Нийтлэг горим — зөвхөн нийтлэгдсэн (Published) тайлангууд харагдана,
              засвар хаалттай. Хуваалцах link: <code>?public=1</code>
            </span>
            <button className="quiet-button" onClick={() => setPublicViewMode(false)}>
              Бодит горимд буцах
            </button>
          </div>
        )}

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
              <div
                className="hero-brief clickable-card"
                onClick={() => {
                  setSelectedId(1);
                  setActiveNav("Тайлан");
                }}
                title="Шууд тайлан руу шилжих"
              >
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
                <div className="calendar-wrap">
                  <div className="month-row">
                    <span>{currentMonthDisplay}</span>
                    <div className="month-arrows">
                      <button
                        className="icon-button"
                        style={{ width: 20, height: 20 }}
                        onClick={() => setCalMonthOffset(prev => Math.max(-1, prev - 1))}
                        title="Өмнөх сар"
                      >
                        <ChevronLeft size={13} />
                      </button>
                      <button
                        className="icon-button"
                        style={{ width: 20, height: 20 }}
                        onClick={() => setCalMonthOffset(prev => Math.min(1, prev + 1))}
                        title="Дараагийн сар"
                      >
                        <ChevronRight size={13} />
                      </button>
                    </div>
                  </div>
                  <div className="weekday-row">
                    {["M", "T", "W", "T", "F", "S", "S"].map((day, index) => (
                      <span key={`${day}-${index}`}>{day}</span>
                    ))}
                  </div>
                  <div className="calendar-grid">
                    {Array.from({ length: displayed.firstWeekday }).map((_, index) => (
                      <span key={`lead-${index}`} className="muted-day" />
                    ))}
                    {Array.from({ length: displayed.daysInMonth }, (_, index) => {
                      const day = index + 1;
                      const isToday = isCurrentMonth && day === now.getDate();
                      return (
                        <span
                          key={day}
                          onClick={() => selectCalendarDay(day)}
                          style={{ cursor: "pointer" }}
                          title={
                            dayHasReport(day)
                              ? "Энэ өдөр тайлан байна"
                              : "Тайлангүй"
                          }
                          className={[
                            day === selectedDay ? "today-day" : "",
                            isToday ? "today-day" : "",
                            dayHasReport(day) ? "marked-day" : "",
                          ]
                            .filter(Boolean)
                            .join(" ")}
                        >
                          {day}
                        </span>
                      );
                    })}
                  </div>
                </div>

                <div className="completion-ring">
                  <div className="ring">
                    <span>
                      {tasks.length > 0
                        ? Math.round((completedTasksCount / tasks.length) * 100)
                        : 0}
                      %
                    </span>
                  </div>
                  <div>
                    <strong>{completedTasksCount} / {tasks.length} даалгавар биелсэн</strong>
                    <small>Мөчлөгийн гүйцэтгэл хэвийн байна</small>
                  </div>
                </div>

                <Heatmap reports={visibleReports} />

                <div className="weekly-stats">
                  <div className="section-kicker">7 хоногийн статистик</div>
                  <div className="stat-row">
                    <StatCard
                      value={String(publishedCount)}
                      label="Нийтлэгдсэн тайлан"
                      accent="green"
                    />
                    <StatCard value={`${playbooks.length}`} label="Нийт playbook" />
                    <StatCard
                      value={`${tasks.filter(t => !t.completed).length}`}
                      label="Үлдсэн даалгавар"
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
                  {(["today", "tomorrow", "later"] as const).map(grp => {
                    const grpTasks = tasks.filter(t => t.group === grp);
                    const grpLabel =
                      grp === "today" ? "Өнөөдөр" : grp === "tomorrow" ? "Маргааш" : "Дараагийн";
                    const ruleClass =
                      grp === "today"
                        ? "green-rule"
                        : grp === "tomorrow"
                          ? "orange-rule"
                          : "gray-rule";

                    return (
                      <div className="task-group" key={grp}>
                        <div className="task-heading" style={{ justifyContent: "space-between" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span className={`group-rule ${ruleClass}`} /> {grpLabel}{" "}
                            <span className="task-count">
                              {grpTasks.filter(t => !t.completed).length}
                            </span>
                          </div>
                          {!publicView && (
                            <button
                              className="text-button"
                              style={{ fontSize: 10 }}
                              onClick={() => setAddingTaskGroup(grp)}
                            >
                              + Нэмэх
                            </button>
                          )}
                        </div>

                        {grpTasks.map(task => {
                          const isEditing = editingTaskId === task.id;
                          return (
                            <div
                              key={task.id}
                              className={`task-row ${task.completed ? "completed" : ""}`}
                              onClick={() => {
                                if (!isEditing) toggleTask(task.id);
                              }}
                            >
                              <span className="task-check" />
                              {isEditing ? (
                                <div style={{ flex: 1, minWidth: 0, display: "grid", gap: 6 }}>
                                  <input
                                    value={editingTaskTitle}
                                    onChange={e => setEditingTaskTitle(e.target.value)}
                                    aria-label="Даалгаврын нэр засах"
                                    autoFocus
                                    onKeyDown={e => {
                                      if (e.key === "Enter") saveEditTask(task.id);
                                      if (e.key === "Escape") cancelEditTask();
                                    }}
                                  />
                                  <input
                                    value={editingTaskDetail}
                                    onChange={e => setEditingTaskDetail(e.target.value)}
                                    aria-label="Даалгаврын дэлгэрэнгүй засах"
                                    onKeyDown={e => {
                                      if (e.key === "Enter") saveEditTask(task.id);
                                      if (e.key === "Escape") cancelEditTask();
                                    }}
                                  />
                                  <div style={{ display: "flex", gap: 6 }}>
                                    <button
                                      className="text-button"
                                      onClick={e => {
                                        e.stopPropagation();
                                        saveEditTask(task.id);
                                      }}
                                    >
                                      <Check size={13} /> Хадгалах
                                    </button>
                                    <button
                                      className="text-button"
                                      onClick={e => {
                                        e.stopPropagation();
                                        cancelEditTask();
                                      }}
                                    >
                                      <X size={13} /> Болих
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <strong>{task.title}</strong>
                                  <small>{task.detail}</small>
                                </div>
                              )}
                              {!isEditing && <span className="task-date">{task.date}</span>}
                              {!isEditing && !publicView && (
                                <button
                                  className="task-delete-btn"
                                  onClick={e => {
                                    e.stopPropagation();
                                    startEditTask(task);
                                  }}
                                  title="Засах"
                                >
                                  <Pencil size={13} />
                                </button>
                              )}
                              {!isEditing && !publicView && (
                                <button
                                  className="task-delete-btn"
                                  onClick={e => {
                                    e.stopPropagation();
                                    deleteTask(task.id);
                                  }}
                                  title="Устгах"
                                >
                                  <Trash2 size={13} />
                                </button>
                              )}
                            </div>
                          );
                        })}

                        {addingTaskGroup === grp && (
                          <div className="add-task-box">
                            <input
                              value={newTaskTitle}
                              onChange={e => setNewTaskTitle(e.target.value)}
                              placeholder="Даалгаврын нэр бичих..."
                              autoFocus
                              onKeyDown={e => {
                                if (e.key === "Enter") addTask(grp);
                                if (e.key === "Escape") setAddingTaskGroup(null);
                              }}
                            />
                            <button onClick={() => addTask(grp)}>Нэмэх</button>
                            <button
                              style={{ background: "var(--btn-soft)", color: "var(--ink)" }}
                              onClick={() => setAddingTaskGroup(null)}
                            >
                              Болих
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
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
                  <div className="section-kicker">Хөгжлийн track-ууд</div>
                  <h2>Ур чадварын замын зураг</h2>
                </div>
                <span className="mono tiny">5 Track</span>
              </div>
              <div className="roadmap-track">
                {roadmapTracks.map(track => {
                  const Icon = trackIcons[track.id] || Compass;
                  const stats = trackStatsMap[track.id];
                  return (
                    <div
                      key={track.id}
                      className={`roadmap-card clickable-card ${activeTrackId === track.id ? "is-active" : ""}`}
                      onClick={() => {
                        setActiveTrackId(track.id);
                        setActiveNav("Замын зураг");
                      }}
                      title="Энэ track-ын дэлгэрэнгүйг харах"
                    >
                      <div className="roadmap-card-top">
                        <Icon size={13} />
                        {stats.percent > 0 ? (
                          <span className="roadmap-live">Эхэлсэн</span>
                        ) : (
                          <span className="roadmap-lock">Эхлээгүй</span>
                        )}
                      </div>
                      <strong>{track.name}</strong>
                      <small>{track.detail}</small>
                      <div className="progress-line">
                        <i style={{ width: `${stats.percent}%` }} />
                      </div>
                      <div className="progress-meta">
                        <span>{stats.done}/{stats.total} · {stats.percent}%</span>
                      </div>
                    </div>
                  );
                })}
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
                {!publicView && (
                  <>
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
                      title="Obsidian-ийн .md файлыг уншиж оруулах"
                    >
                      <Upload size={14} /> Obsidian импорт
                    </button>
                    <button className="primary-button" onClick={openNewReportEditor}>
                      <Plus size={16} /> Шинэ тайлан
                    </button>
                  </>
                )}
                <span
                  className={`db-status ${isCloudBackend ? "connected" : "local"}`}
                  title={
                    isCloudBackend
                      ? "MongoDB тайлангуудыг синхрончилж байна"
                      : "MONGODB_URI тохирогдогүй — өгөгдөл зөвхөн процессийн санах ойнд, дахин ачагдвал устана"
                  }
                >
                  <Database size={13} />
                  {isCloudBackend ? " Клауд холбогдсон" : " Локал хадгалалт"}
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
                    {query && (
                      <button
                        onClick={() => setQuery("")}
                        style={{ background: "transparent", color: "var(--muted)", padding: 2 }}
                      >
                        <X size={12} />
                      </button>
                    )}
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
                    <button
                      className={statusFilter === "Archived" ? "selected" : ""}
                      onClick={() => setStatusFilter("Archived")}
                    >
                      Архив
                    </button>
                  </div>
                </div>

                <div className="tag-filter-row report-track-filters">
                  <span className="tag-filter-label">Roadmap:</span>
                  <button
                    className={trackFilter === "All" ? "tag-chip selected" : "tag-chip"}
                    onClick={() => {
                      setTrackFilter("All");
                      setTagFilter("All");
                    }}
                  >
                    Бүх чиглэл
                  </button>
                  {reportTrackOptions.map(option => (
                    <button
                      key={option.id}
                      className={trackFilter === option.id ? "tag-chip selected" : "tag-chip"}
                      onClick={() => {
                        setTrackFilter(option.id);
                        setTagFilter("All");
                      }}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>

                <div className="tag-filter-row report-subtag-filters">
                  <span className="tag-filter-label">Core tag:</span>
                  <button
                    className={tagFilter === "All" ? "tag-chip selected" : "tag-chip"}
                    onClick={() => setTagFilter("All")}
                  >
                    Бүгд
                  </button>
                  {visibleSubTags.slice(0, 16).map(tag => (
                    <button
                      key={tag}
                      className={tagFilter === tag ? "tag-chip selected" : "tag-chip"}
                      onClick={() => setTagFilter(tag)}
                    >
                      #{tag}
                    </button>
                  ))}
                  {tagFilter !== "All" && (
                    <button className="clear-filter" onClick={() => setTagFilter("All")}>
                      <X size={12} /> Цэвэрлэх
                    </button>
                  )}
                </div>

                <div className="list-meta">
                  <span>Нийт {filteredReports.length} тайлан</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ color: "var(--muted)" }}>Эрэмбэ:</span>
                    <select
                      value={sortMode}
                      onChange={e => setSortMode(e.target.value as any)}
                      style={{
                        background: "transparent",
                        border: 0,
                        font: "9px 'DM Mono', monospace",
                        color: "var(--green)",
                        cursor: "pointer",
                      }}
                    >
                      <option value="newest">Сүүлийнх</option>
                      <option value="oldest">Хуучин нь</option>
                      <option value="title">Гарчиг (А-Я)</option>
                      <option value="readTime">Унших хугацаа</option>
                    </select>
                  </div>
                </div>

                {filteredReports.length === 0 ? (
                  <div style={{ padding: "40px 10px", textAlign: "center", color: "var(--muted)" }}>
                    <p>Тохирох тайлан олдсонгүй.</p>
                    <button
                      className="secondary-button"
                      style={{ marginTop: 10 }}
                      onClick={() => {
                        setQuery("");
                        setStatusFilter("All");
                        setTagFilter("All");
                      }}
                    >
                      Шүүлтүүрийг арилгах
                    </button>
                  </div>
                ) : (
                  filteredReports.map(report => (
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
                  ))
                )}
              </div>

              <div className="report-detail-panel">
                {selectedReport ? (
                  <>
                    <div className="detail-top">
                      <div className="detail-kicker">
                        {selectedReport.source} / {selectedReport.stage.toUpperCase()}
                      </div>
                      {!publicView && (
                      <div style={{ position: "relative" }}>
                        <button
                          className="icon-button"
                          onClick={() => setOptionsMenuOpen(prev => !prev)}
                          title="Бусад үйлдэл"
                        >
                          <MoreHorizontal size={16} />
                        </button>
                        {optionsMenuOpen && (
                          <div
                            className="dropdown-popup"
                            style={{ right: 0, width: 180 }}
                          >
                            <button
                              className="command-item"
                              style={{ padding: "6px 10px", fontSize: 11 }}
                              onClick={() => openEditReport(selectedReport)}
                            >
                              <span>✏️ Засах (Edit)</span>
                            </button>
                            <button
                              className="command-item"
                              style={{ padding: "6px 10px", fontSize: 11 }}
                              onClick={() => copyMarkdownToClipboard(selectedReport)}
                            >
                              <span>📋 Markdown хуулах</span>
                            </button>
                            <button
                              className="command-item"
                              style={{ padding: "6px 10px", fontSize: 11 }}
                              onClick={() => {
                                setOptionsMenuOpen(false);
                                openDiagramForReport(selectedReport.id);
                              }}
                            >
                              <span>🗺️ Диаграм болгох</span>
                            </button>
                            <button
                              className="command-item"
                              style={{ padding: "6px 10px", fontSize: 11 }}
                              onClick={() => archiveReport(selectedReport.id)}
                            >
                              <span>📦 Архивлах</span>
                            </button>
                            <div style={{ borderTop: "1px solid var(--line)", margin: "4px 0" }} />
                            <button
                              className="command-item"
                              style={{ padding: "6px 10px", fontSize: 11, color: "var(--red)" }}
                              onClick={() => {
                                setDeleteConfirmId(selectedReport.id);
                                setOptionsMenuOpen(false);
                              }}
                            >
                              <span>🗑️ Устгах</span>
                            </button>
                          </div>
                        )}
                      </div>
                      )}
                    </div>

                    <h2>{selectedReport.title}</h2>
                    <div className="detail-meta">
                      <span>
                        <Clock3 size={13} /> {selectedReport.readTime}
                      </span>
                      <span>
                        <CalendarDays size={13} /> {selectedReport.date}
                      </span>
                      {selectedInsight && (
                        <span className="ai-badge" title={selectedInsight.summary}>
                          <Sparkles size={11} /> {selectedInsight.provider === "moonshot" ? "AI" : "Local"} · {selectedInsight.concepts.slice(0,2).join(", ")}
                        </span>
                      )}
                    </div>

                    <div className="tag-row">
                      {selectedReport.tags.map(tag => (
                        <button key={tag} onClick={() => setTagFilter(tag)}>
                          #{tag}
                        </button>
                      ))}
                    </div>

                    <button className="read-full-button" onClick={openReportReader}>
                      <BookOpen size={14} /> Бүтэн унших
                    </button>

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
                        title="Markdown файл татах"
                      >
                        <Download size={14} /> Markdown
                      </button>
                      <button
                        className="export-button"
                        onClick={exportSelectedPdf}
                        title="PDF файл болгон хэвлэх"
                      >
                        <Printer size={14} /> Хэвлэх (PDF)
                      </button>
                      <button
                        className="export-button"
                        onClick={() => copyMarkdownToClipboard(selectedReport)}
                        title="Текстийг Clipboard луу хуулах"
                      >
                        <Copy size={14} /> Хуулах
                      </button>
                      <button
                        className="export-button"
                        onClick={() => openDiagramForReport(selectedReport.id)}
                      >
                        <Waypoints size={14} /> Диаграм
                      </button>
                      {!publicView && (
                        <button
                          className="secondary-button"
                          onClick={() => openEditReport(selectedReport)}
                          title="Тайланг засах"
                        >
                          Засах
                        </button>
                      )}
                      {!publicView && (
                        <>
                          <button
                            className="secondary-button"
                            onClick={() => togglePublished(selectedReport.id)}
                          >
                            <Check size={14} />
                            {selectedReport.status === "Published"
                              ? " Ноорог болгох"
                              : " Нийтлэх"}
                          </button>
                          <button
                            className="quiet-button"
                            onClick={() => archiveReport(selectedReport.id)}
                            title="Тайланг архивлах"
                          >
                            <Archive size={14} /> Архивлах
                          </button>
                        </>
                      )}
                    </div>

                    {relatedNotes.length > 0 && (
                      <div className="related-strip">
                        <div className="section-kicker">Холбоотой тэмдэглэлүүд</div>
                        <div className="related-chips">
                          {relatedNotes.map(r => (
                            <button key={r.otherId} className="related-chip" onClick={() => openReportInReader(r.otherId)} title={r.reason}>
                              {r.otherTitle} <small>· {(r.weight*100).toFixed(0)}%</small>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div style={{ padding: "40px", textAlign: "center", color: "var(--muted)" }}>
                    <p>Тайлан сонгогдоогүй байна.</p>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {activeNav === "Тайлан-уншилт" && (
          <section className="report-reader-page">
            {selectedReport ? (
              <>
                <div className="reader-toolbar">
                  <button className="quiet-button" onClick={closeReportReader}>
                    <ArrowLeft size={15} /> Тайлангууд руу буцах
                  </button>
                  <div className="reader-navigation">
                    <button
                      className="icon-button"
                      onClick={() => moveReader(-1)}
                      disabled={filteredReports.length < 2}
                      title="Өмнөх тайлан"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <span>{filteredReports.findIndex(report => report.id === selectedReport.id) + 1} / {filteredReports.length}</span>
                    <button
                      className="icon-button"
                      onClick={() => moveReader(1)}
                      disabled={filteredReports.length < 2}
                      title="Дараагийн тайлан"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>

                <div className="reader-actions-top">
                  <button className="export-button" onClick={exportSelectedMarkdown}>
                    <Download size={14} /> Markdown
                  </button>
                  <button className="export-button" onClick={exportSelectedPdf}>
                    <Printer size={14} /> Хэвлэх (PDF)
                  </button>
                  <button className="export-button" onClick={() => copyMarkdownToClipboard(selectedReport)}>
                    <Copy size={14} /> Хуулах
                  </button>
                  <button className="export-button" onClick={() => openDiagramForReport(selectedReport.id)}>
                    <Waypoints size={14} /> Диаграм
                  </button>
                  {!publicView && (
                    <button className="secondary-button" onClick={() => openEditReport(selectedReport)}>
                      Засах
                    </button>
                  )}
                  {selectedInsight && (
                    <span className="ai-badge">
                      {selectedInsight.provider === "moonshot" ? `AI · ${selectedInsight.model}` : "Орон нутгийн шинжилгээ"} · {selectedInsight.concepts.slice(0,3).join(", ")}
                    </span>
                  )}
                </div>

                <article className="report-reader-content">
                  <div className="detail-kicker">
                    {selectedReport.source} / {selectedReport.stage.toUpperCase()}
                  </div>
                  <h1>{selectedReport.title}</h1>
                  <div className="detail-meta">
                    <span><Clock3 size={13} /> {selectedReport.readTime}</span>
                    <span><CalendarDays size={13} /> {selectedReport.date}</span>
                    <span>{selectedReport.room}</span>
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
                    <img className="report-image" src={selectedReport.image} alt="Report attachment" />
                  )}

                  {relatedNotes.length > 0 && (
                    <div className="related-strip">
                      <div className="section-kicker">Холбоотой тэмдэглэлүүд</div>
                      <div className="related-chips">
                        {relatedNotes.map(r => (
                          <button key={r.otherId} className="related-chip" onClick={() => openReportInReader(r.otherId)} title={r.reason}>
                            {r.otherTitle} <small>· {(r.weight*100).toFixed(0)}% — {r.reason}</small>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </article>
              </>
            ) : (
              <div className="reader-empty">
                <BookOpen size={22} />
                <p>Унших тайлан сонгогдоогүй байна.</p>
                <button className="secondary-button" onClick={closeReportReader}>Тайлангууд руу буцах</button>
              </div>
            )}
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
              {!publicView && (
                <button
                  className="primary-button"
                  onClick={() => setPlaybookEditorOpen(true)}
                >
                  <Plus size={16} /> Шинэ playbook
                </button>
              )}
            </div>

            <div className="playbook-grid">
              {playbooks.map((pb, idx) => {
                const isDark = idx % 3 === 0;
                return (
                  <div
                    key={pb.id}
                    className={`playbook-card clickable-card ${isDark ? "dark-card" : ""}`}
                    onClick={() => setSelectedPlaybook(pb)}
                    title="Дэлгэрэнгүй тактик, коммандуудыг харах"
                  >
                    <Sparkles size={18} />
                    <h3>{pb.title}</h3>
                    <p>{pb.description}</p>
                    <div style={{ marginTop: 18, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 9, fontFamily: "monospace", opacity: 0.7 }}>
                        {pb.category.toUpperCase()} • {pb.commands.length} комманд
                      </span>
                      <span style={{ fontSize: 10, fontWeight: 700, color: isDark ? "#a4e2af" : "var(--green)" }}>
                        Нээх →
                      </span>
                    </div>
                  </div>
                );
              })}
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
                  Таван параллель track: THM Free Path · picoCTF / CyLab · THM Paid / AD · HTB / flAWS · OSCP / Cloud.
                </p>
              </div>
            </div>

            <div className="track-switcher" role="tablist" aria-label="Roadmap track-ууд">
              {roadmapTracks.map(track => {
                const Icon = trackIcons[track.id] || Compass;
                const stats = trackStatsMap[track.id];
                return (
                  <button
                    key={track.id}
                    role="tab"
                    aria-selected={activeTrackId === track.id}
                    className={`track-pill ${activeTrackId === track.id ? "selected" : ""}`}
                    onClick={() => setActiveTrackId(track.id)}
                  >
                    <Icon size={13} />
                    {track.name}
                    <small>{stats.percent}%</small>
                  </button>
                );
              })}
            </div>

            <div className="roadmap-large">
              {roadmapTracks.map(track => {
                const Icon = trackIcons[track.id] || Compass;
                const stats = trackStatsMap[track.id];
                const isActive = activeTrackId === track.id;
                return (
                  <div
                    className={`roadmap-large-row clickable-card ${isActive ? "active" : ""}`}
                    key={track.id}
                    onClick={() => setActiveTrackId(track.id)}
                    title="Энэ track-ыг сонгох"
                  >
                    <div className="large-stage">
                      <Icon size={20} />
                    </div>
                    <div className="large-stage-copy">
                      <div className="large-stage-title">
                        <h3>{track.name}</h3>
                        <span>{stats.done}/{stats.total} дууссан</span>
                      </div>
                      <p>{track.detail}</p>
                      <div className="progress-line">
                        <i style={{ width: `${stats.percent}%` }} />
                      </div>
                    </div>
                    <div className="large-percent">{stats.percent}%</div>
                  </div>
                );
              })}
            </div>

            <div className="thm-progress-summary">
              <div>
                <div className="section-kicker">{activeTrack.name} tracker</div>
                <h2>{trackStatsMap[activeTrack.id].percent}% дууссан</h2>
                <p>
                  {trackStatsMap[activeTrack.id].done} / {trackStatsMap[activeTrack.id].total} item дууссан
                </p>
              </div>
              <div
                className="thm-progress-bar"
                aria-label={`${activeTrack.name} ${trackStatsMap[activeTrack.id].percent}% дууссан`}
              >
                <i style={{ width: `${trackStatsMap[activeTrack.id].percent}%` }} />
              </div>
            </div>

            <div className="thm-room-tracker">
              <div className="section-header">
                <div>
                  <div className="section-kicker">Item completion</div>
                  <h2>Дуусгасан зүйлээ тэмдэглэ</h2>
                </div>
                <div className="thm-header-actions">
                  <button
                    className="text-button"
                    onClick={() => openDiagramForTrack(activeTrack.id)}
                  >
                    <Waypoints size={14} /> Мод диаграм
                  </button>
                  {activeTrack.sourceUrl && (
                    <a
                      className="text-button"
                      href={activeTrack.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Албан эх сурвалж <ArrowUpRight size={14} />
                    </a>
                  )}
                </div>
              </div>
              {activeTrack.sections.map((section, sectionIndex) => {
                const sectionDone = section.items.filter(item =>
                  trackProgress[`${activeTrack.id}:${item.id}`]
                ).length;
                return (
                  <details
                    className="thm-level"
                    key={section.id}
                    open={sectionIndex === 0}
                  >
                    <summary>
                      <span>
                        <strong>{section.label}: {section.title}</strong>
                        <small>{sectionDone} / {section.items.length} дууссан</small>
                      </span>
                      <span className="thm-level-percent">
                        {section.items.length
                          ? Math.round((sectionDone / section.items.length) * 100)
                          : 0}
                        %
                      </span>
                    </summary>
                    <div className="thm-room-list">
                      {section.items.map(item => {
                        const key = `${activeTrack.id}:${item.id}`;
                        const completed = Boolean(trackProgress[key]);
                        const room = item.thmRoomId
                          ? thmFreePathRooms.find(r => r.id === item.thmRoomId)
                          : undefined;
                        return (
                          <div
                            className={`thm-room-row ${completed ? "completed" : ""}`}
                            key={item.id}
                          >
                            {publicView ? (
                              <span className="thm-room-check" aria-hidden>
                                {completed && <Check size={13} />}
                              </span>
                            ) : (
                              <button
                                className="thm-room-check"
                                aria-label={`${item.title} ${completed ? "дууссан" : "дуусаагүй"}`}
                                aria-pressed={completed}
                                onClick={() => toggleTrackItem(activeTrack.id, item.id)}
                              >
                                {completed && <Check size={13} />}
                              </button>
                            )}
                            <div className="thm-room-copy">
                              <strong>{item.title}</strong>
                              {room && (
                                <small>tryhackme.com/room/{room.slug}</small>
                              )}
                            </div>
                            {item.url && (
                              <a
                                className="icon-button"
                                href={item.url}
                                target="_blank"
                                rel="noreferrer"
                                title="Нээх"
                                onClick={event => event.stopPropagation()}
                              >
                                <ArrowUpRight size={14} />
                              </a>
                            )}
                            {room && !publicView && (
                              <button
                                className="thm-report-button"
                                onClick={() => openRoomReportEditor(room)}
                              >
                                <FileText size={13} /> Report
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </details>
                );
              })}

              {(() => {
                const trackReports = visibleReports.filter(report => {
                  const option = reportTrackOptions.find(item => item.id === activeTrack.id);
                  return option ? option.match(report) || report.category === activeTrack.id : report.category === activeTrack.id;
                });
                return (
                  <details className="thm-level report-track-section" open>
                    <summary>
                      <span>
                        <strong>Таны {activeTrack.name} report-ууд</strong>
                        <small>{trackReports.length} report хадгалагдсан</small>
                      </span>
                      <span className="thm-level-percent">{trackReports.length}</span>
                    </summary>
                    <div className="track-report-list">
                      {trackReports.length === 0 ? (
                        <p className="tiny">Энэ track-д report алга. “Тайлан → Шинэ тайлан” ашиглан нэмнэ үү.</p>
                      ) : (
                        trackReports.map(report => (
                          <div className="track-report-row" key={report.id}>
                            <div>
                              <strong>{report.title}</strong>
                              <small>{report.room} · {report.tags.slice(0, 4).map(tag => `#${tag}`).join(" ")}</small>
                            </div>
                            <div className="track-report-actions">
                              <button className="text-button" onClick={() => openReportInReader(report.id)}>
                                <FileText size={13} /> Унших
                              </button>
                              <button className="text-button" onClick={() => openDiagramForReport(report.id)}>
                                <Waypoints size={13} /> Диаграм
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </details>
                );
              })()}
            </div>
          </section>
        )}

        {activeNav === "Атлас" && (
          <section className="simple-page">
            <div className="page-title-row">
              <div>
                <div className="eyebrow">
                  <span className="signal-dot" /> Мэдлэгийн газрын зураг
                </div>
                <h1>Атлас</h1>
                <p>
                  Тайлан, roadmap track болон шошгоны хоорондох холбоосыг нэг
                  концепт зураг дээр. Хулганы дугуйгаар томруулж, чирж шилжүүлээд
                  зангилааг сонгон фокус хийнэ үү.
                </p>
              </div>
            </div>
            <div className="ai-brain-card">
              <div>
                <div className="section-kicker">AI brain status</div>
                <h2>Мэдлэгийг холбож буй оюун</h2>
                <p>
                  {aiSummary?.analyzed ?? 0} / {aiSummary?.total ?? visibleReports.length} report шинжлэгдсэн
                </p>
              </div>
              <div className="ai-brain-providers">
                <span>Gemini: {atlasQuery.data?.configured ? "идэвхтэй" : "local fallback"}</span>
                <span>Insights: {insightsQuery.data?.relations.length ?? 0} холбоос</span>
                <button className="secondary-button" onClick={refreshInsights} disabled={refreshInsightsMutation.isPending}>
                  <RotateCcw size={13} /> Шинэчлэх
                </button>
              </div>
            </div>
            <KnowledgeAtlas
              reports={visibleReports}
              tracks={roadmapTracks}
              trackProgress={trackProgress}
              onOpenReport={openReportInReader}
              onOpenTrack={openTrackInRoadmap}
              insights={insightsQuery.data ?? null}
              onRefreshInsights={refreshInsights}
              refreshing={refreshInsightsMutation.isPending || insightsQuery.isFetching}
            />
          </section>
        )}

        {activeNav === "Диаграм" && (
          <section className="simple-page">
            <div className="page-title-row">
              <div>
                <div className="eyebrow">
                  <span className="signal-dot" /> Баримт бичиг → диаграм
                </div>
                <h1>Диаграм</h1>
                <p>
                  Тайланг mind-map / flowchart / network хэлбэрээр, roadmap
                  track-ыг мод хэлбэрээр дүрсэлнэ. SVG-ээр татаж авах боломжтой.
                </p>
              </div>
            </div>

            <div className="ai-brain-card">
              <div>
                <div className="section-kicker">AI brain status</div>
                <h2>{diagramReport?.title ?? diagramTrack?.name ?? "Сонгосон эх сурвалж"}</h2>
                <p>{diagramAiInsight ? "Энэ эх сурвалжийн summary, concepts, steps бэлэн." : "Эх сурвалжаа сонгоод AI шинжилгээ ажиллуулна уу."}</p>
              </div>
              <div className="ai-brain-providers">
                <span>Provider: {diagramAiInsight?.provider ?? (atlasQuery.data?.configured ? "Gemini" : "Local")}</span>
                <span>Гол ойлголт: {diagramAiInsight?.concepts.length ?? 0}</span>
                {diagramReport && <button className="secondary-button" onClick={runAiAnalysis} disabled={aiAnalyze.isPending}><Sparkles size={13} /> AI шинжлэх</button>}
              </div>
            </div>

            <div className="diagram-source">
              <div className="diagram-source-tabs" role="tablist" aria-label="Эх сурвалжийн төрөл">
                <button
                  role="tab"
                  aria-selected={diagramSource.type === "report"}
                  className={`track-pill ${diagramSource.type === "report" ? "selected" : ""}`}
                  onClick={() => {
                    setAiResult(null);
                    setDiagramKind("mindmap");
                    setDiagramSource({
                      type: "report",
                      id: selectedReport?.id ?? visibleReports[0]?.id ?? 1,
                    });
                  }}
                >
                  <FileText size={13} /> Тайлан
                </button>
                <button
                  role="tab"
                  aria-selected={diagramSource.type === "track"}
                  className={`track-pill ${diagramSource.type === "track" ? "selected" : ""}`}
                  onClick={() => {
                    setAiResult(null);
                    setDiagramKind("tree");
                    setDiagramSource({ type: "track", id: activeTrackId });
                  }}
                >
                  <Target size={13} /> Замын зураг (track)
                </button>
              </div>

              {diagramSource.type === "report" ? (
                <select
                  className="diagram-select"
                  value={diagramSource.id}
                  onChange={event => {
                    setAiResult(null);
                    setDiagramSource({ type: "report", id: Number(event.target.value) });
                  }}
                  aria-label="Тайлан сонгох"
                >
                  {visibleReports.map(report => (
                    <option key={report.id} value={report.id}>
                      {report.title}
                    </option>
                  ))}
                </select>
              ) : (
                <>
                  <select
                    className="diagram-select"
                    value={diagramSource.id}
                    onChange={event => {
                      setAiResult(null);
                      setDiagramSource({ type: "track", id: event.target.value });
                    }}
                    aria-label="Track сонгох"
                  >
                    {roadmapTracks.map(track => (
                      <option key={track.id} value={track.id}>
                        {track.name}
                      </option>
                    ))}
                  </select>
                  <button
                    className={`secondary-button ${trackDiagramFull ? "active" : ""}`}
                    onClick={() => setTrackDiagramFull(current => !current)}
                  >
                    {trackDiagramFull ? "Зөвхөн section" : "Бүх item харуулах"}
                  </button>
                </>
              )}
            </div>

            {diagramSource.type === "report" && diagramReport && (
              <div className="diagram-ai-row">
                <button
                  className="export-button"
                  onClick={runAiAnalysis}
                  disabled={aiAnalyze.isPending}
                >
                  <Sparkles size={13} />
                  {aiAnalyze.isPending ? "Шинжилж байна…" : "AI шинжилгээ"}
                </button>
                <span className="ai-badge">
                  {atlasQuery.data?.configured
                    ? `Moonshot/Kimi · ${atlasQuery.data.model}`
                    : "Local analyzer (товчлолгүй)"}
                </span>
                {aiResult && (
                  <button className="text-button" onClick={() => setAiResult(null)}>
                    Шинжилгээг цэвэрлэх
                  </button>
                )}
              </div>
            )}

            {aiResult && (
              <div className="ai-summary-card">
                <div className="section-kicker">
                  AI дүгнэлт · {aiResult.provider === "moonshot" ? aiResult.model : "local"}
                </div>
                <p>{aiResult.summary}</p>
                {aiResult.steps.length > 0 && (
                  <ol className="ai-steps">
                    {aiResult.steps.map((step, index) => (
                      <li key={`${index}-${step}`}>{step}</li>
                    ))}
                  </ol>
                )}
                {aiResult.note && <p className="tiny">{aiResult.note}</p>}
              </div>
            )}

            <DocumentDiagram
              title={diagramReport?.title ?? diagramTrack?.name ?? "Диаграм"}
              subtitle={
                diagramReport
                  ? `${diagramReport.source} · ${diagramReport.stage}`
                  : "Roadmap track"
              }
              graph={diagramGraph}
              kind={diagramKind}
              kinds={
                diagramSource.type === "report"
                  ? ["mindmap", "flowchart", "network"]
                  : ["tree"]
              }
              onKindChange={kind => {
                setAiResult(null);
                setDiagramKind(kind);
              }}
              onOpenReport={openReportInReader}
              exportName={diagramReport?.title ?? diagramTrack?.name ?? "diagram"}
              editKeyName={
                diagramSource.type === "report"
                  ? editKey.report(diagramReport?.id ?? 0, diagramKind)
                  : editKey.track(diagramSource.id)
              }
              aiInsight={diagramAiInsight}
              onRefreshInsights={refreshInsights}
              refreshing={refreshInsightsMutation.isPending || insightsQuery.isFetching}
            />
          </section>
        )}

        {activeNav === "Дүн шинжилгээ" && (
          <section className="simple-page">
            <InsightsDashboard reports={visibleReports} onOpenReport={openReportInReader} ai={aiSummary} />
          </section>
        )}
      </main>

      <AIChatBot
        reports={visibleReports}
        playbooks={playbooks}
        rooms={thmFreePathRooms}
        open={chatOpen}
        onClose={() => setChatOpen(false)}
        onOpenReport={reportId => {
          openReportInReader(reportId);
          setChatOpen(false);
        }}
        onOpenRoom={slug => window.open(thmRoomUrl(slug), "_blank", "noreferrer")}
      />

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
                <div className="section-kicker">
                  {editingReportId ? "Тайлан засах" : "Шинэ тайлан"}
                </div>
                <h2>
                  {editingReportId ? "Тайлангийн агуулгыг шинэчлэх" : "Шинэ тайлан үүсгэх"}
                </h2>
              </div>
              <button
                className="icon-button"
                onClick={() => setEditorOpen(false)}
              >
                <X size={17} />
              </button>
            </div>

            {!editingReportId && (
              <>
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
              </>
            )}

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
            <div className="two-fields">
              <label>
                Roadmap чиглэл
                <select
                  value={newTrackId}
                  onChange={event => {
                    applyTrackDefaults(event.target.value);
                  }}
                >
                  {roadmapTracks.map(track => (
                    <option key={track.id} value={track.id}>{track.name}</option>
                  ))}
                </select>
              </label>
              <label>
                Section / category
                <select
                  value={newTrackSectionId}
                  onChange={event => setNewTrackSectionId(event.target.value)}
                >
                  {selectedEditorTrack().sections.map(section => (
                    <option key={section.id} value={section.id}>{section.label}: {section.title}</option>
                  ))}
                </select>
              </label>
            </div>
            <label>
              Core tag-ууд
              <input
                value={newCoreTags}
                onChange={event => setNewCoreTags(event.target.value)}
                placeholder="жишээ: suid, cron, enumeration"
              />
            </label>
            <div className="template-note">
              <Sparkles size={13} /> Roadmap чиглэл, section, core tag нь report filter, Atlas, chatbot-д автоматаар ашиглагдана.
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
              <button className="primary-button" onClick={saveReport}>
                {editingReportId ? "Өөрчлөлтийг хадгалах" : "Хадгалах"}{" "}
                <ArrowUpRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedPlaybook && (
        <div
          className="center-modal-overlay"
          onClick={e => {
            if (e.target === e.currentTarget) setSelectedPlaybook(null);
          }}
        >
          <div className="center-modal-box">
            <div className="modal-header">
              <div>
                <span className="section-kicker">{selectedPlaybook.category.toUpperCase()} PLAYBOOK</span>
                <h3>{selectedPlaybook.title}</h3>
              </div>
              <button
                className="icon-button"
                onClick={() => setSelectedPlaybook(null)}
              >
                <X size={17} />
              </button>
            </div>
            <div style={{ marginTop: 16 }}>
              <p style={{ color: "var(--muted)", fontSize: 13, lineHeight: 1.6 }}>
                {selectedPlaybook.description}
              </p>

              <h4 style={{ margin: "18px 0 8px", fontSize: 13, fontWeight: 700 }}>
                Шалгах дараалал &amp; Арга зүй
              </h4>
              <div
                style={{
                  background: "var(--block-bg)",
                  padding: "12px 14px",
                  borderRadius: 6,
                  whiteSpace: "pre-line",
                  fontSize: 12,
                  lineHeight: 1.7,
                }}
              >
                {selectedPlaybook.methodology}
              </div>

              <h4 style={{ margin: "20px 0 8px", fontSize: 13, fontWeight: 700 }}>
                Түлхүүр коммандууд
              </h4>
              {selectedPlaybook.commands.map((cmd, i) => (
                <div key={i} style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "var(--muted)", marginBottom: 4 }}>
                    {cmd.label}
                  </div>
                  <div className="code-block">
                    <code>{cmd.cmd}</code>
                    <button
                      className="code-copy-btn"
                      onClick={() => copyTextToClipboard(cmd.cmd, cmd.label)}
                    >
                      <Copy size={11} /> Хуулах
                    </button>
                  </div>
                </div>
              ))}

              <h4 style={{ margin: "20px 0 8px", fontSize: 13, fontWeight: 700 }}>
                Операторын зөвлөмж
              </h4>
              <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12, color: "var(--muted)", lineHeight: 1.6 }}>
                {selectedPlaybook.tips.map((tip, i) => (
                  <li key={i}>{tip}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {playbookEditorOpen && (
        <div
          className="center-modal-overlay"
          onClick={e => {
            if (e.target === e.currentTarget) setPlaybookEditorOpen(false);
          }}
        >
          <div className="center-modal-box">
            <div className="modal-header">
              <div>
                <span className="section-kicker">Шинэ тактик</span>
                <h3>Шинэ Playbook бүртгэх</h3>
              </div>
              <button
                className="icon-button"
                onClick={() => setPlaybookEditorOpen(false)}
              >
                <X size={17} />
              </button>
            </div>
            <div style={{ marginTop: 16 }}>
              <label>
                Нэр
                <input
                  value={newPbTitle}
                  onChange={e => setNewPbTitle(e.target.value)}
                  placeholder="Жишээ: Docker escape via mounted socket"
                  autoFocus
                />
              </label>
              <label style={{ marginTop: 10 }}>
                Ангилал
                <select
                  value={newPbCategory}
                  onChange={e => setNewPbCategory(e.target.value as any)}
                >
                  <option value="linux">Linux</option>
                  <option value="network">Network</option>
                  <option value="cloud">Cloud</option>
                  <option value="windows">Windows</option>
                </select>
              </label>
              <label style={{ marginTop: 10 }}>
                Товч тайлбар
                <input
                  value={newPbDesc}
                  onChange={e => setNewPbDesc(e.target.value)}
                  placeholder="Хэзээ, ямар зорилгоор хэрэглэх..."
                />
              </label>
              <label style={{ marginTop: 10 }}>
                Арга зүй (Methodology)
                <textarea
                  value={newPbMethodology}
                  onChange={e => setNewPbMethodology(e.target.value)}
                  rows={4}
                  placeholder="1. Шалгах цэгүүд&#10;2. Илрүүлэх дараалал..."
                />
              </label>
              <div className="two-fields" style={{ marginTop: 10 }}>
                <label>
                  Коммандын нэр
                  <input
                    value={newPbCmdLabel}
                    onChange={e => setNewPbCmdLabel(e.target.value)}
                    placeholder="Жишээ: Сокет шалгах"
                  />
                </label>
                <label>
                  Комманд
                  <input
                    value={newPbCmdText}
                    onChange={e => setNewPbCmdText(e.target.value)}
                    placeholder="docker -H unix:///var/run/docker.sock ps"
                  />
                </label>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20 }}>
                <button
                  className="secondary-button"
                  onClick={() => setPlaybookEditorOpen(false)}
                >
                  Цуцлах
                </button>
                <button className="primary-button" onClick={createPlaybook}>
                  Playbook нэмэх
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {commandPaletteOpen && (
        <div
          className="center-modal-overlay"
          onClick={e => {
            if (e.target === e.currentTarget) setCommandPaletteOpen(false);
          }}
        >
          <div className="command-palette-box">
            <div className="command-input-wrap">
              <Search size={18} color="var(--green)" />
              <input
                value={commandSearch}
                onChange={e => setCommandSearch(e.target.value)}
                placeholder="Хайх (Тайлан, Playbook, Даалгавар, цэс)..."
                autoFocus
              />
              <span className="mono tiny" style={{ color: "var(--muted)" }}>
                ESC хаах
              </span>
            </div>
            <div className="command-results">
              {commandSearch.trim() ? (
                commandResults.length === 0 ? (
                  <div style={{ padding: "24px", textAlign: "center", color: "var(--muted)", fontSize: 12 }}>
                    Тохирох үр дүн олдсонгүй.
                  </div>
                ) : (
                  commandResults.map((item, idx) => (
                    <div
                      key={idx}
                      className="command-item"
                      onClick={item.onSelect}
                    >
                      <div className="command-item-left">
                        <FileCode size={15} color="var(--green)" />
                        <div>
                          <strong style={{ fontSize: 12 }}>{item.title}</strong>
                          <small style={{ display: "block", color: "var(--muted)", fontSize: 10 }}>
                            {item.subtitle}
                          </small>
                        </div>
                      </div>
                      <span className="command-item-badge">{item.category}</span>
                    </div>
                  ))
                )
              ) : (
                <>
                  <div style={{ padding: "8px 18px 4px", fontSize: 10, color: "var(--muted)", fontWeight: 700 }}>
                    ХУУДАС РУУ ШИЛЖИХ
                  </div>
                  {navItems.map(item => (
                    <div
                      key={item.label}
                      className="command-item"
                      onClick={() => {
                        setActiveNav(item.label);
                        setCommandPaletteOpen(false);
                      }}
                    >
                      <div className="command-item-left">
                        <item.icon size={15} color="var(--green)" />
                        <span style={{ fontSize: 12 }}>{item.label} руу очих</span>
                      </div>
                      <span className="command-item-badge">Цэс</span>
                    </div>
                  ))}
                  {!publicView && (
                    <>
                      <div style={{ padding: "12px 18px 4px", fontSize: 10, color: "var(--muted)", fontWeight: 700 }}>
                        ШУУРХАЙ ҮЙЛДЭЛ
                      </div>
                      <div
                        className="command-item"
                        onClick={() => {
                          setCommandPaletteOpen(false);
                          openNewReportEditor();
                        }}
                      >
                        <div className="command-item-left">
                          <Plus size={15} color="var(--green)" />
                          <span style={{ fontSize: 12 }}>Шинэ тайлан бичих</span>
                        </div>
                        <span className="command-item-badge">Тайлан</span>
                      </div>
                      <div
                        className="command-item"
                        onClick={() => {
                          setCommandPaletteOpen(false);
                          exportAllMarkdown();
                        }}
                      >
                        <div className="command-item-left">
                          <Download size={15} color="var(--green)" />
                          <span style={{ fontSize: 12 }}>Бүх тайланг Markdown татах</span>
                        </div>
                        <span className="command-item-badge">Экспорт</span>
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {profileOpen && (
        <div
          className="center-modal-overlay"
          onClick={e => {
            if (e.target === e.currentTarget) setProfileOpen(false);
          }}
        >
          <div className="center-modal-box" style={{ maxWidth: 500 }}>
            <div className="modal-header">
              <div>
                <span className="section-kicker">ОПЕРАТОРЫН МЭДЭЭЛЭЛ</span>
                <h3>Тохиргоо &amp; Ажлын талбар</h3>
              </div>
              <button className="icon-button" onClick={() => setProfileOpen(false)}>
                <X size={17} />
              </button>
            </div>
            <div style={{ marginTop: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14, paddingBottom: 16, borderBottom: "1px solid var(--line)" }}>
                <div className="top-avatar" style={{ width: 44, height: 44, fontSize: 16 }}>
                  {(displayName || "O").charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h4 style={{ margin: 0, fontSize: 15 }}>{displayName}</h4>
                  <span style={{ fontSize: 11, color: "var(--muted)" }}>
                    {authUser?.email
                      ? authUser.email
                      : authUser
                        ? "Нэвтэрсэн"
                        : "Нэвтэрээгүй — локал горим"}
                  </span>
                </div>
                {!authUser && (
                  <button className="secondary-button" onClick={() => startLogin()}>
                    Нэвтрэх
                  </button>
                )}
              </div>

              <div style={{ marginTop: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", marginBottom: 6 }}>
                  СИНХРОНЧЛОЛЫН ТҮЛХҮҮР
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  {editingWorkspaceKey === null ? (
                    <>
                      <input
                        readOnly
                        value={workspaceKey}
                        style={{
                          flex: 1,
                          padding: "7px 10px",
                          font: "10px 'DM Mono', monospace",
                          background: "var(--input)",
                          border: "1px solid var(--line)",
                          borderRadius: 4,
                        }}
                      />
                      {!publicView && (
                        <button
                          className="secondary-button"
                          onClick={() => setEditingWorkspaceKey(workspaceKey)}
                          title="Өөр төхөөрөмж дээр хэрэглэхийн тулд засах"
                        >
                          <Pencil size={13} /> Засах
                        </button>
                      )}
                      <button
                        className="secondary-button"
                        onClick={() => copyTextToClipboard(workspaceKey, "Ажлын түлхүүр")}
                      >
                        <Key size={13} /> Хуулах
                      </button>
                    </>
                  ) : (
                    <>
                      <input
                        value={editingWorkspaceKey}
                        onChange={e => setEditingWorkspaceKey(e.target.value)}
                        placeholder="workspace-..."
                        style={{
                          flex: 1,
                          padding: "7px 10px",
                          font: "10px 'DM Mono', monospace",
                          background: "var(--white)",
                          border: "1px solid var(--green)",
                          borderRadius: 4,
                        }}
                      />
                      <button className="primary-button" onClick={applyWorkspaceKey}>
                        Хадгалах
                      </button>
                      <button
                        className="secondary-button"
                        onClick={() => setEditingWorkspaceKey(null)}
                      >
                        Болих
                      </button>
                    </>
                  )}
                </div>
                <p style={{ fontSize: 10, color: "var(--muted)", margin: "6px 0 0", lineHeight: 1.5 }}>
                  Ижил түлхүүртэй төхөөрөмжүүд нэг өгөгдлийн сан хуваалцана. Түлхүүрээ
                  хэнд ч хуваалцахгүй байгаарай — эзлэх хэн ч тайланг засч болно.
                </p>
              </div>

              <input
                ref={backupInput}
                type="file"
                accept="application/json,.json"
                onChange={handleBackupImport}
                hidden
              />
              {!publicView && (
                <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
                  <button
                    className="secondary-button"
                    onClick={exportBackupJson}
                    title="Тайлан, даалгавар, playbook, THM прогресс — бүгд"
                  >
                    <Download size={13} /> JSON бэкап
                  </button>
                  <button
                    className="secondary-button"
                    onClick={() => backupInput.current?.click()}
                    title="JSON бэкапаас буцаах"
                  >
                    <Upload size={13} /> Бэкап импорт
                  </button>
                </div>
              )}

              <div style={{ marginTop: 18, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div style={{ padding: "12px", background: "var(--surface)", borderRadius: 6 }}>
                  <span style={{ fontSize: 10, color: "var(--muted)" }}>Нийт тайлан</span>
                  <strong style={{ display: "block", fontSize: 18, marginTop: 4 }}>
                    {reports.length}
                  </strong>
                </div>
                <div style={{ padding: "12px", background: "var(--surface)", borderRadius: 6 }}>
                  <span style={{ fontSize: 10, color: "var(--muted)" }}>Биелсэн даалгавар</span>
                  <strong style={{ display: "block", fontSize: 18, marginTop: 4, color: "var(--green)" }}>
                    {completedTasksCount} / {tasks.length}
                  </strong>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 24, paddingTop: 14, borderTop: "1px solid var(--line)" }}>
                {!publicView && (
                  <button
                    className="secondary-button"
                    onClick={() => {
                      exportAllMarkdown();
                      setProfileOpen(false);
                    }}
                  >
                    <Download size={14} /> Бүгдийг экспортлох
                  </button>
                )}
                <button
                  className="primary-button"
                  onClick={() => setProfileOpen(false)}
                >
                  Болсон
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {deleteConfirmId && (
        <div
          className="center-modal-overlay"
          onClick={e => {
            if (e.target === e.currentTarget) setDeleteConfirmId(null);
          }}
        >
          <div className="center-modal-box" style={{ maxWidth: 420 }}>
            <div className="modal-header">
              <h3>Тайлан устгах уу?</h3>
              <button className="icon-button" onClick={() => setDeleteConfirmId(null)}>
                <X size={17} />
              </button>
            </div>
            <p style={{ fontSize: 12, color: "var(--muted)", margin: "14px 0 20px", lineHeight: 1.6 }}>
              Энэ үйлдлийг буцаах боломжгүй бөгөөд сонгосон тайлан мэдээллийн сангаас бүрмөсөн устгагдах болно.
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button
                className="secondary-button"
                onClick={() => setDeleteConfirmId(null)}
              >
                Болих
              </button>
              <button
                className="primary-button"
                style={{ background: "var(--red)", borderColor: "var(--red)" }}
                onClick={() => deleteReport(deleteConfirmId)}
              >
                Устгах
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Heatmap({ reports }: { reports: Report[] }) {
  const cells = useMemo(() => {
    const WEEKS = 18;
    const DAYS_PER_WEEK = 7;

    const perDay = new Map<string, number>();
    for (const r of reports) {
      const d = parseReportDate(r.date);
      if (!d) continue;
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      perDay.set(key, (perDay.get(key) ?? 0) + 1);
    }
    const hasRealData = perDay.size > 0;

    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const firstMondayOffset = (start.getDay() + 6) % 7;
    start.setDate(start.getDate() - ((WEEKS - 1) * DAYS_PER_WEEK + firstMondayOffset));

    const out: { level: string; label: string }[] = [];
    for (let dow = 0; dow < DAYS_PER_WEEK; dow++) {
      for (let week = 0; week < WEEKS; week++) {
        const date = new Date(start);
        date.setDate(start.getDate() + week * DAYS_PER_WEEK + dow);
        const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
        const count = perDay.get(key) ?? 0;
        const isFuture = date > today;

        let level = "";
        let label = "Тэмдэглэлгүй";
        if (!isFuture && count > 0) {
          level = count >= 3 ? "heat-4" : count === 2 ? "heat-3" : "heat-1";
          label = `Тайлан: ${count}`;
        } else if (!isFuture && !hasRealData) {
          const idx = out.length;
          if (idx % 19 === 0) level = "heat-4";
          else if (idx % 11 === 0) level = "heat-3";
          else if (idx % 7 === 0) level = "heat-2";
          else if (idx % 3 === 0) level = "heat-1";
        }
        out.push({ level, label });
      }
    }
    return out;
  }, [reports]);

  return (
    <div className="heatmap-card">
      <div className="heatmap-head">
        <span>Үйл ажиллагааны идэвх</span>
        <span className="mono">Сүүлийн 18 долоо хоног</span>
      </div>
      <div className="heatmap-grid">
        {cells.map((cell, index) => (
          <span
            key={index}
            className={cell.level}
            title={cell.label}
          />
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
