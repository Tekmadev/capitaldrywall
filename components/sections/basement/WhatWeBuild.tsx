import { RevealHeading } from "@/components/motion/RevealHeading";
import { Button } from "@/components/ui/Button";
import { MediaFrame } from "@/components/ui/MediaFrame";
import { basementHero, whatWeBuild } from "@/content/copy/basement";
import { cn, pad2 } from "@/lib/utils";

type Slot = {
  /** Grid placement: 4-column phone grid, 12-column grid from 768 px */
  className: string;
  /** Frame ratio (the tiles are 4:5 files; object-cover crops) */
  ratio: string;
  /** Accurate next/image sizes for this slot */
  sizes: string;
  /** Pull the frame (not the text) out to the right viewport edge from 768 px */
  bleed?: boolean;
};

/*
 * From 1280 px: three staggered pairs, each weighted differently (7 + 4, 4 + 6, 5 + 4) with mixed ratios,
 * so no two neighbours share a size; one frame bleeds off the right edge. 768–1279 px: a 6 + 6 zigzag
 * (right frames dropped a step), so titles never squeeze into a 4-column sliver. Below 768 px the
 * full-width frames (01, 04) alternate with frames indented right then left over three of the four
 * columns, so the six never read as one stack of identical cards.
 * Widths at 1440: span 7 = 770, span 6 + bleed = 704, span 5 = 541, span 4 = 427. Three of four
 * phone columns (20 px padding, 24 px gutters) = calc(75vw - 36px).
 */
const NARROW_SIZES =
  "(min-width: 1440px) 427px, (min-width: 1280px) 29vw, (min-width: 768px) 47vw, calc(75vw - 36px)";

const SLOTS: Slot[] = [
  {
    className: "col-span-4 md:col-span-6 md:col-start-1 md:row-start-1 xl:col-span-7",
    ratio: "16 / 10",
    sizes: "(min-width: 1440px) 770px, (min-width: 1280px) 53vw, (min-width: 768px) 47vw, calc(100vw - 40px)",
  },
  {
    className:
      "col-span-3 col-start-2 md:col-span-6 md:col-start-7 md:row-start-1 md:mt-24 xl:col-span-4 xl:col-start-9",
    ratio: "4 / 5",
    sizes: NARROW_SIZES,
  },
  {
    className:
      "col-span-3 col-start-1 md:col-span-6 md:col-start-1 md:row-start-2 xl:col-span-4 xl:col-start-2 xl:-mt-8",
    ratio: "1 / 1",
    sizes: NARROW_SIZES,
  },
  {
    className: "col-span-4 md:col-span-6 md:col-start-7 md:row-start-2 md:mt-24 xl:mt-32",
    ratio: "3 / 2",
    sizes: "(min-width: 768px) calc(50vw - 16px), calc(100vw - 40px)",
    bleed: true,
  },
  {
    className: "col-span-3 col-start-2 md:col-span-6 md:col-start-1 md:row-start-3 xl:col-span-5",
    ratio: "1 / 1",
    sizes: "(min-width: 1440px) 541px, (min-width: 1280px) 37vw, (min-width: 768px) 47vw, calc(75vw - 36px)",
  },
  {
    className:
      "col-span-3 col-start-1 md:col-span-6 md:col-start-7 md:row-start-3 md:mt-24 xl:col-span-4 xl:col-start-8 xl:mt-16",
    ratio: "4 / 5",
    sizes: NARROW_SIZES,
  },
];

/** Negative right margin that reaches the viewport edge from inside site-container (any width). */
const BLEED_RIGHT =
  "md:mr-[calc(min(0px,(var(--container-site)_-_100vw)_/_2)_-_var(--page-pad))]";

/**
 * View title from 1024 px: the FIG. number and its leader fill one grid column plus a gutter (less
 * the 1 rem gap), so the room name and its line start on the tile's second column. The leader
 * stretches to fit; the 5.25 rem floor keeps "FIG. 06" and a short leader where columns get narrow.
 */
const VIEW_TITLE =
  "lg:grid lg:grid-cols-[max(5.25rem,calc((min(100vw,var(--container-site))_-_2*var(--page-pad)_-_11*var(--gutter))/12_+_var(--gutter)_-_1rem))_minmax(0,1fr)] lg:items-baseline lg:gap-x-4";

