import { RevealHeading } from "@/components/motion/RevealHeading";
import { DetailBubble, VellumGrid } from "@/components/ui/drafting";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { cn } from "@/lib/utils";
import { SectionCut, WallSectionDrawing } from "./WallLayersDrawing";
import { activeLayerAt, assemblyAt, WL_COUNT, type WallLayer } from "./WallLayersGeometry";
import { WallLayersMotion } from "./WallLayersMotion";

export type { WallLayer };

export type WallLayersProps = {
  /** The six copy-deck layer labels, outside to inside: foundation wall … subfloor */
  layers: readonly WallLayer[];
  /** "Built warm and dry for Ottawa winters." */
  title: string;
  /** The answer paragraph under the H2 (AEO) */
  answer: string;
  /** Optional sheet-reference eyebrow, e.g. "Built for Ottawa basements" */
  eyebrow?: string;
  /** Section number for the eyebrow, e.g. "05" */
  index?: string;
  /** Drawing-sheet code, e.g. "A-06" */
  sheet?: string;
  /** Section id (also prefixes heading and pattern ids; must be unique on the page) */
  id?: string;
  /** Name on the cut marker and the drawing caption */
  cutLabel?: string;
  /** Static, fully labelled, assembled drawing (the reduced-motion state) */
  forceStatic?: boolean;
  /** Static preview of the scroll state at this progress (0 = exploded, 1 = assembled); dev and screenshots */
  previewProgress?: number;
  /** Faint drafting grid behind the section (default true; use on two or three plaster sections per page) */
  vellum?: boolean;
  className?: string;
};

/*
 * The pinned layout applies only on large, tall screens with motion allowed. It lives in CSS (not JS) so
 * the server HTML already has the right height: no layout shift at hydration. No-JS gets the static
 * layout through the <noscript> style below.
 */
const TRACK_PINNED =
  "[@media(min-width:64rem)_and_(min-height:37.5rem)_and_(prefers-reduced-motion:no-preference)]:h-[240vh]";
const STAGE_PINNED =
  "[@media(min-width:64rem)_and_(min-height:37.5rem)_and_(prefers-reduced-motion:no-preference)]:sticky " +
  "[@media(min-width:64rem)_and_(min-height:37.5rem)_and_(prefers-reduced-motion:no-preference)]:top-[var(--header-h)] " +
  "[@media(min-width:64rem)_and_(min-height:37.5rem)_and_(prefers-reduced-motion:no-preference)]:h-[calc(100svh-var(--header-h))] " +
  "[@media(min-width:64rem)_and_(min-height:37.5rem)_and_(prefers-reduced-motion:no-preference)]:content-center";
const DRAWING_PINNED =
  "[@media(min-width:64rem)_and_(min-height:37.5rem)_and_(prefers-reduced-motion:no-preference)]:max-h-[calc(100svh-var(--header-h)-7rem)]";
const NOSCRIPT_CSS =
  "[data-wl-track]{height:auto!important}[data-wl-stage]{position:static!important;height:auto!important}[data-wl-figure] svg{max-height:none!important}";

/**
 * Wall layers diagram (brief §7.6, basement page): an exploded SECTION A–A of a basement wall that
 * assembles layer by layer on scroll, beside a server-rendered ordered list of the layers.
 */
