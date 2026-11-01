import type { ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { DimensionLine } from "@/components/ui/DimensionLine";
import { DetailBubble } from "@/components/ui/drafting";
import type { DrywallSubService } from "@/content/copy/drywall";
import { cn, pad2 } from "@/lib/utils";
import "./drywall.css";

export type SubServiceSectionProps = {
  item: DrywallSubService;
  /** 1-based detail number on the sheet */
  n: number;
  total: number;
  /** Sheet code shared by the five details, e.g. "A-02" */
  sheet: string;
  /** The figure: a MediaFrame or a BeforeAfterSlider */
  media: ReactNode;
  side: "left" | "right";
  /** Media runs off its edge of the sheet (photos yes, sliders no) */
  bleed?: boolean;
  tone?: "light" | "dark";
  /** Dimension line under the figure; must state a real fact from the copy */
  annotation?: string;
  /** Follows a plaster section directly: short top padding so the two don't stack two full gaps */
  flushTop?: boolean;
};

/** Strip the copy deck's trailing "→": the button draws its own dimension arrow. */
function ctaText(label: string): string {
  return label.replace(/\s*→\s*$/, "");
}

/**
 * One drywall sub-service as a numbered detail on a drawing sheet (brief §9 Drywall 3): a detail
 * bubble and reference line, a hanging H2, the answer paragraph, the figure off one edge, the mono
 * scope label over a numbered spec list, and a quote link pre-selecting the service.
 */
export function SubServiceSection({
  item,
  n,
  total,
  sheet,
  media,
  side,
  bleed = true,
  tone = "light",
  annotation,
  flushTop = false,
}: SubServiceSectionProps) {
  const headingId = `${item.id}-title`;
  const right = side === "right";
  // Right: H2 col 1, text cols 2–5, col 6 free, figure 7–12. Left: figure 1–6, col 7 free, H2 col 8, text 9–12.
  const text = right ? "lg:col-start-2 lg:col-span-4" : "lg:col-start-9 lg:col-span-4";

  return (
    <section
      id={item.id}
      aria-labelledby={headingId}
      className={cn(
        "relative isolate overflow-x-clip py-20 md:py-28 lg:py-32",
        flushTop && "pt-4! md:pt-6! lg:pt-8!",
        tone === "dark" ? "surface-dark beam-rake" : "surface-light texture-plaster",
      )}
    >
      <div className="site-container">
        {/* Detail reference: bubble (detail / sheet), the chip name, a hairline to the sheet edge */}
        <div className="flex items-center gap-4">
          <DetailBubble top={String(n)} bottom={sheet} size={48} />
          <span className="t-spec min-w-0">{item.chip}</span>
          <span aria-hidden="true" className="relative h-px min-w-6 flex-1 bg-[color:var(--hairline)]">
            <span className="absolute right-0 top-1/2 h-2.5 w-px -translate-y-1/2 bg-[color:var(--spec)]/60" />
          </span>
          <span aria-hidden="true" className="t-spec hidden whitespace-nowrap tabular-nums sm:inline">
            Detail {pad2(n)} / {pad2(total)}
          </span>
        </div>

        <div className="site-grid mt-10 gap-y-10 md:mt-12 lg:mt-16 lg:grid-rows-[auto_auto_auto_1fr] lg:gap-y-12">
          <h2
            id={headingId}
            className={cn(
              "t-h2 col-span-full max-w-[16ch] text-[color:var(--ink)] lg:row-start-1",
              right ? "lg:col-start-1 lg:col-span-7" : "lg:col-start-8 lg:col-span-5",
            )}
          >
            {item.title}
          </h2>

          <p
            className={cn(
              "col-span-full text-[1.0625rem] leading-[1.65] text-[color:var(--ink)] md:col-span-9 md:col-start-2 md:text-[1.125rem] lg:row-start-2",
              text,
            )}
          >
            {item.body}
          </p>

          {/* The figure is shorter than the text beside it: on tall desktop viewports it stays in view
              while the text scrolls and comes to rest level with the CTA, so no detail ends on an
              empty half-sheet (same guard as the quote sidebar: only when the viewport fits it). */}
          <div
            className={cn(
              "col-span-full md:col-span-11 lg:mt-1 lg:self-start",
              "lg:[@media(min-height:50rem)]:sticky lg:[@media(min-height:50rem)]:top-[calc(var(--header-h)+2.5rem)]",
              bleed && (right ? "dw-bleed-r" : "dw-bleed-l"),
              // Right: below the hanging H2. Left: level with it (the H2 sits on the other side).
              right
                ? "md:col-start-2 lg:col-span-6 lg:col-start-7 lg:row-span-3 lg:row-start-2"
                : "md:col-start-1 lg:col-span-6 lg:col-start-1 lg:row-span-4 lg:row-start-1",
            )}
          >
            {media}
            {annotation && (
              <div className={cn("mt-8", bleed && "dw-keep")}>
                <DimensionLine label={annotation} align="end" />
              </div>
            )}
          </div>

          <div className={cn("col-span-full md:col-span-9 md:col-start-2 lg:row-start-3", text)}>
            <p className="t-spec text-[color:var(--ink)]">{item.label}</p>
            <ul className="mt-4 border-t border-[color:var(--hairline)]">
              {item.bullets.map((bullet, i) => (
                <li
                  key={bullet}
                  className="flex items-baseline gap-5 border-b border-[color:var(--hairline)] py-3.5"
                >
                  <span aria-hidden="true" className="t-spec w-7 shrink-0 tabular-nums">
                    {n}.{i + 1}
                  </span>
                  <span className="text-[1rem] leading-snug text-[color:var(--ink)]">{bullet}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className={cn("col-span-full md:col-span-9 md:col-start-2 lg:row-start-4", text)}>
            <Button href={item.cta.href} variant="ghost" arrow>
              {ctaText(item.cta.label)}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
