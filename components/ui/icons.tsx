import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

/** Handset, drawn on a 24 grid with a 1.5 stroke (no emoji, no icon font). */
export function PhoneIcon({ size = 18, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="square"
      strokeLinejoin="miter"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <path d="M8.2 3.5 5 4.6c-.9.3-1.4 1.2-1.3 2.1.6 6.7 5.9 12 12.6 12.6.9.1 1.8-.4 2.1-1.3l1.1-3.2-4.3-2-1.9 1.9a10.3 10.3 0 0 1-4.9-4.9l1.9-1.9-2-4.3Z" />
    </svg>
  );
}

/** Dimension-line arrow: a start tick, a run and an open head. Reads as "measure → go". */
export function ArrowIcon({ size = 22, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 28 12"
      width={size}
      height={(size * 12) / 28}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <path d="M1 2v8" />
      <path d="M1 6h25" />
      <path d="m21 1.5 5 4.5-5 4.5" strokeLinecap="square" />
    </svg>
  );
}

/** Crosshair plus used by the accordion (rotates to an × / settles to a minus). */
export function CrossIcon({ size = 18, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 20 20"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <path d="M10 2v16M2 10h16" />
      <circle cx="10" cy="10" r="3.25" />
    </svg>
  );
}

/** Small check mark for confirmations and checklists. */
export function TickIcon({ size = 16, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 16 16"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="square"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <path d="m3 8.5 3.2 3L13 4.5" />
    </svg>
  );
}
