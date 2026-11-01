import type { SVGProps } from "react";
import { cn } from "@/lib/utils";
import {
  layerAssembly,
  layerOpacity,
  WL_COUNT,
  WL_EXPLODE,
  type WallLayer,
  type WallVariant,
} from "./WallLayersGeometry";

/*
 * SECTION A–A through a finished Ottawa basement wall, drawn like a construction detail.
 * Exterior (soil) on the left, the room on the right. Not to scale: thin layers are exaggerated.
 *
 * Assembled geometry (viewBox units):
 *   soil 40–150 below grade (y 210) · foundation 150–250 · insulation 250–300 · vapour barrier 304 ·
 *   framing 308–358 (plate 584–600) · drywall 360–372 (to 572) · subfloor 360→ on the slab (576–600) ·
 *   slab 600–640 · footing 110–300 × 640–700 · gravel under the slab · break line at x 962.
 * Each layer is a <g data-wl-layer> that slides in from the right by its explode distance.
 */

const VIEWBOX: Record<WallVariant, string> = {
  desktop: "0 0 1000 770",
  mobile: "60 96 700 620",
};

/** Text label anchors (x of the leader, label row y, leader end y), desktop only. */
const LABELS = [
  { x: 200, row: 26, to: 172 },
  { x: 275, row: 52, to: 172 },
  { x: 304, row: 78, to: 172 },
  { x: 333, row: 104, to: 172 },
  { x: 366, row: 130, to: 172 },
  { x: 470, row: 546, to: 582 },
] as const;

/** Numbered bubbles for the narrow mobile drawing. */
const BUBBLES = [
  { x: 200, y: 300 },
  { x: 275, y: 365 },
  { x: 304, y: 430 },
  { x: 333, y: 495 },
  { x: 366, y: 545 },
  { x: 452, y: 538, to: 584 },
] as const;

/** Active-layer highlight boxes (a warm marker wash over the layer). */
const HIGHLIGHT = [
  { x: 150, y: 140, w: 100, h: 500 },
  { x: 250, y: 140, w: 50, h: 460 },
  { x: 297, y: 140, w: 14, h: 460 },
  { x: 308, y: 140, w: 50, h: 460 },
  { x: 356, y: 140, w: 20, h: 434 },
  { x: 360, y: 572, w: 640, h: 30 },
] as const;

const line = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1,
  vectorEffect: "non-scaling-stroke",
} as const satisfies SVGProps<SVGPathElement>;

/** Batt insulation symbol: a wave that touches both faces of the cavity. */
function battPath(x0: number, x1: number, y0: number, y1: number, h: number) {
  let d = `M${x0} ${y0}`;
  let leftToRight = true;
  for (let y = y0; y + h <= y1 + 0.01; y += h) {
    const xs = leftToRight ? x0 : x1;
    const xe = leftToRight ? x1 : x0;
    const w = xe - xs;
    d += ` C${xs + w * 0.62} ${y} ${xe - w * 0.62} ${y + h} ${xe} ${y + h}`;
    leftToRight = !leftToRight;
  }
  return d;
}

/** Dimpled membrane under the subfloor panel: a row of small domes on the slab. */
function dimplePath(x0: number, x1: number, base: number, height: number, step: number) {
  let d = "";
  for (let x = x0; x + step <= x1; x += step) {
    d += `M${x} ${base} C${x + step * 0.1} ${base - height} ${x + step * 0.9} ${base - height} ${x + step} ${base} `;
  }
  return d.trim();
}

type DrawingProps = {
  /** Unique per instance on the page (pattern and clip ids) */
  uid: string;
  variant: WallVariant;
  layers: readonly WallLayer[];
  /** Assembly position 0–6 (6 = assembled, the server/static state) */
  q?: number;
  /** Highlighted layer index, -1 for none */
  active?: number;
  /** Accessible name for the drawing */
  label: string;
  className?: string;
};

