/** Display helpers for leads (emails, webhook payload). Pure; safe on client and server. */
import { quoteFields } from "@/content/copy/forms";
import { getService, type ServiceId } from "@/content/services";
import { phoneDigits, postalCode, type ContactMethod, type Timeline } from "./schema";

/** "(613) 555-0123" */
export function formatPhone(raw: string): string {
  const d = phoneDigits(raw);
  return d ? `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}` : raw.trim();
}

/** "+16135550123" (for tel: links) */
export function phoneE164(raw: string): string | null {
  const d = phoneDigits(raw);
  return d ? `+1${d}` : null;
}

/** Postal codes normalised to "K2M 0A1"; neighbourhoods as typed */
export function formatArea(raw: string): string {
  return postalCode(raw) ?? raw.trim();
}

export function serviceLabels(ids: readonly ServiceId[]): string[] {
  return ids.map((id) => getService(id)?.formLabel ?? id);
}

/** "a", "a and b", "a, b and c" (Canadian style, no serial comma) */
export function joinList(items: readonly string[]): string {
  if (items.length <= 1) return items[0] ?? "";
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

/** Services for running text: "drywall repair and skim coat / Level 5" */
export function servicesSentence(ids: readonly ServiceId[]): string {
  return joinList(serviceLabels(ids).map((label) => label.charAt(0).toLowerCase() + label.slice(1)));
}

export function timelineLabel(value: Timeline | null | undefined): string | null {
  return quoteFields.timeline.options.find((o) => o.value === value)?.label ?? null;
}

export function contactMethodLabel(value: ContactMethod | null | undefined): string | null {
  return quoteFields.contactMethod.options.find((o) => o.value === value)?.label ?? null;
}
