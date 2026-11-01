import { siteSchema } from "@/lib/schema";
import { JsonLd } from "./JsonLd";

/**
 * Sitewide JSON-LD: GeneralContractor (#business), Organization (#organization) and WebSite
 * (#website) in one @graph. Rendered once, in the root layout.
 */
export function SiteJsonLd() {
  return <JsonLd data={siteSchema()} />;
}
