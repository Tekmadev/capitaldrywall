"use client";

import Image from "next/image";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { RegistrationMarks } from "@/components/ui/drafting";
import { SampleBadge } from "@/components/ui/MediaFrame";
import { projectCaption, type Project } from "@/content/projects";
import { isDemo } from "@/content/site.config";
import { observeInView, prefersReducedMotion, useNearViewport } from "@/lib/inview";
import { cn } from "@/lib/utils";

type Variant = "full" | "thumb";
/** Kitchen-sink only: pin a visual state for static screenshots. */
type DemoState = "hover" | "dragging" | "focus";
type Glide = "none" | "key" | "jump";

export type BeforeAfterSliderProps = {
  project: Project;
  /** full (default): 4:3, title-block labels, caption. thumb: compact, smaller labels, no caption. */
  variant?: Variant;
  /** next/image sizes for the frame's rendered width. Be accurate; defaults are generic. */
  sizes?: string;
  /** Starting split, as % of the frame showing the after photo (default 50) */
  initial?: number;
  /** One gentle nudge (initial → +12% → back) the first time it is well in view. Never with reduced motion. */
  intro?: boolean;
  /** Figure number for the caption: 3 → "FIG. 03" (full variant) */
  fig?: number | string;
  /** Caption text; defaults to projectCaption(project). false hides it. */
  caption?: string | false;
  /** CSS aspect-ratio of the frame (default "4 / 3") */
  ratio?: string;
  /** Registration marks on the frame corners (default true) */
  marks?: boolean;
  /** Above-the-fold only */
  preload?: boolean;
  quality?: 60 | 75 | 85;
  /** No intro and no transitions (kitchen-sink screenshots) */
  forceStatic?: boolean;
  /** Kitchen-sink only: render a hover / dragging / focus look without interaction */
  demoState?: DemoState;
  className?: string;
};

const clamp = (v: number) => Math.min(100, Math.max(0, v));
const easeOut = (t: number) => 1 - (1 - t) ** 3;
const easeInOut = (t: number) => (t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2);

type Drag = {
  id: number;
  touch: boolean;
  x0: number;
  y0: number;
  left: number;
  width: number;
  active: boolean;
};

/**
 * Before/after comparison in the drawing-set language (brief §7.4). The after photo is revealed from
 * the left by a slim vertical light bar (a plaster line with a soft amber glow), as if the work light
 * has already passed over that part of the wall. Pointer and touch drag (vertical page scroll still
 * works), click/tap to jump, and a real keyboard slider (arrows ±2%, Shift ±10%, Page Up/Down,
 * Home/End). The reveal is a clip-path inset: no layout work while dragging.
 * Sample projects never render in production.
 */
