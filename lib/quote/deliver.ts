/**
 * Lead delivery for POST /api/quote (brief §12):
 *  1. business notification via Resend (reply-to the customer)
 *  2. customer confirmation via Resend (after the response; never blocks the lead)
 *  3. LEAD_WEBHOOK_URL, when set (timeout; failures logged, not fatal while email worked)
 * A lead counts as delivered when at least one channel took it. Demo mode without any channel logs
 * a minimal line (services + area, never contact details) and succeeds; production with no channel
 * fails loudly so leads are never silently lost.
 */
import { after } from "next/server";
import { Resend } from "resend";
import { isDemo, site } from "@/content/site.config";
import { leadPayload, renderBusinessEmail, renderCustomerEmail, type LeadMeta } from "./email";
import type { Lead } from "./schema";
import { postLeadWebhook } from "./webhook";

function config() {
  const resendKey = process.env.RESEND_API_KEY?.trim() || null;
  const from = process.env.QUOTE_FROM_EMAIL?.trim() || null;
  const to = (process.env.QUOTE_TO_EMAIL ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const webhook = process.env.LEAD_WEBHOOK_URL?.trim() || null;
  return { resendKey, from, to, webhook, emailReady: Boolean(resendKey && from && to.length) };
}

/** Minimal, PII-free trace of a lead (services + area only) */
function logLead(message: string, lead: Lead) {
  console.info(`[quote] ${message}`, {
    form: lead.form,
    services: lead.services,
    area: lead.form === "full" ? lead.area : null,
  });
}

export async function deliverLead(lead: Lead, meta: LeadMeta): Promise<{ ok: boolean }> {
  const { resendKey, from, to, webhook, emailReady } = config();

  if (!emailReady && !webhook) {
    if (isDemo) {
      logLead("demo mode: no delivery channel configured, lead logged only", lead);
      return { ok: true };
    }
    console.error(
      "[quote] no delivery channel: set RESEND_API_KEY + QUOTE_FROM_EMAIL + QUOTE_TO_EMAIL, or LEAD_WEBHOOK_URL",
    );
    return { ok: false };
  }

  let delivered = false;
  const resend = emailReady && resendKey ? new Resend(resendKey) : null;

  if (resend && from) {
    const email = renderBusinessEmail(lead, meta);
    try {
      const { error } = await resend.emails.send({
        from,
        to,
        replyTo: lead.email,
        subject: email.subject,
        html: email.html,
        text: email.text,
      });
      if (error) console.error("[quote] business email failed:", error.message);
      else delivered = true;
    } catch (err) {
      console.error("[quote] business email failed:", err instanceof Error ? err.message : String(err));
    }
  }

  if (webhook) {
    const payload = leadPayload(lead, meta);
    if (delivered) {
      after(() => postLeadWebhook(webhook, payload).then(() => undefined));
    } else {
      delivered = await postLeadWebhook(webhook, payload);
    }
  }

  if (delivered && resend && from) {
    const confirmation = renderCustomerEmail(lead);
    after(async () => {
      try {
        const { error } = await resend.emails.send({
          from,
          to: [lead.email],
          replyTo: to[0] ?? site.email,
          subject: confirmation.subject,
          html: confirmation.html,
          text: confirmation.text,
        });
        if (error) console.error("[quote] confirmation email failed:", error.message);
      } catch (err) {
        console.error("[quote] confirmation email failed:", err instanceof Error ? err.message : String(err));
      }
    });
  }

  if (!delivered && isDemo) {
    logLead("demo mode: delivery failed, lead logged only", lead);
    return { ok: true };
  }
  return { ok: delivered };
}
