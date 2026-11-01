"use client";

import { useEffect, useRef } from "react";
import { isInInitialViewport, observeInView, prefersReducedMotion } from "@/lib/inview";
import { cn } from "@/lib/utils";

/**
 * The amber hairline that rakes across a dark section's top boundary (ART_DIRECTION device 8,
 * "Motion in practice"). Place it as the first child of a `relative` section. It sweeps in once, from
 * the left, when the boundary enters the viewport. The server HTML, no-JS, reduced motion and a
 * boundary already on screen at load all show it drawn and still, so it is never hidden by default.
 */
export function RakeLine({ className }: { className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion() || isInInitialViewport(el)) return;
    el.dataset.state = "armed";
    const stop = observeInView(
      el,
      (entry) => {
        if (!entry.isIntersecting) return;
        el.dataset.state = "rake";
        stop();
      },
      { rootMargin: "0px 0px -15% 0px" },
    );
    return () => {
      stop();
      delete el.dataset.state;
    };
  }, []);

  return (
    <span
      ref={ref}
      aria-hidden="true"
      className={cn(
        "rake-line pointer-events-none absolute inset-x-0 top-0 z-10",
        "data-[state=armed]:scale-x-0 data-[state=armed]:opacity-0 data-[state=rake]:animate-rake",
        className,
      )}
    />
  );
}
