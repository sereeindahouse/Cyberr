import {
  Archive,
  ArrowLeft,
  ArrowDownRight,
  ArrowUpRight,
  BookOpen,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Circle,
  Clock3,
  Copy,
  Database,
  Download,
  FileCode,
  FileText,
  Filter,
  FolderKanban,
  Hash,
  ImagePlus,
  Key,
  LayoutDashboard,
  Menu,
  MoreHorizontal,
  Paperclip,
  Pencil,
  Plus,
  Printer,
  RotateCcw,
  Search,
  Share2,
  Shield,
  Sparkles,
  Target,
  Terminal,
  TerminalSquare,
  Trash2,
  Upload,
  User,
  X,
} from "lucide-react";
import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import DOMPurify from "dompurify";
import { marked } from "marked";
import { startLogin } from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";
import {
  importedKnowledgeNotes,
  importedKnowledgePlaybooks,
} from "@/data/ksKnowledge";
import {
  thmFreePathLevels,
  thmFreePathRooms,
  thmRoomUrl,
} from "@/data/thmFreePath";
import { filterReports, toggleReportStatus } from "@/lib/report-utils";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

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
];

const roadmap = [
  {
    stage: "01",
    name: "Суурь",
    stageKey: "Foundations",
    detail: "THM Free Path: Getting Started + Tooling",
    levelIds: ["level-1", "level-2"],
    active: true,
  },
  {
    stage: "02",
    name: "Бодит туршилт",
    stageKey: "Live Fire",
    detail: "THM Free Path: Crypto + Web",
    levelIds: ["level-3", "level-4"],
    active: true,
  },
  {
    stage: "03",
    name: "Гүн довтолгоо",
    stageKey: "Deep Offensive",
    detail: "THM Free Path: RE + Networking",
    levelIds: ["level-5", "level-6"],
    active: false,
  },
  {
    stage: "04",
    name: "Мэргэжлийн талбар",
    stageKey: "Pro Arena",
    detail: "THM Free Path: Privilege Escalation + CTF",
    levelIds: ["level-7", "level-8"],
    active: false,
  },
  {
    stage: "05",
    name: "Хэрэглээ",
    stageKey: "Deployment",
    detail: "THM Free Path: Windows",
    levelIds: ["level-9"],
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
    content:
      "## Даалгаврын тойм\n\nАрхитектур болон халдлагын гадаргуу, итгэмжлэгдсэн хил хязгаарыг тодорхойлох.\n\n## Үндсэн шалтгаан\n\n",
  },
  {
    key: "thm",
    label: "THM room тайлан",
    source: "THM" as const,
    stage: "Foundations",
    tags: ["tryhackme", "room-debrief"],
    content:
      "## Room-ийн зорилго\n\nЭмзэг байдлыг илрүүлэх болон нэвтрэх дараалал.\n\n## Ашигласан техникүүд\n\n",
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
    return [...reports, ...imported.filter(note => !reports.some((report: Report) => report.id === note.id))];
  } catch {
    return [...initialReports, ...importedKnowledgeNotes.map(note => ({
      ...note,
      tags: [...note.tags],
      source: note.source as Report["source"],
      status: note.status as ReportStatus,
    }))];
  }
}

