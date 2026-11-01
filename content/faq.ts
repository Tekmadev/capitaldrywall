/**
 * Single source for every FAQ: the FAQ UI, FAQPage JSON-LD and llms.txt all read this file
 * (and it doubles as the knowledge base for a future AI receptionist). Copy is verbatim from
 * CAPITAL_COPY.md; placeholders and CONFIRM lines resolve from site.config.
 */
import { feature, site, type FeatureFlag } from "./site.config";

export type FaqPage = "home" | "drywall" | "basement" | "renovations" | "quote";

export type FaqItem = {
  id: string;
  question: string;
  answer: string;
  flag?: FeatureFlag;
  /** The owner must confirm before launch (see LAUNCH_CHECKLIST.md) */
  confirm?: boolean;
};

const permitAnswer = [
  "Yes. The City of Ottawa requires a building permit to finish a basement, with inspections at set stages of the work. Basement bedrooms also need a proper egress window under the Ontario Building Code.",
  // [CONFIRM last sentence]: hidden when permitsHandled is false
  site.permitsHandled ? "We prepare the drawings, apply for the permit and book the inspections for you." : null,
]
  .filter(Boolean)
  .join(" ");

const basementCostLead =
  "Most open-concept basement finishes in Ottawa land between about $30,000 and $60,000.";
const basementCostBody = [
  "Adding a bathroom, bedroom or wet bar raises the price. Size, layout, plumbing and finish level are the biggest factors.",
  feature("estimator")
    ? "Try our basement estimator for a range, then book a free site visit for a written quote."
    : "Book a free site visit for a written quote.",
].join(" ");

const items: Record<string, FaqItem> = {
  "drywall-repair-cost": {
    id: "drywall-repair-cost",
    question: "How much does drywall repair cost in Ottawa?",
    answer:
      "Small drywall repairs in Ottawa, like holes, cracks and nail pops, typically start around $300. That includes tape, three coats of compound and sanding to a primer-ready finish. Larger repairs and water damage are priced after we see the area. Send photos for a fast estimate.",
    confirm: true,
  },
  "basement-cost": {
    id: "basement-cost",
    question: "How much does it cost to finish a basement in Ottawa?",
    answer: `${basementCostLead} ${basementCostBody}`,
    confirm: true,
  },
  "basement-cost-full": {
    id: "basement-cost-full",
    question: "How much does it cost to finish a basement in Ottawa?",
    answer: `${basementCostLead} Larger or premium projects can pass $90,000. ${basementCostBody}`,
    confirm: true,
  },
  "basement-permit": {
    id: "basement-permit",
    question: "Do I need a permit to finish my basement in Ottawa?",
    answer: permitAnswer,
    confirm: true,
  },
  "level-5": {
    id: "level-5",
    question: "What is a Level 5 drywall finish?",
    answer:
      "Level 5 is the highest drywall finish standard. After the joints are taped and coated, the entire surface gets a thin skim coat, so the wall has one uniform surface with no visible seams. It's recommended for glossy paint, large windows and walls hit by strong side light.",
  },
  "popcorn-removal": {
    id: "popcorn-removal",
    question: "Do you remove popcorn ceilings?",
    answer:
      "Yes. We contain the room, remove the popcorn texture, repair the drywall underneath and skim the ceiling smooth so it's ready for paint. Ceilings in homes built before 1990 should be tested for asbestos first. We'll explain how that works before any scraping starts.",
    flag: "popcornRemoval",
    confirm: true,
  },
  "drywall-duration": {
    id: "drywall-duration",
    question: "How long does drywall work take?",
    answer:
      "A small repair usually takes one to two visits over a couple of days, because compound has to dry between coats. Drywall for a full basement typically takes about a week from hanging to sanding. A complete basement finish usually takes four to eight weeks.",
    confirm: true,
  },
  "free-quotes": {
    id: "free-quotes",
    question: "Are your quotes free?",
    answer: `Yes. Quotes and site visits are free, with no obligation. Send photos through our quote form and we'll get back to you ${site.responsePromise}.`,
  },
  "service-areas": {
    id: "service-areas",
    question: "What areas do you serve?",
    answer:
      "We serve the City of Ottawa and nearby communities, including Kanata, Stittsville, Nepean, Barrhaven, Riverside South, Manotick, Gloucester, Orléans and Cumberland. If you're just outside these areas, ask us anyway.",
  },
  "drywall-installation-cost": {
    id: "drywall-installation-cost",
    question: "How much does drywall installation cost?",
    answer:
      "Drywall installation, taping and finishing are priced by the square footage of board, plus ceiling height, board type and finish level. A basement or addition is usually quoted as one package. We measure on site and give you a firm written price.",
  },
  "mud-drying-time": {
    id: "mud-drying-time",
    question: "How long does drywall mud take to dry?",
    answer:
      "Each coat of joint compound usually needs about 24 hours to dry, depending on humidity and temperature. That's why a proper three-coat finish takes several days, even on a small job. Faster-setting compounds can speed up the early coats when the schedule is tight.",
  },
  "ceiling-texture-match": {
    id: "ceiling-texture-match",
    question: "Can you match my existing ceiling texture?",
    answer:
      "In most cases, yes. We blend repairs into flat, stipple and other textured ceilings so the patch isn't noticeable. If a ceiling has been patched many times, a full skim coat or texture removal is often the better long-term fix.",
  },
  "nail-pops-cracks": {
    id: "nail-pops-cracks",
    question: "What causes nail pops and cracks?",
    answer:
      "Most nail pops and hairline cracks come from wood framing shrinking and shifting as humidity changes through the seasons, which is common in Ottawa homes. We reset or replace the fastener, then re-tape and re-coat so the repair stays hidden.",
  },
  "popcorn-mess": {
    id: "popcorn-mess",
    question: "Is popcorn ceiling removal messy?",
    answer:
      "It can be, which is why we contain the room first: plastic on walls and floors, sealed doorways and vents, and dust extraction while sanding. Ceilings in older homes are tested for asbestos before any scraping.",
    flag: "popcornRemoval",
    confirm: true,
  },
  "move-furniture": {
    id: "move-furniture",
    question: "Do I need to move my furniture?",
    answer:
      "Clear what you can from the work area. We cover and protect anything that stays, and put the room back the way we found it.",
  },
  "basement-duration": {
    id: "basement-duration",
    question: "How long does a basement renovation take?",
    answer:
      "Most open-concept basements take four to six weeks once the permit is issued. Bathrooms, bedrooms and wet bars add time for plumbing, inspections and finishing, typically bringing it to six to eight weeks. You get a schedule with your written quote.",
    confirm: true,
  },
  "basement-bathroom": {
    id: "basement-bathroom",
    question: "Can you add a bathroom to my basement?",
    answer:
      "Yes. If there's an existing rough-in, it's simpler. If not, a licensed plumber cuts the slab to run new drains. We coordinate the plumbing, electrical, ventilation and permit, then build and finish the bathroom.",
    confirm: true,
  },
  "damp-basement": {
    id: "damp-basement",
    question: "What if my basement is damp?",
    answer:
      "We check for moisture before we quote. If water is actively getting in, the source needs fixing first, because finishing over a wet basement hides the problem and ruins the work. For normal basement dampness, proper insulation, vapour barrier and subfloor keep the space dry and comfortable.",
  },
  "live-at-home": {
    id: "live-at-home",
    question: "Can we live at home during the renovation?",
    answer:
      "Yes, most families do. We seal off the basement, protect the path in and out, control dust and clean up every day. Noisy work gets planned around your schedule where possible.",
  },
  "basement-value": {
    id: "basement-value",
    question: "Does finishing a basement add value?",
    answer:
      "A well-built, permitted basement adds usable living space, which buyers value. The return depends on quality and on having permits and inspections on record, so we build every basement expecting it to be inspected, because it will be.",
  },
  "bathroom-cost": {
    id: "bathroom-cost",
    question: "How much does a bathroom renovation cost in Ottawa?",
    answer:
      "A cosmetic bathroom refresh, like a new vanity, fixtures and tile without moving plumbing, often starts around $8,000 to $15,000 in Ottawa. Full remodels with a new shower, layout changes or premium tile cost more. We give a written quote after seeing the space.",
    confirm: true,
  },
  "paint-after-drywall": {
    id: "paint-after-drywall",
    question: "Do you paint after drywall work?",
    answer:
      "Yes. We can prime and paint walls and ceilings right after the drywall is finished, so one crew takes the room from bare board to final colour.",
  },
  "kitchen-duration": {
    id: "kitchen-duration",
    question: "How long does a kitchen update take?",
    answer:
      "A cabinet refresh, new backsplash and paint is usually done in one to two weeks. Larger projects take longer depending on scope and material lead times.",
    confirm: true,
  },
  "full-kitchen": {
    id: "full-kitchen",
    question: "Do you do full kitchen renovations?",
    answer:
      "We focus on kitchen upgrades: cabinets, backsplash, drywall, paint and finishing. For larger remodels, ask us and we'll tell you honestly what we can take on.",
    confirm: true,
  },
  "quotes-really-free": {
    id: "quotes-really-free",
    question: "Are quotes really free?",
    answer: "Yes. Quotes and site visits are free, with no obligation.",
  },
  "send-photos": {
    id: "send-photos",
    question: "Do I need to send photos?",
    answer: "No, but they help. With clear photos we can often give you a ballpark before we visit.",
  },
  "how-soon": {
    id: "how-soon",
    question: "How soon can you start?",
    answer:
      "It depends on the season and the size of the job. Smaller repairs can often be scheduled within a week or two; basements are booked further out. Ask when you request your quote.",
    confirm: true,
  },
};

