import type { ReactNode } from "react";
import { FaqSection } from "@/components/sections/shared/FaqSection";
import { FinalCta } from "@/components/sections/shared/FinalCta";
import { GallerySection } from "@/components/sections/shared/GallerySection";
import { OwnerNoteSection } from "@/components/sections/shared/OwnerNoteSection";
import { ProcessSection } from "@/components/sections/shared/ProcessSection";
import { ReviewsSection } from "@/components/sections/shared/ReviewsSection";
import { ServiceAreaSection } from "@/components/sections/shared/ServiceAreaSection";
import { StartingPrices } from "@/components/sections/shared/StartingPrices";
import { Accordion } from "@/components/ui/Accordion";
import { drywallPrices } from "@/content/pricing";
import { feature } from "@/content/site.config";

function Demo({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <p className="surface-dark border-y border-white/10 py-2.5">
        <span className="site-container t-spec block text-worklight!">KS · Sections · {label}</span>
      </p>
      {children}
    </div>
  );
}

/**
 * Kitchen-sink partial for the shared sections group (`?only=sections`): every section and state.
 * Static props (staticStep, initialActive, still, defaultOpen) freeze interactive states for
 * screenshots; the last demo is the live pinned process track.
 */
export default function KitchenSinkSections() {
  return (
    <div id="ks-sections">
      <Demo label="ProcessSection full · desktop track, static at step 02 (vertical below 1024 px)">
        <ProcessSection index="06" staticStep={1} id="ks-process-track" />
      </Demo>
      <Demo label="ProcessSection full · vertical stepper (reduced motion / no JS / mobile)">
        <ProcessSection index="06" pin={false} id="ks-process-vertical" />
      </Demo>
      <Demo label="ProcessSection compact · drywall page (5 columns from 1024 px)">
        <ProcessSection variant="compact" id="ks-process-compact" />
      </Demo>

      <Demo label="StartingPrices home · 3-column finish schedule">
        <StartingPrices index="07" id="ks-pricing" />
      </Demo>
      <Demo label="StartingPrices drywall · 4 columns incl. quoted-per-project cells">
        <StartingPrices prices={drywallPrices} variant="drywall" id="ks-pricing-drywall" vellum={false} />
      </Demo>

      <Demo label={`GallerySection · contact sheet (flag gallery: ${feature("gallery") ? "on" : "off"})`}>
        <GallerySection index="08" id="ks-gallery" />
      </Demo>

      <Demo label="OwnerNoteSection · reviews flag off, no owner photo (raised tone)">
        <OwnerNoteSection id="ks-owner" tone="raised" />
      </Demo>
      <Demo label="ReviewsSection · renders nothing until real reviews exist (seam: reviews[] in ReviewsSection.tsx)">
        <ReviewsSection id="ks-reviews" />
        <p className="surface-light site-container t-spec py-6">(empty on purpose: no placeholder reviews, ever)</p>
      </Demo>

      <Demo label="ServiceAreaSection · Kanata highlighted (hover/focus state)">
        <ServiceAreaSection index="09" id="ks-area" initialActive="kanata" />
      </Demo>

      <Demo label="FaqSection home · one item open, FAQPage JSON-LD">
        <FaqSection page="home" path="/" index="10" id="ks-faq" defaultOpen={["basement-cost"]} />
      </Demo>
      <Demo label="FaqSection quote · mini FAQ, all closed">
        <FaqSection page="quote" path="/free-quote" id="ks-faq-quote" />
      </Demo>
      <Demo label="Accordion · empty items render nothing">
        <div className="surface-light site-container py-6">
          <Accordion items={[]} />
          <p className="t-spec">(nothing above this line)</p>
        </div>
      </Demo>

      <Demo label="FinalCta home · still beam">
        <FinalCta index="11" id="ks-final" still />
      </Demo>
      <Demo label="FinalCta with form slot · data-hide-action-bar, service=drywall-repair">
        <FinalCta
          id="ks-final-form"
          title="Got a wall that needs fixing?"
          body="Send a photo and we'll tell you what it takes."
          service="drywall-repair"
          still
          form={
            <div className="grid min-h-80 place-items-center border border-dashed border-white/25 p-8">
              <p className="t-spec">Compact quote form slot (forms group)</p>
            </div>
          }
        />
      </Demo>
      <Demo label="FinalCta · animated beam">
        <FinalCta id="ks-final-live" title="Ready to use your whole house?" body="Book a free site visit. We'll measure, check for moisture and talk through ideas, with no obligation." service="basement-renovation" />
      </Demo>

      <Demo label="ProcessSection full · LIVE pinned track (scroll; ≥1024 px with motion)">
        <ProcessSection index="06" id="ks-process-live" />
      </Demo>
    </div>
  );
}
