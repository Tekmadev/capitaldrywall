import Link from "next/link";
import { Fragment } from "react";
import type { MediaAsset } from "@/content/media";
import { projectCaption, type Project } from "@/content/projects";
import { isDemo } from "@/content/site.config";
import { cn } from "@/lib/utils";
import { BeforeAfterSlider } from "./BeforeAfterSlider";
import { ArrowIcon } from "./icons";
import { MediaFrame } from "./MediaFrame";

type Cta = { label: string; href: string };

export type ServiceSplitCardProps = {
  /** Mono label from the copy deck, e.g. "DRYWALL · INSTALL · REPAIR · FINISH" */
  label: string;
  title: string;
  text: string;
  /** Descriptive link to the service page; a trailing "→" in the copy is drawn as the dimension arrow */
  link: Cta;
  /** Secondary quote link, e.g. { label: "Get a Free Quote", href: quoteHref("drywall") } */
  quote?: Cta;
  /** Before/after pair for the thumbnail (projectsFor(...)[0]); falls back when absent or not allowed */
  project?: Project;
  /** Shown instead of the slider when there is no usable project (production without real photos) */
  fallback: MediaAsset;
  /** Caption for the fallback image; defaults to its registry caption. Never claims a client project. */
  fallbackCaption?: string | false;
  /** Card number in the label cell, e.g. "01" */
  index?: string;
  /** Figure number for the media caption: 1 → "FIG. 01" */
  fig?: number;
  /** CSS aspect-ratio shared by the slider and the fallback (default "4 / 3") */
  ratio?: string;
  /** next/image sizes for the media column. Be accurate. */
  sizes: string;
  headingAs?: "h2" | "h3";
  /** Heading id (use with aria-labelledby) */
  id?: string;
  className?: string;
};

const stripArrow = (label: string) => label.replace(/\s*→\s*$/, "");

/** "A · B · C" → unbreakable segments that carry their separator, so no line starts with "·". */
function labelSegments(label: string) {
  const parts = label.split(/\s+·\s+/);
  const last = parts.length - 1;
  return parts.map((part, i) => (
    <Fragment key={part}>
      <span className="whitespace-nowrap">
        {part}
        {i < last ? " ·" : ""}
      </span>
      {i < last ? " " : null}
    </Fragment>
  ));
}

/**
 * Primary-service panel (home §4): a before/after thumbnail (or an honest fallback image), a mono
 * label cell, an Archivo H3, one paragraph, the descriptive service link and an optional quote link.
 * Samples render only in demo mode (the slider badges them); production falls back to `fallback`.
 */
export function ServiceSplitCard({
  label,
  title,
  text,
  link,
  quote,
  project,
  fallback,
  fallbackCaption,
  index,
  fig,
  ratio = "4 / 3",
  sizes,
  headingAs: Heading = "h3",
  id,
  className,
}: ServiceSplitCardProps) {
  const pair =
    project?.before &&
    (isDemo || (!project.isSample && project.before.kind !== "sample" && project.after.kind !== "sample"))
      ? project
      : null;
  const figLabel = fig !== undefined ? `FIG. ${String(fig).padStart(2, "0")}` : null;

  return (
    <div className={cn("relative", className)}>
      {pair ? (
        <div>
          <BeforeAfterSlider project={pair} variant="thumb" ratio={ratio} sizes={sizes} />
          <p className="t-spec mt-3 flex items-start gap-3">
            {figLabel && <span className="shrink-0 tabular-nums">{figLabel}</span>}
            {figLabel && <span aria-hidden="true" className="mt-[0.7em] h-px w-6 shrink-0 bg-current/50" />}
            <span className="min-w-0">{labelSegments(projectCaption(pair))}</span>
          </p>
        </div>
      ) : (
        <MediaFrame media={fallback} sizes={sizes} ratio={ratio} fig={fig} caption={fallbackCaption} />
      )}

      <div className="mt-8 md:mt-10">
        <p className="t-spec flex items-center gap-3 border-t border-[color:var(--hairline)] pt-3">
          {index && <span className="tabular-nums text-[color:var(--ink)]">{index}</span>}
          {index && <span aria-hidden="true" className="h-px w-5 shrink-0 bg-current/50" />}
          <span className="min-w-0">{labelSegments(label)}</span>
        </p>
        <Heading id={id} className="t-h3 mt-5 text-[color:var(--ink)] lg:text-[1.875rem]!">
          {title}
        </Heading>
        <p className="mt-3 max-w-[46ch] text-muted">{text}</p>
        <div className="mt-5 flex flex-wrap items-center gap-x-8 gap-y-1">
          <Link
            href={link.href}
            className="group/link inline-flex min-h-11 items-center gap-3 font-medium text-[color:var(--ink)]"
          >
            <span className="link-draw">{stripArrow(link.label)}</span>
            <ArrowIcon className="shrink-0 transition-transform duration-300 ease-[var(--ease-rake)] group-hover/link:translate-x-1 motion-reduce:transition-none" />
          </Link>
          {quote && (
            <Link
              href={quote.href}
              // Two panels each carry "Get a Free Quote": name the service so the links differ out of context.
              aria-label={`${quote.label}: ${title.toLowerCase()}`}
              className="t-spec link-draw inline-flex min-h-11 items-center text-[color:var(--ink)]!"
            >
              {quote.label}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
