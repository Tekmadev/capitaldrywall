/**
 * Estimator ⇄ quote-form contract (brief §7.5): the estimator's CTA links to
 * `/free-quote?service=basement&size=800&level=comfort&addons=bathroom,wetbar`
 * and the QuoteForm prefills from the same params. Pure functions, safe on server and client.
 */
import { addOnIds, estimator, finishLevelIds, type AddOn, type FinishLevel } from "@/content/pricing";
import { pages } from "@/content/services";

export type EstimatorState = { size: number; level: FinishLevel; addOns: readonly AddOn[] };

/** Server-rendered default: 800 sq ft, Comfort, no add-ons. */
export const estimatorDefaults: EstimatorState = {
  size: estimator.size.initial,
  level: "comfort",
  addOns: [],
};

/** Snap any number to the slider's 300–1,500 range and 50 sq ft step. */
export function clampEstimatorSize(value: number): number {
  const { min, max, step, initial } = estimator.size;
  if (!Number.isFinite(value)) return initial;
  const snapped = Math.round((value - min) / step) * step + min;
  return Math.min(max, Math.max(min, snapped));
}

/** Add-ons in their canonical (schedule) order, de-duplicated. */
export function orderAddOns(addOns: readonly AddOn[]): AddOn[] {
  return addOnIds.filter((id) => addOns.includes(id));
}

/** CTA target: `/free-quote?service=basement&size=…&level=…&addons=…` (addons omitted when none). */
export function estimatorQuoteHref({ size, level, addOns }: EstimatorState): string {
  const params = [`service=basement`, `size=${clampEstimatorSize(size)}`, `level=${level}`];
  const ordered = orderAddOns(addOns);
  if (ordered.length) params.push(`addons=${ordered.join(",")}`);
  return `${pages.quote}?${params.join("&")}`;
}

type ParamReader = { get(name: string): string | null };

/**
 * Read estimator values back from `?size=&level=&addons=` (for the QuoteForm prefill).
 * Returns null when neither a valid size nor a valid level is present. Unknown add-ons are dropped.
 */
export function parseEstimatorParams(params: ParamReader): EstimatorState | null {
  const rawSize = Number.parseInt(params.get("size") ?? "", 10);
  const rawLevel = (params.get("level") ?? "").trim().toLowerCase();
  const hasSize = Number.isFinite(rawSize);
  const level = finishLevelIds.find((id) => id === rawLevel);
  if (!hasSize && !level) return null;
  const addOns = orderAddOns(
    (params.get("addons") ?? "")
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter((s): s is AddOn => (addOnIds as string[]).includes(s)),
  );
  return {
    size: hasSize ? clampEstimatorSize(rawSize) : estimatorDefaults.size,
    level: level ?? estimatorDefaults.level,
    addOns,
  };
}

const sqft = new Intl.NumberFormat("en-CA");

/** "1,050" */
export function formatSqFt(size: number): string {
  return sqft.format(size);
}

/** Quote-form details line: "Estimator: Comfort finish, 800 sq ft, + Bathroom" */
export function estimatorDetailsLine({ size, level, addOns }: EstimatorState): string {
  const parts = [`${estimator.finishLevels[level].label} finish`, `${formatSqFt(size)} sq ft`];
  for (const id of orderAddOns(addOns)) parts.push(`+ ${estimator.addOns[id].label}`);
  return `Estimator: ${parts.join(", ")}`;
}

/** Quote-form size field: "800 sq ft basement" */
export function estimatorSizeLine(size: number): string {
  return `${formatSqFt(clampEstimatorSize(size))} sq ft basement`;
}

/** Analytics size bucket (no exact values needed): "300-599" | "600-899" | "900-1199" | "1200-1500" */
export function estimatorSizeBucket(size: number): string {
  if (size < 600) return "300-599";
  if (size < 900) return "600-899";
  if (size < 1200) return "900-1199";
  return "1200-1500";
}
