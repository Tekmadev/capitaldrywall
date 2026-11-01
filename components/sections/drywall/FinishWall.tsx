/**
 * Drawings for the finish-level selector (brief §7.7): an ELEVATION of a wall joint under a raking
 * work light, and SECTION A–A through the same joint (not to scale). Both share one x scale
 * (1200 units = a 48" board width, the joint at 600), so the compound bands in the elevation line
 * up with the coats in the section below. Purely graphic: every label is HTML around them.
 */

const JOINT = 600;
/** Field screws sit on the studs; edge screws hide under the tape from Level 1 */
const FIELD_X = [200, 1000] as const;
const EDGE_X = [588, 612] as const;
const ROWS = [100, 300, 500] as const;

/** Half-width of the compound band per level (coat 1 → 6", coat 2 → 10", coat 3 → 14"). */
const BAND = [0, 0, 75, 125, 175, 175] as const;
/** Screw-spot radius per level */
const SPOT = [0, 0, 16, 25, 34, 34] as const;
/** How strongly the raking light picks out ridges and edges at each level */
const RELIEF = [1, 0.9, 0.85, 0.5, 0, 0] as const;

type DrawingProps = {
  /** 0–5 */
  level: number;
  /** Unique prefix for gradient ids */
  uid: string;
  className?: string;
};

const clampLevel = (level: number) => Math.min(5, Math.max(0, Math.round(level)));

