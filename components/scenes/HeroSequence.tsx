"use client";

import { Fragment, useEffect, useId, useRef, type CSSProperties, type ReactNode } from "react";
import { useReducedMotion } from "@/components/motion/useReducedMotion";
import { Button } from "@/components/ui/Button";
import { media, sequences } from "@/content/media";
import { afterLoadIdle, loadGsap, loadSplitText } from "@/lib/gsap";
import { observeInView } from "@/lib/inview";
import { cn } from "@/lib/utils";
import { FramePainter, FrameSequence, clamp01, evenStages, pickFolder, stageValue } from "./frame-engine";
import { ScenePoster } from "./ScenePoster";
import { SceneKeyframes, shade, splitArrow } from "./scene-utils";

export type HeroStage = { index: string; label: string };

/** Bold copy that builds word by word while the wall is finished: one entry per stage before the last. */
export type HeroStory = { title: string; stages: { line: string; body: string }[] };

export type HeroSequenceProps = {
  /** Small spec-style H1, e.g. "Drywall & Basement Renovations in Ottawa" */
  h1: string;
  /** The huge display line (rendered as a <p>) */
  display: string;
  sub: string;
  primaryCta: { label: string; href: string };
  call: { label: string; href: string };
  /** Mono trust line under the CTAs (shown from 768 px); `HeroTrustRow` builds the standard one */
  trustRow?: ReactNode;
  /** The five wall stages, e.g. { index: "02", label: "Joints taped" } */
  stages: HeroStage[];
  /** "Scroll to finish the wall ↓" */
  scrollCue: string;
  /** Optional stage copy (H2 + an H3 per stage) that rises in and out with the scrub */
  story?: HeroStory;
  /** Poster state only: no frames, no scroll scene (also what reduced motion and no-JS get) */
  forceStatic?: boolean;
  /** Dev preview: hold the scrubbed scene at this track progress (0–1) instead of following scroll */
  demoProgress?: number;
  /** Heading element for the H1 text (h2 only for previews on pages that already have an h1) */
  headingAs?: "h1" | "h2";
  id?: string;
  className?: string;
};

/** Track progress where the wall is finished and the headline starts to resolve (brief §7.1) */
const FRAMES_END = 0.85;
/** One-time rewind length, seconds */
const REWIND = 1.6;

/**
 * Home hero, "The Raking Light" (brief §7.1). First paint (also no-JS and reduced motion): the final
 * frame as the LCP poster with the headline block over it. After load, in idle time, the frames
 * stream in; once 30% are in and the visitor is still at the top, the track grows to 350vh / 220vh
 * and a 1.6 s rewind strips the finished wall back to bare board. Scrolling then finishes it again:
 * 0–85% scrubs the frames, 85–100% resolves the headline with a line-mask slide.
 */
