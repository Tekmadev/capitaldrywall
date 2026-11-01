import type { ReactNode } from "react";
import { BasementTransform } from "@/components/scenes/BasementTransform";
import { HeroSequence, HeroTrustRow } from "@/components/scenes/HeroSequence";
import { ctas, trustItems } from "@/content/copy/global";
import { pages } from "@/content/services";
import { site } from "@/content/site.config";

/* Copy-deck strings (CAPITAL_COPY.md → HOME › Hero, HOME › Basement teaser, BASEMENT › Hero). */
const hero = {
  h1: "Drywall & Basement Renovations in Ottawa",
  display: "Smooth under any light.",
  sub: "We hang, tape and finish drywall to a paint-ready standard, and turn bare basements into warm, finished living space. Clean job sites, written quotes, and walls that hold up to the light.",
  primaryCta: { label: ctas.primary, href: pages.quote },
  call: { label: ctas.call, href: `tel:${site.phone.e164}` },
  stages: [
    { index: "01", label: "Board hung" },
    { index: "02", label: "Joints taped" },
    { index: "03", label: "Three coats" },
    { index: "04", label: "Sanded smooth" },
    { index: "05", label: "Paint-ready" },
  ],
  scrollCue: "Scroll to finish the wall ↓",
};

const basementStages = ["Plan & permit", "Frame & insulate", "Drywall & ceilings", "Floors, trim & paint"];

const teaser = {
  index: "03",
  eyebrow: "Basement finishing",
  sheet: "A-03",
  title: "From bare concrete to the best room in the house.",
  body: "Ottawa basements spend half the year cold and damp. We build them warm and dry from the floor up: insulated walls, a sealed vapour barrier, a subfloor between you and the concrete, then drywall, lighting, trim and paint.",
  link: { label: "See basement renovations", href: pages.basement },
  stages: basementStages,
};

const basementHero = {
  h1: "Basement Renovations & Finishing in Ottawa",
  display: "The room downstairs, finally finished.",
  sub: "We turn cold, unused basements into warm, bright living space: rec rooms, home offices, guest suites and gyms. Built properly from the concrete up.",
  primaryCta: { label: ctas.primary, href: pages.quote },
  secondaryCta: { label: "Estimate my basement", href: "#ks-scenes-index" },
  stages: basementStages,
};

const demos = [
  ["ks-hero-live", "HeroSequence · live (load at the top: rewind, then scroll to finish the wall)"],
  ["ks-teaser-live", "BasementTransform teaser · live"],
  ["ks-basement-hero-live", "BasementTransform hero · live"],
  ["ks-hero-static", "HeroSequence · forceStatic (= reduced motion, no-JS, first paint)"],
  ["ks-hero-scrub", "HeroSequence · demoProgress 0.32 (stage 02, headline hidden)"],
  ["ks-hero-resolve", "HeroSequence · demoProgress 0.93 (headline resolving)"],
  ["ks-basement-hero-static", "BasementTransform hero · forceStatic"],
  ["ks-teaser-static", "BasementTransform teaser · forceStatic"],
  ["ks-teaser-demo", "BasementTransform teaser · demoProgress 0.55"],
] as const;

function Label({ id, children }: { id: string; children: ReactNode }) {
  return (
    <div id={id} className="surface-light scroll-mt-[var(--header-h)] border-t border-[color:var(--hairline)]">
      <p className="site-container t-spec py-4">{children}</p>
    </div>
  );
}

/**
 * Kitchen sink · Scenes: the frame-sequence scenes live (with real scroll length) plus frozen
 * previews of their static and scrubbed states. The live hero renders first so `?only=scenes`
 * loads it at the top, where its rewind plays.
 */
export default function KitchenSinkScenes() {
  const trustRow = <HeroTrustRow items={trustItems} />;
  return (
    <div id="ks-scenes">
      <HeroSequence id="ks-hero-live" {...hero} trustRow={trustRow} />

      <section id="ks-scenes-index" className="surface-light texture-plaster section-y-tight">
        <div className="site-container space-y-6">
          <p className="t-spec">Kitchen sink · Scenes · SmoothScroll + frame engine</p>
          <ol className="grid gap-x-8 gap-y-2 md:grid-cols-2">
            {demos.map(([id, label], i) => (
              <li key={id} className="flex gap-3 text-[0.9375rem]">
                <span className="t-spec pt-1 tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                <a href={`#${id}`} className="link-inline">
                  {label}
                </a>
              </li>
            ))}
          </ol>
          <p className="text-[0.9375rem] text-muted prose-measure">
            Anchor links above glide with Lenis and land clear of the header. Reduced motion: every scene below
            shows its static state, nothing pins or scrubs, and Lenis is off.
          </p>
        </div>
      </section>

      <BasementTransform variant="teaser" id="ks-teaser-live" headingAs="h3" {...teaser} />
      <Label id="ks-basement-hero-live-label">BasementTransform · hero variant · live</Label>
      <BasementTransform variant="hero" id="ks-basement-hero-live" headingAs="h2" {...basementHero} />

      <Label id="ks-hero-static-label">HeroSequence · forceStatic</Label>
      <HeroSequence id="ks-hero-static" {...hero} trustRow={trustRow} headingAs="h2" forceStatic />
      <Label id="ks-hero-scrub-label">HeroSequence · demoProgress 0.32</Label>
      <HeroSequence id="ks-hero-scrub" {...hero} trustRow={trustRow} headingAs="h2" demoProgress={0.32} />
      <Label id="ks-hero-resolve-label">HeroSequence · demoProgress 0.93</Label>
      <HeroSequence id="ks-hero-resolve" {...hero} trustRow={trustRow} headingAs="h2" demoProgress={0.93} />

      <Label id="ks-basement-hero-static-label">BasementTransform · hero · forceStatic</Label>
      <BasementTransform variant="hero" id="ks-basement-hero-static" headingAs="h2" forceStatic {...basementHero} />
      <Label id="ks-teaser-static-label">BasementTransform · teaser · forceStatic</Label>
      <BasementTransform variant="teaser" id="ks-teaser-static" headingAs="h3" forceStatic {...teaser} />
      <Label id="ks-teaser-demo-label">BasementTransform · teaser · demoProgress 0.55</Label>
      <BasementTransform variant="teaser" id="ks-teaser-demo" headingAs="h3" demoProgress={0.55} {...teaser} />
    </div>
  );
}
