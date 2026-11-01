"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { CurrentMark, isCurrentPath, MobileMenu, type NavItem } from "./MobileMenu";

/** Kitchen-sink / static previews: inline position, forced tone, scroll state and route, no scroll listener. */
export type HeaderPreview = { tone?: "dark" | "light"; scrolled?: boolean; pathname?: string };

type HeaderShellProps = {
  items: readonly NavItem[];
  homeHref: string;
  homeLabel: string;
  wordmark: ReactNode;
  /** Phone, reserved 24/7 badge and primary CTA (server-rendered) */
  actions: ReactNode;
  /** Mobile-menu CTA and title-block cells (server-rendered) */
  menuDetails: ReactNode;
  preview?: HeaderPreview;
};

/** The bar condenses and turns solid after ~40% of the first viewport. */
const SCROLL_RATIO = 0.4;
const DESKTOP_QUERY = "(min-width: 1024px)";

function supportsPopover(el: HTMLElement): boolean {
  return typeof el.showPopover === "function";
}

function isMenuOpen(el: HTMLElement): boolean {
  return supportsPopover(el) ? el.matches(":popover-open") : el.hasAttribute("data-open");
}

/** Same signal the native popover sends, for browsers without the popover API. */
function emitToggle(el: HTMLElement, open: boolean) {
  el.dispatchEvent(Object.assign(new Event("toggle"), { newState: open ? "open" : "closed" }));
}

/** Two hairlines: the "Menu" glyph. The shorter one runs out to full length on hover. */
function MenuGlyph() {
  return (
    <span aria-hidden="true" className="relative block h-[9px] w-6">
      <span className="absolute inset-x-0 top-0 h-px bg-current" />
      <span className="absolute inset-x-0 bottom-0 h-px origin-right scale-x-[0.62] bg-current transition-transform duration-300 ease-[var(--ease-rake)] group-hover/menu:scale-x-100" />
    </span>
  );
}

/**
 * Fixed site header. CSS decides the tone from the page (`body:has([data-hero="dark"])`, see the
 * CHROME block in globals.css) so the first paint is right; this component only flips
 * `data-scrolled` (solid, condensed, shadow) and drives the mobile menu.
 */
