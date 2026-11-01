"use client";

import { useEffect, useRef, type HTMLAttributes, type ReactNode, type RefObject } from "react";
import { isInInitialViewport, observeInView, prefersReducedMotion } from "@/lib/inview";

type DrawOnViewProps = HTMLAttributes<HTMLElement> & {
  as?: "div" | "section" | "figure";
  children: ReactNode;
};

/**
 * Arms its subtree once (data-state="armed") when it starts below the fold, then flips to "drawn"
 * as it enters the viewport; CSS in renovations.css does the drawing. Server HTML, no-JS, reduced
 * motion and anything already on screen all stay "drawn", so nothing is ever hidden by default.
 */
export function DrawOnView({ as = "div", children, ...rest }: DrawOnViewProps) {
  const ref = useRef<HTMLDivElement>(null);
  const Tag = as as "div";

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
    <Tag ref={ref as RefObject<HTMLDivElement>} data-state="drawn" {...rest}>
      {children}
    </Tag>
  );
}
