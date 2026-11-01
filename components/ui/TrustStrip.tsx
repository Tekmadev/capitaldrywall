import { trustItems } from "@/content/copy/global";
import { cn } from "@/lib/utils";

type TrustStripProps = {
  /** Force colours for a dark or light context; omit to inherit the surrounding surface */
  tone?: "dark" | "light";
  /** row: the hero trust row (inline, left-aligned). band: a standalone full-width strip between hairlines. */
  size?: "row" | "band";
  /** Defaults to the copy deck's trust strip (content/copy/global.ts) */
  items?: readonly string[];
  className?: string;
};

const toneVars = {
  dark: "[--ink:var(--color-plaster)] [--spec:var(--color-steel-light)] [--hairline:rgb(255_255_255/0.08)]",
  light: "[--ink:var(--color-graphite)] [--spec:var(--color-steel-ink)] [--hairline:var(--color-compound)]",
} as const;

/**
 * The trust strip set like a drafting dimension string: ├─ FREE ON-SITE QUOTES ─┼─ FULLY INSURED ─┤.
 * Each item carries its own end ticks; neighbours overlap by a pixel so ticks read as one ┼ on a row,
 * and every wrapped row still opens and closes with a tick. Real elements, no icons, no ASCII.
 */
export function TrustStrip({ tone, size = "row", items = trustItems, className }: TrustStripProps) {
  if (items.length === 0) return null;
  const band = size === "band";
  const last = items.length - 1;

  const list = (
    <ul className={cn("flex flex-wrap items-center gap-y-3", band && "md:gap-y-4")}>
      {items.map((item, i) => (
        <li key={item} className={cn("flex min-w-0 items-center", i > 0 && "-ml-px", band && "grow")}>
          <Tick tall={i === 0} origin={i === 0} />
          <Run grow={band} />
          <span className="t-spec px-2 text-[color:var(--ink)] md:px-2.5">{item}</span>
          <Run grow={band} />
          <Tick tall={i === last} />
        </li>
      ))}
    </ul>
  );

  if (!band) {
    return <div className={cn(tone && toneVars[tone], className)}>{list}</div>;
  }

  return (
    <div
      className={cn(
        tone === "dark" && "surface-dark",
        tone === "light" && "surface-light",
        "border-y border-[color:var(--hairline)]",
        className,
      )}
    >
      <div className="site-container py-5 md:py-7">{list}</div>
    </div>
  );
}

function Tick({ tall = false, origin = false }: { tall?: boolean; origin?: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "block w-px shrink-0",
        tall ? "h-3.5" : "h-2.5",
        // The string's origin tick is the work light: the only amber in the strip.
        origin ? "bg-worklight" : "bg-[color:var(--spec)]/70",
      )}
    />
  );
}

function Run({ grow }: { grow: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={cn("block h-px shrink-0 bg-[color:var(--spec)]/45", grow ? "min-w-3 flex-1 md:min-w-5" : "w-3 md:w-5")}
    />
  );
}
