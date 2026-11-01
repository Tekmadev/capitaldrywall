/** RENOVATIONS `/renovations-ottawa`: verbatim from CAPITAL_COPY.md → RENOVATIONS. */
import { media, type MediaAsset } from "../media";
import { pages, quoteHref, type ServiceId } from "../services";
import { site } from "../site.config";
import { ctas } from "./global";

export const renovationsHero = {
  h1: "Painting, Bathroom & Kitchen Renovations in Ottawa",
  display: "Same standard, every room.",
  sub: "The clean prep and careful finishing we're known for in drywall, applied to the rest of your home.",
  primaryCta: { label: ctas.primary, href: quoteHref() },
  call: { label: ctas.call, href: `tel:${site.phone.e164}` },
};

/** Answer-first intro (brief §11: keep intact). */
export const renovationsIntro =
  "Alongside drywall and basements, Capital Drywall & Renovation offers interior painting, bathroom renovations and kitchen renovations in Ottawa. Because we handle the walls underneath, every coat of paint, tile and cabinet goes onto a flat, properly finished surface.";

export type RenovationSection = {
  /** Anchor id: #interior-painting, #bathroom-renovations, #kitchen-renovations */
  id: string;
  service: ServiceId;
  title: string;
  body: string;
  bullets: string[];
  cta: { label: string; href: string };
  image: MediaAsset;
  imageTall: MediaAsset;
  confirm?: boolean;
};

export const renovationSections: RenovationSection[] = [
  {
    id: "interior-painting",
    service: "interior-painting",
    title: "Interior painting",
    body: "Walls, ceilings, trim and doors. Good paint jobs are mostly prep: we fill, sand and prime before a drop of colour goes on, cut clean lines, and protect your floors and furniture throughout. Freshly drywalled? We prime and paint right after, so one crew takes the room from bare board to finished.",
    bullets: [
      "Walls & ceilings",
      "Trim, doors & baseboards",
      "Primer & surface prep",
      "New drywall painting",
      "Clean, protected work areas",
    ],
    cta: { label: "Quote my painting →", href: quoteHref("painting") },
    image: media.paintRoller16x9,
    imageTall: media.paintRoller4x5,
  },
  {
    id: "bathroom-renovations",
    service: "bathroom-renovation",
    title: "Bathroom renovations",
    body: "Shower and tub surrounds, vanities, tile floors and walls. We build on moisture-resistant board with proper waterproofing behind the tile, make sure the room is ventilated, and finish every edge cleanly. Plumbing is handled by licensed plumbers.",
    bullets: [
      "Shower & tub upgrades",
      "Vanity & fixture replacement",
      "Tile floors & walls",
      "Waterproofing behind tile",
      "Paint & finishing",
    ],
    cta: { label: "Quote my bathroom →", href: quoteHref("bathroom") },
    image: media.bathroom16x9,
    imageTall: media.bathroom4x5,
    confirm: true,
  },
  {
    id: "kitchen-renovations",
    service: "kitchen-renovation",
    title: "Kitchen renovations",
    body: "Cabinet upgrades, backsplash installation, painting and finishing. A kitchen refresh that changes how the room looks and feels, without the cost and disruption of a full gut. Bigger plans? Tell us and we'll be straight about what we can take on.",
    bullets: [
      "Cabinet upgrades & refinishing",
      "Backsplash installation",
      "Wall & ceiling repairs",
      "Painting",
      "Trim & finishing",
    ],
    cta: { label: "Quote my kitchen →", href: quoteHref("kitchen") },
    image: media.kitchen16x9,
    imageTall: media.kitchen4x5,
  },
];

export const whyDrywallSpecialist = {
  title: "Why hire a drywall specialist for a renovation?",
  body: "Paint, tile and cabinets all sit on walls. When the walls underneath are flat, square and properly finished, everything installed on them looks better and lasts longer. That's where we start every renovation.",
};

export const renovationsFinalCta = {
  title: "One crew for the whole room.",
  body: "Tell us what you'd like to change. Free quote, no pressure.",
  primary: { label: ctas.primary, href: quoteHref() },
};

export const renovationsBreadcrumb = [
  { name: "Home", href: pages.home },
  { name: "Renovations", href: pages.renovations },
];
