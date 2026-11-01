/**
 * ALL business facts + feature flags live here (brief §14).
 *
 * Every `// CONFIRM` value must be confirmed by the owner before launch
 * (see LAUNCH_CHECKLIST.md). A `null` or `false` CONFIRM value hides its UI
 * gracefully: the site never shows a broken or invented claim.
 */

export type SiteMode = "demo" | "production";

export type FeatureFlag =
  | "popcornRemoval"
  | "reviews"
  | "gallery"
  | "estimator"
  | "siteCredit"
  | "call247";

export type SiteConfig = {
  mode: SiteMode;
  name: string;
  legalName: string;
  url: string;
  domain: string;
  tagline: string;
  phone: { display: string; e164: string };
  email: string;
  hours: string;
  /** Machine-readable mirror of `hours` for schema.org */
  openingHours: { days: readonly string[]; opens: string; closes: string };
  responsePromise: string;
  owner: { name: string | null; photo: string | null };
  yearsExperience: number | null;
  insured: boolean;
  wsib: boolean;
  warranty: { years: number; label: string } | null;
  paintReadyPromise: boolean;
  permitsHandled: boolean;
  sisterBrand: { name: string; url: string; show: boolean };
  address: {
    street: string | null;
    postalCode: string | null;
    locality: string;
    region: string;
    regionName: string;
    country: string;
  };
  geo: { latitude: number; longitude: number };
  serviceAreas: readonly string[];
  social: { gbp: string; facebook: string; instagram: string };
  /** Shown on service pages as "Last updated" and mirrored as dateModified */
  lastUpdated: string;
  features: Record<FeatureFlag, boolean>;
};

export const site: SiteConfig = {
  mode: process.env.NEXT_PUBLIC_SITE_MODE === "production" ? "production" : "demo",
  name: "Capital Drywall & Renovation",
  legalName: "Capital Drywall & Renovation", // CONFIRM (incorporated name?)
  url: "https://capitaldrywallrenovations.com",
  domain: "capitaldrywallrenovations.com",
  tagline: "Smooth under any light.",
  phone: { display: "(613) 621-9757", e164: "+16136219757" }, // confirmed by owner
  email: "capitaldrywallandrenovations@gmail.com", // confirmed by owner
  hours: "Mon–Sat, 7 am – 7 pm", // CONFIRM
  openingHours: {
    days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    opens: "07:00",
    closes: "19:00",
  }, // CONFIRM (keep in sync with `hours`)
  responsePromise: "within one business day", // CONFIRM
  owner: { name: null, photo: null }, // CONFIRM; note uses generic wording if null
  yearsExperience: null, // CONFIRM; stat hidden if null
  insured: true, // CONFIRM; badge hidden if false
  wsib: true, // CONFIRM
  warranty: { years: 2, label: "2-year workmanship warranty" }, // CONFIRM; null hides warranty lines
  paintReadyPromise: true, // CONFIRM; post-primer touch-up
  permitsHandled: true, // CONFIRM; basement permit copy switches
  sisterBrand: {
    name: "Stoneworks Interlock",
    url: "https://stoneworksinterlock.com",
    show: false,
  }, // CONFIRM with owner
  address: {
    street: null, // service-area business: no street unless confirmed
    postalCode: null,
    locality: "Ottawa",
    region: "ON",
    regionName: "Ontario",
    country: "CA",
  },
  geo: { latitude: 45.4215, longitude: -75.6972 },
  serviceAreas: [
    "Ottawa (Centretown & Downtown)",
    "The Glebe",
    "Westboro",
    "Vanier",
    "Alta Vista",
    "Kanata",
    "Stittsville",
    "Nepean",
    "Barrhaven",
    "Riverside South",
    "Findlay Creek",
    "Manotick",
    "Greely",
    "Gloucester",
    "Orléans",
    "Cumberland",
  ], // CONFIRM
  social: { gbp: "", facebook: "", instagram: "" },
  lastUpdated: "2026-10-30",
  features: {
    popcornRemoval: true, // CONFIRM; hides section, FAQ, price card, schema offer
    reviews: false, // turn on with real Google reviews
    gallery: true, // demo shows badged samples; production hides samples
    estimator: true,
    siteCredit: true, // footer "Website by Tekmadev"
    call247: false, // reserved slot: "Call 24/7" badge once calls are answered around the clock
  },
};

export const isDemo = site.mode === "demo";

export function feature(flag: FeatureFlag): boolean {
  return site.features[flag];
}

/** First name from a full name, for greetings ("Thanks, Sam."). */
export function firstNameOf(fullName: string): string {
  return fullName.trim().split(/\s+/)[0] ?? "";
}

/** Owner signature: "{{ownerName}}, Owner" or the generic fallback (copy deck). */
export function ownerSignature(): string {
  return site.owner.name
    ? `${site.owner.name}, Owner`
    : `The owner, ${site.name}`;
}

/** Server-only integration switches, read from env (see .env.example). */
export const integrations = {
  bookingUrl: process.env.BOOKING_URL || null,
  gaId: process.env.NEXT_PUBLIC_GA_ID || null,
};
