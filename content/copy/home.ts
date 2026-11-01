/** HOME `/`: verbatim from CAPITAL_COPY.md → HOME. CONFIRM lines resolve from site.config. */
import { pages, quoteHref } from "../services";
import { site } from "../site.config";
import { ctas } from "./global";

export const homeHero = {
  /** H1 (small, spec-label style) */
  h1: "Drywall & Basement Renovations in Ottawa",
  /** Display line (<p>, huge) */
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

export const primaryServices = {
  index: "01",
  eyebrow: "What we do best",
  title: "Two things, done properly.",
  intro:
    "Most contractors do a bit of everything. We built Capital around the two jobs where the finish matters most.",
  cards: [
    {
      id: "drywall",
      label: "DRYWALL · INSTALL · REPAIR · FINISH",
      title: "Drywall services",
      text: "New drywall, repairs, taping and mudding, skim coating to Level 5, and popcorn ceiling removal. One patched hole or a whole house.",
      link: { label: "Explore drywall services →", href: pages.drywall },
    },
    {
      id: "basement",
      label: "BASEMENTS · FRAME · INSULATE · FINISH",
      title: "Basement renovations",
      text: "Framing, insulation, drywall, ceilings, flooring and paint. A cold, unused basement turned into the room your family actually uses.",
      link: { label: "Explore basement renovations →", href: pages.basement },
    },
  ],
};

export const rakingTest = {
  index: "02",
  eyebrow: "The raking-light test",
  title: "Every wall looks fine until the light hits it sideways.",
  body: "Drywall pros check their work by holding a light flat against the wall. That low-angle light exposes every ridge, seam and sanding mark a rushed job leaves behind. It's how we inspect every wall before we call it finished.",
  instructionDesktop: "Move your cursor across both walls.",
  instructionTouch: "Drag across both walls.",
  labels: ["Rushed finish", "Capital finish"] as [string, string],
  caption: "Same wall. Same paint. Different finish.",
};

export const basementTeaser = {
  index: "03",
  eyebrow: "Basement finishing",
  title: "From bare concrete to the best room in the house.",
  body: "Ottawa basements spend half the year cold and damp. We build them warm and dry from the floor up: insulated walls, a sealed vapour barrier, a subfloor between you and the concrete, then drywall, lighting, trim and paint.",
  stages: ["Plan & permit", "Frame & insulate", "Drywall & ceilings", "Floors, trim & paint"],
  cornerLabel: "Concept visualization",
  link: { label: "See basement renovations →", href: pages.basement },
};

type PromiseItem = { title: string; body: string; confirm?: boolean };

/** "What you can count on": CONFIRM promises hide (or drop their claim) when config says so. */
export const promises = {
  index: "04",
  eyebrow: "How we work",
  title: "What you can count on.",
  items: [
    {
      title: "Fast, honest quotes.",
      body: `Send photos and get a ballpark ${site.responsePromise}. After a free site visit, you get a written quote with the scope, price and schedule spelled out. No surprise charges.`,
    },
    {
      title: "Dust under control.",
      body: "Plastic containment, floor protection and dust-extraction sanding. Your home stays livable while we work, and the work area is cleaned every day.",
    },
    site.paintReadyPromise
      ? {
          title: "The Paint-Ready Promise.",
          body: "After your primer goes on, we come back and touch up anything the light catches, at no charge. Paint-ready means paint-ready.",
          confirm: true,
        }
      : null,
    site.warranty || site.insured
      ? {
          title: "Backed in writing.",
          body: [
            "Every job comes with",
            [site.warranty ? `a ${site.warranty.label}` : null, site.insured ? "a fully insured crew" : null]
              .filter(Boolean)
              .join(" and ") + ".",
          ].join(" "),
          confirm: true,
        }
      : null,
    {
      title: "One contractor, start to finish.",
      body: "Basement plumbing and electrical are done by licensed trades, scheduled by us. You deal with one point of contact the whole way.",
      confirm: true,
    },
  ].filter((p): p is PromiseItem => p !== null),
};

export const secondaryServices = {
  index: "05",
  eyebrow: "Also on the list",
  title: "The rest of the house, finished to the same standard.",
  items: [
    {
      id: "interior-painting",
      title: "Interior painting",
      text: "Walls, ceilings, trim and doors, with the filling, sanding and priming that make paint last.",
      href: `${pages.renovations}#interior-painting`,
    },
    {
      id: "bathroom-renovation",
      title: "Bathroom renovations",
      text: "Showers, vanities and tile, built on moisture-resistant board and finished cleanly.",
      href: `${pages.renovations}#bathroom-renovations`,
    },
    {
      id: "kitchen-renovation",
      title: "Kitchen renovations",
      text: "Cabinet upgrades, backsplash and paint that refresh a kitchen without a full gut.",
      href: `${pages.renovations}#kitchen-renovations`,
    },
  ],
  link: { label: "All renovation services →", href: pages.renovations },
};

/** Home section numbering for the shared sections (copy deck eyebrows). */
export const homeSectionIndex = {
  process: "06",
  pricing: "07",
  gallery: "08",
  serviceArea: "09",
  faq: "10",
};

export const homeFinalCta = {
  title: "Let's get your walls right.",
  body: "Tell us what you're working on. Free quote, no pressure, and a straight answer on price.",
  primary: { label: ctas.primary, href: quoteHref() },
};
