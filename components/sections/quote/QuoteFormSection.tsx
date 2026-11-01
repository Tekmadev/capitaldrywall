import { QuoteForm } from "@/components/forms/QuoteForm";
import { SheetRef } from "@/components/sections/shared/SheetRef";
import { visibleTrail } from "@/components/sections/utility/trail";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Button } from "@/components/ui/Button";
import { DimensionLine } from "@/components/ui/DimensionLine";
import { VellumGrid } from "@/components/ui/drafting";
import { quoteSteps } from "@/content/copy/forms";
import { ctas } from "@/content/copy/global";
import { quoteHeader } from "@/content/copy/quote";
import { site } from "@/content/site.config";
import { MAX_PHOTOS } from "@/lib/quote/schema";
import { pageSeo } from "@/lib/seo";
import { QuoteSidebar } from "./QuoteSidebar";

type QuoteFormSectionProps = {
  /** integrations.bookingUrl (server-only env); null hides the booking row */
  bookingUrl: string | null;
  /** The page's drawing-sheet code (A-04, as on its share card) */
  sheet: string;
};

/**
 * /free-quote, first sheet (brief §9): H1 + sub hung off the headline, the three-step QuoteForm in
 * 7 of 12 columns under a dimension line that states its real size, and the "Prefer to talk?" title
 * block in columns 9–12 (sticky on desktop when the viewport is tall enough to show all of it).
 */
export function QuoteFormSection({ bookingUrl, sheet }: QuoteFormSectionProps) {
  const seo = pageSeo.freeQuote;

  return (
    <section
      aria-labelledby="quote-title"
      className="surface-light texture-plaster relative isolate overflow-x-clip pb-24 pt-3 md:pb-32 md:pt-5 lg:pb-40"
    >
      <VellumGrid crosses={false} />
      <div className="site-container relative">
        <Breadcrumbs items={visibleTrail("freeQuote")} />
        <SheetRef index="01" eyebrow={seo.og?.label ?? seo.name} sheet={sheet} className="mt-2 md:mt-4" />

        <div className="site-grid mt-10 gap-y-6 md:mt-14 lg:mt-16">
          <h1 id="quote-title" className="t-display-l col-span-full text-[color:var(--ink)]">
            {quoteHeader.h1}
          </h1>
          {/* Hanging indent: the sub starts one column in from the headline */}
          <div className="col-span-full flex flex-col items-start gap-6 md:col-span-7 md:col-start-2 lg:col-span-5 lg:col-start-2">
            <p className="t-lede text-muted">{quoteHeader.sub}</p>
            <Button
              href={`tel:${site.phone.e164}`}
              variant="call"
              size="sm"
              trackLocation="quote-header"
              className="lg:hidden"
            >
              {ctas.call}
            </Button>
          </div>
        </div>

        {/* Row 1: the dimension line over the form. Row 2: form + title block, tops aligned. */}
        <div className="site-grid mt-14 md:mt-16 lg:mt-20">
          <DimensionLine
            label={`${quoteSteps.length} steps · up to ${MAX_PHOTOS} photos`}
            className="col-span-full mb-5 lg:col-span-7"
          />
          {/* No Suspense here: QuoteForm suspends nowhere (its query reader has its own boundary),
              and a boundary this large gets outlined to the end of the HTML and swapped in by
              script, which left no-JS visitors an empty box instead of the single-page form. */}
          <div className="col-span-full min-w-0 lg:col-span-7 lg:row-start-2">
            <QuoteForm />
          </div>

          {/* Under the form at tablet width it spans the sheet as a two-column title block */}
          <aside
            aria-labelledby="quote-talk-title"
            className="col-span-full mt-20 lg:col-span-4 lg:col-start-9 lg:row-start-2 lg:mt-0 lg:self-start lg:[@media(min-height:50rem)]:sticky lg:[@media(min-height:50rem)]:top-[calc(var(--header-h)+2.75rem)]"
          >
            <QuoteSidebar bookingUrl={bookingUrl} sheet={sheet} titleId="quote-talk-title" />
          </aside>
        </div>
      </div>
    </section>
  );
}