/**
 * Keeps hyphenated words whole ("in-law") when a title wraps: balanced headings otherwise break at the
 * hyphen on phones ("Guest & in- / law suites"). The text itself is unchanged.
 */
function keepHyphenated(text: string) {
  return text
    .split(/(\S+-\S+)/)
    .map((part, i) => (part.includes("-") ? <span key={i} className="whitespace-nowrap">{part}</span> : part));
}

type WhatWeBuildProps = {
  index?: string;
  sheet?: string;
  id?: string;
  className?: string;
};

/**
 * "What we build" (brief §9.3): the six basement room types as an asymmetric set of framed concept
 * images on the dark surface. Under each frame sits a view title, as on a drawing: the FIG. number on
 * a leader that runs into the room name (H3), with its one line beneath. From 1024 px the number hangs
 * beside the name; below that it sits above it. The name is said once (no caption repeating it).
 * Every frame keeps its "Concept visualization" label (MediaFrame): these are concept images, not
 * client work.
 */
export function WhatWeBuild({ index = "03", sheet = "B-03", id = "what-we-build", className }: WhatWeBuildProps) {
  const titleId = `${id}-title`;
  const tiles = whatWeBuild.tiles;

  return (
    <section
      id={id}
      aria-labelledby={titleId}
      className={cn("surface-dark section-y relative isolate overflow-x-clip", className)}
    >
      <span aria-hidden="true" className="rake-line absolute inset-x-0 top-0" />
      <div className="site-container">
        {/* Sheet line: number, hairline run to a tick, sheet code (the H2 carries the name) */}
        <div className="flex items-center gap-4" aria-hidden="true">
          <span className="t-spec tabular-nums">{index}</span>
          <span className="relative h-px min-w-6 flex-1 bg-[color:var(--hairline)]">
            <span className="absolute right-0 top-1/2 h-2.5 w-px -translate-y-1/2 bg-[color:var(--hairline)]" />
          </span>
          <span className="t-spec tabular-nums">{sheet}</span>
        </div>

        <div className="site-grid mt-8 md:mt-12">
          <RevealHeading
            as="h2"
            id={titleId}
            className="t-display-l col-span-full text-[color:var(--ink)] md:col-span-8"
          >
            {whatWeBuild.title}
          </RevealHeading>
          <p aria-hidden="true" className="t-spec col-span-full mt-6 tabular-nums md:col-span-4 md:col-start-9 md:mt-0 md:self-end md:text-right">
            FIG. {pad2(1)}–{pad2(tiles.length)}
          </p>
        </div>

        <ul className="site-grid mt-14 gap-y-16 md:mt-20 md:gap-y-20">
          {tiles.map((tile, i) => {
            const slot = SLOTS[i % SLOTS.length];
            return (
              <li key={tile.title} className={cn("min-w-0", slot.className)}>
                <div className={cn(slot.bleed && BLEED_RIGHT)}>
                  <MediaFrame
                    media={tile.image}
                    sizes={slot.sizes}
                    ratio={slot.ratio}
                    caption={false}
                    quality={75}
                    defer
                  />
                </div>
                <div className={cn("mt-5 md:mt-6", VIEW_TITLE)}>
                  <span aria-hidden="true" className="t-spec flex items-center gap-3 whitespace-nowrap tabular-nums">
                    FIG. {pad2(i + 1)}
                    <span className="hidden h-px min-w-2 flex-1 bg-current/50 lg:block" />
                  </span>
                  <h3 className="t-h3 mt-2.5 text-[color:var(--ink)] lg:mt-0">{keepHyphenated(tile.title)}</h3>
                  <p className="mt-2.5 max-w-[40ch] text-muted lg:col-start-2">{tile.text}</p>
                </div>
              </li>
            );
          })}
        </ul>

        <div className="site-grid mt-14 md:mt-16">
          <div className="col-span-full flex flex-wrap items-center gap-x-6 gap-y-4 border-t border-[color:var(--hairline)] pt-8 md:col-span-7">
            <Button href={basementHero.primaryCta.href} arrow>
              {basementHero.primaryCta.label}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
