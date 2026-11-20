/**
 * Tekmadev lead log: every quote request is recorded in Tekmadev's database (Supabase table
 * public.client_site_leads) WITHOUT contact details: when, which services, postal-code FSA, how the
 * visitor found the site, and whether the notification email was accepted/delivered. The lead's
 * ref (e.g. CDR-0042) goes in the business email subject so the log and the inbox match one to one.
 *
 * Writes go through three SECURITY DEFINER functions with the project's publishable key and this
 * site's LEAD_LOG_SECRET (the database stores only its sha256). Nothing here may ever block or fail
 * a lead: every call has a short timeout, never throws, and logs no personal data.
 */
import { site } from "@/content/site.config";
import { serviceLabels } from "@/lib/quote/format";
import { postalCode } from "@/lib/quote/schema";
import type { Lead } from "@/lib/quote/schema";
import type { LeadSource } from "./source";

const TIMEOUT_MS = 2500;

function config() {
  const url = process.env.LEAD_LOG_URL?.trim().replace(/\/+$/, "") || null;
  const apiKey = process.env.LEAD_LOG_API_KEY?.trim() || null;
  const secret = process.env.LEAD_LOG_SECRET?.trim() || null;
  return url && apiKey && secret ? { url, apiKey, secret } : null;
}

export const leadLogEnabled = () => config() !== null;

async function rpc<T>(fn: string, args: Record<string, unknown>): Promise<T | null> {
  const cfg = config();
  if (!cfg) return null;
  try {
    const res = await fetch(`${cfg.url}/rest/v1/rpc/${fn}`, {
      method: "POST",
      headers: { apikey: cfg.apiKey, "content-type": "application/json", accept: "application/json" },
      body: JSON.stringify({ p_key: cfg.secret, ...args }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
      cache: "no-store",
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.error(`[lead-log] ${fn} failed: ${res.status} ${body.slice(0, 200)}`);
      return null;
    }
    if (res.status === 204) return null;
    return (await res.json()) as T;
  } catch (err) {
    console.error(`[lead-log] ${fn} failed:`, err instanceof Error ? err.message : String(err));
    return null;
  }
}

/** Postal-code FSA ("K2M"), a matched service-area name, or null. Never a street address. */
export function leadArea(lead: Lead): string | null {
  if (lead.form !== "full") return null;
  const postal = postalCode(lead.area);
  if (postal) return postal.slice(0, 3);
  const typed = lead.area.toLowerCase();
  const known = site.serviceAreas
    .map((area) => area.replace(/\s*\(.*\)\s*$/, ""))
    .find((name) => typed.includes(name.toLowerCase()));
  return known ?? null;
}

/** Logged from anything but the live production site */
const isTestEnvironment = () => site.mode !== "production" || process.env.VERCEL_ENV !== "production";

export type LoggedLead = { id: string; ref: string };

export async function logLead(lead: Lead, source: LeadSource, pagePath: string | null): Promise<LoggedLead | null> {
  const full = lead.form === "full" ? lead : null;
  const result = await rpc<{ id?: unknown; ref?: unknown }>("site_lead_log", {
    p_lead: {
      form: lead.form,
      // Human-readable names, so the admin can show any client site's leads without a mapping
      services: serviceLabels(lead.services),
      area: leadArea(lead),
      timeline: full?.timeline ?? null,
      photo_count: String(full?.photos?.length ?? 0),
      marketing_consent: Boolean(lead.marketing),
      page_path: pagePath,
      channel: source.channel,
      ad_platform: source.adPlatform,
      ...source.utm,
      click_ids: source.clickIds,
      referrer_host: source.referrerHost,
      landing_path: source.landingPath,
      first_seen_at: source.firstSeenAt,
      is_test: isTestEnvironment(),
    },
  });
  return typeof result?.id === "string" && typeof result.ref === "string" ? { id: result.id, ref: result.ref } : null;
}

/** After the business email: sent (Resend accepted it), failed, or not_sent (no email channel) */
export async function logEmailResult(
  logged: LoggedLead,
  status: "sent" | "failed" | "not_sent",
  messageId?: string | null,
  error?: string | null,
): Promise<void> {
  await rpc("site_lead_email_result", {
    p_lead_id: logged.id,
    p_status: status,
    p_message_id: messageId ?? null,
    p_error: error ?? null,
  });
}

/** Resend webhook event for a notification email (unknown message ids are ignored by the database) */
export async function logEmailEvent(messageId: string, event: string, at: string | null): Promise<boolean> {
  const matched = await rpc<boolean>("site_lead_email_event", {
    p_message_id: messageId,
    p_event: event,
    p_at: at,
  });
  return matched === true;
}
