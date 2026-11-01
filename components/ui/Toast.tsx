"use client";

import { AnimatePresence, LazyMotion, MotionConfig, domAnimation, m } from "motion/react";
import { useEffect, useRef, useSyncExternalStore, type Ref } from "react";
import { cn } from "@/lib/utils";
import { TickIcon } from "./icons";

export type ToastTone = "info" | "success" | "error";

export type ToastOptions = {
  title: string;
  body?: string;
  tone?: ToastTone;
  /** Milliseconds before auto-dismiss (default 5000). Hover or focus pauses the clock. */
  duration?: number;
  /** Pass a stable id to replace an existing toast instead of stacking a new one */
  id?: string;
};

type ToastItem = { id: string; title: string; body?: string; tone: ToastTone; duration: number };

/* ── Store: a tiny subscribe/emit module, no context needed ─────────────── */
const DEFAULT_DURATION = 5000;
const MAX_VISIBLE = 3;
const EMPTY: ToastItem[] = [];
let queue: ToastItem[] = EMPTY;
let seq = 0;
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}
function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
const getSnapshot = () => queue;
const getServerSnapshot = () => EMPTY;

/** Show a toast. Returns its id. Mount <ToastRegion /> once for toasts to appear. */
export function toast(options: ToastOptions): string {
  const id = options.id ?? `toast-${++seq}`;
  const item: ToastItem = {
    id,
    title: options.title,
    body: options.body,
    tone: options.tone ?? "info",
    duration: options.duration ?? DEFAULT_DURATION,
  };
  queue = [...queue.filter((t) => t.id !== id), item].slice(-MAX_VISIBLE);
  emit();
  return id;
}

export function dismissToast(id: string) {
  const next = queue.filter((t) => t.id !== id);
  if (next.length === queue.length) return;
  queue = next;
  emit();
}

export function clearToasts() {
  if (queue.length === 0) return;
  queue = EMPTY;
  emit();
}

/* ── Region ─────────────────────────────────────────────────────────────── */

/**
 * Polite live region for toasts. Mount once (layout or the page that needs it). Bottom-left on
 * desktop; full width at the bottom on mobile, sitting above the mobile action bar.
 */
export function ToastRegion({ className }: { className?: string }) {
  const toasts = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return (
    <section
      aria-label="Notifications"
      aria-live="polite"
      aria-relevant="additions text"
      className={cn(
        "pointer-events-none fixed inset-x-0 z-[70] px-[var(--page-pad)]",
        "bottom-[calc(var(--action-bar-h)+env(safe-area-inset-bottom)+0.75rem)]",
        "md:inset-x-auto md:bottom-6 md:left-6 md:w-[24rem] md:px-0",
        className,
      )}
    >
      <LazyMotion features={domAnimation} strict>
        <MotionConfig reducedMotion="user">
          <ol className="flex flex-col gap-2">
            <AnimatePresence initial={false}>
              {toasts.map((t) => (
                <ToastRow key={t.id} item={t} />
              ))}
            </AnimatePresence>
          </ol>
        </MotionConfig>
      </LazyMotion>
    </section>
  );
}

type HoldReason = "hover" | "focus" | "hidden";

function ToastRow({ item }: { item: ToastItem }) {
  const timerRef = useRef<HTMLSpanElement>(null);
  const animRef = useRef<Animation | null>(null);
  const holds = useRef(new Set<HoldReason>());

  const hold = (reason: HoldReason, on: boolean) => {
    if (on) holds.current.add(reason);
    else holds.current.delete(reason);
    const anim = animRef.current;
    if (!anim || anim.playState === "finished") return;
    if (holds.current.size > 0) anim.pause();
    else anim.play();
  };

  useEffect(() => {
    const bar = timerRef.current;
    if (!bar || !Number.isFinite(item.duration) || item.duration <= 0) return;
    // The timer is the bar's own animation (Web Animations are not touched by the reduced-motion
    // CSS override), so the visual countdown and the dismissal can never drift apart.
    const anim = bar.animate([{ transform: "scaleX(1)" }, { transform: "scaleX(0)" }], {
      duration: item.duration,
      easing: "linear",
      fill: "forwards",
    });
    animRef.current = anim;
    if (holds.current.size > 0) anim.pause();
    anim.finished.then(() => dismissToast(item.id)).catch(() => {});

    const onVisibility = () => {
      if (document.hidden) holds.current.add("hidden");
      else holds.current.delete("hidden");
      if (anim.playState === "finished") return;
      if (holds.current.size > 0) anim.pause();
      else anim.play();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      anim.cancel();
      animRef.current = null;
    };
  }, [item.id, item.duration]);

  return (
    <m.li
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -28, transition: { duration: 0.2, ease: [0.4, 0, 1, 1] } }}
      transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
      className="pointer-events-auto"
      onMouseEnter={() => hold("hover", true)}
      onMouseLeave={() => hold("hover", false)}
      onFocus={() => hold("focus", true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) hold("focus", false);
      }}
    >
      <ToastCard
        title={item.title}
        body={item.body}
        tone={item.tone}
        onDismiss={() => dismissToast(item.id)}
        timerRef={timerRef}
      />
    </m.li>
  );
}

