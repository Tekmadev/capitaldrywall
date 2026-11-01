import { whatWeBuild } from "@/content/copy/basement";
import { ctas } from "@/content/copy/global";
import { primaryServices } from "@/content/copy/home";
import { media } from "@/content/media";
import { projectsFor } from "@/content/projects";
import { quoteHref } from "@/content/services";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ServiceSplitCard } from "@/components/ui/ServiceSplitCard";
import { VellumGrid } from "@/components/ui/drafting";
import { cn } from "@/lib/utils";

/*
 * Panel widths. ≥1024: drywall 7 columns, basements 5 (at 1440 the content is 1344 px, a column
 * ≈ 82.7 px with 32 px gutters: 771 px and 541 px). 768–1023: an even 6 + 6 split, so the narrow
 * panel never squeezes its heading and link onto two lines. Below 768: full width.
 */
const SIZES = {
  drywall: "(min-width: 1440px) 771px, (min-width: 1024px) 54vw, (min-width: 768px) 46vw, calc(100vw - 40px)",
  basement: "(min-width: 1440px) 541px, (min-width: 1024px) 38vw, (min-width: 768px) 46vw, calc(100vw - 40px)",
};

/**
 * The before/after pair each panel shows (first eligible project per placement; samples only in
 * demo mode). The home page reads this too, so the Recent work sheet never repeats these frames.
 */
export function primaryServicePairs() {
  return {
    drywall: projectsFor("home-drywall-card")[0],
    basement: projectsFor("home-basement-card")[0],
  };
}

/** Production fallback caption for the concept rec room: the copy deck's own tile name. */
const recRoomCaption = whatWeBuild.tiles.find((tile) => tile.image === media.tileRecRoom)?.title ?? false;

/**
 * Home §4, "Two things, done properly." Two unequal, staggered panels on the drafting grid:
 * Drywall over seven columns, Basements over five, set lower with the intro hanging above it on
 * the same left edge. A dimension line under the H2 states the section's one fact.
 */
export function PrimaryServices({ id = "services", className }: { id?: string; className?: string }) {
  const headingId = `${id}-title`;
  const [drywall, basement] = primaryServices.cards;
  const pairs = primaryServicePairs();

  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className={cn("surface-light texture-plaster section-y relative isolate overflow-x-clip", className)}
    >
      {/* Registration crosses only from 768 px: on phones they would sit on the content */}
      <VellumGrid className="max-md:[&_span>span]:hidden" />
      <div className="site-container relative">
        <SectionHeader
          index={primaryServices.index}
          eyebrow={primaryServices.eyebrow}
          sheet={`A-${primaryServices.index}`}
          title={primaryServices.title}
          id={headingId}
          annotation="2 services · done properly"
        />

        <div className="site-grid mt-12 gap-y-14 md:mt-16 md:gap-y-16 lg:mt-20">
          <p className="t-lede col-span-full text-muted md:col-span-6 md:col-start-7 md:row-start-1 lg:col-span-4 lg:col-start-8">
            {primaryServices.intro}
          </p>

          {drywall && (
            <ServiceSplitCard
              className="col-span-full md:col-span-6 md:col-start-1 md:row-span-2 md:row-start-1 lg:col-span-7"
              index="01"
              fig={1}
              label={drywall.label}
              title={drywall.title}
              text={drywall.text}
              link={drywall.link}
              quote={{ label: ctas.primary, href: quoteHref("drywall") }}
              project={pairs.drywall}
              // Not the finished wall: the hero has just shown it. The craft itself instead.
              fallback={media.tapingKnife16x9}
              ratio="4 / 3"
              sizes={SIZES.drywall}
            />
          )}

          {basement && (
            <ServiceSplitCard
              className="col-span-full md:col-span-6 md:col-start-7 md:row-start-2 lg:col-span-5 lg:col-start-8"
              index="02"
              fig={2}
              label={basement.label}
              title={basement.title}
              text={basement.text}
              link={basement.link}
              quote={{ label: ctas.primary, href: quoteHref("basement-renovation") }}
              project={pairs.basement}
              fallback={media.tileRecRoom}
              fallbackCaption={recRoomCaption}
              ratio="4 / 5"
              sizes={SIZES.basement}
            />
          )}
        </div>
      </div>
    </section>
  );
}
