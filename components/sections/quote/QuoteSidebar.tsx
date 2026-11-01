import { BreakableEmail } from "@/components/sections/utility/RichText";
import { Button } from "@/components/ui/Button";
import { CallLink, EmailLink } from "@/components/ui/CallLink";
import { PhoneIcon } from "@/components/ui/icons";
import { quoteSidebar } from "@/content/copy/quote";
import { cn } from "@/lib/utils";
import { NextSteps, asHeading } from "./NextSteps";

type QuoteSidebarProps = {
  /** integrations.bookingUrl: the "Book a site visit" row renders only when it is set */
  bookingUrl: string | null;
  /** Sheet code shown in the step bubbles and the closing title-block row */
  sheet: string;
  titleId?: string;
  className?: string;
};

const cell = "border-t border-[color:var(--hairline)] px-5 py-5 md:px-6";
const field = "t-spec block text-[0.625rem]! leading-none";
/* Tablet (md to lg) only: the block runs the full width under the form as a two-column title block,
   the contact fields stacked on the left and "What happens next" filling the right-hand cell. The
   split sits half a gutter right of centre, which is exactly the vellum grid's 7th column line. */
const tablet = {
  frame: "md:max-lg:grid md:max-lg:grid-cols-[calc(50%+var(--gutter)/2)_minmax(0,1fr)]",
  head: "md:max-lg:col-span-2",
  field: (row: string) => cn("md:max-lg:col-start-1", row),
  notes: "md:max-lg:col-start-2 md:max-lg:row-span-4 md:max-lg:row-start-2 md:max-lg:border-l",
  foot: "md:max-lg:col-span-2 md:max-lg:row-start-6",
};

/**
 * "Prefer to talk?" set as the vertical title block that runs down the right edge of a drawing sheet:
 * stacked hairline cells with tiny mono field labels and real values. The phone is the focal point.
 */
export function QuoteSidebar({ bookingUrl, sheet, titleId = "quote-talk-title", className }: QuoteSidebarProps) {
  return (
    <div className={cn("relative border border-[color:var(--hairline)] bg-[color:var(--surface)]", tablet.frame, className)}>
      <div className={cn("flex items-start justify-between gap-4 px-5 pb-5 pt-6 md:px-6", tablet.head)}>
        <h2 id={titleId} className="t-h3 text-[color:var(--ink)]">
          {quoteSidebar.title}
        </h2>
        <span aria-hidden="true" className="t-spec mt-1.5 whitespace-nowrap tabular-nums">
          {sheet}
        </span>
      </div>

      <div className={cn(cell, tablet.field("md:max-lg:row-start-2"))}>
        <span className={field}>Phone</span>
        <CallLink
          location="quote-sidebar"
          className="group/call -my-1 mt-2 flex min-h-12 items-center gap-3 font-display text-[clamp(1.5rem,2.1vw,1.875rem)] font-bold leading-none tracking-[-0.01em] text-[color:var(--ink)] [font-stretch:112%]"
        >
          <PhoneIcon size={20} className="shrink-0 text-[color:var(--spec)] transition-colors duration-200 group-hover/call:text-[color:var(--ink)]" />
          <span className="bg-[linear-gradient(var(--color-worklight),var(--color-worklight))] bg-[length:0%_2px] bg-[position:0_100%] bg-no-repeat pb-1.5 transition-[background-size] duration-300 ease-[var(--ease-rake)] group-hover/call:bg-[length:100%_2px] group-focus-visible/call:bg-[length:100%_2px]">
            {quoteSidebar.phone}
          </span>
        </CallLink>
      </div>

      <div className={cn(cell, tablet.field("md:max-lg:row-start-3"))}>
        <span className={field}>Email</span>
        {/* A full-width 44 px row; the underline sits on the inline text, so it follows both lines
            when a narrow phone wraps the address after the "@". */}
        <EmailLink className="group/mail -mb-2 mt-1 block py-3 text-[0.9375rem] leading-snug text-[color:var(--ink)] [overflow-wrap:anywhere]">
          <span className="link-inline box-decoration-clone group-hover/mail:bg-[length:100%_2px,100%_1px] group-focus-visible/mail:bg-[length:100%_2px,100%_1px]">
            <BreakableEmail email={quoteSidebar.email} />
          </span>
        </EmailLink>
      </div>

      <div className={cn(cell, tablet.field("md:max-lg:row-start-4"))}>
        <span className={field}>Hours</span>
        <p className="mt-3 text-[0.9375rem] tabular-nums text-[color:var(--ink)]">{quoteSidebar.hours}</p>
      </div>

      <p className={cn(cell, tablet.field("md:max-lg:row-start-5"), "flex items-baseline gap-3 text-[0.9375rem] text-[color:var(--ink)]")}>
        <span aria-hidden="true" className="relative top-[-0.2em] block h-0.5 w-3.5 shrink-0 bg-worklight" />
        {quoteSidebar.reply}
      </p>

      <div className={cn(cell, tablet.notes, "pb-7")}>
        <h3 className="t-spec">{asHeading(quoteSidebar.nextStepsTitle)}</h3>
        <NextSteps steps={quoteSidebar.nextSteps} sheet={sheet} className="mt-5" />
      </div>

      {bookingUrl && (
        <div className={cn(cell, tablet.foot)}>
          <Button href={bookingUrl} variant="secondary" fullWidth arrow>
            {quoteSidebar.booking.label}
          </Button>
        </div>
      )}
    </div>
  );
}
