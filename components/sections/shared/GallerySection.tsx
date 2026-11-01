import type { CSSProperties } from "react";
import { RegistrationMarks } from "@/components/ui/drafting";
import { MediaFrame } from "@/components/ui/MediaFrame";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { gallerySection } from "@/content/copy/global";
import { projectCaption, projectsFor, type Project } from "@/content/projects";
import { feature } from "@/content/site.config";
import { cn, pad2 } from "@/lib/utils";
import { sheetCode } from "./SheetRef";

/**
 * Contact-sheet geometry. The frames sit edge to edge in rows of three (twos where a three would
 * strand a lone frame), joined by hairlines. Every row runs the full width with unequal frames:
 * a row's frames share one height, so each ratio is its column span over the row height (in column
 * units), and the images, flush to the hairlines, line up exactly.
 */
type RowSize = 1 | 2 | 3;

const ROWS: Record<RowSize, readonly (readonly number[])[]> = {
  /** 12 columns, 3 units tall: 5:3 · 4:3 · 1:1, the order turning row by row */
  3: [
    [5, 4, 3],
    [3, 5, 4],
    [4, 3, 5],
  ],
  /** 12 columns, 4 units tall: 2:1 · 1:1, mirrored on alternate rows */
  2: [
    [8, 4],
    [4, 8],
  ],
  /** a lone frame across the sheet, 5 units tall */
  1: [[12]],
};
const ROW_UNITS: Record<RowSize, number> = { 3: 3, 2: 4, 1: 5 };

type Cell = { span: number; ratio: string; mobileSpan: 2 | 4; mobileRatio: string };

/** Frames per row for n frames: threes, then twos instead of leaving a single frame at the end. */
function rowSizes(n: number): RowSize[] {
  const rows: RowSize[] = [];
  for (let left = n; left > 0; ) {
    const take = left === 1 ? 1 : left === 2 || left === 4 ? 2 : 3;
    rows.push(take);
    left -= take;
  }
  return rows;
}

/**
 * Desktop: 12-column rows as above. Phones (4 columns): a three becomes one full-width frame over
 * a pair, a two is a pair, a lone frame runs full width. Below 360 px every frame runs full width
 * (a half-width frame would be about 140 px).
 */
function sheetCells(n: number): Cell[] {
  const seen: Record<RowSize, number> = { 1: 0, 2: 0, 3: 0 };
  return rowSizes(n).flatMap((size) => {
    const patterns = ROWS[size];
    const spans = patterns[seen[size]++ % patterns.length];
    return spans.map((span, i): Cell => {
      const lead = size !== 2 && i === 0;
      return {
        span,
        ratio: `${span} / ${ROW_UNITS[size]}`,
        mobileSpan: lead ? 4 : 2,
        mobileRatio: lead ? "3 / 2" : "4 / 5",
      };
    });
  });
}

/* Static class names (Tailwind only sees literal strings) */
const MD_SPAN: Record<number, string> = {
  3: "md:col-span-3",
  4: "md:col-span-4",
  5: "md:col-span-5",
  8: "md:col-span-8",
  12: "md:col-span-12",
};

export type GallerySectionProps = {
  index?: string;
  eyebrow?: string;
  title?: string;
  intro?: string;
  sheet?: string;
  id?: string;
  /** Override the frames (default: projectsFor("gallery")) */
  items?: readonly Project[];
  className?: string;
};

/**
 * Recent work as a contact sheet (brief §9 item 11, ART_DIRECTION row 11): one hairline-framed sheet
 * of after-photos, each frame under a mono frame number with its caption ("Popcorn ceiling removal ·
 * Kanata") beneath. Deliberately not the staggered editorial pairs used elsewhere on the page.
 * Flag `gallery`. Samples render only in demo mode, badged by MediaFrame. Returns null when the flag
 * is off or no frames remain.
 */
export function GallerySection({
  index,
  eyebrow = gallerySection.eyebrow,
  title = gallerySection.title,
  intro,
  sheet,
  id = "recent-work",
  items,
  className,
}: GallerySectionProps) {
  if (!feature("gallery")) return null;
  const frames = items ?? projectsFor("gallery");
  if (frames.length === 0) return null;
  const headingId = `${id}-title`;
  const cells = sheetCells(frames.length);

  return (
    <section id={id} aria-labelledby={headingId} className={cn("surface-light texture-plaster section-y", className)}>
      <div className="site-container">
        <SectionHeader
          index={index}
          eyebrow={eyebrow}
          sheet={sheetCode(index, sheet)}
          title={title}
          id={headingId}
          intro={intro}
          annotation={`${pad2(frames.length)} ${frames.length === 1 ? "FRAME" : "FRAMES"}`}
        />
        <div className="relative mt-14 md:mt-20">
          <RegistrationMarks />
          <ol className="grid grid-cols-4 gap-px border border-[color:var(--hairline)] bg-[color:var(--hairline)] md:grid-cols-12">
            {frames.map((project, i) => {
              const cell = cells[i];
              const small = cell.mobileSpan === 2;
              return (
                <li
                  key={project.id}
                  className={cn(
                    "flex min-w-0 flex-col bg-[color:var(--surface)]",
                    small
                      ? "col-span-4 [--frame-ratio:3/2] min-[360px]:col-span-2 min-[360px]:[--frame-ratio:var(--ratio-sm)]"
                      : "col-span-4 [--frame-ratio:var(--ratio-sm)]",
                    MD_SPAN[cell.span],
                    "md:[--frame-ratio:var(--ratio-md)]",
                  )}
                  style={{ "--ratio-sm": cell.mobileRatio, "--ratio-md": cell.ratio } as CSSProperties}
                >
                  {/* Frame number on the sheet's edge: 01 ───┤ (the list order carries it for AT) */}
                  <div aria-hidden="true" className="flex items-center gap-3 px-3 py-2.5 md:px-4 md:py-3">
                    <span className="t-spec text-[color:var(--ink)] tabular-nums">{pad2(i + 1)}</span>
                    <span className="h-px flex-1 bg-[color:var(--hairline)]" />
                    <span className="h-2.5 w-px bg-[color:var(--hairline)]" />
                  </div>
                  <MediaFrame
                    media={project.after}
                    sizes={`(min-width: 1440px) ${cell.span * 112}px, (min-width: 768px) ${Math.round((cell.span / 12) * 96)}vw, ${small ? "(min-width: 360px) 46vw, " : ""}92vw`}
                    ratio="var(--frame-ratio)"
                    marks={false}
                    caption={projectCaption(project)}
                    captionClassName="mt-0 px-3 pb-4 pt-3 md:px-4 md:pb-5"
                    labelClassName={
                      small
                        ? "max-md:bottom-2 max-md:left-2 max-md:px-2 max-md:py-1 max-md:text-[0.5625rem] max-md:tracking-[0.08em]"
                        : undefined
                    }
                  />
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
