"use client";

import type Lenis from "lenis";
import { usePathname } from "next/navigation";
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { afterLoadIdle, loadGsap } from "@/lib/gsap";
import { useReducedMotion } from "./useReducedMotion";

const LenisContext = createContext<Lenis | null>(null);

let current: Lenis | null = null;

/** The live Lenis instance, or null (before load, under reduced motion, or on the server). */
export function getLenis(): Lenis | null {
  return current;
}

/** React access to the Lenis instance (null until it starts, and always null for reduced motion). */
export function useLenis(): Lenis | null {
  return useContext(LenisContext);
}

/**
 * Lock page scrolling while `locked` is true (mobile menu, dialogs). Uses lenis.stop()/start() when
 * Lenis runs, otherwise overflow hidden on <html>. Scrollable panels inside should carry
 * `data-lenis-prevent`.
 */
export function useScrollLock(locked: boolean): void {
  const lenis = useLenis();
  useEffect(() => {
    if (!locked) return;
    if (lenis) {
      lenis.stop();
      return () => lenis.start();
    }
    const html = document.documentElement;
    const previous = html.style.overflow;
    html.style.overflow = "hidden";
    return () => {
      html.style.overflow = previous;
    };
  }, [locked, lenis]);
}

function focusTarget(el: HTMLElement) {
  if (!el.matches("a[href], button, input, select, textarea, [tabindex]")) el.setAttribute("tabindex", "-1");
  el.focus({ preventScroll: true });
}

/**
 * Lenis smooth scrolling synced to GSAP ScrollTrigger (brief §6). Starts after the load event, in
 * idle time, from a dynamic import, so nothing lands in the initial bundle. Disabled entirely for
 * prefers-reduced-motion (and torn down if that preference turns on). Same-page anchor links glide
 * to their target clear of the fixed header and move focus there; `data-lenis-prevent` regions keep
 * native scrolling; a new route starts at the top.
 */
export function SmoothScroll({ children }: { children: ReactNode }) {
  const reduced = useReducedMotion();
  const [lenis, setLenis] = useState<Lenis | null>(null);

  useEffect(() => {
    if (reduced) return;
    let disposed = false;
    let teardown: (() => void) | undefined;

    const cancelIdle = afterLoadIdle(async () => {
      const [{ default: LenisCtor }, { gsap, ScrollTrigger }] = await Promise.all([import("lenis"), loadGsap()]);
      if (disposed) return;

      const instance = new LenisCtor({
        autoRaf: false,
        anchors: false, // handled below (focus management, history)
        prevent: (node) => !!node.closest?.("[data-lenis-prevent]"),
      });
      instance.on("scroll", ScrollTrigger.update);
      const tick = (time: number) => instance.raf(time * 1000);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);

      // Same-page hash links: capture phase, so next/link sees defaultPrevented and stands down.
      const onClick = (event: MouseEvent) => {
        if (event.defaultPrevented || event.button !== 0) return;
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        const anchor = (event.target as Element | null)?.closest?.("a[href*='#']");
        if (!(anchor instanceof HTMLAnchorElement) || anchor.target === "_blank" || anchor.hasAttribute("download")) return;
        const url = new URL(anchor.href, window.location.href);
        if (url.origin !== window.location.origin || url.pathname !== window.location.pathname) return;
        if (url.search !== window.location.search) return;
        const id = decodeURIComponent(url.hash.slice(1));
        const toTop = id === "" || id === "top";
        const target = toTop ? null : document.getElementById(id);
        if (!toTop && !target) return;
        event.preventDefault();
        if (target) {
          // Focus first (skip links: the next Tab continues from the target), then glide. Lenis
          // honours html's scroll-padding-top (header height + 1rem) and the target's scroll-margin.
          focusTarget(target);
          instance.scrollTo(target, { force: true });
        } else {
          instance.scrollTo(0, { force: true });
        }
        if (url.hash !== window.location.hash) window.history.pushState(window.history.state, "", url.hash || "#");
      };
      document.addEventListener("click", onClick, true);

      current = instance;
      setLenis(instance);

      teardown = () => {
        document.removeEventListener("click", onClick, true);
        gsap.ticker.remove(tick);
        gsap.ticker.lagSmoothing(500, 33);
        instance.destroy();
        if (current === instance) current = null;
        setLenis(null);
        ScrollTrigger.refresh();
      };
    });

    return () => {
      disposed = true;
      cancelIdle();
      teardown?.();
    };
  }, [reduced]);

  // New route → start at the top (unless it targets an anchor, or it's a back/forward restore).
  const pathname = usePathname();
  const previousPath = useRef(pathname);
  const popped = useRef(false);
  useEffect(() => {
    const onPop = () => {
      popped.current = true;
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);
  useEffect(() => {
    if (previousPath.current === pathname) return;
    previousPath.current = pathname;
    const wasPop = popped.current;
    popped.current = false;
    if (!lenis || wasPop) return;
    const id = decodeURIComponent(window.location.hash.slice(1));
    const target = id ? document.getElementById(id) : null;
    if (target) lenis.scrollTo(target, { immediate: true, force: true });
    else lenis.scrollTo(0, { immediate: true, force: true });
  }, [pathname, lenis]);

  return <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>;
}
