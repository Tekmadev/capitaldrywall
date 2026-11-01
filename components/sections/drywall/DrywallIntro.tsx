import { SheetRef } from "@/components/sections/shared/SheetRef";
import { Chip } from "@/components/ui/Chip";
import { VellumGrid } from "@/components/ui/drafting";
import { drywallIntro, drywallSubServices } from "@/content/copy/drywall";
import { pad2 } from "@/lib/utils";

type DrywallIntroProps = {
  /** Section number on the page, e.g. "01" */
  index?: string;
  /** Sheet code of the five service details, e.g. "A-02" */
  detailSheet: string;
};

/**
 * Answer-first intro (brief §11: kept intact) set like the general notes on a drawing sheet, with
 * the five sub-services as jump chips that read as the sheet's detail index.
 */
export function DrywallIntro({ index = "01", detailSheet }: DrywallIntroProps) {
  return (
    <section aria-label="Overview" className="surface-light texture-plaster section-y relative isolate overflow-x-clip">
      <VellumGrid className="max-md:[&_span>span]:hidden" />
      <div className="site-container relative">
        <SheetRef index={index} eyebrow="General notes" sheet={`A-${index}`} />

        <div className="site-grid mt-10 gap-y-12 md:mt-14 lg:mt-16">
          <p
            aria-hidden="true"
            className="t-spec col-span-full hidden tabular-nums md:col-span-1 md:block md:pt-2"
          >
            N.01
          </p>
          <p className="col-span-full text-[1.3125rem] leading-[1.5] text-[color:var(--ink)] md:col-span-10 md:text-[1.5rem] lg:col-span-8 lg:text-[1.75rem] lg:leading-[1.45]">
            {drywallIntro}
          </p>

          <nav
            aria-labelledby="drywall-on-this-page"
            className="col-span-full md:col-span-10 md:col-start-2 lg:col-span-9 lg:col-start-2"
          >
            <div className="flex items-center gap-4">
              <p id="drywall-on-this-page" className="t-spec whitespace-nowrap">
                On this page
              </p>
              <span aria-hidden="true" className="h-px w-10 bg-[color:var(--hairline)]" />
              <span aria-hidden="true" className="t-spec tabular-nums">
                Details 1–{drywallSubServices.length} / {detailSheet}
              </span>
            </div>
            <ul className="mt-5 flex flex-wrap gap-x-2.5 gap-y-3">
              {drywallSubServices.map((s, i) => (
                <li key={s.id} className="max-w-full">
                  <Chip href={`#${s.id}`} index={pad2(i + 1)}>
                    {s.chip}
                  </Chip>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </section>
  );
}
