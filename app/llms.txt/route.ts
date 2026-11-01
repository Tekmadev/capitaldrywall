import { buildLlmsTxt } from "@/lib/llms";

/** /llms.txt: a plain-text brief for AI assistants, generated from /content (brief §11). */
export function GET() {
  return new Response(buildLlmsTxt(), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
