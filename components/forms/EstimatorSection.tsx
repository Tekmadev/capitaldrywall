import { SectionHeader } from "@/components/ui/SectionHeader";
import { estimatorCopy } from "@/content/copy/estimator";
import { cn } from "@/lib/utils";
import { Estimator, type EstimatorProps } from "./Estimator";

type EstimatorSectionProps = EstimatorProps & {
  /** Section number on the page, e.g. "06" */
  index?: string;
  /** Drawing-sheet code for the reference line, e.g. "B-06" */
  sheet?: string;
  /** Anchor for "Estimate my basement" (default "estimator") */
  id?: string;
  sectionClassName?: string;
};

/**
 * Drop-in basement page section: sheet-reference header (eyebrow, H2, intro from the copy deck)
 * over the estimate sheet, offset one column from the left. Anchor: `#estimator`.
 */
export function EstimatorSection({ index, sheet, id = "estimator", sectionClassName, ...props }: EstimatorSectionProps) {
  const titleId = `${id}-title`;
  return (
    <section
      id={id}
      aria-labelledby={titleId}
      className={cn("surface-light texture-plaster section-y relative isolate", sectionClassName)}
    >
      <div className="site-container">
        <SectionHeader
          index={index}
          eyebrow={estimatorCopy.eyebrow}
          sheet={sheet}
          id={titleId}
          title={estimatorCopy.title}
          intro={estimatorCopy.intro}
          layout="split"
        />
        <div className="site-grid mt-12 md:mt-16">
          <Estimator className="col-span-full lg:col-span-11 lg:col-start-2" {...props} />
        </div>
      </div>
    </section>
  );
}
