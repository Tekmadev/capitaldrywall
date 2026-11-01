import type { CSSProperties } from "react";
import { LevelVial } from "@/components/ui/LevelVial";
import { cn } from "@/lib/utils";

/*
 * Drafted elevation of a 16' × 8' wall (viewBox units: 1 ft = 57.5). Four 4' × 8' sheets hung
 * vertically, seams on studs at 16" o.c., screws at 12" o.c.:
 *   seam A (x 310) taped and first-coated (LEVEL 2), screws spotted on the boards to its left/right
 *   seam B (x 540) taped; its first coat runs down from the ceiling and stops mid-wall with the knife
 *                  still on it, the rest of the pass dashed ("to do", drafting's future-work line)
 *   seam C (x 770) open (LEVEL 0)
 * A spirit level hangs on the bare boards, 3° out (LevelVial "unfinished").
 */
const VIEW_W = 1000;
const VIEW_H = 680;
const FT = 57.5;
const WALL = { x: 80, top: 110, bottom: 570 } as const;
const BOARD = 4 * FT; // 230
const SEAMS = [WALL.x + BOARD, WALL.x + 2 * BOARD, WALL.x + 3 * BOARD] as const; // 310, 540, 770
const STUD = (16 / 12) * FT; // 76.67
const STUDS = Array.from({ length: 12 }, (_, k) => WALL.x + k * STUD); // 80 … 923
const ROWS = Array.from({ length: 8 }, (_, n) => WALL.top + FT / 2 + n * FT); // 12" o.c.
const COAT_STOP = 342; // where the knife stopped on seam B (about 4' down a 8' wall)

/** Screw heads: one per stud and row; two (one per sheet edge) where a seam lands on the stud. */
const screws = STUDS.flatMap((x, k) =>
  ROWS.map((y) => ({ x, y, k })).flatMap((s) =>
    k === 0 ? [{ ...s, x: s.x + 6 }] : k % 3 === 0 ? [{ ...s, x: s.x - 6 }, { ...s, x: s.x + 6 }] : [s],
  ),
);
/** Spotted with compound (fasteners covered): board 1 and the first stud of board 2 */
const isSpotted = (x: number) => x <= SEAMS[0] + STUD + 1;

const pct = (v: number, of: number) => `${((v / of) * 100).toFixed(2)}%`;
const at = (x: number, y: number, anchor: "above" | "below" | "center"): CSSProperties => ({
  left: pct(x, VIEW_W),
  top: pct(y, VIEW_H),
  transform: anchor === "above" ? "translate(-50%, -100%)" : anchor === "below" ? "translate(-50%, 0)" : "translate(-50%, -50%)",
});

const hair = { vectorEffect: "non-scaling-stroke" as const };

const FEET = `4'-0"`;
const HEIGHT = `8'-0"`;
const seamLabels = ["Level 2", "Level 1 → 2", "Level 0"] as const;

