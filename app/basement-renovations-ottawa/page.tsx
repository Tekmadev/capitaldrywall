import type { Metadata } from "next";
import { CompactQuoteForm } from "@/components/forms/CompactQuoteForm";
import { BasementTransform } from "@/components/scenes/BasementTransform";
import { WallLayers } from "@/components/scenes/WallLayers";
import { BasementEstimator } from "@/components/sections/basement/BasementEstimator";
import { BasementHeroMeta } from "@/components/sections/basement/BasementHeroMeta";
import { BasementIntro } from "@/components/sections/basement/BasementIntro";
import { BasementTimeline } from "@/components/sections/basement/BasementTimeline";
import { WhatsIncluded } from "@/components/sections/basement/WhatsIncluded";
import { WhatWeBuild } from "@/components/sections/basement/WhatWeBuild";
import { BeforeAfterSection } from "@/components/sections/shared/BeforeAfterSection";
import { FaqSection } from "@/components/sections/shared/FaqSection";
import { FinalCta } from "@/components/sections/shared/FinalCta";
import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";
import { ServiceJsonLd } from "@/components/seo/ServiceJsonLd";
import {
  basementBreadcrumb,
  basementFinalCta,
  basementHero,
  builtForOttawa,
} from "@/content/copy/basement";
import { projectsFor } from "@/content/projects";
import { pages } from "@/content/services";
import { isDemo } from "@/content/site.config";
import { pageMetadata } from "@/lib/seo";
import { pad2 } from "@/lib/utils";

export const metadata: Metadata = pageMetadata("basement");

/**
 * Same test BeforeAfterSection applies before rendering itself (samples only in demo mode), so the
 * sheet numbers after it close up when it hides.
 */
const hasBeforeAfter = projectsFor("basement").some(
  (p) =>
    Boolean(p.before) &&
    (isDemo || (!p.isSample && p.before?.kind !== "sample" && p.after.kind !== "sample")),
);

/** Section number + drawing-sheet code ("06" → B-06: sheet B is the basement set; the hero is B-01). */
const sheet = (n: number) => ({ index: pad2(n), sheet: `B-${pad2(n)}` });

export default function BasementPage() {
  const shift = hasBeforeAfter ? 1 : 0;

  return (
    <>
      <ServiceJsonLd page="basement" />
      <BreadcrumbJsonLd trail={basementBreadcrumb} />

      <BasementTransform
        variant="hero"
        h1={basementHero.h1}
        display={basementHero.display}
        sub={basementHero.sub}
        primaryCta={basementHero.primaryCta}
        secondaryCta={basementHero.estimateCta}
        stages={basementHero.stages}
        conceptLabel={basementHero.cornerLabel}
        meta={<BasementHeroMeta />}
      />

      <BasementIntro {...sheet(2)} />

      <WhatWeBuild {...sheet(3)} />

      <WhatsIncluded {...sheet(4)} />

      <WallLayers
        id="built-for-ottawa"
        eyebrow="Built for Ottawa"
        title={builtForOttawa.title}
        answer={builtForOttawa.answer}
        layers={builtForOttawa.layers}
        {...sheet(5)}
      />

      <BasementEstimator {...sheet(6)} />

      <BasementTimeline {...sheet(7)} />

      {hasBeforeAfter && <BeforeAfterSection placement="basement" {...sheet(8)} />}

      <FaqSection page="basement" path={pages.basement} {...sheet(8 + shift)} />

      <FinalCta
        title={basementFinalCta.title}
        body={basementFinalCta.body}
        service={basementFinalCta.service}
        form={<CompactQuoteForm service="basement-renovation" />}
        {...sheet(9 + shift)}
      />
    </>
  );
}
