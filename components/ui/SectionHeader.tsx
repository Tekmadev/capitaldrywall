import type { ReactNode } from "react";
import { RevealHeading } from "@/components/motion/RevealHeading";
import { cn } from "@/lib/utils";
import { DimensionLine } from "./DimensionLine";

type SectionHeaderProps = {
  /** Section number on the page, e.g. "04" */
  index?: string;
  /** Eyebrow text from the copy deck, e.g. "How we work" */
  eyebrow: string;
  /** Drawing-sheet code shown at the right end of the reference line, e.g. "A-04" */
  sheet?: string;
  title: ReactNode;
  as?: "h1" | "h2" | "h3";
  /** id for the heading (use with aria-labelledby on the <section>) */
  id?: string;
  intro?: ReactNode;
  /** A dimension line under the title stating a real fact, e.g. "2 SERVICES · DONE PROPERLY" */
  annotation?: string;
  /** stacked: title then intro; split: title left (7 cols), intro right (4 cols), bottom-aligned */
  layout?: "stacked" | "split";
  titleSize?: "h2" | "display-l";
  /** Animate the headline in (default true; never animates when it starts in view) */
  reveal?: boolean;
  className?: string;
};

/**
 * Section header in the drawing-set language: a sheet reference line
 * (`04 / HOW WE WORK ───────── A-04`), an offset Archivo headline and optional intro.
 */
export function SectionHeader({
  index,
  eyebrow,
  sheet,
  title,
  as = "h2",
  id,
  intro,
  annotation,
  layout = "stacked",
  titleSize = "h2",
  reveal = true,
  className,
}: SectionHeaderProps) {
  const titleClass = cn(
    titleSize === "display-l" ? "t-display-l" : "t-h2",
    "text-[color:var(--ink)]",
    layout === "split" ? "col-span-full md:col-span-7" : "col-span-full md:col-span-10 lg:col-span-8",
  );

  return (
    <header className={cn("site-grid gap-y-6 md:gap-y-8", className)}>
      {/* The eyebrow may wrap on a narrow screen (no forced horizontal scroll at 320 px); the run and
          the sheet code stay on its first line (baseline, run lifted to the caps' middle). */}
      <div className="col-span-full flex items-baseline gap-4">
        <span className="t-spec min-w-0">
          {index && <span className="whitespace-nowrap tabular-nums">{index} / </span>}
          {eyebrow}
        </span>
        <span aria-hidden="true" className="relative h-px min-w-6 flex-1 -translate-y-1 bg-[color:var(--hairline)]">
          <span className="absolute right-0 top-1/2 h-2.5 w-px -translate-y-1/2 bg-[color:var(--hairline)]" />
        </span>
        {sheet && (
          <span className="t-spec whitespace-nowrap tabular-nums" aria-hidden="true">
            {sheet}
          </span>
        )}
      </div>

      {reveal ? (
        <RevealHeading as={as} id={id} className={titleClass}>
          {title}
        </RevealHeading>
      ) : (
        (() => {
          const Tag = as;
          return (
            <Tag id={id} className={titleClass}>
              {title}
            </Tag>
          );
        })()
      )}

      {annotation && (
        <div className="col-span-full md:col-span-6 lg:col-span-5">
          <DimensionLine label={annotation} align="end" />
        </div>
      )}

      {intro && (
        <div
          className={cn(
            "t-lede text-muted",
            layout === "split"
              ? "col-span-full self-end md:col-span-4 md:col-start-9"
              : "col-span-full md:col-span-7 lg:col-span-6 lg:col-start-2",
          )}
        >
          {intro}
        </div>
      )}
    </header>
  );
}
