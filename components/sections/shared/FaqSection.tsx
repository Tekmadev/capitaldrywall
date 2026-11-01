import { RevealHeading } from "@/components/motion/RevealHeading";
import { JsonLd } from "@/components/seo/JsonLd";
import { Accordion } from "@/components/ui/Accordion";
import { faqSection } from "@/content/copy/global";
import { getFaqs, type FaqPage } from "@/content/faq";
import { faqPageSchema } from "@/lib/schema";
import { cn, pad2 } from "@/lib/utils";
import { SheetRef, sheetCode } from "./SheetRef";

export type FaqSectionProps = {
  page: FaqPage;
  /** Route path of the page, for the FAQPage @id ("/", "/drywall-ottawa", …) */
  path: string;
  /** Section number on the page, e.g. "10" */
  index?: string;
  eyebrow?: string;
  title?: string;
  intro?: string;
  /** Sheet code override (default "A-" + index) */
  sheet?: string;
  id?: string;
  /** FAQ ids open on load (and in no-JS) */
  defaultOpen?: readonly string[];
  className?: string;
};

/**
 * FAQ (brief §9, ART_DIRECTION row 14): header in columns 1–4 (sticky on desktop), questions in
 * columns 6–12. The visible questions/answers and the FAQPage JSON-LD come from the exact same
 * getFaqs(page) strings. Renders nothing when the page has no enabled FAQs.
 */
export function FaqSection({
  page,
  path,
  index,
  eyebrow = faqSection.eyebrow,
  title = faqSection.title,
  intro,
  sheet,
  id = "faq",
  defaultOpen,
  className,
}: FaqSectionProps) {
  const items = getFaqs(page);
  if (items.length === 0) return null;
  const headingId = `${id}-title`;

  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className={cn("surface-light texture-plaster section-y", className)}
    >
      <div className="site-container">
        <SheetRef index={index} eyebrow={eyebrow} sheet={sheetCode(index, sheet)} />

        <div className="site-grid mt-10 gap-y-10 md:mt-14 lg:mt-16">
          <div className="col-span-full lg:sticky lg:top-[calc(var(--header-h)+2.5rem)] lg:col-span-5 lg:self-start xl:col-span-4">
            <RevealHeading as="h2" id={headingId} className="t-h2 max-w-[13ch] text-[color:var(--ink)]">
              {title}
            </RevealHeading>
            {intro && <p className="t-lede mt-6 max-w-[34ch] text-muted">{intro}</p>}
            {/* Drawing-style range annotation: Q.01 ├──┤ Q.08 */}
            <p aria-hidden="true" className="t-spec mt-8 flex max-w-56 items-center gap-2.5 tabular-nums">
              <span>Q.01</span>
              <span className="h-2.5 w-px bg-current/60" />
              <span className="h-px flex-1 bg-current/45" />
              <span className="h-2.5 w-px bg-current/60" />
              <span>Q.{pad2(items.length)}</span>
            </p>
          </div>

          <div className="col-span-full lg:col-span-7 lg:col-start-6">
            <Accordion
              items={items.map((item) => ({ id: item.id, title: item.question, content: item.answer }))}
              defaultOpen={defaultOpen}
            />
          </div>
        </div>
      </div>
      <JsonLd data={faqPageSchema(items, path)} />
    </section>
  );
}
