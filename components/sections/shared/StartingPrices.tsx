import { Button } from "@/components/ui/Button";
import { VellumGrid } from "@/components/ui/drafting";
import { PriceCard, PriceSchedule } from "@/components/ui/PriceCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { pricingSection } from "@/content/copy/global";
import { pricingFinePrint, startingPrices, type StartingPrice } from "@/content/pricing";
import { quoteHref } from "@/content/services";
import { cn } from "@/lib/utils";
import { sheetCode } from "./SheetRef";

export type StartingPricesProps = {
  /** Default: home `startingPrices`; the drywall page passes `drywallPrices` */
  prices?: StartingPrice[];
  /** "home": 3-column schedule with large figures; "drywall": 4 columns, tighter figures */
  variant?: "home" | "drywall";
  index?: string;
  eyebrow?: string;
  title?: string;
  /** Pass null to drop the intro */
  intro?: string | null;
  sheet?: string;
  id?: string;
  /** Faint 12-column drafting grid behind the section (default true) */
  vellum?: boolean;
  /**
   * "Get your exact price" target (brief §10: service sections link to /free-quote?service=…).
   * Default: /free-quote?service=drywall for the drywall variant, the plain quote page on home.
   */
  ctaHref?: string;
  className?: string;
};

/**
 * Starting prices as a joined finish schedule (ART_DIRECTION device 5, row 10): one framed block
 * divided by hairlines, fine print with an "HST EXTRA" annotation, and the CTA. Hidden when every
 * price is switched off by a feature flag.
 */
export function StartingPrices({
  prices = startingPrices,
  variant = "home",
  index,
  eyebrow = pricingSection.eyebrow,
  title = pricingSection.title,
  intro = pricingSection.intro,
  sheet,
  id = "pricing",
  vellum = true,
  ctaHref = variant === "drywall" ? quoteHref("drywall") : pricingSection.cta.href,
  className,
}: StartingPricesProps) {
  if (prices.length === 0) return null;
  const headingId = `${id}-title`;

  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className={cn("surface-light texture-plaster section-y relative isolate", className)}
    >
      {vellum && <VellumGrid />}
      <div className="site-container relative">
        <SectionHeader
          index={index}
          eyebrow={eyebrow}
          sheet={sheetCode(index, sheet)}
          title={title}
          id={headingId}
          intro={intro ?? undefined}
          layout="split"
        />

        <PriceSchedule count={prices.length} className="mt-12 bg-[color:var(--surface)] md:mt-16">
          {prices.map((price, i) => (
            <PriceCard key={price.id} price={price} item={i + 1} size={variant === "drywall" ? "md" : "lg"} />
          ))}
        </PriceSchedule>

        <div className="mt-8 flex flex-col gap-8 md:mt-10 lg:flex-row lg:items-start lg:justify-between lg:gap-12">
          <div className="flex max-w-[66ch] items-start gap-3">
            {/* Drafting annotation tag with a leader to the note it qualifies */}
            <span
              aria-hidden="true"
              className="t-spec mt-px shrink-0 border border-[color:var(--spec)]/60 px-2 py-1.5 leading-none tabular-nums"
            >
              HST extra
            </span>
            <span aria-hidden="true" className="mt-[0.8rem] h-px w-5 shrink-0 bg-[color:var(--spec)]/60" />
            <p className="text-[0.9375rem] leading-relaxed text-muted">{pricingFinePrint}</p>
          </div>
          <Button href={ctaHref} arrow className="self-start">
            {pricingSection.cta.label}
          </Button>
        </div>
      </div>
    </section>
  );
}
