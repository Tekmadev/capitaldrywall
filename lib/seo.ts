/**
 * Per-page SEO (brief §10, copy deck page titles + meta descriptions).
 *
 * One map drives everything that describes a page to machines: <title>/meta (pageMetadata), the
 * canonical, Open Graph + Twitter, breadcrumbs, the sitemap, WebPage JSON-LD and the share-card
 * template (title, sheet reference and the dimension line it draws). Titles and descriptions are
 * verbatim from CAPITAL_COPY.md; share-card text is taken from the same deck (H1s, display lines,
 * stage captions, art-direction annotations), never invented.
 */
import type { Metadata } from "next";
import { pages } from "@/content/services";
import { feature, site } from "@/content/site.config";

export type SeoPageKey =
  | "home"
  | "drywall"
  | "basement"
  | "renovations"
  | "freeQuote"
  | "privacy"
  | "thankYou";

/** The dimension line drawn on a share card: ticks along a measured run, one segment lit amber. */
export type OgScale = {
  /** Tick labels, left to right ("" for an unlabelled tick) */
  ticks: readonly string[];
  /** Segment drawn in amber, as tick indexes [from, to] */
  lit?: readonly [number, number];
  /** Mono annotation above the run. Must state a real fact. */
  caption: string;
};

export type OgCard = {
  /** Headline set in Archivo Expanded ExtraBold (the page's short title). "\n" marks a line break. */
  title: string;
  /** Sheet-reference eyebrow, drawn as `INDEX / LABEL ──────┤ SHEET` */
  index?: string;
  label: string;
  sheet: string;
  scale: OgScale;
};

export type PageSeo = {
  path: string;
  /** <title>, og:title, twitter:title (copy deck, verbatim) */
  title: string;
  /** meta description (copy deck, verbatim) */
  description: string;
  /** Short name used in breadcrumbs (matches the visible trails in content/copy) */
  name: string;
  /** noindex,follow (thank-you) */
  noindex?: boolean;
  /**
   * Share card. `null` = the route has no image of its own and reuses the root card
   * (only pages whose folder holds an opengraph-image.tsx get their own).
   */
  og: OgCard | null;
};

const popcorn = feature("popcornRemoval");

export const pageSeo: Record<SeoPageKey, PageSeo> = {
  home: {
    path: pages.home,
    title: "Drywall & Basement Renovations Ottawa | Capital Drywall",
    description:
      "Ottawa drywall installation, repair, Level 5 finishing and full basement renovations. Dust-controlled, paint-ready results. Free quotes across Ottawa.",
    name: "Home",
    og: {
      // The home card carries the brand line; the H1 rides in the sheet reference.
      title: site.tagline,
      label: "Drywall & basement renovations in Ottawa",
      sheet: "A-00",
      scale: {
        ticks: ["01", "02", "03", "04", "05"],
        lit: [3, 4],
        caption: "Board hung → paint-ready",
      },
    },
  },
  drywall: {
    path: pages.drywall,
    title: "Drywall Contractor Ottawa | Install, Repair & Level 5 Finish",
    description: popcorn
      ? "Drywall installation, repair, taping, mudding, skim coating and popcorn ceiling removal in Ottawa. Paint-ready Level 5 finishes. Free quotes."
      : "Drywall installation, repair, taping, mudding and skim coating in Ottawa. Paint-ready Level 5 finishes. Free quotes.",
    name: "Drywall",
    og: {
      title: "Drywall contractor\nin Ottawa",
      index: "01",
      label: "Drywall",
      sheet: "A-01",
      scale: {
        ticks: ["L0", "L1", "L2", "L3", "L4", "L5"],
        lit: [4, 5],
        caption: "Finish level 4 → level 5",
      },
    },
  },
  basement: {
    path: pages.basement,
    title: "Basement Renovations Ottawa | Basement Finishing Contractor",
    description:
      "Basement finishing and renovations in Ottawa: framing, insulation, drywall, flooring, bathrooms and more. Warm, dry, permitted builds. Free quotes.",
    name: "Basement renovations",
    og: {
      title: "Basement renovations\n& finishing in Ottawa",
      index: "02",
      label: "Basements",
      sheet: "A-02",
      scale: {
        ticks: ["Permit", "Wk 1", "Wk 2", "Wk 3", "Wk 4", "Wk 5", "Wk 6"],
        lit: [4, 6],
        caption: "4–6 wk after permit",
      },
    },
  },
  renovations: {
    path: pages.renovations,
    title: "Painting, Bathroom & Kitchen Renovations Ottawa | Capital",
    description:
      "Interior painting, bathroom remodels and kitchen updates in Ottawa, finished to the same standard as our drywall. Free quotes from Capital Drywall.",
    name: "Renovations",
    og: {
      title: "Painting, bathroom &\nkitchen renovations\nin Ottawa",
      index: "03",
      label: "Renovations",
      sheet: "A-03",
      scale: {
        ticks: ["Painting", "Bathrooms", "Kitchens"],
        caption: "Same standard, every room",
      },
    },
  },
  freeQuote: {
    path: pages.quote,
    title: "Free Drywall & Basement Quote Ottawa | Capital Drywall",
    description:
      "Get a free drywall or basement renovation quote in Ottawa. Send photos for a fast estimate, or call. Written quotes, no surprises.",
    name: "Get a Free Quote",
    og: {
      title: "Get a free quote",
      index: "04",
      label: "Free quote",
      sheet: "A-04",
      scale: {
        ticks: ["Review", "Site visit", "Written quote"],
        lit: [1, 2],
        caption: "Written quotes, no surprises",
      },
    },
  },
  privacy: {
    path: pages.privacy,
    title: "Privacy Policy | Capital Drywall & Renovation",
    description:
      "What personal information Capital Drywall & Renovation collects through this website, how we use and protect it under PIPEDA, and the choices you have.",
    name: "Privacy Policy",
    og: {
      title: "Privacy policy",
      label: "General notes",
      sheet: "G-01",
      scale: { ticks: ["", ""], caption: "PIPEDA · CASL" },
    },
  },
  thankYou: {
    path: pages.thankYou,
    title: "Level. We've got it. | Capital Drywall & Renovation",
    description: `Thanks. Your request is in, and we'll get back to you ${site.responsePromise}.`,
    name: "Thank you",
    noindex: true,
    og: null,
  },
};

