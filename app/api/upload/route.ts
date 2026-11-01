/**
 * Vercel Blob client-upload token route for quote photos (brief §12–13).
 * GET probes availability (200, or 503 when BLOB_READ_WRITE_TOKEN is missing: the demo).
 * POST hands out short-lived tokens: images only, ≤ 4 MB after compression, random suffix
 * (unguessable URLs), under quotes/YYYY/MM/, with a small per-IP token budget.
 */
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { connection } from "next/server";
import { clientIp, rateLimit } from "@/lib/quote/rate-limit";
import { MAX_UPLOAD_BYTES } from "@/lib/quote/schema";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif", "image/avif"];
const PATHNAME = /^quotes\/\d{4}\/(0[1-9]|1[0-2])\/[a-z0-9][a-z0-9._-]{0,100}$/;
const TOKEN_LIMIT = { limit: 24, windowMs: 10 * 60 * 1000 };

const disabled = () =>
  Response.json({ error: "uploads-disabled" }, { status: 503, headers: { "cache-control": "no-store" } });

export async function GET() {
  await connection();
  if (!process.env.BLOB_READ_WRITE_TOKEN) return disabled();
  return Response.json({ enabled: true }, { headers: { "cache-control": "no-store" } });
}

export async function POST(request: Request) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return disabled();

  let body: HandleUploadBody;
  try {
    body = (await request.json()) as HandleUploadBody;
  } catch {
    return Response.json({ error: "bad-request" }, { status: 400 });
  }

  // Only token requests come from browsers; completion callbacks come from Vercel
  if (body.type === "blob.generate-client-token") {
    const limited = rateLimit("upload", clientIp(request), TOKEN_LIMIT);
    if (!limited.ok) {
      return Response.json(
        { error: "rate-limited" },
        { status: 429, headers: { "retry-after": String(limited.retryAfterSec) } },
      );
    }
  }

  try {
    const result = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        if (!PATHNAME.test(pathname)) throw new Error("Invalid upload path");
        return {
          allowedContentTypes: ALLOWED_TYPES,
          maximumSizeInBytes: MAX_UPLOAD_BYTES,
          addRandomSuffix: true,
        };
      },
      onUploadCompleted: async () => {
        // Photos are referenced by URL in the quote email; nothing else to record.
      },
    });
    return Response.json(result);
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : "upload-failed" },
      { status: 400 },
    );
  }
}
