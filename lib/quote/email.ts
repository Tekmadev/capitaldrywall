/**
 * Quote emails: the business notification (every field, tap-to-call, photo links) and the
 * customer confirmation (copy deck EMAILS, verbatim). Every user value is HTML-escaped.
 * Email clients don't support CSS variables, so the Raking Light palette is inlined here.
 */
import { quoteEmails } from "@/content/copy/forms";
import { firstNameOf, site } from "@/content/site.config";
import {
  contactMethodLabel,
  formatArea,
  formatPhone,
  joinList,
  phoneE164,
  serviceLabels,
  servicesSentence,
  timelineLabel,
} from "./format";
import type { Lead } from "./schema";

export type LeadMeta = {
  receivedAt: Date;
  /** Page the request was sent from */
  source: string | null;
};

export type RenderedEmail = { subject: string; html: string; text: string };

const C = {
  paper: "#F2EFE9",
  sheet: "#FFFFFF",
  ink: "#141518",
  muted: "#5F636A",
  rule: "#CFC8BC",
  amber: "#F4A62A",
};
const SANS = "-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif";
const MONO = "'IBM Plex Mono',ui-monospace,SFMono-Regular,Menlo,Consolas,monospace";

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Escaped, with line breaks kept */
const multiline = (value: string) => escapeHtml(value).replace(/\r?\n/g, "<br>");

/** "Sat, Oct 31, 2026, 10:52 a.m. EDT" in Ottawa time */
export function torontoTimestamp(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Toronto",
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  }).format(date);
}

const areaOf = (lead: Lead) => (lead.form === "full" ? formatArea(lead.area) : null);

/* ── Business notification ─────────────────────────────────────── */

type Row = { label: string; html: string; text: string };

function rows(lead: Lead, meta: LeadMeta): Row[] {
  const dash = { html: `<span style="color:${C.muted}">—</span>`, text: "—" };
  const plain = (value: string | null | undefined) =>
    value ? { html: multiline(value), text: value } : dash;

  const e164 = phoneE164(lead.phone);
  const phone = formatPhone(lead.phone);
  const full = lead.form === "full" ? lead : null;
  const photos = full?.photos ?? [];

  return [
    { label: "Name", ...plain(lead.name) },
    {
      label: "Phone",
      html: e164
        ? `<a href="tel:${e164}" style="color:${C.ink};font-weight:600">${escapeHtml(phone)}</a>`
        : escapeHtml(phone),
      text: phone,
    },
    {
      label: "Email",
      html: `<a href="mailto:${escapeHtml(lead.email)}" style="color:${C.ink}">${escapeHtml(lead.email)}</a>`,
      text: lead.email,
    },
    { label: "Preferred contact", ...plain(contactMethodLabel(full?.contactMethod)) },
    { label: "Services", ...plain(serviceLabels(lead.services).join(", ")) },
    { label: "Area", ...plain(areaOf(lead)) },
    { label: "Timeline", ...plain(timelineLabel(full?.timeline)) },
    { label: "Size", ...plain(full?.size) },
    { label: "Details", ...plain(lead.details) },
    {
      label: "Photos",
      ...(photos.length
        ? {
            html: photos
              .map(
                (p, i) =>
                  `<a href="${escapeHtml(p.url)}" style="color:${C.ink}">Photo ${i + 1}${p.name ? ` · ${escapeHtml(p.name)}` : ""}</a>`,
              )
              .join("<br>"),
            text: photos.map((p, i) => `Photo ${i + 1}: ${p.url}`).join("\n"),
          }
        : dash),
    },
    { label: "Marketing consent", ...plain(lead.marketing ? "Yes" : "No") },
    { label: "Contact consent", ...plain(lead.consent ? "Yes" : "No") },
    { label: "Page source", ...plain(meta.source) },
    { label: "Received", ...plain(torontoTimestamp(meta.receivedAt)) },
  ];
}

