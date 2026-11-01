import { Breadcrumbs, type Crumb } from "@/components/ui/Breadcrumbs";
import { LastUpdated } from "@/components/ui/LastUpdated";
import { basementBreadcrumb } from "@/content/copy/basement";
import { cn } from "@/lib/utils";

/** The visible trail mirrors the BreadcrumbList JSON-LD (same copy-module array); the last step is the page. */
const crumbs: Crumb[] = basementBreadcrumb.map((step, i) => ({
  label: step.name,
  href: i < basementBreadcrumb.length - 1 ? step.href : undefined,
}));

/**
 * Page meta for the basement hero: breadcrumb trail and the "Last updated" line, set as one
 * title-block strip above the H1. It rides inside the hero headline, so it fades with it on scroll.
 */
export function BasementHeroMeta({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-x-10 border-b border-white/15 pb-1 md:pb-0",
        className,
      )}
    >
      <Breadcrumbs items={crumbs} tone="dark" />
      <LastUpdated className="pb-3 md:pb-0" />
    </div>
  );
}
