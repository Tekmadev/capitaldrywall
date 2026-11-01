import { promises } from "@/content/copy/home";
import { site } from "@/content/site.config";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { DetailBubble, VellumGrid } from "@/components/ui/drafting";
import { cn, pad2 } from "@/lib/utils";

type Spec = [field: string, value: string];

/**
 * Right-hand spec values: facts restated from each promise itself (keyed by the copy-deck title),
 * with config-driven values resolved from site.config so a switched-off claim never shows here.
 */
function specFor(title: string): Spec[] {
  switch (title) {
    case "Fast, honest quotes.":
      return [
        ["Ballpark", site.responsePromise],
        ["Site visit", "Free"],
      ];
    case "Dust under control.":
      return [
        ["Sanding", "Dust-extraction"],
        ["Cleanup", "Every day"],
      ];
    case "The Paint-Ready Promise.":
      return [
        ["Touch-ups", "After primer"],
        ["Charge", "None"],
      ];
    case "Backed in writing.":
      return [
        site.warranty ? (["Warranty", `${site.warranty.years} yr workmanship`] as Spec) : null,
        site.insured ? (["Crew", "Fully insured"] as Spec) : null,
      ].filter((s): s is Spec => s !== null);
    case "One contractor, start to finish.":
      return [
        ["Point of contact", "One"],
        ["Plumbing, electrical", "Licensed"],
      ];
    default:
      return [];
  }
}

/** Every hyphenated word: titles and spec cells never break at a hyphen ("Paint-Ready", "Touch-ups"). */
const HYPHENATED = /(\S+-\S+)/;
/** A number and its unit: body text may break at "dust-extraction", never between "2-" and "year". */
const NUMBER_UNIT = /(\d+-\S+)/;

/** Keep the matches of `pattern` (one capture group) on one line. */
function keepWhole(text: string, pattern: RegExp = HYPHENATED) {
  return text.split(pattern).map((part, i) =>
    i % 2 === 1 ? (
      <span key={i} className="whitespace-nowrap">
        {part}
      </span>
    ) : (
      part
    ),
  );
}

/**
 * Home §7, "What you can count on." set as a numbered spec sheet: detail-bubble item numbers,
 * Archivo titles, the promise and a mono spec value per row, joined by hairlines. A faint work
 * light rakes across a row on hover. Never icon cards.
 */
export function Promises({ id = "promises", className }: { id?: string; className?: string }) {
  const headingId = `${id}-title`;
  const sheet = `A-${promises.index}`;
  const items = promises.items;
  if (items.length === 0) return null;

  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className={cn("surface-light texture-plaster section-y relative isolate overflow-x-clip", className)}
    >
      {/* Registration crosses only from 768 px: on phones they would sit on the content */}
      <VellumGrid className="max-md:[&_span>span]:hidden" />
      <div className="site-container relative">
        <SectionHeader
          index={promises.index}
          eyebrow={promises.eyebrow}
          sheet={sheet}
          title={promises.title}
          id={headingId}
        />

        {/* Column heads, set like a schedule (decorative: the list carries the structure) */}
        <div
          aria-hidden="true"
          className="t-spec site-grid mt-14 hidden pb-3 md:mt-20 lg:grid"
        >
          <span className="col-span-1">Item</span>
          <span className="col-span-3">Promise</span>
          <span className="col-span-4">Detail</span>
          <span className="col-span-4 text-right">Spec</span>
        </div>

        <ol className="mt-10 border-b border-[color:var(--hairline)] md:mt-14 lg:mt-0">
          {items.map((item, i) => {
            const spec = specFor(item.title);
            return (
              <li
                key={item.title}
                className={cn(
                  "group/row site-grid relative isolate gap-y-3 overflow-hidden border-t border-[color:var(--hairline)] py-8 md:py-10",
                  // Low work light from the left: a faint glow settles in, a soft band rakes across once.
                  "before:pointer-events-none before:absolute before:inset-0 before:-z-10 before:opacity-0 before:transition-opacity before:duration-500 before:ease-[var(--ease-rake)]",
                  "before:bg-[radial-gradient(55%_140%_at_0%_60%,rgb(244_166_42/0.09),transparent_70%)] hover:before:opacity-100",
                  "after:pointer-events-none after:absolute after:inset-y-0 after:left-0 after:-z-10 after:w-2/5 after:-translate-x-[130%] after:skew-x-[-18deg] after:transition-none",
                  "after:bg-[linear-gradient(90deg,transparent,rgb(244_166_42/0.13),transparent)]",
                  "hover:after:translate-x-[260%] motion-safe:hover:after:transition-[translate] hover:after:duration-[1100ms] hover:after:ease-[var(--ease-rake)]",
                )}
              >
                <div className="col-span-1 row-span-3 md:col-span-2 lg:col-span-1 lg:row-span-1">
                  <DetailBubble
                    top={pad2(i + 1)}
                    bottom={sheet}
                    size={52}
                    className="transition-colors duration-300 group-hover/row:text-[color:var(--ink)]"
                  />
                </div>
                <h3 className="t-h3 col-span-3 self-center text-[color:var(--ink)] md:col-span-10 lg:col-span-3 lg:self-start lg:pt-1.5">
                  {keepWhole(item.title)}
                </h3>
                {/* Below 1024 px the spec sits under the detail: a four-column side cell is too narrow for its values */}
                <p className="col-span-3 col-start-2 max-w-[56ch] text-muted md:col-span-7 md:col-start-3 lg:col-span-4 lg:col-start-5 lg:pt-1.5">
                  {keepWhole(item.body, NUMBER_UNIT)}
                </p>
                {spec.length > 0 && (
                  <dl className="t-spec col-span-3 col-start-2 flex flex-col gap-2 pt-1 md:col-span-7 md:col-start-3 lg:col-span-4 lg:col-start-9 lg:pt-2.5">
                    {spec.map(([field, value]) => (
                      <div key={field} className="flex flex-wrap items-baseline gap-x-2">
                        {/* Field, then leader dots to the value, as on a drawing schedule */}
                        <dt className="flex flex-1 items-baseline gap-2 after:min-w-4 after:flex-1 after:translate-y-[-0.3em] after:border-b after:border-dotted after:border-current/45 after:content-['']">
                          <span>{keepWhole(field)}</span>
                        </dt>
                        <dd className="ml-auto text-right text-[color:var(--ink)]">{keepWhole(value)}</dd>
                      </div>
                    ))}
                  </dl>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
