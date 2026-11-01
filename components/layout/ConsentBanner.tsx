import { pages } from "@/content/services";
import { integrations } from "@/content/site.config";
import { ConsentBannerClient } from "./ConsentBannerClient";

/** GA4 measurement ids look like G-XXXXXXXXXX; anything else never reaches a script tag. */
const GA_ID = /^G-[A-Z0-9]{4,20}$/;

/**
 * GA4 consent banner (brief §12–13). Renders only when NEXT_PUBLIC_GA_ID is set; otherwise the site
 * is cookieless and there is nothing to ask. GA4 loads only after the visitor accepts.
 */
export function ConsentBanner() {
  const gaId = integrations.gaId;
  if (!gaId || !GA_ID.test(gaId)) return null;
  return <ConsentBannerClient gaId={gaId} privacyHref={pages.privacy} />;
}
