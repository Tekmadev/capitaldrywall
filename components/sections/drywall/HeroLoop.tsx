"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { RegistrationMarks } from "@/components/ui/drafting";
import { observeInView } from "@/lib/inview";
import { cn } from "@/lib/utils";

type HeroLoopProps = {
  mp4: string;
  webm: string;
  poster: string;
  width: number;
  height: number;
  /** Figure number, e.g. "01" */
  fig: string;
  caption: string;
  className?: string;
};

const noopSubscribe = () => () => {};

/**
 * The drywall hero's raking-light loop, framed like a figure on a drawing sheet. Muted, looping and
 * inline; it only plays on its own when motion is allowed and it is on screen (preload is metadata,
 * so nothing heavy loads before that). A pause/play control satisfies WCAG 2.2.2, and with reduced
 * motion the poster stays still until the viewer presses play.
 */
export function HeroLoop({ mp4, webm, poster, width, height, fig, caption, className }: HeroLoopProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const held = useRef(false); // paused by the viewer (or by reduced motion)
  const [playing, setPlaying] = useState(false);
  const hydrated = useSyncExternalStore(noopSubscribe, () => true, () => false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = true;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduce.matches) held.current = true;

    // Reduced motion switched on mid-visit: stop and stay still until the viewer presses play.
    const onReduceChange = () => {
      if (!reduce.matches) return;
      held.current = true;
      video.pause();
    };
    reduce.addEventListener("change", onReduceChange);

    const stop = observeInView(
      video,
      (entry) => {
        if (entry.isIntersecting) {
          if (!held.current) video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      { rootMargin: "0px", threshold: 0.2 },
    );
    return () => {
      reduce.removeEventListener("change", onReduceChange);
      stop();
      video.pause();
    };
  }, []);

  const toggle = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      held.current = false;
      video.play().catch(() => {});
    } else {
      held.current = true;
      video.pause();
    }
  };

  return (
    <figure className={cn("relative", className)}>
      <div
        className="relative overflow-hidden bg-[color:var(--surface-raised)]"
        style={{ aspectRatio: "4 / 3" }}
      >
        <video
          ref={videoRef}
          className="absolute inset-0 size-full object-cover object-[28%_50%]"
          width={width}
          height={height}
          poster={poster}
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden="true"
          tabIndex={-1}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
        >
          <source src={webm} type="video/webm" />
          <source src={mp4} type="video/mp4" />
        </video>
      </div>
      <RegistrationMarks />
      <figcaption className="dw-keep mt-3 flex min-h-11 flex-wrap items-center justify-between gap-x-4">
        <span className="t-spec flex min-w-0 flex-[1_1_15rem] items-center gap-3 py-2">
          <span className="whitespace-nowrap tabular-nums">FIG. {fig}</span>
          <span aria-hidden="true" className="h-px w-6 shrink-0 bg-current/50" />
          <span>{caption}</span>
        </span>
        {hydrated && (
          <button
            type="button"
            onClick={toggle}
            aria-label={playing ? "Pause the raking-light video" : "Play the raking-light video"}
            className="t-spec group/loop -mr-2 inline-flex min-h-11 shrink-0 items-center gap-2.5 px-2 text-[color:var(--ink)] transition-colors duration-200 hover:text-worklight"
          >
            <span aria-hidden="true" className="flex h-3 w-3 items-center justify-center">
              {playing ? (
                <span className="flex h-2.5 gap-[3px]">
                  <span className="w-[2px] bg-current" />
                  <span className="w-[2px] bg-current" />
                </span>
              ) : (
                <svg viewBox="0 0 10 10" width={10} height={10} aria-hidden="true" focusable="false">
                  <path d="M2 1 9 5 2 9Z" fill="currentColor" />
                </svg>
              )}
            </span>
            <span aria-hidden="true">{playing ? "Pause" : "Play"}</span>
          </button>
        )}
      </figcaption>
    </figure>
  );
}
