import { Estimator } from "@/components/forms/Estimator";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { estimatorSection } from "@/content/copy/basement";
import { cn } from "@/lib/utils";

type BasementEstimatorProps = {
  index?: string;
  sheet?: string;
  className?: string;
};

/**
 * Budget estimator section (brief §7.5, §9.6): sheet-reference header with the basement copy, over
 * the estimate sheet. Anchor `#estimator` is the hero's "Estimate my basement" target; the header
 * offset comes from html's scroll-padding-top (header height + 1 rem), which SmoothScroll honours.
 */
export function BasementEstimator({ index = "06", sheet = "B-06", className }: BasementEstimatorProps) {
  const titleId = `${estimatorSection.id}-title`;
  return (
    <section
      id={estimatorSection.id}
      aria-labelledby={titleId}
      className={cn("surface-light texture-plaster section-y relative isolate", className)}
    >
      <div className="site-container">
        <SectionHeader
          index={index}
          eyebrow={estimatorSection.eyebrow}
          sheet={sheet}
          id={titleId}
          title={estimatorSection.title}
          intro={<p>{estimatorSection.intro}</p>}
          layout="split"
        />
        <div className="site-grid mt-12 md:mt-16">
          <Estimator className="col-span-full lg:col-span-11 lg:col-start-2" />
        </div>
      </div>
    </section>
  );
}
