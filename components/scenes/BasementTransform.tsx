"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { useReducedMotion } from "@/components/motion/useReducedMotion";
import { Button } from "@/components/ui/Button";
import { ConceptLabel, MediaFrame } from "@/components/ui/MediaFrame";
import { media, sequences, type MediaAsset } from "@/content/media";
import { afterLoadIdle, loadGsap } from "@/lib/gsap";
import { observeInView } from "@/lib/inview";
import { cn, pad2 } from "@/lib/utils";
import { FramePainter, FrameSequence, clamp01, evenStages, pickFolder, stageValue } from "./frame-engine";
import { ScenePoster } from "./ScenePoster";
import { shade } from "./scene-utils";

type Cta = { label: string; href: string };

type CommonProps = {
  /** The four stage labels: "Plan & permit", "Frame & insulate", "Drywall & ceilings", "Floors, trim & paint" */
  stages: string[];
  /** Corner label; defaults to "Concept visualization" (the frames are AI-generated) */
  conceptLabel?: string;
  /** The reduced-motion / no-JS layout: no pin, the four stage stills as a labelled sequence */
  forceStatic?: boolean;
  /** Dev preview: hold the scrubbed scene at this track progress (0–1) instead of following scroll */
  demoProgress?: number;
  id?: string;
  className?: string;
};

export type BasementHeroProps = CommonProps & {
  variant: "hero";
  h1: string;
  display: string;
  sub: string;
  primaryCta: Cta;
  /** e.g. "Estimate my basement" → "#estimator" (same-page anchors glide via SmoothScroll) */
  secondaryCta: Cta;
  headingAs?: "h1" | "h2";
  /** Optional page meta above the H1 line (e.g. breadcrumbs + last updated); fades with the headline */
  meta?: ReactNode;
};

export type BasementTeaserProps = CommonProps & {
  variant: "teaser";
  /** Section number, e.g. "03" */
  index?: string;
  /** e.g. "Basement finishing" */
  eyebrow: string;
  /** Drawing-sheet code at the end of the reference line, e.g. "A-03" */
  sheet?: string;
  title: string;
  body: string;
  /** e.g. { label: "See basement renovations", href: "/basement-renovations-ottawa" } */
  link: Cta;
  /** Optional mono quote link beside `link`, e.g. { label: "Get a Free Quote", href: "/free-quote?service=basement-renovation" } */
  quote?: Cta;
  headingAs?: "h2" | "h3";
};

export type BasementTransformProps = BasementHeroProps | BasementTeaserProps;

const stills = {
  desktop: [media.basementStage1Desktop, media.basementStage2Desktop, media.basementStage3Desktop, media.basementStage4Desktop],
  mobile: [media.basementStage1Mobile, media.basementStage2Mobile, media.basementStage3Mobile, media.basementStage4Mobile],
};

/* Static-only / motion-only switches (reduced motion, forceStatic, and the <noscript> style). */
const motionOnly = "motion-reduce:hidden group-data-[static]/bt:hidden";
const staticOnly = "hidden motion-reduce:block group-data-[static]/bt:block";
const noscriptCss =
  "<style>[data-bt-track]{height:auto!important}[data-bt-motion]{display:none!important}[data-bt-static]{display:block!important}[data-bt-sticky]{position:static!important;height:auto!important}</style>";

/**
 * Basement transformation (brief §7.3): unfinished concrete → framed and insulated → drywalled →
 * finished rec room, scrubbed by scroll on a sticky stage, with a four-step rail and a
 * "Concept visualization" title-block cell. Shares the frame engine with HeroSequence; while frames
 * load (or if they can't), the four stage stills crossfade instead. Reduced motion and no-JS: no
 * pin, the four stills as a labelled static sequence.
 *
 * - `variant="hero"`: basement page, full viewport, headline overlay, ~300vh (220vh on mobile).
 * - `variant="teaser"`: home, text in a side column, ~200vh.
 */
