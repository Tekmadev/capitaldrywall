import { cn } from "@/lib/utils";
import { RegistrationMarks, TitleCell } from "./drafting";

type OwnerNoteProps = {
  body: string;
  /** Optional sister-brand line (null/undefined hides it) */
  sisterLine?: string | null;
  /** ownerSignature(): "{{ownerName}}, Owner" or "The owner, Capital Drywall & Renovation" */
  signature: string;
  /** Sheet code for the title block, e.g. "A-10" */
  sheet?: string;
  /** Unique suffix for the stamp's SVG path id (needed when two notes share a page) */
  stampId?: string;
  className?: string;
};

/**
 * The owner's letter as a drawing sheet: the note set large in Archivo (never italic, no script
 * fonts), a title-block row with "CHECKED BY" = the signature, and a drafted inspection stamp on the
 * sheet's top corner (it never covers the text: give the note ~6rem of space above). Looks complete
 * without a portrait.
 */
export function OwnerNote({ body, sisterLine, signature, sheet, stampId = "owner", className }: OwnerNoteProps) {
  return (
    <div className={cn("relative border border-[color:var(--hairline)] bg-[color:var(--surface)]", className)}>
      <RegistrationMarks />
      <div className="px-5 pt-9 pb-10 sm:px-8 md:px-12 md:pt-12 md:pb-14 lg:px-14">
        <p className="font-display text-[clamp(1.3125rem,2.3vw,2.0625rem)] leading-[1.32] font-[430] tracking-[-0.012em] text-[color:var(--ink)] [font-stretch:100%]">
          {body}
        </p>
        {sisterLine && <p className="mt-8 max-w-[52ch] text-muted">{sisterLine}</p>}
      </div>

      {/* Title-block row */}
      <div className="grid grid-cols-[minmax(0,1fr)_auto] border-t border-[color:var(--hairline)]">
        <TitleCell label="Checked by" className="px-5 py-4 sm:px-8 md:px-12 lg:px-14">
          {signature}
        </TitleCell>
        {sheet && (
          <TitleCell label="Sheet" className="border-l border-[color:var(--hairline)] px-5 py-4 tabular-nums sm:px-8">
            {sheet}
          </TitleCell>
        )}
      </div>

      <InspectionStamp
        id={stampId}
        className="pointer-events-none absolute -top-[5.5rem] right-3 size-28 -rotate-[9deg] sm:-top-24 sm:right-8 sm:size-32 md:-top-28 md:size-36 lg:-right-4 xl:-right-8"
      />
    </div>
  );
}

/**
 * Drafted inspection stamp: double ring with mono ring text ("Finished under raking light", copy
 * deck values) and a spirit-level vial with its bubble centred, the site's "level" language.
 */
export function InspectionStamp({ id, className }: { id: string; className?: string }) {
  const pathId = `stamp-ring-${id}`;
  return (
    <svg
      viewBox="0 0 140 140"
      aria-hidden="true"
      focusable="false"
      className={cn("text-[color:var(--ink)] opacity-80", className)}
    >
      <defs>
        <path id={pathId} d="M70 70 m-51 0 a51 51 0 1 1 102 0 a51 51 0 1 1 -102 0" />
      </defs>
      <circle cx="70" cy="70" r="66" fill="var(--surface)" stroke="currentColor" strokeWidth="1.25" />
      <circle cx="70" cy="70" r="62" fill="none" stroke="currentColor" strokeWidth="0.6" />
      <circle cx="70" cy="70" r="40" fill="none" stroke="currentColor" strokeWidth="0.6" />
      <text
        className="fill-current font-mono"
        style={{ fontSize: 8.4, fontWeight: 500, letterSpacing: "0.21em", textTransform: "uppercase" }}
      >
        <textPath href={`#${pathId}`} startOffset="0">
          Finished under raking light · Ottawa, ON ·
        </textPath>
      </text>
      {/* Spirit-level vial, bubble centred between its marks */}
      <text
        x="70"
        y="56"
        textAnchor="middle"
        className="fill-current font-mono"
        style={{ fontSize: 8, fontWeight: 500, letterSpacing: "0.18em" }}
      >
        CHECKED
      </text>
      <rect x="45" y="64" width="50" height="13" rx="6.5" fill="none" stroke="currentColor" strokeWidth="1" />
      <line x1="62" y1="64" x2="62" y2="77" stroke="currentColor" strokeWidth="0.75" />
      <line x1="78" y1="64" x2="78" y2="77" stroke="currentColor" strokeWidth="0.75" />
      <ellipse cx="70" cy="70.5" rx="5.2" ry="3.6" fill="var(--color-worklight)" stroke="currentColor" strokeWidth="0.6" />
      <line x1="52" y1="88" x2="88" y2="88" stroke="currentColor" strokeWidth="0.6" />
      <line x1="52" y1="85" x2="52" y2="91" stroke="currentColor" strokeWidth="0.6" />
      <line x1="88" y1="85" x2="88" y2="91" stroke="currentColor" strokeWidth="0.6" />
    </svg>
  );
}
