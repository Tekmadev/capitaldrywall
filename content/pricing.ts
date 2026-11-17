import { prices } from "./price";
import { feature, type FeatureFlag } from "./site.config";

/*
 * Pricing wording and logic. Every NUMBER comes from content/price.ts (the one file to edit);
 * this file only holds labels, descriptions and the estimator maths.
 * All prices: [CONFIRM] with the owner (copy deck: "CONFIRM all prices").
 */
const from = prices.startingFrom;
const rates = prices.basementEstimator;

export type StartingPrice = {
  id: string;
  service: string;
  /** Lowest typical price in CAD; null = quoted per project */
  from: number | null;
  /** Shown after the price, e.g. "per average room" */
  unit?: string;
  detail: string;
  flag?: FeatureFlag;
};

const homeStartingPrices: StartingPrice[] = [
  {
    id: "drywall-repair",
    service: "Drywall repair",
    from: from.drywallRepair,
    detail: "Patch, tape, three coats, sand. Primer-ready.",
  },
  {
    id: "popcorn-removal",
    service: "Popcorn ceiling removal",
    from: from.popcornRemovalPerRoom,
    detail: "Per average room. Removal, repair and smooth skim coat.",
    flag: "popcornRemoval",
  },
  {
    id: "basement-finishing",
    service: "Basement finishing",
    from: from.basementFinishing,
    detail: "Open-concept rec room, framing to paint.",
  },
];

const drywallStartingPrices: StartingPrice[] = [
  { id: "drywall-repair", service: "Drywall repair", from: from.drywallRepair, detail: "Patch, tape, three coats, sand. Primer-ready." },
  {
    id: "popcorn-removal",
    service: "Popcorn ceiling removal",
    from: from.popcornRemovalPerRoom,
    unit: "per average room",
    detail: "Removal, repair and smooth skim coat.",
    flag: "popcornRemoval",
  },
  {
    id: "installation-finishing",
    service: "Installation & finishing",
    from: from.drywallInstallation,
    detail: "Quoted per project, by square footage.",
  },
  { id: "skim-coating", service: "Skim coating", from: from.skimCoating, detail: "Quoted per room." },
];

const enabled = (p: StartingPrice) => !p.flag || feature(p.flag);

/** Home "Honest starting prices" (3 PriceCards; popcorn hidden when its flag is off). */
export const startingPrices = homeStartingPrices.filter(enabled);
/** Drywall page "Starting prices (drywall)" */
export const drywallPrices = drywallStartingPrices.filter(enabled);

export const pricingFinePrint =
  "Starting prices include labour and standard materials. HST extra. Your written quote is the final word.";

/** Short disclaimer carried by every price and the estimator (brief §13). */
export const estimateNotice = "Estimate only, not a quote. HST extra.";

/* ── Basement budget estimator (brief §7.5, copy deck "Rates") ── */

export type FinishLevel = "essential" | "comfort" | "premium";
export type AddOn = "bathroom" | "bedroom" | "wetbar";
export type Range = { readonly low: number; readonly high: number };

export const estimator = {
  size: rates.size,
  finishLevels: {
    essential: {
      label: "Essential",
      description: "Durable, good-looking basics: vinyl plank floor, pot lights, paint.",
      perSqFt: rates.perSqFt.essential,
    },
    comfort: {
      label: "Comfort",
      description: "Upgraded finishes, more lighting, built-in storage.",
      perSqFt: rates.perSqFt.comfort,
    },
    premium: {
      label: "Premium",
      description: "Custom features, premium flooring and millwork.",
      perSqFt: rates.perSqFt.premium,
    },
  } satisfies Record<FinishLevel, { label: string; description: string; perSqFt: Range }>,
  addOns: {
    bathroom: { label: "Bathroom", cost: rates.addOns.bathroom },
    bedroom: { label: "Bedroom with egress window", cost: rates.addOns.bedroom },
    wetbar: { label: "Wet bar or kitchenette", cost: rates.addOns.wetbar },
  } satisfies Record<AddOn, { label: string; cost: Range }>,
  roundTo: rates.roundTo,
  disclaimer: "Estimate only, based on typical Ottawa projects. Not a quote. HST extra.",
} as const;

export const finishLevelIds = Object.keys(estimator.finishLevels) as FinishLevel[];
export const addOnIds = Object.keys(estimator.addOns) as AddOn[];

const round = (n: number) => Math.round(n / estimator.roundTo) * estimator.roundTo;

/** Live estimate range, rounded to the nearest $1,000 (copy deck). */
export function estimateRange(sqft: number, level: FinishLevel, addOns: readonly AddOn[]): Range {
  const size = Math.min(estimator.size.max, Math.max(estimator.size.min, sqft));
  const rate = estimator.finishLevels[level].perSqFt;
  let low = size * rate.low;
  let high = size * rate.high;
  for (const a of addOns) {
    low += estimator.addOns[a].cost.low;
    high += estimator.addOns[a].cost.high;
  }
  return { low: round(low), high: round(high) };
}
