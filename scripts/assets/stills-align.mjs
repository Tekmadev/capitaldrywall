// stills group: register an edited image (B) onto its reference (A) and verify the overlay.
//
// Usage:
//   node scripts/assets/stills-align.mjs <ref A> <edit B> <out aligned B> [--mode gradient|pixel] [--range 0.06]
//
// - mode "gradient" compares Sobel edge maps (use when lighting differs, e.g. flat vs raking light).
// - mode "pixel" compares luminance with a trimmed mean (use for before/after where only a region changes).
// Searches scale + translation coarse-to-fine, warps B into A's frame (bilinear), writes the aligned B at
// A's exact pixel size, and writes a 50/50 blend + amplified difference preview for visual checking.
import sharp from 'sharp';
import path from 'node:path';
import fs from 'node:fs';

const args = process.argv.slice(2);
const [refPath, editPath, outPath] = args;
const opt = (name, dflt) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : dflt;
};
const mode = opt('mode', 'gradient');
const range = Number(opt('range', '0.06'));
// optional region of interest (fractions of the reference frame) used for the error metric only
const roi = opt('roi', null) ? opt('roi', null).split(',').map(Number) : null;
if (!refPath || !editPath || !outPath) {
  console.error('usage: stills-align.mjs <ref> <edit> <out> [--mode gradient|pixel] [--range 0.06]');
  process.exit(1);
}

async function grey(file, width) {
  const { data, info } = await sharp(file).resize({ width }).greyscale().raw().toBuffer({ resolveWithObject: true });
  return { data: Float32Array.from(data), w: info.width, h: info.height };
}

function sobel(img) {
  const { data, w, h } = img;
  const out = new Float32Array(w * h);
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const i = y * w + x;
      const gx = -data[i - w - 1] - 2 * data[i - 1] - data[i + w - 1] + data[i - w + 1] + 2 * data[i + 1] + data[i + w + 1];
      const gy = -data[i - w - 1] - 2 * data[i - w] - data[i - w + 1] + data[i + w - 1] + 2 * data[i + w] + data[i + w + 1];
      out[i] = Math.sqrt(gx * gx + gy * gy);
    }
  }
  // normalise to mean 1 so differently lit images are comparable
  let sum = 0;
  for (let i = 0; i < out.length; i++) sum += out[i];
  const m = sum / out.length || 1;
  for (let i = 0; i < out.length; i++) out[i] /= m;
  return { data: out, w, h };
}

function prep(img) {
  return mode === 'gradient' ? sobel(img) : img;
}

// error of B warped into A's frame with params (s, dx, dy); dx/dy in A pixels at this level
function err(A, B, s, dx, dy, trim) {
  const { w, h } = A;
  const cx = w / 2, cy = h / 2;
  const sxB = B.w / A.w, syB = B.h / A.h; // B may differ slightly in size
  const margin = Math.round(Math.min(w, h) * 0.06);
  const step = w > 700 ? 2 : 1;
  const x0 = roi ? Math.max(margin, Math.round(roi[0] * w)) : margin;
  const y0 = roi ? Math.max(margin, Math.round(roi[1] * h)) : margin;
  const x1 = roi ? Math.min(w - margin, Math.round((roi[0] + roi[2]) * w)) : w - margin;
  const y1 = roi ? Math.min(h - margin, Math.round((roi[1] + roi[3]) * h)) : h - margin;
  const hist = trim ? new Float64Array(256) : null; // pixel mode: integer luminance diffs 0..255
  let sum = 0, n = 0;
  for (let y = y0; y < y1; y += step) {
    for (let x = x0; x < x1; x += step) {
      const xb = (cx + s * (x - cx) + dx) * sxB;
      const yb = (cy + s * (y - cy) + dy) * syB;
      const xi = Math.round(xb), yi = Math.round(yb);
      if (xi < 0 || yi < 0 || xi >= B.w || yi >= B.h) continue;
      const d = Math.abs(A.data[y * w + x] - B.data[yi * B.w + xi]);
      if (trim) hist[Math.min(255, Math.round(d))]++;
      else sum += d;
      n++;
    }
  }
  if (!n) return Infinity;
  if (!trim) return sum / n;
  // trimmed mean of the lowest 75% of differences (ignores the region that was intentionally edited)
  const keep = n * 0.75;
  let seen = 0, t = 0;
  for (let v = 0; v < 256 && seen < keep; v++) {
    const take = Math.min(hist[v], keep - seen);
    t += take * v;
    seen += take;
  }
  return t / keep;
}

function search(A, B, center, spanS, stepS, spanT, stepT, trim) {
  let best = { e: Infinity };
  for (let s = center.s - spanS; s <= center.s + spanS + 1e-9; s += stepS) {
    for (let dy = center.dy - spanT; dy <= center.dy + spanT + 1e-9; dy += stepT) {
      for (let dx = center.dx - spanT; dx <= center.dx + spanT + 1e-9; dx += stepT) {
        const e = err(A, B, s, dx, dy, trim);
        if (e < best.e) best = { e, s, dx, dy };
      }
    }
  }
  return best;
}

