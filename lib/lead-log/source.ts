/**
 * Server-side reading of the attribution a quote form sent (lib/attribution.ts): validated
 * leniently (bad data is dropped, never fails the lead) and classified into a channel.
 */
import { z } from "zod";
import { CLICK_ID_KEYS, UTM_KEYS } from "@/lib/attribution";

export type Channel = "paid" | "organic" | "social" | "email" | "referral" | "direct" | "unknown";
export type AdPlatform = "google" | "meta" | "microsoft" | "tiktok" | "linkedin" | "other";

export type LeadSource = {
  channel: Channel;
  adPlatform: AdPlatform | null;
  utm: Partial<Record<(typeof UTM_KEYS)[number], string>>;
  clickIds: Partial<Record<(typeof CLICK_ID_KEYS)[number], string>>;
  referrerHost: string | null;
  landingPath: string | null;
  firstSeenAt: string | null;
};

const text = (max: number) => z.string().trim().max(max).catch("");

const attributionSchema = z.object({
  utm: z.record(z.string(), text(200)).catch({}),
  clickIds: z.record(z.string(), text(300)).catch({}),
  referrerHost: z
    .string()
    .trim()
    .toLowerCase()
    .max(200)
    .regex(/^[a-z0-9.-]+$/)
    .nullable()
    .catch(null),
  landingPath: z.string().trim().max(300).startsWith("/").nullable().catch(null),
  firstSeenAt: z.iso.datetime().nullable().catch(null),
});

const SEARCH_ENGINES: Array<[RegExp, string]> = [
  [/(^|\.)google\.[a-z.]+$/, "Google"],
  [/(^|\.)bing\.com$/, "Bing"],
  [/(^|\.)duckduckgo\.com$/, "DuckDuckGo"],
  [/(^|\.)yahoo\.[a-z.]+$/, "Yahoo"],
  [/(^|\.)ecosia\.org$/, "Ecosia"],
  [/(^|\.)search\.brave\.com$/, "Brave"],
  [/(^|\.)qwant\.com$/, "Qwant"],
  [/(^|\.)startpage\.com$/, "Startpage"],
];
const SOCIAL_SITES: Array<[RegExp, string]> = [
  [/(^|\.)(facebook\.com|fb\.com|fb\.me)$/, "Facebook"],
  [/(^|\.)instagram\.com$/, "Instagram"],
  [/(^|\.)(t\.co|twitter\.com|x\.com)$/, "X (Twitter)"],
  [/(^|\.)(linkedin\.com|lnkd\.in)$/, "LinkedIn"],
  [/(^|\.)tiktok\.com$/, "TikTok"],
  [/(^|\.)reddit\.com$/, "Reddit"],
  [/(^|\.)pinterest\.[a-z.]+$/, "Pinterest"],
  [/(^|\.)youtube\.com$/, "YouTube"],
  [/(^|\.)nextdoor\.[a-z.]+$/, "Nextdoor"],
];

const PAID_MEDIUMS = /^(cpc|ppc|paid|paid[_-]?search|paid[_-]?social|paidsocial|display|cpm|ads?|sem|retargeting)$/i;

const match = (host: string | null, list: Array<[RegExp, string]>) =>
  host ? (list.find(([re]) => re.test(host))?.[1] ?? null) : null;

function platformFromSource(source: string | undefined): AdPlatform {
  const s = (source ?? "").toLowerCase();
  if (/google|adwords|gads/.test(s)) return "google";
  if (/facebook|^fb$|instagram|^ig$|meta/.test(s)) return "meta";
  if (/bing|microsoft/.test(s)) return "microsoft";
  if (/tiktok/.test(s)) return "tiktok";
  if (/linkedin/.test(s)) return "linkedin";
  return "other";
}

/** Validate what the form sent and classify it. `null` input (no JS, blocked storage) → unknown. */
export function readLeadSource(raw: unknown): LeadSource {
  const parsed = raw && typeof raw === "object" ? attributionSchema.safeParse(raw) : null;
  if (!parsed?.success) {
    return { channel: "unknown", adPlatform: null, utm: {}, clickIds: {}, referrerHost: null, landingPath: null, firstSeenAt: null };
  }
  const a = parsed.data;
  const utm: LeadSource["utm"] = {};
  for (const key of UTM_KEYS) if (a.utm[key]) utm[key] = a.utm[key];
  const clickIds: LeadSource["clickIds"] = {};
  for (const key of CLICK_ID_KEYS) if (a.clickIds[key]) clickIds[key] = a.clickIds[key];

  const base = { utm, clickIds, referrerHost: a.referrerHost, landingPath: a.landingPath, firstSeenAt: a.firstSeenAt };
  const medium = utm.utm_medium ?? "";

  // Paid: an ad click id that only ads add, or a paid utm_medium
  if (clickIds.gclid || clickIds.gbraid || clickIds.wbraid) return { ...base, channel: "paid", adPlatform: "google" };
  if (clickIds.msclkid) return { ...base, channel: "paid", adPlatform: "microsoft" };
  if (clickIds.ttclid) return { ...base, channel: "paid", adPlatform: "tiktok" };
  if (clickIds.li_fat_id) return { ...base, channel: "paid", adPlatform: "linkedin" };
  if (PAID_MEDIUMS.test(medium)) return { ...base, channel: "paid", adPlatform: platformFromSource(utm.utm_source) };

  if (/^(e-?mail|newsletter)$/i.test(medium)) return { ...base, channel: "email", adPlatform: null };
  if (/social/i.test(medium) || clickIds.fbclid) return { ...base, channel: "social", adPlatform: null };
  if (/^organic$/i.test(medium)) return { ...base, channel: "organic", adPlatform: null };

  if (match(a.referrerHost, SEARCH_ENGINES)) return { ...base, channel: "organic", adPlatform: null };
  if (match(a.referrerHost, SOCIAL_SITES)) return { ...base, channel: "social", adPlatform: null };
  if (a.referrerHost || utm.utm_source) return { ...base, channel: "referral", adPlatform: null };
  return { ...base, channel: "direct", adPlatform: null };
}

const PLATFORM_LABEL: Record<AdPlatform, string> = {
  google: "Google Ads",
  meta: "Facebook / Instagram ad",
  microsoft: "Microsoft (Bing) Ads",
  tiktok: "TikTok ad",
  linkedin: "LinkedIn ad",
  other: "Paid ad",
};

/** Plain-language source for the business email, or null when unknown */
export function sourceLabel(source: LeadSource): string | null {
  const campaign = source.utm.utm_campaign ? ` (${source.utm.utm_campaign})` : "";
  switch (source.channel) {
    case "paid":
      return `${PLATFORM_LABEL[source.adPlatform ?? "other"]}${campaign}`;
    case "organic": {
      const engine = match(source.referrerHost, SEARCH_ENGINES);
      return engine ? `${engine} search` : "Search engine";
    }
    case "social":
      return match(source.referrerHost, SOCIAL_SITES) ?? (source.clickIds.fbclid ? "Facebook" : "Social media");
    case "email":
      return `Email${campaign}`;
    case "referral":
      return source.referrerHost ? `Link on ${source.referrerHost.replace(/^www\./, "")}` : `Link (${source.utm.utm_source})`;
    case "direct":
      return "Direct (typed the address, a bookmark or an app)";
    default:
      return null;
  }
}
