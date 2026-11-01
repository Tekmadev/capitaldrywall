"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { CSSProperties, ReactNode, Ref } from "react";
import { ArrowIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

export type NavItem = { label: string; href: string; index: string };

/** "/drywall-ottawa" is current on itself and on any child route; "/" only on itself. */
export function isCurrentPath(pathname: string | null, href: string): boolean {
  if (!pathname) return false;
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * Current-page marker: the label "measured" by a hairline dimension line with amber end ticks.
 * Sits inside a `relative` label span; inherits the ink colour so it works on light and dark.
 */
export function CurrentMark({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-x-0 bottom-0 h-px bg-current", className)}
    >
      <span className="absolute -top-1 left-0 h-[9px] w-0.5 bg-worklight" />
      <span className="absolute -top-1 right-0 h-[9px] w-0.5 bg-worklight" />
    </span>
  );
}

/** Two hairlines that cross into an × as the sheet opens (no-op without @starting-style). */
function CloseGlyph({ animate }: { animate: boolean }) {
  const line =
    "absolute left-0 top-1/2 h-px w-full bg-current transition-[rotate,translate] duration-500 ease-[var(--ease-rake)]";
  return (
    <span aria-hidden="true" className="relative block size-6">
      <span className={cn(line, "rotate-45", animate && "starting:-translate-y-[4.5px] starting:rotate-0")} />
      <span className={cn(line, "-rotate-45", animate && "starting:translate-y-[4.5px] starting:rotate-0")} />
    </span>
  );
}

type MobileMenuProps = {
  id: string;
  items: readonly NavItem[];
  homeHref: string;
  homeLabel: string;
  /** Server-rendered wordmark */
  wordmark: ReactNode;
  /** Server-rendered CTA + title-block cells (phone, hours, email) */
  details: ReactNode;
  /** Kitchen-sink: render the open sheet in place (no popover, no fixed positioning, no entrance). */
  staticOpen?: boolean;
  /** Kitchen-sink: show the current-page state for this path instead of the real route. */
  currentPath?: string;
  ref?: Ref<HTMLDivElement>;
};

/**
 * Full-screen mobile menu, drawn as an index sheet ("A-00 / INDEX"): a native `popover` in the top
 * layer, so it opens, closes on Escape and returns focus even before hydration or without JS.
 * HeaderShell adds the rest (focus in, focus wrap, scroll lock, close on link click / route change).
 */
export function MobileMenu({
  id,
  items,
  homeHref,
  homeLabel,
  wordmark,
  details,
  staticOpen,
  currentPath,
  ref,
}: MobileMenuProps) {
  const routePath = usePathname();
  const pathname = currentPath ?? routePath;
  const animate = !staticOpen;

  return (
    <div
      ref={ref}
      id={id}
      popover={staticOpen ? undefined : "auto"}
      role={staticOpen ? undefined : "dialog"}
      aria-modal={staticOpen ? undefined : true}
      aria-label={staticOpen ? undefined : "Site menu"}
      data-lenis-prevent=""
      className={cn(
        "surface-dark beam-rake @container text-plaster",
        staticOpen
          ? "relative w-full overflow-hidden"
          : [
              // reset the UA popover box to a full-screen sheet
              "fixed inset-0 m-0 h-dvh max-h-none w-full max-w-none overflow-y-auto overscroll-contain border-0 p-0",
              // closed: invisible (also the safe default where popover is unsupported)
              "invisible opacity-0 transition-[opacity,visibility,display,overlay] transition-discrete duration-300 ease-[var(--ease-rake)]",
              "[&:popover-open]:visible [&:popover-open]:opacity-100 starting:[&:popover-open]:opacity-0",
              "data-[open]:visible data-[open]:opacity-100 data-[open]:z-[80]",
              "lg:hidden",
            ],
      )}
    >
      <div className="flex min-h-full flex-col">
        {/* Header row, mirroring the bar beneath: the "Menu" control becomes "Close" in place */}
        <div className="site-container flex h-[var(--header-h)] shrink-0 items-center justify-between">
          <Link
            href={homeHref}
            aria-label={homeLabel}
            className="-ml-1 inline-flex min-h-11 items-center px-1"
          >
            {wordmark}
          </Link>
          <button
            type="button"
            popoverTarget={staticOpen ? undefined : id}
            popoverTargetAction="hide"
            data-menu-close=""
            className="group/close -mr-2 inline-flex min-h-11 min-w-11 items-center gap-3 px-2 font-mono text-[0.75rem] font-medium uppercase leading-none tracking-[0.14em]"
          >
            <span>Close</span>
            <CloseGlyph animate={animate} />
          </button>
        </div>

        <div className="site-container flex flex-1 flex-col pb-[max(1.5rem,env(safe-area-inset-bottom))]">
          {/* Sheet reference row */}
          <div className="flex items-center justify-between border-y border-[color:var(--hairline)]">
            <p className="t-spec">A-00 / Index</p>
            <Link
              href={homeHref}
              aria-current={isCurrentPath(pathname, homeHref) ? "page" : undefined}
              className="group/home t-spec -mr-2 inline-flex min-h-11 items-center gap-2.5 px-2 text-[color:var(--ink)]!"
            >
              <ArrowIcon
                size={18}
                className="rotate-180 transition-transform duration-300 ease-[var(--ease-rake)] group-hover/home:-translate-x-1"
              />
              <span>Home</span>
            </Link>
          </div>

          <nav aria-label="Main">
            <ol>
              {items.map((item, i) => {
                const current = isCurrentPath(pathname, item.href);
                return (
                  <li
                    key={item.href}
                    className="border-b border-[color:var(--hairline)]"
                    style={{ "--i": i } as CSSProperties}
                  >
                    <Link
                      href={item.href}
                      aria-current={current ? "page" : undefined}
                      className={cn(
                        "group/row relative flex items-start gap-4 py-5 @3xl:gap-6 @3xl:py-7",
                        // raking light: the row brightens from the left edge on hover
                        "before:pointer-events-none before:absolute before:inset-y-0 before:-left-[var(--page-pad)] before:right-0 before:opacity-0",
                        "before:bg-[linear-gradient(90deg,color-mix(in_srgb,var(--color-worklight)_16%,transparent),transparent_75%)]",
                        "before:transition-opacity before:duration-300 hover:before:opacity-100",
                        animate &&
                          "transition-[opacity,translate] duration-700 ease-[var(--ease-rake)] [transition-delay:calc(90ms+var(--i)*70ms)] starting:translate-y-4 starting:opacity-0",
                      )}
                    >
                      <span
                        className={cn(
                          "relative mt-[0.45em] font-mono text-[0.75rem] font-medium tabular-nums tracking-[0.08em] @3xl:text-[0.8125rem]",
                          current ? "text-[color:var(--ink)]" : "text-[color:var(--spec)]",
                        )}
                      >
                        {item.index}
                      </span>
                      <span className="relative pb-2.5 font-display text-[clamp(1.5rem,9cqi,4rem)] font-[780] leading-[0.95] tracking-[-0.02em] [font-stretch:125%]">
                        {item.label}
                        {current && <CurrentMark />}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ol>
          </nav>

          <div
            className={cn(
              "mt-auto pt-10",
              animate &&
                "transition-[opacity,translate] delay-300 duration-700 ease-[var(--ease-rake)] starting:translate-y-3 starting:opacity-0",
            )}
          >
            {details}
          </div>
        </div>
      </div>
    </div>
  );
}
