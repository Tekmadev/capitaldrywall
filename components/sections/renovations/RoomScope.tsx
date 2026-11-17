import { Button } from "@/components/ui/Button";
import { DimensionLine } from "@/components/ui/DimensionLine";
import type { RoomSection } from "@/content/copy/renovations";
import { cn, pad2 } from "@/lib/utils";
import { ctaLabel, ScopeSchedule } from "./parts";
import "./renovations.css";

/**
 * The sheet under each room's transformation: the two ways we take the job on, set side by side as
 * two schedules on one drawing ("Full remodel" and "Refresh"), the trades note on a dimension line
 * and the room's quote CTA. Same schedule device as the painting sheet, so the page reads as one set.
 */
export function RoomScope({
  section,
  number,
  id,
  className,
}: {
  section: RoomSection;
  /** Sheet number on the page (1-based), shared with the transformation above */
  number: number;
  id?: string;
  className?: string;
}) {
  const headingId = `${section.id}-scope-title`;
  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className={cn("surface-light texture-plaster section-y-tight relative overflow-x-clip", className)}
    >
      <div className="site-container">
        <div className="site-grid gap-y-10">
          <div className="col-span-full md:col-span-4">
            <p className="t-spec flex items-center gap-3">
              <span className="tabular-nums">{pad2(number)} / Scope</span>
              <span aria-hidden="true" className="h-px flex-1 bg-[color:var(--hairline)]" />
            </p>
            <h3 id={headingId} className="t-h3 mt-5 text-[color:var(--ink)]">
              Two ways to do a {section.room}.
            </h3>
            <DimensionLine label="Licensed trades · one contact" className="mt-8 max-w-[26rem]" />
            <p className="mt-4 max-w-[40ch] text-muted">{section.note}</p>
            <Button href={section.cta.href} arrow className="mt-10 w-full sm:w-auto">
              {ctaLabel(section.cta.label)}
            </Button>
          </div>

          <div className="col-span-full grid gap-x-[var(--gutter)] gap-y-10 sm:grid-cols-2 md:col-span-8">
            {section.scopes.map((scope, i) => (
              <div key={scope.id}>
                <p className="t-h3 text-[color:var(--ink)]">{scope.title}</p>
                <p className="mb-5 mt-1 text-muted">{scope.lede}</p>
                <ScopeSchedule
                  id={`${section.id}-${scope.id}`}
                  number={Number(`${number}${i + 1}`) / 10}
                  items={scope.items}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
