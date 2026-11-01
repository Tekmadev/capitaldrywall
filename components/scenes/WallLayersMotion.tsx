"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { useReducedMotion } from "@/components/motion/useReducedMotion";
import { activeLayerAt, assemblyAt, layerAssembly, layerOpacity, WL_COUNT } from "./WallLayersGeometry";

/** Same condition as the CSS that makes the stage sticky (WallLayers.tsx). */
const PINNED_QUERY = "(min-width: 64rem) and (min-height: 37.5rem)";

/**
 * Drives the server-rendered wall section on scroll. Desktop: the stage is CSS-sticky inside a tall
 * track and track progress scrubs the layers in one by one (smoothed, like a 0.5 s scrub). Smaller
 * screens: no pinning; the drawing assembles as it travels up the viewport and the list highlights the
 * layer being read. Reduced motion or `disabled`: nothing runs and the server's assembled drawing stays.
 * Reads one or two rects per frame, only while the section is near the viewport and something changed.
 */
export function WallLayersMotion({
  children,
  disabled = false,
  className,
}: {
  children: ReactNode;
  disabled?: boolean;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const root = ref.current;
    if (!root || disabled || reduced) return;

    const layers = Array.from(root.querySelectorAll<SVGGElement>("[data-wl-layer]")).map((el) => ({
      el,
      i: Number(el.dataset.wlLayer),
      dx: Number(el.dataset.wlDx),
    }));
    const items = Array.from(root.querySelectorAll<HTMLElement>("[data-wl-item]"));
    const dims = Array.from(root.querySelectorAll<SVGGElement>("[data-wl-dim]"));
    const track = root.querySelector<HTMLElement>("[data-wl-track]");
    const stage = root.querySelector<HTMLElement>("[data-wl-stage]");
    const figure = root.querySelector<HTMLElement>("[data-wl-figure]");
    if (!track || !stage || !figure || layers.length === 0) return;

    const mq = window.matchMedia(PINNED_QUERY);
    let pinned = mq.matches;
    let q = -1;
    let raf = 0;
    let last = 0;
    let inView = false;
    let drawn = { q: -1, active: -2, pinned: !pinned };

    const target = () => {
      if (pinned) {
        const t = track.getBoundingClientRect();
        const s = stage.getBoundingClientRect();
        const run = t.height - s.height;
        const tq = assemblyAt(run > 1 ? (s.top - t.top) / run : 1);
        return { tq, active: activeLayerAt(tq) };
      }
      const vh = window.innerHeight;
      const f = figure.getBoundingClientRect();
      const tq = assemblyAt((vh * 0.88 - f.top) / (vh * 0.58));
      // Once assembled, the highlight follows the list item being read
      let reading = -1;
      if (tq >= WL_COUNT) {
        for (let i = 0; i < items.length; i++) if (items[i].getBoundingClientRect().top < vh * 0.62) reading = i;
      }
      return { tq, active: reading >= 0 ? reading : activeLayerAt(tq) };
    };

    const render = (qq: number, active: number) => {
      for (const { el, i, dx } of layers) {
        const a = layerAssembly(i, qq);
        el.setAttribute("transform", `translate(${(dx * (1 - a)).toFixed(2)} 0)`);
        el.style.opacity = a >= 1 ? "" : layerOpacity(a).toFixed(3);
        el.dataset.active = String(i === active);
      }
      const dimOpacity = layerAssembly(4, qq);
      for (const d of dims) d.style.opacity = dimOpacity >= 1 ? "" : dimOpacity.toFixed(3);
      if (active !== drawn.active || pinned !== drawn.pinned) {
        items.forEach((li, i) => {
          li.dataset.state = i === active ? "active" : "idle";
          li.dataset.collapse = String(pinned && i !== active);
        });
      }
      drawn = { q: qq, active, pinned };
    };

    const frame = (now: number) => {
      raf = 0;
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60;
      last = now;
      const { tq, active } = target();
      // First frame snaps to the scroll position; afterwards ease toward it
      q = q < 0 ? tq : q + (tq - q) * (1 - Math.exp(-dt * 7));
      if (Math.abs(tq - q) < 0.0008) q = tq;
      if (q !== drawn.q || active !== drawn.active || pinned !== drawn.pinned) render(q, active);
      if (inView && q !== tq) raf = requestAnimationFrame(frame);
    };

    const kick = () => {
      if (raf || !inView) return;
      last = 0;
      raf = requestAnimationFrame(frame);
    };
    const onMq = () => {
      pinned = mq.matches;
      kick();
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
        if (inView) kick();
        else if (raf) {
          cancelAnimationFrame(raf);
          raf = 0;
        }
      },
      { rootMargin: "25% 0px" },
    );
    io.observe(root);
    window.addEventListener("scroll", kick, { passive: true });
    window.addEventListener("resize", kick, { passive: true });
    mq.addEventListener("change", onMq);

    return () => {
      if (raf) cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("scroll", kick);
      window.removeEventListener("resize", kick);
      mq.removeEventListener("change", onMq);
      // Back to the assembled, fully labelled state (e.g. when reduced motion is switched on)
      for (const { el } of layers) {
        el.setAttribute("transform", "translate(0 0)");
        el.style.opacity = "";
        delete el.dataset.active;
      }
      for (const d of dims) d.style.opacity = "";
      for (const li of items) {
        delete li.dataset.state;
        delete li.dataset.collapse;
      }
    };
  }, [disabled, reduced]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
