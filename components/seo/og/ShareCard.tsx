/* eslint-disable @next/next/no-img-element -- satori (next/og) renders plain <img>, not next/image */
/**
 * Share card (1200 × 630): a drawing sheet for a perfect wall, lit by one raking light.
 *
 * Layers, back to front: the dark wall photo with its beam entering from the left (or a drawn beam
 * until the photo exists) · a sheet border with crop marks · the wordmark and the domain · an amber
 * rake line where the light catches the sheet · a sheet-reference row · the page title in Archivo
 * Expanded ExtraBold · a dimension run whose ticks measure a real fact, one segment lit amber.
 *
 * Satori subset: flexbox only, every multi-child <div> sets display:flex, px units, no CSS vars.
 */
import type { OgCard, OgScale } from "@/lib/seo";
import { site } from "@/content/site.config";
import { OG_FONT } from "./assets";
import { beamGradient, ogColor, rakeGradient } from "./tokens";

export const OG_SIZE = { width: 1200, height: 630 } as const;

const PAD = 64; // text inset from the canvas edge
const FRAME = 30; // sheet border inset
const RUN = 640; // dimension run length

const mono = (size: number, color: string = ogColor.steelLight) => ({
  fontFamily: OG_FONT.mono,
  fontSize: size,
  letterSpacing: size * 0.14,
  color,
  lineHeight: 1,
});

/** Title lines: a "\n" in the title is a deliberate break (no widows); otherwise satori wraps. */
function titleLines(title: string): string[] {
  return title.split("\n").map((line) => line.trim());
}

/**
 * Headline size. Broken titles are sized so their longest line fits the measure (Archivo Expanded
 * ExtraBold sets about 0.7 em per character); unbroken ones step down by length and wrap, so every
 * title sets in two or three lines at most. Capped at 112 px.
 */
function titleSize(lines: string[]): number {
  if (lines.length > 1) {
    const longest = Math.max(...lines.map((line) => line.length));
    return Math.min(112, Math.floor((OG_SIZE.width - PAD * 2) / (0.7 * longest)));
  }
  const n = lines[0].length;
  if (n <= 18) return 112;
  if (n <= 26) return 98;
  if (n <= 34) return 86;
  if (n <= 44) return 74;
  return 66;
}

function CropMark({ x, y, flipX, flipY }: { x: number; y: number; flipX?: boolean; flipY?: boolean }) {
  const arm = 14;
  return (
    <div
      style={{
        position: "absolute",
        left: flipX ? x - arm : x,
        top: flipY ? y - arm : y,
        width: arm,
        height: arm,
        display: "flex",
        borderColor: ogColor.hairline,
        borderStyle: "solid",
        borderWidth: 0,
        borderLeftWidth: flipX ? 0 : 1,
        borderRightWidth: flipX ? 1 : 0,
        borderTopWidth: flipY ? 0 : 1,
        borderBottomWidth: flipY ? 1 : 0,
      }}
    />
  );
}

