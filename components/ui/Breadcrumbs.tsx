import Link from "next/link";
import { cn } from "@/lib/utils";

export type Crumb = { label: string; href?: string };

type BreadcrumbsProps = {
  /** Full trail including Home; the last item is the current page, e.g. [{ label: "Home", href: "/" }, { label: "Drywall" }] */
  items: readonly Crumb[];
  /** Force colours for a dark or light context; omit to inherit the surrounding surface */
  tone?: "dark" | "light";
  className?: string;
};

const toneVars = {
  dark: "[--ink:var(--color-plaster)] [--spec:var(--color-steel-light)] [--hairline:rgb(255_255_255/0.16)]",
  light: "[--ink:var(--color-graphite)] [--spec:var(--color-steel-ink)] [--hairline:var(--color-compound)]",
} as const;

/**
 * Visual breadcrumb trail for inner pages, set in spec type with hairline separators that end in a
 * tick (HOME ──┤ DRYWALL). BreadcrumbList JSON-LD is rendered separately by the SEO layer.
 */
export function Breadcrumbs({ items, tone, className }: BreadcrumbsProps) {
  if (items.length === 0) return null;
  const lastIndex = items.length - 1;

  return (
    <nav aria-label="Breadcrumb" className={cn(tone && toneVars[tone], className)}>
      <ol className="flex flex-wrap items-center">
        {items.map((item, i) => {
          const isLast = i === lastIndex;
          return (
            <li key={`${item.label}-${i}`} className="flex min-h-11 items-center">
              {isLast || !item.href ? (
                <span
                  aria-current={isLast ? "page" : undefined}
                  className="t-spec text-[color:var(--ink)]"
                >
                  {item.label}
                </span>
              ) : (
                /* Padding with a matching negative margin: a 44 px+ target without moving the text */
                <Link
                  href={item.href}
                  className="group/crumb t-spec -mx-1.5 inline-flex min-h-11 min-w-11 items-center px-1.5 transition-colors duration-200 hover:text-[color:var(--ink)] focus-visible:text-[color:var(--ink)]"
                >
                  <span className="bg-[linear-gradient(var(--color-worklight),var(--color-worklight))] bg-[length:0%_2px] bg-[position:0_100%] bg-no-repeat transition-[background-size] duration-300 ease-[var(--ease-rake)] group-hover/crumb:bg-[length:100%_2px] group-focus-visible/crumb:bg-[length:100%_2px]">
                    {item.label}
                  </span>
                </Link>
              )}
              {!isLast && (
                <span aria-hidden="true" className="mx-3 flex items-center md:mx-4">
                  <span className="block h-px w-5 bg-[color:var(--spec)]/50 md:w-7" />
                  <span className="block h-2.5 w-px bg-[color:var(--spec)]/70" />
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
