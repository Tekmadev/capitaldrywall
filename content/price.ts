/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  PRICES: the one file to edit.
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Every dollar amount on the website comes from this file: the price cards on
 * the home and drywall pages, the FAQ answers, the basement estimator, the
 * search-engine data (schema) and llms.txt. Change a number here, save, and the
 * whole site updates (redeploy to put it live).
 *
 * Rules:
 *  - Plain numbers in Canadian dollars, before HST. No "$" and no commas:
 *    write 30000, not "$30,000". (Underscores are allowed: 30_000.)
 *  - `null` means "no fixed price": the card shows "Quoted" instead.
 *  - Ranges are { low, high } with low ≤ high.
 *  - Wording (labels, descriptions) lives in content/pricing.ts; only numbers live here.
 *
 * Later this file becomes the admin page's data; keep the shape the same.
 */

export const prices = {
  /* ── Starting prices ("from $…") ─────────────────────────────────────────
     Home "Honest starting prices", drywall page price cards, schema, llms.txt. */
  startingFrom: {
    /** Drywall repair (holes, cracks, nail pops). Also in the drywall-repair FAQ. */
    drywallRepair: 300,
    /** Popcorn ceiling removal, per average room. */
    popcornRemovalPerRoom: 1_000,
    /** Open-concept basement finish, framing to paint (home card). */
    basementFinishing: 30_000,
    /** Drywall installation & finishing: quoted per project (null = "Quoted"). */
    drywallInstallation: null,
    /** Skim coating: quoted per room (null = "Quoted"). */
    skimCoating: null,
  },

  /* ── Typical ranges quoted in FAQ answers and llms.txt ─────────────────── */
  typical: {
    /** "Most open-concept basement finishes in Ottawa land between about … and …" */
    basementFinish: { low: 30_000, high: 60_000 },
    /** "Larger or premium projects can pass …" */
    basementPremiumOver: 90_000,
    /** "A cosmetic bathroom refresh … often starts around … to …" */
    bathroomRefresh: { low: 8_000, high: 15_000 },
  },

  /* ── Basement budget estimator (basement page) ─────────────────────────── */
  basementEstimator: {
    /** Slider range in square feet */
    size: { min: 300, max: 1_500, step: 50, initial: 800 },
    /** Cost per square foot for each finish level */
    perSqFt: {
      essential: { low: 45, high: 60 },
      comfort: { low: 60, high: 80 },
      premium: { low: 80, high: 115 },
    },
    /** Flat amounts added by each add-on */
    addOns: {
      bathroom: { low: 12_000, high: 25_000 },
      bedroom: { low: 5_000, high: 10_000 },
      wetbar: { low: 6_000, high: 15_000 },
    },
    /** Results are rounded to the nearest… */
    roundTo: 1_000,
  },
} as const satisfies PriceSheet;

/* ── Shape check (you don't need to edit below this line) ─────────────────── */

type Range = { readonly low: number; readonly high: number };
type PriceSheet = {
  startingFrom: Record<
    "drywallRepair" | "popcornRemovalPerRoom" | "basementFinishing" | "drywallInstallation" | "skimCoating",
    number | null
  >;
  typical: { basementFinish: Range; basementPremiumOver: number; bathroomRefresh: Range };
  basementEstimator: {
    size: { min: number; max: number; step: number; initial: number };
    perSqFt: Record<"essential" | "comfort" | "premium", Range>;
    addOns: Record<"bathroom" | "bedroom" | "wetbar", Range>;
    roundTo: number;
  };
};
