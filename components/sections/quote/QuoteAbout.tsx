import { RevealHeading } from "@/components/motion/RevealHeading";
import { SheetRef } from "@/components/sections/shared/SheetRef";
import { Chip } from "@/components/ui/Chip";
import { OwnerNote } from "@/components/ui/OwnerNote";
import { ownerNote } from "@/content/copy/global";
import { quoteAbout } from "@/content/copy/quote";
import { cn, pad2 } from "@/lib/utils";

type QuoteAboutProps = {
  index?: string;
  sheet?: string;
  id?: string;
  className?: string;
};

/**
 * /free-quote About (brief §9 item 3): the dark sheet between the form and the plan of Ottawa.
 * H2 + body hung one column in + the four values as chips on the left; the owner's note expanded on
 * the right, set as a drawing sheet with its CHECKED BY title-block row and inspection stamp.
 */
export function QuoteAbout({ index, sheet, id = "about", className }: QuoteAboutProps) {
  const headingId = `${id}-title`;

  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className={cn("surface-dark beam-rake section-y relative isolate overflow-x-clip", className)}
    >
      <div className="site-container">
        {/* The eyebrow is the H2's first word: a trim, not new copy */}
        <SheetRef index={index} eyebrow={quoteAbout.title.split(" ")[0]} sheet={sheet} />

        <div className="site-grid mt-10 gap-y-24 md:mt-14 lg:mt-16">
          <div className="col-span-full lg:col-span-5">
            <RevealHeading as="h2" id={headingId} className="t-h2 max-w-[14ch] text-[color:var(--ink)]">
              {quoteAbout.title}
            </RevealHeading>
            <div className="mt-8 md:mt-10 md:pl-[calc((100%+var(--gutter))/7)] lg:pl-[calc((100%+var(--gutter))/5)]">
              <p className="t-lede text-muted">{quoteAbout.body}</p>
              {/* One numbered value per line: a short spec list, not a 2 / 1 / 1 wrap that looks unplanned */}
              <ul className="mt-10 flex flex-col items-start gap-2.5" aria-label="Values">
                {quoteAbout.values.map((value, i) => (
                  <li key={value} className="max-w-full">
                    <Chip index={pad2(i + 1)}>{value}</Chip>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="col-span-full md:col-span-10 md:col-start-2 lg:col-span-6 lg:col-start-7">
            <p className="t-spec">{ownerNote.eyebrow}</p>
            {/* From sm the title stays narrower than the column, so the stamp on the sheet's corner sits
                beside it. On phones that left it a word or two per line: there it runs full width and
                the sheet drops (mt-24) so the stamp lands in the gap under it instead. */}
            <h3 className="t-h3 mt-3 text-balance text-[color:var(--ink)] sm:max-w-[calc(100%-11rem)] md:max-w-[calc(100%-12.5rem)] lg:max-w-[calc(100%-10rem)]">
              {ownerNote.title}
            </h3>
            <OwnerNote
              className="mt-24 sm:mt-10 md:mt-12"
              body={ownerNote.body}
              sisterLine={ownerNote.sisterLine}
              signature={ownerNote.signature}
              sheet={sheet}
              stampId={id}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
