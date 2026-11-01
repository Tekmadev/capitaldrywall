import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";
import "./Estimator.css";

type EstimatorOdometerProps = {
  /** Pre-formatted value, e.g. "$48,000" or "1,050". Digits roll; other characters stay put. */
  value: string;
  /** Short roll for values that change continuously (the slider readout) */
  fast?: boolean;
  className?: string;
};

/**
 * Odometer number roll with tabular figures. Each digit is a clipped column whose 0–9 strip is
 * CSS-generated, so the DOM text is the real number and server HTML reads correctly without JS.
 * Columns are keyed from the right, so units stay units when the number gains a digit.
 * Purely visual: give the value to assistive tech separately (a live region or the input itself).
 */
export function EstimatorOdometer({ value, fast, className }: EstimatorOdometerProps) {
  const chars = [...value];
  const cells: ReactNode[] = [];
  let digitFromRight = 0;
  for (let index = chars.length - 1; index >= 0; index -= 1) {
    const ch = chars[index];
    const fromRight = chars.length - 1 - index;
    if (ch >= "0" && ch <= "9") {
      // Higher place values roll a beat later (prices end in 000, so the thousands lead)
      const style = { "--d": Number(ch), "--i": Math.max(0, digitFromRight - 3) } as CSSProperties;
      cells.unshift(
        <span key={`d${fromRight}`} className="est-odo-digit" style={style}>
          {ch}
        </span>,
      );
      digitFromRight += 1;
    } else {
      cells.unshift(
        <span key={`c${fromRight}${ch}`} className="est-odo-char">
          {ch}
        </span>,
      );
    }
  }

  return (
    <span aria-hidden="true" className={cn("est-odo", fast && "est-odo-fast", className)}>
      {cells}
    </span>
  );
}
