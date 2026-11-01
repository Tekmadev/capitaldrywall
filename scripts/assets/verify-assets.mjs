// Generated-asset contract check (sharp metadata + ffprobe). Read-only: it never changes a file.
//
// usage: node scripts/assets/verify-assets.mjs        (exit code 1 if any check fails)
//
// Budgets use decimal megabytes (1 MB = 1,000,000 bytes), the stricter reading.
import sharp from "sharp";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const FFPROBE = fs.existsSync("/opt/homebrew/bin/ffprobe") ? "/opt/homebrew/bin/ffprobe" : "ffprobe";
const MB = 1_000_000;
const rows = [];
const row = (group, file, expect, actual, ok, note = "") =>
  rows.push({ group, file, expect, actual, status: ok ? "PASS" : "FAIL", note });

const exists = (f) => fs.existsSync(f);
const size = (f) => fs.statSync(f).size;
const kb = (n) => `${(n / 1000).toFixed(1)} kB`;
const mb = (n) => `${(n / MB).toFixed(3)} MB`;

// sharp reports AVIF as format "heif" with compression "av1"
async function meta(file) {
  const m = await sharp(file).metadata();
  const fmt = m.format === "heif" ? (m.compression === "av1" ? "avif" : `heif/${m.compression}`) : m.format;
  return { w: m.width, h: m.height, fmt };
}

async function image(group, file, w, h, fmt) {
  if (!exists(file)) return row(group, file, `${w}x${h} ${fmt}`, "missing", false);
  const m = await meta(file);
  const ok = m.w === w && m.h === h && m.fmt === fmt;
  row(group, file, `${w}x${h} ${fmt}`, `${m.w}x${m.h} ${m.fmt}, ${kb(size(file))}`, ok);
}

// Small greyscale thumbnails: mean absolute difference 0..255 (0 = identical pixels).
async function thumb(file) {
  return sharp(file).resize(160, 160, { fit: "fill" }).greyscale().raw().toBuffer();
}
async function mad(a, b) {
  const [x, y] = await Promise.all([thumb(a), thumb(b)]);
  let s = 0;
  for (let i = 0; i < x.length; i++) s += Math.abs(x[i] - y[i]);
  return s / x.length;
}

async function sequence(name, w, h, budget, nStages) {
  const dir = `public/sequences/${name}`;
  const group = `sequence ${name}`;
  const mf = path.join(dir, "manifest.json");
  if (!exists(mf)) return row(group, mf, "manifest.json", "missing", false);
  let m;
  try {
    m = JSON.parse(fs.readFileSync(mf, "utf8"));
  } catch (e) {
    return row(group, mf, "valid JSON", String(e.message), false);
  }
  const keys = ["frames", "width", "height", "ext", "pad", "stages", "bytes"];
  const missing = keys.filter((k) => !(k in m));
  row(group, mf, `keys ${keys.join(",")}`, missing.length ? `missing ${missing.join(",")}` : "all present", !missing.length);
  row(group, mf, `width/height ${w}x${h}, ext avif, pad 4`, `${m.width}x${m.height}, ext ${m.ext}, pad ${m.pad}`,
    m.width === w && m.height === h && m.ext === "avif" && m.pad === 4);

  const re = new RegExp(`^\\d{${m.pad || 4}}\\.${m.ext || "avif"}$`);
  const files = fs.readdirSync(dir).filter((f) => re.test(f)).sort();
  const expectedNames = Array.from({ length: m.frames }, (_, i) => `${String(i + 1).padStart(m.pad, "0")}.${m.ext}`);
  const contiguous = files.length === expectedNames.length && files.every((f, i) => f === expectedNames[i]);
  row(group, dir, `manifest frames (${m.frames}) == file count, 0001..${expectedNames.at(-1)}`,
    `${files.length} files${contiguous ? ", contiguous" : ", NOT contiguous"}`, contiguous);

  const st = m.stages;
  const validStages = Array.isArray(st) && st.length === nStages && st.every(Number.isInteger) &&
    st[0] === 0 && st.at(-1) === m.frames - 1 && st.every((v, i) => i === 0 || v > st[i - 1]) &&
    st.every((v) => v >= 0 && v < m.frames);
  row(group, mf, `${nStages} stage indices, 0 .. frames-1, increasing`, JSON.stringify(st), validStages);

  let total = 0;
  const bad = [];
  for (const f of files) {
    const p = path.join(dir, f);
    total += size(p);
    const mm = await meta(p);
    if (mm.w !== w || mm.h !== h || mm.fmt !== "avif") bad.push(`${f}=${mm.w}x${mm.h} ${mm.fmt}`);
  }
  row(group, dir, `every frame ${w}x${h} avif`, bad.length ? bad.slice(0, 4).join("; ") : `${files.length}/${files.length} ok`, !bad.length);
  row(group, dir, `total <= ${mb(budget)}`, mb(total), total <= budget);
  row(group, mf, "manifest bytes == sum of frame files", `${m.bytes} vs ${total}`, m.bytes === total);
  return { dir, files, m };
}

