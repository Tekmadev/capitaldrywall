import type { ReactNode } from "react";
import type { StartingPrice } from "@/content/pricing";
import { cn, formatCAD, pad2 } from "@/lib/utils";

type PriceCardProps = {
  price: StartingPrice;
  /** 1-based item number for the "ITEM 01" column head */
  item: number;
  /** "lg" for the 3-column home schedule, "md" for the 4-column drywall schedule */
  size?: "md" | "lg";
  headingLevel?: "h3" | "h4";
  className?: string;
};

/**
 * One cell of a joined "finish schedule" (ART_DIRECTION device 5). Render inside <PriceSchedule>
 * (or any <ul> that draws the shared hairlines): a mono "ITEM 01" head, the service, "FROM" + a big
 * Archivo price (or "Quoted" + its basis when the price is null), the unit, the scope and a small
 * dimension tick. From 640 px: a row of the same schedule (name left, price right); narrower phones
 * stack the price under the name, so a long name ("Installation & finishing") never runs into it.
 */
export function PriceCard({ price, item, size = "lg", headingLevel = "h3", className }: PriceCardProps) {
  const Heading = headingLevel;
  const quoted = price.from === null;
  /** "Quoted per project, by square footage." → "per project, by square footage" */
  const basis = quoted ? price.detail.replace(/^quoted\s+/i, "").replace(/\.$/, "") : null;
  const unit = quoted ? basis : price.unit;
  const detail = quoted ? null : price.detail;

  return (
    <li
      className={cn(
        "relative grid grid-cols-[minmax(0,1fr)_auto] content-start gap-x-6 gap-y-2 px-5 py-6 max-sm:grid-cols-1 sm:px-7 md:px-8 md:py-8",
        "border-t border-[color:var(--hairline)] first:border-t-0",
        "lg:row-span-5 lg:grid-cols-1 lg:grid-rows-subgrid lg:gap-y-0 lg:border-t-0 lg:border-l lg:first:border-l-0 lg:px-8 lg:pt-7 lg:pb-8 xl:px-10",
        className,
      )}
    >
      {/* Column head: ITEM 01 ─────┤ */}
      <div aria-hidden="true" className="col-span-2 flex items-center gap-3 max-sm:col-span-1 lg:col-span-1">
        <span className="t-spec tabular-nums">Item {pad2(item)}</span>
        <span className="h-px flex-1 bg-[color:var(--hairline)]" />
        <span className="h-2.5 w-px bg-[color:var(--hairline)]" />
      </div>

      <Heading className="t-h3 mt-3 self-start text-[color:var(--ink)] lg:mt-6">{price.service}</Heading>

      <p className="row-span-2 mt-3 text-right max-sm:row-span-1 max-sm:mt-4 max-sm:text-left lg:row-span-1 lg:mt-8 lg:text-left">
        <span className="t-spec block">{quoted ? "Price" : "From"}</span>
        <span
          className={cn(
            "mt-1 block font-display leading-[0.95] font-[780] tracking-[-0.02em] text-[color:var(--ink)] tabular-nums [font-stretch:125%]",
            size === "lg"
              ? "text-[clamp(2.125rem,7vw,2.75rem)] lg:text-[clamp(2.75rem,4.4vw,4.25rem)]"
              : "text-[clamp(2.125rem,7vw,2.75rem)] lg:text-[clamp(2.25rem,3.1vw,3.25rem)]",
          )}
        >
          {quoted ? "Quoted" : formatCAD(price.from as number)}
        </span>
        {unit && <span className="t-spec mt-2 ml-auto block max-w-[24ch] max-sm:ml-0 lg:ml-0">{unit}</span>}
      </p>

      {detail ? (
        <p className="max-w-[34ch] text-[0.9375rem] leading-relaxed text-muted lg:mt-5">{detail}</p>
      ) : (
        /* keeps the five subgrid rows aligned across cells */
        <span aria-hidden="true" className="hidden lg:block" />
      )}

      {/* Small dimension tick closing the cell */}
      <span aria-hidden="true" className="col-span-2 mt-4 flex w-16 items-center text-[color:var(--spec)] max-sm:col-span-1 lg:col-span-1 lg:mt-8 lg:self-end">
        <span className="h-2.5 w-px bg-current/70" />
        <span className="h-px flex-1 bg-current/50" />
        <span className="h-2.5 w-px bg-current/70" />
      </span>
    </li>
  );
}

/**
 * The joined schedule frame: one hairline-framed block whose cells share hairlines (rows on mobile,
 * columns from 1024 px). Pass PriceCards as children.
 */
export function PriceSchedule({
  count,
  children,
  className,
}: {
  count: number;
  children: ReactNode;
  className?: string;
}) {
  const cols =
    count >= 4 ? "lg:grid-cols-4" : count === 3 ? "lg:grid-cols-3" : count === 2 ? "lg:grid-cols-2" : "lg:grid-cols-1";
  return (
    <ul
      role="list"
      className={cn(
        "grid border border-[color:var(--hairline)] lg:grid-rows-[repeat(5,auto)]",
        cols,
        className,
      )}
    >
      {children}
    </ul>
  );
}
