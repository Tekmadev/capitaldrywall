"use client";

import { useEffect, useId, useRef, useState, type ChangeEvent, type CSSProperties, type ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { RegistrationMarks } from "@/components/ui/drafting";
import { TickIcon } from "@/components/ui/icons";
import { addOnOptions, estimatorCopy, finishLevelOptions } from "@/content/copy/estimator";
import {
  addOnIds,
  estimateRange,
  estimator,
  finishLevelIds,
  type AddOn,
  type FinishLevel,
  type Range,
} from "@/content/pricing";
import { track } from "@/lib/analytics";
import { observeInView } from "@/lib/inview";
import { cn, formatCAD } from "@/lib/utils";
import "./Estimator.css";
import { EstimatorOdometer } from "./EstimatorOdometer";
import {
  clampEstimatorSize,
  estimatorDefaults,
  estimatorQuoteHref,
  estimatorSizeBucket,
  formatSqFt,
  orderAddOns,
} from "./EstimatorParams";

const { min: SIZE_MIN, max: SIZE_MAX, step: SIZE_STEP } = estimator.size;
const SIZE_SPAN = SIZE_MAX - SIZE_MIN;

/** Graphic cost scale under the result: $0 → the most any configuration reaches, in $50K bays. */
const SCALE_BAY = 50_000;
const SCALE_MAX =
  Math.ceil(Math.max(...finishLevelIds.map((id) => estimateRange(SIZE_MAX, id, addOnIds).high)) / SCALE_BAY) *
  SCALE_BAY;

/** Tape ticks every 50 sq ft; numbers every 300 on phones, every 200 from tablet up. */
const tapeTicks = Array.from({ length: SIZE_SPAN / SIZE_STEP + 1 }, (_, i) => {
  const value = SIZE_MIN + i * SIZE_STEP;
  return {
    value,
    major: value % 100 === 0,
    labelSm: (value - SIZE_MIN) % 300 === 0,
    labelMd: (value - SIZE_MIN) % 200 === 0,
  };
});

/** px from the viewport top (sticky header + gap) below which the inputs count as "scrolled under" */
const READOUT_ZONE = 140;

const hairlineStrong = "border-[color:color-mix(in_srgb,var(--ink)_22%,transparent)]";
const displayNum = { fontStretch: "112%", letterSpacing: "-0.02em" } satisfies CSSProperties;

const rangeCompact = ({ low, high }: Range) => `${formatCAD(low)}–${formatCAD(high)}`;

export type EstimatorProps = {
  /** Starting size in sq ft (snapped to 300–1,500, step 50). Default 800. */
  initialSize?: number;
  /** Starting finish level. Default "comfort". */
  initialLevel?: FinishLevel;
  initialAddOns?: AddOn[];
  /** Every transition off (screenshots); reduced motion gets this automatically via CSS. */
  forceStatic?: boolean;
  /** Dev/demo: pin the floating running total visible (normally shown only while the result is off-screen). */
  showReadout?: boolean;
  className?: string;
};

/**
 * Basement budget estimator (brief §7.5), set as an estimate sheet: a measuring-tape size slider,
 * finish levels and add-ons as schedule rows, and a live range with an odometer roll, a graphic
 * cost scale and the CTA into the quote form. The default (800 sq ft, Comfort) is server-rendered.
 */
export function Estimator({
  initialSize = estimatorDefaults.size,
  initialLevel = estimatorDefaults.level,
  initialAddOns,
  forceStatic = false,
  showReadout = false,
  className,
}: EstimatorProps) {
  const uid = useId();
  const sizeId = `${uid}-size`;
  const finishLabelId = `${uid}-finish`;
  const addOnsLabelId = `${uid}-addons`;

  const [size, setSize] = useState(() => clampEstimatorSize(initialSize));
  const [level, setLevel] = useState<FinishLevel>(initialLevel);
  const [addOns, setAddOns] = useState<AddOn[]>(() => orderAddOns(initialAddOns ?? []));

  const range = estimateRange(size, level, addOns);
  const href = estimatorQuoteHref({ size, level, addOns });
  const progress = (size - SIZE_MIN) / SIZE_SPAN;

  /* Screen readers: the slider announces its own value; the range is announced once input settles. */
  const liveNow = `${estimatorCopy.resultLabel}: ${formatCAD(range.low)} ${estimatorCopy.sr.rangeJoin} ${formatCAD(range.high)}`;
  const [liveText, setLiveText] = useState(liveNow);
  useEffect(() => {
    const timer = window.setTimeout(() => setLiveText(liveNow), 700);
    return () => window.clearTimeout(timer);
  }, [liveNow]);

  /* estimator_used: once, on the first change (level + size bucket only, never exact inputs) */
  const used = useRef(false);
  const markUsed = (next: { size: number; level: FinishLevel }) => {
    if (used.current) return;
    used.current = true;
    track("estimator_used", { level: next.level, size_bucket: estimatorSizeBucket(next.size) });
  };

  const onSize = (event: ChangeEvent<HTMLInputElement>) => {
    const next = clampEstimatorSize(Number(event.currentTarget.value));
    setSize(next);
    markUsed({ size: next, level });
  };
  const onLevel = (next: FinishLevel) => {
    setLevel(next);
    markUsed({ size, level: next });
  };
  const onAddOn = (id: AddOn, checked: boolean) => {
    setAddOns((prev) => orderAddOns(checked ? [...prev, id] : prev.filter((a) => a !== id)));
    markUsed({ size, level });
  };
  const onQuote = () =>
    track("estimator_to_quote", { level, size_bucket: estimatorSizeBucket(size), addons: addOns.length });

  /*
   * Floating running total: shown while the inputs are scrolled under the header and the result is
   * still below ~70% of the viewport. Observers only signal crossings; state is read from live rects,
   * so jumps (anchor links, find-in-page) land in the right state too.
   */
  const inputsRef = useRef<HTMLDivElement>(null);
  const inputsTopRef = useRef<HTMLSpanElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const [readoutShown, setReadoutShown] = useState(false);
  useEffect(() => {
    const inputs = inputsRef.current;
    const top = inputsTopRef.current;
    const result = resultRef.current;
    if (!inputs || !top || !result) return;
    const sync = () => {
      const zone = READOUT_ZONE;
      const inputsBox = inputs.getBoundingClientRect();
      const resultTop = result.getBoundingClientRect().top;
      setReadoutShown(inputsBox.top < zone && inputsBox.bottom > zone && resultTop > window.innerHeight * 0.7);
    };
    const stops = [
      observeInView(top, sync, { rootMargin: `-${READOUT_ZONE}px 0px 0px 0px`, threshold: 0 }),
      observeInView(inputs, sync, { rootMargin: "0px", threshold: 0 }),
      observeInView(result, sync, { rootMargin: "0px 0px -30% 0px", threshold: 0 }),
    ];
    return () => stops.forEach((stop) => stop());
  }, []);

  const levelLabel = estimator.finishLevels[level].label;
  const summary = [
    `${formatSqFt(size)} ${estimatorCopy.unit}`,
    levelLabel,
    ...addOns.map((id) => `+ ${estimator.addOns[id].label}`),
  ].join(" · ");

  const rangeFigures = (
    <>
      <span className="whitespace-nowrap">
        <EstimatorOdometer value={formatCAD(range.low)} />
        <span className="ml-[0.28em]">–</span>
      </span>{" "}
      <EstimatorOdometer value={formatCAD(range.high)} />
    </>
  );

  return (
    <div className={cn("est-root", forceStatic && "est-static", "relative", className)}>
      <div className={cn("relative border bg-[color:var(--surface)]", hairlineStrong)}>
        <RegistrationMarks />

        {/* ── Inputs ── */}
        <div ref={inputsRef} className="relative">
          <span ref={inputsTopRef} aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-px" />

          {/* Floating running total (duplicate of the result, hidden from assistive tech) */}
          <div className="pointer-events-none sticky top-[calc(var(--header-h)+0.75rem)] z-20 h-0">
            <div
              aria-hidden="true"
              data-shown={readoutShown || showReadout}
              className={cn(
                "est-readout",
                "absolute inset-x-3 top-0 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border bg-[color:var(--surface-raised)] px-4 py-3 md:inset-x-6",
                "shadow-[0_14px_30px_-18px_color-mix(in_srgb,var(--color-graphite)_55%,transparent)]",
                hairlineStrong,
              )}
            >
              <span className="t-spec">{estimatorCopy.resultLabel}</span>
              <span className="font-display text-[1.125rem] font-bold text-[color:var(--ink)]" style={displayNum}>
                {rangeFigures}
              </span>
            </div>
          </div>

          {/* 01 · Size */}
          <div className="px-5 pb-7 pt-6 md:px-8 md:pb-9 md:pt-8 lg:px-10">
            <FieldHead
              index="01"
              aside={
                <p aria-hidden="true" className="flex items-baseline gap-2 text-[color:var(--ink)]">
                  <EstimatorOdometer
                    fast
                    value={formatSqFt(size)}
                    className="font-display text-[2.25rem] font-[760] md:text-[2.75rem]"
                  />
                  <span className="t-spec text-[color:var(--ink)]">{estimatorCopy.unit}</span>
                </p>
              }
            >
              <label htmlFor={sizeId} className="t-spec text-[color:var(--ink)]">
                {estimatorCopy.labels.size}
              </label>
            </FieldHead>

            <div className={cn("est-tape", "mt-5")} style={{ "--p": progress } as CSSProperties}>
              <div aria-hidden="true" className="est-blade">
                <span className="est-extent-shade" />
                <span className="est-extent" />
                {/* the tape hook at the zero end */}
                <span className="absolute -inset-y-px left-0 w-[3px] bg-[color:var(--ink)]" />
                <div className="est-scale">
                  {tapeTicks.map((tick) => (
                    <span
                      key={tick.value}
                      className="absolute inset-y-0"
                      style={{ left: `${((tick.value - SIZE_MIN) / SIZE_SPAN) * 100}%` }}
                    >
                      <span
                        className={cn(
                          "absolute left-0 top-0 w-px -translate-x-1/2 bg-[color:var(--ink)]",
                          tick.major ? "h-3.5 opacity-75" : "h-2 opacity-45",
                        )}
                      />
                      {(tick.labelSm || tick.labelMd) && (
                        <span
                          className={cn(
                            "t-spec absolute top-[1.15rem] text-[0.625rem]! tabular-nums leading-none",
                            // the end numbers sit inside the blade: 300 reads right of its tick, 1,500 left of its tick
                            tick.value === SIZE_MIN
                              ? "translate-x-1"
                              : tick.value === SIZE_MAX
                                ? "-translate-x-[calc(100%_+_0.25rem)]"
                                : "-translate-x-1/2",
                            !tick.labelSm && "hidden md:block",
                            !tick.labelMd && "md:hidden",
                          )}
                        >
                          {formatSqFt(tick.value)}
                        </span>
                      )}
                    </span>
                  ))}
                </div>
              </div>
              <input
                id={sizeId}
                name="size"
                type="range"
                min={SIZE_MIN}
                max={SIZE_MAX}
                step={SIZE_STEP}
                value={size}
                onChange={onSize}
                aria-valuetext={`${formatSqFt(size)} ${estimatorCopy.sr.unitLong}`}
                className="est-range"
              />
            </div>
          </div>

          {/* 02 · Finish level  |  03 · Add-ons */}
          <div className={cn("grid border-t lg:grid-cols-12", hairlineStrong)}>
            <fieldset
              aria-labelledby={finishLabelId}
              className={cn("min-w-0 px-5 py-7 md:px-8 md:py-9 lg:col-span-7 lg:border-r lg:px-10", hairlineStrong)}
            >
              <FieldHead index="02">
                <span id={finishLabelId} className="t-spec text-[color:var(--ink)]">
                  {estimatorCopy.labels.finish}
                </span>
              </FieldHead>
              <div className="mt-5 border-y border-[color:var(--hairline)]">
                {finishLevelOptions.map((option, i) => (
                  <label
                    key={option.id}
                    className={cn(
                      "est-option",
                      "flex cursor-pointer items-start gap-4 px-3 py-4 transition-colors duration-200 md:px-4 md:py-5",
                      "hover:bg-[color:color-mix(in_srgb,var(--ink)_4%,transparent)] has-[:checked]:bg-[color:var(--surface-raised)]",
                      i > 0 && "border-t border-[color:var(--hairline)]",
                    )}
                  >
                    <input
                      type="radio"
                      name={`${uid}-level`}
                      value={option.id}
                      checked={level === option.id}
                      onChange={() => onLevel(option.id)}
                      className="sr-only"
                    />
                    <span aria-hidden="true" className={cn("est-radio", "mt-0.5")} />
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                        <span
                          className="font-display text-[1.25rem] font-bold leading-tight text-[color:var(--ink)]"
                          style={displayNum}
                        >
                          {option.label}
                        </span>
                        <span className="t-spec tabular-nums">
                          {rangeCompact(estimator.finishLevels[option.id].perSqFt)} / {estimatorCopy.unit}
                        </span>
                      </span>
                      <span className="mt-1.5 block text-[0.9375rem] leading-snug text-muted">
                        {option.description}
                      </span>
                    </span>
                    <Corners />
                  </label>
                ))}
              </div>
            </fieldset>

            <fieldset
              aria-labelledby={addOnsLabelId}
              className={cn("min-w-0 border-t px-5 py-7 md:px-8 md:py-9 lg:col-span-5 lg:border-t-0 lg:px-10", hairlineStrong)}
            >
              <FieldHead index="03">
                <span id={addOnsLabelId} className="t-spec text-[color:var(--ink)]">
                  {estimatorCopy.labels.addOns}
                </span>
              </FieldHead>
              <div className="mt-5 border-y border-[color:var(--hairline)]">
                {addOnOptions.map((option, i) => (
                  <label
                    key={option.id}
                    className={cn(
                      "est-option",
                      "flex min-h-14 cursor-pointer items-center gap-4 px-3 py-3.5 transition-colors duration-200 md:px-4",
                      "hover:bg-[color:color-mix(in_srgb,var(--ink)_4%,transparent)] has-[:checked]:bg-[color:var(--surface-raised)]",
                      i > 0 && "border-t border-[color:var(--hairline)]",
                    )}
                  >
                    <input
                      type="checkbox"
                      name={`${uid}-addons`}
                      value={option.id}
                      checked={addOns.includes(option.id)}
                      onChange={(event) => onAddOn(option.id, event.currentTarget.checked)}
                      className="sr-only"
                    />
                    <span aria-hidden="true" className="est-check">
                      <TickIcon size={14} />
                    </span>
                    <span className="flex min-w-0 flex-1 flex-wrap items-baseline gap-x-3 gap-y-0.5">
                      <span className="text-[color:var(--ink)]">{option.label}</span>
                      {/* leader + cost wrap together, so a long name pushes both to the next line */}
                      <span className="flex min-w-[10.5rem] flex-1 items-baseline gap-3">
                        <span
                          aria-hidden="true"
                          className="hidden min-w-4 flex-1 -translate-y-[0.3em] border-b border-dotted border-[color:color-mix(in_srgb,var(--ink)_40%,transparent)] sm:block"
                        />
                        <span className="t-spec whitespace-nowrap tabular-nums">
                          + {rangeCompact(estimator.addOns[option.id].cost)}
                        </span>
                      </span>
                    </span>
                    <Corners />
                  </label>
                ))}
              </div>
            </fieldset>
          </div>
        </div>

        {/* ── Result ── */}
        <div
          ref={resultRef}
          className={cn("border-t bg-[color:var(--surface-raised)] px-5 py-8 md:px-8 md:py-10 lg:px-10", hairlineStrong)}
        >
          <div className="grid gap-x-10 gap-y-8 md:grid-cols-12">
            <div className="min-w-0 md:col-span-7">
              <div aria-hidden="true" className="flex items-center gap-3">
                <span className="t-spec text-[color:var(--ink)]">{estimatorCopy.resultLabel}</span>
                <span className="relative h-px flex-1 bg-[color:var(--hairline)]">
                  <span className="absolute right-0 top-1/2 h-2.5 w-px -translate-y-1/2 bg-[color:var(--hairline)]" />
                </span>
              </div>
              <p
                aria-hidden="true"
                className="mt-5 font-display text-[clamp(2.25rem,4.2vw,3.75rem)] font-[760] leading-none text-[color:var(--ink)]"
                style={displayNum}
              >
                {rangeFigures}
              </p>
              <p className="sr-only" aria-live="polite" aria-atomic="true">
                {liveText}
              </p>
              <CostScale range={range} className="mt-9" />
            </div>

            <div className="flex min-w-0 flex-col justify-end gap-5 md:col-span-5">
              <p className="t-spec leading-relaxed">{summary}</p>
              <p className="text-[0.9375rem] leading-snug text-muted">{estimatorCopy.disclaimer}</p>
              <Button href={href} arrow size="lg" onClick={onQuote} className="w-full md:w-auto md:self-start">
                {estimatorCopy.cta}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Field header: sheet item number, a short leader, the label, and an optional right-hand value. */
function FieldHead({ index, children, aside }: { index: string; children: ReactNode; aside?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
      <div className="flex min-h-11 items-center gap-3">
        <span aria-hidden="true" className="t-spec tabular-nums">
          {index}
        </span>
        <span aria-hidden="true" className="h-px w-5 bg-[color:var(--ink)] opacity-40" />
        {children}
      </div>
      {aside}
    </div>
  );
}

/** Registration ticks at the four corners of a selected row. */
function Corners() {
  return (
    <span aria-hidden="true" className="est-corners">
      <span className="left-0 top-0 border-l border-t" />
      <span className="right-0 top-0 border-r border-t" />
      <span className="bottom-0 left-0 border-b border-l" />
      <span className="bottom-0 right-0 border-b border-r" />
    </span>
  );
}

/**
 * Graphic cost scale (alternating half-bays, like a drawing's scale bar) with a dimension line
 * spanning the estimate from low to high. Decorative: the figures carry the information.
 */
function CostScale({ range, className }: { range: Range; className?: string }) {
  const bays = SCALE_MAX / SCALE_BAY;
  const at = (value: number) => (Math.min(Math.max(value, 0), SCALE_MAX) / SCALE_MAX) * 100;
  const marks = Array.from({ length: bays + 1 }, (_, i) => i * SCALE_BAY);

  return (
    <div aria-hidden="true" className={cn("text-[color:var(--ink)]", className)}>
      <div className="relative h-5">
        <span
          className={cn("est-span", "absolute inset-y-0")}
          style={{ left: `${at(range.low)}%`, right: `${100 - at(range.high)}%` }}
        >
          {/* extension lines down to the scale, the dimension run, and 45° architectural ticks */}
          <span className="absolute -bottom-1.5 left-0 top-0 w-px bg-current" />
          <span className="absolute -bottom-1.5 right-0 top-0 w-px bg-current" />
          <span className="absolute inset-x-0 top-1/2 h-px bg-current" />
          <span className="absolute left-0 top-1/2 h-3 w-px -translate-x-1/2 -translate-y-1/2 rotate-45 bg-current" />
          <span className="absolute right-0 top-1/2 h-3 w-px -translate-y-1/2 translate-x-1/2 rotate-45 bg-current" />
        </span>
      </div>
      <div className="mt-1.5 flex h-2 border border-current">
        {Array.from({ length: bays * 2 }, (_, i) => (
          <span
            key={i}
            className={cn("flex-1", i % 2 === 0 && "bg-current opacity-80", i > 0 && "border-l border-current")}
          />
        ))}
      </div>
      <div className="relative mt-2 h-4">
        {marks.map((value, i) => (
          <span
            key={value}
            className={cn(
              "t-spec absolute top-0 text-[0.625rem]! tabular-nums leading-none",
              i === bays ? "-translate-x-full" : i > 0 && "-translate-x-1/2",
              // phones: every $100K only, so the numbers never touch
              value % (SCALE_BAY * 2) !== 0 && "hidden sm:block",
            )}
            style={{ left: `${at(value)}%` }}
          >
            {value === 0 ? "$0" : `$${value / 1000}K`}
          </span>
        ))}
      </div>
    </div>
  );
}
