import type { ReactNode } from "react";
import { RakingAngle, RakingLightTest } from "@/components/scenes/RakingLightTest";
import { RakingLightStage } from "@/components/scenes/RakingLightStage";
import { WallLayers, type WallLayer } from "@/components/scenes/WallLayers";
import { SectionCut } from "@/components/scenes/WallLayersDrawing";
import { media } from "@/content/media";

/* Copy-deck strings (docs/CAPITAL_COPY.md: "Raking-light test" and "Built for Ottawa basements"). */
const raking = {
  eyebrow: "02 / The raking-light test",
  title: "Every wall looks fine until the light hits it sideways.",
  body: "Drywall pros check their work by holding a light flat against the wall. That low-angle light exposes every ridge, seam and sanding mark a rushed job leaves behind. It's how we inspect every wall before we call it finished.",
  instructionDesktop: "Move your cursor across both walls.",
  instructionTouch: "Drag across both walls.",
  labels: ["Rushed finish", "Capital finish"] as [string, string],
  caption: "Same wall. Same paint. Different finish.",
};

const wall = {
  title: "Built warm and dry for Ottawa winters.",
  answer:
    "A finished basement is only as good as what's behind the drywall. In Ottawa, that means dealing with cold and moisture before anything else goes up.",
  layers: [
    {
      index: "01",
      title: "Foundation wall",
      body: "We check for moisture and cracks first. Active water gets fixed before we build.",
    },
    {
      index: "02",
      title: "Insulation",
      body: "Insulated to Ontario Building Code against the foundation, to keep the room warm and help prevent condensation.",
    },
    {
      index: "03",
      title: "Vapour barrier",
      body: "Sealed at every seam and opening to keep moisture out of the wall.",
    },
    { index: "04", title: "Framing", body: "Straight, square stud walls, ready for flat drywall." },
    { index: "05", title: "Drywall", body: "Moisture-resistant board where it's needed, finished smooth." },
    { index: "06", title: "Subfloor", body: "A thermal break between your feet and the cold slab." },
  ] satisfies WallLayer[],
};

const panels = [
  { flat: media.rakingRushedFlat, raking: media.rakingRushedRaking, label: raking.labels[0], field: "Panel A" },
  { flat: media.rakingCapitalFlat, raking: media.rakingCapitalRaking, label: raking.labels[1], field: "Panel B" },
] as const;

function DemoLabel({ children, dark = false }: { children: ReactNode; dark?: boolean }) {
  return (
    <div className={dark ? "surface-dark border-y border-white/10" : "surface-light border-y border-compound"}>
      <p className="site-container t-spec py-3">{children}</p>
    </div>
  );
}

/**
 * Kitchen sink: scroll scenes B (RakingLightTest, WallLayers). Live scenes keep their real scroll
 * length; the static previews show the reduced-motion, parked and mid-scroll states for screenshots.
 */
export default function KitchenSinkScenesB() {
  return (
    <div id="ks-scenesb">
      <DemoLabel dark>
        ScenesB · RakingLightTest · live: idle sweep on first view, work-light cursor, drag on touch, arrow
        keys when focused
      </DemoLabel>
      <RakingLightTest id="ks-raking-live" {...raking} />

      <DemoLabel dark>RakingLightTest · parked light, no sweep (autoSweep false, initialLight 0.34 / 0.6)</DemoLabel>
      <section className="surface-dark section-y-tight">
        <div className="site-container">
          <RakingLightStage
            panels={[panels[0], panels[1]]}
            instructionDesktop={raking.instructionDesktop}
            instructionTouch={raking.instructionTouch}
            instructionKeyboard="Arrow keys move the light."
            caption={raking.caption}
            autoSweep={false}
            initialLight={{ x: 0.34, y: 0.6 }}
          />
        </div>
      </section>

      <DemoLabel dark>
        RakingLightTest · static (forceStatic = reduced motion and no-JS): raking-lit photos side by side
      </DemoLabel>
      <RakingLightTest id="ks-raking-static" {...raking} forceStatic sheet="A-05" />

      <DemoLabel>Drafting pieces · RakingAngle (dark) · SectionCut (light)</DemoLabel>
      <div className="surface-dark py-10">
        <div className="site-container">
          <RakingAngle label="15° raking angle" />
        </div>
      </div>
      <div className="surface-light py-10">
        <div className="site-container">
          <SectionCut label="Section A–A" />
        </div>
      </div>

      <DemoLabel>WallLayers · preview: exploded (previewProgress 0)</DemoLabel>
      <WallLayers
        id="ks-wall-exploded"
        title={wall.title}
        answer={wall.answer}
        layers={wall.layers}
        previewProgress={0}
        vellum={false}
      />

      <DemoLabel>WallLayers · preview: mid-assembly, framing active (previewProgress 0.62)</DemoLabel>
      <WallLayers
        id="ks-wall-mid"
        title={wall.title}
        answer={wall.answer}
        layers={wall.layers}
        previewProgress={0.62}
        vellum={false}
      />

      <DemoLabel>WallLayers · static (forceStatic = reduced motion and no-JS): assembled and fully labelled</DemoLabel>
      <WallLayers id="ks-wall-static" title={wall.title} answer={wall.answer} layers={wall.layers} forceStatic />
      <DemoLabel>
        WallLayers · live: desktop pins (CSS sticky, 240vh track) and scrubs the layers in; below 1024 px or
        short screens the drawing assembles as it scrolls up and the list highlights the layer being read
      </DemoLabel>
      <WallLayers
        id="ks-wall-live"
        eyebrow="Built for Ottawa basements"
        index="05"
        title={wall.title}
        answer={wall.answer}
        layers={wall.layers}
      />

    </div>
  );
}
