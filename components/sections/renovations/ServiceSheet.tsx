import { Button } from "@/components/ui/Button";
import { DimensionLine } from "@/components/ui/DimensionLine";
import { VellumGrid } from "@/components/ui/drafting";
import { MediaFrame } from "@/components/ui/MediaFrame";
import type { RenovationSection } from "@/content/copy/renovations";
import { cn } from "@/lib/utils";
import { DrawOnView } from "./DrawOnView";
import { ctaLabel, DrawingTitle, ScopeSchedule } from "./parts";
import "./renovations.css";

export type ServiceSheetLayout = "bleed-left" | "bleed-right" | "band";

type ServiceSheetProps = {
  section: RenovationSection;
  /** Sheet number on the page (1-based): drives the detail bubble, FIG. number and spec numbers */
  number: number;
  /** bleed-left: photo off the left edge, text right · bleed-right: mirrored, tall photo · band: full-bleed strip */
  layout: ServiceSheetLayout;
  tone?: "light" | "dark";
  /** Optional dimension-line annotation under the answer paragraph. Must state a real fact. */
  annotation?: string;
};

/**
 * One renovation service as a drawing sheet: drawing title (bubble + heavy rule), the answer-first
 * paragraph, a scope schedule and the quote CTA, with the photo bleeding off a different edge on
 * each sheet so the three never read as one repeated template.
 */
export function ServiceSheet({ section, number, layout, tone = "light", annotation }: ServiceSheetProps) {
  const titleId = `${section.id}-title`;
  const dark = tone === "dark";

  const answer = (
    <>
      <p className="max-w-[58ch] text-[color:var(--ink)]">{section.body}</p>
      {annotation && <DimensionLine label={annotation} className="mt-8 max-w-[34rem]" />}
    </>
  );
  const cta = (
    <Button href={section.cta.href} arrow className="mt-10 w-full sm:w-auto">
      {ctaLabel(section.cta.label)}
    </Button>
  );
  const schedule = (className: string) => (
    <ScopeSchedule id={section.id} number={number} items={section.bullets} className={className} />
  );

  let body: React.ReactNode;
  if (layout === "band") {
    body = (
      <>
        <div className="site-grid">
          <DrawingTitle id={titleId} number={number} title={section.title} className="col-span-full md:col-span-8 lg:col-span-6" />
        </div>
        <MediaFrame
          media={section.image}
          ratio="var(--reno-band-ratio)"
          fig={number}
          marks={false}
          sizes="100vw"
          className="reno-band reno-bleed-x mt-14 lg:mt-16"
          captionClassName="reno-inset-l"
        />
        {/*
          Source order = reading order: answer → schedule → CTA (phones and tablets show it as is).
          Desktop: answer with the CTA under it on the left, the schedule spanning both rows on the
          right; the flexible second row keeps the CTA tucked under the answer.
        */}
        <div className="site-grid lg:grid-rows-[auto_1fr]">
          <div className="col-span-full mt-14 md:mt-12 md:pl-[4.75rem] lg:col-span-6 lg:row-start-1">{answer}</div>
          {schedule(
            "col-span-full mt-10 md:pl-[4.75rem] lg:col-span-5 lg:col-start-8 lg:row-span-2 lg:row-start-1 lg:mt-12 lg:pl-0",
          )}
          <div className="col-span-full md:pl-[4.75rem] lg:col-span-6 lg:row-start-2 lg:self-start">{cta}</div>
        </div>
      </>
    );
  } else {
    const text = (
      <div className="mt-14 md:mt-12 md:pl-[4.75rem]">
        {answer}
        {schedule("mt-10")}
        {cta}
      </div>
    );
    const left = layout === "bleed-left";
    body = (
      <div className="site-grid gap-y-14 lg:items-start">
        <div
          className={cn(
            "col-span-full lg:row-start-1",
            left ? "lg:col-span-5 lg:col-start-8" : "lg:col-span-6 lg:col-start-1",
          )}
        >
          <DrawingTitle id={titleId} number={number} title={section.title} />
          {text}
        </div>
        <div
          className={cn(
            "order-first col-span-full lg:order-none lg:row-start-1",
            left
              ? "reno-bleed-l md:col-span-10 lg:col-span-7 lg:col-start-1"
              : "reno-bleed-r md:col-span-9 md:col-start-4 lg:col-span-5 lg:col-start-8 lg:mt-24",
          )}
        >
          {left ? (
            <MediaFrame
              media={section.image}
              ratio="5 / 4"
              fig={number}
              sizes="(min-width: 1024px) 58vw, (min-width: 768px) 86vw, 100vw"
              captionClassName="reno-inset-l"
            />
          ) : (
            <MediaFrame
              media={section.imageTall}
              fig={number}
              sizes="(min-width: 1024px) 42vw, (min-width: 768px) 80vw, 100vw"
            />
          )}
        </div>
      </div>
    );
  }

  const className = cn(
    "reno-anchor relative overflow-x-clip",
    dark ? "surface-dark" : "surface-light texture-plaster",
    layout === "band" && "border-t border-[color:var(--hairline)]",
  );
  const content = (
    <>
      {layout === "band" && <VellumGrid className="hidden md:block" />}
      {dark && <span aria-hidden="true" className="rake-line reno-rake absolute inset-x-0 top-0" />}
      <div className="site-container section-y relative">{body}</div>
    </>
  );

  // Only dark sheets need the client wrapper: their rake line draws on as the section enters.
  return dark ? (
    <DrawOnView as="section" id={section.id} aria-labelledby={titleId} className={className}>
      {content}
    </DrawOnView>
  ) : (
    <section id={section.id} aria-labelledby={titleId} className={className}>
      {content}
    </section>
  );
}