export function WallSectionDrawing({
  uid,
  variant,
  layers,
  q = WL_COUNT,
  active = -1,
  label,
  className,
}: DrawingProps) {
  const id = (name: string) => `${uid}-${variant}-${name}`;
  const url = (name: string) => `url(#${id(name)})`;
  const desktop = variant === "desktop";
  const explode = WL_EXPLODE[variant];
  const ctxSize = desktop ? 14 : 18;

  const layerProps = (i: number) => {
    const a = layerAssembly(i, q);
    return {
      "data-wl-layer": i,
      "data-wl-dx": explode[i],
      "data-active": active >= 0 ? String(i === active) : undefined,
      transform: `translate(${(explode[i] * (1 - a)).toFixed(2)} 0)`,
      style: a < 1 ? { opacity: layerOpacity(a) } : undefined,
      className: "group/wl",
    };
  };

  const marker = (i: number) => {
    const text = layers[i] ? `${layers[i].index} ${layers[i].title}`.toUpperCase() : "";
    const hl = HIGHLIGHT[i];
    return (
      <>
        <rect
          x={hl.x}
          y={hl.y}
          width={hl.w}
          height={hl.h}
          className="fill-worklight opacity-0 mix-blend-multiply transition-opacity duration-300 group-data-[active=true]/wl:opacity-30"
        />
        {desktop ? (
          <g>
            <path
              {...line}
              d={`M${LABELS[i].x} ${LABELS[i].row}V${LABELS[i].to}M${LABELS[i].x} ${LABELS[i].row}h7`}
              className="text-[color:var(--spec)] transition-colors group-data-[active=true]/wl:text-[color:var(--ink)]"
            />
            <circle
              cx={LABELS[i].x}
              cy={LABELS[i].to}
              r="3.5"
              className="fill-[color:var(--ink)] transition-colors group-data-[active=true]/wl:fill-worklight"
            />
            <text
              x={LABELS[i].x + 13}
              y={LABELS[i].row + 6}
              className="fill-[color:var(--spec)] font-mono transition-colors group-data-[active=true]/wl:fill-[color:var(--ink)]"
              style={{ fontSize: 17, fontWeight: 500, letterSpacing: "0.1em" }}
            >
              {text}
            </text>
          </g>
        ) : (
          <g>
            {"to" in BUBBLES[i] && (
              <path {...line} d={`M${BUBBLES[i].x} ${BUBBLES[i].y + 24}V${(BUBBLES[i] as { to: number }).to}`} />
            )}
            <circle
              cx={BUBBLES[i].x}
              cy={BUBBLES[i].y}
              r="24"
              strokeWidth="1.5"
              vectorEffect="non-scaling-stroke"
              className="fill-[color:var(--surface)] stroke-[color:var(--ink)] transition-colors group-data-[active=true]/wl:fill-worklight"
            />
            <text
              x={BUBBLES[i].x}
              y={BUBBLES[i].y + 7.5}
              textAnchor="middle"
              className="fill-[color:var(--ink)] font-mono"
              style={{ fontSize: 21, fontWeight: 500 }}
            >
              {layers[i]?.index}
            </text>
          </g>
        )}
      </>
    );
  };

  return (
    <svg
      viewBox={VIEWBOX[variant]}
      role="img"
      aria-label={label}
      className={cn("block h-auto w-full overflow-hidden text-[color:var(--ink)]", className)}
    >
      <defs>
        <pattern id={id("concrete")} width="44" height="44" patternUnits="userSpaceOnUse">
          <g fill="currentColor" fillOpacity="0.5">
            <circle cx="6" cy="9" r="1.3" />
            <circle cx="23" cy="31" r="1.1" />
            <circle cx="37" cy="13" r="1.4" />
            <circle cx="14" cy="40" r="0.9" />
            <circle cx="31" cy="4" r="1" />
            <circle cx="40" cy="37" r="1.2" />
            <circle cx="18" cy="19" r="0.8" />
          </g>
          <g fill="none" stroke="currentColor" strokeOpacity="0.45">
            <path d="M26 16l5 8h-9z" />
            <path d="M5 24l4 6H1z" />
            <path d="M36 26l3 5h-6z" />
          </g>
        </pattern>
        <pattern
          id={id("earth")}
          width="16"
          height="16"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(45)"
        >
          <line x1="0" y1="0" x2="0" y2="16" stroke="currentColor" strokeOpacity="0.3" strokeWidth="1.2" />
          <circle cx="8" cy="5" r="0.9" fill="currentColor" fillOpacity="0.35" />
        </pattern>
        <pattern id={id("gravel")} width="46" height="40" patternUnits="userSpaceOnUse">
          <g fill="none" stroke="currentColor" strokeOpacity="0.32">
            <circle cx="9" cy="10" r="5" />
            <circle cx="28" cy="7" r="3.5" />
            <circle cx="38" cy="24" r="5.5" />
            <circle cx="17" cy="29" r="4" />
            <circle cx="5" cy="35" r="2.5" />
          </g>
        </pattern>
        <pattern id={id("gypsum")} width="5" height="5" patternUnits="userSpaceOnUse">
          <circle cx="1.5" cy="1.5" r="0.7" fill="currentColor" fillOpacity="0.45" />
        </pattern>
        <pattern id={id("osb")} width="22" height="13" patternUnits="userSpaceOnUse">
          <g stroke="currentColor" strokeOpacity="0.42">
            <line x1="2" y1="4" x2="9" y2="3" />
            <line x1="12" y1="10" x2="19" y2="11" />
            <line x1="14" y1="3" x2="18" y2="5" />
          </g>
        </pattern>
        <clipPath id={id("clip")}>
          <rect x="0" y="0" width="962" height="770" />
        </clipPath>
      </defs>

      {/* ── Context: soil, grade, footing, gravel, slab (never moves) ── */}
      <rect x="40" y="210" width="110" height="490" fill={url("earth")} />
      <path {...line} d="M16 210H150" strokeWidth="1.5" />
      <rect x="300" y="640" width="662" height="60" fill={url("gravel")} />
      <rect x="110" y="640" width="190" height="60" fill="var(--surface-raised)" />
      <rect x="110" y="640" width="190" height="60" fill={url("concrete")} />
      <path {...line} d="M110 640H150M250 640H300M110 640V700H300V640" />
      <rect x="250" y="600" width="712" height="40" fill="var(--surface-raised)" />
      <rect x="250" y="600" width="712" height="40" fill={url("concrete")} />
      <path {...line} d="M250 600H962M300 640H962" />
      {/* break line where the drawing stops inside the room */}
      <path {...line} d="M962 560V618l-8 8 16 16-8 8V712" />

      <text
        x={desktop ? 18 : 66}
        y={desktop ? 172 : 120}
        className="fill-[color:var(--spec)] font-mono"
        style={{ fontSize: ctxSize, fontWeight: 500, letterSpacing: "0.12em" }}
      >
        EXTERIOR
      </text>
      <text
        x={desktop ? 18 : 66}
        y={desktop ? 200 : 202}
        className="fill-[color:var(--spec)] font-mono"
        style={{ fontSize: ctxSize, fontWeight: 500, letterSpacing: "0.12em" }}
      >
        {desktop ? "GRADE ▽" : "GRADE"}
      </text>
      <text
        x={desktop ? 846 : 690}
        y={desktop ? 250 : 120}
        textAnchor="middle"
        className="fill-[color:var(--spec)] font-mono"
        style={{ fontSize: ctxSize, fontWeight: 500, letterSpacing: "0.12em" }}
      >
        INTERIOR
      </text>

      {desktop && (
        <g className="text-[color:var(--spec)]">
          {/* Below grade: from finished grade down to the slab */}
          <path {...line} d="M24 214V596M18 220l12-12M18 602l12-12" />
          <path {...line} d="M16 600H146" strokeDasharray="4 4" />
          <text
            x="12"
            y="405"
            textAnchor="middle"
            transform="rotate(-90 12 405)"
            className="fill-current font-mono"
            style={{ fontSize: 14, fontWeight: 500, letterSpacing: "0.12em" }}
          >
            BELOW GRADE
          </text>
        </g>
      )}

      <g clipPath={url("clip")}>
        {/* 01 Foundation wall (with a break line where the drawing is cut above) */}
        <g {...layerProps(0)}>
          <path
            d="M150 640V140H188l6-12 12 24 6-12H250V640Z"
            fill="var(--surface-raised)"
          />
          <path d="M150 640V140H188l6-12 12 24 6-12H250V640Z" fill={url("concrete")} />
          <path {...line} d="M150 640V140H188l6-12 12 24 6-12H250V640" strokeWidth="1.5" />
          {marker(0)}
        </g>

        {/* 02 Insulation */}
        <g {...layerProps(1)}>
          <rect x="250" y="140" width="50" height="460" fill="var(--surface)" />
          <path {...line} d={battPath(253, 297, 140, 600, 23)} strokeOpacity="0.75" />
          <rect {...line} x="250" y="140" width="50" height="460" />
          {marker(1)}
        </g>

        {/* 03 Vapour barrier */}
        <g {...layerProps(2)}>
          <path d="M304 140V600" fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray="16 5" />
          {marker(2)}
        </g>

        {/* 04 Framing: stud in elevation, bottom plate cut in section */}
        <g {...layerProps(3)}>
          <rect x="308" y="140" width="50" height="444" fill="var(--surface-raised)" />
          <path {...line} d="M320 140V584M333 140V584M346 140V584" strokeOpacity="0.28" />
          <rect {...line} x="308" y="140" width="50" height="444" />
          <rect x="308" y="584" width="50" height="16" fill="var(--surface)" />
          <path {...line} d="M308 584H358V600H308ZM308 584L358 600M358 584L308 600" />
          {marker(3)}
        </g>

        {/* 05 Drywall, held just above the floor */}
        <g {...layerProps(4)}>
          <rect x="360" y="140" width="12" height="432" fill="var(--surface)" />
          <rect x="360" y="140" width="12" height="432" fill={url("gypsum")} />
          <rect {...line} x="360" y="140" width="12" height="432" strokeWidth="1.25" />
          {marker(4)}
        </g>

        {/* 06 Subfloor: panel over a dimpled membrane on the slab */}
        <g {...layerProps(5)}>
          <rect x="360" y="576" width="640" height="13" fill="var(--surface-raised)" />
          <rect x="360" y="576" width="640" height="13" fill={url("osb")} />
          <path {...line} d="M358 576H1000M358 589H1000M358 576V589" />
          <path {...line} d={dimplePath(360, 1000, 600, 9, 12)} />
          {marker(5)}
        </g>
      </g>

      {desktop && (
        <g data-wl-dim className="text-[color:var(--spec)]" style={q < WL_COUNT ? { opacity: layerAssembly(4, q) } : undefined}>
          {/* Wall assembly: outside face of the foundation to the inside face of the drywall */}
          <path {...line} d="M150 706V744M372 706V744M150 736H372M144 742l12-12M366 742l12-12" />
          <text
            x="261"
            y="727"
            textAnchor="middle"
            className="fill-current font-mono"
            style={{ fontSize: 14, fontWeight: 500, letterSpacing: "0.12em" }}
          >
            WALL ASSEMBLY
          </text>
        </g>
      )}
    </svg>
  );
}

