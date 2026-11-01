"use client";

import Image, { type ImageProps } from "next/image";
import { useEffect, useId, useRef, useSyncExternalStore, type CSSProperties } from "react";
import { useReducedMotion } from "@/components/motion/useReducedMotion";
import { DimensionLine } from "@/components/ui/DimensionLine";
import { RegistrationMarks, TitleCell } from "@/components/ui/drafting";
import type { MediaAsset } from "@/content/media";
import { useNearViewport } from "@/lib/inview";
import { cn } from "@/lib/utils";

export type RakingLightPanel = {
  /** Flat-lit photo: what the wall looks like at rest */
  flat: MediaAsset;
  /** Raking-lit photo with identical framing: what the low light reveals */
  raking: MediaAsset;
  /** Copy-deck panel label, e.g. "Rushed finish" */
  label: string;
  /** Title-block field label above the panel label, e.g. "Panel A" */
  field: string;
};

export type RakingLightStageProps = {
  panels: [RakingLightPanel, RakingLightPanel];
  instructionDesktop: string;
  instructionTouch: string;
  /** Visible while the walls have keyboard focus; also the group's accessible description */
  instructionKeyboard: string;
  caption: string;
  /** Dimension string drawn over each panel, e.g. "1.2 m wall section" (false hides it) */
  dimension?: string | false;
  /** Static comparison (raking-lit photos side by side), exactly as for reduced motion and no-JS */
  forceStatic?: boolean;
  /** Slow automatic sweep on first view and after ~3 s idle (default true) */
  autoSweep?: boolean;
  /** Where the light starts, 0–1 within a panel (x from the left, y from the top) */
  initialLight?: { x: number; y: number };
  className?: string;
};

/*
 * The light: a soft radial mask, wider than tall (a grazing beam), positioned by CSS variables that
 * the rAF loop writes on the panel group. Both panels read the same variables, so the light falls on
 * the same spot of each wall. No React state changes while the light moves.
 */
const MASK =
  "radial-gradient(ellipse var(--rl-rx) var(--rl-ry) at var(--rl-x) var(--rl-y), #000 0%, rgb(0 0 0 / 0.92) 36%, rgb(0 0 0 / 0.4) 68%, transparent 100%)";
const GLOW =
  "radial-gradient(ellipse calc(var(--rl-rx) * 0.78) calc(var(--rl-ry) * 0.7) at calc(var(--rl-x) - 5%) var(--rl-y), rgb(255 206 140 / 0.26), rgb(244 166 42 / 0.09) 46%, transparent 74%)";
const maskStyle: CSSProperties = { WebkitMaskImage: MASK, maskImage: MASK, opacity: "var(--rl-i)" };
const glowStyle: CSSProperties = { backgroundImage: GLOW, opacity: "var(--rl-i)" };

/* Mobile: stacked full width. ≥768: two columns of the container. */
const SIZES = "(min-width: 1440px) 656px, (min-width: 768px) calc(50vw - 3rem), calc(100vw - 2.5rem)";

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

/** Idle path: a slow figure across the wall, starting at the left where the light comes from. */
const sweepAt = (t: number) => ({
  x: 0.5 - 0.39 * Math.cos((t * 2 * Math.PI) / 9),
  y: 0.5 + 0.16 * Math.sin((t * 2 * Math.PI) / 13),
});

const subscribeNoop = () => () => {};
/** false during SSR and hydration, true after: the page is static until JS takes over. */
function useHydrated() {
  return useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false,
  );
}

const IDLE_MS = 3000;
const TOUCH_LIFT_PX = 44; // the light sits just above the finger so the finger never hides it

/**
 * Interactive half of the raking-light test (brief §7.2): two walls, a work light that follows the
 * pointer (drag on touch, arrow keys on keyboard) and an idle sweep. Server/no-JS, reduced motion and
 * `forceStatic` render the static comparison: both raking-lit photos side by side.
 */
