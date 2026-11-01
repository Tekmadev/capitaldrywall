/**
 * Project photos for before/after sliders and the Recent work gallery (brief §7.4).
 * Items with isSample: true are AI-generated demo placeholders: they render only when
 * NEXT_PUBLIC_SITE_MODE=demo (always badged), and are filtered out in production.
 * A section with no remaining items hides itself.
 *
 * To add a real project: drop photos in public/images/projects/, register them in media.ts
 * with kind "project", and add an entry here with isSample: false and its neighbourhood.
 */
import { media, type MediaAsset } from "./media";
import type { ServiceId } from "./services";
import { feature, isDemo, type FeatureFlag } from "./site.config";

export type ProjectPlacement =
  | "home-drywall-card"
  | "home-basement-card"
  | "drywall"
  | "basement"
  | "gallery";

export type Project = {
  id: string;
  /** {{project}} in the caption format "{{project}} · {{neighbourhood}}" */
  title: string;
  service: ServiceId;
  neighbourhood: string | null;
  before?: MediaAsset;
  after: MediaAsset;
  isSample: boolean;
  placements: ProjectPlacement[];
  flag?: FeatureFlag;
};

const allProjects: Project[] = [
  {
    id: "sample-drywall-hole-repair",
    title: "Drywall hole repair",
    service: "drywall-repair",
    neighbourhood: null,
    before: media.sampleHoleBefore,
    after: media.sampleHoleAfter,
    isSample: true,
    placements: ["home-drywall-card", "drywall", "gallery"],
  },
  {
    id: "sample-water-damaged-ceiling",
    title: "Water-damaged ceiling repair",
    service: "drywall-repair",
    neighbourhood: null,
    before: media.sampleCeilingBefore,
    after: media.sampleCeilingAfter,
    isSample: true,
    placements: ["drywall", "gallery"],
  },
  {
    id: "sample-popcorn-ceiling",
    title: "Popcorn ceiling removal",
    service: "popcorn-removal",
    neighbourhood: null,
    before: media.samplePopcornBefore,
    after: media.samplePopcornAfter,
    isSample: true,
    placements: ["drywall", "gallery"],
    flag: "popcornRemoval",
  },
  {
    id: "sample-basement-finish",
    title: "Basement finish",
    service: "basement-renovation",
    neighbourhood: null,
    before: media.sampleBasementBefore,
    after: media.sampleBasementAfter,
    isSample: true,
    placements: ["home-basement-card", "basement", "gallery"],
  },
  {
    id: "sample-level-5-hallway",
    title: "Level 5 hallway",
    service: "skim-coat-level-5",
    neighbourhood: null,
    after: media.sampleLevel5Hallway,
    isSample: true,
    placements: ["gallery"],
  },
  {
    id: "sample-basement-taping",
    title: "Basement taping & mudding",
    service: "taping-mudding",
    neighbourhood: null,
    after: media.sampleBasementTaping,
    isSample: true,
    placements: ["gallery"],
  },
];

/** Projects allowed on the current site: samples only in demo mode, feature flags applied. */
export const projects: Project[] = allProjects.filter(
  (p) => (isDemo || !p.isSample) && (!p.flag || feature(p.flag)),
);

/** Projects for one placement (before/after placements require both photos). */
export function projectsFor(placement: ProjectPlacement): Project[] {
  return projects.filter(
    (p) => p.placements.includes(placement) && (placement === "gallery" || Boolean(p.before)),
  );
}

/** Caption per copy deck: "{{project}} · {{neighbourhood}}" ("Sample" stands in for samples). */
export function projectCaption(p: Project): string {
  return `${p.title} · ${p.neighbourhood ?? (p.isSample ? "Sample" : "Ottawa")}`;
}

/** Badge text for sample items (brief §7.4). */
export const sampleBadge = "Sample — replace with project photo";
