import Link from "next/link";
import type { AnchorHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type ChipProps = {
  children: ReactNode;
  /** Renders a link (in-page "#id" anchors, internal paths or external URLs); otherwise a static tag */
  href?: string;
  /** Mono prefix, e.g. "01" */
  index?: string;
  /** Selected / current state: links get aria-current ("location" for #anchors, "page" otherwise) */
  current?: boolean;
  className?: string;
} & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "className" | "children">;

const pill =
  "relative inline-flex h-8 max-w-full items-center gap-2 rounded-full border px-3.5 font-mono text-[0.6875rem] font-medium uppercase leading-none tracking-[0.12em] whitespace-nowrap";

/**
 * Small pill tag (the only rounded-full shape on the site): jump links and static values.
 * Links keep a 32 px pill but a 44 px tap area (an invisible hit pad above and below).
 */
export function Chip({ children, href, index, current = false, className, ...rest }: ChipProps) {
  const tone = current
    ? "border-[color:var(--ink)] bg-[color:var(--ink)] text-[color:var(--surface)]"
    : "border-[color:color-mix(in_srgb,var(--ink)_28%,transparent)] text-[color:var(--ink)]";

  const content = (
    <>
      {index && (
        <span className={cn("tabular-nums", current ? "opacity-70" : "text-[color:var(--spec)]")}>{index}</span>
      )}
      <span className="truncate">{children}</span>
      {href && <ChipArrow down={href.startsWith("#")} />}
    </>
  );

  if (!href) {
    return <span className={cn(pill, tone, className)}>{content}</span>;
  }

  const linkClass = cn(
    pill,
    tone,
    "group/chip touch-manipulation transition-[background-color,border-color,color] duration-200 ease-[var(--ease-rake)]",
    "before:absolute before:inset-x-0 before:-inset-y-1.5 before:content-['']",
    current
      ? "hover:bg-[color:color-mix(in_srgb,var(--ink)_88%,transparent)]"
      : "hover:border-[color:var(--ink)] hover:bg-[color:color-mix(in_srgb,var(--ink)_7%,transparent)] active:bg-[color:color-mix(in_srgb,var(--ink)_13%,transparent)]",
    className,
  );
  const ariaCurrent = current ? (href.startsWith("#") ? "location" : "page") : undefined;

  if (href.startsWith("/")) {
    return (
      <Link href={href} className={linkClass} aria-current={ariaCurrent} {...rest}>
        {content}
      </Link>
    );
  }
  const external = /^https?:/.test(href);
  return (
    <a
      href={href}
      className={linkClass}
      aria-current={ariaCurrent}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      {...rest}
    >
      {content}
    </a>
  );
}

/** Tiny dimension arrow: points down for in-page jumps, right for other links; nudges on hover. */
function ChipArrow({ down }: { down: boolean }) {
  return (
    <svg
      viewBox="0 0 10 10"
      width={9}
      height={9}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.4}
      aria-hidden="true"
      focusable="false"
      className={cn(
        "shrink-0 transition-transform duration-200 ease-[var(--ease-rake)]",
        down ? "group-hover/chip:translate-y-0.5" : "-rotate-90 group-hover/chip:translate-x-0.5",
      )}
    >
      <path d="M5 1v7.5M1.5 5 5 8.5 8.5 5" strokeLinecap="square" />
    </svg>
  );
}
