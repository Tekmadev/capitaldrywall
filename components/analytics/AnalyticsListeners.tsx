"use client";

import { useEffect } from "react";
import { track } from "@/lib/analytics";

/**
 * Sitewide event delegation, so server components need no client code:
 *  - every `a[href^="tel:"]` click → call_click { location } (from data-location or the nearest
 *    [data-track-location] ancestor)
 *  - every `<details data-faq-id>` opened → faq_open { id }
 */
export function AnalyticsListeners() {
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const target = event.target as Element | null;
      const link = target?.closest?.('a[href^="tel:"]');
      if (!link) return;
      const location =
        link.getAttribute("data-location") ??
        link.closest("[data-track-location]")?.getAttribute("data-track-location") ??
        "unknown";
      track("call_click", { location, page: window.location.pathname });
    };
    const onToggle = (event: Event) => {
      const details = event.target;
      if (details instanceof HTMLDetailsElement && details.open && details.dataset.faqId) {
        track("faq_open", { id: details.dataset.faqId, page: window.location.pathname });
      }
    };
    document.addEventListener("click", onClick, { capture: true });
    document.addEventListener("toggle", onToggle, { capture: true });
    return () => {
      document.removeEventListener("click", onClick, { capture: true });
      document.removeEventListener("toggle", onToggle, { capture: true });
    };
  }, []);
  return null;
}
