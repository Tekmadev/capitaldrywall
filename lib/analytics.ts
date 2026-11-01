import { track as vercelTrack } from "@vercel/analytics";

/** Every custom event the site sends (brief §12). */
export type AnalyticsEvent =
  | "quote_start"
  | "quote_step_2"
  | "quote_step_3"
  | "quote_submit"
  | "call_click"
  | "estimator_used"
  | "estimator_to_quote"
  | "faq_open";

type EventProps = Record<string, string | number | boolean | null>;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

/**
 * Client-side event: Vercel Analytics (cookieless) plus GA4 when it has been loaded after consent.
 * Never pass personal data (names, emails, phone numbers) as props.
 */
export function track(event: AnalyticsEvent, props?: EventProps): void {
  if (typeof window === "undefined") return;
  try {
    vercelTrack(event, props);
  } catch {
    /* analytics must never break the page */
  }
  window.gtag?.("event", event, props ?? {});
  if (process.env.NODE_ENV !== "production") console.debug("[analytics]", event, props ?? {});
}
