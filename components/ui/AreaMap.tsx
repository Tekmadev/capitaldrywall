import { areas, mapBounds, rivers, type Area } from "@/content/areas";
import { ctas } from "@/content/copy/global";
import { pages } from "@/content/services";
import { site } from "@/content/site.config";
import { cn, pad2, slugify } from "@/lib/utils";
import { ArrowIcon } from "./icons";

/* ── Projection: equirectangular, longitudes scaled by cos(mid-latitude) ── */
const W = 900;
const LAT0 = (mapBounds.south + mapBounds.north) / 2;
const KX = Math.cos((LAT0 * Math.PI) / 180);
const K = W / ((mapBounds.east - mapBounds.west) * KX);
const H = Math.round((mapBounds.north - mapBounds.south) * K);
/** 1° of latitude ≈ 111.32 km */
const KM_PER_UNIT = 111.32 / K;
/** Width of 10 km as a fraction of the map width (drives the scale bar) */
const TEN_KM_FRACTION = 10 / KM_PER_UNIT / W;

type Pt = [number, number];
const project = (lng: number, lat: number): Pt => [(lng - mapBounds.west) * KX * K, (mapBounds.north - lat) * K];
const f = (n: number) => n.toFixed(1);

/** Catmull-Rom spline through the points, as cubic Béziers (soft river centrelines). */
function smoothPath(points: readonly Pt[]): string {
  if (points.length < 2) return "";
  let d = `M${f(points[0][0])} ${f(points[0][1])}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;
    const c1: Pt = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2: Pt = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${f(c1[0])} ${f(c1[1])} ${f(c2[0])} ${f(c2[1])} ${f(p2[0])} ${f(p2[1])}`;
  }
  return d;
}

const ottawaPath = smoothPath(rivers.ottawa.map(([lng, lat]) => project(lng, lat)));
const rideauPath = smoothPath(rivers.rideau.map(([lng, lat]) => project(lng, lat)));
/** North shore (Québec): everything above the Ottawa River centreline, hatched as out of area */
const northShore = `${ottawaPath} L${W} 0 L0 0 Z`;

/**
 * Hand-tuned label placement (viewBox units) so labels clear each other, the crosses and the rivers.
 * desktop: every area at 14 units. mobile: a few anchor areas at 28 units (legible at 320 px).
 */
type Label = { dx: number; dy: number; anchor: "start" | "middle" | "end" };
const desktopLabels: Record<string, Label> = {
  "Ottawa (Centretown & Downtown)": { dx: -12, dy: 13, anchor: "end" },
  "The Glebe": { dx: 12, dy: 5, anchor: "start" },
  Westboro: { dx: -12, dy: 5, anchor: "end" },
  Vanier: { dx: 12, dy: 5, anchor: "start" },
  "Alta Vista": { dx: 12, dy: 15, anchor: "start" },
  Kanata: { dx: 12, dy: 5, anchor: "start" },
  Stittsville: { dx: 12, dy: 5, anchor: "start" },
  Nepean: { dx: -12, dy: 5, anchor: "end" },
  Barrhaven: { dx: -12, dy: 5, anchor: "end" },
  "Riverside South": { dx: 12, dy: 5, anchor: "start" },
  "Findlay Creek": { dx: 12, dy: 5, anchor: "start" },
  Manotick: { dx: 12, dy: 5, anchor: "start" },
  Greely: { dx: 12, dy: 5, anchor: "start" },
  Gloucester: { dx: 12, dy: 5, anchor: "start" },
  "Orléans": { dx: 12, dy: 5, anchor: "start" },
  Cumberland: { dx: 0, dy: 25, anchor: "middle" },
};
const mobileLabels: Record<string, Label> = {
  "Ottawa (Centretown & Downtown)": { dx: -15, dy: 28, anchor: "end" },
  Kanata: { dx: 15, dy: 10, anchor: "start" },
  Barrhaven: { dx: -15, dy: 10, anchor: "end" },
  Manotick: { dx: 15, dy: 10, anchor: "start" },
  Gloucester: { dx: 15, dy: 10, anchor: "start" },
  "Orléans": { dx: 15, dy: 10, anchor: "start" },
};

/** Stable key shared by a map point and its list item */
export const areaKey = (area: Pick<Area, "name">) => slugify(area.name);
/** Quote link pre-filled with the area */
export const areaQuoteHref = (area: Pick<Area, "name">) => `${pages.quote}?area=${encodeURIComponent(area.name)}`;