const metaA = await sharp(refPath).metadata();
const metaB = await sharp(editPath).metadata();
const trim = mode === 'pixel';

// level 1: 240 px wide
const W1 = 240;
let A1 = prep(await grey(refPath, W1));
let B1 = prep(await grey(editPath, Math.round((W1 * metaB.width) / metaA.width)));
const identity = { s: 1, dx: 0, dy: 0 };
const e0 = err(A1, B1, 1, 0, 0, trim);
let best = search(A1, B1, identity, range, 0.005, 12, 1, trim);
// level 2: 600 px wide
const W2 = 600;
const k12 = W2 / W1;
let A2 = prep(await grey(refPath, W2));
let B2 = prep(await grey(editPath, Math.round((W2 * metaB.width) / metaA.width)));
best = search(A2, B2, { s: best.s, dx: best.dx * k12, dy: best.dy * k12 }, 0.006, 0.0015, 4, 1, trim);
// level 3: 1200 px wide, sub-pixel-ish refinement
const W3 = Math.min(1200, metaA.width);
const k23 = W3 / W2;
let A3 = prep(await grey(refPath, W3));
let B3 = prep(await grey(editPath, Math.round((W3 * metaB.width) / metaA.width)));
const e3identity = err(A3, B3, 1, 0, 0, trim);
best = search(A3, B3, { s: best.s, dx: best.dx * k23, dy: best.dy * k23 }, 0.0015, 0.0005, 2, 0.5, trim);
const kFull = metaA.width / W3;
const params = { s: best.s, dx: best.dx * kFull, dy: best.dy * kFull };

// warp B (full res, RGB) into A's frame
const { data: bData, info: bInfo } = await sharp(editPath).removeAlpha().raw().toBuffer({ resolveWithObject: true });
const W = metaA.width, H = metaA.height, C = 3;
const out = Buffer.alloc(W * H * C);
const cx = W / 2, cy = H / 2;
const sxB = bInfo.width / W, syB = bInfo.height / H;
let clipped = 0;
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    let xb = (cx + params.s * (x - cx) + params.dx) * sxB;
    let yb = (cy + params.s * (y - cy) + params.dy) * syB;
    if (xb < 0 || yb < 0 || xb > bInfo.width - 1 || yb > bInfo.height - 1) clipped++;
    xb = Math.min(Math.max(xb, 0), bInfo.width - 1.001);
    yb = Math.min(Math.max(yb, 0), bInfo.height - 1.001);
    const x0 = Math.floor(xb), y0 = Math.floor(yb);
    const fx = xb - x0, fy = yb - y0;
    for (let c = 0; c < C; c++) {
      const i00 = (y0 * bInfo.width + x0) * C + c;
      const i10 = i00 + C, i01 = i00 + bInfo.width * C, i11 = i01 + C;
      const v = bData[i00] * (1 - fx) * (1 - fy) + bData[i10] * fx * (1 - fy) + bData[i01] * (1 - fx) * fy + bData[i11] * fx * fy;
      out[(y * W + x) * C + c] = Math.round(v);
    }
  }
}
await sharp(out, { raw: { width: W, height: H, channels: C } }).png().toFile(outPath);

// verification previews: 50/50 blend and amplified abs difference (of the aligned result)
const prevDir = path.resolve('assets-src/stills/work/preview');
fs.mkdirSync(prevDir, { recursive: true });
const base = path.basename(outPath).replace(/\.[^.]+$/, '');
const pw = 900;
const a = await sharp(refPath).removeAlpha().resize({ width: pw }).raw().toBuffer({ resolveWithObject: true });
const b = await sharp(outPath).removeAlpha().resize({ width: pw }).raw().toBuffer();
const blend = Buffer.alloc(a.data.length), diff = Buffer.alloc(a.data.length);
for (let i = 0; i < a.data.length; i++) {
  blend[i] = (a.data[i] + b[i]) >> 1;
  diff[i] = Math.min(255, Math.abs(a.data[i] - b[i]) * 3);
}
const raw = { raw: { width: a.info.width, height: a.info.height, channels: 3 } };
await sharp(blend, raw).jpeg({ quality: 85 }).toFile(path.join(prevDir, `${base}-blend.jpg`));
await sharp(diff, raw).jpeg({ quality: 85 }).toFile(path.join(prevDir, `${base}-diff.jpg`));

console.log(JSON.stringify({
  mode, roi, ref: refPath, edit: editPath, out: outPath,
  refSize: [metaA.width, metaA.height], editSize: [metaB.width, metaB.height],
  scale: +params.s.toFixed(5), dx: +params.dx.toFixed(2), dy: +params.dy.toFixed(2),
  errIdentityL1: +e0.toFixed(4), errIdentityL3: +e3identity.toFixed(4), errBestL3: +best.e.toFixed(4),
  clippedPx: clipped,
}));
