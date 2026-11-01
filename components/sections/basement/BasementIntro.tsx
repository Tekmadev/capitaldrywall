import { Button } from "@/components/ui/Button";
import { DetailBubble, VellumGrid } from "@/components/ui/drafting";
import { basementHero, basementIntro } from "@/content/copy/basement";
import { cn } from "@/lib/utils";

type BasementIntroProps = {
  /** Section number on the page, shown in the detail bubble */
  index?: string;
  /** Drawing-sheet code under the number */
  sheet?: string;
  className?: string;
};

/**
 * Answer-first intro (brief §9.2, §11): the copy-deck paragraph, intact, set large as the page's
 * general note. Desktop: the paragraph spans columns 2–10 with a two-column first-line indent, and
 * the detail bubble hangs in that indent. On the vellum grid.
 */
export function BasementIntro({ index = "02", sheet = "B-02", className }: BasementIntroProps) {
  return (
    <section
      className={cn(
        // Phones: a little more than section-y, so the vellum crosses (96 px in) clear the bubble and the link
        "surface-light texture-plaster section-y relative isolate max-md:pb-32 max-md:pt-28",
        className,
      )}
    >
      <VellumGrid />
      <div className="site-container relative">
        <div className="site-grid gap-y-10 md:gap-y-12">
          <div className="col-span-full md:col-span-11 lg:col-span-9 lg:col-start-2">
            <DetailBubble top={index} bottom={sheet} size={52} className="mb-7 lg:hidden" />
            <p className="relative text-pretty text-[clamp(1.375rem,2.25vw,2rem)] leading-[1.34] tracking-[-0.012em] text-[color:var(--ink)] lg:indent-[calc((200%_+_2*var(--gutter))/9)]">
              {/* Desktop: the bubble and its leader line fill the first-line indent, pointing at the note */}
              <span
                aria-hidden="true"
                className="absolute left-0 top-0 hidden h-[1.34em] w-[calc((200%_+_2*var(--gutter))/9_-_1.25rem)] items-center gap-3 indent-0 lg:flex"
              >
                <DetailBubble top={index} bottom={sheet} size={44} />
                <span className="h-px flex-1 bg-[color:var(--spec)]/45" />
                <span className="h-2.5 w-px bg-[color:var(--spec)]/70" />
              </span>
              {basementIntro}
            </p>
          </div>
          <div className="col-span-full lg:col-span-6 lg:col-start-4">
            <Button href={basementHero.primaryCta.href} variant="ghost" arrow>
              {basementHero.primaryCta.label}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