export function HeaderShell({ items, homeHref, homeLabel, wordmark, actions, menuDetails, preview }: HeaderShellProps) {
  const routePath = usePathname();
  const pathname = preview?.pathname ?? routePath;
  const menuId = `site-menu-${useId().replace(/[^\w-]/g, "")}`;
  const panelRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const isPreview = preview !== undefined;

  const hideMenu = useCallback(() => {
    const panel = panelRef.current;
    if (!panel || !isMenuOpen(panel)) return;
    if (supportsPopover(panel)) {
      panel.hidePopover();
    } else {
      panel.removeAttribute("data-open");
      emitToggle(panel, false);
    }
  }, []);

  /* Scroll state (rAF-throttled; React bails out when the value is unchanged). */
  useEffect(() => {
    if (isPreview) return;
    let frame = 0;
    const measure = () => {
      frame = 0;
      setScrolled(window.scrollY > window.innerHeight * SCROLL_RATIO);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [isPreview]);

  /* Menu behaviour on top of the native popover. */
  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;
    const root = document.documentElement;
    let previousOverflow = "";
    let locked = false;

    const focusables = () =>
      Array.from(panel.querySelectorAll<HTMLElement>("a[href], button:not([disabled])"));

    const onToggle = (event: Event) => {
      const open = (event as ToggleEvent).newState === "open";
      setMenuOpen(open);
      if (open) {
        if (!locked) {
          previousOverflow = root.style.overflow;
          root.style.overflow = "hidden";
          locked = true;
        }
        requestAnimationFrame(() => panel.querySelector<HTMLElement>("nav a[href]")?.focus());
      } else {
        if (locked) {
          root.style.overflow = previousOverflow;
          locked = false;
        }
        const active = document.activeElement;
        if (!active || active === document.body || panel.contains(active)) {
          toggleRef.current?.focus({ preventScroll: true });
        }
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !supportsPopover(panel)) {
        hideMenu();
        return;
      }
      if (event.key !== "Tab") return;
      const list = focusables();
      if (list.length === 0) return;
      const first = list[0];
      const last = list[list.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    const onClick = (event: MouseEvent) => {
      const target = event.target as Element | null;
      if (target?.closest?.("[data-menu-close]")) {
        if (!supportsPopover(panel)) hideMenu();
        return;
      }
      const link = target?.closest?.("a[href]");
      if (!link) return;
      const href = link.getAttribute("href") ?? "";
      if (href.startsWith("tel:") || href.startsWith("mailto:")) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
      hideMenu();
    };

    const desktop = window.matchMedia(DESKTOP_QUERY);
    const onBreakpoint = () => {
      if (desktop.matches) hideMenu();
    };

    panel.addEventListener("toggle", onToggle);
    panel.addEventListener("keydown", onKeyDown);
    panel.addEventListener("click", onClick);
    desktop.addEventListener("change", onBreakpoint);
    return () => {
      panel.removeEventListener("toggle", onToggle);
      panel.removeEventListener("keydown", onKeyDown);
      panel.removeEventListener("click", onClick);
      desktop.removeEventListener("change", onBreakpoint);
      if (locked) root.style.overflow = previousOverflow;
    };
  }, [hideMenu]);

  /* Close on route change (back/forward, or a link outside the sheet). */
  useEffect(() => {
    hideMenu();
  }, [routePath, hideMenu]);

  /* Fallback where the popover API is missing: the attribute does nothing, so toggle by hand. */
  const onMenuButton = () => {
    const panel = panelRef.current;
    if (!panel || supportsPopover(panel)) return;
    const open = !panel.hasAttribute("data-open");
    panel.toggleAttribute("data-open", open);
    emitToggle(panel, open);
  };

  const isScrolled = preview?.scrolled ?? scrolled;

  return (
    <header
      data-site-header=""
      data-scrolled={isScrolled ? "true" : "false"}
      data-tone={preview?.tone}
      className={cn(isPreview ? "relative" : "fixed inset-x-0 top-0", "z-50 h-[var(--header-h)]")}
    >
      {/* Legibility scrim over a dark hero (fades out once the bar turns solid) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[calc(var(--header-h)*1.75)] bg-[linear-gradient(to_bottom,color-mix(in_srgb,var(--color-graphite)_62%,transparent),transparent)] opacity-[var(--hdr-scrim)] transition-opacity duration-200 ease-[var(--ease-rake)]"
      />
      {/* The plate: solid plaster bar, condensed with scaleY (never animates height) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 origin-top bg-[color:var(--hdr-bg)] [transform:scaleY(var(--hdr-scale))] transition-[transform,background-color] duration-200 ease-[var(--ease-rake)]"
      >
        <span className="absolute inset-0 opacity-[var(--hdr-shadow)] shadow-[0_14px_32px_-20px_color-mix(in_srgb,var(--color-graphite)_55%,transparent)] transition-opacity duration-200 ease-[var(--ease-rake)]" />
      </div>
      {/* Hairline bottom rule, kept crisp (translated, not scaled) */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-compound opacity-[var(--hdr-rule)] [transform:translateY(calc(var(--hdr-shift)*2))] transition-[transform,opacity] duration-200 ease-[var(--ease-rake)]"
      />

      <div className="site-container relative flex h-full items-center gap-4 [transform:translateY(var(--hdr-shift))] transition-transform duration-200 ease-[var(--ease-rake)]">
        <Link
          href={homeHref}
          aria-label={homeLabel}
          className="-ml-1 inline-flex min-h-11 shrink-0 origin-left items-center px-1 [transform:scale(var(--hdr-mark))] transition-transform duration-200 ease-[var(--ease-rake)]"
        >
          {wordmark}
        </Link>

        <nav aria-label="Main" className="ml-6 hidden lg:block xl:ml-12">
          <ul className="flex items-center gap-1 xl:gap-4">
            {items.map((item) => {
              const current = isCurrentPath(pathname, item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={current ? "page" : undefined}
                    className="group/nav inline-flex min-h-11 items-center gap-2 px-2 text-[0.9375rem] font-medium leading-none"
                  >
                    <span className="font-mono text-[0.6875rem] font-medium tabular-nums tracking-[0.06em] text-[color:var(--hdr-muted)]">
                      {item.index}
                    </span>
                    <span className="relative py-1.5">
                      {item.label}
                      {current ? (
                        <CurrentMark />
                      ) : (
                        <span
                          aria-hidden="true"
                          className="absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 bg-worklight transition-transform duration-300 ease-[var(--ease-rake)] group-hover/nav:scale-x-100"
                        />
                      )}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-2 md:gap-4 xl:gap-6">
          {actions}
          <button
            ref={toggleRef}
            type="button"
            popoverTarget={menuId}
            aria-controls={menuId}
            aria-expanded={menuOpen}
            onClick={onMenuButton}
            className="group/menu -mr-2 inline-flex min-h-11 min-w-11 items-center gap-3 px-2 font-mono text-[0.75rem] font-medium uppercase leading-none tracking-[0.14em] lg:hidden"
          >
            <span>Menu</span>
            <MenuGlyph />
          </button>
        </div>
      </div>

      <MobileMenu
        ref={panelRef}
        id={menuId}
        currentPath={preview?.pathname}
        items={items}
        homeHref={homeHref}
        homeLabel={homeLabel}
        wordmark={wordmark}
        details={menuDetails}
      />
    </header>
  );
}