const fmtCoord = (value: number, pos: string, neg: string) => `${Math.abs(value).toFixed(4)}° ${value >= 0 ? pos : neg}`;
export const datumLabel = `${fmtCoord(site.geo.latitude, "N", "S")} · ${fmtCoord(site.geo.longitude, "E", "W")}`;

function coverageSummary(list: readonly Area[]): string {
  if (list.length === 0) return "Map of Ottawa";
  const west = list.reduce((a, b) => (b.lng < a.lng ? b : a));
  const east = list.reduce((a, b) => (b.lng > a.lng ? b : a));
  const south = list.reduce((a, b) => (b.lat < a.lat ? b : a));
  return `Map of the ${list.length} service areas across Ottawa, from ${west.name} in the west to ${east.name} in the east and ${south.name} in the south.`;
}

/* Graticule ticks every 0.05° along the frame */
const latTicks: number[] = [];
for (let lat = Math.ceil(mapBounds.south * 20) / 20; lat < mapBounds.north; lat += 0.05) latTicks.push(lat);
const lngTicks: number[] = [];
for (let lng = Math.ceil(mapBounds.west * 20) / 20; lng < mapBounds.east; lng += 0.05) lngTicks.push(lng);

type AreaMapProps = {
  /** Sheet code shown in the title strip, e.g. "A-09" */
  sheet?: string;
  /** Prefix for the SVG's internal ids (pass a different one if two maps share a page) */
  uid?: string;
  className?: string;
};

/**
 * Abstract SVG plan of Ottawa (brief §9 item 13, ART_DIRECTION row 13) drawn from content/areas.ts:
 * the Ottawa and Rideau rivers as hairlines (soft wash on the Ottawa), the north shore hatched,
 * communities as crosses with mono labels, graticule ticks, and a title strip with a north arrow, a
 * projection-true scale bar and the datum coordinates. Decorative to assistive tech beyond its
 * summary label: the area list is the accessible content. Points carry data-area for AreaLinker.
 */
