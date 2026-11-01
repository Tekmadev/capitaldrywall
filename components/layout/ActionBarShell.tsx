"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Without a [data-hero], the bar waits until the first 60% of the viewport has scrolled away. */
const NO_HERO_RATIO = 0.6;

type ActionBarShellProps = {
  children: ReactNode;
  /** Paths where the bar is not rendered at all (the quote page has its own form). */
  hiddenOn: readonly string[];
  /** Kitchen sink: always visible, rendered in place (no fixed positioning, no observers). */
  preview?: boolean;
};

/**
 * Mobile action bar behaviour (brief §7.8). Hidden while the hero is in view and whenever any
 * [data-hide-action-bar] element (footer, quote forms) is in view or within the bar's height of
 * the viewport bottom. Hidden = translated away, `inert` and `aria-hidden` (never tabbable).
 */
export function ActionBarShell({ children, hiddenOn, preview = false }: ActionBarShellProps) {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const excluded = hiddenOn.some((path) => pathname === path || pathname.startsWith(`${path}/`));

  useEffect(() => {
    if (preview || excluded) return;

    const heroes = new Set<Element>();
    const heroesInView = new Set<Element>();
    const blockers = new Set<Element>();
    const blockersInView = new Set<Element>();
    let frame = 0;

    const commit = () => {
      frame = 0;
      const pastIntro =
        heroes.size > 0 ? heroesInView.size === 0 : window.scrollY > window.innerHeight * NO_HERO_RATIO;
      setVisible(pastIntro && blockersInView.size === 0);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(commit);
    };

    const track = (inView: Set<Element>) => (entries: IntersectionObserverEntry[]) => {
      for (const entry of entries) {
        if (entry.isIntersecting) inView.add(entry.target);
        else inView.delete(entry.target);
      }
      schedule();
    };

    const heroObserver = new IntersectionObserver(track(heroesInView));
    // Extend the root downward by the bar's height so the bar is gone before it could cover a blocker.
    const barHeight = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--action-bar-h")) * 16 || 68;
    const blockerObserver = new IntersectionObserver(track(blockersInView), {
      rootMargin: `0px 0px ${Math.round(barHeight)}px 0px`,
    });

    const sync = (selector: string, all: Set<Element>, inView: Set<Element>, observer: IntersectionObserver) => {
      const current = new Set(document.querySelectorAll(selector));
      for (const el of all) {
        if (!current.has(el)) {
          observer.unobserve(el);
          all.delete(el);
          inView.delete(el);
        }
      }
      for (const el of current) {
        if (!all.has(el)) {
          all.add(el);
          observer.observe(el);
        }
      }
    };

    let scanFrame = 0;
    const scan = () => {
      scanFrame = 0;
      sync("[data-hero]", heroes, heroesInView, heroObserver);
      sync("[data-hide-action-bar]", blockers, blockersInView, blockerObserver);
      schedule();
    };
    const scheduleScan = () => {
      if (!scanFrame) scanFrame = requestAnimationFrame(scan);
    };

    // Pages and forms mount and unmount under the persistent layout: rescan on DOM changes.
    const mutations = new MutationObserver(scheduleScan);
    mutations.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["data-hero", "data-hide-action-bar"],
    });
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    scheduleScan();

    return () => {
      cancelAnimationFrame(frame);
      cancelAnimationFrame(scanFrame);
      mutations.disconnect();
      heroObserver.disconnect();
      blockerObserver.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [pathname, preview, excluded]);

  if (excluded && !preview) return null;
  const shown = preview || visible;

  return (
    <div
      data-mobile-action-bar=""
      data-visible={shown ? "true" : "false"}
      inert={!shown}
      aria-hidden={shown ? undefined : true}
      className={cn(
        "surface-light z-40 border-t border-[color:var(--hairline)]",
        "shadow-[0_-12px_28px_-16px_color-mix(in_srgb,var(--color-graphite)_40%,transparent)]",
        preview
          ? "relative"
          : [
              "fixed inset-x-0 bottom-0 md:hidden",
              "transition-[translate,opacity] duration-300 ease-[var(--ease-rake)]",
              "data-[visible=false]:pointer-events-none data-[visible=false]:translate-y-[calc(100%+2.5rem)] data-[visible=false]:opacity-0",
            ],
      )}
    >
      <div className="grid grid-cols-2 gap-2 px-3 pb-[calc(0.625rem+env(safe-area-inset-bottom,0px))] pt-2.5">
        {children}
      </div>
    </div>
  );
}
