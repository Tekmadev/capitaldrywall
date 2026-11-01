import type { MetadataRoute } from "next";
import { privacyLastUpdated } from "@/content/copy/privacy";
import { site } from "@/content/site.config";
import { absoluteUrl, pageSeo, sitemapPages } from "@/lib/seo";

/**
 * sitemap.xml: the five pages + privacy (brief §10). Thank-you is noindex; /api and /dev are
 * disallowed in robots.txt, so neither appears here. Dates come from content, never the clock.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return sitemapPages.map(({ key, priority, changeFrequency }) => ({
    url: absoluteUrl(pageSeo[key].path),
    lastModified: key === "privacy" ? privacyLastUpdated : site.lastUpdated,
    changeFrequency,
    priority,
  }));
}
