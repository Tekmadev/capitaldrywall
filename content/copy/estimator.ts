/**
 * Basement budget estimator copy (CAPITAL_COPY.md → BASEMENT → "Budget estimator"), verbatim.
 * Option labels, descriptions, rates and the disclaimer live once in `content/pricing.ts`
 * (transcribed from the same copy-deck section) and are re-exposed here so the UI reads one module.
 */
import { addOnIds, estimator, finishLevelIds, type AddOn, type FinishLevel } from "../pricing";

export const estimatorCopy = {
  eyebrow: "Budget estimator",
  title: "What will my basement cost?",
  intro: "Get a realistic range in 20 seconds. Your exact price comes from a free site visit.",
  labels: {
    size: "Basement size (sq ft)",
    finish: "Finish level",
    addOns: "Add-ons",
  },
  resultLabel: "Estimated range",
  /** "Estimate only, based on typical Ottawa projects. Not a quote. HST extra." */
  disclaimer: estimator.disclaimer,
  cta: "Get my exact quote",
  /** Unit suffix, set in mono caps by the UI ("800 SQ FT") */
  unit: "sq ft",
  /** Screen-reader phrasing for values (no visible copy) */
  sr: {
    unitLong: "square feet",
    rangeJoin: "to",
  },
} as const;

export const finishLevelOptions: { id: FinishLevel; label: string; description: string }[] = finishLevelIds.map(
  (id) => ({
    id,
    label: estimator.finishLevels[id].label,
    description: estimator.finishLevels[id].description,
  }),
);

export const addOnOptions: { id: AddOn; label: string }[] = addOnIds.map((id) => ({
  id,
  label: estimator.addOns[id].label,
}));
