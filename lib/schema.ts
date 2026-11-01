/**
 * schema.org JSON-LD builders (brief §10, copy deck "JSON-LD (sitewide sample)"). Typed with schema-dts.
 *
 * One @id graph, shared by every page so search engines merge it into a single entity:
 *   #business      GeneralContractor (+ HomeAndConstructionBusiness): the local business itself
 *   #organization  Organization: the company behind it (logo, contact point, sameAs)
 *   #website       WebSite, published by #business
 *   #ottawa        City, referenced by every areaServed
 *   <page>#webpage / #breadcrumb / #service-<id> / #faq   per-page nodes
 *
 * Every value comes from /content, so a CONFIRM value set to null/false drops its property rather than
 * publishing an unconfirmed claim. Never add AggregateRating or Review here: there are no real reviews
 * yet, and self-serving review markup is never allowed (brief §3, §10).
 */
import type {
  BreadcrumbList,
  City,
  ContactPoint,
  FAQPage,
  GeneralContractor,
  Graph,
  ImageObject,
  ListItem,
  Offer,
  OfferCatalog,
  OpeningHoursSpecification,
  Organization,
  Place,
  PostalAddress,
  PriceSpecification,
  Service,
  UnitPriceSpecification,
  WebPage,
  WebSite,
  WithContext,
} from "schema-dts";
import { areas } from "@/content/areas";
import { basementIntro } from "@/content/copy/basement";
import { drywallSubServices } from "@/content/copy/drywall";
import { renovationSections } from "@/content/copy/renovations";
import type { FaqItem } from "@/content/faq";
import { drywallPrices, startingPrices, type StartingPrice } from "@/content/pricing";
import { services, type Service as SiteService, type ServiceId, type ServicePage } from "@/content/services";
import { site } from "@/content/site.config";
import { absoluteUrl, pageSeo, type SeoPageKey } from "@/lib/seo";

export const businessId = `${site.url}/#business`;
export const organizationId = `${site.url}/#organization`;
export const websiteId = `${site.url}/#website`;
export const ottawaId = `${site.url}/#ottawa`;
const logoId = `${site.url}/#logo`;

const ref = (id: string) => ({ "@id": id });

/* ── Shared nodes ─────────────────────────────────────────────── */

const ottawa: City = {
  "@type": "City",
  "@id": ottawaId,
  name: site.address.locality,
  // Disambiguates Ottawa, Ontario from the other Ottawas.
  sameAs: "https://en.wikipedia.org/wiki/Ottawa",
};

/** Ottawa, then every community from content/areas.ts (copy-deck order). */
function areaServed(): (City | Place)[] {
  return [ottawa, ...areas.map((area): Place => ({ "@type": "Place", name: area.schemaName }))];
}

function postalAddress(): PostalAddress {
  const { street, postalCode, locality, region, country } = site.address;
  return {
    "@type": "PostalAddress",
    ...(street ? { streetAddress: street } : {}),
    ...(street && postalCode ? { postalCode } : {}),
    addressLocality: locality,
    addressRegion: region,
    addressCountry: country,
  };
}

const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] as const;
type Weekday = (typeof WEEKDAYS)[number];
const isWeekday = (day: string): day is Weekday => (WEEKDAYS as readonly string[]).includes(day);

function openingHours(): OpeningHoursSpecification {
  const { days, opens, closes } = site.openingHours;
  return {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: days.filter(isWeekday),
    opens,
    closes,
  };
}

/** Only profiles that exist (GBP, Facebook, Instagram once the owner adds them). */
function sameAs(): string[] {
  return Object.values(site.social).filter((url): url is string => Boolean(url && url.trim()));
}

/* ── Services ─────────────────────────────────────────────────── */

/** Topics per service, worded as in the copy-deck sample's `knowsAbout`. */
const topics: Partial<Record<ServiceId, string[]>> = {
  "drywall-installation": ["Drywall installation"],
  "drywall-repair": ["Drywall repair"],
  "taping-mudding": ["Drywall taping and mudding"],
  "skim-coat-level-5": ["Level 5 drywall finish", "Skim coating"],
  "popcorn-removal": ["Popcorn ceiling removal"],
  "basement-renovation": ["Basement finishing", "Basement renovation"],
  "interior-painting": ["Interior painting"],
  "bathroom-renovation": ["Bathroom renovation"],
  "kitchen-renovation": ["Kitchen renovation"],
};

