import { breadcrumbSchema, type BreadcrumbStep } from "@/lib/schema";
import { breadcrumbTrail, type SeoPageKey } from "@/lib/seo";
import { JsonLd } from "./JsonLd";

/**
 * BreadcrumbList for an inner page. Pass the same trail the visible breadcrumb renders
 * (the `*Breadcrumb` arrays in content/copy work as-is), or a page key for Home → page.
 *
 *   <BreadcrumbJsonLd trail={drywallBreadcrumb} />
 *   <BreadcrumbJsonLd page="freeQuote" />
 */
export function BreadcrumbJsonLd(
  props: { trail: readonly BreadcrumbStep[]; page?: never } | { page: SeoPageKey; trail?: never },
) {
  const trail = props.trail ?? breadcrumbTrail(props.page);
  if (trail.length < 2) return null;
  return <JsonLd data={breadcrumbSchema(trail)} />;
}
