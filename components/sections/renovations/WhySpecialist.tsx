import { RevealHeading } from "@/components/motion/RevealHeading";
import { SheetRef, sheetCode } from "@/components/sections/shared/SheetRef";
import { whyDrywallSpecialist } from "@/content/copy/renovations";
import { DrawOnView } from "./DrawOnView";
import { WallElevation } from "./WallElevation";
import "./renovations.css";

/**
 * "Why a drywall specialist" band (dark): the argument in words on the left, and drawn on the
 * right as a keynoted wall elevation where paint, tile and cabinets all sit on the finished wall.
 */
export function WhySpecialist({ index, fig, id = "why-drywall-specialist" }: { index: string; fig: number; id?: string }) {
  const headingId = `${id}-title`;
  return (
    <DrawOnView as="section" id={id} aria-labelledby={headingId} className="surface-dark relative overflow-hidden">
      <span aria-hidden="true" className="rake-line reno-rake absolute inset-x-0 top-0" />
      <div aria-hidden="true" className="beam-rake pointer-events-none absolute inset-0 opacity-60" />
      <div className="site-container section-y relative">
        <SheetRef index={index} eyebrow="Why a drywall specialist" sheet={sheetCode(index)} />
        <div className="site-grid mt-12 gap-y-16 md:mt-16 lg:mt-20">
          <div className="col-span-full md:col-span-9 lg:col-span-5">
            <RevealHeading as="h2" id={headingId} className="t-h2 max-w-[15ch] text-[color:var(--ink)]">
              {whyDrywallSpecialist.title}
            </RevealHeading>
            <p className="t-lede mt-8 max-w-[38ch] text-muted lg:mt-10">{whyDrywallSpecialist.body}</p>
          </div>
          <WallElevation fig={fig} className="col-span-full lg:col-span-6 lg:col-start-7 lg:mt-2" />
        </div>
      </div>
    </DrawOnView>
  );
}
