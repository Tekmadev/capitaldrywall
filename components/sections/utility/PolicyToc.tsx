"use client";

import { useEffect, useState } from "react";
import { CrossIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

export type TocItem = { id: string; n: string; label: string };

type PolicyTocProps = {
  items: readonly TocItem[];
  label?: string;
  className?: string;
};

/**
 * Policy contents in spec type. Desktop: a sticky list that marks the section being read
 * (aria-current="location"). Mobile: a collapsed <details> above the first section. Links work
 * without JavaScript; the active mark is progressive.
 */
export function PolicyToc({ items, label = "Contents", className }: PolicyTocProps) {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const sections = items
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => el !== null);
    if (sections.length === 0) return;

    const visible = new Set<string>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target.id);
          else visible.delete(entry.target.id);
        }
        const first = items.find((item) => visible.has(item.id));
        if (first) setActive(first.id);
      },
      // A reading line about a third of the way down the viewport
      { rootMargin: "-30% 0px -60% 0px" },
    );
    sections.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [items]);

  const list = (current: string | null) => (
    <ol className="flex flex-col">
      {items.map((item) => {
        const isCurrent = item.id === current;
        return (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              aria-current={isCurrent ? "location" : undefined}
              className={cn(
                "group/toc relative flex min-h-11 items-center gap-3 py-1.5 pl-5 font-mono text-[0.6875rem] font-medium uppercase leading-snug tracking-[0.12em] transition-colors duration-200 md:text-[0.75rem]",
                isCurrent ? "text-[color:var(--ink)]" : "text-[color:var(--spec)] hover:text-[color:var(--ink)]",
              )}
            >
              {/* Tick on the rail: amber for the section being read */}
              <span
                aria-hidden="true"
                className={cn(
                  "absolute left-0 top-1/2 h-px -translate-y-1/2 transition-[width,background-color] duration-300 ease-[var(--ease-rake)]",
                  isCurrent ? "w-3.5 bg-worklight" : "w-2 bg-[color:var(--hairline)] group-hover/toc:w-3 group-hover/toc:bg-[color:var(--spec)]",
                )}
              />
              <span className="tabular-nums">{item.n}</span>
              <span>{item.label}</span>
            </a>
          </li>
        );
      })}
    </ol>
  );

  return (
    <>
      <details className={cn("group/details border-y border-[color:var(--hairline)] lg:hidden", className)}>
        <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-4 t-spec text-[color:var(--ink)]! [&::-webkit-details-marker]:hidden">
          <span>{label}</span>
          <CrossIcon size={16} className="shrink-0 transition-transform duration-300 ease-[var(--ease-rake)] group-open/details:rotate-45" />
        </summary>
        <nav aria-label={label} className="border-t border-[color:var(--hairline)] py-3">
          {list(null)}
        </nav>
      </details>

      <nav aria-label={label} className={cn("hidden lg:block", className)}>
        <p className="t-spec mb-4">{label}</p>
        <div className="relative">
          <span aria-hidden="true" className="absolute inset-y-0 left-0 w-px bg-[color:var(--hairline)]" />
          {list(active)}
        </div>
      </nav>
    </>
  );
}
