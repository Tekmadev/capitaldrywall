import type { Crumb } from "@/components/ui/Breadcrumbs";
import { breadcrumbTrail, type SeoPageKey } from "@/lib/seo";

/** The visible breadcrumb trail for a page: the same names and paths as its BreadcrumbList JSON-LD. */
export function visibleTrail(key: SeoPageKey): Crumb[] {
  const trail = breadcrumbTrail(key);
  return trail.map((crumb, i) => ({
    label: crumb.name,
    href: i < trail.length - 1 ? crumb.path : undefined,
  }));
}
