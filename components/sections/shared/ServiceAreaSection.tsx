import { RevealHeading } from "@/components/motion/RevealHeading";
import { AreaList, AreaMap } from "@/components/ui/AreaMap";
import { serviceAreaSection } from "@/content/copy/global";
import { cn } from "@/lib/utils";
import { AreaLinker } from "./AreaLinker";
import { SheetRef, sheetCode } from "./SheetRef";

export type ServiceAreaSectionProps = {
  index?: string;
  eyebrow?: string;
  title?: string;
  /** Body copy (alias: intro) */
  body?: string;
  intro?: string;
  sheet?: string;
  id?: string;
  /** Area key (slug) highlighted on load: static screenshots of the linked hover state */
  initialActive?: string;
  className?: string;
};

/**
 * Service area (brief §9 item 13, ART_DIRECTION row 13): the H2, body and the 16 areas in two
 * columns beside an abstract SVG plan of Ottawa. Hover/focus on a list item lights its point and
 * vice versa; each item links to /free-quote?area=….
 */
export function ServiceAreaSection({
  index,
  eyebrow = serviceAreaSection.eyebrow,
  title = serviceAreaSection.title,
  body,
  intro,
  sheet,
  id = "service-area",
  initialActive,
  className,
}: ServiceAreaSectionProps) {
  const headingId = `${id}-title`;
  const code = sheetCode(index, sheet);
  const text = body ?? intro ?? serviceAreaSection.body;

  return (
    <section id={id} aria-labelledby={headingId} className={cn("surface-light texture-plaster section-y", className)}>
      <div className="site-container">
        <SheetRef index={index} eyebrow={eyebrow} sheet={code} />
        <AreaLinker
          initialActive={initialActive}
          className="site-grid mt-10 gap-y-12 md:mt-14 lg:mt-16 lg:grid-rows-[auto_1fr] lg:gap-y-14"
        >
          <div className="col-span-full lg:col-span-5">
            <RevealHeading as="h2" id={headingId} className="t-h2 max-w-[16ch] text-[color:var(--ink)]">
              {title}
            </RevealHeading>
            <p className="t-lede mt-6 max-w-[44ch] text-muted">{text}</p>
          </div>
          <div className="col-span-full lg:col-span-7 lg:col-start-6 lg:row-span-2 lg:row-start-1">
            <AreaMap sheet={code} uid={`${id}-map`} />
          </div>
          <div className="col-span-full lg:col-span-5 lg:self-end">
            <AreaList />
          </div>
        </AreaLinker>
      </div>
    </section>
  );
}