export function BasementTransform(props: BasementTransformProps) {
  const { variant, stages, conceptLabel, forceStatic = false, demoProgress, id, className } = props;
  const headingId = useId();
  const reduced = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const sceneRef = useRef<BasementScene | null>(null);
  const [stillsMode, setStillsMode] = useState(false);
  const count = stages.length;
  const isHero = variant === "hero";

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || forceStatic || reduced) return;
    const stage = section.querySelector<HTMLElement>('[data-el="stage"]');
    const fit = () => {
      if (stage) stage.style.top = `${Math.min(0, window.innerHeight - stage.offsetHeight)}px`;
    };
    const ro = new ResizeObserver(fit);
    if (stage) ro.observe(stage);
    fit();

    let scene: BasementScene | null = null;
    const cancelIdle = afterLoadIdle(() => {
      scene = createBasementScene(section, {
        hero: isHero,
        demoProgress,
        onNeedStills: () => setStillsMode(true),
      });
      sceneRef.current = scene;
    });
    return () => {
      cancelIdle();
      scene?.destroy();
      sceneRef.current = null;
      ro.disconnect();
      if (stage) stage.style.top = "";
    };
  }, [forceStatic, reduced, demoProgress, isHero]);

  // Stills just mounted: paint the current stage into them.
  useEffect(() => {
    if (stillsMode) sceneRef.current?.refresh();
  }, [stillsMode]);

  const mediaSizes = isHero ? "100vw" : "(min-width: 768px) 70vw, 100vw";

  /* The scene imagery: poster, stills (on demand), canvas */
  const imagery = (
    <div className="absolute inset-0 overflow-hidden bg-graphite-2">
      <ScenePoster
        priority={isHero}
        desktop={media.basementPosterDesktop}
        mobile={media.basementPosterMobile}
        sizes={mediaSizes}
      />
        {stillsMode ? (
          <div aria-hidden="true" className="absolute inset-0">
            {stills.desktop.map((still, i) => (
              <div
                key={still.src}
                data-still=""
                className="absolute inset-0 transition-opacity duration-500 ease-[var(--ease-rake)]"
                style={{ opacity: i === 0 ? 1 : 0 }}
              >
                <ScenePoster desktop={still} mobile={stills.mobile[i]} sizes={mediaSizes} />
              </div>
            ))}
          </div>
        ) : null}
        <canvas
          data-el="canvas"
          aria-hidden="true"
          className="absolute inset-0 size-full opacity-0 transition-opacity duration-500 data-[live]:opacity-100"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            backgroundImage: isHero
              ? `linear-gradient(180deg, ${shade(55)}, transparent 26%, transparent 58%, ${shade(80)})`
              : `linear-gradient(180deg, transparent 55%, ${shade(78)})`,
          }}
        />
    </div>
  );

  /* Overlay: the corner title-block cell and the step rail */
  const overlay = (
    <>
      {/* Corner title-block cell: current stage + the honesty label */}
      <div
        className={cn(
          "absolute right-0 z-10 flex border border-white/15 bg-graphite/75 backdrop-blur-[2px]",
          isHero
            ? "right-[var(--page-pad)] top-[calc(var(--header-h)_+_1rem)]"
            : "top-[calc(var(--header-h)_+_0.75rem)] md:top-0",
        )}
      >
        <span className="grid border-r border-white/15 px-2.5 py-2">
          {stages.map((_, i) => (
            <span
              key={i}
              data-counter=""
              data-active={i === 0 ? "" : undefined}
              className="col-start-1 row-start-1 font-mono text-[0.625rem] font-medium leading-none tracking-[0.14em] text-plaster tabular-nums opacity-0 data-[active]:opacity-100"
            >
              {pad2(i + 1)}/{pad2(count)}
            </span>
          ))}
        </span>
        <ConceptLabel
          text={conceptLabel}
          className="static border-0 bg-transparent px-2.5 py-2 leading-none backdrop-blur-none"
        />
      </div>

      {/* Step rail (real HTML list; amber run fills as the room is built) */}
      <div className={cn("absolute inset-x-0 bottom-0 z-10", motionOnly)} data-bt-motion="">
        <div
          className={cn(
            "pb-[max(1rem,env(safe-area-inset-bottom))] md:pb-6",
            isHero ? "site-container" : "max-md:pb-[calc(var(--action-bar-h)_+_1rem)]",
          )}
        >
          <div className="mb-3 grid md:hidden" aria-hidden="true">
            {stages.map((label, i) => (
              <span
                key={label}
                data-steplabel=""
                data-active={i === 0 ? "" : undefined}
                className={cn(
                  "t-spec col-start-1 row-start-1 text-plaster opacity-0 transition-opacity duration-300 data-[active]:opacity-100",
                  !isHero && "px-[var(--page-pad)]",
                )}
              >
                {pad2(i + 1)} — {label}
              </span>
            ))}
          </div>
          <ol
            data-el="steps"
            style={{ "--fill": 0 } as React.CSSProperties}
            className={cn("relative grid grid-cols-4 border-t border-white/20", !isHero && "max-md:mx-[var(--page-pad)]")}
          >
            <span
              aria-hidden="true"
              className="absolute -top-px left-0 h-0.5 w-full origin-left scale-x-[var(--fill)] bg-worklight"
            />
            {stages.map((label, i) => (
              <li
                key={label}
                data-step=""
                data-active={i === 0 ? "" : undefined}
                className="group/step relative flex flex-col gap-1.5 border-l border-white/15 pl-2.5 pt-3 first:border-l-0 first:pl-0 md:pl-4"
              >
                <span
                  aria-hidden="true"
                  className="absolute -top-[5px] left-0 size-[9px] -translate-x-1/2 border border-plaster/60 bg-graphite transition-colors duration-200 group-data-[done]/step:border-worklight group-data-[done]/step:bg-worklight group-data-[active]/step:border-worklight group-first/step:hidden"
                />
                <span className="font-mono text-[0.625rem] font-medium tracking-[0.14em] text-plaster/60 tabular-nums transition-colors duration-200 group-data-[active]/step:text-plaster md:text-[0.6875rem]">
                  {pad2(i + 1)}
                </span>
                <span className="sr-only md:not-sr-only md:t-spec md:text-plaster/60 md:transition-colors md:duration-200 md:group-data-[active]/step:text-plaster">
                  {label}
                </span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </>
  );

  /* Reduced motion / no-JS: the four stills as a labelled static sequence */
  const staticSequence = (
    <div
      data-bt-static=""
      className={cn(staticOnly, isHero ? "site-container section-y-tight" : "pb-20 md:pb-28 md:pr-[var(--page-pad)] md:pt-24")}
    >
      <div className="flex items-center gap-3 border-b border-[color:var(--hairline)] pb-3">
        <span aria-hidden="true" className="h-2.5 w-px bg-[color:var(--hairline)]" />
        <span aria-hidden="true" className="h-px flex-1" />
        <ConceptLabel text={conceptLabel} className="static border-white/15 bg-transparent backdrop-blur-none" />
      </div>
      <ol className={cn("mt-8 grid gap-x-[var(--gutter)] gap-y-10", isHero ? "sm:grid-cols-2 lg:grid-cols-4" : "sm:grid-cols-2")}>
        {stages.map((label, i) => (
          <li key={label}>
            <MediaFrame
              media={stills.desktop[i] as MediaAsset}
              sizes={isHero ? "(min-width: 1024px) 24vw, (min-width: 640px) 48vw, 100vw" : "(min-width: 768px) 32vw, (min-width: 640px) 48vw, 100vw"}
              fig={i + 1}
              caption={label}
              kindLabel={false}
              quality={60}
            />
          </li>
        ))}
      </ol>
    </div>
  );

  if (props.variant === "hero") {
    const { h1, display, sub, primaryCta, secondaryCta, headingAs: Heading = "h1", meta } = props;
    return (
      <section
        ref={sectionRef}
        id={id}
        aria-labelledby={headingId}
        data-hero="dark"
        data-static={forceStatic ? "" : undefined}
        data-headline="shown"
        className={cn("surface-dark group/bt relative overflow-clip", className)}
      >
        <noscript dangerouslySetInnerHTML={{ __html: noscriptCss }} />
        <div
          data-el="track"
          data-bt-track=""
          className="relative h-[220vh] motion-reduce:h-auto group-data-[static]/bt:h-auto md:h-[300vh] md:motion-reduce:h-auto md:group-data-[static]/bt:h-auto"
        >
          <div
            data-el="stage"
            data-bt-sticky=""
            className="sticky top-0 flex min-h-svh flex-col group-data-[static]/bt:static motion-reduce:static"
          >
            <div className="absolute inset-x-0 top-0 h-[max(100%,100lvh)]">{imagery}</div>
            <div
              data-el="scrim"
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 top-0 h-[max(100%,100lvh)]"
              style={{
                backgroundImage: `linear-gradient(0deg, ${shade(90)} 0%, ${shade(78)} 38%, ${shade(30)} 70%, transparent 100%)`,
              }}
            />
            <div className="pointer-events-none absolute inset-0 z-10">{overlay}</div>
            <div className="site-container relative z-10 flex flex-1 flex-col justify-end pb-32 pt-[calc(var(--header-h)_+_4.5rem)] md:pb-36">
              <div data-el="headline" className="site-grid gap-y-5 data-[hidden]:pointer-events-none md:gap-y-7">
                {meta ? <div className="col-span-full min-w-0">{meta}</div> : null}
                <div className="col-span-full flex items-start gap-3 md:col-span-9">
                  <span aria-hidden="true" className="mt-[0.55em] h-px w-6 shrink-0 bg-worklight md:w-10" />
                  <Heading id={headingId} className="t-spec text-[color:var(--ink)]">
                    {h1}
                  </Heading>
                </div>
                <p className="t-display-l col-span-full max-w-[18ch] text-[color:var(--ink)] md:col-span-10 lg:col-span-9">
                  {display}
                </p>
                <p className="t-lede col-span-full max-w-[52ch] text-[color:var(--ink)] md:col-span-8 lg:col-span-6">
                  {sub}
                </p>
                <div className="col-span-full flex flex-col gap-3 sm:flex-row sm:flex-wrap md:gap-4">
                  <Button href={primaryCta.href} size="lg" arrow>
                    {primaryCta.label}
                  </Button>
                  <Button href={secondaryCta.href} variant="secondary" size="lg">
                    {secondaryCta.label}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
        {staticSequence}
      </section>
    );
  }

  const { index, eyebrow, sheet, title, body, link, quote, headingAs: Heading = "h2" } = props;
  return (
    <section
      ref={sectionRef}
      id={id}
      aria-labelledby={headingId}
      data-static={forceStatic ? "" : undefined}
      className={cn("surface-dark group/bt relative overflow-clip", className)}
    >
      <noscript dangerouslySetInnerHTML={{ __html: noscriptCss }} />
      <div aria-hidden="true" className="rake-line absolute inset-x-0 top-0" />
      <div className="site-container">
        <div className="site-grid">
          {/* Text column: in flow on mobile, sticky beside the scene from 768 px */}
          <div
            data-bt-sticky=""
            className="col-span-full flex flex-col justify-center gap-6 pb-10 pt-20 md:sticky md:top-0 md:col-span-4 md:h-svh md:py-[calc(var(--header-h)_+_1rem)] group-data-[static]/bt:md:static group-data-[static]/bt:md:h-auto motion-reduce:md:static motion-reduce:md:h-auto"
          >
            <p className="t-spec flex items-center gap-3">
              <span className="whitespace-nowrap">
                {index ? <span className="tabular-nums">{index} / </span> : null}
                {eyebrow}
              </span>
              <span aria-hidden="true" className="relative h-px min-w-6 flex-1 bg-[color:var(--hairline)]">
                <span className="absolute right-0 top-1/2 h-2.5 w-px -translate-y-1/2 bg-[color:var(--hairline)]" />
              </span>
              {sheet ? <span className="whitespace-nowrap tabular-nums">{sheet}</span> : null}
            </p>
            <Heading id={headingId} className="t-h2 text-[color:var(--ink)]">
              {title}
            </Heading>
            <p className="text-muted prose-measure">{body}</p>
            <div className="flex flex-wrap items-center gap-x-8 gap-y-1">
              <Button href={link.href} variant="ghost" arrow>
                {link.label}
              </Button>
              {quote ? (
                <Link
                  href={quote.href}
                  className="t-spec link-draw inline-flex min-h-11 items-center text-[color:var(--ink)]!"
                >
                  {quote.label}
                </Link>
              ) : null}
            </div>
          </div>

          {/* Scene column, bleeding off the right edge */}
          <div className="col-span-full md:col-span-8 md:mr-[calc(min(0px,(var(--container-site)_-_100vw)_/_2)_-_var(--page-pad))]">
            <div
              data-el="track"
              data-bt-track=""
              data-bt-motion=""
              className={cn("relative h-[200vh]", motionOnly)}
            >
              <div
                data-el="stage"
                className="sticky top-0 flex h-svh items-center max-md:-mx-[var(--page-pad)] md:pt-[var(--header-h)]"
              >
                <div className="relative h-full w-full md:h-[calc(100svh_-_var(--header-h)_-_3rem)]">
                  {imagery}
                  {overlay}
                </div>
              </div>
            </div>
            {staticSequence}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Scene (client, after load) ───────────────────────────────────────── */

type BasementScene = { destroy: () => void; refresh: () => void };

/** Track share held on the first frame (headline reading time) and on the finished room */
const HOLD_START = { hero: 0.12, teaser: 0.06 };
const HOLD_END = 0.06;

function createBasementScene(
  section: HTMLElement,
  { hero, demoProgress, onNeedStills }: { hero: boolean; demoProgress?: number; onNeedStills: () => void },
): BasementScene {
  const q = <T extends HTMLElement = HTMLElement>(sel: string) => section.querySelector<T>(sel);
  const qa = <T extends HTMLElement = HTMLElement>(sel: string) => Array.from(section.querySelectorAll<T>(sel));
  const track = q('[data-el="track"]');
  const canvas = q<HTMLCanvasElement>('[data-el="canvas"]');
  const steps = q('[data-el="steps"]');
  const headline = q('[data-el="headline"]');
  const scrim = q('[data-el="scrim"]');
  const stepItems = qa("[data-step]");
  const stepLabels = qa("[data-steplabel]");
  const counters = qa("[data-counter]");
  const count = stepItems.length || 4;

  const demo = typeof demoProgress === "number";
  const seq = new FrameSequence(pickFolder({ desktop: sequences.basementDesktop, mobile: sequences.basementMobile }));
  let painter: FramePainter | null = null;
  let disposed = false;
  let visible = true;
  let progress = demoProgress ?? 0;
  let activeStage = -1;
  let focusHold = false;
  let needStills = false;
  let ctx: gsap.Context | null = null;
  const offs: Array<() => void> = [];

  const marks = () => {
    const m = seq.manifest;
    if (!m) return [];
    return m.stages.length === count ? m.stages : evenStages(count, m.frames);
  };

  function requestStills() {
    if (needStills) return;
    needStills = true;
    onNeedStills();
  }

  function setStage(s: number) {
    const active = Math.min(count - 1, Math.max(0, Math.round(s)));
    if (active !== activeStage) {
      activeStage = active;
      stepItems.forEach((li, i) => {
        li.toggleAttribute("data-active", i === active);
        li.toggleAttribute("data-done", i < active);
        if (i === active) li.setAttribute("aria-current", "step");
        else li.removeAttribute("aria-current");
      });
      stepLabels.forEach((el, i) => el.toggleAttribute("data-active", i === active));
      counters.forEach((el, i) => el.toggleAttribute("data-active", i === active));
    }
    steps?.style.setProperty("--fill", (s / Math.max(1, count - 1)).toFixed(4));
    if (needStills) {
      qa("[data-still]").forEach((el, i) => {
        el.style.opacity = clamp01(1 - Math.abs(s - i)).toFixed(3);
      });
    }
  }

  function render(p: number) {
    const holdStart = hero ? HOLD_START.hero : HOLD_START.teaser;
    const fp = clamp01((p - holdStart) / (1 - holdStart - HOLD_END));
    const n = seq.frameCount;
    let s = fp * (count - 1);
    if (n) {
      const f = fp * (n - 1);
      painter?.setFrame(f);
      s = stageValue(f, marks(), n);
    }
    if (!painter && p > 0.01) requestStills(); // scrubbing before the frames are in: crossfade the stills
    setStage(s);

    if (hero && headline) {
      const o = focusHold ? 1 : 1 - clamp01((p - 0.015) / (holdStart - 0.015));
      headline.style.opacity = o.toFixed(3);
      headline.style.transform = `translate3d(0, ${((1 - o) * -28).toFixed(1)}px, 0)`;
      if (scrim) scrim.style.opacity = (0.15 + o * 0.85).toFixed(3);
      headline.toggleAttribute("data-hidden", o < 0.5);
      section.dataset.headline = o < 0.5 ? "hidden" : "shown";
    }
  }

  // Keyboard users tabbing into the hero CTAs after they faded: bring the headline back.
  if (hero && headline) {
    const onIn = () => {
      focusHold = true;
      render(progress);
    };
    const onOut = (event: FocusEvent) => {
      if (headline.contains(event.relatedTarget as Node | null)) return;
      focusHold = false;
      render(progress);
    };
    headline.addEventListener("focusin", onIn);
    headline.addEventListener("focusout", onOut);
    offs.push(() => {
      headline.removeEventListener("focusin", onIn);
      headline.removeEventListener("focusout", onOut);
    });
  }

  offs.push(
    observeInView(
      section,
      (entry) => {
        visible = entry.isIntersecting;
        painter?.setVisible(visible);
      },
      { rootMargin: "20% 0px" },
    ),
  );

  // Frames: the canvas takes over once 30% are in and the first frame decodes; otherwise stills.
  offs.push(
    seq.subscribe(() => {
      if (disposed || painter || !canvas) return;
      if (seq.status === "failed") {
        requestStills();
        return;
      }
      if (seq.status !== "ready" || seq.fetchedRatio < 0.3) return;
      painter = new FramePainter(canvas, seq);
      painter.setVisible(visible);
      painter.onDraw = () => {
        if (!("live" in canvas.dataset)) canvas.dataset.live = "";
      };
      render(progress);
    }),
  );
  const begin = () => void seq.start();
  if (hero || demo) begin();
  else {
    const stop = observeInView(
      section,
      (entry) => {
        if (!entry.isIntersecting) return;
        stop();
        begin();
      },
      { rootMargin: "150% 0px" },
    );
    offs.push(stop);
  }

  // Scroll scrub (linear, smoothed 0.5 s).
  void loadGsap().then(({ gsap }) => {
    if (disposed) return;
    ctx = gsap.context(() => {
      if (demo || !track) return;
      const st = { p: 0 };
      gsap.to(st, {
        p: 1,
        ease: "none",
        scrollTrigger: { trigger: track, start: "top top", end: "bottom bottom", scrub: 0.5, invalidateOnRefresh: true },
        onUpdate: () => {
          progress = st.p;
          render(progress);
        },
      });
    }, section);
    render(progress);
  });

  return {
    refresh: () => render(progress),
    destroy() {
      disposed = true;
      offs.forEach((off) => off());
      ctx?.revert();
      painter?.destroy();
      seq.destroy();
      if (canvas) delete canvas.dataset.live;
      if (headline) {
        headline.style.opacity = "";
        headline.style.transform = "";
        headline.removeAttribute("data-hidden");
      }
      if (scrim) scrim.style.opacity = "";
      section.dataset.headline = "shown";
      activeStage = -1;
      setStage(0);
    },
  };
}
