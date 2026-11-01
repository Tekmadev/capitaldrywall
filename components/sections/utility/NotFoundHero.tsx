import { SheetRef } from "@/components/sections/shared/SheetRef";
import { Button } from "@/components/ui/Button";
import { VellumGrid } from "@/components/ui/drafting";
import { notFoundCopy } from "@/content/copy/quote";
import { NotFoundWall } from "./NotFoundWall";

/**
 * 404 (brief §7.9): "This wall isn't finished yet." on a vellum sheet, beside a drafted elevation of
 * a half-taped wall that bleeds off the right edge. Static: no request data is read.
 */
export function NotFoundHero() {
  const { h1, body, buttons } = notFoundCopy;

  return (
    <section
      aria-labelledby="not-found-title"
      className="u-bleed surface-light texture-plaster relative isolate overflow-x-clip pb-20 pt-6 md:pb-28 md:pt-8 lg:pb-32"
    >
      <VellumGrid crosses={false} />
      <div className="site-container relative">
        {/* "Page not found" is the status label, not marketing copy */}
        <SheetRef index="404" eyebrow="Page not found" sheet="A-404" />

        <div className="site-grid mt-10 gap-y-14 md:mt-14 lg:mt-16 lg:items-start">
          <div className="col-span-full md:col-span-9 lg:col-span-5 lg:pt-2 xl:col-span-4">
            <h1
              id="not-found-title"
              className="t-display-l text-balance text-[color:var(--ink)] lg:text-[clamp(2.75rem,3.6vw,3.5rem)]! lg:leading-[1]!"
            >
              {h1}
            </h1>
            <p className="t-lede mt-8 max-w-[34ch] text-muted">{body}</p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Button href={buttons.home.href} variant="secondary">
                {buttons.home.label}
              </Button>
              <Button href={buttons.quote.href} arrow>
                {buttons.quote.label}
              </Button>
            </div>
          </div>

          <div className="u-bleed-right col-span-full min-w-0 lg:col-span-7 lg:col-start-6 xl:col-span-8 xl:col-start-5">
            <NotFoundWall />
          </div>
        </div>
      </div>
    </section>
  );
}
