/**
 * POST /api/resend-webhook: Resend delivery events (sent, delivered, delayed, bounced, complained,
 * failed) for the business notification emails, relayed to the Tekmadev lead log so each lead shows
 * whether it actually reached the client's inbox. Events for other emails (customer confirmations)
 * match no lead and are ignored.
 *
 * Resend signs webhooks with Svix: HMAC-SHA256 over "{svix-id}.{svix-timestamp}.{raw body}" with the
 * endpoint's signing secret (RESEND_WEBHOOK_SECRET, "whsec_…"). Unsigned, stale or forged requests
 * get a 400; without the secret configured the endpoint doesn't exist (404).
 */
import { createHmac, timingSafeEqual } from "node:crypto";
import { logEmailEvent } from "@/lib/lead-log";

const TOLERANCE_SEC = 5 * 60;
const EVENTS = new Set([
  "email.sent",
  "email.delivered",
  "email.delivery_delayed",
  "email.bounced",
  "email.complained",
  "email.failed",
]);

function verify(secret: string, id: string, timestamp: string, body: string, header: string): boolean {
  const ts = Number(timestamp);
  if (!Number.isFinite(ts) || Math.abs(Date.now() / 1000 - ts) > TOLERANCE_SEC) return false;
  const key = Buffer.from(secret.replace(/^whsec_/, ""), "base64");
  const expected = createHmac("sha256", key).update(`${id}.${timestamp}.${body}`).digest();
  return header.split(" ").some((part) => {
    const [version, signature] = part.split(",", 2);
    if (version !== "v1" || !signature) return false;
    const given = Buffer.from(signature, "base64");
    return given.length === expected.length && timingSafeEqual(given, expected);
  });
}

export async function POST(request: Request) {
  const secret = process.env.RESEND_WEBHOOK_SECRET?.trim();
  if (!secret) return new Response("Not found", { status: 404 });

  const id = request.headers.get("svix-id");
  const timestamp = request.headers.get("svix-timestamp");
  const signature = request.headers.get("svix-signature");
  const body = await request.text();
  if (!id || !timestamp || !signature || !verify(secret, id, timestamp, body, signature)) {
    return new Response("Invalid signature", { status: 400 });
  }

  let event: { type?: unknown; created_at?: unknown; data?: { email_id?: unknown } };
  try {
    event = JSON.parse(body);
  } catch {
    return new Response("Bad payload", { status: 400 });
  }

  const type = typeof event.type === "string" ? event.type : "";
  const messageId = typeof event.data?.email_id === "string" ? event.data.email_id : "";
  if (EVENTS.has(type) && messageId) {
    const at = typeof event.created_at === "string" ? event.created_at : null;
    await logEmailEvent(messageId, type, at);
  }
  // Always 200 once verified, so Resend doesn't retry events we don't track
  return Response.json({ ok: true }, { headers: { "cache-control": "no-store" } });
}
