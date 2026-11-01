import { feature, type FeatureFlag } from "./site.config";

export type ServiceId =
  | "drywall-installation"
  | "drywall-repair"
  | "taping-mudding"
  | "skim-coat-level-5"
  | "popcorn-removal"
  | "basement-renovation"
  | "interior-painting"
  | "bathroom-renovation"
  | "kitchen-renovation"
  | "other";

export type ServicePage = "drywall" | "basement" | "renovations";

export type Service = {
  id: ServiceId;
  /** Display name used in headings, schema and llms.txt */
  name: string;
  /** Label on the quote form's service tiles (copy deck: FREE QUOTE, Step 1) */
  formLabel: string;
  /** Label in the footer services list (copy deck: GLOBAL, Footer) */
  footerLabel?: string;
  /** Jump-chip label on the drywall page */
  chipLabel?: string;
  /** Page + anchor that describes it */
  href?: string;
  page?: ServicePage;
  group: "drywall" | "basement" | "secondary" | "other";
  flag?: FeatureFlag;
};

export const pages = {
  home: "/",
  drywall: "/drywall-ottawa",
  basement: "/basement-renovations-ottawa",
  renovations: "/renovations-ottawa",
  quote: "/free-quote",
  privacy: "/privacy-policy",
  thankYou: "/thank-you",
} as const;

const allServices: Service[] = [
  {
    id: "drywall-installation",
    name: "Drywall installation",
    formLabel: "Drywall installation",
    footerLabel: "Drywall installation",
    chipLabel: "Installation",
    href: `${pages.drywall}#drywall-installation`,
    page: "drywall",
    group: "drywall",
  },
  {
    id: "drywall-repair",
    name: "Drywall repair",
    formLabel: "Drywall repair",
    footerLabel: "Drywall repair",
    chipLabel: "Repair",
    href: `${pages.drywall}#drywall-repair`,
    page: "drywall",
    group: "drywall",
  },
  {
    id: "taping-mudding",
    name: "Taping, mudding & sanding",
    formLabel: "Taping & mudding",
    footerLabel: "Taping & mudding",
    chipLabel: "Taping & mudding",
    href: `${pages.drywall}#taping-mudding`,
    page: "drywall",
    group: "drywall",
  },
  {
    id: "skim-coat-level-5",
    name: "Skim coating & Level 5 finishes",
    formLabel: "Skim coat / Level 5",
    footerLabel: "Skim coating & Level 5",
    chipLabel: "Skim coat & Level 5",
    href: `${pages.drywall}#skim-coating-level-5`,
    page: "drywall",
    group: "drywall",
  },
  {
    id: "popcorn-removal",
    name: "Popcorn ceiling removal",
    formLabel: "Popcorn ceiling removal",
    footerLabel: "Popcorn ceiling removal",
    chipLabel: "Popcorn removal",
    href: `${pages.drywall}#popcorn-ceiling-removal`,
    page: "drywall",
    group: "drywall",
    flag: "popcornRemoval",
  },
  {
    id: "basement-renovation",
    name: "Basement renovations",
    formLabel: "Basement renovation",
    footerLabel: "Basement renovations",
    href: pages.basement,
    page: "basement",
    group: "basement",
  },
  {
    id: "interior-painting",
    name: "Interior painting",
    formLabel: "Interior painting",
    footerLabel: "Interior painting",
    href: `${pages.renovations}#interior-painting`,
    page: "renovations",
    group: "secondary",
  },
  {
    id: "bathroom-renovation",
    name: "Bathroom renovations",
    formLabel: "Bathroom renovation",
    footerLabel: "Bathroom renovations",
    href: `${pages.renovations}#bathroom-renovations`,
    page: "renovations",
    group: "secondary",
  },
  {
    id: "kitchen-renovation",
    name: "Kitchen renovations",
    formLabel: "Kitchen renovation",
    footerLabel: "Kitchen renovations",
    href: `${pages.renovations}#kitchen-renovations`,
    page: "renovations",
    group: "secondary",
  },
  {
    id: "other",
    name: "Something else",
    formLabel: "Something else",
    group: "other",
  },
];

/** Services with their feature flags applied. Always use this, never `allServices`. */
export const services: Service[] = allServices.filter((s) => !s.flag || feature(s.flag));

export function getService(id: ServiceId): Service | undefined {
  return services.find((s) => s.id === id);
}

export const drywallServices = services.filter((s) => s.group === "drywall");
export const secondaryServices = services.filter((s) => s.group === "secondary");
export const footerServices = services.filter((s) => s.footerLabel);

/** Short aliases accepted in `/free-quote?service=` (comma-separated). */
const serviceAliases: Record<string, ServiceId[]> = {
  drywall: [],
  installation: ["drywall-installation"],
  install: ["drywall-installation"],
  repair: ["drywall-repair"],
  taping: ["taping-mudding"],
  mudding: ["taping-mudding"],
  skim: ["skim-coat-level-5"],
  level5: ["skim-coat-level-5"],
  "level-5": ["skim-coat-level-5"],
  popcorn: ["popcorn-removal"],
  basement: ["basement-renovation"],
  basements: ["basement-renovation"],
  painting: ["interior-painting"],
  bathroom: ["bathroom-renovation"],
  kitchen: ["kitchen-renovation"],
};

/** Parse `?service=` into valid, enabled service ids. */
export function resolveServiceParam(param: string | null | undefined): ServiceId[] {
  if (!param) return [];
  const ids = new Set<ServiceId>();
  for (const raw of param.split(",")) {
    const key = raw.trim().toLowerCase();
    if (!key) continue;
    const direct = services.find((s) => s.id === key);
    if (direct) ids.add(direct.id);
    for (const id of serviceAliases[key] ?? []) {
      if (getService(id)) ids.add(id);
    }
  }
  return [...ids];
}

/** `/free-quote?service=…` link for a service CTA. */
export function quoteHref(service?: ServiceId | string): string {
  return service ? `${pages.quote}?service=${encodeURIComponent(service)}` : pages.quote;
}
