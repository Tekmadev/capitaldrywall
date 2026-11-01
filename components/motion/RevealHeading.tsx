"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { afterLoadIdle, loadSplitText } from "@/lib/gsap";
import { isInInitialViewport, observeInView, prefersReducedMotion } from "@/lib/inview";

type RevealHeadingProps = {
  as?: "h1" | "h2" | "h3" | "p";
  id?: string;
  className?: string;
  children: ReactNode;
};

/**
 * Headline reveal (brief §6): line-by-line mask slide with GSAP SplitText, headlines only.
 * The server renders plain text (crawlable, readable without JS). Headings that are already in the
 * viewport on load are never hidden, and reduced motion skips the effect entirely.
 */
export function RevealHeading({ as = "h2", id, className, children }: RevealHeadingProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion() || isInInitialViewport(el)) return;

    let cancelled = false;
    let stop: (() => void) | undefined;
    let revert: (() => void) | undefined;

    // Load GSAP + SplitText only once the page has loaded and gone idle, so nothing competes with
    // first paint. A heading that has scrolled into view by then is simply left as it is.
    const cancelIdle = afterLoadIdle(async () => {
      if (cancelled || el.getBoundingClientRect().top < window.innerHeight) return;
      const [{ gsap }, SplitText] = await Promise.all([import("gsap"), loadSplitText()]);
      if (cancelled) return;
      await document.fonts?.ready;
      if (cancelled || el.getBoundingClientRect().top < window.innerHeight) return;

      let revealed = false;
      const split = SplitText.create(el, {
        type: "lines",
        mask: "lines",
        linesClass: "reveal-line",
        // Spans keep the heading's content model valid (<h2> takes phrasing content). SplitText only
        // styles <div> wrappers, so globals.css makes .reveal-line and its -mask block-level.
        tag: "span",
        autoSplit: true,
        onSplit(self) {
          if (!revealed) gsap.set(self.lines, { yPercent: 108 });
        },
      });
      revert = () => split.revert();

      stop = observeInView(
        el,
        (entry) => {
          if (!entry.isIntersecting) return;
          stop?.();
          revealed = true;
          gsap.to(split.lines, {
            yPercent: 0,
            duration: 0.85,
            ease: "power4.out",
            stagger: 0.07,
            onComplete: () => split.revert(),
          });
        },
        { rootMargin: "0px 0px -12% 0px" },
      );
    });

    return () => {
      cancelled = true;
      cancelIdle();
      stop?.();
      revert?.();
    };
  }, []);

  const Tag = as;
  return (
    <Tag ref={ref as React.Ref<HTMLHeadingElement & HTMLParagraphElement>} id={id} className={className}>
      {children}
    </Tag>
  );
}