/** Real services only (the quote form's "Something else" is not one), feature flags applied. */
const offeredServices = services.filter(
  (s): s is SiteService & { href: string; page: ServicePage } => Boolean(s.href && s.page),
);

const pageKeyOf: Record<ServicePage, SeoPageKey> = {
  drywall: "drywall",
  basement: "basement",
  renovations: "renovations",
};

export function serviceId(service: SiteService & { page: ServicePage }): string {
  return `${absoluteUrl(pageSeo[pageKeyOf[service.page]].path)}#service-${service.id}`;
}

/** Visible page copy describing each service (the schema says exactly what the page says). */
function serviceDescription(id: ServiceId): string | undefined {
  if (id === "basement-renovation") return basementIntro;
  return (
    drywallSubServices.find((s) => s.service === id)?.body ??
    renovationSections.find((s) => s.service === id)?.body
  );
}

/** content/pricing.ts row that carries a service's confirmed starting price. */
const priceRowFor: Partial<Record<ServiceId, string>> = {
  "drywall-repair": "drywall-repair",
  "popcorn-removal": "popcorn-removal",
  "basement-renovation": "basement-finishing",
};

function startingPrice(id: ServiceId): StartingPrice | undefined {
  const row = priceRowFor[id];
  if (!row) return undefined;
  // Both lists are already filtered by feature flags (popcorn disappears with its flag).
  return [...drywallPrices, ...startingPrices].find((p) => p.id === row && p.from !== null);
}

function offerFor(id: ServiceId): Offer | undefined {
  const price = startingPrice(id);
  if (!price || price.from === null) return undefined;
  const base = {
    minPrice: price.from,
    priceCurrency: "CAD",
    // Starting prices are quoted before HST (content/pricing.ts fine print).
    valueAddedTaxIncluded: false,
  } as const;
  const priceSpecification: PriceSpecification | UnitPriceSpecification = price.unit
    ? { "@type": "UnitPriceSpecification", ...base, unitText: price.unit }
    : { "@type": "PriceSpecification", ...base };
  return {
    "@type": "Offer",
    priceCurrency: "CAD",
    priceSpecification,
    description: price.detail,
    areaServed: ref(ottawaId),
    seller: ref(businessId),
  };
}

function serviceNode(service: SiteService & { href: string; page: ServicePage }): Service {
  const description = serviceDescription(service.id);
  const offer = offerFor(service.id);
  return {
    "@type": "Service",
    "@id": serviceId(service),
    name: service.name,
    serviceType: service.name,
    ...(description ? { description } : {}),
    url: absoluteUrl(service.href),
    provider: ref(businessId),
    areaServed: ottawa,
    ...(offer ? { offers: offer } : {}),
  };
}

function offerCatalog(): OfferCatalog {
  return {
    "@type": "OfferCatalog",
    name: "Services",
    itemListElement: offeredServices.map(
      (service): Offer => ({
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          "@id": serviceId(service),
          name: service.name,
          url: absoluteUrl(service.href),
        },
      }),
    ),
  };
}

/* ── Sitewide graph ───────────────────────────────────────────── */

function businessNode() {
  const social = sameAs();
  return {
    "@type": "GeneralContractor",
    "@id": businessId,
    name: site.name,
    ...(site.legalName !== site.name ? { legalName: site.legalName } : {}),
    description: pageSeo.home.description,
    url: site.url,
    logo: absoluteUrl("/logo.png"),
    image: absoluteUrl("/opengraph-image"),
    telephone: site.phone.e164,
    email: site.email,
    priceRange: "$$",
    address: postalAddress(),
    geo: { "@type": "GeoCoordinates", latitude: site.geo.latitude, longitude: site.geo.longitude },
    areaServed: areaServed(),
    openingHoursSpecification: [openingHours()],
    knowsAbout: offeredServices.flatMap((s) => topics[s.id] ?? []),
    hasOfferCatalog: offerCatalog(),
    parentOrganization: ref(organizationId),
    ...(social.length ? { sameAs: social } : {}),
  } satisfies GeneralContractor;
}