/* ── Card (presentational; also used statically in the kitchen sink) ────── */

const accent: Record<ToastTone, string> = {
  info: "bg-steel",
  success: "bg-level",
  error: "bg-alert",
};
const srPrefix: Record<ToastTone, string> = {
  info: "",
  success: "Success: ",
  error: "Error: ",
};

type ToastCardProps = {
  title: string;
  body?: string;
  tone?: ToastTone;
  onDismiss?: () => void;
  /** The countdown hairline; the live region drives it */
  timerRef?: Ref<HTMLSpanElement>;
  /** Static countdown position 0–1 for screenshots (kitchen sink) */
  progress?: number;
  className?: string;
};

export function ToastCard({ title, body, tone = "info", onDismiss, timerRef, progress, className }: ToastCardProps) {
  return (
    <div
      className={cn(
        "surface-light relative flex items-start gap-3 overflow-hidden rounded-[2px] border border-[color:var(--hairline)] py-3.5 pl-4",
        onDismiss ? "pr-1" : "pr-4",
        "shadow-[0_14px_30px_-16px_color-mix(in_srgb,var(--color-graphite)_45%,transparent),0_1px_3px_color-mix(in_srgb,var(--color-graphite)_14%,transparent)]",
        className,
      )}
    >
      <span aria-hidden="true" className={cn("absolute inset-y-0 left-0 w-[3px]", accent[tone])} />
      <ToneMark tone={tone} />
      <div className="min-w-0 flex-1 pt-px">
        <p className="text-[0.9375rem] font-medium leading-snug text-[color:var(--ink)]">
          {srPrefix[tone] && <span className="sr-only">{srPrefix[tone]}</span>}
          {title}
        </p>
        {body && <p className="mt-1 text-[0.875rem] leading-snug text-[color:var(--ink)]/80">{body}</p>}
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss notification"
          className="-my-2 inline-flex size-11 shrink-0 items-center justify-center rounded-[2px] text-[color:var(--muted)] transition-colors duration-200 hover:bg-[color:color-mix(in_srgb,var(--ink)_6%,transparent)] hover:text-[color:var(--ink)] active:bg-[color:color-mix(in_srgb,var(--ink)_11%,transparent)]"
        >
          <svg viewBox="0 0 14 14" width={13} height={13} fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden="true" focusable="false">
            <path d="m2 2 10 10M12 2 2 12" />
          </svg>
        </button>
      )}
      <span
        ref={timerRef}
        aria-hidden="true"
        className="absolute bottom-0 left-0 h-px w-full origin-left bg-[color:var(--ink)]/30 motion-reduce:opacity-0"
        style={progress !== undefined ? { transform: `scaleX(${Math.min(1, Math.max(0, progress))})` } : undefined}
      />
    </div>
  );
}

function ToneMark({ tone }: { tone: ToastTone }) {
  if (tone === "success") {
    return (
      <span aria-hidden="true" className="mt-0.5 flex size-5 shrink-0 items-center justify-center border border-level text-level">
        <TickIcon size={12} />
      </span>
    );
  }
  if (tone === "error") {
    return (
      <span aria-hidden="true" className="mt-0.5 flex size-5 shrink-0 items-center justify-center border border-alert text-alert">
        <svg viewBox="0 0 12 12" width={12} height={12} fill="none" stroke="currentColor" strokeWidth={1.6} focusable="false">
          <path d="M6 2.25v4.5" />
          <path d="M6 9v.75" strokeLinecap="square" />
        </svg>
      </span>
    );
  }
  return (
    <span aria-hidden="true" className="mt-0.5 flex size-5 shrink-0 items-center justify-center border border-steel text-steel-ink">
      <svg viewBox="0 0 12 12" width={12} height={12} fill="none" stroke="currentColor" strokeWidth={1.6} focusable="false">
        <path d="M6 2.25V3" strokeLinecap="square" />
        <path d="M6 5.25v4.5" />
      </svg>
    </span>
  );
}