/** Absolute URL for a site path (JSON-LD, sitemap, llms.txt). */
export function absoluteUrl(path: string): string {
  return path === "/" ? site.url : `${site.url}${path}`;
}

/** Alt text for a page's share card. */
export function ogAlt(key: SeoPageKey): string {
  const card = pageSeo[key].og ?? pageSeo.home.og!;
  const title = card.title.replace(/\s*\n\s*/g, " ");
  const subject = key === "home" || !pageSeo[key].og ? `${title} ${card.label}.` : `${title}.`;
  return `${subject} ${site.name}, lettered on a dark wall lit by a low work light, with drawing-sheet dimension lines.`;
}

/**
 * Next.js Metadata for a page: exact title + description, canonical, Open Graph (website, en_CA),
 * a large Twitter card and robots. Images come from the opengraph-image / twitter-image files.
 *
 *   export const metadata = pageMetadata("drywall");
 */
export function pageMetadata(key: SeoPageKey): Metadata {
  const page = pageSeo[key];
  const { title, description, path } = page;

  // A page segment that sets `openGraph` replaces the root card unless it brings its own image file,
  // so routes without one point at the root card explicitly.
  const images = page.og
    ? undefined
    : [{ url: "/opengraph-image", width: 1200, height: 630, alt: ogAlt(key) }];

  return {
    title: { absolute: title },
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      locale: "en_CA",
      siteName: site.name,
      url: path,
      title,
      description,
      ...(images && { images }),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(images && { images }),
    },
    robots: page.noindex
      ? { index: false, follow: true, googleBot: { index: false, follow: true } }
      : { index: true, follow: true },
  };
}

/** Breadcrumb trails for inner pages (Home → page). */
export type Crumb = { name: string; path: string };

export function breadcrumbTrail(key: SeoPageKey): Crumb[] {
  const page = pageSeo[key];
  if (key === "home") return [{ name: pageSeo.home.name, path: pages.home }];
  return [
    { name: pageSeo.home.name, path: pages.home },
    { name: page.name, path: page.path },
  ];
}

/** Pages listed in sitemap.xml (thank-you is noindex; /dev and /api are disallowed). */
export const sitemapPages: { key: SeoPageKey; priority: number; changeFrequency: "monthly" | "yearly" }[] =
  [
    { key: "home", priority: 1, changeFrequency: "monthly" },
    { key: "drywall", priority: 0.9, changeFrequency: "monthly" },
    { key: "basement", priority: 0.9, changeFrequency: "monthly" },
    { key: "renovations", priority: 0.7, changeFrequency: "monthly" },
    { key: "freeQuote", priority: 0.8, changeFrequency: "monthly" },
    { key: "privacy", priority: 0.2, changeFrequency: "yearly" },
  ];