export function RakingLightStage({
  panels,
  instructionDesktop,
  instructionTouch,
  instructionKeyboard,
  caption,
  dimension = "1.2 m wall section",
  forceStatic = false,
  autoSweep = true,
  initialLight,
  className,
}: RakingLightStageProps) {
  const hydrated = useHydrated();
  const reduced = useReducedMotion();
  const live = hydrated && !reduced && !forceStatic;

  const groupRef = useRef<HTMLDivElement>(null);
  // The panels mount their photos only when the test nears the viewport (see useNearViewport).
  const near = useNearViewport(groupRef);
  const cursorRef = useRef<HTMLSpanElement>(null);
  const uid = useId();
  const captionId = `${uid}-caption`;
  const hintId = `${uid}-hint`;

  const start = initialLight ?? sweepAt(0);
  const startX = clamp(start.x, 0, 1);
  const startY = clamp(start.y, 0, 1);

  useEffect(() => {
    if (!live) return;
    const group = groupRef.current;
    if (!group) return;
    const cursor = cursorRef.current;
    const panelEls = Array.from(group.querySelectorAll<HTMLElement>("[data-rl-panel]"));

    const s = {
      x: startX,
      y: startY,
      tx: startX,
      ty: startY,
      i: 1,
      mode: (autoSweep ? "sweep" : "manual") as "sweep" | "manual",
      sweepT: 0,
      resumeAt: 0,
      pointer: null as null | { x: number; y: number; lift: number },
      mouseInside: false,
      touching: false,
      keyboard: false,
      inView: false,
      raf: 0,
      last: 0,
      wx: "",
      wy: "",
      wi: "",
    };

    /** Light position in panel units for a pointer, using the panel under it (or the nearest). */
    const toLocal = (cx: number, cy: number) => {
      let best: DOMRect | null = null;
      let bestD = Infinity;
      for (const el of panelEls) {
        const r = el.getBoundingClientRect();
        const dx = cx < r.left ? r.left - cx : cx > r.right ? cx - r.right : 0;
        const dy = cy < r.top ? r.top - cy : cy > r.bottom ? cy - r.bottom : 0;
        const d = dx * dx + dy * dy;
        if (d < bestD) {
          bestD = d;
          best = r;
        }
      }
      if (!best || best.width === 0 || best.height === 0) return null;
      return { x: (cx - best.left) / best.width, y: (cy - best.top) / best.height };
    };

    const write = () => {
      const vx = `${(s.x * 100).toFixed(2)}%`;
      const vy = `${(s.y * 100).toFixed(2)}%`;
      const vi = s.i.toFixed(3);
      if (vx !== s.wx) group.style.setProperty("--rl-x", (s.wx = vx));
      if (vy !== s.wy) group.style.setProperty("--rl-y", (s.wy = vy));
      if (vi !== s.wi) group.style.setProperty("--rl-i", (s.wi = vi));
    };

    const frame = (now: number) => {
      s.raf = 0;
      const dt = s.last ? Math.min(0.05, (now - s.last) / 1000) : 1 / 60;
      s.last = now;

      if (s.pointer) {
        // Recomputed every frame so the light stays under a still pointer while the page scrolls
        const loc = toLocal(s.pointer.x, s.pointer.y - s.pointer.lift);
        if (loc) {
          s.tx = clamp(loc.x, -0.12, 1.12);
          s.ty = clamp(loc.y, -0.12, 1.12);
        }
        if (cursor && s.mouseInside) {
          const g = group.getBoundingClientRect();
          cursor.style.transform = `translate3d(${(s.pointer.x - g.left).toFixed(1)}px, ${(s.pointer.y - g.top).toFixed(1)}px, 0)`;
        }
      } else if (s.mode === "manual" && autoSweep && !s.keyboard && now >= s.resumeAt) {
        s.mode = "sweep";
      }

      if (s.mode === "sweep") {
        s.sweepT += dt;
        const p = sweepAt(s.sweepT);
        s.tx = p.x;
        s.ty = p.y;
      }

      // Pointer: tight follow. Sweep: a lazy glide, so resuming never jumps.
      const k = 1 - Math.exp(-dt * (s.mode === "sweep" ? 2.4 : 15));
      s.x += (s.tx - s.x) * k;
      s.y += (s.ty - s.y) * k;
      s.i += (1 - s.i) * (1 - Math.exp(-dt * 2.6));
      write();

      const settled =
        s.mode === "manual" &&
        !s.pointer &&
        Math.abs(s.tx - s.x) < 0.0005 &&
        Math.abs(s.ty - s.y) < 0.0005 &&
        s.i > 0.999 &&
        (!autoSweep || s.keyboard);
      if (s.inView && !settled) s.raf = requestAnimationFrame(frame);
    };

    const kick = () => {
      if (!s.raf && s.inView) {
        s.last = 0;
        s.raf = requestAnimationFrame(frame);
      }
    };
    const halt = () => {
      if (s.raf) cancelAnimationFrame(s.raf);
      s.raf = 0;
    };
    const takeOver = () => {
      if (s.mode === "sweep") {
        s.tx = s.x;
        s.ty = s.y;
      }
      s.mode = "manual";
    };
    const setCursor = (on: boolean) => {
      if (cursor) cursor.dataset.on = on ? "true" : "false";
    };

    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType === "touch" && !s.touching) return;
      takeOver();
      s.pointer = { x: e.clientX, y: e.clientY, lift: e.pointerType === "touch" ? TOUCH_LIFT_PX : 0 };
      if (e.pointerType !== "touch" && !s.mouseInside) {
        s.mouseInside = true;
        setCursor(true);
      }
      kick();
    };
    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType !== "touch") return;
      s.touching = true;
      onPointerMove(e);
    };
    const endTouch = (e: PointerEvent) => {
      if (e.pointerType !== "touch" || !s.touching) return;
      s.touching = false;
      s.pointer = null;
      s.resumeAt = performance.now() + IDLE_MS;
      kick();
    };
    const onPointerLeave = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      s.mouseInside = false;
      s.pointer = null;
      setCursor(false);
      s.resumeAt = performance.now() + IDLE_MS;
      kick();
    };
    const onKeyDown = (e: KeyboardEvent) => {
      const step = e.shiftKey ? 0.12 : 0.04;
      let dx = 0;
      let dy = 0;
      if (e.key === "ArrowLeft") dx = -step;
      else if (e.key === "ArrowRight") dx = step;
      else if (e.key === "ArrowUp") dy = -step;
      else if (e.key === "ArrowDown") dy = step;
      else if (e.key === "Home") dx = -1;
      else if (e.key === "End") dx = 1;
      else return;
      e.preventDefault();
      takeOver();
      s.keyboard = true;
      s.tx = clamp(s.tx + dx, 0.02, 0.98);
      s.ty = clamp(s.ty + dy, 0.04, 0.96);
      kick();
    };
    const onFocus = () => {
      // Keyboard focus parks the light for inspection; a mouse click focus does not.
      if (!group.matches(":focus-visible")) return;
      takeOver();
      s.keyboard = true;
      kick();
    };
    const onBlur = () => {
      s.keyboard = false;
      s.resumeAt = performance.now() + IDLE_MS;
      kick();
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        s.inView = entry.isIntersecting;
        if (s.inView) kick();
        else halt();
      },
      { rootMargin: "12% 0px" },
    );
    io.observe(group);

    const passive = { passive: true } as const;
    group.addEventListener("pointermove", onPointerMove, passive);
    group.addEventListener("pointerdown", onPointerDown, passive);
    group.addEventListener("pointerup", endTouch, passive);
    group.addEventListener("pointercancel", endTouch, passive);
    group.addEventListener("pointerleave", onPointerLeave, passive);
    group.addEventListener("keydown", onKeyDown);
    group.addEventListener("focus", onFocus);
    group.addEventListener("blur", onBlur);

    return () => {
      halt();
      io.disconnect();
      group.removeEventListener("pointermove", onPointerMove);
      group.removeEventListener("pointerdown", onPointerDown);
      group.removeEventListener("pointerup", endTouch);
      group.removeEventListener("pointercancel", endTouch);
      group.removeEventListener("pointerleave", onPointerLeave);
      group.removeEventListener("keydown", onKeyDown);
      group.removeEventListener("focus", onFocus);
      group.removeEventListener("blur", onBlur);
      setCursor(false);
    };
  }, [live, autoSweep, startX, startY]);

  return (
    <div className={cn("group/stage relative", className)} data-rl-mode={live ? "live" : "static"}>
      <div
        ref={groupRef}
        role="group"
        data-rl-group
        aria-labelledby={captionId}
        aria-describedby={live ? hintId : undefined}
        tabIndex={live ? 0 : undefined}
        className={cn(
          "relative grid grid-cols-1 gap-y-12 md:grid-cols-2 md:gap-x-[var(--gutter)]",
          "[--rl-rx:50%] [--rl-ry:38%] md:[--rl-ry:28%]",
          live && "touch-pan-y select-none pointer-fine:cursor-none",
        )}
        style={
          {
            "--rl-x": `${(startX * 100).toFixed(2)}%`,
            "--rl-y": `${(startY * 100).toFixed(2)}%`,
            "--rl-i": 1,
          } as CSSProperties
        }
      >
        {panels.map((panel, index) => (
          <figure key={panel.label} className="relative min-w-0">
            {dimension && <DimensionLine label={dimension} className="mb-4" />}
            <div
              data-rl-panel
              className="relative aspect-[4/3] w-full overflow-hidden bg-graphite-2 md:aspect-[4/5] md:max-h-[min(78svh,46rem)]"
            >
              {near && <SafeImage
                src={panel.flat.src}
                alt={live ? panel.flat.alt : ""}
                fill
                sizes={SIZES}
                className={cn(
                  "object-cover transition-opacity duration-700 ease-[var(--ease-rake)]",
                  live ? "opacity-100 brightness-[0.46] saturate-[0.85]" : "opacity-0",
                )}
              />}
              {near && <SafeImage
                src={panel.raking.src}
                alt={panel.raking.alt}
                fill
                sizes={SIZES}
                className={cn("object-cover", live && "brightness-[1.1] contrast-[1.12]")}
                style={live ? maskStyle : undefined}
              />}
              {live && (
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 mix-blend-screen"
                  style={glowStyle}
                />
              )}
              <figcaption className="absolute bottom-0 left-0 z-10 min-w-[9.5rem] border-r border-t border-white/10 bg-graphite px-4 pb-3 pt-2.5">
                <TitleCell label={panel.field}>{panel.label}</TitleCell>
              </figcaption>
              {index === 0 && (
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute right-3 top-3 z-10 hidden font-mono text-[0.625rem] uppercase leading-none tracking-[0.14em] text-plaster/80 group-has-[[data-rl-group]:focus-visible]/stage:block"
                >
                  ← ↑ ↓ →
                </span>
              )}
            </div>
            <RegistrationMarks />
          </figure>
        ))}

        {live && (
          <span
            ref={cursorRef}
            aria-hidden="true"
            data-on="false"
            className="pointer-events-none absolute left-0 top-0 z-30 hidden opacity-0 transition-opacity duration-200 data-[on=true]:opacity-100 pointer-fine:block"
            style={{ transform: "translate3d(-200px, -200px, 0)" }}
          >
            <LampGlyph size="cursor" />
          </span>
        )}
      </div>

      <div className="mt-8 grid gap-x-[var(--gutter)] gap-y-5 md:mt-10 md:grid-cols-12 md:items-end">
        {live ? (
          <p className="t-spec flex min-h-11 items-center gap-3 md:col-span-6 lg:col-span-5">
            <LampGlyph />
            <span className="pointer-coarse:hidden group-has-[[data-rl-group]:focus-visible]/stage:hidden">
              {instructionDesktop}
            </span>
            <span className="hidden pointer-coarse:inline group-has-[[data-rl-group]:focus-visible]/stage:hidden">
              {instructionTouch}
            </span>
            <span id={hintId} className="hidden text-[color:var(--ink)] group-has-[[data-rl-group]:focus-visible]/stage:inline">
              {instructionKeyboard}
            </span>
          </p>
        ) : (
          <span aria-hidden="true" className="hidden md:col-span-6 md:block lg:col-span-5" />
        )}
        <p
          id={captionId}
          className="t-h3 text-[color:var(--ink)] md:col-span-6 md:text-right lg:col-span-7"
        >
          {caption}
        </p>
      </div>
    </div>
  );
}

