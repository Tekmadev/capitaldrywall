#!/usr/bin/env node
/**
 * Lighthouse mobile audit, median of N runs per page (brief §16).
 * Usage: node scripts/qa/lighthouse.mjs [baseUrl=http://localhost:3100] [runs=3] [paths...]
 * Needs a production server (npm run build && npx next start -p 3100).
 */
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const [base = "http://localhost:3100", runsArg = "3", ...pathArgs] = process.argv.slice(2);
const runs = Number(runsArg);
const paths = pathArgs.length
  ? pathArgs
  : ["/", "/drywall-ottawa", "/basement-renovations-ottawa", "/renovations-ottawa", "/free-quote", "/privacy-policy"];
const out = join(process.cwd(), ".lighthouse");
mkdirSync(out, { recursive: true });
const chrome = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

const targets = { performance: 90, accessibility: 95, "best-practices": 100, seo: 100 };
const median = (xs) => [...xs].sort((a, b) => a - b)[Math.floor(xs.length / 2)];

const rows = [];
for (const path of paths) {
  const results = [];
  for (let i = 0; i < runs; i++) {
    const file = join(out, `${path.replace(/\W+/g, "_") || "home"}-${i}.json`);
    try {
      execFileSync(
        "npx",
        [
          "--yes",
          "lighthouse@12",
          base + path,
          "--quiet",
          "--output=json",
          `--output-path=${file}`,
          "--only-categories=performance,accessibility,best-practices,seo",
          "--chrome-flags=--headless=new --no-first-run --disable-gpu",
        ],
        { stdio: "ignore", env: { ...process.env, CHROME_PATH: chrome } },
      );
      results.push(JSON.parse(readFileSync(file, "utf8")));
    } catch (error) {
      console.error(`run ${i + 1} failed for ${path}: ${error.message}`);
    }
  }
  if (!results.length) continue;
  const score = (r, c) => Math.round((r.categories[c]?.score ?? 0) * 100);
  const audit = (r, id) => r.audits[id]?.numericValue ?? NaN;
  const row = { path };
  for (const c of Object.keys(targets)) row[c] = median(results.map((r) => score(r, c)));
  row.lcp = Math.round(median(results.map((r) => audit(r, "largest-contentful-paint"))));
  row.cls = median(results.map((r) => audit(r, "cumulative-layout-shift"))).toFixed(3);
  row.tbt = Math.round(median(results.map((r) => audit(r, "total-blocking-time"))));
  const last = results.at(-1);
  row.lcpElement = last.audits["largest-contentful-paint-element"]?.details?.items?.[0]?.items?.[0]?.node?.snippet?.slice(0, 120) ?? "";
  row.failing = Object.entries(last.audits)
    .filter(([, a]) => a.score !== null && a.score < 0.9 && a.scoreDisplayMode !== "informative" && a.scoreDisplayMode !== "manual" && a.scoreDisplayMode !== "notApplicable")
    .map(([id, a]) => `${id}${a.displayValue ? ` (${a.displayValue})` : ""}`)
    .slice(0, 14);
  rows.push(row);
}

for (const r of rows) {
  const flags = Object.entries(targets)
    .filter(([c, min]) => r[c] < min)
    .map(([c, min]) => `${c} ${r[c]}<${min}`);
  console.log(
    `\n${r.path}  perf ${r.performance} · a11y ${r.accessibility} · bp ${r["best-practices"]} · seo ${r.seo}  |  LCP ${r.lcp} ms · CLS ${r.cls} · TBT ${r.tbt} ms  ${flags.length ? "✗ " + flags.join(", ") : "✓"}`,
  );
  console.log(`  LCP element: ${r.lcpElement}`);
  if (r.failing.length) console.log(`  below 0.9: ${r.failing.join("; ")}`);
}