export function AreaMap({ sheet, uid = "area-map", className }: AreaMapProps) {
  const hatchId = `${uid}-hatch`;
  const ottawaId = `${uid}-ottawa-river`;
  const rideauId = `${uid}-rideau-river`;
  return (
    <figure className={cn("@container relative", className)}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={coverageSummary(areas)}
        className="block h-auto w-full overflow-visible border border-[color:var(--hairline)] bg-[color:var(--surface)] text-[color:var(--ink)]"
      >
        <defs>
          <pattern id={hatchId} width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="9" stroke="currentColor" strokeOpacity="0.13" strokeWidth="1" />
          </pattern>
        </defs>

        {/* North shore, out of area */}
        <path d={northShore} fill={`url(#${hatchId})`} />

        {/* Ottawa River: soft wash + hairline centreline */}
        <path
          d={ottawaPath}
          fill="none"
          stroke="currentColor"
          strokeOpacity="0.07"
          strokeWidth="18"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          id={ottawaId}
          d={ottawaPath}
          fill="none"
          stroke="currentColor"
          strokeOpacity="0.45"
          strokeWidth="1"
          vectorEffect="non-scaling-stroke"
        />
        {/* Rideau River */}
        <path
          d={rideauPath}
          fill="none"
          stroke="currentColor"
          strokeOpacity="0.06"
          strokeWidth="7"
          strokeLinecap="round"
        />
        <path
          id={rideauId}
          d={rideauPath}
          fill="none"
          stroke="currentColor"
          strokeOpacity="0.4"
          strokeWidth="1"
          strokeDasharray="5 3"
          vectorEffect="non-scaling-stroke"
        />

        {/* River and province names (desktop only: too small to read on phones) */}
        <g className="hidden fill-[color:var(--spec)] font-mono md:inline" style={{ fontSize: 11, letterSpacing: "0.24em" }}>
          <text dy="-13">
            <textPath href={`#${ottawaId}`} startOffset="4%">
              OTTAWA RIVER
            </textPath>
          </text>
          <text dy="-8">
            <textPath href={`#${rideauId}`} startOffset="12%">
              RIDEAU RIVER
            </textPath>
          </text>
        </g>
        <g className="fill-[color:var(--spec)] font-mono" style={{ letterSpacing: "0.3em" }}>
          <text x="28" y="54" className="hidden md:inline" style={{ fontSize: 13 }}>
            QUÉBEC
          </text>
          <text x="28" y={H - 26} className="hidden md:inline" style={{ fontSize: 13 }}>
            ONTARIO
          </text>
          <text x="28" y="72" className="md:hidden" style={{ fontSize: 26 }}>
            QUÉBEC
          </text>
          <text x="28" y={H - 30} className="md:hidden" style={{ fontSize: 26 }}>
            ONTARIO
          </text>
        </g>

        {/* Graticule ticks every 0.05° */}
        <g stroke="currentColor" strokeOpacity="0.4" strokeWidth="1" vectorEffect="non-scaling-stroke">
          {latTicks.map((lat) => {
            const y = f((mapBounds.north - lat) * K);
            return (
              <g key={`lat-${lat.toFixed(2)}`}>
                <line x1="0" y1={y} x2="9" y2={y} vectorEffect="non-scaling-stroke" />
                <line x1={W - 9} y1={y} x2={W} y2={y} vectorEffect="non-scaling-stroke" />
              </g>
            );
          })}
          {lngTicks.map((lng) => {
            const x = f((lng - mapBounds.west) * KX * K);
            return (
              <g key={`lng-${lng.toFixed(2)}`}>
                <line x1={x} y1="0" x2={x} y2="9" vectorEffect="non-scaling-stroke" />
                <line x1={x} y1={H - 9} x2={x} y2={H} vectorEffect="non-scaling-stroke" />
              </g>
            );
          })}
        </g>

        {/* Communities */}
        {areas.map((area) => {
          const [x, y] = project(area.lng, area.lat);
          const desk = desktopLabels[area.name] ?? { dx: 12, dy: 5, anchor: "start" as const };
          const mob = mobileLabels[area.name];
          const label = area.short.toUpperCase();
          return (
            <g
              key={area.name}
              data-area={areaKey(area)}
              transform={`translate(${f(x)} ${f(y)})`}
              className={cn(
                "group/pt transition-opacity duration-300",
                "group-data-[has-active]/areas:[&:not([data-active])]:opacity-40",
              )}
            >
              <circle r="20" fill="transparent" />
              <circle
                r="13"
                fill="none"
                strokeWidth="1.5"
                vectorEffect="non-scaling-stroke"
                className="origin-center scale-50 stroke-worklight opacity-0 transition-[opacity,transform] duration-300 ease-[var(--ease-rake)] [transform-box:fill-box] group-data-[active]/pt:scale-100 group-data-[active]/pt:opacity-100"
              />
              <path
                d="M-8 0H8M0 -8V8"
                strokeWidth="1.25"
                vectorEffect="non-scaling-stroke"
                className="stroke-[color:var(--ink)] transition-colors duration-200 group-data-[active]/pt:stroke-worklight-deep"
              />
              <text
                x={desk.dx}
                y={desk.dy}
                textAnchor={desk.anchor}
                paintOrder="stroke"
                strokeWidth="4"
                strokeLinejoin="round"
                className="hidden fill-[color:var(--spec)] stroke-[color:var(--surface)] font-mono transition-colors md:inline group-data-[active]/pt:fill-[color:var(--ink)]"
                style={{ fontSize: 14, fontWeight: 500, letterSpacing: "0.12em" }}
              >
                {label}
              </text>
              {mob && (
                <text
                  x={mob.dx}
                  y={mob.dy}
                  textAnchor={mob.anchor}
                  paintOrder="stroke"
                  strokeWidth="6"
                  strokeLinejoin="round"
                  className="fill-[color:var(--spec)] stroke-[color:var(--surface)] font-mono md:hidden group-data-[active]/pt:fill-[color:var(--ink)]"
                  style={{ fontSize: 28, fontWeight: 500, letterSpacing: "0.1em" }}
                >
                  {label}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      {/* Title strip: north arrow · scale bar · datum · sheet */}
      <div
        aria-hidden="true"
        className="grid grid-cols-[auto_minmax(0,1fr)] border border-t-0 border-[color:var(--hairline)] text-[color:var(--spec)] md:grid-cols-[auto_auto_minmax(0,1fr)_auto]"
      >
        <div className="flex items-center gap-2 border-r border-[color:var(--hairline)] px-3 py-2.5">
          <svg viewBox="0 0 24 24" width="22" height="22" className="text-[color:var(--ink)]">
            <circle cx="12" cy="12" r="10.5" fill="none" stroke="currentColor" strokeWidth="1" />
            <path d="M12 3.5 7.5 17 12 14.2Z" fill="currentColor" />
            <path d="M12 3.5 16.5 17 12 14.2Z" fill="none" stroke="currentColor" strokeWidth="1" />
          </svg>
          <span className="t-spec">N</span>
        </div>
        <div className="flex items-center gap-3 px-3 py-2.5 md:border-r md:border-[color:var(--hairline)]">
          <svg
            viewBox="0 0 100 10"
            preserveAspectRatio="none"
            className="h-2.5 shrink-0 text-[color:var(--ink)]"
            style={{ width: `${(TEN_KM_FRACTION * 100).toFixed(2)}cqw` }}
          >
            <rect x="0" y="3" width="50" height="4" fill="currentColor" />
            <rect x="50" y="3" width="50" height="4" fill="none" stroke="currentColor" strokeWidth="1" vectorEffect="non-scaling-stroke" />
            <line x1="0" y1="0" x2="0" y2="10" stroke="currentColor" strokeWidth="1" vectorEffect="non-scaling-stroke" />
            <line x1="50" y1="0" x2="50" y2="10" stroke="currentColor" strokeWidth="1" vectorEffect="non-scaling-stroke" />
            <line x1="100" y1="0" x2="100" y2="10" stroke="currentColor" strokeWidth="1" vectorEffect="non-scaling-stroke" />
          </svg>
          <span className="t-spec whitespace-nowrap">0 · 5 · 10 km</span>
        </div>
        <div className="col-span-2 border-t border-[color:var(--hairline)] px-3 py-2.5 md:col-span-1 md:border-t-0">
          <span className="t-spec tabular-nums">{datumLabel}</span>
        </div>
        {sheet && (
          <div className="hidden border-l border-[color:var(--hairline)] px-3 py-2.5 md:block">
            <span className="t-spec tabular-nums">{sheet}</span>
          </div>
        )}
      </div>
    </figure>
  );
}

type AreaListProps = {
  className?: string;
};

/**
 * The service areas as quote links (/free-quote?area=…): the accessible content the map summarises.
 * Two columns filled top to bottom from 360 px; one column below that, where a half-width name
 * column would break "Findlay Creek" over two lines. Items carry data-area so AreaLinker can
 * highlight the matching point.
 */
export function AreaList({ className }: AreaListProps) {
  const rows = Math.ceil(areas.length / 2);
  return (
    <ul
      role="list"
      className={cn(
        "grid grid-cols-1 gap-x-5 border-t border-[color:var(--hairline)] md:gap-x-8",
        "min-[360px]:grid-flow-col min-[360px]:grid-cols-2 min-[360px]:[grid-template-rows:repeat(var(--area-rows),auto)]",
        className,
      )}
      style={{ "--area-rows": rows } as React.CSSProperties}
    >
      {areas.map((area, i) => (
        <li key={area.name} className="border-b border-[color:var(--hairline)]">
          <a
            href={areaQuoteHref(area)}
            data-area={areaKey(area)}
            className={cn(
              "group/link relative flex min-h-11 items-start gap-3 py-2.5 text-[0.9375rem] leading-snug text-[color:var(--ink)] md:text-base",
              "before:pointer-events-none before:absolute before:inset-y-0 before:-left-2 before:right-0 before:-z-10 before:bg-[linear-gradient(90deg,rgb(244_166_42/0.12),transparent_75%)] before:opacity-0 before:transition-opacity before:duration-200",
              "hover:before:opacity-100 data-[active]:before:opacity-100 active:before:opacity-100",
            )}
          >
            <span
              aria-hidden="true"
              className="t-spec w-6 shrink-0 pt-[0.2rem] tabular-nums transition-colors group-hover/link:text-[color:var(--ink)] group-data-[active]/link:text-[color:var(--ink)]"
            >
              {pad2(i + 1)}
            </span>
            <span className="min-w-0 flex-1">
              {area.name}
              <span className="sr-only"> — {ctas.primary}</span>
            </span>
            {/* Hover/focus cue only: takes no width on phones, where the name needs it */}
            <ArrowIcon
              size={18}
              className="mt-[0.4rem] hidden shrink-0 -translate-x-1 opacity-0 transition-[opacity,transform] md:block duration-200 ease-[var(--ease-rake)] group-hover/link:translate-x-0 group-hover/link:opacity-100 group-focus-visible/link:translate-x-0 group-focus-visible/link:opacity-100 group-data-[active]/link:translate-x-0 group-data-[active]/link:opacity-100"
            />
          </a>
        </li>
      ))}
    </ul>
  );
}
