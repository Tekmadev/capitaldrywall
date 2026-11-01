import { cn, pad2 } from "@/lib/utils";
import { DetailBubble } from "./drafting";
import "./ProcessStepper.css";

export type ProcessStep = { title: string; body: string };

type ProcessStepperProps = {
  steps: readonly ProcessStep[];
  /** Sheet code printed under each bubble number, e.g. "A-06" */
  sheet?: string;
  /**
   * "track" (home): vertical stepper that becomes a horizontal panel track when an ancestor carries
   *   data-mode="track" (ProcessTrack sets it on desktop when motion is allowed).
   * "columns" (drywall page): vertical list below 1024 px, five joined columns from 1024 px.
   */
  layout?: "track" | "columns";
  headingLevel?: "h3" | "h4";
  className?: string;
};

/**
 * The five-step process as one ordered list (always server-rendered, readable without JS), joined
 * by a drafting dimension line through detail bubbles.
 */
export function ProcessStepper({ steps, sheet, layout = "track", headingLevel = "h3", className }: ProcessStepperProps) {
  const Heading = headingLevel;
  return (
    <div data-process-track="" className={cn("ps-track", layout === "columns" && "ps-columns", className)}>
      {layout === "track" && (
        <>
          <span aria-hidden="true" className="ps-line" />
          <span aria-hidden="true" data-process-progress="" className="ps-progress" />
        </>
      )}
      <ol className="ps-list">
        {steps.map((step, i) => (
          <li key={step.title} data-process-step={i} className="ps-step">
            <span aria-hidden="true" className="ps-connector" />
            <span aria-hidden="true" className="ps-marker">
              <DetailBubble top={pad2(i + 1)} bottom={sheet} />
            </span>
            <span aria-hidden="true" className="ps-leader" />
            <div className="ps-content">
              <Heading className="t-h3 ps-title">{step.title}</Heading>
              <p className="ps-body">{step.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
