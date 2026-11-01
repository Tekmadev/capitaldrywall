/**
 * Sitewide copy (CAPITAL_COPY.md → GLOBAL, plus sections shared by several pages).
 * Verbatim from the copy deck. Placeholders resolve from site.config.
 */
import { pages, quoteHref } from "../services";
import { ownerSignature, site } from "../site.config";

export const brand = {
  name: site.name,
  wordmark: { top: "CAPITAL", bottom: "DRYWALL & RENOVATION" },
  tagline: site.tagline,
};

export const ctas = {
  primary: "Get a Free Quote",
  call: `Call ${site.phone.display}`,
  /** Short label for tight spaces (mobile action bar) */
  callShort: "Call",
};

export const nav = [
  { label: "Drywall", href: pages.drywall, index: "01" },
  { label: "Basements", href: pages.basement, index: "02" },
  { label: "Renovations", href: pages.renovations, index: "03" },
] as const;

/** Trust strip (copy deck: "Fully insured [CONFIRM]" hides when site.insured is false). */
export const trustItems: string[] = [
  "Free on-site quotes",
  site.insured ? "Fully insured" : null,
  "Dust-controlled work",
  "Written quotes, no surprises",
  "Serving Ottawa & area",
].filter((item): item is string => Boolean(item));

export const mobileActionBar = { call: "Call", quote: "Get a Free Quote" };

export const footer = {
  blurb:
    "Ottawa drywall and basement renovation contractor. Installation, repairs, Level 5 finishing, popcorn ceiling removal and complete basement finishing, done clean and left paint-ready.",
  contact: {
    phone: site.phone.display,
    email: site.email,
    hours: site.hours,
    location: `${site.address.locality}, ${site.address.regionName}`,
  },
  legal: [{ label: "Privacy Policy", href: pages.privacy }],
  copyright: (year: number) => `© ${year} ${site.name}. All rights reserved.`,
  /** flag `siteCredit`. url stays null until confirmed (LAUNCH_CHECKLIST.md) */
  siteCredit: { label: "Website by Tekmadev", url: null as string | null },
  sisterBrandLine: site.sisterBrand.show
    ? `In the summer you'll find us building patios and walkways as ${site.sisterBrand.name}.`
    : null,
};

/* ── Sections shared across pages ─────────────────────────────── */

export const processSection = {
  eyebrow: "The process",
  title: "How a job runs.",
  steps: [
    {
      title: "Tell us about it.",
      body: "Fill out the quote form or call. Photos help us price faster.",
    },
    {
      title: "Free site visit.",
      body: "We measure, check for moisture and talk through options. No obligation.",
    },
    {
      title: "Written quote.",
      body: "A clear scope, price and schedule, so you know exactly what you're paying for.",
    },
    {
      title: "The work.",
      body: "Protected floors, contained dust, daily cleanup and updates as we go.",
    },
    {
      title: "Walkthrough.",
      body: "We check every surface under raking light with you before we call it done.",
    },
  ],
};

export const pricingSection = {
  eyebrow: "Pricing",
  title: "Honest starting prices.",
  intro:
    "Every home is different, so your final price comes from a site visit. These are typical starting points for Ottawa jobs.",
  cta: { label: "Get your exact price", href: pages.quote },
};

export const gallerySection = {
  eyebrow: "Recent work",
  title: "Recent work around Ottawa.",
};

export const serviceAreaSection = {
  eyebrow: "Service area",
  title: "Serving Ottawa and the communities around it.",
  body: "We work across the City of Ottawa, from Kanata and Stittsville in the west to Orléans in the east, and south through Barrhaven, Riverside South and Manotick. Not sure we cover your street? Ask us.",
};

/** Owner note: shown while `reviews` is off (home, free quote). [CONFIRM] */
export const ownerNote = {
  eyebrow: "A note from the owner",
  title: "My name goes on every wall.",
  body: "I started Capital Drywall & Renovation because good drywall shouldn't be hard to find. Every quote comes from me, every crew follows the same standard, and I check the finish myself before we call a job done. If something isn't right, you call me directly.",
  sisterLine: footer.sisterBrandLine,
  signature: ownerSignature(),
};

/** Reviews (flag `reviews`, off at launch). */
export const reviewsSection = {
  title: "What Ottawa homeowners say.",
  link: "Read our reviews on Google →",
};

export const faqSection = {
  eyebrow: "Questions",
  title: "Frequently asked questions.",
};

/** Home final CTA (pages override title/body with their own copy). */
export const finalCta = {
  title: "Let's get your walls right.",
  body: "Tell us what you're working on. Free quote, no pressure, and a straight answer on price.",
  primary: { label: ctas.primary, href: quoteHref() },
};

/** "What happens next" (free-quote sidebar and thank-you page). */
export const nextSteps = [
  "We review your details and photos.",
  "We call to book a free site visit.",
  "You get a written quote. No pressure.",
];
