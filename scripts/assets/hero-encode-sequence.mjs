// Hero group: encode an extracted PNG frame set into a numbered AVIF scroll sequence plus manifest.json.
//
// Usage:
//   node scripts/assets/hero-encode-sequence.mjs \
//     --in assets-src/hero/frames-desktop --out public/sequences/hero-desktop \
//     --width 1920 --height 1080 --budget 6000000 --min-frames 120 \
//     --stage-times 0,0.25,0.5,0.75,1 [--quality 45] [--effort 6] [--min-quality 30]
//
// Strategy (per the build brief): start at quality 45 / effort 6. If the total is over budget,
// lower quality first (down to --min-quality), then thin the frame count (never below --min-frames).
// The first and last source frames are always kept so frame 0 = stage 1 and the last frame = stage 5.
// Stage indices in the manifest are derived from --stage-times (fractions of the source timeline,
// 0..1) mapped to the nearest kept frame.
import { readdir, mkdir, rm, writeFile, stat } from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import sharp from "sharp";

function arg(name, fallback) {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? process.argv[i + 1] : fallback;
}

const inDir = arg("in");
const outDir = arg("out");
const width = Number(arg("width"));
const height = Number(arg("height"));
const budget = Number(arg("budget"));
const minFrames = Number(arg("min-frames", "60"));
const startQuality = Number(arg("quality", "45"));
const minQuality = Number(arg("min-quality", "30"));
const effort = Number(arg("effort", "6"));
const stageTimes = arg("stage-times", "0,0.25,0.5,0.75,1").split(",").map(Number);
const pad = 4;

if (!inDir || !outDir || !width || !height || !budget) {
  console.error("missing required args");
  process.exit(1);
}

const sources = (await readdir(inDir)).filter((f) => f.endsWith(".png")).sort();
if (sources.length < 2) throw new Error(`no frames in ${inDir}`);

// Pick `count` evenly spaced source frames, always including the first and the last.
function pick(count) {
  const n = sources.length;
  if (count >= n) return sources.map((_, i) => i);
  const idx = [];
  for (let k = 0; k < count; k++) idx.push(Math.round((k * (n - 1)) / (count - 1)));
  return [...new Set(idx)];
}

async function encodeOne(srcIdx, outIdx, quality) {
  const src = path.join(inDir, sources[srcIdx]);
  const dst = path.join(outDir, `${String(outIdx + 1).padStart(pad, "0")}.avif`);
  await sharp(src)
    .resize(width, height, { fit: "cover", position: "centre" })
    .avif({ quality, effort, chromaSubsampling: "4:2:0" })
    .toFile(dst);
  return (await stat(dst)).size;
}

async function encodeSet(indices, quality) {
  await rm(outDir, { recursive: true, force: true });
  await mkdir(outDir, { recursive: true });
  const sizes = new Array(indices.length);
  const workers = Math.max(2, Math.min(8, os.cpus().length - 1));
  let next = 0;
  await Promise.all(
    Array.from({ length: workers }, async () => {
      while (next < indices.length) {
        const k = next++;
        sizes[k] = await encodeOne(indices[k], k, quality);
      }
    }),
  );
  return sizes.reduce((a, b) => a + b, 0);
}

let count = sources.length;
let quality = startQuality;
let indices = pick(count);
let total = await encodeSet(indices, quality);
console.log(`frames=${indices.length} q=${quality} total=${total}`);

while (total > budget && quality > minQuality) {
  // Estimate the quality step from the overshoot; AVIF size roughly halves every ~8-10 quality points.
  quality = Math.max(minQuality, quality - (total > budget * 1.25 ? 4 : 2));
  total = await encodeSet(indices, quality);
  console.log(`frames=${indices.length} q=${quality} total=${total}`);
}
while (total > budget && count > minFrames) {
  count = Math.max(minFrames, Math.floor((count * budget) / total) - 1);
  indices = pick(count);
  total = await encodeSet(indices, quality);
  console.log(`frames=${indices.length} q=${quality} total=${total}`);
}
if (total > budget) console.warn(`WARNING: still over budget (${total} > ${budget})`);

// Map stage times (fractions of the source timeline) to output frame indices: the first kept frame at or
// after each stage keyframe. Each interpolation clip holds its start keyframe before transforming, so
// these frames sit in the clean "hold" of the stage rather than mid-transition.
const n = sources.length;
const stages = stageTimes.map((t) => {
  const srcPos = t * (n - 1) - 1e-6;
  const k = indices.findIndex((s) => s >= srcPos);
  return k === -1 ? indices.length - 1 : k;
});
stages[0] = 0;
stages[stages.length - 1] = indices.length - 1;

const manifest = {
  frames: indices.length,
  width,
  height,
  ext: "avif",
  pad,
  stages,
  bytes: total,
};
await writeFile(path.join(outDir, "manifest.json"), JSON.stringify(manifest) + "\n");
console.log(JSON.stringify({ ...manifest, quality, effort, sourceFrames: n, picked: indices }));
