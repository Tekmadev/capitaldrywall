import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Mono spec label: IBM Plex Mono 500, uppercase, 0.14em (brief §6). */
export function SpecLabel({
  children,
  as: Tag = "span",
  className,
}: {
  children: ReactNode;
  as?: "span" | "p" | "div" | "dt" | "dd" | "li" | "figcaption";
  className?: string;
}) {
  return <Tag className={cn("t-spec", className)}>{children}</Tag>;
}

/**
 * Architectural detail callout: a circle split by a horizontal line, the item number on top and a
 * sheet code below. Decorative (the list or step semantics carry the order).
 */
export function DetailBubble({
  top,
  bottom,
  size = 52,
  className,
}: {
  top: string;
  bottom?: string;
  size?: number;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 52 52"
      width={size}
      height={size}
      aria-hidden="true"
      focusable="false"
      className={cn("shrink-0 overflow-visible text-[color:var(--ink)]", className)}
    >
      <circle cx="26" cy="26" r="25" fill="none" stroke="currentColor" strokeWidth="1" />
      {bottom ? (
        <>
          <line x1="1" y1="26" x2="51" y2="26" stroke="currentColor" strokeWidth="1" />
          <text
            x="26"
            y="20.5"
            textAnchor="middle"
            className="fill-current font-mono"
            style={{ fontSize: 12, fontWeight: 500, letterSpacing: "0.04em" }}
          >
            {top}
          </text>
          <text
            x="26"
            y="38.5"
            textAnchor="middle"
            className="fill-[color:var(--spec)] font-mono"
            style={{ fontSize: 8.5, fontWeight: 500, letterSpacing: "0.12em" }}
          >
            {bottom}
          </text>
        </>
      ) : (
        <text
          x="26"
          y="30.5"
          textAnchor="middle"
          className="fill-current font-mono"
          style={{ fontSize: 13, fontWeight: 500, letterSpacing: "0.04em" }}
        >
          {top}
        </text>
      )}
    </svg>
  );
}

/**
 * Print/blueprint crop marks just outside an element's corners. Place inside a `relative` parent.
 */
export function RegistrationMarks({ className, inset = -10 }: { className?: string; inset?: number }) {
  const mark = "absolute size-3 border-[color:var(--spec)]/70";
  return (
    <span aria-hidden="true" className={cn("pointer-events-none absolute inset-0", className)}>
      <span className={cn(mark, "border-l border-t")} style={{ left: inset, top: inset }} />
      <span className={cn(mark, "border-r border-t")} style={{ right: inset, top: inset }} />
      <span className={cn(mark, "border-b border-l")} style={{ left: inset, bottom: inset }} />
      <span className={cn(mark, "border-b border-r")} style={{ right: inset, bottom: inset }} />
    </span>
  );
}

/** Small "+" registration cross for drafting-grid intersections. */
export function RegCross({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute size-3 before:absolute before:left-1/2 before:top-0 before:h-full before:w-px before:bg-current after:absolute after:left-0 after:top-1/2 after:h-px after:w-full after:bg-current",
        "-translate-x-1/2 -translate-y-1/2 text-[color:var(--spec)]/60",
        className,
      )}
    />
  );
}

/**
 * Vellum drafting grid: faint 12-column hairlines (4 on mobile) behind a section.
 * Use on two or three plaster sections per page at most. Parent must be `relative`.
 */
export function VellumGrid({ className, crosses = true }: { className?: string; crosses?: boolean }) {
  return (
    <div aria-hidden="true" className={cn("pointer-events-none absolute inset-0 -z-0 overflow-hidden", className)}>
      <div className="site-container h-full">
        <div className="site-grid relative h-full">
          {Array.from({ length: 12 }, (_, i) => (
            <span
              key={i}
              className={cn(
                "relative h-full border-l border-[color:rgb(20_21_24/0.055)]",
                i === 11 && "border-r",
                i >= 4 && "hidden md:block",
              )}
            >
              {/* Crosses from 768 px only: inside the 80 px mobile section padding they'd land on labels */}
              {crosses && (i === 0 || i === 6 || i === 11) && (
                <>
                  <RegCross className="left-0 top-24 max-md:hidden" />
                  <RegCross className="bottom-24 left-0 max-md:hidden" />
                </>
              )}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Corner title-block cell: tiny mono field label over a value (footer, concept labels, sign-offs). */
export function TitleCell({
  label,
  children,
  className,
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <span className="t-spec text-[0.625rem]! leading-none">{label}</span>
      <span className="text-[0.9375rem] leading-snug text-[color:var(--ink)]">{children}</span>
    </div>
  );
}
