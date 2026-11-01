"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { isInInitialViewport, observeInView, prefersReducedMotion } from "@/lib/inview";
import { cn } from "@/lib/utils";

type DimensionLineProps = {
  /** Mono annotation, e.g. "3 COATS · 24 H DRY". Must state a real fact. */
  label?: ReactNode;
  orientation?: "horizontal" | "vertical";
  /** Where the label sits along the line */
  align?: "center" | "start" | "end";
  /** Amber line for active/progress states; default uses the surface spec colour */
  tone?: "spec" | "amber";
  /** Draw on when scrolled into view (default true). SSR/no-JS/reduced motion: always drawn. */
  draw?: boolean;
  className?: string;
};

/**
 * Drafting dimension line: end ticks, a hairline run and a mono label. Draws on from the start
 * tick when it enters the viewport (state lives in a data attribute, so no re-render).
 */
export function DimensionLine({
  label,
  orientation = "horizontal",
  align = "center",
  tone = "spec",
  draw = true,
  className,
}: DimensionLineProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !draw || prefersReducedMotion() || isInInitialViewport(el)) return;
    el.dataset.state = "armed";
    const stop = observeInView(el, (entry) => {
      if (!entry.isIntersecting) return;
      el.dataset.state = "drawn";
      stop();
    });
    return () => {
      stop();
      el.dataset.state = "drawn";
    };
  }, [draw]);

  const vertical = orientation === "vertical";
  const seg = cn(
    "block bg-current/55 transition-transform duration-[900ms] ease-[var(--ease-rake)]",
    vertical
      ? "w-px flex-1 origin-top group-data-[state=armed]/dim:scale-y-0"
      : "h-px flex-1 origin-left group-data-[state=armed]/dim:scale-x-0",
  );
  const tick = cn("block shrink-0 bg-current/70", vertical ? "h-px w-2.5" : "h-2.5 w-px");
  const labelEl = label ? (
    <span
      className={cn(
        "t-spec shrink-0 text-current transition-opacity delay-300 duration-500 group-data-[state=armed]/dim:opacity-0",
        vertical && "rotate-180 [writing-mode:vertical-rl]",
      )}
    >
      {label}
    </span>
  ) : null;

  return (
    <div
      ref={ref}
      data-state="drawn"
      className={cn(
        "group/dim flex items-center gap-2.5",
        vertical ? "h-full flex-col" : "w-full",
        tone === "amber" ? "text-worklight" : "text-[color:var(--spec)]",
        className,
      )}
    >
      <span className={tick} aria-hidden="true" />
      {align === "start" && labelEl}
      <span className={seg} aria-hidden="true" />
      {align === "center" && labelEl}
      {align === "center" && <span className={cn(seg, "delay-150")} aria-hidden="true" />}
      {align === "end" && labelEl}
      <span className={tick} aria-hidden="true" />
    </div>
  );
}