function organizationNode(): Organization {
  const social = sameAs();
  const logo: ImageObject = {
    "@type": "ImageObject",
    "@id": logoId,
    url: absoluteUrl("/logo.png"),
    contentUrl: absoluteUrl("/logo.png"),
    width: "512",
    height: "512",
    caption: site.name,
  };
  const contact: ContactPoint = {
    "@type": "ContactPoint",
    contactType: "customer service",
    telephone: site.phone.e164,
    email: site.email,
    areaServed: ref(ottawaId),
  };
  return {
    "@type": "Organization",
    "@id": organizationId,
    name: site.name,
    legalName: site.legalName,
    url: site.url,
    logo,
    image: ref(logoId),
    slogan: site.tagline,
    email: site.email,
    telephone: site.phone.e164,
    contactPoint: contact,
    ...(social.length ? { sameAs: social } : {}),
  };
}

function websiteNode(): WebSite {
  return {
    "@type": "WebSite",
    "@id": websiteId,
    url: site.url,
    name: site.name,
    inLanguage: "en-CA",
    publisher: ref(businessId),
  };
}

/** The business also carries HomeAndConstructionBusiness, as in the copy-deck sample. */
const BUSINESS_TYPES = ["GeneralContractor", "HomeAndConstructionBusiness"] as const;

/** Sitewide JSON-LD (rendered once, in the root layout by SiteJsonLd). */
export function siteSchema(): Graph {
  const business = businessNode();
  return {
    "@context": "https://schema.org",
    "@graph": [
      // schema-dts types one @type per node; the second type is added after type-checking the node.
      { ...business, "@type": BUSINESS_TYPES } as unknown as GeneralContractor,
      organizationNode(),
      websiteNode(),
    ],
  };
}

/* ── Page-level graphs ────────────────────────────────────────── */

/**
 * Service page JSON-LD: a WebPage with `dateModified` (the visible "Last updated" date, brief §11)
 * plus one Service per enabled service described on that page, each with its starting price when
 * content/pricing.ts confirms one.
 */
export function serviceSchema(page: ServicePage): Graph {
  const key = pageKeyOf[page];
  const { path, title, description } = pageSeo[key];
  const url = absoluteUrl(path);
  const pageServices = offeredServices.filter((s) => s.page === page).map(serviceNode);

  const webPage: WebPage = {
    "@type": "WebPage",
    "@id": `${url}#webpage`,
    url,
    name: title,
    description,
    inLanguage: "en-CA",
    isPartOf: ref(websiteId),
    about: pageServices.map((s) => ref(s["@id"] as string)),
    provider: ref(businessId),
    breadcrumb: ref(`${url}#breadcrumb`),
    dateModified: site.lastUpdated,
  };

  return { "@context": "https://schema.org", "@graph": [webPage, ...pageServices] };
}

/** A breadcrumb step. `href`/`path` are site paths ("/drywall-ottawa"); the shapes in content/copy work as-is. */
export type BreadcrumbStep = { name: string; href?: string; path?: string };

/** BreadcrumbList from the same trail the visible breadcrumb renders. */
export function breadcrumbSchema(trail: readonly BreadcrumbStep[]): WithContext<BreadcrumbList> {
  const steps = trail.map((step) => ({ name: step.name, url: absoluteUrl(step.path ?? step.href ?? "/") }));
  const last = steps.at(-1)?.url ?? site.url;
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": `${last.split("#")[0]}#breadcrumb`,
    itemListElement: steps.map(
      (step, index): ListItem => ({
        "@type": "ListItem",
        position: index + 1,
        name: step.name,
        item: step.url,
      }),
    ),
  };
}

/** FAQPage from the exact strings the FAQ UI renders (visible text === schema text). */
export function faqPageSchema(items: FaqItem[], path: string): WithContext<FAQPage> {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${site.url}${path === "/" ? "" : path}#faq`,
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}
