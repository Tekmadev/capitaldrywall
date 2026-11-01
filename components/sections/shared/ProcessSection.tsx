import { ProcessStepper } from "@/components/ui/ProcessStepper";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { processSection } from "@/content/copy/global";
import { cn, pad2 } from "@/lib/utils";
import { ProcessTrack } from "./ProcessTrack";
import { sheetCode } from "./SheetRef";

export type ProcessSectionProps = {
  /** "full" (home): pinned horizontal track on desktop. "compact" (drywall): five columns, no pinning. */
  variant?: "full" | "compact";
  index?: string;
  eyebrow?: string;
  title?: string;
  intro?: string;
  sheet?: string;
  id?: string;
  tone?: "light" | "dark";
  /** Set false to never pin (the vertical stepper stays) */
  pin?: boolean;
  /** Kitchen sink / screenshots: show the desktop track statically at this step (0-based), no pinning */
  staticStep?: number;
  className?: string;
};

/**
 * "How a job runs." (brief §9 item 9, ART_DIRECTION row 9). All five steps are server-rendered as an
 * ordered list. Full: desktop ≥1024 px with motion pins the section and slides the step panels along
 * one long dimension line, with a "STEP 02 / 05" readout. The same desktop without the pinned track
 * (reduced motion, no JS) reads the five steps as one joined schedule across the section (the
 * compact layout); below 1024 px it is a vertical stepper.
 */
export function ProcessSection({
  variant = "full",
  index,
  eyebrow = processSection.eyebrow,
  title = processSection.title,
  intro,
  sheet,
  id = "process",
  tone = "light",
  pin = true,
  staticStep,
  className,
}: ProcessSectionProps) {
  const headingId = `${id}-title`;
  const code = sheetCode(index, sheet);
  const steps = processSection.steps;
  const surface = tone === "dark" ? "surface-dark beam-rake" : "surface-light texture-plaster";
  const header = (
    <SectionHeader index={index} eyebrow={eyebrow} sheet={code} title={title} id={headingId} intro={intro} />
  );

  if (variant === "compact") {
    return (
      <section id={id} aria-labelledby={headingId} className={cn(surface, "section-y", className)}>
        <div className="site-container">
          {header}
          <ProcessStepper steps={steps} sheet={code} layout="columns" className="mt-12 md:mt-16 lg:mt-20" />
        </div>
      </section>
    );
  }

  return (
    <section id={id} aria-labelledby={headingId} className={cn(surface, "overflow-x-clip", className)}>
      <ProcessTrack
        enabled={pin}
        staticStep={staticStep}
        pinClassName={cn(
          "section-y overflow-x-clip",
          "group-data-[pinned]/process:flex group-data-[pinned]/process:min-h-svh group-data-[pinned]/process:flex-col group-data-[pinned]/process:justify-center",
          "group-data-[pinned]/process:py-[calc(var(--header-h)+2rem)]",
        )}
      >
        <div className="site-container">
          <div className="relative">
            {header}
            <p
              aria-hidden="true"
              className="t-spec absolute right-0 bottom-1 hidden items-center gap-3 tabular-nums group-data-[mode=track]/process:flex"
            >
              <span className="h-px w-10 bg-current/50" />
              <span>
                Step <span data-process-current="">01</span> / {pad2(steps.length)}
              </span>
            </p>
          </div>
          <div data-process-viewport="" className="mt-12 md:mt-16 lg:mt-20 group-data-[mode=track]/process:mt-14">
            <div className="max-w-3xl lg:max-w-none">
              <ProcessStepper steps={steps} sheet={code} layout="track" />
            </div>
          </div>
        </div>
      </ProcessTrack>
    </section>
  );
}
