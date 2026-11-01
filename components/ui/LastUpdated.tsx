import { site } from "@/content/site.config";
import { cn } from "@/lib/utils";

/** "2026-10-30" → "30 October 2026" (en-CA month names; no clock reads, safe in prerendered server code). */
export function formatLongDate(isoDate: string): string {
  const [y, m, d] = isoDate.split("-").map(Number);
  if (!y || !m || !d) return isoDate;
  const parts = new Intl.DateTimeFormat("en-CA", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).formatToParts(Date.UTC(y, m - 1, d));
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((p) => p.type === type)?.value ?? "";
  return `${part("day")} ${part("month")} ${part("year")}`;
}

type LastUpdatedProps = {
  /** ISO date (YYYY-MM-DD); defaults to site.lastUpdated, which also feeds dateModified */
  date?: string;
  label?: string;
  className?: string;
};

/** Visible "Last updated" line for service pages (brief §11), mirrored as dateModified in schema. */
export function LastUpdated({ date = site.lastUpdated, label = "Last updated", className }: LastUpdatedProps) {
  return (
    <p className={cn("t-spec flex flex-wrap items-center gap-x-2.5 gap-y-1", className)}>
      <span aria-hidden="true" className="flex items-center">
        <span className="block h-2.5 w-px bg-[color:var(--spec)]/70" />
        <span className="block h-px w-4 bg-[color:var(--spec)]/50" />
      </span>
      <span>{label}</span>
      <time dateTime={date} className="tabular-nums text-[color:var(--ink)]">
        {formatLongDate(date)}
      </time>
    </p>
  );
}
