"use client";

import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from "react";
import { SegmentedControl, type SegmentedOption } from "@/components/ui/SegmentedControl";
import { isInInitialViewport, observeInView, prefersReducedMotion } from "@/lib/inview";
import { cn } from "@/lib/utils";
import { ElevationDrawing, SectionDrawing } from "./FinishWall";

type LevelKey = "0" | "1" | "2" | "3" | "4" | "5";

export type FinishLevelRow = { level: number; what: string; where: string };

type FinishLevelsExplorerProps = {
  levels: readonly FinishLevelRow[];
  /** Column heads from the copy deck: ["Level", "What it is", "Where it's used"] */
  columns: readonly [string, string, string];
  /** Server-selected level (the brief: Level 4) */
  initial?: number;
  /** FIG. number for the drawing */
  fig: number;
  /** Note set at the foot of the readout column (server-rendered) */
  note?: ReactNode;
  /** Server-rendered schedule that follows the plate; it highlights the selected row */
  children?: ReactNode;
  className?: string;
};

/** What each level adds, for the legend under section A–A (trimmed from the level descriptions). */
const OPERATIONS = [
  { from: 0, label: "Board", swatch: "bg-compound" },
  { from: 1, label: "Tape", swatch: "bg-plaster-2" },
  { from: 2, label: "Coat 1", swatch: "bg-plaster" },
  { from: 3, label: "Coat 2", swatch: "bg-plaster" },
  { from: 4, label: "Coat 3, sanded", swatch: "bg-plaster" },
  { from: 5, label: "Skim coat", swatch: "bg-plaster-2" },
] as const;

const BUILD_STEP_MS = 420;

/**
 * Finish-level selector (brief §7.7): a Level 0–5 segmented control drives a drawing of the same
 * wall joint that gets smoother at each level, with that level's description beside it. Level 4 is
 * selected on the server. The first time the plate scrolls into view (motion allowed, viewer hasn't
 * touched it) the joint builds up once from Level 0 to Level 4.
 */
