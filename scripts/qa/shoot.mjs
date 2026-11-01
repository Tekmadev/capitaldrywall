#!/usr/bin/env node
/**
 * Full-page screenshots through the Chrome DevTools Protocol (no extra dependencies).
 * Emulates real device widths (headless macOS Chrome won't lay out below ~500 px otherwise),
 * optional reduced motion, scrolls the page so reveals and lazy images run, then captures
 * full-page JPEG slices and reports horizontal overflow and console errors as JSON.
 *
 * Usage:
 *   node scripts/qa/shoot.mjs <url> <outPrefix> [--width=1440] [--height=900] [--reduce] [--slice=2200] [--no-scroll] [--filmstrip=N]
 * Output: <outPrefix>-1.jpg, <outPrefix>-2.jpg, … (full page) or <outPrefix>-v01.jpg … (filmstrip of N
 * viewport shots, best for pages with sticky/pinned scroll scenes), plus a JSON summary.
 */
import { spawn } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import sharp from "sharp";

const [url, outPrefix, ...flags] = process.argv.slice(2);
if (!url || !outPrefix) {
  console.error("usage: node scripts/qa/shoot.mjs <url> <outPrefix> [--width=1440] [--height=900] [--reduce] [--slice=2200] [--no-scroll]");
  process.exit(1);
}
const opt = (name, fallback) => {
  const hit = flags.find((f) => f.startsWith(`--${name}=`));
  return hit ? Number(hit.split("=")[1]) : fallback;
};
const width = opt("width", 1440);
const height = opt("height", width < 768 ? 844 : 900);
const slice = opt("slice", 2200);
const reduce = flags.includes("--reduce");
const scroll = !flags.includes("--no-scroll");
const mobile = width < 768;

const chromePath = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const profile = mkdtempSync(join(tmpdir(), "cdr-shoot-"));
const chrome = spawn(chromePath, [
  "--headless=new",
  "--disable-gpu",
  "--hide-scrollbars",
  "--no-first-run",
  "--no-default-browser-check",
  "--remote-debugging-port=0",
  `--user-data-dir=${profile}`,
  "about:blank",
]);

const wsUrl = await new Promise((resolve, reject) => {
  const timer = setTimeout(() => reject(new Error("Chrome did not start")), 20000);
  chrome.stderr.on("data", (buf) => {
    const m = String(buf).match(/DevTools listening on (ws:\/\/\S+)/);
    if (m) {
      clearTimeout(timer);
      resolve(m[1]);
    }
  });
});

const ws = new WebSocket(wsUrl);
await new Promise((r) => ws.addEventListener("open", r, { once: true }));
let seq = 0;
const pending = new Map();
const listeners = [];
ws.addEventListener("message", (ev) => {
  const msg = JSON.parse(ev.data);
  if (msg.id && pending.has(msg.id)) {
    const { resolve, reject } = pending.get(msg.id);
    pending.delete(msg.id);
    if (msg.error) reject(new Error(msg.error.message));
    else resolve(msg.result);
  } else if (msg.method) {
    for (const l of listeners) l(msg);
  }
});
const send = (method, params = {}, sessionId) =>
  new Promise((resolve, reject) => {
    const id = ++seq;
    pending.set(id, { resolve, reject });
    ws.send(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) }));
  });
const once = (method, sessionId) =>
  new Promise((resolve) => {
    const l = (msg) => {
      if (msg.method === method && msg.sessionId === sessionId) {
        listeners.splice(listeners.indexOf(l), 1);
        resolve(msg.params);
      }
    };
    listeners.push(l);
  });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const { targetId } = await send("Target.createTarget", { url: "about:blank" });
const { sessionId } = await send("Target.attachToTarget", { targetId, flatten: true });
const s = (method, params) => send(method, params, sessionId);

const consoleErrors = [];
listeners.push((msg) => {
  if (msg.sessionId !== sessionId) return;
  if (msg.method === "Runtime.exceptionThrown") {
    consoleErrors.push(msg.params.exceptionDetails?.exception?.description ?? msg.params.exceptionDetails?.text);
  } else if (msg.method === "Runtime.consoleAPICalled" && msg.params.type === "error") {
    consoleErrors.push(msg.params.args.map((a) => a.value ?? a.description ?? "").join(" "));
  } else if (msg.method === "Log.entryAdded" && msg.params.entry.level === "error") {
    consoleErrors.push(`${msg.params.entry.text} ${msg.params.entry.url ?? ""}`.trim());
  }
});

