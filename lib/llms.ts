/**
 * llms.txt and llms-full.txt (brief §11), built from /content so they can never drift from the site.
 *
 * llms.txt follows the copy-deck template line for line ("llms.txt (template, generated from
 * /content)"): placeholders resolve from site.config, prices from content/pricing.ts, the FAQ from
 * getAllFaqs(). Feature flags trim the template exactly as they trim the pages (popcorn removal
 * disappears with its flag; the warranty line with a null warranty).
 *
 * llms-full.txt adds the full service descriptions, transcribed from the page copy in content/copy,
 * plus pricing, estimator rates, process, promises, service areas and contact details.
 */
import { areas } from "@/content/areas";
import { basementIntro, builtForOttawa, timeline, whatsIncluded, whatWeBuild } from "@/content/copy/basement";
import { drywallIntro, drywallSubServices, finishLevels } from "@/content/copy/drywall";
import { processSection, serviceAreaSection } from "@/content/copy/global";
import { promises } from "@/content/copy/home";
import { quoteAbout, quoteSidebar } from "@/content/copy/quote";
import { renovationSections, renovationsIntro, whyDrywallSpecialist } from "@/content/copy/renovations";
import { getAllFaqs, getFaqs, type FaqItem, type FaqPage } from "@/content/faq";
import {
  drywallPrices,
  estimator,
  pricingFinePrint,
  startingPrices,
  type StartingPrice,
} from "@/content/pricing";
import { pages, services } from "@/content/services";
import { feature, site } from "@/content/site.config";
import { absoluteUrl } from "@/lib/seo";
import { formatCAD } from "@/lib/utils";

const popcorn = feature("popcornRemoval");

/** Joins with commas and a final "and", like the copy deck: "a, b and c". */
function listJoin(items: readonly string[]): string {
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} and ${items.at(-1)}`;
}

const block = (lines: (string | null | false | undefined)[]) =>
  lines.filter((line): line is string => typeof line === "string").join("\n");

/* ── Template pieces (copy deck, verbatim) ────────────────────── */

function summary(): string {
  const drywall = [
    "drywall installation",
    "drywall repair",
    "taping and mudding",
    "skim coating and Level 5 finishes",
    popcorn ? "popcorn ceiling removal" : null,
  ].filter(Boolean);
  return `> Drywall and basement renovation contractor in Ottawa, Ontario, Canada. Services: ${drywall.join(", ")}, and complete basement finishing. Also interior painting, bathroom renovations and kitchen renovations.`;
}

/** The template's service-area line, keeping only communities still listed in content/areas.ts. */
function serviceAreaLine(): string {
  const named = [
    "Kanata",
    "Stittsville",
    "Nepean",
    "Barrhaven",
    "Riverside South",
    "Manotick",
    "Gloucester",
    "Orléans",
    "Cumberland",
  ].filter((name) => areas.some((area) => area.name === name));
  return `- Service area: City of Ottawa${named.length ? `, including ${listJoin(named)}` : ""}`;
}

/** "drywall repair from $300; popcorn ceiling removal from $1,000 per average room; …" */
function startingPriceLine(): string | null {
  const phrase: Record<string, (from: string) => string> = {
    "drywall-repair": (from) => `drywall repair from ${from}`,
    "popcorn-removal": (from) => `popcorn ceiling removal from ${from} per average room`,
    "basement-finishing": (from) => `open-concept basement finishing from ${from}`,
  };
  const parts = startingPrices
    .filter((p): p is StartingPrice & { from: number } => p.from !== null && p.id in phrase)
    .map((p) => phrase[p.id](formatCAD(p.from)));
  return parts.length ? `- Starting prices (HST extra): ${parts.join("; ")}` : null;
}

function keyFacts(): string {
  return block([
    "## Key facts",
    serviceAreaLine(),
    `- Phone: ${site.phone.display} · Email: ${site.email} · Hours: ${site.hours}`,
    "- Free on-site quotes; written quotes with scope, price and schedule",
    startingPriceLine(),
    "- Typical basement finish in Ottawa: about $30,000–$60,000 for open-concept; 4–6 weeks of work after the permit is issued",
    site.warranty ? `- Warranty: ${site.warranty.label}` : null,
    `- Website: ${site.url}`,
  ]);
}

function pageList(): string {
  const drywallTopics = [
    "installation",
    "repair",
    "taping and mudding",
    "skim coat and Level 5",
    popcorn ? "popcorn ceiling removal" : null,
  ].filter(Boolean);
  return block([
    "## Pages",
    `- [Drywall services](${absoluteUrl(pages.drywall)}): ${drywallTopics.join(", ")}`,
    `- [Basement renovations](${absoluteUrl(pages.basement)}): basement finishing, what's included, costs, timeline, permits${feature("estimator") ? ", estimator" : ""}`,
    `- [Painting, bathroom & kitchen renovations](${absoluteUrl(pages.renovations)})`,
    `- [Free quote](${absoluteUrl(pages.quote)})`,
  ]);
}

