import type { CSSProperties } from "react";
import { DimensionLine } from "@/components/ui/DimensionLine";
import { cn, pad2 } from "@/lib/utils";
import { DrawOnView } from "./DrawOnView";

/*
 * Interior elevation of one wall, read left to right in the order it's built: bare board, the
 * finished (flat, square) wall, paint, then tile and cabinets on top of it. The raking light comes
 * from the left and low, the way it does everywhere on the site. Linework is SVG; the keynote
 * bubbles and labels are HTML so they stay crisp and readable at any size.
 */

const W = 640;
const H = 400;
const CEIL = 20;
const FLOOR = 368;
const WALL_L = 16;
const WALL_R = 624;
const BOARD_R = 52; // bare board shows from the corner to here
const FINISH_R = 96; // finished compound shows to here; paint from here on
const RUN_L = 316; // kitchen run
const CAB_W = 92;
const CABS = [316, 412, 508];
const UPPER = { top: 40, bottom: 160 };
const SPLASH = { top: 160, bottom: 244 };
const COUNTER = { top: 244, bottom: 254 };
const BASE = { top: 254, bottom: 352 };

export type Keynote = { id: string; label: string; x: number; y: number; on?: string };

const keynotes: Keynote[] = [
  { id: "wall", label: "Wall: flat, square, finished", x: (BOARD_R + FINISH_R) / 2, y: 104 },
  { id: "paint", label: "Paint", x: 206, y: 104, on: "01" },
  { id: "tile", label: "Tile", x: RUN_L + (CAB_W * 3 + 8) / 2, y: (SPLASH.top + SPLASH.bottom) / 2, on: "01" },
  { id: "cabinets", label: "Cabinets", x: RUN_L + (CAB_W * 3 + 8) / 2, y: (UPPER.top + UPPER.bottom) / 2, on: "01" },
];

const layer = (i: number): CSSProperties => ({ ["--i" as string]: i });

/** Running-bond tile joints for the backsplash. */
function tileJoints() {
  const rows = 4;
  const rowH = (SPLASH.bottom - SPLASH.top) / rows;
  const tileW = 42;
  const right = RUN_L + CAB_W * 3 + 8;
  const d: string[] = [];
  for (let r = 1; r < rows; r++) d.push(`M${RUN_L} ${SPLASH.top + r * rowH}H${right}`);
  for (let r = 0; r < rows; r++) {
    const y0 = SPLASH.top + r * rowH;
    for (let x = RUN_L + (r % 2 ? tileW / 2 : tileW); x < right - 4; x += tileW) d.push(`M${x} ${y0}v${rowH}`);
  }
  return d.join("");
}

function Bubble({ n, accent, className, style }: { n: number; accent?: boolean; className?: string; style?: CSSProperties }) {
  return (
    <span
      aria-hidden="true"
      style={style}
      className={cn(
        "flex size-7 shrink-0 items-center justify-center rounded-full border bg-[color:var(--surface)] font-mono text-[0.6875rem] font-medium leading-none tabular-nums text-[color:var(--ink)]",
        accent ? "border-worklight" : "border-[color:var(--ink)]/70",
        className,
      )}
    >
      {pad2(n)}
    </span>
  );
}