export function BeforeAfterSlider({
  project,
  variant = "full",
  sizes,
  initial = 50,
  intro = true,
  fig,
  caption,
  ratio = "4 / 3",
  marks = true,
  preload = false,
  quality = 75,
  forceStatic = false,
  demoState,
  className,
}: BeforeAfterSliderProps) {
  const thumb = variant === "thumb";
  const start = clamp(initial);
  const [value, setValue] = useState(start);
  const [glide, setGlide] = useState<Glide>("none");
  const [dragging, setDragging] = useState(false);

  const frameRef = useRef<HTMLDivElement>(null);
  // Below-the-fold sliders mount their photos only when near the viewport (see useNearViewport).
  const near = useNearViewport(frameRef);
  const showImages = preload || near;
  const handleRef = useRef<HTMLDivElement>(null);
  const drag = useRef<Drag | null>(null);
  const introRaf = useRef<number | null>(null);
  const touched = useRef(false);
  const startRef = useRef(start);

  const before = project.before;
  const after = project.after;
  const hidden = !before || ((project.isSample || before.kind === "sample" || after.kind === "sample") && !isDemo);
  const isSample = project.isSample || before?.kind === "sample" || after.kind === "sample";

  const imgSizes =
    sizes ??
    (thumb
      ? "(min-width: 1440px) 560px, (min-width: 768px) 45vw, calc(100vw - 40px)"
      : "(min-width: 1440px) 890px, (min-width: 768px) 62vw, calc(100vw - 40px)");

  // Images are memoised so dragging only touches the clip-path and the bar transform.
  const beforeImg = useMemo(
    () =>
      before ? (
        <Image
          src={before.src}
          alt={before.alt}
          fill
          sizes={imgSizes}
          quality={quality}
          preload={preload}
          loading={preload ? "eager" : "lazy"}
          draggable={false}
          className="object-cover"
        />
      ) : null,
    [before, imgSizes, quality, preload],
  );
  const afterImg = useMemo(
    () => (
      <Image
        src={after.src}
        alt={after.alt}
        fill
        sizes={imgSizes}
        quality={quality}
        preload={preload}
        loading={preload ? "eager" : "lazy"}
        draggable={false}
        className="object-cover"
      />
    ),
    [after, imgSizes, quality, preload],
  );

  /* Intro: the bar eases initial → +12% and back once, the first time the frame is well in view. */
  useEffect(() => {
    const el = frameRef.current;
    if (!el || hidden || !intro || forceStatic || prefersReducedMotion()) return;
    let timer: number | undefined;

    const run = () => {
      if (touched.current) return;
      const from = startRef.current;
      const peak = Math.min(100, from + 12);
      const duration = 1700;
      let t0 = 0;
      const step = (t: number) => {
        if (touched.current) return;
        if (!t0) t0 = t;
        const p = Math.min(1, (t - t0) / duration);
        const v =
          p < 0.42
            ? from + (peak - from) * easeOut(p / 0.42)
            : p < 0.56
              ? peak
              : peak - (peak - from) * easeInOut((p - 0.56) / 0.44);
        setGlide("none");
        setValue(v);
        introRaf.current = p < 1 ? requestAnimationFrame(step) : null;
      };
      introRaf.current = requestAnimationFrame(step);
    };

    const stop = observeInView(
      el,
      (entry) => {
        if (!entry.isIntersecting || entry.intersectionRatio < 0.55) return;
        stop();
        timer = window.setTimeout(run, 350);
      },
      { threshold: 0.6, rootMargin: "0px" },
    );

    return () => {
      stop();
      window.clearTimeout(timer);
      if (introRaf.current !== null) cancelAnimationFrame(introRaf.current);
      introRaf.current = null;
    };
  }, [hidden, intro, forceStatic]);

  if (hidden || !before) return null;

  const takeOver = () => {
    touched.current = true;
    if (introRaf.current !== null) cancelAnimationFrame(introRaf.current);
    introRaf.current = null;
  };

  const fromX = (clientX: number, d: Pick<Drag, "left" | "width">) =>
    clamp(((clientX - d.left) / Math.max(1, d.width)) * 100);

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const touch = e.pointerType === "touch";
    takeOver();
    drag.current = {
      id: e.pointerId,
      touch,
      x0: e.clientX,
      y0: e.clientY,
      left: rect.left,
      width: rect.width,
      active: !touch,
    };
    // Touch waits to see whether the gesture is a horizontal drag, a tap, or a page scroll.
    if (touch) return;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Pointer already released (or synthetic): the drag still works while over the frame.
    }
    handleRef.current?.focus({ preventScroll: true });
    setGlide("jump");
    setValue(fromX(e.clientX, drag.current));
    setDragging(true);
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    if (!d.active) {
      const dx = e.clientX - d.x0;
      const dy = e.clientY - d.y0;
      if (Math.abs(dx) < 6 || Math.abs(dx) <= Math.abs(dy)) return;
      d.active = true;
      setDragging(true);
    }
    setGlide("none");
    setValue(fromX(e.clientX, d));
  };

  const endDrag = () => {
    drag.current = null;
    setDragging(false);
  };

  const onPointerUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    if (d.touch && !d.active && Math.hypot(e.clientX - d.x0, e.clientY - d.y0) < 10) {
      // A tap jumps the light to that spot.
      setGlide("jump");
      setValue(fromX(e.clientX, d));
    }
    endDrag();
  };

  const onKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    const small = e.shiftKey ? 10 : 2;
    let next: number | null = null;
    switch (e.key) {
      case "ArrowRight":
      case "ArrowUp":
        next = value + small;
        break;
      case "ArrowLeft":
      case "ArrowDown":
        next = value - small;
        break;
      case "PageUp":
        next = value + 10;
        break;
      case "PageDown":
        next = value - 10;
        break;
      case "Home":
        next = 0;
        break;
      case "End":
        next = 100;
        break;
      default:
        return;
    }
    e.preventDefault();
    takeOver();
    setGlide("key");
    setValue(clamp(Math.round(next)));
  };

  const pct = Math.round(value);
  const active = dragging || demoState === "dragging";
  const moveTransition =
    forceStatic || glide === "none"
      ? ""
      : glide === "key"
        ? "duration-150 ease-[var(--ease-rake)]"
        : "duration-[420ms] ease-[var(--ease-rake)]";
  // Keep the grip (and its focus ring) inside the frame at the extremes.
  const gripInset = thumb ? 18 : 22;
  const text = caption === false || thumb ? null : (caption ?? projectCaption(project));
  const figLabel = fig !== undefined && !thumb ? `FIG. ${String(fig).padStart(2, "0")}` : null;

  return (
    <figure className={cn("relative", className)} data-variant={variant}>
      <div className="relative">
        <div
          ref={frameRef}
          data-dragging={active ? "" : undefined}
          data-demo={demoState}
          className={cn(
            "group/ba relative cursor-ew-resize touch-pan-y select-none overflow-hidden bg-[color:var(--surface-raised)] [-webkit-tap-highlight-color:transparent] [-webkit-touch-callout:none]",
          )}
          style={{ aspectRatio: ratio }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={endDrag}
          onLostPointerCapture={endDrag}
        >
          {/* BEFORE: the whole frame underneath */}
          <div className="absolute inset-0">
            {showImages && beforeImg}
            <StateCell side="before" compact={thumb} />
          </div>

          {/* AFTER: revealed from the left edge up to the light bar */}
          <div
            className={cn("absolute inset-0", moveTransition && "transition-[clip-path]", moveTransition)}
            style={{ clipPath: `inset(0 ${100 - value}% 0 0)` }}
          >
            {showImages && afterImg}
            <StateCell side="after" compact={thumb} />
          </div>

          {/* Ruler ticks along the bottom edge (every 10%), surfaced on hover, focus and drag */}
          {!thumb && (
            <span
              aria-hidden="true"
              className={cn(
                "pointer-events-none absolute inset-x-0 bottom-0 h-2 opacity-0 transition-opacity duration-200",
                "bg-[repeating-linear-gradient(90deg,color-mix(in_srgb,var(--color-plaster)_70%,transparent)_0_1px,transparent_1px_10%)]",
                "group-hover/ba:opacity-100 group-has-[:focus-visible]/ba:opacity-100 group-data-[dragging]/ba:opacity-100 group-data-[demo]/ba:opacity-100",
              )}
            />
          )}

          {/* The light bar */}
          <div
            aria-hidden="true"
            className={cn("pointer-events-none absolute inset-0 z-10", moveTransition && "transition-transform", moveTransition)}
            style={{ transform: `translateX(${value}%)` }}
          >
            <span
              className={cn(
                "absolute inset-y-0 left-0 -translate-x-1/2 opacity-60 transition-opacity duration-200",
                thumb ? "w-10" : "w-20",
                "bg-[linear-gradient(90deg,transparent,color-mix(in_srgb,var(--color-worklight)_14%,transparent)_38%,color-mix(in_srgb,var(--color-worklight)_34%,transparent)_50%,color-mix(in_srgb,var(--color-worklight)_14%,transparent)_62%,transparent)]",
                "group-hover/ba:opacity-100 group-has-[:focus-visible]/ba:opacity-100 group-data-[dragging]/ba:opacity-100 group-data-[demo]/ba:opacity-100",
              )}
            />
            <span
              className={cn(
                "absolute inset-y-0 left-0 w-0.5 -translate-x-1/2 bg-plaster",
                "shadow-[0_0_0_1px_color-mix(in_srgb,var(--color-graphite)_16%,transparent),0_0_14px_2px_color-mix(in_srgb,var(--color-worklight)_55%,transparent)]",
              )}
            />
          </div>

          {/* Grip: the focusable slider control */}
          <div
            className={cn("pointer-events-none absolute inset-0 z-20", moveTransition && "transition-transform", moveTransition)}
            style={{ transform: `translateX(clamp(${gripInset}px, ${value}%, calc(100% - ${gripInset}px)))` }}
          >
            <div
              ref={handleRef}
              role="slider"
              tabIndex={0}
              aria-label={`Before and after: ${project.title}`}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={pct}
              aria-valuetext={`Showing ${pct}% after`}
              aria-orientation="horizontal"
              onKeyDown={onKeyDown}
              className={cn(
                "pointer-events-auto absolute left-0 top-1/2 flex -translate-x-1/2 -translate-y-1/2 cursor-grab items-center justify-center rounded-[2px] border border-plaster/35 bg-graphite/85 text-plaster backdrop-blur-[2px]",
                "transition-[background-color,border-color,color] duration-200 ease-[var(--ease-rake)]",
                // Keep the graphite band under the amber ring on every surface: the grip sits on photos.
                "focus-visible:shadow-[0_0_0_3px_var(--color-graphite)]",
                thumb ? "h-9 w-6" : "h-12 w-8",
                // Light comes from the left: hover brightens the grip's left edge.
                "group-hover/ba:border-l-worklight group-data-[demo=hover]/ba:border-l-worklight",
                "group-data-[dragging]/ba:cursor-grabbing group-data-[dragging]/ba:border-worklight group-data-[dragging]/ba:bg-worklight group-data-[dragging]/ba:text-graphite",
                demoState === "focus" &&
                  "outline-2 outline-offset-[3px] outline-worklight [outline-style:solid] shadow-[0_0_0_3px_var(--color-graphite)]",
              )}
            >
              <svg
                viewBox="0 0 14 10"
                width={thumb ? 10 : 13}
                height={thumb ? 8 : 10}
                fill="none"
                stroke="currentColor"
                strokeWidth={1.4}
                aria-hidden="true"
                focusable="false"
              >
                <path d="M4.5 1 1 5l3.5 4M9.5 1 13 5l-3.5 4" strokeLinecap="square" />
              </svg>
            </div>
          </div>

          {isSample && (
            <SampleBadge
              className={cn(
                "z-30",
                thumb
                  ? "bottom-2 left-2 px-2 py-1 text-[0.5625rem] tracking-[0.08em]"
                  : "text-[0.5625rem] tracking-[0.08em] sm:text-[0.625rem] sm:tracking-[0.12em]",
              )}
            />
          )}
        </div>
        {marks && <RegistrationMarks inset={thumb ? -6 : -10} />}
      </div>

      {(figLabel || text) && (
        <figcaption className="t-spec mt-4 flex items-start gap-3">
          {figLabel && <span className="shrink-0 tabular-nums">{figLabel}</span>}
          {figLabel && text && <span aria-hidden="true" className="mt-[0.7em] h-px w-6 shrink-0 bg-current/50" />}
          {text && <span className="min-w-0">{text}</span>}
        </figcaption>
      )}
    </figure>
  );
}

/** Mono BEFORE / AFTER label set in a small title-block cell; it rides in its own photo layer. */
function StateCell({ side, compact }: { side: "before" | "after"; compact: boolean }) {
  const isBefore = side === "before";
  return (
    <span
      aria-hidden="true"
      className={cn(
        "absolute z-10 flex items-stretch border border-plaster/20 bg-graphite/80 font-mono font-medium uppercase leading-none text-plaster backdrop-blur-[2px]",
        compact ? "top-2" : "top-3",
        isBefore ? (compact ? "right-2" : "right-3") : compact ? "left-2" : "left-3",
      )}
    >
      {!compact && (
        <span className="flex items-center border-r border-plaster/20 px-2 text-[0.5625rem] tracking-[0.12em] text-steel-light tabular-nums">
          {isBefore ? "01" : "02"}
        </span>
      )}
      <span
        className={cn(
          "flex items-center",
          compact ? "px-1.5 py-1 text-[0.5625rem] tracking-[0.12em]" : "px-2.5 py-1.5 text-[0.625rem] tracking-[0.14em]",
        )}
      >
        {isBefore ? "Before" : "After"}
      </span>
    </span>
  );
}
