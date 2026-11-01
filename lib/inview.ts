/** Shared IntersectionObservers (one per option set) so dozens of reveals cost one observer. */
import { useEffect, useState, type RefObject } from "react";

type Callback = (entry: IntersectionObserverEntry) => void;
type Options = { rootMargin?: string; threshold?: number };

const pools = new Map<string, { io: IntersectionObserver; callbacks: Map<Element, Callback> }>();

export function observeInView(
  el: Element,
  callback: Callback,
  { rootMargin = "0px 0px -8% 0px", threshold = 0 }: Options = {},
): () => void {
  const key = `${rootMargin}|${threshold}`;
  let pool = pools.get(key);
  if (!pool) {
    const callbacks = new Map<Element, Callback>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) callbacks.get(entry.target)?.(entry);
      },
      { rootMargin, threshold },
    );
    pool = { io, callbacks };
    pools.set(key, pool);
  }
  const { io, callbacks } = pool;
  callbacks.set(el, callback);
  io.observe(el);
  return () => {
    io.unobserve(el);
    callbacks.delete(el);
  };
}

/**
 * True once `ref` is within roughly one screen of the viewport (stays true). Use it to mount
 * below-the-fold images late: Chrome's native lazy-loading fetches anything within ~1,250 px at
 * load, which on pages with tall scroll scenes means images compete with the first paint.
 */
export function useNearViewport(ref: RefObject<Element | null>, rootMargin = "0px 0px 100% 0px"): boolean {
  const [near, setNear] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || near) return;
    const stop = observeInView(
      el,
      (entry) => {
        if (entry.isIntersecting) {
          setNear(true);
          stop();
        }
      },
      { rootMargin },
    );
    return stop;
  }, [ref, rootMargin, near]);
  return near;
}

export function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** True when the element's top is already inside the viewport (so it must never be hidden for a reveal). */
export function isInInitialViewport(el: Element, margin = 0.92): boolean {
  return el.getBoundingClientRect().top < window.innerHeight * margin;
}
