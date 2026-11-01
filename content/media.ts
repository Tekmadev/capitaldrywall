/**
 * Media registry: every image the site renders, with exact intrinsic size and honest alt text.
 * Files are produced by the asset pipeline (assets-src/MANIFEST.md) at these exact paths.
 *
 * kind:
 *  - "atmosphere": AI-generated mood image. Never captioned as a client project.
 *  - "concept":    AI-generated visualization. Always labelled "Concept visualization".
 *  - "sample":     AI-generated demo placeholder for a real project photo. Rendered ONLY when
 *                  NEXT_PUBLIC_SITE_MODE=demo, always with the "Sample — replace with project photo" badge.
 *  - "project":    A real client project photo (none yet).
 */

export type MediaKind = "atmosphere" | "concept" | "sample" | "project";

export type MediaAsset = {
  src: string;
  width: number;
  height: number;
  alt: string;
  kind: MediaKind;
  /** Short factual figure caption (what is shown), used by MediaFrame */
  caption?: string;
};

const W16 = { width: 1920, height: 1080 } as const;
const W45 = { width: 1200, height: 1500 } as const;
const W43 = { width: 1600, height: 1200 } as const;
const M916 = { width: 900, height: 1600 } as const;

export const media = {
  /* Hero (home) */
  heroPosterDesktop: {
    src: "/images/hero/hero-poster-desktop.jpg",
    ...W16,
    alt: "Smooth painted wall lit by a low-angle work light, showing a flawless drywall finish",
    kind: "atmosphere",
  },
  heroPosterMobile: {
    src: "/images/hero/hero-poster-mobile.jpg",
    ...M916,
    alt: "Smooth painted wall lit by a low-angle work light, showing a flawless drywall finish",
    kind: "atmosphere",
  },
  drywallLoopPoster: {
    src: "/images/hero/drywall-loop-poster.jpg",
    width: 1280,
    height: 720,
    alt: "Low work light sweeping across a smooth, finished drywall wall",
    kind: "atmosphere",
    caption: "Raking light across a finished wall",
  },

  /* Raking-light test (alt text from the copy deck) */
  rakingRushedFlat: {
    src: "/images/raking/rushed-flat.jpg",
    ...W45,
    alt: "Painted wall under flat, even light that looks smooth",
    kind: "atmosphere",
  },
  rakingRushedRaking: {
    src: "/images/raking/rushed-raking.jpg",
    ...W45,
    alt: "Wall under raking light showing visible seams and ridges from a rushed drywall finish",
    kind: "atmosphere",
  },
  rakingCapitalFlat: {
    src: "/images/raking/capital-flat.jpg",
    ...W45,
    alt: "Painted wall under flat, even light that looks smooth",
    kind: "atmosphere",
  },
  rakingCapitalRaking: {
    src: "/images/raking/capital-raking.jpg",
    ...W45,
    alt: "Wall under raking light showing a smooth, seamless drywall finish",
    kind: "atmosphere",
  },

  /* Basement transformation keyframes (concept) */
  basementStage1Desktop: {
    src: "/images/basement/basement-stage-1-desktop.jpg",
    ...W16,
    alt: "Unfinished Ottawa basement with concrete walls and exposed joists (concept visualization)",
    kind: "concept",
  },
  basementStage2Desktop: {
    src: "/images/basement/basement-stage-2-desktop.jpg",
    ...W16,
    alt: "Basement with new stud walls, insulation and vapour barrier installed (concept visualization)",
    kind: "concept",
  },
  basementStage3Desktop: {
    src: "/images/basement/basement-stage-3-desktop.jpg",
    ...W16,
    alt: "Basement walls and ceiling covered in taped and mudded drywall (concept visualization)",
    kind: "concept",
  },
  basementStage4Desktop: {
    src: "/images/basement/basement-stage-4-desktop.jpg",
    ...W16,
    alt: "Finished basement rec room with pot lights and vinyl plank flooring (concept visualization)",
    kind: "concept",
  },
  basementStage1Mobile: {
    src: "/images/basement/basement-stage-1-mobile.jpg",
    ...M916,
    alt: "Unfinished Ottawa basement with concrete walls and exposed joists (concept visualization)",
    kind: "concept",
  },
  basementStage2Mobile: {
    src: "/images/basement/basement-stage-2-mobile.jpg",
    ...M916,
    alt: "Basement with new stud walls, insulation and vapour barrier installed (concept visualization)",
    kind: "concept",
  },
  basementStage3Mobile: {
    src: "/images/basement/basement-stage-3-mobile.jpg",
    ...M916,
    alt: "Basement walls and ceiling covered in taped and mudded drywall (concept visualization)",
    kind: "concept",
  },
  basementStage4Mobile: {
    src: "/images/basement/basement-stage-4-mobile.jpg",
    ...M916,
    alt: "Finished basement rec room with pot lights and vinyl plank flooring (concept visualization)",
    kind: "concept",
  },
  basementPosterDesktop: {
    src: "/images/basement/basement-poster-desktop.jpg",
    ...W16,
    alt: "Unfinished Ottawa basement with concrete walls and exposed joists (concept visualization)",
    kind: "concept",
  },
  basementPosterMobile: {
    src: "/images/basement/basement-poster-mobile.jpg",
    ...M916,
    alt: "Unfinished Ottawa basement with concrete walls and exposed joists (concept visualization)",
    kind: "concept",
  },

  /* Atmosphere stills: 16:9 and 4:5 */
  tapingKnife16x9: {
    src: "/images/atmosphere/taping-knife-16x9.jpg",
    ...W16,
    alt: "Taping knife spreading joint compound over a drywall seam in warm light",
    kind: "atmosphere",
    caption: "Taping knife, compound over a seam",
  },
  tapingKnife4x5: {
    src: "/images/atmosphere/taping-knife-4x5.jpg",
    ...W45,
    alt: "Taping knife spreading joint compound over a drywall seam in warm light",
    kind: "atmosphere",
    caption: "Taping knife, compound over a seam",
  },
  sandingCeiling16x9: {
    src: "/images/atmosphere/sanding-ceiling-16x9.jpg",
    ...W16,
    alt: "Pole sander with a dust-extraction hose against a smooth drywall ceiling",
    kind: "atmosphere",
    caption: "Dust-extraction sanding",
  },
  sandingCeiling4x5: {
    src: "/images/atmosphere/sanding-ceiling-4x5.jpg",
    ...W45,
    alt: "Pole sander with a dust-extraction hose against a smooth drywall ceiling",
    kind: "atmosphere",
    caption: "Dust-extraction sanding",
  },
  paintRoller16x9: {
    src: "/images/atmosphere/paint-roller-16x9.jpg",
    ...W16,
    alt: "Hands rolling warm-white paint onto a smooth wall",
    kind: "atmosphere",
    caption: "Paint over a properly finished wall",
  },
  paintRoller4x5: {
    src: "/images/atmosphere/paint-roller-4x5.jpg",
    ...W45,
    alt: "Hands rolling warm-white paint onto a smooth wall",
    kind: "atmosphere",
    caption: "Paint over a properly finished wall",
  },
  smoothCeiling16x9: {
    src: "/images/atmosphere/smooth-ceiling-pot-lights-16x9.jpg",
    ...W16,
    alt: "Smooth flat drywall ceiling with recessed pot lights",
    kind: "atmosphere",
    caption: "Smooth ceiling, pot lights",
  },
  smoothCeiling4x5: {
    src: "/images/atmosphere/smooth-ceiling-pot-lights-4x5.jpg",
    ...W45,
    alt: "Smooth flat drywall ceiling with recessed pot lights",
    kind: "atmosphere",
    caption: "Smooth ceiling, pot lights",
  },
  bathroom16x9: {
    src: "/images/atmosphere/bathroom-tile-shower-16x9.jpg",
    ...W16,
    alt: "Modern bathroom with a large-format tile shower and a floating vanity",
    kind: "atmosphere",
    caption: "Large-format tile shower",
  },
  bathroom4x5: {
    src: "/images/atmosphere/bathroom-tile-shower-4x5.jpg",
    ...W45,
    alt: "Modern bathroom with a large-format tile shower and a floating vanity",
    kind: "atmosphere",
    caption: "Large-format tile shower",
  },
  kitchen16x9: {
    src: "/images/atmosphere/kitchen-shaker-cabinets-16x9.jpg",
    ...W16,
    alt: "Updated kitchen with painted shaker cabinets and a white tile backsplash",
    kind: "atmosphere",
    caption: "Painted shaker cabinets, tile backsplash",
  },
  kitchen4x5: {
    src: "/images/atmosphere/kitchen-shaker-cabinets-4x5.jpg",
    ...W45,
    alt: "Updated kitchen with painted shaker cabinets and a white tile backsplash",
    kind: "atmosphere",
    caption: "Painted shaker cabinets, tile backsplash",
  },

  /* Wall stages from the hero sequence stills (atmosphere): bare board → paint-ready */
  wallStage1: {
    src: "/images/atmosphere/wall-stage-1-16x9.jpg",
    ...W16,
    alt: "Freshly hung drywall with screw heads and board seams under a low work light",
    kind: "atmosphere",
    caption: "Board hung, screws on a grid",
  },
  wallStage2: {
    src: "/images/atmosphere/wall-stage-2-16x9.jpg",
    ...W16,
    alt: "Drywall seams covered with paper tape bedded in joint compound",
    kind: "atmosphere",
    caption: "Joints taped",
  },
  wallStage3: {
    src: "/images/atmosphere/wall-stage-3-16x9.jpg",
    ...W16,
    alt: "Drywall joints feathered wide with three coats of joint compound",
    kind: "atmosphere",
    caption: "Three coats, feathered wide",
  },
  wallStage4: {
    src: "/images/atmosphere/wall-stage-4-16x9.jpg",
    ...W16,
    alt: "Fully sanded drywall with an even matte compound surface",
    kind: "atmosphere",
    caption: "Sanded smooth",
  },
  wallStage5: {
    src: "/images/atmosphere/wall-stage-5-16x9.jpg",
    ...W16,
    alt: "Flawless painted wall under a low raking work light",
    kind: "atmosphere",
    caption: "Paint-ready, smooth under raking light",
  },
  wallStage1Tall: {
    src: "/images/atmosphere/wall-stage-1-4x5.jpg",
    ...W45,
    alt: "Freshly hung drywall with screw heads and board seams under a low work light",
    kind: "atmosphere",
    caption: "Board hung, screws on a grid",
  },
  wallStage3Tall: {
    src: "/images/atmosphere/wall-stage-3-4x5.jpg",
    ...W45,
    alt: "Drywall joints feathered wide with three coats of joint compound",
    kind: "atmosphere",
    caption: "Three coats, feathered wide",
  },
  wallStage5Tall: {
    src: "/images/atmosphere/wall-stage-5-4x5.jpg",
    ...W45,
    alt: "Flawless painted wall under a low raking work light",
    kind: "atmosphere",
    caption: "Paint-ready, smooth under raking light",
  },

  /* Basement "What we build" tiles (concept) */
  tileRecRoom: {
    src: "/images/basement-tiles/rec-room.jpg",
    ...W45,
    alt: "Finished basement family room with a sofa, pot lights and vinyl plank floor (concept image)",
    kind: "concept",
  },
  tileHomeOffice: {
    src: "/images/basement-tiles/home-office.jpg",
    ...W45,
    alt: "Quiet, bright basement home office with a desk under a small window (concept image)",
    kind: "concept",
  },
  tileGuestSuite: {
    src: "/images/basement-tiles/guest-suite.jpg",
    ...W45,
    alt: "Basement guest bedroom with an egress window (concept image)",
    kind: "concept",
  },
  tileGymMedia: {
    src: "/images/basement-tiles/gym-media-room.jpg",
    ...W45,
    alt: "Basement home gym and media room with sound-dampened walls (concept image)",
    kind: "concept",
  },
  tileBathroomWetBar: {
    src: "/images/basement-tiles/bathroom-wet-bar.jpg",
    ...W45,
    alt: "Basement wet bar with cabinets and a counter (concept image)",
    kind: "concept",
  },
  tileRefresh: {
    src: "/images/basement-tiles/basement-refresh.jpg",
    ...W45,
    alt: "Refreshed basement family room with new smooth walls and ceiling (concept image)",
    kind: "concept",
  },

  /* Demo samples (rendered only in demo mode, always badged) */
  sampleHoleBefore: {
    src: "/images/samples/drywall-hole-repair-before.jpg",
    ...W43,
    alt: "Sample image: hole in a painted drywall wall, before repair",
    kind: "sample",
  },
  sampleHoleAfter: {
    src: "/images/samples/drywall-hole-repair-after.jpg",
    ...W43,
    alt: "Sample image: the same wall after an invisible drywall repair",
    kind: "sample",
  },
  sampleCeilingBefore: {
    src: "/images/samples/water-damaged-ceiling-before.jpg",
    ...W43,
    alt: "Sample image: water-stained, sagging drywall ceiling, before repair",
    kind: "sample",
  },
  sampleCeilingAfter: {
    src: "/images/samples/water-damaged-ceiling-after.jpg",
    ...W43,
    alt: "Sample image: the same ceiling repaired smooth",
    kind: "sample",
  },
  samplePopcornBefore: {
    src: "/images/samples/popcorn-ceiling-before.jpg",
    ...W43,
    alt: "Sample image: dated popcorn ceiling, before removal",
    kind: "sample",
  },
  samplePopcornAfter: {
    src: "/images/samples/popcorn-ceiling-after.jpg",
    ...W43,
    alt: "Sample image: the same ceiling skimmed smooth with pot lights",
    kind: "sample",
  },
  sampleBasementBefore: {
    src: "/images/samples/basement-finish-before.jpg",
    ...W43,
    alt: "Sample image: unfinished basement corner, before",
    kind: "sample",
  },
  sampleBasementAfter: {
    src: "/images/samples/basement-finish-after.jpg",
    ...W43,
    alt: "Sample image: the same basement corner finished",
    kind: "sample",
  },
  sampleLevel5Hallway: {
    src: "/images/samples/level-5-hallway.jpg",
    ...W43,
    alt: "Sample image: long hallway wall with a smooth Level 5 finish under side light",
    kind: "sample",
  },
  sampleBasementTaping: {
    src: "/images/samples/basement-drywall-taping.jpg",
    ...W43,
    alt: "Sample image: basement walls taped and mudded mid-job",
    kind: "sample",
  },
} as const satisfies Record<string, MediaAsset>;

export type MediaKey = keyof typeof media;

/** Frame-sequence folders (manifest.json inside each, written by the asset pipeline). */
export const sequences = {
  heroDesktop: "/sequences/hero-desktop",
  heroMobile: "/sequences/hero-mobile",
  basementDesktop: "/sequences/basement-desktop",
  basementMobile: "/sequences/basement-mobile",
} as const;

export type SequenceManifest = {
  frames: number;
  width: number;
  height: number;
  ext: string;
  pad: number;
  /** 0-based frame index where each stage reads most clearly */
  stages: number[];
  bytes: number;
};

export const video = {
  drywallLoop: {
    mp4: "/video/drywall-raking-loop.mp4",
    webm: "/video/drywall-raking-loop.webm",
    poster: "/images/hero/drywall-loop-poster.jpg",
    width: 1280,
    height: 720,
  },
} as const;
