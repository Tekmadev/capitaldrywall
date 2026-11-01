// Hero group: encode poster images from exact source frames.
//
// Usage:
//   node scripts/assets/hero-posters.mjs <srcFrame.png> <outBase> <width> <height> [jpegQ=84] [avifQ=55]
//   (writes <outBase>.jpg and, if avifQ > 0, <outBase>.avif)
//
// Hero posters must be the EXACT last frame of each scroll sequence, so the source is the same PNG
// that the final AVIF frame was encoded from; only the encoder quality differs.
import { stat } from "node:fs/promises";
import sharp from "sharp";

const [, , src, outBase, w, h, jq = "84", aq = "55"] = process.argv;
if (!src || !outBase || !w || !h) {
  console.error("usage: hero-posters.mjs <src.png> <outBase> <width> <height> [jpegQ] [avifQ]");
  process.exit(1);
}
const width = Number(w);
const height = Number(h);
const base = sharp(src).resize(width, height, { fit: "cover", position: "centre" });

const jpgPath = `${outBase}.jpg`;
await base.clone().jpeg({ quality: Number(jq), mozjpeg: true }).toFile(jpgPath);
const out = [{ path: jpgPath, bytes: (await stat(jpgPath)).size }];

if (Number(aq) > 0) {
  const avifPath = `${outBase}.avif`;
  await base.clone().avif({ quality: Number(aq), effort: 6 }).toFile(avifPath);
  out.push({ path: avifPath, bytes: (await stat(avifPath)).size });
}
for (const o of out) {
  const m = await sharp(o.path).metadata();
  console.log(`${o.path} ${m.width}x${m.height} ${o.bytes} bytes`);
}