async function posterMatches(group, poster, frame, label) {
  if (!exists(poster) || !exists(frame)) return row(group, poster, `matches ${label}`, "missing input", false);
  const d = await mad(poster, frame);
  row(group, poster, `same picture as ${label} (mean abs diff < 3/255)`, d.toFixed(2), d < 3);
}

function probe(file) {
  const out = execFileSync(FFPROBE, ["-v", "error", "-show_entries", "stream=codec_type,codec_name,width,height:format=duration", "-of", "json", file], { encoding: "utf8" });
  return JSON.parse(out);
}

async function video(group, file, maxBytes, w, h) {
  if (!exists(file)) return row(group, file, "exists", "missing", false);
  const p = probe(file);
  const v = p.streams.filter((s) => s.codec_type === "video");
  const a = p.streams.filter((s) => s.codec_type === "audio");
  row(group, file, `<= ${mb(maxBytes)}`, mb(size(file)), size(file) <= maxBytes);
  row(group, file, "no audio stream", `${a.length} audio, ${v.length} video (${v[0]?.codec_name} ${v[0]?.width}x${v[0]?.height}, ${Number(p.format.duration).toFixed(2)} s)`,
    a.length === 0 && v.length === 1 && (!w || (v[0].width === w && v[0].height === h)));
}

// ---------------------------------------------------------------- checks
const hd = await sequence("hero-desktop", 1920, 1080, 6 * MB, 5);
const hm = await sequence("hero-mobile", 900, 1600, 2.5 * MB, 5);
const bd = await sequence("basement-desktop", 1920, 1080, 5 * MB, 4);
const bm = await sequence("basement-mobile", 900, 1600, 2 * MB, 4);

const H = "public/images/hero";
await image("hero posters", `${H}/hero-poster-desktop.jpg`, 1920, 1080, "jpeg");
await image("hero posters", `${H}/hero-poster-desktop.avif`, 1920, 1080, "avif");
await image("hero posters", `${H}/hero-poster-mobile.jpg`, 900, 1600, "jpeg");
await image("hero posters", `${H}/hero-poster-mobile.avif`, 900, 1600, "avif");
await image("hero posters", `${H}/drywall-loop-poster.jpg`, 1280, 720, "jpeg");
if (hd?.files?.length) await posterMatches("hero posters", `${H}/hero-poster-desktop.jpg`, path.join(hd.dir, hd.files.at(-1)), "last hero-desktop frame");
if (hm?.files?.length) await posterMatches("hero posters", `${H}/hero-poster-mobile.jpg`, path.join(hm.dir, hm.files.at(-1)), "last hero-mobile frame");

await video("drywall loop", "public/video/drywall-raking-loop.mp4", 1.5 * MB, 1280, 720);
if (exists("public/video/drywall-raking-loop.webm")) await video("drywall loop", "public/video/drywall-raking-loop.webm", 1.5 * MB, 1280, 720);

