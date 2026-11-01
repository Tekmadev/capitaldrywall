import { RakeLine } from "@/components/ui/RakeLine";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { media } from "@/content/media";
import { cn } from "@/lib/utils";
import { RakingLightStage } from "./RakingLightStage";

export type RakingLightTestProps = {
  /** Copy-deck eyebrow, e.g. "02 / The raking-light test" (a leading "NN / " becomes the sheet index) */
  eyebrow: string;
  title: string;
  body: string;
  /** "Move your cursor across both walls." */
  instructionDesktop: string;
  /** "Drag across both walls." */
  instructionTouch: string;
  /** Keyboard hint shown while the walls have focus (functional UI text, not marketing copy) */
  instructionKeyboard?: string;
  /** ["Rushed finish", "Capital finish"] */
  labels: [string, string];
  /** "Same wall. Same paint. Different finish." */
  caption: string;
  /** Mono label beside the angle arc near the heading */
  angleLabel?: string;
  /** Dimension string over each panel (false hides it) */
  dimension?: string | false;
  /** Title-block field labels above the panel labels */
  fields?: [string, string];
  /** Drawing-sheet code at the end of the reference line, e.g. "A-05" */
  sheet?: string;
  /** Section id (also prefixes the heading id) */
  id?: string;
  /** Render the static comparison (reduced-motion state) */
  forceStatic?: boolean;
  /** Automatic idle sweep (default true) */
  autoSweep?: boolean;
  /** Initial light position within a panel, 0–1 */
  initialLight?: { x: number; y: number };
  className?: string;
};

/**
 * The raking-light test (brief §7.2, the home showpiece): a dark room, two walls that look the same
 * under flat light, and a work light that exposes the difference.
 */
export function RakingLightTest({
  eyebrow,
  title,
  body,
  instructionDesktop,
  instructionTouch,
  instructionKeyboard = "Arrow keys move the light.",
  labels,
  caption,
  angleLabel = "15° raking angle",
  dimension = "1.2 m wall section",
  fields = ["Panel A", "Panel B"],
  sheet,
  id = "raking-light-test",
  forceStatic,
  autoSweep,
  initialLight,
  className,
}: RakingLightTestProps) {
  const match = eyebrow.match(/^\s*(\d{1,3})\s*\/\s*(.+)$/);
  const titleId = `${id}-title`;

  return (
    <section
      id={id}
      aria-labelledby={titleId}
      className={cn("surface-dark section-y relative isolate overflow-x-clip", className)}
    >
      {/* One low warm beam from the left: the only light in the room */}
      <div aria-hidden="true" className="beam-rake pointer-events-none absolute inset-0 -z-10 opacity-60" />
      {/* …and its hairline raking across the boundary as the section comes in */}
      <RakeLine />

      <div className="site-container">
        <SectionHeader
          index={match?.[1]}
          eyebrow={match?.[2] ?? eyebrow}
          sheet={sheet}
          title={title}
          id={titleId}
        />

        <div className="site-grid mt-8 gap-y-10 md:mt-10">
          <p className="t-lede col-span-full text-muted md:col-span-7 lg:col-span-6 lg:col-start-2">{body}</p>
          <RakingAngle
            label={angleLabel}
            className="col-span-full self-end md:col-span-4 md:col-start-9 md:justify-self-end lg:col-span-3 lg:col-start-10"
          />
        </div>

        <RakingLightStage
          className="mt-14 md:mt-20"
          panels={[
            {
              flat: media.rakingRushedFlat,
              raking: media.rakingRushedRaking,
              label: labels[0],
              field: fields[0],
            },
            {
              flat: media.rakingCapitalFlat,
              raking: media.rakingCapitalRaking,
              label: labels[1],
              field: fields[1],
            },
          ]}
          instructionDesktop={instructionDesktop}
          instructionTouch={instructionTouch}
          instructionKeyboard={instructionKeyboard}
          caption={caption}
          dimension={dimension}
          forceStatic={forceStatic}
          autoSweep={autoSweep}
          initialLight={initialLight}
        />
      </div>
    </section>
  );
}

/*
 * Angle annotation drawn like a detail: the wall face (hatched), a lamp low on the left, the ray
 * grazing in at 15° and the dimension arc between ray and wall. Geometry: ray hits the wall at
 * H = (150, 44), the lamp sits 128 units back along 165°, the arc has r = 64.
 */
const H = { x: 150, y: 44 };
const RAD = Math.PI / 180;
const lamp = { x: H.x - 128 * Math.cos(15 * RAD), y: H.y - 128 * Math.sin(15 * RAD) };
const arcStart = { x: H.x - 64, y: H.y };
const arcEnd = { x: H.x - 64 * Math.cos(15 * RAD), y: H.y - 64 * Math.sin(15 * RAD) };
const f = (n: number) => n.toFixed(2);

export function RakingAngle({ label, className }: { label: string; className?: string }) {
  return (
    <div className={cn("flex items-end gap-4 text-[color:var(--spec)]", className)}>
      <svg
        viewBox="0 0 160 56"
        className="h-12 w-[8.5rem] shrink-0 overflow-visible md:h-14 md:w-40"
        aria-hidden="true"
        focusable="false"
      >
        {/* wall face + section hatch behind it */}
        <line x1="0" y1={H.y} x2="160" y2={H.y} stroke="currentColor" strokeWidth="1" vectorEffect="non-scaling-stroke" />
        {Array.from({ length: 16 }, (_, i) => (
          <line
            key={i}
            x1={4 + i * 10}
            y1={H.y + 1}
            x2={-2 + i * 10}
            y2={H.y + 8}
            stroke="currentColor"
            strokeOpacity="0.55"
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
          />
        ))}
        {/* the grazing ray */}
        <line
          x1={f(lamp.x)}
          y1={f(lamp.y)}
          x2={H.x}
          y2={H.y}
          className="stroke-worklight"
          strokeWidth="1.25"
          vectorEffect="non-scaling-stroke"
        />
        {/* dimension arc with end ticks */}
        <path
          d={`M${f(arcStart.x)} ${f(arcStart.y)} A64 64 0 0 1 ${f(arcEnd.x)} ${f(arcEnd.y)}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          vectorEffect="non-scaling-stroke"
        />
        <line x1={f(arcStart.x)} y1={H.y - 4} x2={f(arcStart.x)} y2={H.y + 4} stroke="currentColor" strokeWidth="1" vectorEffect="non-scaling-stroke" />
        {/* the lamp */}
        <circle cx={f(lamp.x)} cy={f(lamp.y)} r="9" className="fill-worklight" fillOpacity="0.18" />
        <circle cx={f(lamp.x)} cy={f(lamp.y)} r="3.5" className="fill-worklight" />
      </svg>
      <span className="t-spec whitespace-nowrap pb-1">{label}</span>
    </div>
  );
}
