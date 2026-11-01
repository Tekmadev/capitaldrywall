import { cn } from "@/lib/utils";
import { TickIcon } from "./icons";

export type LevelVialState = "progress" | "level" | "unfinished";

type LevelVialProps = {
  /** 0–1: the bubble travels from the low end toward the centre marks as steps complete */
  progress?: number;
  /**
   * progress: bubble placed by `progress`.
   * level: bubble settles to centre with a damped wobble, marks turn level green.
   * unfinished: the 404 illustration: level tilted 3°, bubble pinned to the high end.
   */
  state?: LevelVialState;
  size?: "sm" | "lg";
  /** Caption under the level; `true` uses the copy deck's "Level. We've got it." */
  caption?: boolean | string;
  /** Accessible name. Omit when nearby text already says it (the vial is then decorative). */
  label?: string;
  className?: string;
};

/* Geometry (viewBox units). The bubble is drawn at the centre and translated along the vial. */
const CX = 140;
const CY = 32;
const TRAVEL = 28;
const DEFAULT_CAPTION = "Level. We've got it.";

/** Engraved scale ticks on the level's top flange, either side of the vial window */
const scaleTicks = (() => {
  let d = "";
  for (const [from, to] of [
    [24, 84],
    [196, 256],
  ]) {
    for (let x = from, i = 0; x <= to; x += 6, i++) {
      const h = i % 5 === 0 ? 4.5 : 2.5;
      d += `M${x + 0.5} 10.5v${h}`;
    }
  }
  return d;
})();

const css = `
.cdr-vial-bubble{transition:transform 700ms cubic-bezier(0.22,1,0.36,1)}
.cdr-vial-tint,.cdr-vial-mark{transition:fill 600ms ease,stroke 600ms ease,stroke-width 600ms ease}
.cdr-vial[data-state="level"] .cdr-vial-bubble{animation:cdr-vial-settle 1.6s both}
@keyframes cdr-vial-settle{
0%{transform:translateX(-18px);animation-timing-function:cubic-bezier(0.3,0,0.2,1)}
26%{transform:translateX(7.5px);animation-timing-function:ease-in-out}
46%{transform:translateX(-3.6px);animation-timing-function:ease-in-out}
64%{transform:translateX(1.7px);animation-timing-function:ease-in-out}
80%{transform:translateX(-0.7px);animation-timing-function:ease-in-out}
100%{transform:translateX(0)}}
@media (prefers-reduced-motion:reduce){.cdr-vial-bubble{transition:none}.cdr-vial[data-state="level"] .cdr-vial-bubble{animation:none}}
`;

/**
 * The spirit level (brief §6 Motifs): form progress, the "Level. We've got it." success state and
 * the 404. Pure SVG + CSS (server-renderable); hairlines stay 1 px at any size.
 */
export function LevelVial({
  progress = 0,
  state = "progress",
  size = "sm",
  caption,
  label,
  className,
}: LevelVialProps) {
  const p = Math.min(1, Math.max(0, Number.isFinite(progress) ? progress : 0));
  const level = state === "level";
  const unfinished = state === "unfinished";
  const dx = level ? 0 : unfinished ? TRAVEL : -TRAVEL * (1 - p);
  const captionText = caption === true ? DEFAULT_CAPTION : caption || null;
  const hairline = { vectorEffect: "non-scaling-stroke" as const };

  return (
    <div
      className={cn(
        "cdr-vial inline-flex flex-col gap-3 text-[color:var(--ink)]",
        size === "sm" ? "w-[168px]" : "w-full max-w-[440px]",
        className,
      )}
      data-state={state}
    >
      <style href="cdr-level-vial" precedence="default">
        {css}
      </style>
      <svg
        viewBox={unfinished ? "-14 -6 318 76" : "0 8 280 48"}
        className="block h-auto w-full overflow-visible"
        role={label ? "img" : undefined}
        aria-label={label}
        aria-hidden={label ? undefined : true}
        focusable="false"
      >
        {unfinished && (
          <g aria-hidden="true">
            {/* True level datum the tool should sit on */}
            <path d={`M-12 ${CY}.5H292`} stroke="currentColor" strokeOpacity={0.4} strokeDasharray="5 4" style={hairline} />
            {/* 3° angle annotation at the high end */}
            <path
              d={`M292 ${CY}.5A152 152 0 0 0 291.8 ${CY - 7.5}`}
              fill="none"
              stroke="currentColor"
              strokeOpacity={0.55}
              style={hairline}
            />
            <text
              x="297"
              y={CY - 1.5}
              className="fill-current font-mono"
              style={{ fontSize: 9, fontWeight: 500, letterSpacing: "0.08em" }}
              fillOpacity={0.7}
            >
              3°
            </text>
          </g>
        )}
        <g transform={unfinished ? `rotate(-3 ${CX} ${CY})` : undefined}>
          {/* Body: an I-beam level, hairline frame */}
          <rect x="0.5" y="10.5" width="279" height="43" rx="2" fill="var(--surface, transparent)" stroke="currentColor" strokeOpacity={0.6} style={hairline} />
          <path d="M1 16.5H279M1 47.5H279" stroke="currentColor" strokeOpacity={0.22} style={hairline} />
          <rect x="1" y="11" width="17.5" height="42" fill="currentColor" fillOpacity={0.06} />
          <rect x="261.5" y="11" width="17.5" height="42" fill="currentColor" fillOpacity={0.06} />
          <path d="M18.5 11V53M261.5 11V53" stroke="currentColor" strokeOpacity={0.35} style={hairline} />
          <path d={scaleTicks} stroke="currentColor" strokeOpacity={0.45} style={hairline} />
          {size === "lg" && (
            <rect x="36.5" y="27.5" width="24" height="9" rx="4.5" fill="none" stroke="currentColor" strokeOpacity={0.4} style={hairline} />
          )}

          {/* Vial window + tube */}
          <rect x="92.5" y="19.5" width="95" height="25" rx="1.5" fill="var(--surface, transparent)" stroke="currentColor" strokeOpacity={0.45} style={hairline} />
          <rect
            x="100.5"
            y="25.5"
            width="79"
            height="13"
            rx="6.5"
            className={cn("cdr-vial-tint", level ? "fill-level/20" : "fill-worklight/20")}
            stroke="currentColor"
            strokeOpacity={0.7}
            style={hairline}
          />

          {/* Bubble */}
          <g className="cdr-vial-bubble" style={{ transform: `translateX(${dx}px)` }}>
            <ellipse cx={CX} cy={CY} rx="9.5" ry="4.4" className="fill-plaster" stroke="currentColor" strokeOpacity={0.75} style={hairline} />
            <path d={`M${CX - 6} ${CY + 2}Q${CX} ${CY + 4.2} ${CX + 6} ${CY + 2}`} fill="none" stroke="currentColor" strokeOpacity={0.3} style={hairline} />
          </g>

          {/* Centre marks */}
          <path
            d={`M${CX - 11.5} 22V42M${CX + 11.5} 22V42`}
            className={cn("cdr-vial-mark", level ? "stroke-level" : "stroke-current")}
            strokeWidth={level ? 1.75 : 1.25}
            strokeOpacity={level ? 1 : 0.85}
            style={hairline}
          />
        </g>
      </svg>
      {captionText && (
        <p className="t-spec flex items-center gap-2 whitespace-nowrap">
          <TickIcon size={14} className={level ? "text-level" : undefined} />
          {captionText}
        </p>
      )}
    </div>
  );
}