function DimensionRun({ scale }: { scale: OgScale }) {
  const n = Math.max(2, scale.ticks.length);
  const step = RUN / (n - 1);
  const [litFrom, litTo] = scale.lit ?? [0, 0];
  return (
    <div style={{ display: "flex", flexDirection: "column", width: RUN }}>
      <div style={{ display: "flex", justifyContent: "center", ...mono(15, ogColor.plaster) }}>
        {scale.caption.toUpperCase()}
      </div>
      <div style={{ display: "flex", position: "relative", width: RUN, height: 22, marginTop: 10 }}>
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 10,
            width: RUN,
            height: 1,
            backgroundColor: ogColor.steelLight,
            opacity: 0.6,
          }}
        />
        {scale.lit && (
          <div
            style={{
              position: "absolute",
              left: litFrom * step,
              top: 9,
              width: (litTo - litFrom) * step,
              height: 3,
              backgroundColor: ogColor.worklight,
            }}
          />
        )}
        {Array.from({ length: n }, (_, i) => {
          const end = i === 0 || i === n - 1;
          const h = end ? 22 : 10;
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: Math.min(RUN - 1, Math.round(i * step)),
                top: 11 - h / 2,
                width: 1,
                height: h,
                backgroundColor: i >= litFrom && i <= litTo && scale.lit ? ogColor.worklight : ogColor.steelLight,
              }}
            />
          );
        })}
      </div>
      <div style={{ display: "flex", position: "relative", width: RUN, height: 14, marginTop: 8 }}>
        {scale.ticks.map((tick, i) => {
          if (!tick) return null;
          const first = i === 0;
          const last = i === n - 1;
          const boxW = 120;
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: first ? 0 : last ? RUN - boxW : i * step - boxW / 2,
                width: boxW,
                display: "flex",
                justifyContent: first ? "flex-start" : last ? "flex-end" : "center",
                ...mono(12, ogColor.steelLight),
              }}
            >
              {tick.toUpperCase()}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function ShareCard({ card, base }: { card: OgCard; base: string | null }) {
  const lines = titleLines(card.title);
  const size = titleSize(lines);
  return (
    <div
      style={{
        width: OG_SIZE.width,
        height: OG_SIZE.height,
        display: "flex",
        position: "relative",
        backgroundColor: ogColor.graphite,
        // Satori walks every key, so an `undefined` value throws: add the drawn beam only when needed.
        ...(base ? {} : { backgroundImage: beamGradient }),
        color: ogColor.plaster,
        fontFamily: OG_FONT.mono,
      }}
    >
      {base && (
        <img
          src={base}
          alt=""
          width={OG_SIZE.width}
          height={OG_SIZE.height}
          style={{ position: "absolute", left: 0, top: 0, width: OG_SIZE.width, height: OG_SIZE.height }}
        />
      )}

      {/* Sheet border + crop marks */}
      <div
        style={{
          position: "absolute",
          left: FRAME,
          top: FRAME,
          width: OG_SIZE.width - FRAME * 2,
          height: OG_SIZE.height - FRAME * 2,
          display: "flex",
          border: `1px solid ${ogColor.hairlineFaint}`,
        }}
      />
      <CropMark x={FRAME - 18} y={FRAME - 18} />
      <CropMark x={OG_SIZE.width - FRAME + 18} y={FRAME - 18} flipX />
      <CropMark x={FRAME - 18} y={OG_SIZE.height - FRAME + 18} flipY />
      <CropMark x={OG_SIZE.width - FRAME + 18} y={OG_SIZE.height - FRAME + 18} flipX flipY />

      {/* Wordmark */}
      <div style={{ position: "absolute", left: PAD, top: PAD, display: "flex", flexDirection: "column" }}>
        <div
          style={{
            fontFamily: OG_FONT.display,
            fontSize: 40,
            lineHeight: 0.85,
            letterSpacing: -0.4,
            color: ogColor.plaster,
          }}
        >
          CAPITAL
        </div>
        <div style={{ display: "flex", marginTop: 9, ...mono(11.5, ogColor.plaster), letterSpacing: 4.1 }}>
          DRYWALL &amp; RENOVATION
        </div>
      </div>

      {/* Domain */}
      <div style={{ position: "absolute", right: PAD, top: PAD + 2, display: "flex", ...mono(14) }}>
        {site.domain.toUpperCase()}
      </div>

      {/* Title block, anchored to the bottom so it grows upward with the title */}
      <div
        style={{
          position: "absolute",
          left: 0,
          bottom: 74,
          width: OG_SIZE.width,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div style={{ display: "flex", width: OG_SIZE.width, height: 1, backgroundImage: rakeGradient }} />

        <div style={{ display: "flex", alignItems: "center", marginTop: 26, paddingLeft: PAD, paddingRight: PAD }}>
          <div style={{ display: "flex", ...mono(15) }}>
            {(card.index ? `${card.index} / ${card.label}` : card.label).toUpperCase()}
          </div>
          <div
            style={{
              display: "flex",
              flexGrow: 1,
              height: 1,
              marginLeft: 18,
              marginRight: 18,
              backgroundColor: ogColor.hairline,
              position: "relative",
            }}
          >
            <div
              style={{
                position: "absolute",
                right: 0,
                top: -5,
                width: 1,
                height: 11,
                backgroundColor: ogColor.hairline,
              }}
            />
          </div>
          <div style={{ display: "flex", ...mono(15) }}>{card.sheet}</div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginTop: 30,
            paddingLeft: PAD - 4,
            paddingRight: PAD,
            fontFamily: OG_FONT.display,
            fontSize: size,
            lineHeight: 0.96,
            letterSpacing: -size * 0.02,
            color: ogColor.plaster,
          }}
        >
          {lines.map((line, i) => (
            <div key={i} style={{ display: "flex" }}>
              {line}
            </div>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "flex-end", marginTop: 36, paddingLeft: PAD, paddingRight: PAD }}>
          <DimensionRun scale={card.scale} />
          <div style={{ display: "flex", flexGrow: 1 }} />
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
            <div style={{ display: "flex", ...mono(12) }}>
              {`${site.address.locality}, ${site.address.regionName}`.toUpperCase()}
            </div>
            <div style={{ display: "flex", marginTop: 8, ...mono(12) }}>
              {`${site.geo.latitude.toFixed(4)}° N · ${Math.abs(site.geo.longitude).toFixed(4)}° W`}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
