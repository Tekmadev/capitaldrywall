import type { CSSProperties } from "react";
import { Button } from "@/components/ui/Button";
import { DimensionLine } from "@/components/ui/DimensionLine";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { basementHero, timeline } from "@/content/copy/basement";
import { cn } from "@/lib/utils";
import { GanttReveal } from "./GanttReveal";

/** Dimension under the week columns, stating the answer's "four to six weeks of work once the permit is issued". */
const RUN_LABEL = "4–6 WK after permit";

/**
 * Chart columns from 1024 px: the work, then one column per rail step ("Before we start", "Week 1" … "Week 6").
 * Heads, gridlines, rows and the run are separate grids on one template, so every track is sized from the
 * width alone (never from content). The 17.5 rem floor keeps the longest step ("Framing, insulation,
 * rough-ins") on one line at 1024 px instead of breaking it at the hyphen.
 */
const COLS = "lg:grid-cols-[minmax(17.5rem,2.6fr)_repeat(var(--steps),minmax(0,1fr))]";

type Kind = "lead" | "work" | "finish";

/** Lead time is hatched (it varies), site weeks are solid, the final walkthrough is lit amber. */
const fill: Record<Kind, string> = {
  lead: "border border-[color:var(--ink)]/50 text-[color:var(--ink)]/55 [background-image:repeating-linear-gradient(-45deg,currentColor_0_1px,transparent_1px_5px)]",
  work: "bg-[color:var(--ink)]/80",
  finish: "bg-worklight",
};

type BasementTimelineProps = {
  index?: string;
  sheet?: string;
  id?: string;
  className?: string;
};

/**
 * Basement timeline (brief §9.7, ART_DIRECTION "mini Gantt chart, weeks as columns"). One server-rendered
 * <ol>: every row carries its step ("Week 3: Taping, mudding, sanding"), and the chart is drawn
 * around it. From 1024 px: column heads, week gridlines and one bar per row stepping down the weeks.
 * Phones: each row gets a seven-cell strip with its step filled, so the staircase still reads.
 */
export function BasementTimeline({ index = "07", sheet = "B-07", id = "timeline", className }: BasementTimelineProps) {
  const titleId = `${id}-title`;
  const steps = timeline.rail;
  const last = steps.length - 1;
  const kindOf = (i: number): Kind => (i === 0 ? "lead" : i === last ? "finish" : "work");

  return (
    <section
      id={id}
      aria-labelledby={titleId}
      className={cn("surface-dark section-y relative isolate overflow-hidden", className)}
    >
      <span aria-hidden="true" className="rake-line absolute inset-x-0 top-0" />
      <div className="site-container">
        <SectionHeader
          index={index}
          eyebrow="Timeline"
          sheet={sheet}
          id={titleId}
          title={timeline.title}
          intro={<p>{timeline.answer}</p>}
        />

        <GanttReveal className="mt-14 md:mt-20" style={{ "--steps": steps.length } as CSSProperties}>
          <div className="relative">
            {/* Week gridlines through heads and rows */}
            <div aria-hidden="true" className={cn("pointer-events-none absolute inset-0 hidden lg:grid", COLS)}>
              <span />
              {steps.map((step) => (
                <span key={step.when} className="border-l border-[color:var(--hairline)]" />
              ))}
            </div>

            {/* Column heads (visual; each row names its own step for assistive tech) */}
            <div aria-hidden="true" className={cn("relative hidden items-end pb-4 lg:grid", COLS)}>
              <span />
              {steps.map((step) => (
                <span key={step.when} className="t-spec px-3 text-balance">
                  {step.when}
                </span>
              ))}
            </div>

            <ol className="relative border-b border-[color:var(--hairline)]">
              {steps.map((step, i) => {
                const kind = kindOf(i);
                return (
                  <li
                    key={step.when}
                    className={cn(
                      "grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-2 border-t border-[color:var(--hairline)] py-4 lg:gap-0 lg:py-0",
                      COLS,
                    )}
                  >
                    <span className="t-spec col-start-1 row-start-1 lg:sr-only">
                      {step.when}
                      <span className="sr-only">: </span>
                    </span>
                    <span className="col-span-2 row-start-2 text-[color:var(--ink)] lg:col-span-1 lg:col-start-1 lg:row-start-1 lg:py-[1.125rem] lg:pr-8">
                      {step.what}
                    </span>

                    {/* Phone: seven cells, this step filled */}
                    <span aria-hidden="true" className="col-start-2 row-start-1 flex gap-[3px] lg:hidden">
                      {steps.map((cell, j) => (
                        <span
                          key={cell.when}
                          className={cn(
                            "h-2 w-3 border border-[color:var(--ink)]/25",
                            j === i && cn(fill[kind], "border-transparent"),
                            j === i && kind === "lead" && "border-[color:var(--ink)]/50",
                          )}
                        />
                      ))}
                    </span>

                    {/* Desktop: the bar in this step's column */}
                    <span
                      aria-hidden="true"
                      style={{ gridColumnStart: i + 2, gridRowStart: 1, transitionDelay: `${120 + i * 90}ms` }}
                      className={cn(
                        "mx-2 hidden h-3 origin-left transition-transform duration-[800ms] ease-[var(--ease-rake)] group-data-[state=armed]/gantt:scale-x-0 lg:block",
                        fill[kind],
                      )}
                    />
                  </li>
                );
              })}
            </ol>
          </div>

          {/* The run: weeks 1–6 from 1024 px, full width on phones */}
          <div className={cn("hidden pt-6 lg:grid", COLS)}>
            <div style={{ gridColumn: "3 / -1" }} className="px-2">
              <DimensionLine label={RUN_LABEL} />
            </div>
          </div>
          <DimensionLine label={RUN_LABEL} className="mt-6 lg:hidden" />
        </GanttReveal>

        <div className="mt-12 md:mt-16">
          <Button href={basementHero.primaryCta.href} variant="ghost" arrow>
            {basementHero.primaryCta.label}
          </Button>
        </div>
      </div>
    </section>
  );
}
