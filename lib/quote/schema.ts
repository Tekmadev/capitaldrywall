/**
 * The quote request schema, shared by the client forms (react-hook-form + zodResolver) and
 * POST /api/quote. Error strings are verbatim from the copy deck (content/copy/forms.ts).
 */
import { z } from "zod";
import { quoteErrors as e, type QuoteStepNumber } from "@/content/copy/forms";
import { services, type ServiceId } from "@/content/services";

export const MAX_PHOTOS = 6;
/** Largest photo a customer may pick (before client-side compression) */
export const MAX_PHOTO_BYTES = 10 * 1024 * 1024;
/** Largest file the upload token allows (after compression to ~2 MB) */
export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;
/** Minimum time between the form appearing and its submission (anti-spam) */
export const MIN_FILL_MS = 3000;

/** Enabled services only (feature flags applied), e.g. no popcorn tile when its flag is off */
export const serviceIds = services.map((s) => s.id) as [ServiceId, ...ServiceId[]];
export const timelineValues = ["asap", "month", "quarter", "planning"] as const;
export const contactMethodValues = ["call", "text", "email"] as const;
export type Timeline = (typeof timelineValues)[number];
export type ContactMethod = (typeof contactMethodValues)[number];

/**
 * 10-digit Canadian (NANP) number from tolerant input: "613 555 0123", "(613) 555-0123",
 * "613.555.0123", "+1 613-555-0123". Returns the digits, or null when it isn't a real number.
 */
export function phoneDigits(raw: string): string | null {
  const value = raw.trim();
  if (!value || !/^[\d\s().+-]+$/.test(value)) return null;
  let digits = value.replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("1")) digits = digits.slice(1);
  return /^[2-9]\d{2}[2-9]\d{6}$/.test(digits) ? digits : null;
}

/** Canadian postal code (A1A 1A1 / A1A1A1), or null */
const POSTAL = /^([ABCEGHJ-NPRSTVXY]\d[ABCEGHJ-NPRSTV-Z])[ -]?(\d[ABCEGHJ-NPRSTV-Z]\d)$/i;
export function postalCode(raw: string): string | null {
  const m = POSTAL.exec(raw.trim());
  return m ? `${m[1]} ${m[2]}`.toUpperCase() : null;
}

/** Photos must live in this site's Vercel Blob store (unguessable URLs, never arbitrary links) */
const BLOB_URL = /^https:\/\/[a-z0-9-]+\.public\.blob\.vercel-storage\.com\/[\w./%-]+$/i;

const servicesField = z
  .array(z.enum(serviceIds, { error: e.services }), { error: e.services })
  .min(1, e.services)
  .max(serviceIds.length, e.services);

const nameField = z.string(e.name).trim().min(1, e.name).max(120, e.name);
const phoneField = z
  .string(e.phone)
  .trim()
  .max(40, e.phone)
  .refine((v) => phoneDigits(v) !== null, e.phone);
const emailField = z.string(e.email).trim().max(254, e.email).pipe(z.email(e.email));
/** Accepts A1A 1A1, A1A1A1, or a neighbourhood name of 2+ characters */
const areaField = z.string(e.area).trim().min(2, e.area).max(80, e.area);
const consentField = z.boolean(e.consent).refine((v) => v, e.consent);
const optionalText = (max: number) => z.string().trim().max(max).optional();

export const photoSchema = z.object({
  url: z.string().max(600).regex(BLOB_URL),
  name: z.string().trim().max(160).optional(),
});
export type QuotePhoto = z.output<typeof photoSchema>;

const contactFields = {
  name: nameField,
  phone: phoneField,
  email: emailField,
  consent: consentField,
  /** CASL: separate, optional, unchecked by default */
  marketing: z.boolean().optional(),
  /** Page the request was sent from */
  source: z.string().trim().max(300).optional(),
};

/** Full multi-step form on /free-quote */
export const quoteSchema = z.object({
  form: z.literal("full"),
  services: servicesField,
  area: areaField,
  timeline: z.enum(timelineValues).nullish(),
  size: optionalText(120),
  details: optionalText(4000),
  photos: z.array(photoSchema).max(MAX_PHOTOS).optional(),
  contactMethod: z.enum(contactMethodValues).nullish(),
  ...contactFields,
});

/** One-step form in the service pages' final CTA */
export const compactQuoteSchema = z.object({
  form: z.literal("compact"),
  services: servicesField,
  details: optionalText(2000),
  ...contactFields,
});

/** What POST /api/quote accepts */
export const leadSchema = z.discriminatedUnion("form", [quoteSchema, compactQuoteSchema]);

export type QuoteInput = z.input<typeof quoteSchema>;
export type QuoteOutput = z.output<typeof quoteSchema>;
export type CompactQuoteInput = z.input<typeof compactQuoteSchema>;
export type CompactQuoteOutput = z.output<typeof compactQuoteSchema>;
export type Lead = z.output<typeof leadSchema>;

/** Fields validated before the full form leaves each step */
export const stepFields = {
  1: ["services"],
  2: ["area", "timeline", "size", "details"],
  3: ["name", "phone", "email", "contactMethod", "consent", "marketing"],
} as const satisfies Record<QuoteStepNumber, ReadonlyArray<keyof QuoteInput>>;

/** The step a field lives on (for jumping back to a server-side error) */
export function stepOfField(field: string): QuoteStepNumber | null {
  for (const n of [1, 2, 3] as const) {
    if ((stepFields[n] as ReadonlyArray<string>).includes(field)) return n;
  }
  return null;
}
