import { DetailBubble } from "@/components/ui/drafting";
import { cn, pad2 } from "@/lib/utils";

type NextStepsProps = {
  /** The three "What happens next" steps (content/copy/global.ts `nextSteps`) */
  steps: readonly string[];
  /** Sheet code under each step number (detail-bubble convention: detail number over sheet) */
  sheet?: string;
  /**
   * rail: detail bubbles strung on one vertical leader (the /free-quote title block).
   * schedule: one ruled row of joined cells sharing hairlines (/thank-you). From md the cells are
   * three grid columns with gutter gaps, so when the list spans a multiple of three site-grid
   * columns every divider lands exactly on a column line of the vellum grid behind it.
   */
  layout?: "rail" | "schedule";
  className?: string;
};

/**
 * "What happens next" as detail callouts. Real list semantics (<ol>); the bubbles are decorative.
 */
export function NextSteps({ steps, sheet, layout = "rail", className }: NextStepsProps) {
  if (layout === "schedule") {
    return (
      <ol
        className={cn(
          // The band is opaque so the vellum lines stop at its rules; only the dividers continue them
          "grid border-y border-[color:var(--hairline)] bg-[color:var(--surface)] md:grid-cols-3 md:gap-x-[var(--gutter)]",
          className,
        )}
      >
        {steps.map((step, i) => (
          <li
            key={step}
            className={cn(
              "flex items-center gap-5 py-6 md:flex-col md:items-start md:gap-10 md:py-9",
              "border-[color:var(--hairline)] not-last:border-b md:not-last:border-b-0 md:not-first:border-l md:not-first:pl-[var(--gutter)]",
            )}
          >
            <span className="block shrink-0 rounded-full bg-[color:var(--surface)]">
              <DetailBubble top={pad2(i + 1)} bottom={sheet} size={56} />
            </span>
            {/* 20ch keeps the last step off the band's open end, matching the gutter the others get */}
            <span className="max-w-[20ch] font-display text-[1.1875rem] font-semibold leading-[1.2] tracking-[-0.005em] text-[color:var(--ink)] [font-stretch:108%] md:text-[1.3125rem]">
              {step}
            </span>
          </li>
        ))}
      </ol>
    );
  }

  return (
    <ol
      className={cn(
        "relative flex flex-col gap-4",
        // The leader runs through the bubble centres, like a callout string on a drawing (a pseudo-
        // element, since an <ol> may only contain <li>s)
        "before:absolute before:bottom-[22px] before:left-[22px] before:top-[22px] before:w-px before:bg-[color:var(--hairline)]",
        className,
      )}
    >
      {steps.map((step, i) => (
        <li key={step} className="relative grid grid-cols-[44px_minmax(0,1fr)] items-center gap-4">
          <span className="relative block size-11 rounded-full bg-[color:var(--surface)]">
            <DetailBubble top={pad2(i + 1)} bottom={sheet} size={44} />
          </span>
          <span className="text-[0.9375rem] leading-snug text-[color:var(--ink)]">{step}</span>
        </li>
      ))}
    </ol>
  );
}

/** "What happens next:" → "What happens next" when it is set as a heading. */
export function asHeading(label: string): string {
  return label.replace(/:\s*$/, "");
}
