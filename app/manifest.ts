import type { MetadataRoute } from "next";
import { site } from "@/content/site.config";
import { pageSeo } from "@/lib/seo";

/** Web app manifest. Colours mirror the graphite / plaster tokens in app/globals.css. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: site.name,
    short_name: "Capital",
    description: pageSeo.home.description,
    lang: "en-CA",
    start_url: "/",
    scope: "/",
    display: "standalone",
    // Graphite chrome (matches the viewport themeColor), plaster splash (matches the page background).
    theme_color: "#141518",
    background_color: "#F2EFE9",
    icons: [
      { src: "/icon", sizes: "32x32", type: "image/png" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
      { src: "/logo.png", sizes: "512x512", type: "image/png", purpose: "any" },
    ],
  };
}
