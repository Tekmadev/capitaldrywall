#!/usr/bin/env node
/**
 * Lists every largest-contentful-paint entry Chrome emits for a page (mobile emulation by default),
 * so you can see which element wins and why an image might be skipped.
 * Usage: node scripts/qa/lcp.mjs <url> [--width=412] [--height=823] [--dpr=1.75]
 */
import { spawn } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const [url, ...flags] = process.argv.slice(2);
const opt = (n, d) => Number(flags.find((f) => f.startsWith(`--${n}=`))?.split("=")[1] ?? d);
const width = opt("width", 412);
const height = opt("height", 823);
const dpr = opt("dpr", 1.75);

const profile = mkdtempSync(join(tmpdir(), "cdr-lcp-"));
const chrome = spawn("/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", [
  "--headless=new",
  "--remote-debugging-port=0",
  `--user-data-dir=${profile}`,
  "--no-first-run",
  "about:blank",
]);
const wsUrl = await new Promise((resolve) =>
  chrome.stderr.on("data", (b) => {
    const m = String(b).match(/DevTools listening on (ws:\/\/\S+)/);
    if (m) resolve(m[1]);
  }),
);
const ws = new WebSocket(wsUrl);
await new Promise((r) => ws.addEventListener("open", r, { once: true }));
let id = 0;
const pending = new Map();
ws.addEventListener("message", (e) => {
  const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) {
    pending.get(m.id)(m);
    pending.delete(m.id);
  }
});
const send = (method, params = {}, sessionId) =>
  new Promise((r) => {
    const n = ++id;
    pending.set(n, r);
    ws.send(JSON.stringify({ id: n, method, params, ...(sessionId ? { sessionId } : {}) }));
  });
const { result: t } = await send("Target.createTarget", { url: "about:blank" });
const { result: a } = await send("Target.attachToTarget", { targetId: t.targetId, flatten: true });
const s = (m, p) => send(m, p, a.sessionId);
await s("Page.enable");
await s("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: dpr, mobile: width < 768 });
await s("Page.navigate", { url });
await new Promise((r) => setTimeout(r, 4000));
const { result } = await s("Runtime.evaluate", {
  awaitPromise: true,
  returnByValue: true,
  expression: `new Promise((resolve) => {
    const out = [];
    new PerformanceObserver((list) => {
      for (const e of list.getEntries()) out.push({
        t: Math.round(e.startTime), size: e.size, url: (e.url || "").slice(0, 90),
        el: e.element ? (e.element.tagName + "." + String(e.element.className).slice(0, 60)) : null,
        text: e.element && !e.url ? e.element.textContent.trim().slice(0, 50) : undefined,
      });
    }).observe({ type: "largest-contentful-paint", buffered: true });
    setTimeout(() => {
      const img = document.querySelector("picture img");
      const info = img ? { currentSrc: img.currentSrc.slice(0, 100), complete: img.complete, natural: [img.naturalWidth, img.naturalHeight],
        rect: img.getBoundingClientRect().toJSON(), opacity: getComputedStyle(img).opacity, visibility: getComputedStyle(img).visibility,
        bytes: (performance.getEntriesByName(img.currentSrc)[0] || {}).encodedBodySize } : null;
      resolve({ entries: out, poster: info });
    }, 300);
  })`,
});
console.log(JSON.stringify(result.result.value, null, 2));
ws.close();
chrome.kill("SIGKILL");
try {
  rmSync(profile, { recursive: true, force: true });
} catch {}
process.exit(0);
