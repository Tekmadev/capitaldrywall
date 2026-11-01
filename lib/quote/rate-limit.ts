/**
 * In-memory sliding-window rate limiter (per server instance). Good enough to blunt form spam on a
 * small site; swap for a shared store (e.g. Upstash) if the site ever runs many instances.
 */

type Bucket = Map<string, number[]>;

/* Kept on globalThis so dev hot reloads don't reset the windows */
const holder = globalThis as { __cdrRateLimits?: Map<string, Bucket> };
const store: Map<string, Bucket> = (holder.__cdrRateLimits ??= new Map<string, Bucket>());

export type RateLimitResult = { ok: boolean; remaining: number; retryAfterSec: number };

export function rateLimit(
  name: string,
  key: string,
  { limit, windowMs }: { limit: number; windowMs: number },
): RateLimitResult {
  const now = Date.now();
  let bucket = store.get(name);
  if (!bucket) {
    bucket = new Map();
    store.set(name, bucket);
  }

  const hits = (bucket.get(key) ?? []).filter((t) => now - t < windowMs);
  if (hits.length >= limit) {
    bucket.set(key, hits);
    return { ok: false, remaining: 0, retryAfterSec: Math.max(1, Math.ceil((hits[0] + windowMs - now) / 1000)) };
  }
  hits.push(now);
  bucket.set(key, hits);

  // Keep memory bounded: drop idle keys now and then
  if (bucket.size > 2000) {
    for (const [k, times] of bucket) {
      if (!times.some((t) => now - t < windowMs)) bucket.delete(k);
    }
  }
  return { ok: true, remaining: limit - hits.length, retryAfterSec: 0 };
}

/** Client IP from the platform's proxy headers (Vercel sets both; the first x-forwarded-for hop is the client). */
export function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const first = forwarded?.split(",")[0]?.trim();
  if (first) return first;
  return request.headers.get("x-real-ip")?.trim() || "unknown";
}