/** Wall face, lit low from the left: the smoother the finish, the less the light finds. */
export function ElevationDrawing({ level: raw, uid, className }: DrawingProps) {
  const level = clampLevel(raw);
  const half = Math.max(BAND[level], BAND[2]);
  const spot = Math.max(SPOT[level], SPOT[2]);
  const relief = RELIEF[level];
  const coated = level >= 2;

  return (
    <svg viewBox="0 0 1200 600" className={className} aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={`${uid}-rake`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" style={{ stopColor: "var(--color-worklight)", stopOpacity: 0.3 }} />
          <stop offset="0.28" style={{ stopColor: "var(--color-worklight)", stopOpacity: 0.05 }} />
          <stop offset="0.6" style={{ stopColor: "var(--color-graphite)", stopOpacity: 0.3 }} />
          <stop offset="1" style={{ stopColor: "var(--color-graphite)", stopOpacity: 0.74 }} />
        </linearGradient>
        {/* Compound feathered out at the band edges and round the screw spots */}
        <linearGradient id={`${uid}-feather`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" style={{ stopColor: "var(--color-plaster)", stopOpacity: 0 }} />
          <stop offset="0.16" style={{ stopColor: "var(--color-plaster)", stopOpacity: 1 }} />
          <stop offset="0.84" style={{ stopColor: "var(--color-plaster)", stopOpacity: 1 }} />
          <stop offset="1" style={{ stopColor: "var(--color-plaster)", stopOpacity: 0 }} />
        </linearGradient>
        <radialGradient id={`${uid}-spot`}>
          <stop offset="0" style={{ stopColor: "var(--color-plaster)", stopOpacity: 1 }} />
          <stop offset="0.62" style={{ stopColor: "var(--color-plaster)", stopOpacity: 0.9 }} />
          <stop offset="1" style={{ stopColor: "var(--color-plaster)", stopOpacity: 0 }} />
        </radialGradient>
        <radialGradient id={`${uid}-glow`} cx="0" cy="0.95" r="0.8">
          <stop offset="0" style={{ stopColor: "var(--color-worklight)", stopOpacity: 0.34 }} />
          <stop offset="0.55" style={{ stopColor: "var(--color-worklight)", stopOpacity: 0.06 }} />
          <stop offset="1" style={{ stopColor: "var(--color-worklight)", stopOpacity: 0 }} />
        </radialGradient>
      </defs>

      {/* Board paper */}
      <rect width="1200" height="600" className="fill-compound" />

      {/* Tapered edges: a shallow recess either side of the joint */}
      <rect
        x={JOINT - 70}
        width="140"
        height="600"
        className="fl-anim fill-graphite"
        style={{ opacity: level <= 1 ? 0.08 : 0 }}
      />

      {/* Level 0: the open seam */}
      <g className="fl-anim" style={{ opacity: level === 0 ? 1 : 0 }}>
        <rect x={JOINT - 2} width="4" height="600" className="fill-graphite" opacity="0.55" />
        <rect x={JOINT - 3.5} width="1.5" height="600" className="fill-plaster" opacity="0.6" />
      </g>

      {/* Screw dimples: dark cup, lit on the side facing away from the light */}
      <g className="fl-anim" style={{ opacity: level <= 1 ? 1 : 0 }}>
        {[...FIELD_X, ...EDGE_X].flatMap((x) =>
          ROWS.map((y) => (
            <g key={`${x}-${y}`}>
              <circle cx={x} cy={y} r="6.5" className="fill-graphite" opacity="0.45" />
              <path
                d={`M${x + 1.5} ${y - 6}A6.5 6.5 0 0 1 ${x + 1.5} ${y + 6}`}
                fill="none"
                className="stroke-plaster"
                strokeWidth="2"
                opacity="0.8"
              />
            </g>
          )),
        )}
      </g>

      {/* Level 1: paper tape set in compound */}
      <g className="fl-anim" style={{ opacity: level === 1 ? 1 : 0 }}>
        <rect x={JOINT - 42} width="84" height="600" className="fill-plaster" opacity="0.3" />
        <rect x={JOINT - 25} width="50" height="600" className="fill-plaster-2" />
        <rect x={JOINT - 0.5} width="1" height="600" className="fill-graphite" opacity="0.14" />
        <rect x={JOINT - 25} width="2" height="600" className="fill-plaster" />
        <rect x={JOINT + 23} width="2.5" height="600" className="fill-graphite" opacity="0.5" />
      </g>

      {/* Coats: the compound band widens with each coat (6", 10", 14") */}
      <rect
        x={JOINT - 175}
        width="350"
        height="600"
        fill={`url(#${uid}-feather)`}
        className="fl-anim"
        style={{ opacity: coated ? 1 : 0, transform: `scaleX(${half / 175})` }}
      />
      {/* Coat 1's edges still read through coat 2 */}
      <g className="fl-anim" style={{ opacity: level === 3 ? 0.4 : 0 }}>
        <rect x={JOINT - 76} width="1.5" height="600" className="fill-graphite" opacity="0.35" />
        <rect x={JOINT + 74} width="1.5" height="600" className="fill-graphite" opacity="0.35" />
      </g>
      {/* Band edges: lit lip on the left, shadow on the right */}
      <g className="fl-anim" style={{ opacity: coated ? relief : 0 }}>
        <rect
          x={JOINT - 1.5}
          width="3"
          height="600"
          className="fl-anim fill-plaster"
          style={{ transform: `translateX(${-half}px)` }}
        />
        <rect
          x={JOINT - 1.5}
          width="3"
          height="600"
          className="fl-anim fill-graphite"
          opacity="0.55"
          style={{ transform: `translateX(${half}px)` }}
        />
      </g>

      {/* Screw spots (field screws; the edge screws are under the band) */}
      {FIELD_X.flatMap((x) =>
        ROWS.map((y) => (
          <g
            key={`spot-${x}-${y}`}
            className="fl-anim"
            style={{ opacity: coated ? 1 : 0, transform: `scale(${spot / 34})` }}
          >
            <circle cx={x} cy={y} r="34" fill={`url(#${uid}-spot)`} opacity={level >= 4 ? 0.7 : 1} />
            <g opacity={relief}>
              <path
                d={`M${x - 4} ${y - 33.8}A34 34 0 0 0 ${x - 4} ${y + 33.8}`}
                fill="none"
                className="stroke-plaster"
                strokeWidth="2.5"
                vectorEffect="non-scaling-stroke"
              />
              <path
                d={`M${x + 4} ${y - 33.8}A34 34 0 0 1 ${x + 4} ${y + 33.8}`}
                fill="none"
                className="stroke-graphite"
                strokeWidth="2.5"
                opacity="0.5"
                vectorEffect="non-scaling-stroke"
              />
            </g>
          </g>
        )),
      )}

      {/* Level 5: skim coat over the whole surface */}
      <rect
        width="1200"
        height="600"
        className="fl-anim fill-plaster"
        style={{ opacity: level === 5 ? 1 : 0 }}
      />

      {/* The raking light, low from the left */}
      <rect width="1200" height="600" fill={`url(#${uid}-rake)`} />
      <rect width="1200" height="600" fill={`url(#${uid}-glow)`} />

      {/* Section cut A–A: chain line with view arrows */}
      <line
        x1="0"
        x2="1200"
        y1="440"
        y2="440"
        className="stroke-steel"
        strokeWidth="2"
        strokeDasharray="34 9 6 9"
      />
      <path d="M44 446 l10 16 l10 -16z M1136 446 l10 16 l10 -16z" className="fill-steel" />
    </svg>
  );
}

/**
 * Section geometry (y down): board face at 90, back at 140, tapered long edges dipping to 106 at the
 * joint. Thicknesses are exaggerated so each coat reads.
 */
const FACE = 90;
const BACK = 140;
const BOARD_LEFT = `M0 ${FACE}H530C560 ${FACE} 580 104 598 106V${BACK}H0Z`;
const BOARD_RIGHT = `M1200 ${FACE}H670C640 ${FACE} 620 104 602 106V${BACK}H1200Z`;
const TAPE =
  "M572 98.6C584 100.4 592 102.6 598 103.2H602C608 102.6 616 100.4 628 98.6V101.6C616 103.4 608 105.6 602 106.2H598C592 105.6 584 103.4 572 101.6Z";
/** Coat 1 fills the taper and crowns 10 above the face */
const COAT_1 = `M518 ${FACE}H530C560 ${FACE} 580 104 598 106H602C620 104 640 ${FACE} 670 ${FACE}H682Q600 70 518 ${FACE}Z`;
/** Studs behind the board (hidden lines): one under the joint, one under each field screw */
const STUDS = [200, 600, 1000] as const;

/** A crowned lens of compound sitting on the face: centre x, half width, apex y. */
function lens(cx: number, half: number, apex: number, smooth = false): string {
  if (smooth) {
    const k = half * 0.45;
    return `M${cx - half} ${FACE}C${cx - k} ${FACE} ${cx - k} ${apex} ${cx} ${apex}C${cx + k} ${apex} ${cx + k} ${FACE} ${cx + half} ${FACE}Z`;
  }
  return `M${cx - half} ${FACE}Q${cx} ${2 * apex - FACE} ${cx + half} ${FACE}Z`;
}

const COAT = "fill-plaster stroke-graphite";

function Spots({ half, apex, smooth }: { half: number; apex: number; smooth?: boolean }) {
  return FIELD_X.map((x) => (
    <path key={x} d={lens(x, half, apex, smooth)} className={COAT} strokeWidth="1" strokeOpacity="0.4" />
  ));
}

function Tape() {
  return <path d={TAPE} className="fill-plaster-2 stroke-graphite" strokeWidth="1" strokeOpacity="0.5" />;
}

/** Section through the joint, thicknesses exaggerated (NTS). One group per level, cross-faded. */
export function SectionDrawing({ level: raw, uid, className }: DrawingProps) {
  const level = clampLevel(raw);
  const show = (n: number) => ({ opacity: level === n ? 1 : 0 });

  return (
    <svg viewBox="0 0 1200 160" className={className} aria-hidden="true" focusable="false">
      <defs>
        <pattern
          id={`${uid}-gyp`}
          width="9"
          height="9"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(45)"
        >
          <line x1="0" y1="0" x2="0" y2="9" className="stroke-steel" strokeWidth="1" opacity="0.55" />
        </pattern>
        <marker
          id={`${uid}-arrow`}
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="7"
          markerHeight="7"
          orient="auto-start-reverse"
        >
          <path d="M0 0L10 5L0 10Z" className="fill-worklight" />
        </marker>
      </defs>

      {/* Raking light, grazing the face from the left */}
      <line
        x1="8"
        y1="38"
        x2="330"
        y2="84"
        className="stroke-worklight"
        strokeWidth="1.5"
        strokeDasharray="10 6"
        markerEnd={`url(#${uid}-arrow)`}
        opacity="0.85"
      />

      {/* Studs beyond the board, as hidden (dashed) lines */}
      {STUDS.map((x) => (
        <path
          key={x}
          d={`M${x - 19} 160V${BACK}H${x + 19}V160`}
          fill="none"
          className="stroke-steel"
          strokeWidth="1.5"
          strokeDasharray="6 5"
        />
      ))}

      {/* Gypsum board: paper faces, hatched core, tapered long edges */}
      {[BOARD_LEFT, BOARD_RIGHT].map((d) => (
        <g key={d}>
          <path d={d} className="fill-compound" />
          <path d={d} fill={`url(#${uid}-gyp)`} />
          <path d={d} fill="none" className="stroke-plaster" strokeWidth="1.5" opacity="0.7" />
        </g>
      ))}

      {/* Screws through the board into the studs */}
      {FIELD_X.map((x) => (
        <g key={x} className="fill-steel">
          <rect x={x - 2} y={FACE + 4} width="4" height="62" />
          <rect x={x - 9} y={FACE + 2} width="18" height="3" />
        </g>
      ))}

      {/* Level 0–1: screw heads dimple the face */}
      <g className="fl-anim" style={{ opacity: level <= 1 ? 1 : 0 }}>
        {FIELD_X.map((x) => (
          <path key={x} d={`M${x - 12} ${FACE}Q${x} ${FACE + 9} ${x + 12} ${FACE}Z`} className="fill-graphite" />
        ))}
      </g>

      {/* Level 1: tape set in compound */}
      <g className="fl-anim" style={show(1)}>
        <Tape />
      </g>

      {/* Level 2: tape plus one coat over joints and screws */}
      <g className="fl-anim" style={show(2)}>
        <path d={COAT_1} className={COAT} strokeWidth="1" strokeOpacity="0.45" />
        <Tape />
        <Spots half={16} apex={FACE - 6} />
      </g>

      {/* Level 3: two coats, ridges still standing */}
      <g className="fl-anim" style={show(3)}>
        <path d={COAT_1} className={COAT} strokeWidth="1" strokeOpacity="0.45" />
        <Tape />
        <path d={lens(JOINT, 125, FACE - 18)} className={COAT} strokeWidth="1" strokeOpacity="0.5" />
        <Spots half={25} apex={FACE - 10} />
      </g>

      {/* Level 4: three coats, feathered wide and sanded smooth */}
      <g className="fl-anim" style={show(4)}>
        <path d={COAT_1} className={COAT} strokeWidth="1" strokeOpacity="0.45" />
        <Tape />
        <path d={lens(JOINT, 125, FACE - 6, true)} className={COAT} strokeWidth="1" strokeOpacity="0.35" />
        <path d={lens(JOINT, 175, FACE - 8, true)} className={COAT} strokeWidth="1" strokeOpacity="0.5" />
        <Spots half={34} apex={FACE - 4} smooth />
      </g>

      {/* Level 5: Level 4 plus a skim coat over the whole surface */}
      <g className="fl-anim" style={show(5)}>
        <path d={COAT_1} className={COAT} strokeWidth="1" strokeOpacity="0.45" />
        <Tape />
        <path d={lens(JOINT, 175, FACE - 8, true)} className={COAT} strokeWidth="1" strokeOpacity="0.5" />
        <Spots half={34} apex={FACE - 4} smooth />
        <rect x="0" y={FACE - 14} width="1200" height="14" className="fill-plaster-2" />
        <line x1="0" x2="1200" y1={FACE - 14} y2={FACE - 14} className="stroke-plaster" strokeWidth="2" />
        <line x1="0" x2="1200" y1={FACE} y2={FACE} className="stroke-graphite" strokeWidth="1" opacity="0.25" />
      </g>
    </svg>
  );
}