export function NotFoundWall({ className }: { className?: string }) {
  const [a, b, c] = SEAMS;

  return (
    <figure className={cn("relative", className)}>
      <div className="relative w-full" style={{ aspectRatio: `${VIEW_W} / ${VIEW_H}` }}>
        <svg
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          className="absolute inset-0 block size-full text-[color:var(--ink)]"
          aria-hidden="true"
          focusable="false"
        >
          <defs>
            <pattern id="nf-hatch" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <line x1="0" y1="0" x2="0" y2="9" stroke="currentColor" strokeOpacity="0.3" strokeWidth="1" />
            </pattern>
            {/* Joint compound feathered out to both sides of a seam */}
            <linearGradient id="nf-feather" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0" stopColor="var(--color-plaster)" stopOpacity="0" />
              <stop offset="0.3" stopColor="var(--color-plaster)" stopOpacity="0.97" />
              <stop offset="0.7" stopColor="var(--color-plaster)" stopOpacity="0.97" />
              <stop offset="1" stopColor="var(--color-plaster)" stopOpacity="0" />
            </linearGradient>
            <clipPath id="nf-wall">
              <rect x={WALL.x} y={WALL.top} width={VIEW_W - WALL.x} height={WALL.bottom - WALL.top} />
            </clipPath>
          </defs>

          {/* Ceiling, floor and the side wall, cut in section (hatched); they run to the sheet edge */}
          <rect x={WALL.x - 22} y={WALL.top - 20} width={VIEW_W - WALL.x + 22} height="20" fill="url(#nf-hatch)" />
          <rect x={WALL.x - 22} y={WALL.bottom} width={VIEW_W - WALL.x + 22} height="26" fill="url(#nf-hatch)" />
          <rect x={WALL.x - 22} y={WALL.top - 20} width="22" height={WALL.bottom - WALL.top + 46} fill="url(#nf-hatch)" />
          <path
            d={`M${WALL.x - 22} ${WALL.top - 20}V${WALL.bottom + 26}M${WALL.x - 22} ${WALL.top + 0.5}H${VIEW_W}M${WALL.x - 22} ${WALL.bottom + 0.5}H${VIEW_W}M${WALL.x + 0.5} ${WALL.top}V${WALL.bottom}`}
            stroke="currentColor"
            strokeOpacity="0.75"
            fill="none"
            style={hair}
          />

          <g clipPath="url(#nf-wall)">
            {/* Gypsum board face */}
            <rect x={WALL.x} y={WALL.top} width={VIEW_W - WALL.x} height={WALL.bottom - WALL.top} fill="var(--color-plaster-2)" />
            {/* Tapered edges either side of each seam */}
            {SEAMS.map((x) => (
              <rect key={x} x={x - 14} y={WALL.top} width="28" height={WALL.bottom - WALL.top} fill="currentColor" fillOpacity="0.04" />
            ))}
            {/* Studs behind the board: hidden (dashed) lines */}
            <path
              d={STUDS.map((x) => `M${x.toFixed(1)} ${WALL.top}V${WALL.bottom}`).join("")}
              stroke="currentColor"
              strokeOpacity="0.17"
              strokeDasharray="4 6"
              style={hair}
            />
            {/* Screws, spotted where the first coat has been */}
            {screws.map((s) =>
              isSpotted(s.x) ? (
                <ellipse key={`${s.x}-${s.y}`} cx={s.x} cy={s.y} rx="7.5" ry="6" fill="var(--color-plaster)" stroke="currentColor" strokeOpacity="0.1" style={hair} />
              ) : (
                <circle key={`${s.x}-${s.y}`} cx={s.x} cy={s.y} r="2.3" fill="none" stroke="currentColor" strokeOpacity="0.55" style={hair} />
              ),
            )}

            {/* Seam C: open joint */}
            <path d={`M${c + 0.5} ${WALL.top}V${WALL.bottom}`} stroke="currentColor" strokeOpacity="0.6" style={hair} />

            {/* Seam B: paper tape set full height */}
            <rect x={b - 6} y={WALL.top} width="12" height={WALL.bottom - WALL.top} fill="var(--color-plaster)" />
            <path d={`M${b - 5.5} ${WALL.top}V${WALL.bottom}M${b + 6.5} ${WALL.top}V${WALL.bottom}`} stroke="currentColor" strokeOpacity="0.32" style={hair} />

            {/* Seam A: taped and first-coated, full height */}
            <rect x={a - 30} y={WALL.top} width="60" height={WALL.bottom - WALL.top} fill="url(#nf-feather)" />
            <path d={`M${a - 5.5} ${WALL.top}V${WALL.bottom}M${a + 6.5} ${WALL.top}V${WALL.bottom}`} stroke="currentColor" strokeOpacity="0.1" style={hair} />

            {/* Seam B: the first coat, stopped mid-wall with a ridge where the knife came off */}
            <g className="nf-coat">
              <rect x={b - 30} y={WALL.top} width="60" height={COAT_STOP - WALL.top} fill="url(#nf-feather)" />
              <path d={`M${b - 5.5} ${WALL.top}V${COAT_STOP}M${b + 6.5} ${WALL.top}V${COAT_STOP}`} stroke="currentColor" strokeOpacity="0.1" style={hair} />
              <path d={`M${b - 21} ${COAT_STOP - 1}Q${b} ${COAT_STOP + 4} ${b + 21} ${COAT_STOP - 1}`} fill="none" stroke="currentColor" strokeOpacity="0.55" style={hair} />
            </g>
            {/* The rest of the pass, still to do */}
            <path
              className="nf-todo"
              d={`M${b - 26} ${COAT_STOP + 6}V${WALL.bottom}M${b + 26} ${COAT_STOP + 6}V${WALL.bottom}`}
              stroke="currentColor"
              strokeOpacity="0.45"
              strokeDasharray="7 6"
              style={hair}
            />

            {/* 10" taping knife left on the wall, blade on the ridge, handle up */}
            <g className="nf-knife">
              <g transform={`rotate(-9 ${b} ${COAT_STOP})`}>
                <path
                  d={`M${b - 27} ${COAT_STOP}H${b + 27}L${b + 9} ${COAT_STOP - 34}H${b - 9}Z`}
                  fill="var(--color-compound)"
                  fillOpacity="0.55"
                  stroke="currentColor"
                  strokeOpacity="0.8"
                  style={hair}
                />
                <path d={`M${b - 22} ${COAT_STOP - 6}H${b + 22}`} stroke="currentColor" strokeOpacity="0.25" style={hair} />
                <rect x={b - 9} y={COAT_STOP - 46} width="18" height="12" fill="currentColor" fillOpacity="0.55" stroke="currentColor" strokeOpacity="0.8" style={hair} />
                <rect x={b - 7.5} y={COAT_STOP - 118} width="15" height="72" rx="7" fill="var(--color-plaster)" stroke="currentColor" strokeOpacity="0.8" style={hair} />
                <circle cx={b} cy={COAT_STOP - 106} r="2.6" fill="none" stroke="currentColor" strokeOpacity="0.7" style={hair} />
              </g>
            </g>
          </g>

          {/* Dimension string: one 4'-0" sheet per bay */}
          <g stroke="currentColor" strokeOpacity="0.6" fill="none" style={hair}>
            <path d={`M${WALL.x} 62.5H${VIEW_W}`} style={hair} />
            {[WALL.x, ...SEAMS].map((x) => (
              <path key={x} d={`M${x + 0.5} 55V70M${x - 5} 67.5L${x + 6} 57.5`} style={hair} />
            ))}
            {[WALL.x, ...SEAMS].map((x) => (
              <path key={`ext-${x}`} d={`M${x + 0.5} 74V${WALL.top - 26}`} strokeOpacity="0.3" style={hair} />
            ))}
          </g>
          {/* Height: floor to ceiling */}
          <g stroke="currentColor" strokeOpacity="0.6" fill="none" style={hair}>
            <path d={`M30.5 ${WALL.top}V${WALL.bottom}`} style={hair} />
            <path d={`M24 ${WALL.top + 0.5}H${WALL.x - 28}M24 ${WALL.bottom + 0.5}H${WALL.x - 28}`} style={hair} />
            <path d={`M25.5 ${WALL.top + 5}L35.5 ${WALL.top - 5}M25.5 ${WALL.bottom + 5}L35.5 ${WALL.bottom - 5}`} style={hair} />
          </g>
          {/* Leaders to the seam callouts */}
          {SEAMS.map((x) => (
            <g key={`leader-${x}`}>
              <path d={`M${x + 0.5} ${WALL.bottom - 16}V618`} stroke="currentColor" strokeOpacity="0.55" style={hair} />
              <circle cx={x + 0.5} cy={WALL.bottom - 16} r="2.6" fill="currentColor" fillOpacity="0.75" />
            </g>
          ))}
        </svg>

        {/* Annotations as HTML so they stay 11–12 px at any drawing size */}
        {[WALL.x, ...SEAMS].map((x) => (
          <span key={`ft-${x}`} aria-hidden="true" className="t-spec absolute whitespace-nowrap pb-1 tabular-nums" style={at(x + BOARD / 2, 55, "above")}>
            {FEET}
          </span>
        ))}
        <span
          aria-hidden="true"
          className="t-spec absolute whitespace-nowrap tabular-nums [writing-mode:vertical-rl]"
          style={{ ...at(15, (WALL.top + WALL.bottom) / 2, "center"), transform: "translate(-50%, -50%) rotate(180deg)" }}
        >
          {HEIGHT}
        </span>
        {SEAMS.map((x, i) => (
          <span
            key={`lvl-${x}`}
            aria-hidden="true"
            className={cn(
              "t-spec absolute whitespace-nowrap pt-1.5 text-[color:var(--ink)] max-sm:text-[0.625rem]!",
              // Phones: the seams are too close for three callouts on one line, so the middle one
              // drops a line on a longer leader (continued here in HTML so it keeps its pixel length)
              i === 1 &&
                "max-sm:pt-6 max-sm:before:absolute max-sm:before:left-1/2 max-sm:before:top-0 max-sm:before:h-[1.125rem] max-sm:before:w-px max-sm:before:bg-current/55",
            )}
            style={at(x, 618, "below")}
          >
            {seamLabels[i]}
          </span>
        ))}

        {/* A 6' level hung on the bare sheets: 3° out */}
        <div className="absolute" style={{ left: pct(598, VIEW_W), top: pct(398, VIEW_H), width: pct(380, VIEW_W) }}>
          <LevelVial state="unfinished" className="flex w-full" />
        </div>
      </div>

      <figcaption className="t-spec mt-5 flex flex-wrap items-center gap-x-3 gap-y-1 max-sm:mt-11">
        <span className="tabular-nums">FIG. 404</span>
        <span aria-hidden="true" className="h-px w-6 bg-current/50" />
        <span>Wall elevation, taping in progress</span>
      </figcaption>
    </figure>
  );
}