function faqEntries(items: readonly FaqItem[]): string {
  return items.map((item) => `### ${item.question}\n${item.answer}`).join("\n\n");
}

/* ── llms.txt ─────────────────────────────────────────────────── */

export function buildLlmsTxt(): string {
  return [`# ${site.name}`, summary(), keyFacts(), pageList(), `## FAQ\n\n${faqEntries(getAllFaqs())}`].join("\n\n") + "\n";
}

/* ── llms-full.txt ────────────────────────────────────────────── */

const sqft = (n: number) => n.toLocaleString("en-CA");

const bullets = (items: readonly string[]) => items.map((item) => `- ${item}`).join("\n");

function priceList(prices: readonly StartingPrice[]): string {
  return bullets(
    prices.map((p) =>
      p.from === null
        ? `${p.service}: ${p.detail}`
        : `${p.service}: from ${formatCAD(p.from)}${p.unit ? ` ${p.unit}` : ""}. ${p.detail}`,
    ),
  );
}

function pageFaq(page: FaqPage, shown: Set<string>): string {
  const items = getFaqs(page);
  for (const item of items) shown.add(item.question);
  return items.length ? `### Questions\n\n${items.map((i) => `**${i.question}**\n${i.answer}`).join("\n\n")}` : "";
}

function drywallSection(shown: Set<string>): string {
  const table = [
    `| ${finishLevels.columns.join(" | ")} |`,
    `| ${finishLevels.columns.map(() => "---").join(" | ")} |`,
    ...finishLevels.levels.map((l) => `| Level ${l.level} | ${l.what} | ${l.where} |`),
  ].join("\n");
  return block([
    `## Drywall services`,
    `URL: ${absoluteUrl(pages.drywall)}`,
    "",
    drywallIntro,
    "",
    drywallSubServices
      .map((s) =>
        block([`### ${s.title}`, `URL: ${absoluteUrl(`${pages.drywall}#${s.id}`)}`, "", s.body, "", bullets(s.bullets)]),
      )
      .join("\n\n"),
    "",
    `### ${finishLevels.title}`,
    finishLevels.answer,
    "",
    table,
    "",
    finishLevels.ourStandard,
    "",
    "### Starting prices (drywall)",
    priceList(drywallPrices),
    pricingFinePrint,
    "",
    pageFaq("drywall", shown),
  ]);
}

function basementSection(shown: Set<string>): string {
  const levels = Object.values(estimator.finishLevels).map(
    (l) => `${l.label}: ${formatCAD(l.perSqFt.low)}–${formatCAD(l.perSqFt.high)} per sq. ft. ${l.description}`,
  );
  const addOns = Object.values(estimator.addOns).map(
    (a) => `${a.label}: add ${formatCAD(a.cost.low)}–${formatCAD(a.cost.high)}`,
  );
  return block([
    "## Basement renovations",
    `URL: ${absoluteUrl(pages.basement)}`,
    "",
    basementIntro,
    "",
    `### ${whatWeBuild.title.replace(/\.$/, "")}`,
    bullets(whatWeBuild.tiles.map((t) => `${t.title}: ${t.text}`)),
    "",
    `### ${whatsIncluded.title.replace(/\.$/, "")}`,
    bullets(whatsIncluded.items),
    "",
    `### ${builtForOttawa.title.replace(/\.$/, "")}`,
    builtForOttawa.answer,
    "",
    bullets(builtForOttawa.layers.map((l) => `${l.title}: ${l.body}`)),
    "",
    `### ${timeline.title}`,
    timeline.answer,
    "",
    bullets(timeline.rail.map((r) => `${r.when}: ${r.what}`)),
    "",
    feature("estimator") ? "### Budget estimator rates" : null,
    feature("estimator")
      ? block([
          `Basement size: ${sqft(estimator.size.min)}–${sqft(estimator.size.max)} sq. ft. Ranges are rounded to the nearest ${formatCAD(estimator.roundTo)}.`,
          "",
          "Finish level, per square foot:",
          bullets(levels),
          "",
          "Add-ons:",
          bullets(addOns),
          "",
          estimator.disclaimer,
          "",
        ])
      : null,
    pageFaq("basement", shown),
  ]);
}

function renovationsSection(shown: Set<string>): string {
  return block([
    "## Painting, bathroom & kitchen renovations",
    `URL: ${absoluteUrl(pages.renovations)}`,
    "",
    renovationsIntro,
    "",
    renovationSections
      .map((s) =>
        block([
          `### ${s.title}`,
          `URL: ${absoluteUrl(`${pages.renovations}#${s.id}`)}`,
          "",
          s.body,
          "",
          bullets(s.bullets),
        ]),
      )
      .join("\n\n"),
    "",
    `### ${whyDrywallSpecialist.title}`,
    whyDrywallSpecialist.body,
    "",
    pageFaq("renovations", shown),
  ]);
}

function howWeWork(): string {
  return block([
    "## How a job runs",
    processSection.steps.map((step, i) => `${i + 1}. ${step.title} ${step.body}`).join("\n"),
    "",
    `## ${promises.title.replace(/\.$/, "")}`,
    bullets(promises.items.map((p) => `${p.title} ${p.body}`)),
    "",
    "## Starting prices",
    priceList(startingPrices),
    pricingFinePrint,
  ]);
}

function areaSection(): string {
  return block([
    "## Service area",
    serviceAreaSection.body,
    "",
    bullets(areas.map((a) => a.name)),
  ]);
}

function aboutSection(): string {
  return block([
    `## ${quoteAbout.title}`,
    quoteAbout.body,
    "",
    bullets(quoteAbout.values),
    "",
    "## Contact",
    `- Phone: ${site.phone.display}`,
    `- Email: ${site.email}`,
    `- Hours: ${site.hours}`,
    `- ${quoteSidebar.reply}`,
    `- Free quote: ${absoluteUrl(pages.quote)}`,
    `- Location: ${site.address.locality}, ${site.address.regionName}, Canada`,
  ]);
}

export function buildLlmsFullTxt(): string {
  const shown = new Set<string>();
  const serviceSections = [drywallSection(shown), basementSection(shown), renovationsSection(shown)];
  const remainingFaqs = getAllFaqs().filter((item) => !shown.has(item.question));
  const offered = services.filter((s) => s.href).map((s) => `- [${s.name}](${absoluteUrl(s.href!)})`);
  return (
    [
      `# ${site.name}`,
      summary(),
      keyFacts(),
      pageList(),
      ["## Services", "", ...offered].join("\n"),
      ...serviceSections,
      howWeWork(),
      areaSection(),
      aboutSection(),
      remainingFaqs.length ? `## More questions\n\n${faqEntries(remainingFaqs)}` : "",
    ]
      .join("\n\n")
      // Collapse the blank runs left by hidden blocks.
      .replace(/\n{3,}/g, "\n\n")
      .trim() + "\n"
  );
}
