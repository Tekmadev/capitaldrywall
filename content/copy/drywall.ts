/** DRYWALL `/drywall-ottawa`: verbatim from CAPITAL_COPY.md → DRYWALL. */
import { pages, quoteHref, type ServiceId } from "../services";
import { feature, site } from "../site.config";
import { ctas } from "./global";

export const drywallHero = {
  h1: "Drywall Contractor in Ottawa",
  display: "Hung straight. Taped tight. Finished smooth.",
  sub: "Drywall installation, repairs, taping and mudding, Level 5 finishing and popcorn ceiling removal for Ottawa homes. Dust-controlled and left paint-ready.",
  primaryCta: { label: ctas.primary, href: quoteHref("drywall") },
  call: { label: ctas.call, href: `tel:${site.phone.e164}` },
};

/** Answer-first intro (brief §11: keep intact). */
export const drywallIntro =
  "Capital Drywall & Renovation is a drywall contractor serving Ottawa and nearby communities. We install new drywall, repair damaged walls and ceilings, tape and mud joints with three coats of compound, skim coat to a Level 5 finish and remove popcorn ceilings. Every job is dust-controlled and finished ready for paint.";

export type DrywallSubService = {
  /** Anchor id (matches content/services.ts hrefs) */
  id: string;
  service: ServiceId;
  chip: string;
  label: string;
  title: string;
  body: string;
  bullets: string[];
  cta: { label: string; href: string };
  confirm?: boolean;
};

const subServices: (DrywallSubService | null)[] = [
  {
    id: "drywall-installation",
    service: "drywall-installation",
    chip: "Installation",
    label: "INSTALL · BASEMENTS · ADDITIONS · CEILINGS",
    title: "Drywall installation",
    body: 'New drywall for basements, additions, renovations and new walls. We match the board to the room: moisture-resistant board for bathrooms and basements, 5/8" Type X where fire separation is required, and sound-dampening options for bedrooms and media rooms. Screws, not nails, and layouts planned to keep seams to a minimum.',
    bullets: [
      "Basements & additions",
      "Walls & ceilings",
      "Partition walls",
      "Moisture-resistant & Type X fire-rated board",
      "Sound insulation",
    ],
    cta: { label: "Quote my install →", href: quoteHref("drywall-installation") },
  },
  {
    id: "drywall-repair",
    service: "drywall-repair",
    chip: "Repair",
    label: "HOLES · CRACKS · NAIL POPS · WATER DAMAGE",
    title: "Drywall repair",
    body: "Holes from doorknobs, movers and electricians. Cracks from a settling house. Nail pops from seasonal humidity swings. Ceilings stained or sagging from a leak. We cut out what's damaged, patch it properly, feather the edges and match the surrounding texture so the repair disappears.",
    bullets: [
      "Holes & dents",
      "Cracks & nail pops",
      "Water-damaged walls & ceilings",
      "Ceiling repairs (flat or stipple match)",
      "Holes left by electricians & plumbers",
    ],
    cta: { label: "Send a photo of the damage →", href: quoteHref("drywall-repair") },
  },
  {
    id: "taping-mudding",
    service: "taping-mudding",
    chip: "Taping & mudding",
    label: "TAPE · 3 COATS · SAND · PRIME-READY",
    title: "Taping, mudding & sanding",
    body: "This is the part that decides whether a wall looks finished or looks patched. We tape every joint, apply three coats of compound feathered wide, and sand with dust extraction until the surface is smooth, even and ready for primer. Hired someone else to hang the board? We tape and finish it too.",
    bullets: [
      "Paper & mesh tape",
      "Three-coat finish",
      "Corner bead, inside & outside corners",
      "Dust-extraction sanding",
      "Finishing for board hung by others",
    ],
    cta: { label: "Get a taping quote →", href: quoteHref("taping-mudding") },
  },
  {
    id: "skim-coating-level-5",
    service: "skim-coat-level-5",
    chip: "Skim coat & Level 5",
    label: "SKIM COAT · LEVEL 5 · SMOOTH WALLS & CEILINGS",
    title: "Skim coating & Level 5 finishes",
    body: "For walls and ceilings that need to look right under any light: big windows, glossy paint, long hallways and open-concept rooms. A skim coat over the entire surface hides seams, old texture, uneven patches and past repairs, leaving one smooth, uniform finish.",
    bullets: [
      "Full skim coats",
      "Level 5 finishing",
      "Smoothing textured walls",
      "Smooth ceiling finishes",
      "Prep for glossy & dark paints",
    ],
    cta: { label: "Ask about Level 5 →", href: quoteHref("skim-coat-level-5") },
  },
  feature("popcornRemoval")
    ? {
        id: "popcorn-ceiling-removal",
        service: "popcorn-removal",
        chip: "Popcorn removal",
        label: "CONTAIN · REMOVE · REPAIR · SKIM",
        title: "Popcorn ceiling removal",
        body: "Popcorn and stipple ceilings date a room, collect dust and make repairs obvious. We contain the room, remove the texture, repair the drywall underneath and skim coat the ceiling flat and smooth, ready for paint. For homes built before 1990, the ceiling is tested for asbestos before any work begins.",
        bullets: [
          "Full containment",
          "Texture removal",
          "Drywall & tape repairs",
          "Smooth skim coat",
          "Ready for primer",
        ],
        cta: { label: "Price my ceiling →", href: quoteHref("popcorn-removal") },
        confirm: true,
      }
    : null,
];

/** The five sub-service sections (popcorn hidden when its flag is off). */
export const drywallSubServices = subServices.filter((s): s is DrywallSubService => s !== null);

export const finishLevels = {
  eyebrow: "Drywall finish levels",
  title: 'What does "Level 5" actually mean?',
  answer:
    "Drywall finishes are graded from Level 0 to Level 5 under an industry standard (GA-214). Most homes get a Level 4 finish. Level 5 adds a skim coat over the entire surface, so walls look uniform under strong side light, glossy paint or big windows.",
  columns: ["Level", "What it is", "Where it's used"] as const,
  levels: [
    { level: 0, what: "Board hung, no taping or finishing", where: "Temporary construction" },
    { level: 1, what: "Tape set in compound at joints", where: "Attics, above ceilings, hidden areas" },
    { level: 2, what: "Tape plus one coat over joints and screws", where: "Garages, behind tile" },
    { level: 3, what: "Two coats over joints and screws", where: "Walls getting heavy texture" },
    { level: 4, what: "Three coats, sanded smooth", where: "Most homes with flat or matte paint" },
    {
      level: 5,
      what: "Level 4 plus a skim coat over the whole surface",
      where: "Glossy paint, strong side light, premium finishes",
    },
  ],
  /** [CONFIRM] */
  ourStandard:
    "We finish to Level 4 as standard and recommend Level 5 wherever the lighting or paint calls for it.",
};

export const drywallPricingCopy = {
  eyebrow: "Pricing",
  title: "Honest starting prices.",
};

export const drywallFinalCta = {
  title: "Got a wall that needs fixing?",
  body: "Send a photo and we'll tell you what it takes.",
  service: "drywall" as const,
  primary: { label: ctas.primary, href: quoteHref("drywall") },
};

export const drywallBreadcrumb = [
  { name: "Home", href: pages.home },
  { name: "Drywall", href: pages.drywall },
];
