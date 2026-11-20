/**
 * How the visitor found the site, for the lead log (lib/lead-log). Browser-side only.
 *
 * On the first page of a visit we note the campaign tags (utm_*), ad click ids (gclid, fbclid, …),
 * the referring site and the landing page. It lives in sessionStorage (no cookie): it is gone when
 * the tab closes, and the privacy policy says so. A later page with new tags or a new outside
 * referrer replaces it ("last non-direct touch"); an internal or direct page view never does.
 * The quote forms send it with the request; the server classifies the channel.
 */

const KEY = "cdr.attribution";

export const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"] as const;
export const CLICK_ID_KEYS = ["gclid", "gbraid", "wbraid", "fbclid", "msclkid", "ttclid", "li_fat_id"] as const;

export type Attribution = {
  utm: Partial<Record<(typeof UTM_KEYS)[number], string>>;
  clickIds: Partial<Record<(typeof CLICK_ID_KEYS)[number], string>>;
  /** Host of the outside page that sent the visitor (null = typed, bookmark, app, or hidden) */
  referrerHost: string | null;
  landingPath: string;
  /** ISO time of this touch */
  firstSeenAt: string;
};

const clip = (value: string, max: number) => value.trim().slice(0, max);

function read(): Attribution | null {
  try {
    const raw = window.sessionStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Attribution) : null;
  } catch {
    return null;
  }
}

/** Call once per full page load (the root layout's listeners do). Never throws. */
export function captureAttribution(): void {
  try {
    const url = new URL(window.location.href);
    const utm: Attribution["utm"] = {};
    for (const key of UTM_KEYS) {
      const value = url.searchParams.get(key);
      if (value) utm[key] = clip(value, 200);
    }
    const clickIds: Attribution["clickIds"] = {};
    for (const key of CLICK_ID_KEYS) {
      const value = url.searchParams.get(key);
      if (value) clickIds[key] = clip(value, 300);
    }

    let referrerHost: string | null = null;
    if (document.referrer) {
      const host = new URL(document.referrer).hostname.toLowerCase();
      const own = url.hostname.toLowerCase().replace(/^www\./, "");
      if (host.replace(/^www\./, "") !== own) referrerHost = host;
    }

    const tagged = Object.keys(utm).length > 0 || Object.keys(clickIds).length > 0;
    const existing = read();
    if (!tagged && !referrerHost && existing) return;

    const touch: Attribution = {
      utm,
      clickIds,
      referrerHost,
      landingPath: clip(url.pathname, 300),
      firstSeenAt: new Date().toISOString(),
    };
    window.sessionStorage.setItem(KEY, JSON.stringify(touch));
  } catch {
    /* blocked storage or an odd referrer: the lead is logged as "unknown" */
  }
}

/** What the forms send with a quote request (null when nothing was captured) */
export function readAttribution(): Attribution | null {
  return read();
}
