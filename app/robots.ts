import type { MetadataRoute } from "next";
import { site } from "@/content/site.config";

/** Search and AI crawlers this site invites by name (brief §11). */
const namedCrawlers = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "PerplexityBot",
  "ClaudeBot",
  "Claude-SearchBot",
  "Claude-User",
  "Google-Extended",
  "Applebot-Extended",
  "Bingbot",
];

/** Never crawled: the post-submit page, form/upload endpoints and the dev kitchen sink. */
const disallow = ["/thank-you", "/api", "/dev"];

/**
 * robots.txt. A crawler follows only the most specific group that names it, so the named group
 * repeats the disallow list instead of inheriting it from `*`.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow },
      { userAgent: namedCrawlers, allow: "/", disallow },
    ],
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  };
}