/** next/image that disappears (instead of showing a broken-image icon) while its file is missing. */
function SafeImage({ alt, ...props }: ImageProps) {
  return (
    <Image
      {...props}
      alt={alt}
      onError={(e) => {
        e.currentTarget.style.visibility = "hidden";
      }}
    />
  );
}

/** The work light: an amber lamp with a horizontal beam plane (it grazes the wall from the left). */
function LampGlyph({ size = "inline" }: { size?: "inline" | "cursor" }) {
  if (size === "cursor") {
    return (
      <span className="relative block">
        <span className="absolute left-0 top-0 size-28 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgb(244_166_42/0.3),rgb(244_166_42/0.08)_42%,transparent_68%)] mix-blend-screen" />
        <span className="absolute left-0 top-0 h-px w-16 -translate-y-1/2 bg-[linear-gradient(90deg,rgb(244_166_42/0.9),transparent)]" />
        <span className="absolute left-0 top-0 h-px w-6 -translate-x-full -translate-y-1/2 bg-[linear-gradient(270deg,rgb(244_166_42/0.6),transparent)]" />
        <span className="absolute left-0 top-0 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-worklight shadow-[0_0_14px_5px_rgb(244_166_42/0.55)] ring-2 ring-graphite/60" />
      </span>
    );
  }
  return (
    <span aria-hidden="true" className="relative inline-flex size-4 shrink-0 items-center justify-center">
      <span className="absolute size-4 rounded-full bg-[radial-gradient(circle,rgb(244_166_42/0.45),transparent_70%)]" />
      <span className="relative size-1.5 rounded-full bg-worklight" />
      <span className="absolute left-1/2 top-1/2 h-px w-5 -translate-y-1/2 bg-[linear-gradient(90deg,rgb(244_166_42/0.8),transparent)]" />
    </span>
  );
}