export function WallLayers({
  layers,
  title,
  answer,
  eyebrow,
  index,
  sheet,
  id = "wall-layers",
  cutLabel = "Section A–A",
  forceStatic = false,
  previewProgress,
  vellum = true,
  className,
}: WallLayersProps) {
  const preview = typeof previewProgress === "number";
  const isStatic = forceStatic || preview;
  const q = preview ? assemblyAt(previewProgress) : WL_COUNT;
  const active = preview ? activeLayerAt(q) : -1;
  const titleId = `${id}-title`;
  const drawingLabel = `${cutLabel}: ${layers.map((l) => `${l.index} ${l.title}`).join(", ")}`;

  return (
    <section
      id={id}
      aria-labelledby={titleId}
      className={cn("surface-light texture-plaster section-y relative isolate", className)}
    >
      {vellum && <VellumGrid />}

      <div className="site-container relative">
        {eyebrow ? (
          <SectionHeader index={index} eyebrow={eyebrow} sheet={sheet} title={title} id={titleId} intro={answer} />
        ) : (
          <header className="site-grid gap-y-6 md:gap-y-8">
            <RevealHeading
              as="h2"
              id={titleId}
              className="t-h2 col-span-full text-[color:var(--ink)] md:col-span-10 lg:col-span-8"
            >
              {title}
            </RevealHeading>
            <p className="t-lede col-span-full text-muted md:col-span-7 lg:col-span-6 lg:col-start-2">{answer}</p>
          </header>
        )}

        <SectionCut label={cutLabel} className="mt-12 md:mt-16" />
      </div>

      <WallLayersMotion disabled={isStatic} className="site-container relative">
        {!isStatic && (
          <noscript>
            <style>{NOSCRIPT_CSS}</style>
          </noscript>
        )}
        <div data-wl-track className={cn(!isStatic && TRACK_PINNED)}>
          <div
            data-wl-stage
            className={cn("site-grid gap-y-10 pt-8 md:pt-10 lg:items-center", !isStatic && STAGE_PINNED)}
          >
            <figure data-wl-figure className="col-span-full min-w-0 lg:col-span-7">
              <WallSectionDrawing
                uid={id}
                variant="mobile"
                layers={layers}
                q={q}
                active={active}
                label={drawingLabel}
                className="md:hidden"
              />
              <WallSectionDrawing
                uid={id}
                variant="desktop"
                layers={layers}
                q={q}
                active={active}
                label={drawingLabel}
                className={cn("hidden md:block", !isStatic && DRAWING_PINNED)}
              />
              <figcaption className="mt-5 flex items-center gap-3">
                <DetailBubble top="A" size={36} />
                <span className="t-spec text-[color:var(--ink)]">{cutLabel}</span>
                <span aria-hidden="true" className="h-px min-w-6 flex-1 bg-[color:var(--hairline)]" />
                <abbr title="Not to scale" className="t-spec no-underline">
                  NTS
                </abbr>
              </figcaption>
            </figure>

            <ol
              data-wl-list
              className="col-span-full md:col-span-10 md:col-start-2 lg:col-span-5 lg:col-start-8 xl:col-span-4 xl:col-start-9"
            >
              {layers.map((layer, i) => (
                <li
                  key={layer.index}
                  data-wl-item={i}
                  data-state={active >= 0 ? (i === active ? "active" : "idle") : undefined}
                  className="group/item relative border-t border-[color:var(--hairline)] last:border-b"
                >
                  <span
                    aria-hidden="true"
                    className="absolute -top-px left-0 h-0.5 w-0 bg-worklight transition-[width] duration-500 ease-[var(--ease-rake)] group-data-[state=active]/item:w-14"
                  />
                  <div className="flex gap-4 py-4 md:gap-6 lg:py-[clamp(0.7rem,1.7vh,1.25rem)]">
                    <span className="t-spec w-6 shrink-0 pt-[0.3rem] tabular-nums transition-colors group-data-[state=active]/item:text-[color:var(--ink)]">
                      {layer.index}
                    </span>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-display text-[1.1875rem] font-bold leading-tight tracking-[-0.01em] text-[color:var(--ink)] transition-colors duration-300 [font-stretch:112%] group-data-[state=idle]/item:text-[color:var(--muted)] md:text-[1.3125rem]">
                        {layer.title}
                      </h3>
                      <div className="grid grid-rows-[1fr] transition-[grid-template-rows] duration-500 ease-[var(--ease-rake)] group-data-[collapse=true]/item:grid-rows-[0fr]">
                        <div className="min-h-0 overflow-hidden">
                          <p className="prose-measure pt-2 text-[0.9375rem] leading-relaxed text-muted md:text-base">
                            {layer.body}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </WallLayersMotion>
    </section>
  );
}
