import { DetailBubble } from "@/components/ui/drafting";
import { cn, pad2 } from "@/lib/utils";

/** "A-01": the sheet each service section is drawn on (the hero strip cross-references it). */
export function sheetFor(n: number): string {
  return `A-${pad2(n)}`;
}

/** Copy-deck CTAs end in "→"; the Button draws its own dimension arrow. */
export function ctaLabel(label: string): string {
  return label.replace(/\s*→\s*$/u, "");
}

/**
 * Drawing title, the way a detail is titled on a sheet: the headline sits on one heavy rule and a
 * detail bubble (number over sheet code) caps the left end of that rule.
 */
export function DrawingTitle({
  id,
  number,
  title,
  className,
}: {
  id: string;
  number: number;
  title: string;
  className?: string;
}) {
  return (
    <div className={cn("relative", className)}>
      <h2 id={id} className="t-h2 pb-11 text-[color:var(--ink)] md:pb-5 md:pl-[4.75rem]">
        {title}
      </h2>
      <div aria-hidden="true" className="flex items-center">
        <DetailBubble top={pad2(number)} bottom={sheetFor(number)} size={56} className="-my-7" />
        <span className="h-0.5 flex-1 bg-[color:var(--ink)]" />
      </div>
    </div>
  );
}

/**
 * Scope schedule: the copy-deck bullets set like a schedule on a drawing (mono rows on hairlines,
 * spec-section numbers), not a ticked list.
 */
export function ScopeSchedule({
  id,
  number,
  items,
  className,
}: {
  id: string;
  number: number;
  items: readonly string[];
  className?: string;
}) {
  const labelId = `${id}-scope`;
  return (
    <div className={className}>
      <p
        id={labelId}
        className="t-spec flex items-center justify-between gap-6 border-b border-[color:var(--ink)]/70 pb-3"
      >
        <span>Scope</span>
        <span className="tabular-nums">{pad2(items.length)} items</span>
      </p>
      <ul aria-labelledby={labelId}>
        {items.map((item, i) => (
          <li
            key={item}
            className="flex items-baseline gap-5 border-b border-[color:var(--hairline)] py-3.5 md:gap-7"
          >
            <span className="t-spec w-9 shrink-0 tabular-nums">
              {number}.{pad2(i + 1)}
            </span>
            <span className="font-mono text-[0.9375rem] leading-snug tracking-[0.01em] text-[color:var(--ink)]">
              {item}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
