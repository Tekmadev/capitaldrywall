import { HeroSequence } from "@/components/scenes/HeroSequence";
import { BasementTransform } from "@/components/scenes/BasementTransform";
import { RakingLightTest } from "@/components/scenes/RakingLightTest";
import { PrimaryServices, primaryServicePairs } from "@/components/sections/home/PrimaryServices";
import { Promises } from "@/components/sections/home/Promises";
import { SecondaryServices } from "@/components/sections/home/SecondaryServices";
import { FaqSection } from "@/components/sections/shared/FaqSection";
import { FinalCta } from "@/components/sections/shared/FinalCta";
import { GallerySection } from "@/components/sections/shared/GallerySection";
import { OwnerNoteSection } from "@/components/sections/shared/OwnerNoteSection";
import { ProcessSection } from "@/components/sections/shared/ProcessSection";
import { ServiceAreaSection } from "@/components/sections/shared/ServiceAreaSection";
import { StartingPrices } from "@/components/sections/shared/StartingPrices";
import { TrustStrip } from "@/components/ui/TrustStrip";
import {
  basementTeaser,
  homeFinalCta,
  homeHero,
  homeSectionIndex,
  rakingTest,
} from "@/content/copy/home";
import { ctas } from "@/content/copy/global";
import { projectsFor } from "@/content/projects";
import { pages, quoteHref } from "@/content/services";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("home");

const stripArrow = (label: string) => label.replace(/\s*→\s*$/, "");

/**
 * Recent work without the two pairs the service panels (§4) already show: the same photo twice on
 * one page reads as padding. Falls back to every frame if dropping them would leave a thin sheet.
 */
function recentWorkFrames() {
  const all = projectsFor("gallery");
  const shown = new Set(
    Object.values(primaryServicePairs()).flatMap((project) => (project ? [project.id] : [])),
  );
  const rest = all.filter((project) => !shown.has(project.id));
  return rest.length >= 3 ? rest : all;
}

/**
 * Home `/` (brief §9). Light and dark alternate with rhythm: the dark room (hero), the drawing
 * sheet (trust band, services), the dark room again (raking-light test, basement teaser), then
 * the sheets, with the process as one dark beat before the final CTA closes on the work light.
 */
export default function HomePage() {
  return (
    <>
      {/* 2 · The raking-light hero (data-hero="dark" lives on the scene) */}
      <HeroSequence
        h1={homeHero.h1}
        display={homeHero.display}
        sub={homeHero.sub}
        primaryCta={homeHero.primaryCta}
        call={homeHero.call}
        stages={homeHero.stages}
        scrollCue={homeHero.scrollCue}
        trustRow={<TrustStrip tone="dark" />}
      />

      {/* 3 · Trust strip, set as one dimension string. From 768 px the hero's final state already
          carries the same string (trustRow), so the band only runs where the hero hides it. */}
      <TrustStrip size="band" tone="light" className="md:hidden" />

      {/* 4 · Drywall / Basements */}
      <PrimaryServices />

      {/* 5 · The showpiece */}
      <RakingLightTest
        eyebrow={`${rakingTest.index} / ${rakingTest.eyebrow}`}
        sheet={`A-${rakingTest.index}`}
        title={rakingTest.title}
        body={rakingTest.body}
        instructionDesktop={rakingTest.instructionDesktop}
        instructionTouch={rakingTest.instructionTouch}
        labels={rakingTest.labels}
        caption={rakingTest.caption}
      />

      {/* 6 · Basement teaser (pinned, scrubbed) */}
      <BasementTransform
        variant="teaser"
        id="basement-finishing"
        index={basementTeaser.index}
        eyebrow={basementTeaser.eyebrow}
        sheet={`A-${basementTeaser.index}`}
        title={basementTeaser.title}
        body={basementTeaser.body}
        stages={basementTeaser.stages}
        conceptLabel={basementTeaser.cornerLabel}
        link={{ label: stripArrow(basementTeaser.link.label), href: basementTeaser.link.href }}
        quote={{ label: ctas.primary, href: quoteHref("basement-renovation") }}
      />

      {/* 7 · What you can count on */}
      <Promises />

      {/* 8 · Painting, bathrooms, kitchens */}
      <SecondaryServices />

      {/* 9 · How a job runs */}
      <ProcessSection variant="full" index={homeSectionIndex.process} tone="dark" />

      {/* 10 · Starting prices */}
      <StartingPrices index={homeSectionIndex.pricing} />

      {/* 11 · Recent work (flag `gallery`; samples only in demo mode; no repeats of §4's pairs) */}
      <GallerySection index={homeSectionIndex.gallery} items={recentWorkFrames()} />

      {/* 12 · Owner note (ReviewsSection when the `reviews` flag is on) */}
      <OwnerNoteSection tone="raised" />

      {/* 13 · Service area */}
      <ServiceAreaSection index={homeSectionIndex.serviceArea} />

      {/* 14 · FAQ (FAQPage JSON-LD from the same strings) */}
      <FaqSection page="home" path={pages.home} index={homeSectionIndex.faq} />

      {/* 15 · Final CTA */}
      <FinalCta title={homeFinalCta.title} body={homeFinalCta.body} />
    </>
  );
}
