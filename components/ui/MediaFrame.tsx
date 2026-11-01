import Image from "next/image";
import type { MediaAsset } from "@/content/media";
import { sampleBadge } from "@/content/projects";
import { isDemo } from "@/content/site.config";
import { cn } from "@/lib/utils";
import { DeferredMount } from "./DeferredMount";
import { RegistrationMarks } from "./drafting";

type MediaFrameProps = {
  media: MediaAsset;
  /** next/image sizes, e.g. "(min-width: 768px) 58vw, 100vw" (required: be accurate) */
  sizes: string;
  /** Figure number for the caption, e.g. 3 → "FIG. 03" */
  fig?: number | string;
  /** Caption text; defaults to media.caption. Pass false to hide. Never claim a client project. */
  caption?: string | false;
  /** Crop marks outside the corners (default true) */
  marks?: boolean;
  /** Override the frame ratio (CSS aspect-ratio value, e.g. "4 / 5"); defaults to the file's ratio */
  ratio?: string;
  /** Show the honesty label: "Concept visualization" for concept, the sample badge for samples */
  kindLabel?: boolean;
  /** Above-the-fold LCP image only */
  preload?: boolean;
  /** Mount the image only when it nears the viewport (below-the-fold images on pages with tall scenes) */
  defer?: boolean;
  quality?: 60 | 75 | 85;
  className?: string;
  imageClassName?: string;
  /** Extra classes for the caption (e.g. an inset so it aligns to the grid under an edge-bleeding image) */
  captionClassName?: string;
  /** Extra classes for the automatic honesty label (e.g. the compact badge in a small frame) */
  labelClassName?: string;
  /** Extra overlay content positioned inside the frame */
  children?: React.ReactNode;
};

/**
 * Image in the drawing-set language: registration marks, a mono figure caption with a leader line,
 * and automatic honesty labels. Sample media renders only in demo mode (returns null otherwise).
 */
export function MediaFrame({
  media,
  sizes,
  fig,
  caption,
  marks = true,
  ratio,
  kindLabel = true,
  preload = false,
  defer = false,
  quality = 75,
  className,
  imageClassName,
  captionClassName,
  labelClassName,
  children,
}: MediaFrameProps) {
  if (media.kind === "sample" && !isDemo) return null;

  const text = caption === false ? null : (caption ?? media.caption ?? null);
  const figLabel = fig !== undefined ? `FIG. ${String(fig).padStart(2, "0")}` : null;
  const image = (
    <Image
      src={media.src}
      alt={media.alt}
      fill
      sizes={sizes}
      quality={quality}
      preload={preload}
      loading={preload ? "eager" : "lazy"}
      className={cn("object-cover", imageClassName)}
    />
  );

  return (
    <figure className={cn("relative", className)}>
      <div
        className="relative overflow-hidden bg-[color:var(--surface-raised)]"
        style={{ aspectRatio: ratio ?? `${media.width} / ${media.height}` }}
      >
        {defer && !preload ? <DeferredMount>{image}</DeferredMount> : image}
        {kindLabel && media.kind === "concept" && <ConceptLabel className={labelClassName} />}
        {kindLabel && media.kind === "sample" && <SampleBadge className={labelClassName} />}
        {children}
      </div>
      {marks && <RegistrationMarks />}
      {(figLabel || text) && (
        <figcaption className={cn("t-spec mt-3 flex items-center gap-3", captionClassName)}>
          {figLabel && <span className="shrink-0 whitespace-nowrap tabular-nums">{figLabel}</span>}
          {figLabel && text && <span aria-hidden="true" className="h-px w-6 shrink-0 bg-current/50" />}
          {text && <span>{text}</span>}
        </figcaption>
      )}
    </figure>
  );
}

/** Corner label for AI-generated visualizations (brief §3, §7.3). */
export function ConceptLabel({ className, text = "Concept visualization" }: { className?: string; text?: string }) {
  return (
    <span
      className={cn(
        "absolute left-3 top-3 z-10 border border-white/15 bg-graphite/80 px-2.5 py-1.5 font-mono text-[0.625rem] font-medium uppercase leading-none tracking-[0.14em] text-plaster backdrop-blur-[2px]",
        className,
      )}
    >
      {text}
    </span>
  );
}

/** Demo-only badge for sample placeholders (brief §7.4). Renders nothing in production. */
export function SampleBadge({ className }: { className?: string }) {
  if (!isDemo) return null;
  return (
    <span
      className={cn(
        "absolute bottom-3 left-3 z-10 flex items-center gap-2 bg-graphite/85 px-2.5 py-1.5 font-mono text-[0.625rem] font-medium uppercase leading-none tracking-[0.12em] text-plaster",
        className,
      )}
    >
      <span aria-hidden="true" className="size-1.5 bg-worklight" />
      {sampleBadge}
    </span>
  );
}
