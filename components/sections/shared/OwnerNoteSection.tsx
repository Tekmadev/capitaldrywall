import Image from "next/image";
import { RevealHeading } from "@/components/motion/RevealHeading";
import { RegistrationMarks } from "@/components/ui/drafting";
import { OwnerNote } from "@/components/ui/OwnerNote";
import { ownerNote } from "@/content/copy/global";
import { feature, site } from "@/content/site.config";
import { cn } from "@/lib/utils";
import { ReviewsSection, type Review } from "./ReviewsSection";
import { SheetRef, sheetCode } from "./SheetRef";

export type OwnerNoteSectionProps = {
  index?: string;
  eyebrow?: string;
  title?: string;
  sheet?: string;
  id?: string;
  /** "raised" uses the plaster-2 surface for rhythm between plaster sections */
  tone?: "light" | "raised";
  /** Real reviews, used when the `reviews` flag is on (ReviewsSection renders instead) */
  reviews?: readonly Review[];
  className?: string;
};

/**
 * Owner note (brief §9 item 12, ART_DIRECTION row 12), shown while the `reviews` flag is off; with the
 * flag on it renders ReviewsSection instead (which hides itself until real reviews exist). A portrait
 * appears only when site.owner.photo is set.
 */
export function OwnerNoteSection({
  index,
  eyebrow = ownerNote.eyebrow,
  title = ownerNote.title,
  sheet,
  id = "owner-note",
  tone = "light",
  reviews,
  className,
}: OwnerNoteSectionProps) {
  if (feature("reviews")) {
    return <ReviewsSection reviews={reviews} index={index} sheet={sheet} className={className} />;
  }

  const code = sheetCode(index, sheet);
  const headingId = `${id}-title`;
  const photo = site.owner.photo;

  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className={cn("surface-light texture-plaster section-y overflow-x-clip", tone === "raised" && "surface-raised", className)}
    >
      <div className="site-container">
        <SheetRef index={index} eyebrow={eyebrow} sheet={code} />
        <div className="site-grid mt-10 gap-y-16 md:mt-14 lg:mt-16">
          <div className="col-span-full lg:col-span-4">
            <RevealHeading as="h2" id={headingId} className="t-h2 max-w-[12ch] text-[color:var(--ink)]">
              {title}
            </RevealHeading>
            {photo && (
              <figure className="relative mt-10 w-full max-w-sm lg:mt-14">
                <div className="relative aspect-[4/5] overflow-hidden bg-[color:var(--surface-raised)]">
                  <Image
                    src={photo}
                    alt={site.owner.name ? `${site.owner.name}, owner of ${site.name}` : `The owner of ${site.name}`}
                    fill
                    sizes="(min-width: 1024px) 24rem, 90vw"
                    className="object-cover"
                  />
                </div>
                <RegistrationMarks />
              </figure>
            )}
          </div>
          <div className="col-span-full pt-14 sm:pt-16 md:pt-20 lg:col-span-7 lg:col-start-6 lg:pt-20">
            <OwnerNote
              body={ownerNote.body}
              sisterLine={ownerNote.sisterLine}
              signature={ownerNote.signature}
              sheet={code}
              stampId={id}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