export function WallElevation({ fig, className }: { fig: number; className?: string }) {
  const right = RUN_L + CAB_W * 3 + 8;

  return (
    <DrawOnView as="figure" className={cn("reno-elev", className)}>
      <div className="relative" style={{ aspectRatio: `${W} / ${H}` }}>
        <svg
          viewBox={`0 0 ${W} ${H}`}
          aria-hidden="true"
          focusable="false"
          className="absolute inset-0 size-full overflow-visible text-[color:var(--ink)]"
          fill="none"
          stroke="currentColor"
          strokeWidth={1}
        >
          <defs>
            <pattern id="reno-elev-stipple" width="7" height="7" patternUnits="userSpaceOnUse">
              <circle cx="1.6" cy="1.8" r="0.7" fill="currentColor" stroke="none" />
              <circle cx="5.1" cy="5.2" r="0.55" fill="currentColor" stroke="none" />
            </pattern>
            <radialGradient id="reno-elev-rake" cx="-0.06" cy="0.68" r="0.95">
              <stop offset="0" className="[stop-color:var(--color-worklight)]" stopOpacity="0.26" />
              <stop offset="0.45" className="[stop-color:var(--color-worklight)]" stopOpacity="0.08" />
              <stop offset="1" className="[stop-color:var(--color-worklight)]" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* The room: ceiling, floor (cut hatch below), wall corners, square marks */}
          <g className="reno-layer reno-layer-base" style={layer(0)}>
            <rect x={WALL_L} y={CEIL} width={WALL_R - WALL_L} height={FLOOR - CEIL} className="fill-[color:var(--surface-raised)]" stroke="none" />
            <path d={`M0 ${CEIL}H${W}`} strokeOpacity="0.3" />
            <path d={`M${WALL_L} ${CEIL}V${FLOOR}M${WALL_R} ${CEIL}V${FLOOR}`} strokeOpacity="0.5" />
            <path d={`M0 ${FLOOR}H${W}`} strokeWidth="1.5" strokeOpacity="0.9" />
            <path
              d={Array.from({ length: 53 }, (_, i) => `M${12 + i * 12} ${FLOOR + 1}l-8 10`).join("")}
              strokeOpacity="0.22"
            />
            <path d={`M${WALL_L} ${FLOOR - 11}h11v11M${WALL_R} ${FLOOR - 11}h-11v11`} strokeOpacity="0.75" />
          </g>

          {/* Bare board: screws on the stud line */}
          <g className="reno-layer" style={layer(1)}>
            <rect x={WALL_L} y={CEIL} width={BOARD_R - WALL_L} height={FLOOR - CEIL} fill="currentColor" fillOpacity="0.035" stroke="none" />
            <path d={`M${(WALL_L + BOARD_R) / 2} ${CEIL + 6}V${FLOOR - 6}`} strokeOpacity="0.28" strokeDasharray="2 5" />
            {Array.from({ length: 9 }, (_, i) => (
              <circle key={i} cx={(WALL_L + BOARD_R) / 2} cy={CEIL + 26 + i * 38} r="1.7" fill="currentColor" fillOpacity="0.55" stroke="none" />
            ))}
          </g>

          {/* Finished wall: compound, sanded flat */}
          <g className="reno-layer" style={layer(2)}>
            <rect x={BOARD_R} y={CEIL} width={FINISH_R - BOARD_R} height={FLOOR - CEIL} fill="currentColor" fillOpacity="0.08" stroke="none" />
            <rect x={BOARD_R} y={CEIL} width={FINISH_R - BOARD_R} height={FLOOR - CEIL} fill="url(#reno-elev-stipple)" fillOpacity="0.32" stroke="none" />
            <path d={`M${BOARD_R} ${CEIL}V${FLOOR}`} strokeOpacity="0.6" />
          </g>

          {/* Paint, lit by a low raking light from the left; baseboard and a switch plate */}
          <g className="reno-layer" style={layer(3)}>
            <rect x={WALL_L} y={CEIL} width={WALL_R - WALL_L} height={FLOOR - CEIL} fill="url(#reno-elev-rake)" stroke="none" />
            <path d={`M${FINISH_R} ${CEIL}V${FLOOR}`} strokeOpacity="0.7" />
            <path d={`M${FINISH_R} ${FLOOR - 16}H${RUN_L - 8}M${FINISH_R} ${FLOOR - 12}H${RUN_L - 8}`} strokeOpacity="0.6" />
            <rect x="244" y="176" width="15" height="24" rx="1" strokeOpacity="0.65" />
            <path d="M251.5 184v8" strokeOpacity="0.65" />
          </g>

          {/* Tile backsplash, running bond, with an outlet */}
          <g className="reno-layer" style={layer(4)}>
            <rect x={RUN_L} y={SPLASH.top} width={right - RUN_L} height={SPLASH.bottom - SPLASH.top} className="fill-[color:var(--surface-raised)]" strokeOpacity="0.75" />
            <path d={tileJoints()} strokeOpacity="0.32" />
            <rect x={right - 40} y="190" width="14" height="22" rx="1" className="fill-[color:var(--surface-raised)]" strokeOpacity="0.7" />
            <path d={`M${right - 35} 197v3M${right - 31} 197v3M${right - 35} 204v3M${right - 31} 204v3`} strokeOpacity="0.6" />
          </g>

          {/* Cabinets: shaker uppers, counter, drawer-over-door bases, toe kick */}
          <g className="reno-layer" style={layer(5)}>
            {CABS.map((x, i) => (
              <g key={`u${x}`}>
                <rect x={x} y={UPPER.top} width={CAB_W} height={UPPER.bottom - UPPER.top} className="fill-[color:var(--surface)]" strokeOpacity="0.85" />
                <rect x={x + 10} y={UPPER.top + 10} width={CAB_W - 20} height={UPPER.bottom - UPPER.top - 20} strokeOpacity="0.42" />
                <path d={`M${i % 2 ? x + 16 : x + CAB_W - 16} ${UPPER.bottom - 34}v16`} strokeOpacity="0.85" strokeWidth="1.5" />
              </g>
            ))}
            <rect x={RUN_L - 8} y={COUNTER.top} width={right - RUN_L + 16} height={COUNTER.bottom - COUNTER.top} fill="currentColor" fillOpacity="0.2" strokeOpacity="0.9" />
            {CABS.map((x) => (
              <g key={`b${x}`}>
                <rect x={x} y={BASE.top} width={CAB_W} height={BASE.bottom - BASE.top} className="fill-[color:var(--surface)]" strokeOpacity="0.85" />
                <rect x={x + 7} y={BASE.top + 7} width={CAB_W - 14} height="22" strokeOpacity="0.42" />
                <rect x={x + 7} y={BASE.top + 34} width={CAB_W - 14} height={BASE.bottom - BASE.top - 41} strokeOpacity="0.42" />
                <path d={`M${x + CAB_W / 2 - 10} ${BASE.top + 18}h20`} strokeOpacity="0.85" strokeWidth="1.5" />
              </g>
            ))}
            <rect x={RUN_L + 6} y={BASE.bottom} width={right - RUN_L - 12} height={FLOOR - BASE.bottom} fill="currentColor" fillOpacity="0.12" strokeOpacity="0.6" />
          </g>
        </svg>

        {/* Keynote bubbles (HTML, so they keep their size on a phone) */}
        {keynotes.map((k, i) => (
          <Bubble
            key={k.id}
            n={i + 1}
            accent={i === 0}
            className="reno-layer absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${(k.x / W) * 100}%`, top: `${(k.y / H) * 100}%`, ...layer(6 + i * 0.5) }}
          />
        ))}
      </div>

      <DimensionLine label="Flat · square · finished" className="mt-4 px-[2.5%]" />

      <figcaption className="mt-10">
        <p className="t-spec flex items-center gap-3">
          <span className="tabular-nums">FIG. {pad2(fig)}</span>
          <span aria-hidden="true" className="h-px w-6 bg-current/50" />
          <span>Wall elevation · not to scale</span>
        </p>
        <ol className="mt-5 border-t border-[color:var(--hairline)]">
          {keynotes.map((k, i) => (
            <li key={k.id} className="flex items-center gap-4 border-b border-[color:var(--hairline)] py-3">
              <Bubble n={i + 1} accent={i === 0} />
              <span className="t-spec text-[color:var(--ink)]">{k.label}</span>
              <span
                aria-hidden="true"
                className="h-0.5 min-w-6 flex-1 bg-[radial-gradient(circle,var(--spec)_0.8px,transparent_1.2px)] bg-[length:7px_2px] bg-repeat-x"
              />
              <span className="t-spec whitespace-nowrap tabular-nums">{k.on ? `On ${k.on}` : "First"}</span>
            </li>
          ))}
        </ol>
      </figcaption>
    </DrawOnView>
  );
}
