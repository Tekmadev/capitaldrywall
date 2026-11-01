"use client";

import { useId, useLayoutEffect, useRef, useState, useSyncExternalStore, type CSSProperties, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export type SegmentedOption<V extends string = string> = {
  value: V;
  label: ReactNode;
  /** Small second line under the label, e.g. "Paint-ready" */
  hint?: ReactNode;
  disabled?: boolean;
};

export type SegmentedControlProps<V extends string = string> = {
  /** Fieldset legend (required for accessibility; hide it visually with hideLegend) */
  legend: ReactNode;
  hideLegend?: boolean;
  options: readonly SegmentedOption<V>[];
  /** Controlled value */
  value?: V;
  /** Uncontrolled starting value (leave both unset for "nothing chosen yet") */
  defaultValue?: V;
  onValueChange?: (value: V) => void;
  /** Radio group name (also the form field name). Defaults to a generated id. */
  name?: string;
  disabled?: boolean;
  required?: boolean;
  size?: "sm" | "md";
  /** Segments wrap to another row below this width (CSS length, default "5.5rem") */
  minSegmentWidth?: string;
  /** Extra description id(s) for the group, e.g. an error message */
  describedBy?: string;
  className?: string;
};

const noopSubscribe = () => () => {};

/**
 * Single choice on native radio inputs: fieldset + legend, arrow keys for free, and plain working
 * radios without JS (the checked cell fills amber through CSS). Once hydrated, one amber indicator
 * slides between cells with a transform. Joined cells share hairlines like a drawing schedule and
 * wrap into rows on narrow screens. Disabled options are hatched like work not in contract.
 */
export function SegmentedControl<V extends string = string>({
  legend,
  hideLegend = false,
  options,
  value,
  defaultValue,
  onValueChange,
  name,
  disabled = false,
  required = false,
  size = "md",
  minSegmentWidth = "5.5rem",
  describedBy,
  className,
}: SegmentedControlProps<V>) {
  const autoId = useId();
  const groupName = name ?? `seg${autoId.replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const controlled = value !== undefined;
  const [inner, setInner] = useState<V | undefined>(defaultValue);
  const current = controlled ? value : inner;
  // false on the server and during hydration, true afterwards (no setState in an effect)
  const hydrated = useSyncExternalStore(noopSubscribe, () => true, () => false);

  const trackRef = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLSpanElement>(null);
  const placed = useRef(false);

  useLayoutEffect(() => {
    const track = trackRef.current;
    const indicator = indicatorRef.current;
    if (!hydrated || !track || !indicator) return;

    const place = () => {
      const cell =
        current === undefined
          ? null
          : Array.from(track.querySelectorAll<HTMLElement>("[data-seg-value]")).find(
              (el) => el.dataset.segValue === current,
            );
      if (!cell) {
        indicator.style.opacity = "0";
        return;
      }
      const first = !placed.current;
      if (first) indicator.style.transition = "none";
      indicator.style.opacity = "1";
      indicator.style.width = `${cell.offsetWidth}px`;
      indicator.style.height = `${cell.offsetHeight}px`;
      indicator.style.transform = `translate(${cell.offsetLeft}px, ${cell.offsetTop}px)`;
      if (first) {
        void indicator.offsetWidth; // commit the first position before re-enabling the slide
        indicator.style.transition = "";
        placed.current = true;
      }
    };

    place();
    const ro = new ResizeObserver(place);
    ro.observe(track);
    track.querySelectorAll("[data-seg-value]").forEach((el) => ro.observe(el));
    return () => ro.disconnect();
  }, [current, hydrated, options]);

  const select = (next: V) => {
    if (!controlled) setInner(next);
    onValueChange?.(next);
  };

  return (
    <fieldset
      disabled={disabled}
      aria-describedby={describedBy}
      className={cn("group/segctl m-0 min-w-0 border-0 p-0", disabled && "opacity-60", className)}
    >
      <legend className={cn("t-spec mb-3 p-0", hideLegend && "sr-only")}>{legend}</legend>
      <div
        ref={trackRef}
        className="relative isolate flex flex-wrap gap-px border border-[color:var(--hairline)] bg-[color:var(--hairline)]"
        style={{ "--seg-min": minSegmentWidth } as CSSProperties}
      >
        <span
          ref={indicatorRef}
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute left-0 top-0 z-[1] bg-worklight opacity-0",
            "transition-[transform,width,height,opacity] duration-[260ms] ease-[var(--ease-rake)]",
            "after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-worklight-deep",
          )}
        />
        {options.map((opt) => {
          const optionDisabled = disabled || Boolean(opt.disabled);
          return (
            <label
              key={opt.value}
              data-seg-value={opt.value}
              className={cn(
                "group/opt relative flex flex-[1_1_var(--seg-min)] cursor-pointer select-none flex-col items-center justify-center gap-1 bg-[color:var(--surface)] text-center",
                "transition-[background-color] duration-200 ease-[var(--ease-rake)]",
                size === "sm" ? "min-h-11 px-2.5 py-2" : "min-h-12 px-3 py-2.5 md:min-h-14",
                "hover:bg-[color:color-mix(in_srgb,var(--ink)_6%,var(--surface))] active:bg-[color:color-mix(in_srgb,var(--ink)_11%,var(--surface))]",
                // Without JS (and until hydration) the checked cell fills itself.
                !hydrated && "has-[:checked]:bg-worklight",
                // Focus ring moves from the hidden radio to its cell.
                "has-[:focus-visible]:z-10 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-worklight has-[:focus-visible]:[outline-style:solid] has-[:focus-visible]:shadow-[0_0_0_2px_var(--color-graphite)]",
                // Disabled: hatched like work not in contract.
                "has-[:disabled]:cursor-not-allowed has-[:disabled]:hover:bg-[color:var(--surface)]",
                "has-[:disabled]:bg-[repeating-linear-gradient(135deg,transparent_0_6px,color-mix(in_srgb,var(--ink)_10%,transparent)_6px_7px)]",
              )}
            >
              <input
                type="radio"
                name={groupName}
                value={opt.value}
                checked={current === opt.value}
                onChange={() => select(opt.value)}
                disabled={optionDisabled}
                required={required}
                className="sr-only"
              />
              <span
                className={cn(
                  "t-spec relative z-[2] text-[color:var(--muted)] transition-colors duration-200",
                  "group-hover/opt:text-[color:var(--ink)] group-has-[:checked]/opt:text-graphite",
                  "group-has-[:disabled]/opt:text-[color:var(--muted)] group-has-[:disabled]/opt:line-through group-has-[:disabled]/opt:decoration-1",
                )}
              >
                {opt.label}
              </span>
              {opt.hint && (
                <span
                  className={cn(
                    "relative z-[2] text-balance text-[0.75rem] leading-tight text-[color:var(--muted)] transition-colors duration-200",
                    "group-has-[:checked]/opt:text-graphite/80",
                  )}
                >
                  {opt.hint}
                </span>
              )}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
