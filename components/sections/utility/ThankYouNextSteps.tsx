import { NextSteps, asHeading } from "@/components/sections/quote/NextSteps";
import { SheetRef } from "@/components/sections/shared/SheetRef";
import { DimensionLine } from "@/components/ui/DimensionLine";
import { VellumGrid } from "@/components/ui/drafting";
import { quoteSidebar, thankYou } from "@/content/copy/quote";
import { site } from "@/content/site.config";

/**
 * /thank-you "What happens next": the three steps as one ruled schedule row set on the drawing grid.
 * It spans 12 columns at md and 9 at lg (the heading takes the first 3), so each step is a whole
 * number of columns and the dividers sit on the vellum column lines. A dimension line from step 01
 * to the divider before step 03 states the real reply promise (we call within one business day).
 * The request is already sent, so the mobile "Get a Free Quote" bar stays away (data-hide-action-bar).
 */
export function ThankYouNextSteps({ sheet }: { sheet: string }) {
  return (
    <section
      aria-labelledby="next-steps-title"
      data-hide-action-bar=""
      className="surface-light texture-plaster section-y-tight relative isolate overflow-x-clip"
    >
      <VellumGrid crosses={false} />
      <div className="site-container relative">
        <SheetRef index="02" eyebrow="Next steps" sheet={sheet} />
        <div className="site-grid mt-10 gap-y-10 md:mt-14 lg:mt-16">
          <h2 id="next-steps-title" className="t-h2 col-span-full max-w-[11ch] text-[color:var(--ink)] lg:col-span-3">
            {asHeading(quoteSidebar.nextStepsTitle)}
          </h2>
          <div className="col-span-full lg:col-span-9 lg:col-start-4 lg:self-end">
            <div className="mb-3 hidden md:grid md:grid-cols-3 md:gap-x-[var(--gutter)]" aria-hidden="true">
              {/* Runs across the gutter to end on the divider, like the extension line it meets */}
              <div className="col-span-2 mr-[calc(-1*var(--gutter))]">
                <DimensionLine label={site.responsePromise} />
              </div>
            </div>
            <NextSteps layout="schedule" steps={thankYou.nextSteps} sheet={sheet} />
          </div>
        </div>
      </div>
    </section>
  );
}
