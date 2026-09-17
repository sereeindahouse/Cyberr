import { useMemo } from "react";
import { Clock3, FileText, Hash, Tag, Layers, BookOpen } from "lucide-react";

type InsightsReport = {
  id: number;
  title: string;
  source: string;
  stage: string;
  tags: string[];
  readTime: string;
  date: string;
  status?: string;
  room?: string;
  content?: string;
};

type InsightsDashboardProps = {
  reports: InsightsReport[];
  onOpenReport?: (id: number) => void;
  ai?: {
    provider?: string;
    model?: string;
    analyzed?: number;
    total?: number;
    concepts?: string[];
  } | null;
};

function toDate(v: string): Date | null {
  if (!v) return null;
  // Try ISO or "Sep 14, 2026"
  const direct = new Date(v);
  if (!Number.isNaN(direct.getTime())) return direct;
  // Try YYYY.MM.DD or YYYY/MM/DD or YYYY-MM-DD
  const m = String(v).match(/(\d{4})[.\-/](\d{1,2})[.\-/](\d{1,2})/);
  if (m) {
    const y = Number(m[1]);
    const mo = Number(m[2]) - 1;
    const d = Number(m[3]);
    const dt = new Date(y, mo, d);
    if (!Number.isNaN(dt.getTime())) return dt;
  }
  return null;
}

function readMinutes(rt: string): number {
  if (!rt) return 0;
  const m = String(rt).match(/(\d+)/);
  return m ? Number(m[1]) : 0;
}

function startOfWeekMonday(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = (d.getDay() + 6) % 7; // Monday 0
  d.setDate(d.getDate() - day);
  return d;
}

function formatDay(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function tokenizeTitle(title: string): Set<string> {
  return new Set(
    String(title)
      .toLowerCase()
      .split(/[^a-z0-9\u0400-\u04FF]+/u)
      .filter(t => t.length >= 2)
  );
}

function jaccard(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 && b.size === 0) return 0;
  let inter = 0;
  for (const t of a) if (b.has(t)) inter++;
  const union = a.size + b.size - inter;
  return union === 0 ? 0 : inter / union;
}