export function HeroSequence({
  h1,
  display,
  sub,
  primaryCta,
  call,
  trustRow,
  stages,
  scrollCue,
  story,
  forceStatic = false,
  demoProgress,
  headingAs: Heading = "h1",
  id,
  className,
}: HeroSequenceProps) {
  const headingId = useId();
  const reduced = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);

  const last = stages.length - 1;
  const [cueText, cueArrow] = splitArrow(scrollCue);

  useEffect(() => {
    const els = sectionRef.current ? collect(sectionRef.current) : null;
    if (!els) return;

    // A stage taller than the viewport (very short phones) sticks by its bottom edge instead.
    const fit = () => {
      els.stage.style.top = `${Math.min(0, window.innerHeight - els.stage.offsetHeight)}px`;
    };
    const ro = new ResizeObserver(fit);
    ro.observe(els.stage);
    window.addEventListener("resize", fit, { passive: true });
    fit();

    let scene: { destroy: () => void } | null = null;
    let cancelIdle = () => {};
    if (!forceStatic && !reduced) {
      cancelIdle = afterLoadIdle(() => {
        scene = createHeroScene(els, { demoProgress });
      });
    }
    return () => {
      cancelIdle();
      scene?.destroy();
      ro.disconnect();
      window.removeEventListener("resize", fit);
      els.stage.style.top = "";
    };
  }, [forceStatic, reduced, demoProgress]);

  return (
    <section
      ref={sectionRef}
      id={id}
      aria-labelledby={headingId}
      data-hero="dark"
      data-phase="poster"
      data-headline="shown"
      className={cn("surface-dark group/hero relative overflow-clip", className)}
    >
      <SceneKeyframes />
      <noscript dangerouslySetInnerHTML={{ __html: "<style>[data-hero-track]{height:auto!important}</style>" }} />
      <div
        data-el="track"
        data-hero-track=""
        className="relative data-[armed]:h-[220vh] motion-reduce:data-[armed]:h-auto md:data-[armed]:h-[350vh] md:motion-reduce:data-[armed]:h-auto"
      >
        <div data-el="stage" className="sticky top-0 flex min-h-svh flex-col">
          {/* Media: poster (LCP), canvas, scrims. Fills the large viewport so a collapsing URL bar never shows an edge. */}
          <div className="absolute inset-x-0 top-0 h-[max(100%,100lvh)] overflow-hidden bg-graphite">
            <ScenePoster priority desktop={media.heroPosterDesktop} mobile={media.heroPosterMobile} />
            <canvas
              data-el="canvas"
              aria-hidden="true"
              className="absolute inset-0 size-full opacity-0 data-[live]:opacity-100"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0"
              style={{
                backgroundImage: `linear-gradient(180deg, ${shade(55)}, transparent 24%, transparent 68%, ${shade(72)})`,
              }}
            />
            <div
              aria-hidden="true"
              className="absolute inset-y-0 right-0 hidden w-1/5 md:block"
              style={{ backgroundImage: `linear-gradient(270deg, ${shade(45)}, transparent)` }}
            />
            <div data-el="scrim" aria-hidden="true" className="absolute inset-0">
              <div
                className="absolute inset-0 md:hidden"
                style={{
                  backgroundImage: `linear-gradient(0deg, ${shade(95)} 0%, ${shade(88)} 46%, ${shade(62)} 74%, ${shade(30)} 100%)`,
                }}
              />
              <div
                className="absolute inset-0 hidden md:block"
                style={{
                  backgroundImage: `linear-gradient(0deg, ${shade(50)}, transparent 40%), linear-gradient(90deg, ${shade(88)} 0%, ${shade(74)} 40%, ${shade(46)} 64%, ${shade(12)} 92%)`,
                }}
              />
            </div>
          </div>

          {/* Headline block */}
          <div className="site-container relative z-10 flex flex-1 flex-col justify-end pb-6 pt-[calc(var(--header-h)_+_2rem)] md:pb-4">
            <div
              data-el="headline"
              className="site-grid gap-y-5 data-[hidden]:pointer-events-none md:gap-y-7"
            >
              <div className="col-span-full flex items-start gap-3 md:col-span-9">
                <span
                  data-el="mark"
                  aria-hidden="true"
                  className="mt-[0.55em] h-px w-6 shrink-0 origin-left bg-worklight md:w-10"
                />
                <Heading data-el="h1" id={headingId} className="t-spec text-[color:var(--ink)]">
                  {h1}
                </Heading>
              </div>
              <p
                data-el="display"
                className="t-display-xl col-span-full text-[color:var(--ink)] md:col-span-11 lg:col-span-9"
                style={{ fontSize: "clamp(2.5rem, min(8vw, 13svh), 7.5rem)" }}
              >
                {display}
              </p>
              <p
                data-el="sub"
                className="t-lede col-span-full max-w-[52ch] text-[color:var(--ink)] md:col-span-8 lg:col-span-6"
              >
                {keepHyphenatedWhole(sub)}
              </p>
              <div data-el="cta" className="col-span-full flex flex-col gap-3 sm:flex-row sm:flex-wrap md:gap-4">
                <Button href={primaryCta.href} size="lg" arrow>
                  {primaryCta.label}
                </Button>
                <Button href={call.href} variant="call" size="lg" trackLocation="hero">
                  {call.label}
                </Button>
              </div>
              {trustRow ? (
                <div data-el="trust" className="col-span-full hidden md:block">
                  {trustRow}
                </div>
              ) : null}
            </div>

            {story && story.stages.length ? (
              <HeroStoryCopy story={story} stages={stages} />
            ) : null}
          </div>

          {/* Bottom bar: stage caption as a dimension string + scroll cue */}
          <div className="site-container relative z-10 pb-[max(1.25rem,env(safe-area-inset-bottom))] transition-opacity duration-300 group-data-[headline=shown]/hero:pointer-events-none group-data-[headline=shown]/hero:opacity-0 md:pb-7">
            {/* From 768 px the trust row lives in the headline, which is away while the wall is being
                finished. A copy holds its place, exactly where the headline's row resolves (no layout
                of its own), shown only while the bar is. The headline's row stays the accessible one. */}
            {trustRow ? (
              <div aria-hidden="true" className="absolute inset-x-0 bottom-full hidden px-[var(--page-pad)] pb-4 md:block">
                {trustRow}
              </div>
            ) : null}
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between md:gap-10">
              <ol data-el="captions" className="grid w-full max-w-[26rem]">
                {stages.map((stage, i) => (
                  <li
                    key={stage.index}
                    data-active={i === last ? "" : undefined}
                    className="col-start-1 row-start-1 flex items-center gap-2.5 text-[color:var(--ink)] opacity-0 transition-opacity duration-300 ease-[var(--ease-rake)] data-[active]:opacity-100"
                  >
                    <span aria-hidden="true" className="h-2.5 w-px shrink-0 bg-current/70" />
                    <span aria-hidden="true" className="h-px w-5 shrink-0 bg-current/45" />
                    <span className="t-spec whitespace-nowrap text-current tabular-nums">
                      {stage.index} — {stage.label}
                    </span>
                    <span aria-hidden="true" className="h-px min-w-6 flex-1 bg-current/45" />
                    <span aria-hidden="true" className="h-2.5 w-px shrink-0 bg-current/70" />
                  </li>
                ))}
              </ol>
              <p
                data-el="cue"
                aria-hidden="true"
                className="t-spec flex items-center gap-2 whitespace-nowrap text-[color:var(--ink)] opacity-0"
              >
                <span>{cueText}</span>
                {cueArrow ? (
                  <span className="inline-block motion-safe:animate-[cue-bob_1.8s_var(--ease-rake)_infinite]">
                    {cueArrow}
                  </span>
                ) : null}
              </p>
            </div>
          </div>

          {/* Progress rail: ticks 01–05 fill amber as the stages pass */}
          <div
            data-el="rail"
            aria-hidden="true"
            style={{ "--fill": 1 } as React.CSSProperties}
            className="pointer-events-none absolute right-[var(--page-pad)] top-[calc(var(--header-h)_+_1.5rem)] z-10 h-[min(30svh,15rem)] w-12 transition-opacity duration-300 max-md:group-data-[headline=shown]/hero:opacity-0 md:top-1/2 md:h-[min(46svh,26rem)] md:-translate-y-1/2"
          >
            <span className="absolute inset-y-0 right-0 w-px bg-plaster/25" />
            <span className="absolute inset-y-0 right-0 w-px origin-top scale-y-[var(--fill)] bg-worklight" />
            {stages.map((stage, i) => (
              <span
                key={stage.index}
                data-tick=""
                data-passed=""
                className="group/tick absolute right-0 flex -translate-y-1/2 items-center gap-2"
                style={{ top: `${(i / Math.max(1, last)) * 100}%` }}
              >
                <span className="font-mono text-[0.625rem] font-medium tracking-[0.14em] text-plaster/55 tabular-nums transition-colors duration-200 group-data-[passed]/tick:text-plaster">
                  {stage.index}
                </span>
                <span className="h-px w-3 bg-plaster/45 transition-colors duration-200 group-data-[passed]/tick:bg-worklight" />
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * SplitText assigns each word to the line where the word starts. A word the browser breaks at its
 * hyphen while measuring ("paint-" / "ready") lands whole on the first line and then overflows it, so
 * hyphenated words are kept unbreakable in text the hero splits into lines.
 */
function keepHyphenatedWhole(text: string): ReactNode {
  return text.split(/(\S+-\S+)/).map((part, i) =>
    i % 2 ? (
      <span key={i} className="whitespace-nowrap">
        {part}
      </span>
    ) : (
      part
    ),
  );
}

/**
 * Stage copy over the scrubbing wall. Server-rendered (crawlable H2 + H3s) and invisible until the
 * scene goes live; then each line's words rise in from their masks as its stage arrives and lift out
 * as the next one comes, driven by the --in / --out variables the scene writes on every frame
 * (see .hero-story-* in globals.css). Reduced motion: a static four-column strip under the headline.
 */
function HeroStoryCopy({ story, stages }: { story: HeroStory; stages: HeroStage[] }) {
  return (
    <div
      data-el="story"
      className="pointer-events-none absolute inset-x-[var(--page-pad)] bottom-6 opacity-0 transition-opacity duration-500 ease-[var(--ease-rake)] data-[live]:opacity-100 md:bottom-[4.75rem] motion-reduce:pointer-events-auto motion-reduce:static motion-reduce:mt-12 motion-reduce:opacity-100 md:motion-reduce:mt-16"
    >
      {/* Its own scrim: the headline's scrim is away while the wall is being finished. */}
      <div
        aria-hidden="true"
        className="absolute -bottom-28 -left-[var(--page-pad)] h-[calc(100%+16rem)] w-[min(100vw,72rem)] motion-reduce:hidden"
        style={{
          backgroundImage: `radial-gradient(130% 95% at 0% 100%, ${shade(94)}, ${shade(80)} 38%, ${shade(48)} 62%, transparent 82%)`,
        }}
      />
      <h2 className="t-spec relative flex items-center gap-3 text-[color:var(--ink)]">
        <span aria-hidden="true" className="h-px w-6 shrink-0 bg-worklight md:w-10" />
        {story.title}
      </h2>
      <ol className="relative mt-4 grid md:mt-5 motion-reduce:gap-8 md:motion-reduce:grid-cols-4 md:motion-reduce:gap-[var(--gutter)]">
        {story.stages.map((entry, k) => {
          const words = entry.line.split(" ");
          return (
            <li
              key={entry.line}
              data-story-line=""
              className="hero-story-line col-start-1 row-start-1 motion-reduce:col-auto motion-reduce:row-auto"
              style={{ "--n": words.length } as CSSProperties}
            >
              {stages[k] ? (
                <p className="t-spec mb-3 hidden tabular-nums motion-reduce:block">
                  {stages[k].index} — {stages[k].label}
                </p>
              ) : null}
              <h3 className="max-w-[13ch] font-display [text-shadow:0_2px_28px_rgb(20_21_24/0.55)] text-[clamp(2.25rem,5.2vw,4.5rem)] font-[800] leading-[0.98] tracking-[-0.02em] text-[color:var(--ink)] [font-stretch:125%] motion-reduce:text-[clamp(1.5rem,2.2vw,2rem)]">
                {words.map((word, i) => (
                  <Fragment key={i}>
                    <span className="hero-story-mask">
                      <span className="hero-story-word" style={{ "--i": i } as CSSProperties}>
                        {word}
                      </span>
                    </span>
                    {i < words.length - 1 ? " " : null}
                  </Fragment>
                ))}
              </h3>
              <p className="hero-story-body mt-3 max-w-[36ch] text-[0.9375rem] leading-relaxed text-plaster/85 md:mt-4 md:text-base">
                {entry.body}
              </p>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

/** The trust items as one mono dimension string: ├─ FREE ON-SITE QUOTES ─┼─ FULLY INSURED ─┤ */
export function HeroTrustRow({ items, className }: { items: string[]; className?: string }) {
  return (
    <ul className={cn("t-spec flex flex-wrap items-center gap-y-2 text-[color:var(--ink)]", className)}>
      {items.map((item, i) => (
        <li key={item} className="flex items-center">
          {i === 0 && <span aria-hidden="true" className="h-2.5 w-px bg-current/60" />}
          <span aria-hidden="true" className="mx-2.5 h-px w-4 bg-current/40" />
          <span className="whitespace-nowrap">{item}</span>
          <span aria-hidden="true" className="mx-2.5 h-px w-4 bg-current/40" />
          <span aria-hidden="true" className="h-2.5 w-px bg-current/60" />
        </li>
      ))}
    </ul>
  );
}

/* ── Scene (client, after load) ───────────────────────────────────────── */

type HeroEls = {
  section: HTMLElement;
  track: HTMLElement;
  stage: HTMLElement;
  canvas: HTMLCanvasElement;
  scrim: HTMLElement;
  headline: HTMLElement;
  mark: HTMLElement;
  h1: HTMLElement;
  display: HTMLElement;
  sub: HTMLElement;
  cta: HTMLElement;
  trust: HTMLElement | null;
  captions: HTMLLIElement[];
  cue: HTMLElement;
  rail: HTMLElement;
  ticks: HTMLElement[];
  story: HTMLElement | null;
  storyLines: HTMLElement[];
};

function collect(section: HTMLElement): HeroEls | null {
  const get = <T extends HTMLElement = HTMLElement>(name: string) =>
    section.querySelector<T>(`[data-el="${name}"]`);
  const required = ["track", "stage", "canvas", "scrim", "headline", "mark", "h1", "display", "sub", "cta", "captions", "cue", "rail"];
  if (required.some((name) => !get(name))) return null;
  const rail = get("rail")!;
  return {
    section,
    track: get("track")!,
    stage: get("stage")!,
    canvas: get<HTMLCanvasElement>("canvas")!,
    scrim: get("scrim")!,
    headline: get("headline")!,
    mark: get("mark")!,
    h1: get("h1")!,
    display: get("display")!,
    sub: get("sub")!,
    cta: get("cta")!,
    trust: get("trust"),
    captions: Array.from(get("captions")!.querySelectorAll("li")),
    cue: get("cue")!,
    rail,
    ticks: Array.from(rail.querySelectorAll<HTMLElement>("[data-tick]")),
    story: get("story"),
    storyLines: Array.from(section.querySelectorAll<HTMLElement>("[data-story-line]")),
  };
}

function createHeroScene(els: HeroEls, { demoProgress }: { demoProgress?: number }) {
  const folder = pickFolder({ desktop: sequences.heroDesktop, mobile: sequences.heroMobile });
  const seq = new FrameSequence(folder);
  const demo = typeof demoProgress === "number";
  let disposed = false;
  let phase: "poster" | "arming" | "rewind" | "scrub" = "poster";
  let painter: FramePainter | null = null;
  let visible = true;
  let progress = 0;
  let focusHold = false;
  let activeStage = -1;
  let marks: number[] = [];
  let ctx: gsap.Context | null = null;
  let resolveTl: gsap.core.Timeline | null = null;
  let rewind: gsap.core.Timeline | null = null;
  const offs: Array<() => void> = [];

  offs.push(
    observeInView(
      els.section,
      (entry) => {
        visible = entry.isIntersecting;
        painter?.setVisible(visible);
      },
      { rootMargin: "20% 0px" },
    ),
  );

  const frameCount = () => seq.frameCount;
  const atStart = () => {
    const top = els.section.getBoundingClientRect().top;
    return top > -8 && top < Math.max(8, window.innerHeight * 0.3);
  };

  function setStage(s: number) {
    const n = els.captions.length;
    const active = Math.min(n - 1, Math.max(0, Math.round(s)));
    if (active !== activeStage) {
      activeStage = active;
      els.captions.forEach((li, i) => li.toggleAttribute("data-active", i === active));
    }
    els.rail.style.setProperty("--fill", (s / Math.max(1, n - 1)).toFixed(4));
    els.ticks.forEach((tick, i) => tick.toggleAttribute("data-passed", s >= i - 0.02));
  }

  /**
   * Stage copy: line k builds in as stage k arrives (s ≈ k-0.42 → k-0.08) and lifts out halfway to the
   * next (k+0.42 → k+0.70); the last line holds until the wall is finished. Words stagger in CSS.
   */
  function setStory(s: number) {
    const lines = els.storyLines;
    lines.forEach((line, k) => {
      const inValue = clamp01((s - k + 0.42) / 0.34);
      const outValue = k === lines.length - 1 ? clamp01((s - k - 0.75) / 0.25) : clamp01((s - k - 0.42) / 0.28);
      line.style.setProperty("--in", inValue.toFixed(3));
      line.style.setProperty("--out", outValue.toFixed(3));
    });
  }

  function showFrame(f: number) {
    painter?.setFrame(f);
    const s = stageValue(f, marks, frameCount());
    setStage(s);
    setStory(s);
  }

  function setHeadlineShown(shown: boolean) {
    const value = shown ? "shown" : "hidden";
    if (els.section.dataset.headline !== value) els.section.dataset.headline = value;
    els.headline.toggleAttribute("data-hidden", !shown);
  }

  function render(p: number) {
    const n = frameCount();
    if (!n) return;
    showFrame(clamp01(p / FRAMES_END) * (n - 1));
    const reveal = focusHold ? 1 : clamp01((p - FRAMES_END) / (1 - FRAMES_END));
    if (resolveTl && Math.abs(resolveTl.progress() - reveal) > 0.0005) resolveTl.progress(reveal);
    els.cue.style.opacity = (1 - clamp01(p / 0.05)).toFixed(3);
    setHeadlineShown(reveal > 0.5);
    // Hand over to the headline the moment it starts resolving, so the two never overlap.
    els.story?.toggleAttribute("data-live", phase === "scrub" && reveal <= 0.01);
  }

  function enterScrub() {
    if (phase === "scrub" || disposed) return;
    phase = "scrub";
    els.section.dataset.phase = "scrub";
    rewind?.kill();
    rewind = null;
    removeIntent();
    // The block itself comes back; its lines stay hidden behind their masks until 85%.
    if (resolveTl) resolveTl.progress(0);
    els.headline.style.opacity = "";
    els.headline.style.transform = "";
    render(progress);
  }

  // Cancel the rewind as soon as the visitor scrolls.
  let removeIntent = () => {};
  function listenForIntent() {
    const startY = window.scrollY;
    const cancel = () => phase === "rewind" && enterScrub();
    const onScroll = () => Math.abs(window.scrollY - startY) > 2 && cancel();
    window.addEventListener("wheel", cancel, { passive: true });
    window.addEventListener("touchmove", cancel, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    removeIntent = () => {
      window.removeEventListener("wheel", cancel);
      window.removeEventListener("touchmove", cancel);
      window.removeEventListener("scroll", onScroll);
      removeIntent = () => {};
    };
  }

  // Keyboard users tabbing into the CTAs while the headline is hidden: show it.
  const onFocusIn = () => {
    if (phase === "rewind") enterScrub();
    if (phase !== "scrub") return;
    focusHold = true;
    render(progress);
  };
  const onFocusOut = (event: FocusEvent) => {
    if (els.headline.contains(event.relatedTarget as Node | null)) return;
    focusHold = false;
    if (phase === "scrub") render(progress);
  };
  els.headline.addEventListener("focusin", onFocusIn);
  els.headline.addEventListener("focusout", onFocusOut);
  offs.push(() => {
    els.headline.removeEventListener("focusin", onFocusIn);
    els.headline.removeEventListener("focusout", onFocusOut);
  });

  const ready = () => seq.status === "ready" && seq.fetchedRatio >= 0.3;
  const canArm = () =>
    phase === "poster" && ready() && (demo || (document.visibilityState === "visible" && atStart()));
  const check = () => {
    if (canArm()) void arm();
  };
  let listening = false;
  function listen(on: boolean) {
    if (on === listening) return;
    listening = on;
    const method = on ? "addEventListener" : "removeEventListener";
    window[method]("scroll", check, { passive: true } as AddEventListenerOptions);
    document[method]("visibilitychange", check);
  }
  const unsubscribe = seq.subscribe(check);
  offs.push(unsubscribe, () => listen(false));
  listen(!demo);

  async function arm() {
    phase = "arming";
    listen(false);
    unsubscribe();
    const [{ gsap, ScrollTrigger }, SplitText] = await Promise.all([loadGsap(), loadSplitText()]);
    await document.fonts?.ready;
    if (disposed) return;
    if (!demo && !atStart()) {
      // They scrolled while the scene was getting ready: stay on the poster until they're back.
      phase = "poster";
      listen(true);
      return;
    }

    const m = seq.manifest!;
    const n = m.frames;
    marks = m.stages.length === els.captions.length ? m.stages : evenStages(els.captions.length, n);

    painter = new FramePainter(els.canvas, seq);
    painter.setVisible(visible);
    painter.onDraw = () => {
      if (!("live" in els.canvas.dataset)) els.canvas.dataset.live = "";
    };
    painter.setFrame(demo ? clamp01((demoProgress ?? 0) / FRAMES_END) * (n - 1) : n - 1);

    ctx = gsap.context(() => {
      SplitText.create([els.h1, els.display, els.sub], {
        type: "lines",
        mask: "lines",
        linesClass: "hero-line",
        // Span wrappers keep the H1 and the two <p>s valid (phrasing content only); globals.css
        // gives .hero-line and its -mask the block layout SplitText only sets on <div>s.
        tag: "span",
        aria: "none",
        autoSplit: true,
        onSplit(self) {
          // Line masks clip like a slot; let descenders and accents of the 0.95 leading through.
          gsap.set(self.masks, { overflow: "visible", clipPath: "inset(-0.18em -0.5em -0.22em -0.5em)" });
          const tl = gsap
            .timeline({ paused: true, defaults: { ease: "power3.out" } })
            .fromTo(els.scrim, { opacity: 0 }, { opacity: 1, duration: 0.5, ease: "none" }, 0)
            .fromTo(els.mark, { scaleX: 0 }, { scaleX: 1, duration: 0.3 }, 0.02)
            .fromTo(self.lines, { yPercent: 130 }, { yPercent: 0, duration: 0.42, stagger: 0.05 }, 0.04)
            .fromTo(els.cta, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.32 }, 0.5);
          if (els.trust) tl.fromTo(els.trust, { opacity: 0 }, { opacity: 1, duration: 0.3 }, 0.62);
          tl.progress(resolveTl ? resolveTl.progress() : 1);
          resolveTl = tl;
          return tl;
        },
      });

      if (demo) return;

      const st = { p: 0 };
      gsap.to(st, {
        p: 1,
        ease: "none",
        scrollTrigger: {
          trigger: els.track,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.5,
          invalidateOnRefresh: true,
        },
        onUpdate: () => {
          progress = st.p;
          if (phase === "scrub") render(progress);
        },
      });
    }, els.section);

    if (demo) {
      phase = "scrub";
      els.section.dataset.phase = "scrub";
      progress = demoProgress ?? 0;
      render(progress);
      return;
    }

    // Grow the track. No visible shift: the stage is sticky at the top and nothing below is in view.
    els.track.dataset.armed = "";
    ScrollTrigger.refresh();

    if (!atStart()) {
      enterScrub();
      return;
    }

    // The one-time rewind: the finished wall strips back to bare board, inviting the visitor to finish it.
    phase = "rewind";
    els.section.dataset.phase = "rewind";
    listenForIntent();
    const proxy = { f: n - 1 };
    ctx.add(() => {
      rewind = gsap
        .timeline({ onComplete: enterScrub })
        .to(els.headline, { opacity: 0, y: -16, duration: 0.5, ease: "power2.in" }, 0)
        .to(els.scrim, { opacity: 0, duration: 0.9, ease: "power2.inOut" }, 0.1)
        .to(proxy, { f: 0, duration: REWIND - 0.3, ease: "power2.inOut", onUpdate: () => showFrame(proxy.f) }, 0.3)
        .to(els.cue, { opacity: 1, duration: 0.4, ease: "power2.out" }, REWIND - 0.4);
    });
  }

  void seq.start();

  return {
    destroy() {
      disposed = true;
      removeIntent();
      offs.forEach((off) => off());
      ctx?.revert();
      painter?.destroy();
      seq.destroy();
      // Back to the server-rendered poster state.
      delete els.track.dataset.armed;
      delete els.canvas.dataset.live;
      els.section.dataset.phase = "poster";
      els.section.dataset.headline = "shown";
      els.headline.removeAttribute("data-hidden");
      for (const el of [els.headline, els.scrim, els.cue, els.cta, els.mark, els.trust]) {
        if (el) {
          el.style.opacity = "";
          el.style.transform = "";
        }
      }
      els.captions.forEach((li, i) => li.toggleAttribute("data-active", i === els.captions.length - 1));
      els.rail.style.setProperty("--fill", "1");
      els.story?.removeAttribute("data-live");
      els.storyLines.forEach((line) => {
        line.style.removeProperty("--in");
        line.style.removeProperty("--out");
      });
      els.ticks.forEach((tick) => tick.setAttribute("data-passed", ""));
      void loadGsap().then(({ ScrollTrigger }) => ScrollTrigger.refresh());
    },
  };
}
