/**
 * RENOVATIONS `/renovations-ottawa`: bathrooms and kitchens promoted to the Renovations pillar
 * (with basements), interior painting kept as a service sheet.
 *
 * DRAFT COPY, pending owner approval (2026-11-17): the bathroom/kitchen hero, intro, room sections
 * and scopes are new (the copy deck only covered upgrades). Written in the deck's voice from facts
 * already on the site: full remodels and refreshes both offered (owner, 2026-11-17), plumbing and
 * electrical by licensed trades, moisture-resistant board and waterproofing behind tile. No new
 * prices or durations. Interior painting, "Why hire a drywall specialist" and the final CTA are
 * verbatim from CAPITAL_COPY.md → RENOVATIONS.
 */
import { media, type MediaAsset } from "../media";
import { pages, quoteHref, type ServiceId } from "../services";
import { site } from "../site.config";
import { ctas } from "./global";

export const renovationsHero = {
  h1: "Bathroom & Kitchen Renovations in Ottawa",
  display: "Same standard, every room.",
  sub: "Full bathroom and kitchen remodels or a focused refresh, built with the clean prep and careful finishing we're known for in drywall.",
  primaryCta: { label: ctas.primary, href: quoteHref() },
  call: { label: ctas.call, href: `tel:${site.phone.e164}` },
};

/** Answer-first intro (brief §11: one plain paragraph that answers "what do you do here?"). */
export const renovationsIntro =
  "Capital Drywall & Renovation renovates bathrooms and kitchens across Ottawa, from full remodels down to the studs to refreshes that keep your layout, and offers interior painting. Because we handle the walls underneath, every tile, cabinet and coat of paint goes onto a flat, properly finished surface.";

/** A room the page builds as a scroll transformation (same scene as the basement). */
export type RoomSection = {
  /** Anchor id: #bathroom-renovations, #kitchen-renovations */
  id: string;
  service: ServiceId;
  room: "bathroom" | "kitchen";
  /** Short name for the sheet index and eyebrow */
  title: string;
  /** Section heading */
  heading: string;
  body: string;
  /** The four stage labels on the step rail (stage 1 is the room as it is today) */
  stages: string[];
  /** Two scopes: the whole job, and the refresh that keeps the layout */
  scopes: { id: "full" | "refresh"; title: string; lede: string; items: string[] }[];
  /** A short note under the scopes (trades, permits). Must state a fact. */
  note: string;
  cta: { label: string; href: string };
  /** Sheet-index image (finished room, concept) */
  imageTall: MediaAsset;
  confirm?: boolean;
};

export const roomSections: RoomSection[] = [
  {
    id: "bathroom-renovations",
    service: "bathroom-renovation",
    room: "bathroom",
    title: "Bathroom renovations",
    heading: "Built dry behind the tile.",
    body: "A bathroom only looks good for as long as the water stays where it belongs. We strip back to what's sound, build on moisture-resistant board with proper waterproofing behind every tiled wall, make sure the room is ventilated, then tile, fit the vanity and fixtures and finish every edge cleanly.",
    stages: ["Plan & design", "Strip & rough-in", "Board & waterproof", "Tile, fixtures & paint"],
    scopes: [
      {
        id: "full",
        title: "Full remodel",
        lede: "Down to the studs and rebuilt.",
        items: [
          "Tear-out & disposal",
          "Plumbing & electrical by licensed trades",
          "Moisture-resistant board & waterproofing",
          "Tub, shower & fixture installation",
          "Tile floors & walls",
          "Vanity, mirror, lighting & fan",
          "Paint, trim & finishing",
        ],
      },
      {
        id: "refresh",
        title: "Refresh",
        lede: "Same layout, new finishes.",
        items: [
          "Vanity & fixture replacement",
          "Tub or shower surround re-tile",
          "New floor tile",
          "Wall & ceiling repairs",
          "Paint & finishing",
        ],
      },
    ],
    note: "Plumbing and electrical are done by licensed trades, scheduled by us. One point of contact the whole way.",
    cta: { label: "Quote my bathroom →", href: quoteHref("bathroom") },
    imageTall: media.bathroomStage4Mobile,
    confirm: true,
  },
  {
    id: "kitchen-renovations",
    service: "kitchen-renovation",
    room: "kitchen",
    title: "Kitchen renovations",
    heading: "A new kitchen, or a better one.",
    body: "A full renovation with new cabinets, counters, backsplash and floors, or a refresh that keeps your layout and changes how the room looks and feels. Either way it starts with flat, square walls, so cabinets hang true, the backsplash lines up and the paint looks right under every light.",
    stages: ["Plan & design", "Tear-out & rough-in", "Cabinets & counters", "Backsplash, paint & trim"],
    scopes: [
      {
        id: "full",
        title: "Full renovation",
        lede: "Torn out and rebuilt.",
        items: [
          "Tear-out & disposal",
          "Plumbing & electrical by licensed trades",
          "Wall & ceiling repairs, pot lights",
          "Cabinet & countertop installation",
          "Flooring",
          "Backsplash installation",
          "Paint, trim & finishing",
        ],
      },
      {
        id: "refresh",
        title: "Refresh",
        lede: "Same layout, new look.",
        items: [
          "Cabinet upgrades & refinishing",
          "Backsplash installation",
          "Wall & ceiling repairs",
          "Painting",
          "Trim & finishing",
        ],
      },
    ],
    note: "Plumbing and electrical are done by licensed trades, scheduled by us. One point of contact the whole way.",
    cta: { label: "Quote my kitchen →", href: quoteHref("kitchen") },
    imageTall: media.kitchenStage4Mobile,
    confirm: true,
  },
];

export type RenovationSection = {
  /** Anchor id: #interior-painting */
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

/** The service sheets after the two rooms (verbatim from the copy deck). */
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
];

/** Everything the hero's sheet index lists, in page order. */
export const renovationIndex = [
  ...roomSections.map((s) => ({ id: s.id, title: s.title, imageTall: s.imageTall })),
  ...renovationSections.map((s) => ({ id: s.id, title: s.title, imageTall: s.imageTall })),
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
  { name: "Bathroom & kitchen renovations", href: pages.renovations },
];
