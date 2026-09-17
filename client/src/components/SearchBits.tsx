/**
 * Search 2.0 UI atoms: highlighted snippet text and removable filter chips.
 * Pure presentational pieces — ranking lives in `@shared/search`.
 */
import type { ReactElement } from "react";
import { X } from "lucide-react";
import type { HighlightRange, SearchFilters } from "@shared/search";

export function SnippetText({ text, ranges }: { text: string; ranges: HighlightRange[] }) {
  if (!ranges.length) return <>{text}</>;
  const parts: ReactElement[] = [];
  let cursor = 0;
  ranges.forEach((r, i) => {
    const start = Math.max(0, Math.min(r.start, text.length));
    const end = Math.max(start, Math.min(r.end, text.length));
    if (start > cursor) parts.push(<span key={`t${i}`}>{text.slice(cursor, start)}</span>);
    if (end > start) parts.push(<mark key={`m${i}`}>{text.slice(start, end)}</mark>);
    cursor = end;
  });
  if (cursor < text.length) parts.push(<span key="tail">{text.slice(cursor)}</span>);
  return <>{parts}</>;
}

export type FilterChip = { field: keyof SearchFilters; value: string; label: string };

export function filterChips(filters: SearchFilters): FilterChip[] {
  const chips: FilterChip[] = [];
  for (const v of filters.tags) chips.push({ field: "tags", value: v, label: `tag:${v}` });
  for (const v of filters.stages) chips.push({ field: "stages", value: v, label: `stage:${v}` });
  for (const v of filters.statuses) chips.push({ field: "statuses", value: v, label: `status:${v}` });
  for (const v of filters.sources) chips.push({ field: "sources", value: v, label: `source:${v}` });
  for (const v of filters.dates) chips.push({ field: "dates", value: v, label: `date:${v}` });
  return chips;
}

export function FilterChips({
  filters,
  onRemove,
}: {
  filters: SearchFilters;
  onRemove: (chip: FilterChip) => void;
}) {
  const chips = filterChips(filters);
  if (!chips.length) return null;
  return (
    <div className="search-filter-chips">
      {chips.map((chip, i) => (
        <button
          key={`${chip.field}:${chip.value}:${i}`}
          className="search-filter-chip"
          onClick={() => onRemove(chip)}
          title="Шүүлтүүрийг хасах"
        >
          {chip.label}
          <X size={11} />
        </button>
      ))}
    </div>
  );
}
