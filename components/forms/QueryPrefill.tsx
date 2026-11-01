"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { addOnIds, estimator, finishLevelIds, type AddOn } from "@/content/pricing";
import { getService, resolveServiceParam, type ServiceId } from "@/content/services";

export type QuotePrefill = {
  services: ServiceId[];
  area?: string;
  size?: string;
  details?: string;
};

/**
 * `/free-quote?service=repair,basement&area=Kanata` and the estimator's
 * `?service=basement&size=800&level=comfort&addons=bathroom,wetbar`.
 */
export function parseQuoteParams(params: URLSearchParams): QuotePrefill | null {
  const services = resolveServiceParam(params.get("service"));
  const area = params.get("area")?.trim().slice(0, 80) || undefined;

  const sizeRaw = Number(params.get("size"));
  const size =
    Number.isFinite(sizeRaw) && sizeRaw >= estimator.size.min && sizeRaw <= estimator.size.max
      ? Math.round(sizeRaw)
      : null;
  const levelRaw = params.get("level")?.trim().toLowerCase();
  const level = finishLevelIds.find((l) => l === levelRaw) ?? null;
  const addOns = [
    ...new Set(
      (params.get("addons") ?? "")
        .split(",")
        .map((a) => a.trim().toLowerCase())
        .filter((a): a is AddOn => (addOnIds as string[]).includes(a)),
    ),
  ];

  const fromEstimator = size !== null || level !== null || addOns.length > 0;
  if (fromEstimator && !services.includes("basement-renovation") && getService("basement-renovation")) {
    services.push("basement-renovation");
  }

  const sqft = size !== null ? `${size.toLocaleString("en-CA")} sq ft` : null;
  const parts = [
    level ? `${estimator.finishLevels[level].label} finish` : null,
    sqft,
    ...addOns.map((a) => `+ ${estimator.addOns[a].label}`),
  ].filter((p): p is string => Boolean(p));

  const prefill: QuotePrefill = {
    services,
    area,
    size: sqft ? `${sqft} basement` : undefined,
    details: fromEstimator ? `Estimator: ${parts.join(", ")}` : undefined,
  };
  return services.length || prefill.area || prefill.size || prefill.details ? prefill : null;
}

/**
 * Hands the query-string prefill to the form: on mount, and again whenever the query changes while
 * the form stays mounted (a soft navigation such as the footer's /free-quote?area=… links). Render
 * it inside <Suspense> (useSearchParams), as a sibling of the fields, so the form itself stays in
 * the static HTML.
 */
export function QueryPrefill({ onPrefill }: { onPrefill: (prefill: QuotePrefill) => void }) {
  const query = useSearchParams().toString();
  const lastQuery = useRef<string | null>(null);

  useEffect(() => {
    if (query === lastQuery.current) return;
    lastQuery.current = query;
    const prefill = parseQuoteParams(new URLSearchParams(query));
    if (prefill) onPrefill(prefill);
  }, [query, onPrefill]);

  return null;
}
