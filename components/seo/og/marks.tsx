/**
 * Brand marks for next/og: the favicon / touch-icon monogram and the square wordmark tile used as
 * the JSON-LD logo and the manifest's large icon. Satori subset: flexbox, px, no CSS variables.
 *
 * Monogram: a plaster "C" in Archivo Expanded on graphite, with a short amber hairline raking in
 * from the left edge below it (light only ever comes from the left and low).
 */
import { brand } from "@/content/copy/global";
import { OG_FONT } from "./assets";
import { ogColor } from "./tokens";

/** Amber hairline that grazes in from the left and fades out (the `rake-line` motif). */
const rake = (stop: number) =>
  `linear-gradient(90deg, ${ogColor.worklight} 0%, ${ogColor.worklight} ${stop}%, rgba(244, 166, 42, 0) 100%)`;

/** A faint warm glow from the left and low, as on the share card. */
const glow = "radial-gradient(circle at 0% 78%, rgba(244, 166, 42, 0.22) 0%, rgba(244, 166, 42, 0) 62%)";

export function Monogram({ size }: { size: number }) {
  // Proportions tuned per size: the favicon needs a heavier hairline to survive 16 px downsampling.
  const small = size <= 48;
  const letter = Math.round(size * (small ? 0.84 : 0.7));
  const line = Math.max(2, Math.round(size * (small ? 0.07 : 0.035)));
  const lineTop = Math.round(size * (small ? 0.82 : 0.75));
  return (
    <div
      style={{
        width: size,
        height: size,
        display: "flex",
        position: "relative",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: ogColor.graphite,
        ...(small ? {} : { backgroundImage: glow }),
      }}
    >
      <div
        style={{
          display: "flex",
          marginTop: -Math.round(size * (small ? 0.1 : 0.08)),
          fontFamily: OG_FONT.display,
          fontSize: letter,
          lineHeight: 1,
          color: ogColor.plaster,
        }}
      >
        C
      </div>
      <div
        style={{
          position: "absolute",
          left: 0,
          top: lineTop,
          width: Math.round(size * (small ? 0.56 : 0.5)),
          height: line,
          backgroundImage: rake(small ? 55 : 35),
        }}
      />
    </div>
  );
}

/** 512 × 512 wordmark tile: CAPITAL over DRYWALL & RENOVATION, an amber rake line beneath. */
export function LogoTile({ size = 512 }: { size?: number }) {
  const k = size / 512;
  return (
    <div
      style={{
        width: size,
        height: size,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        backgroundColor: ogColor.graphite,
        backgroundImage: glow,
        color: ogColor.plaster,
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
        <div
          style={{
            display: "flex",
            fontFamily: OG_FONT.display,
            fontSize: 80 * k,
            lineHeight: 0.85,
            letterSpacing: -0.8 * k,
          }}
        >
          {brand.wordmark.top}
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 18 * k,
            fontFamily: OG_FONT.mono,
            fontSize: 22.5 * k,
            lineHeight: 1,
            letterSpacing: 8.1 * k,
          }}
        >
          {brand.wordmark.bottom}
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 338 * k,
          width: 300 * k,
          height: Math.max(2, 3 * k),
          backgroundImage: rake(30),
        }}
      />
    </div>
  );
}
