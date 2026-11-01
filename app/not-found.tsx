import type { Metadata } from "next";
import { NotFoundHero } from "@/components/sections/utility/NotFoundHero";
import { notFoundCopy } from "@/content/copy/quote";
import { site } from "@/content/site.config";

/** Same pattern as the thank-you title ("{H1} | {site name}"). Next adds robots noindex itself. */
export const metadata: Metadata = {
  title: { absolute: `${notFoundCopy.h1} | ${site.name}` },
};

/** Root 404 (brief §7.9). Static: no searchParams, cookies or headers. */
export default function NotFound() {
  return <NotFoundHero />;
}
