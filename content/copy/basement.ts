/** BASEMENT `/basement-renovations-ottawa`: verbatim from CAPITAL_COPY.md → BASEMENT. */
import { media, type MediaAsset } from "../media";
import { pages, quoteHref } from "../services";
import { site } from "../site.config";
import { ctas } from "./global";

export const basementHero = {
  h1: "Basement Renovations & Finishing in Ottawa",
  display: "The room downstairs, finally finished.",
  sub: "We turn cold, unused basements into warm, bright living space: rec rooms, home offices, guest suites and gyms. Built properly from the concrete up.",
  primaryCta: { label: ctas.primary, href: quoteHref("basement") },
  /** Scrolls to the estimator section */
  estimateCta: { label: "Estimate my basement", href: "#estimator" },
  stages: ["Plan & permit", "Frame & insulate", "Drywall & ceilings", "Floors, trim & paint"],
  cornerLabel: "Concept visualization",
};

/** Answer-first intro (brief §11: keep intact). */
export const basementIntro =
  "Capital Drywall & Renovation finishes and renovates basements across Ottawa. A typical project covers planning and permits, framing, insulation and vapour barrier, subfloor, electrical and plumbing by licensed trades, drywall and ceilings, flooring, trim, doors and paint. Drywall is our specialty, so the finish is where our basements stand apart.";

export const whatWeBuild: {
  title: string;
  tiles: { title: string; text: string; image: MediaAsset }[];
} = {
  title: "What we build.",
  tiles: [
    {
      title: "Rec & family rooms",
      text: "The everyday room: movie nights, kids' play space, room to spread out.",
      image: media.tileRecRoom,
    },
    {
      title: "Home offices",
      text: "Quiet, bright and away from the noise upstairs.",
      image: media.tileHomeOffice,
    },
    {
      title: "Guest & in-law suites",
      text: "A bedroom, a bathroom and privacy for the people who stay.",
      image: media.tileGuestSuite,
    },
    {
      title: "Gyms & media rooms",
      text: "Sound-dampened walls and ceilings where it counts.",
      image: media.tileGymMedia,
    },
    {
      title: "Bathrooms & wet bars",
      text: "Added convenience that buyers notice later.",
      image: media.tileBathroomWetBar,
    },
    {
      title: "Basement refreshes",
      text: "Old panelling and dated ceilings brought up to today's standard.",
      image: media.tileRefresh,
    },
  ],
};

/** "What's included" numbered spec sheet. Item 02 hides when permits aren't handled [CONFIRM]. */
export const whatsIncluded = {
  title: "What's included in a full basement finish.",
  items: [
    "Design & layout planning",
    site.permitsHandled ? "Building permit & inspections" : null,
    "Framing, square and plumb",
    "Insulation & sealed vapour barrier",
    "Insulated subfloor",
    "Electrical & pot lights by a licensed electrician",
    "Plumbing rough-in by a licensed plumber (if adding a bathroom)",
    "Drywall & ceilings, finished to our standard",
    "Flooring",
    "Trim, doors & paint",
    "Final walkthrough under raking light",
  ].filter((item): item is string => item !== null),
};

export const builtForOttawa = {
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
  ],
};

export const estimatorSection = {
  id: "estimator",
  eyebrow: "Budget estimator",
  title: "What will my basement cost?",
  intro: "Get a realistic range in 20 seconds. Your exact price comes from a free site visit.",
};

/** [CONFIRM] */
export const timeline = {
  title: "How long does a basement take?",
  answer:
    "Most open-concept basements take about four to six weeks of work once the permit is issued. Adding a bathroom or bedroom typically brings it to six to eight weeks.",
  rail: [
    { when: "Before we start", what: "Design, written quote, permit" },
    { when: "Week 1", what: "Framing, insulation, rough-ins" },
    { when: "Week 2", what: "Inspections, drywall hung" },
    { when: "Week 3", what: "Taping, mudding, sanding" },
    { when: "Week 4", what: "Ceilings, prime & paint" },
    { when: "Week 5", what: "Flooring, trim, doors" },
    { when: "Week 6", what: "Final walkthrough" },
  ],
};

export const basementFinalCta = {
  title: "Ready to use your whole house?",
  body: "Book a free site visit. We'll measure, check for moisture and talk through ideas, with no obligation.",
  service: "basement" as const,
  primary: { label: ctas.primary, href: quoteHref("basement") },
};

export const basementBreadcrumb = [
  { name: "Home", href: pages.home },
  { name: "Basement renovations", href: pages.basement },
];