/** Page order, exactly as in the copy deck. */
const pageOrder: Record<FaqPage, string[]> = {
  home: [
    "drywall-repair-cost",
    "basement-cost",
    "basement-permit",
    "level-5",
    "popcorn-removal",
    "drywall-duration",
    "free-quotes",
    "service-areas",
  ],
  drywall: [
    "drywall-repair-cost",
    "drywall-installation-cost",
    "mud-drying-time",
    "ceiling-texture-match",
    "nail-pops-cracks",
    "popcorn-mess",
    "move-furniture",
  ],
  basement: [
    "basement-cost-full",
    "basement-permit",
    "basement-duration",
    "basement-bathroom",
    "damp-basement",
    "live-at-home",
    "basement-value",
  ],
  renovations: ["bathroom-cost", "paint-after-drywall", "kitchen-duration", "full-kitchen"],
  quote: ["quotes-really-free", "send-photos", "how-soon"],
};

const enabled = (item: FaqItem) => !item.flag || feature(item.flag);

/** FAQs for one page, in order, with feature flags applied. Use for both UI and FAQPage schema. */
export function getFaqs(page: FaqPage): FaqItem[] {
  return pageOrder[page].map((id) => items[id]).filter(enabled);
}

/** Every enabled FAQ, de-duplicated by question (longest answer wins), for llms.txt. */
export function getAllFaqs(): FaqItem[] {
  const byQuestion = new Map<string, FaqItem>();
  for (const page of Object.keys(pageOrder) as FaqPage[]) {
    for (const item of getFaqs(page)) {
      const existing = byQuestion.get(item.question);
      if (!existing || item.answer.length > existing.answer.length) byQuestion.set(item.question, item);
    }
  }
  return [...byQuestion.values()];
}
