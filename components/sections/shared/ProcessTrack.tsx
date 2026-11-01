"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { loadGsap } from "@/lib/gsap";
import { cn, pad2 } from "@/lib/utils";

type ProcessTrackProps = {
  children: ReactNode;
  /** Classes for the outer root (carries `group/process` and data-mode) */
  className?: string;
  /** Classes for the inner element that gets pinned */
  pinClassName?: string;
  /** Disable pinning (kitchen sink, screenshots) */
  enabled?: boolean;
  /** Static demo: render the horizontal track without pinning, at this step (0-based) */
  staticStep?: number;
};

/**
 * Client island for the home process section. On desktop (≥1024 px) with motion allowed it switches
 * the server-rendered stepper into a horizontal track (data-mode="track"), pins the section and scrubs
 * the panels sideways (pin length ≤ 220vh). Below 1024 px, with reduced motion or without JS, the
 * vertical stepper stays as rendered. Lenis is synced to ScrollTrigger globally.
 */
export function ProcessTrack({ children, className, pinClassName, enabled = true, staticStep }: ProcessTrackProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const pinEl = pinRef.current;
    if (!root || !pinEl) return;

    const steps = Array.from(root.querySelectorAll<HTMLElement>("[data-process-step]"));
    const readout = root.querySelector<HTMLElement>("[data-process-current]");
    const track = root.querySelector<HTMLElement>("[data-process-track]");
    const viewport = root.querySelector<HTMLElement>("[data-process-viewport]");
    let current = -1;

    const setActive = (index: number) => {
      if (index === current) return;
      current = index;
      steps.forEach((step, i) => step.toggleAttribute("data-active", i <= index));
      if (readout) readout.textContent = pad2(index + 1);
    };
    const setProgress = (p: number) => track?.style.setProperty("--process-progress", p.toFixed(4));

    /* Static demo of the track state (no pinning), desktop widths only */
    if (staticStep !== undefined) {
      if (!window.matchMedia("(min-width: 1024px)").matches) return;
      root.dataset.mode = "track";
      const last = Math.max(1, steps.length - 1);
      setActive(staticStep);
      setProgress(staticStep / last);
      if (track && viewport) {
        const distance = Math.max(0, track.scrollWidth - viewport.clientWidth);
        track.style.transform = `translate3d(${-(distance * staticStep) / last}px,0,0)`;
      }
      return () => {
        delete root.dataset.mode;
        if (track) track.style.transform = "";
      };
    }

    if (!enabled || !track || !viewport) return;

    let cancelled = false;
    let revert: (() => void) | undefined;

    loadGsap().then(({ gsap, ScrollTrigger }) => {
      if (cancelled) return;
      const mm = gsap.matchMedia();
      mm.add(
        { desktop: "(min-width: 1024px)", reduce: "(prefers-reduced-motion: reduce)" },
        (context) => {
          const { desktop, reduce } = context.conditions as { desktop: boolean; reduce: boolean };
          if (!desktop || reduce) return;

          root.dataset.mode = "track";
          root.dataset.pinned = "";
          const last = Math.max(1, steps.length - 1);
          const distance = () => Math.max(0, track.scrollWidth - viewport.clientWidth);
          setActive(0);
          setProgress(0);

          gsap.to(track, {
            x: () => -distance(),
            ease: "none",
            scrollTrigger: {
              trigger: pinEl,
              start: "top top",
              end: () => `+=${Math.round(Math.min(window.innerHeight * 2.2, Math.max(window.innerHeight * 1.2, distance() * 1.5)))}`,
              pin: true,
              scrub: 0.5,
              invalidateOnRefresh: true,
              onUpdate: (self) => {
                setProgress(self.progress);
                /* a step lights up once the amber progress line reaches its tick */
                setActive(Math.min(last, Math.floor(self.progress * last + 0.02)));
              },
            },
          });

          return () => {
            delete root.dataset.mode;
            delete root.dataset.pinned;
            steps.forEach((step) => step.removeAttribute("data-active"));
            track.style.removeProperty("--process-progress");
            current = -1;
          };
        },
      );
      document.fonts?.ready.then(() => {
        if (!cancelled) ScrollTrigger.refresh();
      });
      revert = () => mm.revert();
    });

    return () => {
      cancelled = true;
      revert?.();
    };
  }, [enabled, staticStep]);

  return (
    <div ref={rootRef} data-process-root="" className={cn("group/process", className)}>
      <div ref={pinRef} className={pinClassName}>
        {children}
      </div>
    </div>
  );
}