/** Circled section letter with the view-direction arrow, as on a drawing set. */
function CutMarker({ letter }: { letter: string }) {
  return (
    <svg viewBox="0 0 36 44" className="h-11 w-9 shrink-0" aria-hidden="true" focusable="false">
      <circle cx="18" cy="16" r="13" fill="var(--surface)" stroke="currentColor" strokeWidth="1.25" />
      <text
        x="18"
        y="21"
        textAnchor="middle"
        className="fill-current font-mono"
        style={{ fontSize: 13, fontWeight: 500 }}
      >
        {letter}
      </text>
      <path d="M10 33H26L18 43Z" className="fill-current" />
    </svg>
  );
}

/**
 * Section-cut marker (ART_DIRECTION #10): a dash-dot cut line across the page with circled letters at
 * both ends and the section name. Decorative; the drawing's caption names the section for assistive tech.
 */
export function SectionCut({ label, letter = "A", className }: { label: string; letter?: string; className?: string }) {
  const cutLine =
    "h-px min-w-4 flex-1 bg-[repeating-linear-gradient(90deg,currentColor_0_22px,transparent_22px_28px,currentColor_28px_32px,transparent_32px_38px)]";
  return (
    <div aria-hidden="true" className={cn("flex items-center gap-2 text-[color:var(--ink)]", className)}>
      <CutMarker letter={letter} />
      <span className={cutLine} />
      <span className="t-spec whitespace-nowrap px-1 text-[color:var(--ink)]">{label}</span>
      <span className={cutLine} />
      <CutMarker letter={letter} />
    </div>
  );
}
