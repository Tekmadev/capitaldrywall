import type { ReactNode } from "react";
import { site } from "@/content/site.config";
import { cn } from "@/lib/utils";

/**
 * Inline tel: link. `location` feeds the call_click event (AnalyticsListeners delegates every
 * tel: click sitewide, so no client code is needed here).
 */
export function CallLink({
  location,
  className,
  children,
}: {
  location: string;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <a href={`tel:${site.phone.e164}`} data-location={location} className={cn("tabular-nums", className)}>
      {children ?? site.phone.display}
    </a>
  );
}

/**
 * An email address that wraps after the "@" when it has to ("info@" / "example.com"), never
 * mid-name. Pair it with overflow-wrap:anywhere as a last resort for a domain wider than its column.
 */
export function BreakableEmail({ email = site.email }: { email?: string }) {
  const at = email.indexOf("@");
  if (at < 0) return email;
  return (
    <>
      {email.slice(0, at + 1)}
      <wbr />
      {email.slice(at + 1)}
    </>
  );
}

/**
 * mailto: link to the business email. The default text breaks after the "@" in narrow columns; it
 * sits in one span so a flex link (inline-flex for the tap height) keeps it a single flex item.
 */
export function EmailLink({ className, children }: { className?: string; children?: ReactNode }) {
  return (
    <a href={`mailto:${site.email}`} className={className}>
      {children ?? (
        <span>
          <BreakableEmail />
        </span>
      )}
    </a>
  );
}
