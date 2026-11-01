import { RevealHeading } from "@/components/motion/RevealHeading";
import { ArrowIcon } from "@/components/ui/icons";
import { reviewsSection } from "@/content/copy/global";
import { feature, site } from "@/content/site.config";
import { cn, pad2 } from "@/lib/utils";
import { SheetRef, sheetCode } from "./SheetRef";

/** A real Google review, copied verbatim with the reviewer's permission. */
export type Review = {
  author: string;
  rating: 1 | 2 | 3 | 4 | 5;
  text: string;
  /** ISO date, e.g. "2026-11-04" */
  date: string;
  /** Link to the review on Google */
  url?: string;
};

/**
 * SEAM: real reviews only. Leave empty until the owner supplies genuine Google reviews; with the
 * `reviews` flag on and this list empty the section renders nothing. Never add placeholder reviews
 * and never emit review/rating schema from invented data.
 */
export const reviews: Review[] = [];

export type ReviewsSectionProps = {
  reviews?: readonly Review[];
  index?: string;
  /** Optional sheet-reference eyebrow (none in the copy deck) */
  eyebrow?: string;
  title?: string;
  sheet?: string;
  id?: string;
  className?: string;
};

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/** "2026-11-04" → "November 2026" (no Date objects during server render) */
function monthYear(iso: string): string {
  const [year, month] = iso.split("-");
  const name = months[Number(month) - 1];
  return name && year ? `${name} ${year}` : iso;
}

/**
 * "What Ottawa homeowners say." Renders only with the `reviews` flag on AND at least one real review.
 * The Google link appears when site.social.gbp is set.
 */
export function ReviewsSection({
  reviews: list = reviews,
  index,
  eyebrow,
  title = reviewsSection.title,
  sheet,
  id = "reviews",
  className,
}: ReviewsSectionProps) {
  if (!feature("reviews") || list.length === 0) return null;
  const headingId = `${id}-title`;
  const gbp = site.social.gbp;
  const linkLabel = reviewsSection.link.replace(/\s*→\s*$/, "");

  return (
    <section id={id} aria-labelledby={headingId} className={cn("surface-light texture-plaster section-y", className)}>
      <div className="site-container">
        {eyebrow && <SheetRef index={index} eyebrow={eyebrow} sheet={sheetCode(index, sheet)} className="mb-10 md:mb-14" />}
        <div className="site-grid gap-y-10">
          <RevealHeading as="h2" id={headingId} className="t-h2 col-span-full max-w-[16ch] text-[color:var(--ink)] lg:col-span-6">
            {title}
          </RevealHeading>
          {gbp && (
            <a
              href={gbp}
              target="_blank"
              rel="noopener noreferrer"
              className="link-draw col-span-full inline-flex min-h-11 items-center gap-3 self-end justify-self-start text-[color:var(--ink)] lg:col-span-4 lg:col-start-9 lg:justify-self-end"
            >
              {linkLabel}
              <ArrowIcon />
            </a>
          )}
        </div>
        <ul role="list" className="mt-12 grid border-t border-[color:var(--hairline)] md:mt-16 md:grid-cols-2">
          {list.map((review, i) => (
            <li
              key={`${review.author}-${review.date}`}
              className="border-b border-[color:var(--hairline)] py-8 md:px-8 md:odd:border-r md:odd:pl-0"
            >
              <figure>
                <p aria-hidden="true" className="t-spec tabular-nums">
                  R.{pad2(i + 1)}
                </p>
                <blockquote className="mt-4 text-[1.1875rem] leading-relaxed text-[color:var(--ink)]">
                  <p>{review.text}</p>
                </blockquote>
                <figcaption className="t-spec mt-6 flex flex-wrap gap-x-3 gap-y-1">
                  <span>{review.author}</span>
                  <span aria-hidden="true">·</span>
                  <span>{`${review.rating} / 5`}</span>
                  <span aria-hidden="true">·</span>
                  <time dateTime={review.date}>{monthYear(review.date)}</time>
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
