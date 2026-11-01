import { feature, type FeatureFlag } from "./site.config";

/* All prices: [CONFIRM] with the owner (copy deck: "CONFIRM all prices"). */

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
    from: 300,
    detail: "Patch, tape, three coats, sand. Primer-ready.",
  },
  {
    id: "popcorn-removal",
    service: "Popcorn ceiling removal",
    from: 1000,
    detail: "Per average room. Removal, repair and smooth skim coat.",
    flag: "popcornRemoval",
  },
  {
    id: "basement-finishing",
    service: "Basement finishing",
    from: 30000,
    detail: "Open-concept rec room, framing to paint.",
  },
];

const drywallStartingPrices: StartingPrice[] = [
  { id: "drywall-repair", service: "Drywall repair", from: 300, detail: "Patch, tape, three coats, sand. Primer-ready." },
  {
    id: "popcorn-removal",
    service: "Popcorn ceiling removal",
    from: 1000,
    unit: "per average room",
    detail: "Removal, repair and smooth skim coat.",
    flag: "popcornRemoval",
  },
  {
    id: "installation-finishing",
    service: "Installation & finishing",
    from: null,
    detail: "Quoted per project, by square footage.",
  },
  { id: "skim-coating", service: "Skim coating", from: null, detail: "Quoted per room." },
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
export type Range = { low: number; high: number };

export const estimator = {
  size: { min: 300, max: 1500, step: 50, initial: 800 },
  finishLevels: {
    essential: {
      label: "Essential",
      description: "Durable, good-looking basics: vinyl plank floor, pot lights, paint.",
      perSqFt: { low: 45, high: 60 },
    },
    comfort: {
      label: "Comfort",
      description: "Upgraded finishes, more lighting, built-in storage.",
      perSqFt: { low: 60, high: 80 },
    },
    premium: {
      label: "Premium",
      description: "Custom features, premium flooring and millwork.",
      perSqFt: { low: 80, high: 115 },
    },
  } satisfies Record<FinishLevel, { label: string; description: string; perSqFt: Range }>,
  addOns: {
    bathroom: { label: "Bathroom", cost: { low: 12000, high: 25000 } },
    bedroom: { label: "Bedroom with egress window", cost: { low: 5000, high: 10000 } },
    wetbar: { label: "Wet bar or kitchenette", cost: { low: 6000, high: 15000 } },
  } satisfies Record<AddOn, { label: string; cost: Range }>,
  roundTo: 1000,
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
