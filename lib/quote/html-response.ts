/**
 * Plain HTML answer for no-JS form posts that can't redirect to /thank-you (validation errors,
 * rate limit, delivery failure). Copy is verbatim from the copy deck; styles are inline so the page
 * stands alone.
 */
import { quoteButtons, quoteErrors } from "@/content/copy/forms";
import { site } from "@/content/site.config";
import { escapeHtml } from "./email";

export function quoteErrorPage({
  status,
  messages = [],
  backHref,
}: {
  status: number;
  /** Field errors to list (copy-deck strings) */
  messages?: string[];
  backHref: string;
}): Response {
  const tel = `<a href="tel:${site.phone.e164}">${escapeHtml(site.phone.display)}</a>`;
  const generic = `${escapeHtml(quoteErrors.generic.before)}${tel}${escapeHtml(quoteErrors.generic.after)}`;
  const list = messages.length
    ? `<ul>${messages.map((m) => `<li>${escapeHtml(m)}</li>`).join("")}</ul>`
    : `<p>${generic}</p>`;

  const html = `<!doctype html>
<html lang="en-CA"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex">
<title>${escapeHtml(site.name)}</title>
<style>
body{margin:0;background:#F2EFE9;color:#141518;font:17px/1.6 -apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif}
main{max-width:36rem;margin:12vh auto;padding:0 1.25rem}
.spec{font:500 12px/1.4 ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.14em;text-transform:uppercase;color:#5F636A;border-bottom:1px solid #CFC8BC;padding-bottom:.75rem}
ul{padding-left:1.1rem;color:#A8321E}
a{color:#141518;font-weight:600}
.back{display:inline-flex;align-items:center;min-height:44px;margin-top:1rem;padding:0 1.25rem;border:1px solid #141518;text-decoration:none;font-weight:500}
a:focus-visible{outline:2px solid #F4A62A;outline-offset:3px;box-shadow:0 0 0 3px #141518}
</style></head>
<body><main>
<p class="spec">${escapeHtml(site.name)}</p>
${list}
<a class="back" href="${escapeHtml(backHref)}">${escapeHtml(quoteButtons.back)}</a>
</main></body></html>`;

  return new Response(html, {
    status,
    headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" },
  });
}
