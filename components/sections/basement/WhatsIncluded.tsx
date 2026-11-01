import type { CSSProperties } from "react";
import { RevealHeading } from "@/components/motion/RevealHeading";
import { Button } from "@/components/ui/Button";
import { basementHero, whatsIncluded } from "@/content/copy/basement";
import { cn, pad2 } from "@/lib/utils";

type WhatsIncludedProps = {
  index?: string;
  sheet?: string;
  id?: string;
  className?: string;
};

/** Frame lines are inked a little darker than the row hairlines, like a schedule border. */
const frame = "border-[color:color-mix(in_srgb,var(--ink)_24%,transparent)]";

/** "Plumbing rough-in … (if adding a bathroom)" → main text + the bracketed condition (set muted). */
function splitNote(item: string): [string, string | null] {
  const match = /^(.*?)\s*(\([^)]*\))$/.exec(item);
  return match ? [match[1], match[2]] : [item, null];
}

/**
 * "What's included" (brief §9.4) as a drawing spec sheet: a title block (SPEC stamp, title, item
 * count; three cells from 1024 px) over a numbered schedule of hairline rows, two columns from 768 px,
 * read down each column.
 * The list is a real <ol>; the numbers are the copy deck's 01–11 (02 hides when permits aren't
 * handled, and the numbering closes up).
 */
export function WhatsIncluded({ index = "04", sheet = "B-04", id = "whats-included", className }: WhatsIncludedProps) {
  const titleId = `${id}-title`;
  const items = whatsIncluded.items;
  const rows = Math.ceil(items.length / 2);
  const last = items.length - 1;

  return (
    <section
      id={id}
      aria-labelledby={titleId}
      className={cn("surface-light texture-plaster section-y relative isolate", className)}
    >
      <div className="site-container">
        <div className="site-grid">
          <div className="col-span-full lg:col-span-11 lg:col-start-2">
            {/* Title block */}
            <div
              className={cn(
                "grid grid-cols-2 border lg:grid-cols-[minmax(0,2.2fr)_minmax(0,7fr)_minmax(0,1.8fr)]",
                frame,
              )}
            >
              <div
                aria-hidden="true"
                className={cn("col-start-1 row-start-1 flex flex-col justify-between gap-6 border-r p-4 sm:p-5 lg:p-6 xl:p-7", frame)}
              >
                <span className="font-mono text-[2rem] font-medium uppercase leading-none tracking-[0.2em] text-[color:var(--ink)] lg:text-[2.25rem] xl:text-[2.5rem]">
                  Spec
                </span>
                <span className="t-spec flex items-center gap-2.5 whitespace-nowrap tabular-nums">
                  <span aria-hidden="true" className="hidden h-px w-5 bg-current/50 sm:block" />
                  {index} / {sheet}
                </span>
              </div>

              <div
                className={cn(
                  "col-span-2 col-start-1 row-start-2 flex flex-col gap-5 border-t p-5 md:p-7 lg:col-span-1 lg:col-start-2 lg:row-start-1 lg:border-r lg:border-t-0 lg:px-10 lg:py-9",
                  frame,
                )}
              >
                <span aria-hidden="true" className="t-spec">
                  Title
                </span>
                <RevealHeading as="h2" id={titleId} className="t-h2 max-w-[20ch] text-[color:var(--ink)]">
                  {whatsIncluded.title}
                </RevealHeading>
              </div>

              <div className="col-start-2 row-start-1 flex flex-col justify-between gap-6 p-4 sm:p-5 lg:col-start-3 lg:p-6 xl:p-7">
                <span aria-hidden="true" className="t-spec">
                  Items
                </span>
                <span
                  aria-hidden="true"
                  className="t-h2 tabular-nums leading-none text-[color:var(--ink)]"
                >
                  {pad2(items.length)}
                </span>
              </div>
            </div>

            {/* Schedule: down column one, then column two */}
            <ol
              style={{ "--rows": rows } as CSSProperties}
              className={cn(
                "relative grid border-x border-b md:grid-flow-col md:grid-cols-2 md:grid-rows-[repeat(var(--rows),auto)]",
                "md:before:absolute md:before:inset-y-0 md:before:left-1/2 md:before:w-px md:before:bg-[color:var(--hairline)]",
                frame,
              )}
            >
              {items.map((item, i) => {
                const [main, note] = splitNote(item);
                return (
                  <li
                    key={item}
                    className={cn(
                      "flex items-baseline gap-4 border-t border-[color:var(--hairline)] px-5 py-4 md:gap-6 md:px-7 md:py-5",
                      i === 0 && "border-t-0",
                      i === rows && "md:border-t-0",
                    )}
                  >
                    <span className="t-spec w-7 shrink-0 tabular-nums">{pad2(i + 1)}</span>
                    <span className="text-[1.0625rem] leading-snug text-[color:var(--ink)] md:text-[1.125rem]">
                      {main}
                      {note && <span className="text-muted"> {note}</span>}
                    </span>
                    {i === last && (
                      <span aria-hidden="true" className="ml-auto size-1.5 shrink-0 self-center bg-worklight" />
                    )}
                  </li>
                );
              })}
            </ol>

            {/* The scope's next question is the price: this jumps to the estimate sheet (the quote CTA sits on either side) */}
            <div className="mt-10 flex md:mt-12 md:justify-end">
              <Button href={basementHero.estimateCta.href} variant="secondary" arrow>
                {basementHero.estimateCta.label}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
