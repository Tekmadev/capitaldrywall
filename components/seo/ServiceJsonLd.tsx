import type { ServicePage } from "@/content/services";
import { serviceSchema } from "@/lib/schema";
import { JsonLd } from "./JsonLd";

/**
 * Service page JSON-LD: WebPage (with `dateModified` = site.lastUpdated, the visible "Last updated"
 * date) plus a Service for every enabled service on the page, provider → #business, with a
 * `minPrice` offer wherever content/pricing.ts confirms a starting price.
 *
 *   <ServiceJsonLd page="drywall" />
 */
export function ServiceJsonLd({ page }: { page: ServicePage }) {
  return <JsonLd data={serviceSchema(page)} />;
}
