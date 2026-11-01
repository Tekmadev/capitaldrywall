/**
 * POST /api/quote (brief §12). Accepts JSON (the enhanced forms' fetch) and form posts
 * (urlencoded / multipart from the no-JS forms). Order: rate limit → honeypot → fill time →
 * shared zod schema → delivery. JSON answers { ok, redirect } / { ok: false, … };
 * form posts get a 303 to /thank-you or a plain HTML error page.
 */
import { connection } from "next/server";
import { z } from "zod";
import { pages } from "@/content/services";
import { site } from "@/content/site.config";
import { deliverLead } from "@/lib/quote/deliver";
import { renderBusinessEmail, renderCustomerEmail } from "@/lib/quote/email";
import { quoteErrorPage } from "@/lib/quote/html-response";
import { clientIp, rateLimit } from "@/lib/quote/rate-limit";
import { leadSchema, MIN_FILL_MS, type Lead } from "@/lib/quote/schema";

const LIMIT = { limit: 5, windowMs: 10 * 60 * 1000 };

type Raw = Record<string, unknown>;

const json = (body: unknown, status = 200, headers?: HeadersInit) =>
  Response.json(body, { status, headers: { "cache-control": "no-store", ...headers } });

const isFilled = (value: unknown) => typeof value === "string" && value.trim() !== "";

/** Same-origin page the form was posted from (for "page source" and the error page's Back link) */
function refererPath(request: Request): string | null {
  const referer = request.headers.get("referer");
  if (!referer) return null;
  try {
    const ref = new URL(referer);
    return ref.origin === new URL(request.url).origin ? `${ref.pathname}${ref.search}` : null;
  } catch {
    return null;
  }
}

function formToRaw(fd: FormData): Raw {
  const str = (key: string) => {
    const v = fd.get(key);
    return typeof v === "string" ? v : undefined;
  };
  const checked = (key: string) => ["on", "true", "1", "yes"].includes((str(key) ?? "").toLowerCase());
  return {
    form: str("form") || "compact",
    services: fd.getAll("services").filter((v): v is string => typeof v === "string" && v !== ""),
    area: str("area"),
    timeline: str("timeline") || undefined,
    size: str("size"),
    details: str("details"),
    name: str("name"),
    phone: str("phone"),
    email: str("email"),
    contactMethod: str("contactMethod") || undefined,
    consent: checked("consent"),
    marketing: checked("marketing"),
    source: str("source"),
    website: str("website"),
    startedAt: str("startedAt"),
    submittedAt: str("submittedAt"),
  };
}

async function readBody(request: Request, isForm: boolean): Promise<Raw | null> {
  try {
    if (isForm) return formToRaw(await request.formData());
    const body: unknown = await request.json();
    return body && typeof body === "object" && !Array.isArray(body) ? (body as Raw) : null;
  } catch {
    return null;
  }
}

/** Milliseconds the visitor spent on the form, or null when the client sent no timestamp. */
function fillTime(raw: Raw): number | null {
  const started = Number(raw.startedAt);
  if (!Number.isFinite(started) || started <= 0) return null;
  // Prefer the client's own clock at submit (immune to client/server clock skew)
  const submitted = Number(raw.submittedAt);
  const end = Number.isFinite(submitted) && submitted >= started ? submitted : Date.now();
  return end - started;
}

export async function POST(request: Request) {
  const type = request.headers.get("content-type") ?? "";
  const isForm = /application\/x-www-form-urlencoded|multipart\/form-data/i.test(type);
  const isJson = /application\/json/i.test(type);
  if (!isForm && !isJson) return json({ ok: false, error: "unsupported-media-type" }, 415);

  const backHref = refererPath(request) ?? pages.quote;
  const success = () =>
    isForm
      ? Response.redirect(new URL(pages.thankYou, request.url), 303)
      : json({ ok: true, redirect: pages.thankYou });

  const limited = rateLimit("quote", clientIp(request), LIMIT);
  if (!limited.ok) {
    const headers = { "retry-after": String(limited.retryAfterSec) };
    if (isForm) {
      const page = quoteErrorPage({ status: 429, backHref });
      page.headers.set("retry-after", headers["retry-after"]);
      return page;
    }
    return json({ ok: false, error: "rate-limited" }, 429, headers);
  }

  const raw = await readBody(request, isForm);
  if (!raw) return isForm ? quoteErrorPage({ status: 400, backHref }) : json({ ok: false, error: "bad-request" }, 400);

  // Honeypot filled: pretend it worked, send nothing
  if (isFilled(raw.website)) return success();

  // Minimum fill time. The enhanced forms always send a timestamp; no-JS posts can't, so they rely
  // on the honeypot and the rate limit.
  const elapsed = fillTime(raw);
  if ((elapsed === null && !isForm) || (elapsed !== null && elapsed < MIN_FILL_MS)) {
    return isForm ? quoteErrorPage({ status: 400, backHref }) : json({ ok: false, error: "too-fast" }, 400);
  }

  const parsed = leadSchema.safeParse(raw);
  if (!parsed.success) {
    const { fieldErrors } = z.flattenError(parsed.error);
    if (isForm) {
      const messages = [...new Set(Object.values(fieldErrors).flatMap((m) => (m as string[] | undefined) ?? []))];
      return quoteErrorPage({ status: 400, messages, backHref });
    }
    return json({ ok: false, error: "validation", fieldErrors }, 400);
  }

  const lead = parsed.data;
  const { ok } = await deliverLead(lead, {
    receivedAt: new Date(),
    source: lead.source || refererPath(request),
  });
  if (!ok) return isForm ? quoteErrorPage({ status: 500, backHref }) : json({ ok: false, error: "delivery-failed" }, 500);

  return success();
}

/**
 * Demo/dev only: preview the two emails with a sample lead.
 * /api/quote?preview=business | customer, add &format=text for the plain-text part.
 */
export async function GET(request: Request) {
  await connection();
  if (site.mode === "production" || process.env.VERCEL_ENV === "production") {
    return new Response("Not found", { status: 404 });
  }
  const params = new URL(request.url).searchParams;
  const sample: Lead = {
    form: "full",
    services: ["drywall-repair", "skim-coat-level-5"],
    area: "k2m0a1",
    timeline: "month",
    size: "one ceiling",
    details: "Water stain and a crack over the stairwell.\nCeiling is about 12 x 14.",
    photos: [],
    name: "Sam Tremblay",
    phone: "613 555 0142",
    email: "sam@example.com",
    contactMethod: "text",
    consent: true,
    marketing: false,
    source: "/free-quote",
  };
  const email =
    params.get("preview") === "customer"
      ? renderCustomerEmail(sample)
      : renderBusinessEmail(sample, { receivedAt: new Date(), source: sample.source ?? null });
  const text = params.get("format") === "text";
  return new Response(text ? `Subject: ${email.subject}\n\n${email.text}` : email.html, {
    headers: {
      "content-type": `${text ? "text/plain" : "text/html"}; charset=utf-8`,
      "cache-control": "no-store",
      "x-robots-tag": "noindex",
    },
  });
}
