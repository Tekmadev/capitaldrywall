import type { Metadata } from "next";
import { DrywallHero } from "@/components/sections/drywall/DrywallHero";
import { DrywallIntro } from "@/components/sections/drywall/DrywallIntro";
import { FinishLevels } from "@/components/sections/drywall/FinishLevels";
import { featuredProjectIds, SubServices } from "@/components/sections/drywall/SubServices";
import { BeforeAfterSection } from "@/components/sections/shared/BeforeAfterSection";
import { FaqSection } from "@/components/sections/shared/FaqSection";
import { FinalCta } from "@/components/sections/shared/FinalCta";
import { ProcessSection } from "@/components/sections/shared/ProcessSection";
import { StartingPrices } from "@/components/sections/shared/StartingPrices";
import { CompactQuoteForm } from "@/components/forms/CompactQuoteForm";
import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";
import { ServiceJsonLd } from "@/components/seo/ServiceJsonLd";
import {
  drywallBreadcrumb,
  drywallFinalCta,
  drywallPricingCopy,
  drywallSubServices,
} from "@/content/copy/drywall";
import { drywallPrices } from "@/content/pricing";
import { projectsFor } from "@/content/projects";
import { pages } from "@/content/services";
import { pageMetadata } from "@/lib/seo";
import { pad2 } from "@/lib/utils";

export const metadata: Metadata = pageMetadata("drywall");

/** Drawing-set numbering: sections are sheets A-01…; the sub-services are details 1–5 on one sheet. */
function sheets() {
  const featured = featuredProjectIds();
  const showBeforeAfter = projectsFor("drywall").some((p) => Boolean(p.before) && !featured.includes(p.id));
  type Sheet = "intro" | "details" | "finish" | "beforeAfter" | "prices" | "process" | "faq" | "cta";
  const order: Sheet[] = ["intro", "details", "finish", "beforeAfter", "prices", "process", "faq", "cta"].filter(
    (key): key is Sheet => key !== "beforeAfter" || showBeforeAfter,
  );
  const index = (key: Sheet) => pad2(order.indexOf(key) + 1);
  return { featured, showBeforeAfter, index };
}

/** Drywall `/drywall-ottawa` (brief §9 Drywall, §7.4, §7.7, §11). */
export default function DrywallPage() {
  const { featured, showBeforeAfter, index } = sheets();
  const details = drywallSubServices.length;
  const fig = {
    hero: 1,
    details: 2,
    finish: 2 + details,
    beforeAfter: 3 + details,
  };

  return (
    <>
      <DrywallHero fig={pad2(fig.hero)} />
      <DrywallIntro index={index("intro")} detailSheet={`A-${index("details")}`} />
      <SubServices sheet={`A-${index("details")}`} figStart={fig.details} />
      <FinishLevels index={index("finish")} fig={fig.finish} />
      {showBeforeAfter && (
        <BeforeAfterSection
          placement="drywall"
          index={index("beforeAfter")}
          sheet={`A-${index("beforeAfter")}`}
          figStart={fig.beforeAfter}
          exclude={featured}
        />
      )}
      <StartingPrices
        variant="drywall"
        prices={drywallPrices}
        eyebrow={drywallPricingCopy.eyebrow}
        title={drywallPricingCopy.title}
        index={index("prices")}
      />
      <ProcessSection variant="compact" tone="dark" index={index("process")} />
      <FaqSection page="drywall" path={pages.drywall} index={index("faq")} />
      <FinalCta
        title={drywallFinalCta.title}
        body={drywallFinalCta.body}
        service={drywallFinalCta.service}
        form={<CompactQuoteForm />}
        index={index("cta")}
      />

      <ServiceJsonLd page="drywall" />
      <BreadcrumbJsonLd trail={drywallBreadcrumb} />
    </>
  );
}