export default function InsightsDashboard({ reports, onOpenReport, ai }: InsightsDashboardProps) {
  const stats = useMemo(() => {
    const total = reports.length;
    const published = reports.filter(r => r.status === "Published").length;
    const draft = reports.filter(r => r.status === "Draft").length;
    const allTags = new Set<string>();
    reports.forEach(r => (r.tags ?? []).forEach(t => allTags.add(t.toLowerCase())));
    const rooms = new Set<string>();
    reports.forEach(r => {
      if (r.room) rooms.add(r.room);
      else if (r.stage) rooms.add(r.stage);
    });
    const totalMinutes = reports.reduce((sum, r) => sum + readMinutes(r.readTime), 0);
    return { total, published, draft, tagCount: allTags.size, roomCount: rooms.size, totalMinutes };
  }, [reports]);

  // 52-week activity calendar
  const calendar = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endMonday = startOfWeekMonday(today);
    // 52 weeks back
    const start = new Date(endMonday);
    start.setDate(start.getDate() - 51 * 7);
    const perDay = new Map<string, number>();
    for (const r of reports) {
      const d = toDate(r.date);
      if (!d) continue;
      d.setHours(0, 0, 0, 0);
      const key = formatDay(d);
      perDay.set(key, (perDay.get(key) ?? 0) + 1);
    }
    const cells: { date: Date; count: number; level: number }[] = [];
    for (let i = 0; i < 52 * 7; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      const key = formatDay(date);
      const count = perDay.get(key) ?? 0;
      let level = 0;
      if (count >= 5) level = 4;
      else if (count >= 3) level = 3;
      else if (count === 2) level = 2;
      else if (count === 1) level = 1;
      cells.push({ date, count, level });
    }
    return { cells, start, endMonday };
  }, [reports]);

  // Weekly additions last 26 weeks
  const weekly = useMemo(() => {
    const today = new Date();
    const end = startOfWeekMonday(today);
    const weeks: { label: string; count: number; start: Date }[] = [];
    for (let i = 25; i >= 0; i--) {
      const s = new Date(end);
      s.setDate(end.getDate() - i * 7);
      const e = new Date(s);
      e.setDate(s.getDate() + 6);
      weeks.push({ label: `${s.getMonth() + 1}/${s.getDate()}`, count: 0, start: s });
    }
    for (const r of reports) {
      const d = toDate(r.date);
      if (!d) continue;
      const ds = startOfWeekMonday(d);
      for (const w of weeks) {
        if (ds.getTime() === w.start.getTime()) {
          w.count++;
          break;
        }
      }
    }
    const max = Math.max(1, ...weeks.map(w => w.count));
    return { weeks, max };
  }, [reports]);

  // Source donut
  const sourceData = useMemo(() => {
    const map = new Map<string, number>();
    for (const r of reports) {
      const src = r.source || "Бусад";
      map.set(src, (map.get(src) ?? 0) + 1);
    }
    const arr = [...map.entries()].sort((a, b) => b[1] - a[1]);
    const total = arr.reduce((s, [, c]) => s + c, 0) || 1;
    return { arr, total };
  }, [reports]);

  // Stage horizontal bar
  const stageData = useMemo(() => {
    const map = new Map<string, number>();
    for (const r of reports) {
      const st = r.stage || "Бусад";
      map.set(st, (map.get(st) ?? 0) + 1);
    }
    const arr = [...map.entries()].sort((a, b) => b[1] - a[1]);
    const max = Math.max(1, ...arr.map(([, c]) => c));
    return { arr, max };
  }, [reports]);

  // Top tags
  const topTags = useMemo(() => {
    const map = new Map<string, number>();
    for (const r of reports) {
      for (const t of r.tags ?? []) {
        const key = t.toLowerCase();
        map.set(key, (map.get(key) ?? 0) + 1);
      }
    }
    const arr = [...map.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, 12);
    const max = Math.max(1, ...arr.map(([, c]) => c));
    return { arr, max };
  }, [reports]);

  // Weekday rhythm
  const weekdayData = useMemo(() => {
    const counts = [0, 0, 0, 0, 0, 0, 0]; // Mon-Sun
    for (const r of reports) {
      const d = toDate(r.date);
      if (!d) continue;
      const dow = (d.getDay() + 6) % 7;
      counts[dow]++;
    }
    const max = Math.max(1, ...counts);
    return { counts, max };
  }, [reports]);

  // Duplicates
  const duplicates = useMemo(() => {
    const tokens = reports.map(r => ({ id: r.id, title: r.title, set: tokenizeTitle(r.title) }));
    const pairs: { a: typeof tokens[0]; b: typeof tokens[0]; score: number }[] = [];
    for (let i = 0; i < tokens.length; i++) {
      for (let j = i + 1; j < tokens.length; j++) {
        const score = jaccard(tokens[i].set, tokens[j].set);
        if (score >= 0.5) pairs.push({ a: tokens[i], b: tokens[j], score });
      }
    }
    pairs.sort((x, y) => y.score - x.score);
    return pairs.slice(0, 6);
  }, [reports]);

  const recent = useMemo(() => {
    return [...reports].sort((a, b) => b.id - a.id).slice(0, 8);
  }, [reports]);

  const weekdayLabels = ["Да", "Мя", "Лх", "Пү", "Ба", "Бя", "Ня"];

  return (
    <div className="insights-module">
      <div className="page-title-row" style={{ marginBottom: 24 }}>
        <div>
          <div className="eyebrow"><span className="signal-dot" /> Дүн шинжилгээ</div>
          <h1>Төслийн дүн шинжилгээ</h1>
          <p>Тэмдэглэл, шошго, эх сурвалж, бичих хэмнэлийн статистик.</p>
        </div>
      </div>

      <div className="insights-grid">
        <div className="insights-stat">
          <div className="insights-stat-icon"><FileText size={16} /></div>
          <strong>{stats.total}</strong>
          <small>Нийт тэмдэглэл</small>
        </div>
        <div className="insights-stat">
          <div className="insights-stat-icon"><BookOpen size={16} /></div>
          <strong>{stats.published}</strong>
          <small>Нийтлэгдсэн</small>
        </div>
        <div className="insights-stat">
          <div className="insights-stat-icon"><Layers size={16} /></div>
          <strong>{stats.draft}</strong>
          <small>Ноорог</small>
        </div>
        <div className="insights-stat">
          <div className="insights-stat-icon"><Hash size={16} /></div>
          <strong>{stats.tagCount}</strong>
          <small>Шошго</small>
        </div>
        <div className="insights-stat">
          <div className="insights-stat-icon"><Tag size={16} /></div>
          <strong>{stats.roomCount}</strong>
          <small>Өрөө / сэдэв</small>
        </div>
        <div className="insights-stat">
          <div className="insights-stat-icon"><Clock3 size={16} /></div>
          <strong>{stats.totalMinutes} мин</strong>
          <small>Нийт унших хугацаа</small>
        </div>
      </div>

      {ai && (
        <div className="ai-strip">
          <span className="ai-badge">
            {ai.provider === "moonshot" ? `AI (${ai.model})` : "Орон нутгийн шинжилгээ"} · {ai.analyzed}/{ai.total}
          </span>
          {ai.concepts && ai.concepts.length > 0 && (
            <div className="ai-concept-row">
              {ai.concepts.slice(0, 8).map((c, i) => (
                <span key={`${c}-${i}`} className="ai-concept">#{c}</span>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="insights-row">
        <div className="insights-card">
          <div className="section-kicker">Идэвхийн календарь — 52 долоо хоног</div>
          <div className="heatmap-scroll">
            <svg width={52 * 15} height={7 * 15 + 20} role="img" aria-label="52 week activity">
              {calendar.cells.map((cell, idx) => {
                const week = Math.floor(idx / 7);
                const dow = idx % 7;
                const x = week * 15;
                const y = dow * 15;
                const fillClass = `heat-${cell.level}`;
                // Use CSS var via inline style
                const fillVar = `var(--heat-${cell.level})`;
                return (
                  <rect
                    key={idx}
                    x={x}
                    y={y}
                    width={13}
                    height={13}
                    rx={2}
                    className={fillClass}
                    style={{ fill: fillVar } as any}
                  >
                    <title>{`${cell.date.toLocaleDateString()} — ${cell.count} тэмдэглэл`}</title>
                  </rect>
                );
              })}
            </svg>
          </div>
          <div className="heatmap-legend">
            <span>Бага</span>
            <span style={{ display: "flex", gap: 3 }}>
              {[0, 1, 2, 3, 4].map(l => (
                <i key={l} className={`heat-${l}`} style={{ width: 10, height: 10, display: "inline-block", background: `var(--heat-${l})`, borderRadius: 2 }} />
              ))}
            </span>
            <span>Их</span>
          </div>
        </div>

        <div className="insights-card">
          <div className="section-kicker">Долоо хоногоор нэмэгдсэн (сүүлийн 26 долоо хоног)</div>
          <div className="chart-scroll">
            <div style={{ display: "flex", alignItems: "end", gap: 4, height: 120, paddingTop: 10 }}>
              {weekly.weeks.map((w, i) => (
                <div key={i} style={{ flex: 1, display: "grid", gap: 4, justifyItems: "center" }}>
                  <div
                    style={{
                      width: "100%",
                      height: `${Math.round((w.count / weekly.max) * 90)}px`,
                      minHeight: w.count ? 4 : 1,
                      background: "var(--green)",
                      borderRadius: 2,
                    }}
                    title={`${w.label}: ${w.count}`}
                  />
                  {i % 4 === 0 && <span className="tiny" style={{ fontSize: 8 }}>{w.label}</span>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="insights-row">
        <div className="insights-card">
          <div className="section-kicker">Эх сурвалж</div>
          <div className="donut-wrap">
            <svg width={120} height={120} viewBox="0 0 42 42" role="img">
              {(() => {
                let offset = 0;
                const colors = ["var(--green)", "var(--orange)", "#6da77c", "#a8cba9", "#d7e8d8", "#c98241"];
                return sourceData.arr.map(([src, count], idx) => {
                  const percent = (count / sourceData.total) * 100;
                  const dash = `${percent} ${100 - percent}`;
                  const el = (
                    <circle
                      key={src}
                      r="15.915"
                      cx="21"
                      cy="21"
                      fill="transparent"
                      stroke={colors[idx % colors.length]}
                      strokeWidth="4"
                      strokeDasharray={dash}
                      strokeDashoffset={25 - offset}
                    />
                  );
                  offset += percent;
                  return el;
                });
              })()}
            </svg>
            <div className="donut-legend">
              {sourceData.arr.map(([src, count], idx) => (
                <div key={src} className="donut-legend-row">
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                    <i style={{ width: 8, height: 8, borderRadius: 2, background: ["var(--green)", "var(--orange)", "#6da77c", "#a8cba9", "#d7e8d8", "#c98241"][idx % 6] }} />
                    {src}
                  </span>
                  <span>{count}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ marginTop: 16 }}>
            <div className="section-kicker">Үе шат</div>
            <div className="hbar">
              {stageData.arr.map(([stage, count]) => (
                <div key={stage} className="hbar-row">
                  <span className="hbar-label">{stage}</span>
                  <span className="hbar-track">
                    <i style={{ width: `${(count / stageData.max) * 100}%` }} />
                  </span>
                  <span className="hbar-value">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="insights-card">
          <div className="section-kicker">Шилдэг шошго (top 12)</div>
          <div className="hbar">
            {topTags.arr.map(([tag, count]) => (
              <div key={tag} className="hbar-row">
                <span className="hbar-label">#{tag}</span>
                <span className="hbar-track">
                  <i style={{ width: `${(count / topTags.max) * 100}%` }} />
                </span>
                <span className="hbar-value">{count}</span>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 18 }}>
            <div className="section-kicker">Бичих хэмнэл — гарагийн өдрөөр</div>
            <div className="hbar">
              {weekdayData.counts.map((count, idx) => (
                <div key={idx} className="hbar-row">
                  <span className="hbar-label">{weekdayLabels[idx]}</span>
                  <span className="hbar-track">
                    <i style={{ width: `${(count / weekdayData.max) * 100}%` }} />
                  </span>
                  <span className="hbar-value">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="insights-row">
        <div className="insights-card">
          <div className="section-kicker">Давхардсан магадлалтай тэмдэглэлүүд</div>
          {duplicates.length ? (
            <div className="dup-list">
              {duplicates.map((pair, idx) => (
                <div key={idx} className="dup-row">
                  <div>
                    <strong>{pair.a.title}</strong> ↔ <strong>{pair.b.title}</strong>
                    <div className="insights-sub">Jaccard {pair.score.toFixed(2)}</div>
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button className="text-button" onClick={() => onOpenReport?.(pair.a.id)}>{pair.a.id}</button>
                    <button className="text-button" onClick={() => onOpenReport?.(pair.b.id)}>{pair.b.id}</button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="tiny">Давхардсан гарчиг олдсонгүй.</p>
          )}
        </div>

        <div className="insights-card">
          <div className="section-kicker">Сүүлд нэмэгдсэн</div>
          <div className="recent-list">
            {recent.map(r => (
              <button key={r.id} className="recent-row" onClick={() => onOpenReport?.(r.id)}>
                <span className="recent-title">{r.title}</span>
                <span className="insights-sub">{r.source} · {r.date}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
