/**
 * Memoised dynamic loaders so GSAP never lands in the initial bundle and plugins register once.
 * Usage (client only, inside effects): const { gsap, ScrollTrigger } = await loadGsap();
 */
import type { gsap as GsapType } from "gsap";
import type { ScrollTrigger as ScrollTriggerType } from "gsap/ScrollTrigger";
import type { SplitText as SplitTextType } from "gsap/SplitText";

type GsapBundle = { gsap: typeof GsapType; ScrollTrigger: typeof ScrollTriggerType };

let gsapPromise: Promise<GsapBundle> | null = null;
let splitPromise: Promise<typeof SplitTextType> | null = null;
let loaded: GsapBundle | null = null;

export function loadGsap(): Promise<GsapBundle> {
  gsapPromise ??= Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(([core, st]) => {
    core.gsap.registerPlugin(st.ScrollTrigger);
    loaded = { gsap: core.gsap, ScrollTrigger: st.ScrollTrigger };
    return loaded;
  });
  return gsapPromise;
}

export function loadSplitText(): Promise<typeof SplitTextType> {
  splitPromise ??= Promise.all([import("gsap"), import("gsap/SplitText")]).then(([core, mod]) => {
    core.gsap.registerPlugin(mod.SplitText);
    return mod.SplitText;
  });
  return splitPromise;
}

/** The GSAP bundle if something already loaded it (never triggers a download). */
export function getLoadedGsap(): GsapBundle | null {
  return loaded;
}

let refreshTimer: ReturnType<typeof setTimeout> | undefined;

/**
 * Debounced ScrollTrigger.refresh() for layout changes ScrollTrigger can't see (a scene track that
 * grows, late images above a pinned section). A no-op until GSAP has been loaded by someone.
 */
export function requestScrollRefresh(delay = 120): void {
  if (typeof window === "undefined") return;
  clearTimeout(refreshTimer);
  refreshTimer = setTimeout(() => loaded?.ScrollTrigger.refresh(), delay);
}

/**
 * Run `cb` once the page has fully loaded and the main thread is idle (setTimeout fallback),
 * so nothing optional competes with first paint or LCP. Returns a cancel function.
 */
export function afterLoadIdle(cb: () => void, timeout = 2000): () => void {
  if (typeof window === "undefined") return () => {};
  let cancelled = false;
  let idleId: number | undefined;
  let timerId: ReturnType<typeof setTimeout> | undefined;

  const schedule = () => {
    if (cancelled) return;
    if ("requestIdleCallback" in window) {
      idleId = window.requestIdleCallback(() => !cancelled && cb(), { timeout });
    } else {
      timerId = setTimeout(() => !cancelled && cb(), 200);
    }
  };

  if (document.readyState === "complete") schedule();
  else window.addEventListener("load", schedule, { once: true });

  return () => {
    cancelled = true;
    window.removeEventListener("load", schedule);
    if (idleId !== undefined && "cancelIdleCallback" in window) window.cancelIdleCallback(idleId);
    if (timerId !== undefined) clearTimeout(timerId);
  };
}