await image("og", "assets/og/og-base.jpg", 1200, 630, "jpeg");

const B = "public/images/basement";
for (let k = 1; k <= 4; k++) {
  await image("basement stills", `${B}/basement-stage-${k}-desktop.jpg`, 1920, 1080, "jpeg");
  await image("basement stills", `${B}/basement-stage-${k}-mobile.jpg`, 900, 1600, "jpeg");
}
await image("basement stills", `${B}/basement-poster-desktop.jpg`, 1920, 1080, "jpeg");
await image("basement stills", `${B}/basement-poster-mobile.jpg`, 900, 1600, "jpeg");
if (bd?.files?.length) await posterMatches("basement stills", `${B}/basement-poster-desktop.jpg`, path.join(bd.dir, bd.files[0]), "first basement-desktop frame");
if (bm?.files?.length) await posterMatches("basement stills", `${B}/basement-poster-mobile.jpg`, path.join(bm.dir, bm.files[0]), "first basement-mobile frame");

for (const n of ["rushed-flat", "rushed-raking", "capital-flat", "capital-raking"]) {
  await image("raking", `public/images/raking/${n}.jpg`, 1200, 1500, "jpeg");
}

const A = "public/images/atmosphere";
for (const n of ["taping-knife", "sanding-ceiling", "paint-roller", "smooth-ceiling-pot-lights", "bathroom-tile-shower", "kitchen-shaker-cabinets"]) {
  await image("atmosphere", `${A}/${n}-16x9.jpg`, 1920, 1080, "jpeg");
  await image("atmosphere", `${A}/${n}-4x5.jpg`, 1200, 1500, "jpeg");
}
for (let k = 1; k <= 5; k++) await image("atmosphere", `${A}/wall-stage-${k}-16x9.jpg`, 1920, 1080, "jpeg");
for (const k of [1, 3, 5]) await image("atmosphere", `${A}/wall-stage-${k}-4x5.jpg`, 1200, 1500, "jpeg");

for (const n of ["rec-room", "home-office", "guest-suite", "gym-media-room", "bathroom-wet-bar", "basement-refresh"]) {
  await image("basement tiles", `public/images/basement-tiles/${n}.jpg`, 1200, 1500, "jpeg");
}

const S = "public/images/samples";
for (const n of ["drywall-hole-repair", "water-damaged-ceiling", "popcorn-ceiling", "basement-finish"]) {
  await image("samples", `${S}/${n}-before.jpg`, 1600, 1200, "jpeg");
  await image("samples", `${S}/${n}-after.jpg`, 1600, 1200, "jpeg");
}
await image("samples", `${S}/level-5-hallway.jpg`, 1600, 1200, "jpeg");
await image("samples", `${S}/basement-drywall-taping.jpg`, 1600, 1200, "jpeg");

// ---------------------------------------------------------------- report
const cols = ["status", "group", "file", "expect", "actual"];
const width = Object.fromEntries(cols.map((c) => [c, Math.min(64, Math.max(c.length, ...rows.map((r) => String(r[c]).length)))]));
const cell = (c, v) => String(v).slice(0, width[c]).padEnd(width[c]);
console.log(cols.map((c) => cell(c, c.toUpperCase())).join(" | "));
console.log(cols.map((c) => "-".repeat(width[c])).join("-|-"));
for (const r of rows) console.log(cols.map((c) => cell(c, r[c])).join(" | "));
const fails = rows.filter((r) => r.status === "FAIL");
console.log(`\n${rows.length} checks, ${rows.length - fails.length} pass, ${fails.length} fail`);
if (fails.length) {
  console.log("\nFailures:");
  for (const f of fails) console.log(`- [${f.group}] ${f.file}: expected ${f.expect}, got ${f.actual}`);
  process.exitCode = 1;
}
