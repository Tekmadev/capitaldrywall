import { ThankYouHero } from "@/components/sections/utility/ThankYouHero";
import { ThankYouNextSteps } from "@/components/sections/utility/ThankYouNextSteps";
import { integrations } from "@/content/site.config";
import { pageMetadata, pageSeo } from "@/lib/seo";

/** noindex,follow (pageSeo.thankYou.noindex) */
export const metadata = pageMetadata("thankYou");

/** The request continues the quote sheet, so it carries the same code. */
const SHEET = pageSeo.freeQuote.og?.sheet ?? "A-04";

/** /thank-you (brief §9 utility pages): the level settles, then what happens next. */
export default function ThankYouPage() {
  return (
    <>
      <ThankYouHero bookingUrl={integrations.bookingUrl} sheet={SHEET} />
      <ThankYouNextSteps sheet={SHEET} />
    </>
  );
}