await s("Page.enable");
await s("Runtime.enable");
await s("Log.enable");
await s("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile });
if (mobile) await s("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 5 });
await s("Emulation.setEmulatedMedia", {
  features: [{ name: "prefers-reduced-motion", value: reduce ? "reduce" : "no-preference" }],
});

const loaded = once("Page.loadEventFired", sessionId);
await s("Page.navigate", { url });
await Promise.race([loaded, sleep(20000)]);
await sleep(1200);

const evaluate = async (expression) =>
  (await s("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true })).result.value;

if (scroll) {
  // Walk the page so IntersectionObserver reveals, lazy images and scroll scenes run, then return to top.
  await evaluate(`(async () => {
    const step = Math.round(innerHeight * 0.7);
    for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
      scrollTo(0, y); await new Promise(r => setTimeout(r, 140));
    }
    scrollTo(0, document.documentElement.scrollHeight); await new Promise(r => setTimeout(r, 500));
    scrollTo(0, 0); await new Promise(r => setTimeout(r, 900));
    return true;
  })()`);
}

const overflow = await evaluate(`(() => {
  const vw = document.documentElement.clientWidth;
  const offenders = [];
  // An ancestor below <body> whose computed overflow-x clips or scrolls (Tailwind's overflow-x-clip,
  // overflow-hidden, inline styles, scrollers...) contains the element: not a page-level overflow.
  const clips = (el) => {
    for (let a = el.parentElement; a && a !== document.body; a = a.parentElement) {
      if (getComputedStyle(a).overflowX !== "visible") return true;
    }
    return false;
  };
  for (const el of document.querySelectorAll("body *")) {
    const r = el.getBoundingClientRect();
    if (r.width && r.right > vw + 1 && getComputedStyle(el).position !== "fixed" && !clips(el)) {
      offenders.push((el.tagName.toLowerCase() + "." + String(el.className).split(" ").slice(0, 3).join(".")).slice(0, 90) + " right=" + Math.round(r.right));
    }
  }
  return { viewport: vw, scrollWidth: document.documentElement.scrollWidth, offenders: offenders.slice(0, 12) };
})()`);

// Filmstrip mode: real viewport-sized shots at evenly spaced scroll positions. Use this for pages with
// sticky/pinned scroll scenes (a full-height viewport would stretch their 100vh stages).
const filmstrip = opt("filmstrip", 0);
if (filmstrip > 0) {
  const frames = [];
  const max = await evaluate("document.documentElement.scrollHeight - innerHeight");
  for (let i = 0; i < filmstrip; i++) {
    const y = Math.round((i * max) / Math.max(1, filmstrip - 1));
    await evaluate(`(async () => { scrollTo(0, ${y}); await new Promise(r => setTimeout(r, 900)); return true })()`);
    const shot = await s("Page.captureScreenshot", { format: "jpeg", quality: 72 });
    const file = `${outPrefix}-v${String(i + 1).padStart(2, "0")}.jpg`;
    writeFileSync(file, Buffer.from(shot.data, "base64"));
    frames.push({ file, y });
  }
  const title = await evaluate("document.title");
  ws.close();
  chrome.kill("SIGKILL");
  try {
    rmSync(profile, { recursive: true, force: true });
  } catch {}
  const summary = { url, width, reduce, title, scrollHeight: max, frames, overflow, consoleErrors: [...new Set(consoleErrors)].slice(0, 15) };
  writeFileSync(`${outPrefix}.json`, JSON.stringify(summary, null, 2));
  console.log(JSON.stringify(summary, null, 2));
  process.exit(0);
}

const { cssContentSize } = await s("Page.getLayoutMetrics");
const fullHeight = Math.min(Math.ceil(cssContentSize.height), 40000);
await s("Emulation.setDeviceMetricsOverride", { width, height: fullHeight, deviceScaleFactor: 1, mobile });
await sleep(700);

// Capture in clipped chunks so very tall pages (pinned scroll tracks) never exceed capture limits.
const files = [];
for (let top = 0, i = 1; top < fullHeight; top += slice, i++) {
  const h = Math.min(slice, fullHeight - top);
  const shot = await s("Page.captureScreenshot", {
    format: "jpeg",
    quality: 72,
    captureBeyondViewport: true,
    clip: { x: 0, y: top, width, height: h, scale: 1 },
  });
  const file = `${outPrefix}-${i}.jpg`;
  writeFileSync(file, Buffer.from(shot.data, "base64"));
  files.push(file);
}
const meta = await sharp(files[0]).metadata();
meta.height = fullHeight;

const title = await evaluate("document.title");
ws.close();
chrome.kill("SIGKILL");
try {
  rmSync(profile, { recursive: true, force: true });
} catch {}

const summary = { url, width, reduce, title, height: meta.height, files, overflow, consoleErrors: [...new Set(consoleErrors)].slice(0, 15) };
writeFileSync(`${outPrefix}.json`, JSON.stringify(summary, null, 2));
console.log(JSON.stringify(summary, null, 2));
process.exit(0);
