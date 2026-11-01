"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { isInInitialViewport, observeInView, prefersReducedMotion } from "@/lib/inview";
import { cn } from "@/lib/utils";

/**
 * Draws the timeline bars on when the chart scrolls into view: children style themselves with
 * `group-data-[state=armed]/gantt:*`. Server HTML, no-JS, reduced motion and a chart that starts in
 * view all stay "drawn" (everything present and still).
 */
export function GanttReveal({
  children,
  className,
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion() || isInInitialViewport(el)) return;
    el.dataset.state = "armed";
    const stop = observeInView(
      el,
      (entry) => {
        if (!entry.isIntersecting) return;
        el.dataset.state = "drawn";
        stop();
      },
      { rootMargin: "0px 0px -18% 0px" },
    );
    return () => {
      stop();
      el.dataset.state = "drawn";
    };
  }, []);

  return (
    <div ref={ref} data-state="drawn" style={style} className={cn("group/gantt", className)}>
      {children}
    </div>
  );
}
