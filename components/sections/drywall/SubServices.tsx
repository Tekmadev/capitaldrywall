import type { ReactNode } from "react";
import { BeforeAfterSlider } from "@/components/ui/BeforeAfterSlider";
import { MediaFrame } from "@/components/ui/MediaFrame";
import { drywallSubServices, type DrywallSubService } from "@/content/copy/drywall";
import { media, type MediaAsset } from "@/content/media";
import { projectsFor, type Project } from "@/content/projects";
import type { ServiceId } from "@/content/services";
import { SubServiceSection } from "./SubServiceSection";

/** The first before/after pair for a service on the drywall page (samples only exist in demo mode). */
function pairFor(service: ServiceId): Project | undefined {
  return projectsFor("drywall").find((p) => p.service === service && Boolean(p.before));
}

/**
 * Projects shown inside the sub-service sections. The page's before & after section leaves these
 * out, so no pair appears twice.
 */
export function featuredProjectIds(): string[] {
  return [pairFor("drywall-repair"), pairFor("popcorn-removal")]
    .filter((p): p is Project => Boolean(p))
    .map((p) => p.id);
}

type Plan = {
  /** Before/after pair, when one exists for this service */
  pair?: Project;
  /** Atmosphere still otherwise */
  still: MediaAsset;
  /** Crop the still: CSS aspect ratio + object position */
  crop?: { ratio: string; position: string };
  tone?: "light" | "dark";
  annotation?: string;
};

/** Media and tone per detail. Annotations restate facts from the copy deck. */
function plan(item: DrywallSubService): Plan {
  switch (item.id) {
    case "drywall-installation":
      return { still: media.wallStage1 };
    case "drywall-repair":
      return { pair: pairFor("drywall-repair"), still: media.tapingKnife16x9 };
    case "taping-mudding":
      return {
        still: media.wallStage3,
        tone: "dark",
        annotation: "3 coats · feathered wide",
        crop: { ratio: "1 / 1", position: "object-[70%_50%]" },
      };
    case "skim-coating-level-5":
      return { still: media.wallStage5, annotation: "Level 4 → Level 5" };
    case "popcorn-ceiling-removal":
      return { pair: pairFor("popcorn-removal"), still: media.smoothCeiling16x9 };
    default:
      return { still: media.wallStage4 };
  }
}

// Bleeding stills: six columns plus the margin to the viewport edge (≈ half the viewport) from 1024 px.
const STILL_VW = [50, 92, 100] as const;
const stillSizes = (k = 1) =>
  `(min-width: 1024px) ${Math.ceil(STILL_VW[0] * k)}vw, (min-width: 768px) ${Math.ceil(STILL_VW[1] * k)}vw, ${Math.ceil(STILL_VW[2] * k)}vw`;

/**
 * A crop narrower than the file (16:9 shown 1:1) is filled by scaling the photo up, so the browser
 * needs a source that much wider than the frame: widen `sizes` by the ratio of the two ratios.
 */
function sizesFor(still: MediaAsset, ratio?: string): string {
  if (!ratio) return stillSizes();
  const [w, h] = ratio.split("/").map((n) => Number(n.trim()));
  const k = still.width / still.height / (w / h);
  return stillSizes(Number.isFinite(k) && k > 1 ? k : 1);
}

// Sliders stay on the sheet: six columns of the 1440 container.
const PAIR_SIZES = "(min-width: 1440px) 672px, (min-width: 1024px) 46vw, (min-width: 768px) 88vw, calc(100vw - 40px)";

type SubServicesProps = {
  /** Sheet code shared by the details, e.g. "A-02" */
  sheet: string;
  /** FIG. number of the first figure */
  figStart: number;
};

/**
 * The five drywall sub-services (four when popcorn removal is switched off), alternating figure
 * right / left. Taping & mudding, "the part that decides whether a wall looks finished", is the one
 * dark sheet under the work light.
 */
export function SubServices({ sheet, figStart }: SubServicesProps) {
  const total = drywallSubServices.length;

  return drywallSubServices.map((item, i) => {
    const p = plan(item);
    const side = i % 2 === 0 ? "right" : "left";
    const fig = figStart + i;

    const figure: ReactNode = p.pair ? (
      <BeforeAfterSlider project={p.pair} fig={fig} sizes={PAIR_SIZES} initial={side === "right" ? 46 : 54} />
    ) : (
      <MediaFrame
        media={p.still}
        fig={fig}
        sizes={sizesFor(p.still, p.crop?.ratio)}
        ratio={p.crop?.ratio}
        imageClassName={p.crop?.position}
        defer
      />
    );

    return (
      <SubServiceSection
        key={item.id}
        item={item}
        n={i + 1}
        total={total}
        sheet={sheet}
        media={figure}
        side={side}
        bleed={!p.pair}
        tone={p.tone}
        annotation={p.annotation}
        flushTop={i === 0}
      />
    );
  });
}