export function renderBusinessEmail(lead: Lead, meta: LeadMeta): RenderedEmail {
  const services = serviceLabels(lead.services).join(", ");
  const area = areaOf(lead) ?? "area not given";
  const subject = quoteEmails.business.subject(services, area);
  const list = rows(lead, meta);
  const e164 = phoneE164(lead.phone);

  const html = `<!doctype html>
<html lang="en-CA"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(subject)}</title></head>
<body style="margin:0;padding:0;background:${C.paper}">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.paper};padding:24px 12px">
<tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:640px;background:${C.sheet};border:1px solid ${C.rule};border-collapse:collapse">
<tr><td style="padding:14px 16px;border-bottom:3px solid ${C.amber};font-family:${MONO};font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:${C.muted}">New quote request · ${escapeHtml(site.name)}</td></tr>
<tr><td style="padding:20px 16px 8px;font-family:${SANS};font-size:22px;line-height:1.25;font-weight:700;color:${C.ink}">${escapeHtml(services)}<br><span style="font-weight:400;color:${C.muted}">${escapeHtml(area)}</span></td></tr>
${
  e164
    ? `<tr><td style="padding:8px 16px 20px"><a href="tel:${e164}" style="display:inline-block;padding:12px 18px;background:${C.amber};color:${C.ink};font-family:${SANS};font-size:15px;font-weight:600;text-decoration:none">Call ${escapeHtml(lead.name)} · ${escapeHtml(formatPhone(lead.phone))}</a></td></tr>`
    : ""
}
<tr><td style="padding:0">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse">
${list
  .map(
    (r) =>
      `<tr><th scope="row" align="left" valign="top" style="width:148px;padding:12px 16px;border-top:1px solid ${C.rule};font-family:${MONO};font-size:11px;line-height:1.5;font-weight:500;letter-spacing:0.12em;text-transform:uppercase;color:${C.muted}">${escapeHtml(r.label)}</th><td valign="top" style="padding:12px 16px;border-top:1px solid ${C.rule};font-family:${SANS};font-size:15px;line-height:1.55;color:${C.ink}">${r.html}</td></tr>`,
  )
  .join("\n")}
</table>
</td></tr>
<tr><td style="padding:14px 16px;border-top:1px solid ${C.rule};font-family:${MONO};font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:${C.muted}">Reply to this email to answer ${escapeHtml(firstNameOf(lead.name))} directly</td></tr>
</table>
</td></tr></table>
</body></html>`;

  const text = [
    subject,
    "",
    ...list.map((r) => `${r.label}: ${r.text}`),
  ].join("\n");

  return { subject, html, text };
}

/* ── Customer confirmation (copy deck: EMAILS, verbatim) ───────── */

export function renderCustomerEmail(lead: Lead): RenderedEmail {
  const copy = quoteEmails.customer;
  const firstName = firstNameOf(lead.name) || lead.name;
  const services = servicesSentence(lead.services);
  const paragraphs = [copy.greeting(firstName), copy.body(services), copy.urgent];

  const p = (content: string) =>
    `<p style="margin:0 0 16px;font-family:${SANS};font-size:16px;line-height:1.6;color:${C.ink}">${content}</p>`;

  const html = `<!doctype html>
<html lang="en-CA"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(copy.subject)}</title></head>
<body style="margin:0;padding:0;background:${C.paper}">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.paper};padding:24px 12px">
<tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:${C.sheet};border:1px solid ${C.rule}">
<tr><td style="padding:14px 24px;border-bottom:3px solid ${C.amber};font-family:${MONO};font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:${C.muted}">${escapeHtml(site.name)}</td></tr>
<tr><td style="padding:28px 24px 12px">
${p(escapeHtml(paragraphs[0]))}
${p(escapeHtml(paragraphs[1]))}
${p(
  escapeHtml(copy.urgent).replace(
    escapeHtml(site.phone.display),
    `<a href="tel:${site.phone.e164}" style="color:${C.ink};font-weight:600">${escapeHtml(site.phone.display)}</a>`,
  ),
)}
${p(escapeHtml(copy.signoff))}
</td></tr>
<tr><td style="padding:14px 24px;border-top:1px solid ${C.rule};font-family:${MONO};font-size:11px;letter-spacing:0.12em;color:${C.muted}"><a href="tel:${site.phone.e164}" style="color:${C.muted};text-decoration:none">${escapeHtml(site.phone.display)}</a> · <a href="${escapeHtml(site.url)}" style="color:${C.muted};text-decoration:none">${escapeHtml(site.domain)}</a></td></tr>
</table>
</td></tr></table>
</body></html>`;

  const text = [...paragraphs.flatMap((line) => [line, ""]), copy.signoff, copy.footer].join("\n");

  return { subject: copy.subject, html, text };
}

/** JSON body for LEAD_WEBHOOK_URL (CRM / automation seam) */
export function leadPayload(lead: Lead, meta: LeadMeta) {
  const full = lead.form === "full" ? lead : null;
  return {
    event: "quote.requested",
    receivedAt: meta.receivedAt.toISOString(),
    receivedAtLocal: torontoTimestamp(meta.receivedAt),
    form: lead.form,
    source: meta.source,
    services: lead.services.map((id, i) => ({ id, label: serviceLabels(lead.services)[i] })),
    servicesText: joinList(serviceLabels(lead.services)),
    area: areaOf(lead),
    timeline: full?.timeline ?? null,
    timelineLabel: timelineLabel(full?.timeline),
    size: full?.size || null,
    details: lead.details || null,
    photos: full?.photos ?? [],
    contact: {
      name: lead.name,
      firstName: firstNameOf(lead.name),
      phone: formatPhone(lead.phone),
      phoneE164: phoneE164(lead.phone),
      email: lead.email,
      preferred: full?.contactMethod ?? null,
    },
    consent: { contact: lead.consent, marketing: Boolean(lead.marketing) },
  };
}