/** "Sep 14, 2026" — the date format the rest of the app and exports expect. */
export function formatReportDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/** Best-effort parse of the display date format; null when unparseable. */
export function parseReportDate(value: string): Date | null {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

let localStorageFullWarned = false;

/**
 * localStorage.setItem throws QuotaExceededError once the ~5 MB budget is
 * exhausted (the imported knowledge base alone is ~0.5 MB; a few screenshot
 * attachments fill the rest). Throwing inside a React effect crashes the
 * whole app into the error boundary, so catch and warn once instead.
 */
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

function readThmProgress(): Record<string, boolean> {
  try {
    const saved = localStorage.getItem("operator-dossier-thm-progress");
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
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
    readTime: `${estimatedMin < 10 ? "0" : ""}${estimatedMin} min`,
    date: getValue("date") || formatReportDate(new Date()),
    excerpt: body
      .replace(/^#+\s+/gm, "")
      .replace(/\s+/g, " ")
      .slice(0, 150),
    content: body,
  };
}

// Real Markdown rendering. The old version only understood "## " headings and
// blank lines, so every code fence, table, list, link and <details> block in
// the imported knowledge base rendered as raw text. Content is sanitized with
// DOMPurify because reports can originate from Obsidian imports (untrusted).
function MarkdownPreview({ content }: { content: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  const html = useMemo(() => {
    // async:false makes parse() return a string synchronously.
    const raw = marked.parse(content, { gfm: true, breaks: false, async: false });
    return DOMPurify.sanitize(String(raw), { ADD_ATTR: ["target"] });
  }, [content]);

  // Inject a copy button into every fenced code block (delegated, so it
  // survives re-renders).
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
  const [thmProgress, setThmProgress] = useState<Record<string, boolean>>(readThmProgress);
  const [workspaceKey, setWorkspaceKey] = useState(() => getWorkspaceKey());
  const [editingWorkspaceKey, setEditingWorkspaceKey] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState(1);
  const { user: authUser } = useAuth();
  const displayName = authUser?.name || "Operator";
  const [statusFilter, setStatusFilter] = useState<"All" | ReportStatus | "Archived">("All");
  const [tagFilter, setTagFilter] = useState("All");
  const [query, setQuery] = useState("");
  const [sortMode, setSortMode] = useState<"newest" | "oldest" | "title" | "readTime">("newest");
  const [mobileNav, setMobileNav] = useState(false);

  // Modals & Drawers
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

  // Form states for Report
  const [newTitle, setNewTitle] = useState("");
  const [newRoom, setNewRoom] = useState("");
  const [newStage, setNewStage] = useState("Foundations");
  const [newSource, setNewSource] = useState<Report["source"]>("Cyber");
  const [templateKey, setTemplateKey] = useState("custom");
  const [newContent, setNewContent] = useState("");
  const [attachment, setAttachment] = useState<string | undefined>();

  // Form states for Task
  const [addingTaskGroup, setAddingTaskGroup] = useState<"today" | "tomorrow" | "later" | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [editingTaskTitle, setEditingTaskTitle] = useState("");
  const [editingTaskDetail, setEditingTaskDetail] = useState("");

  // Form states for Playbook
  const [newPbTitle, setNewPbTitle] = useState("");
  const [newPbCategory, setNewPbCategory] = useState<"linux" | "network" | "cloud" | "windows">("linux");
  const [newPbDesc, setNewPbDesc] = useState("");
  const [newPbMethodology, setNewPbMethodology] = useState("");
  const [newPbCmdLabel, setNewPbCmdLabel] = useState("");
  const [newPbCmdText, setNewPbCmdText] = useState("");

  // Calendar state
  const [calMonthOffset, setCalMonthOffset] = useState(0);
  const [selectedDay, setSelectedDay] = useState<number | null>(new Date().getDate());

  const fileInput = useRef<HTMLInputElement>(null);
  const obsidianInput = useRef<HTMLInputElement>(null);
  const backupInput = useRef<HTMLInputElement>(null);
  const mongoHydrated = useRef(false);
  // Set while a workspace-key switch is waiting for the new key's list.
  // Gates the persist effect (never sync old workspace data into the new
  // key) and the hydration merge (no cross-workspace report leakage).
  const workspaceSwitched = useRef(false);

  const mongoReports = trpc.reports.list.useQuery(
    { workspaceKey },
    { retry: false }
  );
  const mongoStatus = trpc.reports.status.useQuery(undefined, { retry: false });
  // `sync` mirrors the full workspace (upsert + delete + rebuild tags), so
  // deletions actually propagate. The old upsert-only call made deleted
  // reports come back on the next load.
  const persistReports = trpc.reports.sync.useMutation();
  const isCloudBackend = mongoStatus.data?.backend === "mongodb";

  // Hydrate once the cloud list arrives. `reports` here is the initial local
  // state: the persist effect is gated on this same ref, so nothing else can
  // have changed it before hydration runs.
  useEffect(() => {
    if (!mongoReports.data || mongoHydrated.current) return;
    if (mongoReports.data.length) {
      const remoteReports = mongoReports.data as unknown as Report[];
      const imported = importedKnowledgeNotes.map(note => ({
        ...note,
        tags: [...note.tags],
        source: note.source as Report["source"],
        status: note.status as ReportStatus,
      }));
      const localOnly = reports.filter(
        r =>
          !remoteReports.some(report => report.id === r.id) &&
          !imported.some(note => note.id === r.id)
      );
      const mergedReports = [
        ...remoteReports,
        ...imported.filter(note => !remoteReports.some(report => report.id === note.id)),
        // Keep local-only reports (e.g. created while offline) so a reload
        // never discards unsynced work.
        ...localOnly,
      ];
      setReports(mergedReports);
      setSelectedId(mergedReports[0]?.id || 1);
    }
    mongoHydrated.current = true;
    // New workspace is now authoritative — re-enable persistence to it.
    workspaceSwitched.current = false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mongoReports.data]);

  const lastSyncFailureToast = useRef(0);
  useEffect(() => {
    saveReports(reports);
    if (mongoHydrated.current && !workspaceSwitched.current && reports.length) {
      persistReports.mutate(
        { workspaceKey, reports },
        {
          onError: (error) => {
            // Surface sync failure once per 30 s (the effect refires on every
            // edit, so without throttling this would spam toasts).
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
        }
      );
    }
  }, [reports, workspaceKey]);

  useEffect(() => {
    saveTasks(tasks);
  }, [tasks]);

  useEffect(() => {
    savePlaybooks(playbooks);
  }, [playbooks]);

  useEffect(() => {
    localStorage.setItem("operator-dossier-thm-progress", JSON.stringify(thmProgress));
  }, [thmProgress]);

  // Global Keyboard Shortcuts (Ctrl+K for search, Escape for closing modals)
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

  const availableTags = useMemo(
    () => Array.from(new Set(reports.flatMap(report => report.tags))).sort(),
    [reports]
  );

  const filteredReports = useMemo<Report[]>(() => {
    let list: Report[] = reports;
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
  }, [reports, statusFilter, tagFilter, query, sortMode]);

  const selectedReport =
    reports.find(report => report.id === selectedId) || reports[0];
  const publishedCount = reports.filter(
    report => report.status === "Published"
  ).length;
  const completedTasksCount = tasks.filter(t => t.completed).length;
  const uniqueThmRooms = Array.from(
    new Map(thmFreePathRooms.map(room => [room.id, room])).values()
  );
  const completedThmRooms = uniqueThmRooms.filter(room => thmProgress[room.id]).length;
  const thmProgressPercent = uniqueThmRooms.length
    ? Math.round((completedThmRooms / uniqueThmRooms.length) * 100)
    : 0;
  const roadmapWithProgress = useMemo(
    () =>
      roadmap.map(item => {
        const rooms = thmFreePathRooms.filter(room => item.levelIds.includes(room.levelId));
        const completed = rooms.filter(room => thmProgress[room.id]).length;
        return {
          ...item,
          progress: rooms.length ? Math.round((completed / rooms.length) * 100) : 0,
        };
      }),
    [thmProgress]
  );

  // Editor Actions
  function openNewReportEditor() {
    setEditingReportId(null);
    setNewTitle("");
    setNewRoom("");
    setNewStage("Foundations");
    setNewSource("Cyber");
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
    setTemplateKey("thm");
    setNewContent(
      `## Room-ийн зорилго\n\n${room.title}\n\n## THM холбоос\n\n${thmRoomUrl(room.slug)}\n\n## Олсон зүйлс\n\n\n## Ашигласан техникүүд\n\n\n## Дүгнэлт\n\n`
    );
    setAttachment(undefined);
    setEditorOpen(true);
  }

  function toggleThmRoom(roomId: string) {
    setThmProgress(current => ({ ...current, [roomId]: !current[roomId] }));
  }

  function openEditReport(report: Report) {
    setEditingReportId(report.id);
    setNewTitle(report.title);
    setNewRoom(report.room);
    setNewStage(report.stage);
    setNewSource(report.source);
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

  function handleAttachment(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    // Screenshots are stored as base64 in localStorage AND MongoDB. Without a
    // cap a single 10 MB screenshot bloats every sync payload and can push
    // localStorage past its ~5 MB quota (which used to crash the app).
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
      // Edit existing
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
              }
            : item
        )
      );
      toast.success("Тайлан амжилттай шинэчлэгдлээ!");
    } else {
      // Create new
      const report: Report = {
        id: Date.now(),
        title: newTitle.trim(),
        room: newRoom.trim() || "Unassigned room",
        source: newSource,
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
        readTime: calculatedReadTime,
        // Real creation date — previously every new report was stamped
        // "Sep 14, 2026".
        date: formatReportDate(new Date()),
        excerpt: calculatedExcerpt,
        content: newContent,
        image: attachment,
      };
      setReports(current => [report, ...current]);
      setSelectedId(report.id);
      toast.success("Шинэ тайлан амжилттай үүсгэгдлээ!");
    }
    setEditorOpen(false);
    setActiveNav("Тайлан");
  }

  function deleteReport(id: number) {
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
    setReports(current =>
      current.map(r => (r.id === id ? { ...r, archived: !r.archived } : r))
    );
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
    const bundle = reports.map(reportToMarkdown).join("\n---\n\n");
    downloadText("operator-dossier-all-reports.md", bundle);
    toast.success("Бүх тайланг файлд нэгтгэн татлаа");
  }

  /** Full JSON backup — the only lossless format (Markdown export drops
   *  tasks, playbooks, THM progress and attachments). */
  function exportBackupJson() {
    const payload = {
      kind: "operator-dossier-backup",
      version: 1,
      exportedAt: new Date().toISOString(),
      workspaceKey,
      reports,
      tasks,
      playbooks,
      thmProgress,
    };
    downloadText(
      `operator-dossier-backup-${formatReportDate(new Date()).replace(/[,\s]+/g, "-")}.json`,
      JSON.stringify(payload, null, 2),
      "application/json"
    );
    toast.success("JSON бэкап татагдаж эхэллээ");
  }

  function handleBackupImport(event: ChangeEvent<HTMLInputElement>) {
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
        if (Array.isArray(data.tasks)) setTasks(data.tasks);
        if (Array.isArray(data.playbooks)) setPlaybooks(data.playbooks);
        if (data.thmProgress && typeof data.thmProgress === "object") {
          setThmProgress(data.thmProgress as Record<string, boolean>);
        }
        toast.success("Бэкап амжилттай импортлогдлоо");
      } catch {
        toast.error("Бэкап файл алдаатай эсвэл зөв формат биш");
      }
    };
    reader.readAsText(file);
  }

  function applyWorkspaceKey() {
    if (editingWorkspaceKey === null) return;
    const next = editingWorkspaceKey.trim();
    // Server schema: 12–160 chars.
    if (next.length < 12 || next.length > 160) {
      toast.error("Ажлын түлхүүр 12–160 тэмдэгтэй байх ёстой");
      return;
    }
    if (next === workspaceKey) {
      setEditingWorkspaceKey(null);
      return;
    }
    // Enter the new workspace cleanly: reset to the canonical fresh state
    // and arm the switch guard so the current (old workspace) data is never
    // synced into the new key before its list has been fetched.
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
        date: parsed.date || formatReportDate(new Date()),
        excerpt: parsed.excerpt || "Obsidian-аас импорт хийсэн тэмдэглэл.",
        content: parsed.content || "",
        image: undefined,
      };
      setReports(current => [imported, ...current]);
      setSelectedId(imported.id);
      setActiveNav("Тайлан");
      toast.success(`"${imported.title}" амжилттай импортлогдлоо!`);
    };
    reader.readAsText(file);
    event.target.value = "";
  }

  function togglePublished(reportId: number) {
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

  // Task Actions
  function toggleTask(id: number) {
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
    setTasks(current => current.filter(t => t.id !== id));
    if (editingTaskId === id) setEditingTaskId(null);
    toast.info("Даалгавар хасагдлаа");
  }

  function startEditTask(task: TaskItem) {
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

  // Playbook Creator Action
  function createPlaybook() {
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

  // Real month navigation: the displayed month is "today's month + offset".
  // Previously this was a hardcoded 3-month array (Aug–Oct 2026) and a fixed
  // 31+30 day grid, so the calendar never matched the actual date.
  const now = useMemo(() => new Date(), []);
  const displayed = useMemo(() => {
    const base = new Date(now.getFullYear(), now.getMonth() + calMonthOffset, 1);
    const year = base.getFullYear();
    const month = base.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    // Monday-first offset so the grid lines up with the M T W T F S S header.
    const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7;
    return { year, month, daysInMonth, firstWeekday };
  }, [now, calMonthOffset]);
  const currentMonthDisplay = `${displayed.year} оны ${displayed.month + 1}-р сар`;

  // Days that actually have a report, keyed by "YYYY-M-D".
  const reportDays = useMemo(() => {
    const set = new Set<string>();
    for (const r of reports) {
      const d = parseReportDate(r.date);
      if (d) set.add(`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`);
    }
    return set;
  }, [reports]);
  const dayHasReport = (day: number) =>
    reportDays.has(`${displayed.year}-${displayed.month}-${day}`);

  function selectCalendarDay(day: number) {
    setSelectedDay(day);
    const dayReports = reports
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

  // Quick Command Palette matches
  const commandResults = useMemo(() => {
    if (!commandSearch.trim()) return [];
    const q = commandSearch.toLowerCase();
    const matches: { title: string; subtitle: string; category: string; onSelect: () => void }[] = [];

    // Reports
    reports.forEach(r => {
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

    // Playbooks
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

    // Tasks
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
  }, [commandSearch, reports, playbooks, tasks]);

  return (
    <div className="app-shell">
      {/* Sidebar */}
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
                  <span className="nav-count">{reports.length}</span>
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
          {roadmapWithProgress.map(item => (
            <div
              key={item.stage}
              className={`side-roadmap-row clickable-card ${item.active ? "roadmap-active" : ""}`}
              onClick={() => {
                setTagFilter("All");
                setStatusFilter("All");
                setActiveNav("Тайлан");
                toast.info(`"${item.name}" шатны тайлангуудыг шүүж байна`);
              }}
              title="Энэ шатны тайлангуудыг үзэх"
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

      {/* Main Area */}
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

            {/* Notifications Popup */}
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

        {/* View 1: Dashboard (Ерөнхий) */}
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
                {/* Interactive Mini Calendar */}
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

                {/* Completion Ring */}
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

                {/* Heatmap */}
                <Heatmap reports={reports} />

                {/* Weekly Stats */}
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

              {/* Right Column: Dynamic Task Queue */}
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
                          <button
                            className="text-button"
                            style={{ fontSize: 10 }}
                            onClick={() => setAddingTaskGroup(grp)}
                          >
                            + Нэмэх
                          </button>
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
                              {!isEditing && (
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
                              {!isEditing && (
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

                        {/* Inline Task Adder */}
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
                              style={{ background: "#ccc", color: "#333" }}
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

            {/* Roadmap Section */}
            <section className="roadmap-section">
              <div className="section-header">
                <div>
                  <div className="section-kicker">Үе шатууд</div>
                  <h2>Ур чадварын замын зураг</h2>
                </div>
                <span className="mono tiny">5 Шатлал</span>
              </div>
              <div className="roadmap-track">
                {roadmapWithProgress.map((item, index) => (
                  <div
                    key={item.stage}
                    className={`roadmap-card clickable-card ${item.active ? "is-active" : ""}`}
                    onClick={() => {
                      setTagFilter("All");
                      setStatusFilter("All");
                      setActiveNav("Тайлан");
                      toast.info(`"${item.name}" шатны тайлангуудыг шүүж байна`);
                    }}
                    title="Шууд тайлан руу шилжих"
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

        {/* View 2: Reports (Тайлан) */}
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
                  title="Obsidian-ийн .md файлыг уншиж оруулах"
                >
                  <Upload size={14} /> Obsidian импорт
                </button>
                <button className="primary-button" onClick={openNewReportEditor}>
                  <Plus size={16} /> Шинэ тайлан
                </button>
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
              {/* Left Panel: Search & List */}
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
                        style={{ background: "transparent", color: "#999", padding: 2 }}
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

                <div className="tag-filter-row">
                  <span className="tag-filter-label">Шошго:</span>
                  <button
                    className={tagFilter === "All" ? "tag-chip selected" : "tag-chip"}
                    onClick={() => setTagFilter("All")}
                  >
                    Бүгд
                  </button>
                  {availableTags.map(tag => (
                    <button
                      key={tag}
                      className={tagFilter === tag ? "tag-chip selected" : "tag-chip"}
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

              {/* Right Panel: Detail View */}
              <div className="report-detail-panel">
                {selectedReport ? (
                  <>
                    <div className="detail-top">
                      <div className="detail-kicker">
                        {selectedReport.source} / {selectedReport.stage.toUpperCase()}
                      </div>
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
                              onClick={() => archiveReport(selectedReport.id)}
                            >
                              <span>📦 Архивлах</span>
                            </button>
                            <div style={{ borderTop: "1px solid var(--line)", margin: "4px 0" }} />
                            <button
                              className="command-item"
                              style={{ padding: "6px 10px", fontSize: 11, color: "#a13d3d" }}
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
                        className="secondary-button"
                        onClick={() => openEditReport(selectedReport)}
                        title="Тайланг засах"
                      >
                        Засах
                      </button>
                      <button
                        className="secondary-button"
                        onClick={openReportReader}
                        title="Тайланг төвлөрсөн уншигч горимоор нээх"
                      >
                        <BookOpen size={14} /> Бүтэн унших
                      </button>
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
                    </div>
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

        {/* View 2b: Focused report reader */}
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
                  <div className="detail-actions">
                    <button className="export-button" onClick={exportSelectedMarkdown}>
                      <Download size={14} /> Markdown
                    </button>
                    <button className="export-button" onClick={exportSelectedPdf}>
                      <Printer size={14} /> Хэвлэх (PDF)
                    </button>
                    <button className="export-button" onClick={() => copyMarkdownToClipboard(selectedReport)}>
                      <Copy size={14} /> Хуулах
                    </button>
                    <button className="secondary-button" onClick={() => openEditReport(selectedReport)}>
                      Засах
                    </button>
                  </div>
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

        {/* View 3: Playbooks (Сургалт) */}
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
              <button
                className="primary-button"
                onClick={() => setPlaybookEditorOpen(true)}
              >
                <Plus size={16} /> Шинэ playbook
              </button>
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

        {/* View 4: Roadmap (Замын зураг) */}
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
              {roadmapWithProgress.map(item => (
                <div
                  className={`roadmap-large-row clickable-card ${item.active ? "active" : ""}`}
                  key={item.stage}
                  onClick={() => {
                    setTagFilter("All");
                    setStatusFilter("All");
                    setActiveNav("Тайлан");
                    toast.info(`"${item.name}" шатны тайлангуудыг шүүж байна`);
                  }}
                  title="Энэ үе шатны холбогдох тайлангуудыг үзэх"
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

            <div className="thm-progress-summary">
              <div>
                <div className="section-kicker">THM Free Path tracker</div>
                <h2>{thmProgressPercent}% дууссан</h2>
                <p>{completedThmRooms} / {uniqueThmRooms.length} unique curated room дууссан</p>
              </div>
              <div className="thm-progress-bar" aria-label={`THM Free Path ${thmProgressPercent}% дууссан`}>
                <i style={{ width: `${thmProgressPercent}%` }} />
              </div>
            </div>

            <div className="thm-room-tracker">
              <div className="section-header">
                <div>
                  <div className="section-kicker">Room completion</div>
                  <h2>Дуусгасан room-уудаа тэмдэглэ</h2>
                </div>
                <a
                  className="text-button"
                  href={"https://tryhackme.com/resources/blog/free_path"}
                  target="_blank"
                  rel="noreferrer"
                >
                  Албан эх сурвалж <ArrowUpRight size={14} />
                </a>
              </div>
              {thmFreePathLevels.map(level => {
                const levelRooms = thmFreePathRooms.filter(room => room.levelId === level.id);
                const levelCompleted = levelRooms.filter(room => thmProgress[room.id]).length;
                return (
                  <details className="thm-level" key={level.id} open={level.id === "level-1"}>
                    <summary>
                      <span>
                        <strong>{level.label}: {level.title}</strong>
                        <small>{levelCompleted} / {levelRooms.length} дууссан</small>
                      </span>
                      <span className="thm-level-percent">
                        {Math.round((levelCompleted / levelRooms.length) * 100)}%
                      </span>
                    </summary>
                    <div className="thm-room-list">
                      {levelRooms.map(room => {
                        const completed = Boolean(thmProgress[room.id]);
                        return (
                          <div className={`thm-room-row ${completed ? "completed" : ""}`} key={room.id}>
                            <button
                              className="thm-room-check"
                              aria-label={`${room.title} ${completed ? "дууссан" : "дуусаагүй"}`}
                              aria-pressed={completed}
                              onClick={() => toggleThmRoom(room.id)}
                            >
                              {completed && <Check size={13} />}
                            </button>
                            <div className="thm-room-copy">
                              <strong>{room.title}</strong>
                              <small>tryhackme.com/room/{room.slug}</small>
                            </div>
                            <a
                              className="icon-button"
                              href={thmRoomUrl(room.slug)}
                              target="_blank"
                              rel="noreferrer"
                              title="THM room нээх"
                              onClick={event => event.stopPropagation()}
                            >
                              <ArrowUpRight size={14} />
                            </a>
                            <button
                              className="thm-report-button"
                              onClick={() => openRoomReportEditor(room)}
                            >
                              <FileText size={13} /> Report
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </details>
                );
              })}
            </div>
          </section>
        )}
      </main>

      {/* MODAL 1: Report Creator / Editor */}
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

      {/* MODAL 2: Playbook Viewer */}
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
                  background: "#f3f6f3",
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

      {/* MODAL 3: Playbook Creator */}
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

      {/* MODAL 4: Global Search / Command Palette (Ctrl+K) */}
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
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: User Profile & Workspace Settings */}
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
                          background: "#f0f4f0",
                          border: "1px solid var(--line)",
                          borderRadius: 4,
                        }}
                      />
                      <button
                        className="secondary-button"
                        onClick={() => setEditingWorkspaceKey(workspaceKey)}
                        title="Өөр төхөөрөмж дээр хэрэглэхийн тулд засах"
                      >
                        <Pencil size={13} /> Засах
                      </button>
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
                          background: "#fff",
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

              <div style={{ marginTop: 18, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div style={{ padding: "12px", background: "#f5f7f5", borderRadius: 6 }}>
                  <span style={{ fontSize: 10, color: "var(--muted)" }}>Нийт тайлан</span>
                  <strong style={{ display: "block", fontSize: 18, marginTop: 4 }}>
                    {reports.length}
                  </strong>
                </div>
                <div style={{ padding: "12px", background: "#f5f7f5", borderRadius: 6 }}>
                  <span style={{ fontSize: 10, color: "var(--muted)" }}>Биелсэн даалгавар</span>
                  <strong style={{ display: "block", fontSize: 18, marginTop: 4, color: "var(--green)" }}>
                    {completedTasksCount} / {tasks.length}
                  </strong>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 24, paddingTop: 14, borderTop: "1px solid var(--line)" }}>
                <button
                  className="secondary-button"
                  onClick={() => {
                    exportAllMarkdown();
                    setProfileOpen(false);
                  }}
                >
                  <Download size={14} /> Бүгдийг экспортлох
                </button>
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

      {/* MODAL 6: Report Delete Confirmation */}
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
                style={{ background: "#a13d3d", borderColor: "#a13d3d" }}
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

// 18-week activity grid. The previous version was a fixed pseudo-random
// pattern; now every cell reflects real report dates (a day with 1, 2, or
// 3+ reports lights up). The decorative fallback only appears when the
// workspace has no parseable dates at all.
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

    // Build the 18×7 grid so columns are weeks (Mon–Sun) and today lands on
    // its correct day-of-week in the final column.
    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const firstMondayOffset = (start.getDay() + 6) % 7; // Monday-first dow
    // Monday of the week containing today, minus (WEEKS-1) weeks.
    start.setDate(start.getDate() - ((WEEKS - 1) * DAYS_PER_WEEK + firstMondayOffset));

    // CSS grid fills row-major (18 columns), so emit day-of-week first and
    // week second to keep columns = weeks.
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