export function FinishLevelsExplorer({
  levels,
  columns,
  initial = 4,
  fig,
  note,
  children,
  className,
}: FinishLevelsExplorerProps) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const [value, setValue] = useState<LevelKey>(String(initial) as LevelKey);
  const [building, setBuilding] = useState(false);
  const plateRef = useRef<HTMLDivElement>(null);
  const touched = useRef(false);

  const level = Number(value);
  const row = levels.find((l) => l.level === level) ?? levels[levels.length - 1];
  const top = levels[levels.length - 1]?.level ?? 5;

  useEffect(() => {
    const plate = plateRef.current;
    if (!plate || prefersReducedMotion() || isInInitialViewport(plate, 0.6)) return;
    const timers: number[] = [];
    const stop = observeInView(
      plate,
      (entry) => {
        if (!entry.isIntersecting) return;
        stop();
        if (touched.current) return;
        setBuilding(true);
        for (let step = 0; step <= initial; step++) {
          timers.push(
            window.setTimeout(() => {
              if (touched.current) return;
              setValue(String(step) as LevelKey);
              if (step === initial) setBuilding(false);
            }, step * BUILD_STEP_MS),
          );
        }
      },
      { rootMargin: "0px 0px -20% 0px", threshold: 0.35 },
    );
    return () => {
      stop();
      timers.forEach(window.clearTimeout);
    };
  }, [initial]);

  const choose = (next: LevelKey) => {
    touched.current = true;
    setBuilding(false);
    setValue(next);
  };

  const options = useMemo<SegmentedOption<LevelKey>[]>(
    () =>
      levels.map((l) => ({
        value: String(l.level) as LevelKey,
        label: (
          <>
            <span className="sr-only">{columns[0]} </span>
            <span className="text-[0.9375rem] tabular-nums md:text-base">{l.level}</span>
          </>
        ),
      })),
    [levels, columns],
  );

  const label = `${columns[0]} ${row.level}: ${row.what}`;

  return (
    <div data-level={value} className={className}>
      <div ref={plateRef} className="dw-plate surface-dark relative overflow-hidden py-10 md:py-14 lg:py-16">
        {/* The work light grazing the plate from the left */}
        <div aria-hidden="true" className="beam-rake pointer-events-none absolute inset-0" />

        <div className="site-grid relative gap-y-10 lg:grid-rows-[auto_1fr] lg:gap-y-12">
          <div className="col-span-full lg:col-span-4 lg:col-start-9 lg:row-start-1 lg:pr-8">
            <SegmentedControl<LevelKey>
              legend="Finish level"
              options={options}
              value={value}
              onValueChange={choose}
              size="sm"
              minSegmentWidth="2.5rem"
            />
          </div>

          <figure className="col-span-full lg:col-span-8 lg:col-start-1 lg:row-span-2 lg:row-start-1">
            <div className="flex items-center gap-4">
              <span className="t-spec">Elevation</span>
              <span aria-hidden="true" className="h-px flex-1 bg-[color:var(--hairline)]" />
              <span aria-hidden="true" className="t-spec tabular-nums">
                {columns[0]} {row.level}
              </span>
            </div>
            <div className="relative mt-4" role="img" aria-label={`Wall joint under raking light. ${label}.`}>
              <ElevationDrawing level={level} uid={`${uid}e`} className="block h-auto w-full" />
              {/* Paper and compound grain */}
              <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="texture-plaster size-full" />
              </div>
              {/* Section-cut markers on the chain line */}
              {(["left-0 -translate-x-1/2", "right-0 translate-x-1/2"] as const).map((pos) => (
                <span
                  key={pos}
                  aria-hidden="true"
                  className={cn(
                    "absolute top-[73.33%] flex size-7 -translate-y-1/2 items-center justify-center rounded-full border border-steel-light bg-graphite font-mono text-[0.6875rem] font-medium text-plaster md:size-8",
                    pos,
                  )}
                >
                  A
                </span>
              ))}
            </div>

            <div className="mt-8 flex items-center gap-4 md:mt-10">
              <span className="t-spec">Section A–A · NTS</span>
              <span aria-hidden="true" className="h-px flex-1 bg-[color:var(--hairline)]" />
            </div>
            <div className="mt-4 overflow-hidden" role="img" aria-label={`Section through the joint. ${label}.`}>
              <SectionDrawing level={level} uid={`${uid}s`} className="fl-section block h-auto" />
            </div>

            <ul aria-hidden="true" className="mt-5 flex flex-wrap gap-x-5 gap-y-2.5">
              {OPERATIONS.map((op) => {
                const on = level >= op.from;
                return (
                  <li
                    key={op.label}
                    className={cn(
                      "t-spec flex items-center gap-2 transition-opacity duration-300",
                      on ? "text-[color:var(--ink)]" : "opacity-40",
                    )}
                  >
                    <span
                      className={cn(
                        "size-2.5 shrink-0 border border-current/40",
                        on ? op.swatch : "bg-transparent",
                      )}
                    />
                    <span className={cn(!on && "line-through decoration-1")}>{op.label}</span>
                  </li>
                );
              })}
            </ul>

            <figcaption className="t-spec mt-6 flex items-center gap-3">
              <span className="tabular-nums">FIG. {String(fig).padStart(2, "0")}</span>
              <span aria-hidden="true" className="h-px w-6 bg-current/50" />
              <span>Joint finish, {columns[0]} {row.level}</span>
            </figcaption>
          </figure>

          {/* Readout: the selected level's row of the schedule */}
          <div className="col-span-full flex flex-col lg:col-span-4 lg:col-start-9 lg:row-start-2 lg:pr-8">
            <div className="flex items-end gap-3 border-b border-[color:var(--hairline)] pb-5">
              <span className="font-display text-[5.5rem] font-extrabold leading-[0.8] tracking-[-0.03em] text-[color:var(--ink)] tabular-nums [font-stretch:125%] md:text-[7rem]">
                {row.level}
              </span>
              <span className="t-spec pb-1 tabular-nums">
                {columns[0]} {row.level} / {top}
              </span>
            </div>
            <dl aria-live={building ? "off" : "polite"} aria-atomic="true" className="mt-6 grid gap-6">
              <div>
                <dt className="t-spec">{columns[1]}</dt>
                <dd className="mt-2 font-display text-[1.375rem] font-bold leading-tight text-[color:var(--ink)] [font-stretch:112%] md:text-[1.5rem]">
                  {row.what}
                </dd>
              </div>
              <div>
                <dt className="t-spec">{columns[2]}</dt>
                <dd className="mt-2 text-[1.0625rem] leading-snug text-[color:var(--ink)]">{row.where}</dd>
              </div>
            </dl>
            {note && <div className="mt-12 lg:mt-auto lg:pt-12">{note}</div>}
          </div>
        </div>
      </div>

      {children}
    </div>
  );
}
