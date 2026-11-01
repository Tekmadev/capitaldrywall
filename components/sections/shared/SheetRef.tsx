import { cn } from "@/lib/utils";

type SheetRefProps = {
  /** Section number on the page, e.g. "06" */
  index?: string;
  eyebrow: string;
  /** Right-aligned drawing-sheet code, e.g. "A-06" */
  sheet?: string;
  className?: string;
};

/**
 * Sheet-reference line (`06 / THE PROCESS ──────┤ A-06`): the same device SectionHeader draws, for
 * sections whose headline sits in a narrow column (FAQ, owner note, service area). The eyebrow may
 * wrap on narrow screens so the line never forces a horizontal scroll at 320 px.
 */
export function SheetRef({ index, eyebrow, sheet, className }: SheetRefProps) {
  return (
    <div className={cn("flex items-baseline gap-4", className)}>
      <span className="t-spec min-w-0">
        {index && <span className="whitespace-nowrap tabular-nums">{index} / </span>}
        {eyebrow}
      </span>
      {/* On the eyebrow's first line when it wraps (same alignment as SectionHeader) */}
      <span aria-hidden="true" className="relative h-px min-w-6 flex-1 -translate-y-1 bg-[color:var(--hairline)]">
        <span className="absolute right-0 top-1/2 h-2.5 w-px -translate-y-1/2 bg-[color:var(--hairline)]" />
      </span>
      {sheet && (
        <span aria-hidden="true" className="t-spec whitespace-nowrap tabular-nums">
          {sheet}
        </span>
      )}
    </div>
  );
}

/** Sheet code for a section: explicit `sheet`, else "A-" + index ("06" → "A-06"). */
export function sheetCode(index?: string, sheet?: string): string | undefined {
  return sheet ?? (index ? `A-${index}` : undefined);
}
