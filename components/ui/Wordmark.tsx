import { brand } from "@/content/copy/global";
import { cn } from "@/lib/utils";

/**
 * Wordmark placeholder until the SVG logo arrives (brief §7.9): "CAPITAL" in Archivo expanded over
 * "DRYWALL & RENOVATION" in mono. `size="footer"` sets it oversized for the title block.
 */
export function Wordmark({
  size = "header",
  className,
}: {
  size?: "header" | "footer";
  className?: string;
}) {
  if (size === "footer") {
    return (
      <span
        className={cn("block w-full leading-none [container-type:inline-size]", className)}
        aria-label={brand.name}
        role="img"
      >
        <span
          aria-hidden="true"
          className="block whitespace-nowrap font-display text-[18.4cqw] font-[820] leading-[0.78] tracking-[-0.035em] [font-stretch:125%]"
        >
          {brand.wordmark.top}
        </span>
        <span
          aria-hidden="true"
          className="mt-[2.2cqw] block whitespace-nowrap font-mono text-[4.12cqw] font-medium uppercase leading-none tracking-[0.6em]"
        >
          {brand.wordmark.bottom}
        </span>
      </span>
    );
  }
  return (
    <span className={cn("inline-flex flex-col leading-none", className)}>
      <span className="font-display text-[1.375rem] font-[820] leading-[0.85] tracking-[-0.01em] [font-stretch:125%]">
        {brand.wordmark.top}
      </span>{" "}
      <span className="mt-[5px] font-mono text-[0.5rem] font-medium uppercase leading-none tracking-[0.335em]">
        {brand.wordmark.bottom}
      </span>
    </span>
  );
}
