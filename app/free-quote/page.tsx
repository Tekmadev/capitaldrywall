import { QuoteAbout } from "@/components/sections/quote/QuoteAbout";
import { QuoteFormSection } from "@/components/sections/quote/QuoteFormSection";
import { FaqSection } from "@/components/sections/shared/FaqSection";
import { ServiceAreaSection } from "@/components/sections/shared/ServiceAreaSection";
import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";
import { pages } from "@/content/services";
import { integrations } from "@/content/site.config";
import { pageMetadata, pageSeo } from "@/lib/seo";

export const metadata = pageMetadata("freeQuote");

/** Every section on this page is a detail on one sheet: A-04 (the code on its share card). */
const SHEET = pageSeo.freeQuote.og?.sheet ?? "A-04";

/**
 * /free-quote (brief §9): H1 + sub → QuoteForm beside the "Prefer to talk?" title block → About
 * (dark) → service area → mini FAQ. Light page, so the header renders solid.
 */
export default function FreeQuotePage() {
  return (
    <>
      <QuoteFormSection bookingUrl={integrations.bookingUrl} sheet={SHEET} />
      <QuoteAbout index="02" sheet={SHEET} />
      <ServiceAreaSection index="03" sheet={SHEET} />
      <FaqSection page="quote" path={pages.quote} index="04" sheet={SHEET} className="surface-raised" />
      <BreadcrumbJsonLd page="freeQuote" />
    </>
  );
}
