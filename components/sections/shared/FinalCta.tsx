import type { ReactNode } from "react";
import { RevealHeading } from "@/components/motion/RevealHeading";
import { Button } from "@/components/ui/Button";
import { ctas, finalCta } from "@/content/copy/global";
import { quoteHref, type ServiceId } from "@/content/services";
import { site } from "@/content/site.config";
import { cn } from "@/lib/utils";
import "./FinalCta.css";
import { SheetRef, sheetCode } from "./SheetRef";

export type FinalCtaProps = {
  /** Page headline (home default: "Let's get your walls right."); set on two lines automatically */
  title?: string;
  body?: string;
  /** Pre-selects the quote form service: /free-quote?service=… */
  service?: ServiceId | string;
  /**
   * Compact quote form (service pages). Headline left (5 columns), form right (6 columns), and the
   * mobile action bar hides while this section is on screen.
   */
  form?: ReactNode;
  /** Section number on the page; shows a sheet code ("A-15") in the corner */
  index?: string;
  /** Optional sheet-reference eyebrow (the copy deck has none for this section) */
  eyebrow?: string;
  sheet?: string;
  id?: string;
  /** Freeze the work light (static screenshots). Reduced motion always freezes it. */
  still?: boolean;
  className?: string;
};

/**
 * Approximate width of a headline line in Archivo expanded (780, -0.02em), in em: narrow, wide and
 * other glyph widths fitted to the measured copy-deck headlines (within ±5%), plus 6% to spare.
 */
function lineEm(text: string): number {
  let em = 0;
  for (const ch of text) em += /[\siljtfr'.,:;!]/.test(ch) ? 0.395 : /[mwMW]/.test(ch) ? 1.156 : 0.728;
  return em * 1.06;
}

/** Split a headline into two balanced lines at a word boundary. */
function twoLines(text: string): [string, string] {
  const words = text.trim().split(/\s+/);
  if (words.length < 2) return [text.trim(), ""];
  let best = 1;
  let bestDiff = Number.POSITIVE_INFINITY;
  for (let i = 1; i < words.length; i++) {
    const first = words.slice(0, i).join(" ").length;
    const diff = Math.abs(first - (text.length - first - 1));
    if (diff < bestDiff) {
      bestDiff = diff;
      best = i;
    }
  }
  return [words.slice(0, best).join(" "), words.slice(best).join(" ")];
}

/**
 * Final call to action (ART_DIRECTION row 15): a dark wall raked by one slowly moving work light,
 * the rake-line hairline across the top boundary, a huge two-line Archivo headline, primary + call
 * buttons and the mono response promise.
 */
export function FinalCta({
  title = finalCta.title,
  body = finalCta.body,
  service,
  form,
  index,
  eyebrow,
  sheet,
  id = "get-started",
  still = false,
  className,
}: FinalCtaProps) {
  const headingId = `${id}-title`;
  const [line1, line2] = twoLines(title);
  const code = sheetCode(index, sheet);
  const withForm = Boolean(form);
  /**
   * The two lines must stay two lines: the headline is set no larger than lets its longer line fit
   * its column (100cqi of the @container text column), so a narrow column (five beside the form,
   * or a phone) never breaks a third, one-word line. Elsewhere the display size applies as usual.
   */
  const fit = `calc(100cqi / ${Math.max(lineEm(line1), lineEm(line2)).toFixed(2)})`;
  const headingSize = {
    "--fcta-size": withForm
      ? `clamp(1.5rem, ${fit}, 4.5rem)`
      : `max(1.5rem, min(var(--text-display-l), ${fit}))`,
  } as React.CSSProperties;

  const heading = (
    <RevealHeading
      as="h2"
      id={headingId}
      className="t-display-l text-[color:var(--ink)] [font-size:var(--fcta-size)]!"
    >
      <span className="block">{line1}</span> {line2 && <span className="block">{line2}</span>}
    </RevealHeading>
  );

  const reply = (
    <p className="t-spec mt-8 flex items-center gap-3">
      <span aria-hidden="true" className="size-1.5 shrink-0 bg-worklight" />
      {`We reply ${site.responsePromise}.`}
    </p>
  );

  const call = (
    <Button
      href={`tel:${site.phone.e164}`}
      variant="call"
      size="lg"
      trackLocation="final-cta"
      className="w-full sm:w-auto"
    >
      {ctas.call}
    </Button>
  );

  return (
    <section
      id={id}
      aria-labelledby={headingId}
      data-hide-action-bar={withForm ? "" : undefined}
      className={cn("surface-dark relative isolate overflow-hidden", still && "fcta-still", className)}
    >
      <div aria-hidden="true" className="fcta-wall">
        <div className="fcta-beam" />
        <div className="fcta-grain" />
      </div>
      <span aria-hidden="true" className={"rake-line fcta-rake absolute inset-x-0 top-0"} />

      <div className="site-container section-y relative">
        {eyebrow ? (
          <SheetRef index={index} eyebrow={eyebrow} sheet={code} className="mb-12 md:mb-16" />
        ) : (
          code && (
            <p aria-hidden="true" className="t-spec mb-10 text-right tabular-nums md:mb-14">
              {code}
            </p>
          )
        )}

        {withForm ? (
          <div className="site-grid gap-y-12">
            <div className="@container col-span-full lg:col-span-5" style={headingSize}>
              {heading}
              <p className="t-lede mt-8 max-w-[36ch] text-muted">{body}</p>
              <div className="mt-10">{call}</div>
              {reply}
            </div>
            <div className="col-span-full lg:col-span-6 lg:col-start-7">{form}</div>
          </div>
        ) : (
          <div className="site-grid gap-y-10 md:gap-y-12">
            <div className="@container col-span-full lg:col-span-11" style={headingSize}>
              {heading}
            </div>
            <div className="col-span-full md:col-span-8 md:col-start-2 lg:col-span-6 lg:col-start-2">
              <p className="t-lede max-w-[40ch] text-muted">{body}</p>
              <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-4">
                <Button href={quoteHref(service)} size="lg" arrow className="w-full sm:w-auto">
                  {ctas.primary}
                </Button>
                {call}
              </div>
              {reply}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
