import type { ReactNode } from "react";
import { cn, pad2 } from "@/lib/utils";
import "./Accordion.css";
import { CrossIcon } from "./icons";

export type AccordionItem = {
  /** Stable id: used for data-faq-id (analytics) and the DOM id */
  id: string;
  /** Plain-text title (the question). Becomes the summary's accessible name. */
  title: string;
  /** Answer. A string renders as one paragraph. */
  content: ReactNode;
};

type AccordionProps = {
  items: AccordionItem[];
  /**
   * Heading level inside each <summary>. The HTML content model of <summary> allows phrasing content
   * "optionally intermixed with heading content", so <summary><h3>…</h3></summary> is valid: screen
   * readers that expose headings let users jump between questions, the rest read the question as the
   * disclosure's name. The decorative index and icon are aria-hidden so the name is the question only.
   */
  headingLevel?: 2 | 3 | 4;
  /** Index prefix: "Q." renders "Q.01" */
  indexPrefix?: string;
  /** Item ids open on first render (works without JS) */
  defaultOpen?: readonly string[];
  /** Exclusive group: native `name` attribute, so opening one closes the others (default off) */
  name?: string;
  /** Adds data-faq-id so AnalyticsListeners records faq_open (default true) */
  trackFaq?: boolean;
  className?: string;
};

/**
 * Accordion on native <details>/<summary>: opens without JavaScript, keyboard and find-in-page work
 * natively. Mono "Q.01" index, Archivo question, crosshair that turns 45° to an ×, a faint work-light
 * wash from the left on hover, and a smooth height animation where ::details-content is supported.
 */
export function Accordion({
  items,
  headingLevel = 3,
  indexPrefix = "Q.",
  defaultOpen,
  name,
  trackFaq = true,
  className,
}: AccordionProps) {
  if (items.length === 0) return null;
  const Heading = `h${headingLevel}` as "h2" | "h3" | "h4";

  return (
    <div className={cn("border-t border-[color:var(--hairline)]", className)}>
      {items.map((item, i) => (
        <details
          key={item.id}
          id={`q-${item.id}`}
          name={name}
          open={defaultOpen?.includes(item.id) || undefined}
          data-faq-id={trackFaq ? item.id : undefined}
          className="acc-item group/acc border-b border-[color:var(--hairline)]"
        >
          <summary
            className={cn(
              "relative grid cursor-pointer list-none grid-cols-[2.5rem_minmax(0,1fr)_2.75rem] items-start gap-x-2 py-6 sm:grid-cols-[3rem_minmax(0,1fr)_2.75rem] sm:gap-x-3 md:grid-cols-[4.5rem_minmax(0,1fr)_2.75rem] md:gap-x-4 md:py-8",
              "[&::-webkit-details-marker]:hidden",
              /* Work-light wash raking in from the left on hover */
              "before:pointer-events-none before:absolute before:inset-y-0 before:-left-3 before:right-0 before:-z-10 before:bg-[linear-gradient(90deg,rgb(244_166_42/0.10),rgb(244_166_42/0.03)_35%,transparent_70%)] before:opacity-0 before:transition-opacity before:duration-300 before:ease-[var(--ease-rake)] hover:before:opacity-100",
              "active:before:opacity-100",
            )}
          >
            <span
              aria-hidden="true"
              className={cn(
                "t-spec relative pt-[0.45rem] tabular-nums transition-colors duration-200",
                "group-hover/acc:text-[color:var(--ink)] group-open/acc:text-[color:var(--ink)]",
                /* amber measuring tick under the index while open */
                "after:absolute after:-bottom-2 after:left-0 after:h-0.5 after:w-0 after:bg-worklight after:transition-[width] after:duration-300 after:ease-[var(--ease-rake)] group-open/acc:after:w-6",
              )}
            >
              {indexPrefix}
              {pad2(i + 1)}
            </span>
            <Heading className="t-h3 text-[color:var(--ink)] max-sm:[font-size:1.3125rem]!">{item.title}</Heading>
            <span
              aria-hidden="true"
              className={cn(
                "-my-2 grid size-11 place-items-center justify-self-end text-[color:var(--ink)]",
                "transition-transform duration-300 ease-[var(--ease-rake)] group-open/acc:rotate-45",
                "group-active/acc:scale-90",
              )}
            >
              <CrossIcon size={22} />
            </span>
          </summary>
          <div className="grid grid-cols-[2.5rem_minmax(0,1fr)_2.75rem] gap-x-2 sm:grid-cols-[3rem_minmax(0,1fr)_2.75rem] sm:gap-x-3 md:grid-cols-[4.5rem_minmax(0,1fr)_2.75rem] md:gap-x-4">
            <div className="col-span-2 col-start-2 pb-8 text-muted sm:col-span-1 md:pb-10">
              {typeof item.content === "string" ? <p className="prose-measure">{item.content}</p> : item.content}
            </div>
          </div>
        </details>
      ))}
    </div>
  );
}
