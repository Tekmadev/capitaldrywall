import { buildLlmsFullTxt } from "@/lib/llms";

/** /llms-full.txt: llms.txt plus the full service copy, prices, process and areas (brief §11). */
export function GET() {
  return new Response(buildLlmsFullTxt(), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
