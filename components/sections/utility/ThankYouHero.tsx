import { Fragment } from "react";
import { SheetRef } from "@/components/sections/shared/SheetRef";
import { Button } from "@/components/ui/Button";
import { LevelVial } from "@/components/ui/LevelVial";
import { thankYou } from "@/content/copy/quote";
import { pageSeo } from "@/lib/seo";
import { ThankYouBody } from "./ThankYouBody";

type ThankYouHeroProps = {
  /** integrations.bookingUrl: "Book a site visit" renders only when it is set */
  bookingUrl: string | null;
  sheet: string;
};

/** "Level. We've got it." → ["Level.", "We've got it."]: one display line per sentence. */
function sentenceLines(text: string): string[] {
  return text.split(/(?<=[.!?])\s+/).filter(Boolean);
}

/**
 * /thank-you (brief §7.9, §9): the dark sheet where the work light finds a level wall. The H1 sets
 * one sentence per line; the spirit level sits beside "Level." on a dashed true-level datum that
 * runs off the right edge, settles (LevelVial's damped wobble) and turns level-green, then the 0°
 * annotation lands. The body greets the visitor by first name (client island).
 */
export function ThankYouHero({ bookingUrl, sheet }: ThankYouHeroProps) {
  const { buttons } = thankYou;

  return (
    <section
      data-hero="dark"
      aria-labelledby="thank-you-title"
      className="u-bleed surface-dark beam-rake relative isolate overflow-x-clip pb-20 pt-[calc(var(--header-h)+1.5rem)] md:pb-28 md:pt-[calc(var(--header-h)+2.5rem)] lg:pb-32"
    >
      <div className="site-container">
        <SheetRef index="01" eyebrow={pageSeo.thankYou.name} sheet={sheet} />

        <div className="site-grid mt-12 gap-y-10 md:mt-16 lg:mt-24">
          <h1 id="thank-you-title" className="t-display-xl col-span-full text-[color:var(--ink)] lg:row-start-1">
            {sentenceLines(thankYou.h1).map((line, i) => (
              <Fragment key={line}>
                {/* Collapses between the block lines, but keeps the heading's text "Level. We've got it." */}
                {i > 0 && " "}
                <span className="-mb-[0.12em] block overflow-hidden pb-[0.12em]">
                  <span className="ty-line block" style={{ animationDelay: `${i * 90}ms` }}>
                    {line}
                  </span>
                </span>
              </Fragment>
            ))}
          </h1>

          {/* On desktop the level shares the first headline line, to the right of "Level." */}
          <div className="ty-stage relative col-span-full lg:col-span-6 lg:col-start-7 lg:row-start-1 lg:self-start lg:mt-[0.6vw]">
            <span
              aria-hidden="true"
              className="ty-datum pointer-events-none absolute -left-2.5 top-1/2 right-[calc(-1*var(--u-bleed))] md:-left-5 border-t border-dashed border-[color:var(--spec)]/70"
            />
            <span aria-hidden="true" className="absolute -left-2.5 top-1/2 h-3 w-px -translate-y-1/2 bg-[color:var(--spec)] md:-left-5" />
            <LevelVial state="level" size="lg" className="relative flex w-[82%] max-w-[34rem]" />
            <span
              aria-hidden="true"
              className="ty-zero t-spec absolute bottom-1/2 left-[calc(min(82%,34rem)+0.75rem)] mb-1.5 tabular-nums"
            >
              0°
            </span>
          </div>

          <div className="ty-fade col-span-full md:col-span-9 lg:col-span-6 lg:row-start-2">
            <ThankYouBody className="t-lede max-w-[46ch] text-[color:var(--ink)]" />
            <div className="mt-10 flex flex-wrap gap-3">
              <Button href={buttons.home.href} arrow>
                {buttons.home.label}
              </Button>
              <Button href={buttons.call.href} variant="call" trackLocation="thank-you">
                {buttons.call.label}
              </Button>
              {bookingUrl && (
                <Button href={bookingUrl} variant="secondary" arrow>
                  {buttons.booking.label}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
