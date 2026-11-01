// stills group: turn kept raw generations into the exact-size web images.
//
// Usage: node scripts/assets/stills-process.mjs [filter]
//   (run from the project root; optional filter = substring of output path to process a subset)
//
// Steps per output: load raw PNG -> optional retouch (Coons-patch inpaint of small text/logo/defect
// patches, with grain matched to the surroundings) -> optional low-frequency light/colour match to a
// partner image -> crop (explicit box, or "cover" centre) -> resize to exact size -> JPEG (mozjpeg, q82).
// Before/after and flat/raking partners use identical crop parameters so they stay pixel-aligned.
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';

const RAW = 'assets-src/stills/raw';
const filter = process.argv[2] || '';

// ---------- helpers ----------
async function load(file) {
  const { data, info } = await sharp(path.join(RAW, file)).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  return { data: Buffer.from(data), w: info.width, h: info.height, c: info.channels };
}

function rng(seed) {
  let s = seed >>> 0 || 1;
  return () => {
    s ^= s << 13; s >>>= 0; s ^= s >> 17; s ^= s << 5; s >>>= 0;
    return s / 4294967296;
  };
}

// Coons-patch fill of rect [x0,y0,x1,y1) from 3px-thick borders, plus grain matched to a ring around it.
function inpaint(img, [x0, y0, x1, y1], seed = 7) {
  const { data, w, h, c } = img;
  const px = (x, y, ch) => data[(Math.min(h - 1, Math.max(0, y)) * w + Math.min(w - 1, Math.max(0, x))) * c + ch];
  const avg = (fn) => (fn(0) + fn(1) + fn(2)) / 3;
  const T = [], B = [], L = [], R = [];
  for (let x = x0; x < x1; x++) {
    T.push([0, 1, 2].map((ch) => avg((k) => px(x, y0 - 1 - k, ch))));
    B.push([0, 1, 2].map((ch) => avg((k) => px(x, y1 + k, ch))));
  }
  for (let y = y0; y < y1; y++) {
    L.push([0, 1, 2].map((ch) => avg((k) => px(x0 - 1 - k, y, ch))));
    R.push([0, 1, 2].map((ch) => avg((k) => px(x1 + k, y, ch))));
  }
  // smooth each border profile along its length so border grain is not smeared into a crosshatch
  const smooth = (arr, r = 6) => arr.map((_, i) => [0, 1, 2].map((ch) => {
    let s = 0, n = 0;
    for (let k = Math.max(0, i - r); k <= Math.min(arr.length - 1, i + r); k++) { s += arr[k][ch]; n++; }
    return s / n;
  }));
  [T, B, L, R].forEach((arr) => { const sm = smooth(arr); sm.forEach((v, i) => { arr[i] = v; }); });
  // grain estimate: residual vs 4-neighbour mean in a ring 4..16px outside the rect
  let acc = 0, n = 0;
  for (let y = y0 - 16; y < y1 + 16; y++) {
    for (let x = x0 - 16; x < x1 + 16; x++) {
      const inside = x >= x0 - 4 && x < x1 + 4 && y >= y0 - 4 && y < y1 + 4;
      if (inside || x < 1 || y < 1 || x >= w - 1 || y >= h - 1) continue;
      const v = (px(x, y, 0) + px(x, y, 1) + px(x, y, 2)) / 3;
      const m = [[1, 0], [-1, 0], [0, 1], [0, -1]].reduce((s, [dx, dy]) => s + (px(x + dx, y + dy, 0) + px(x + dx, y + dy, 1) + px(x + dx, y + dy, 2)) / 3, 0) / 4;
      acc += (v - m) * (v - m); n++;
    }
  }
  const sigma = n ? Math.sqrt(acc / n) * 0.9 : 0;
  const rand = rng(seed);
  const gauss = () => Math.sqrt(-2 * Math.log(rand() + 1e-12)) * Math.cos(2 * Math.PI * rand());
  const W = x1 - x0, H = y1 - y0;
  for (let y = y0; y < y1; y++) {
    const v = (y - y0 + 0.5) / H;
    for (let x = x0; x < x1; x++) {
      const u = (x - x0 + 0.5) / W;
      const g = gauss() * sigma;
      for (let ch = 0; ch < 3; ch++) {
        const t = T[x - x0][ch], b = B[x - x0][ch], l = L[y - y0][ch], r = R[y - y0][ch];
        const c00 = (T[0][ch] + L[0][ch]) / 2, c10 = (T[W - 1][ch] + R[0][ch]) / 2;
        const c01 = (B[0][ch] + L[H - 1][ch]) / 2, c11 = (B[W - 1][ch] + R[H - 1][ch]) / 2;
        const val = (1 - v) * t + v * b + (1 - u) * l + u * r
          - ((1 - u) * (1 - v) * c00 + u * (1 - v) * c10 + (1 - u) * v * c01 + u * v * c11);
        data[(y * w + x) * c + ch] = Math.max(0, Math.min(255, Math.round(val + g)));
      }
    }
  }
  return img;
}

// Clone-stamp rect [x0,y0,x1,y1) from the pixels offset by (dx,dy): for marks sitting on a hard edge.
function clone(img, [x0, y0, x1, y1], dx, dy) {
  const { data, w, c } = img;
  const src = Buffer.from(data);
  for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) for (let ch = 0; ch < c; ch++) {
    data[(y * w + x) * c + ch] = src[((y + dy) * w + (x + dx)) * c + ch];
  }
  return img;
}

// Smooth light field: least-squares fit of a degree-4 2-D polynomial to log(value) per channel on a
// 1/32 downsample. A low-order surface carries the broad light falloff and colour of a panel but cannot
// represent seams, ridges, nail pops or banding, so nothing of the partner's defects is transferred.
const DEG = 4;
const terms = [];
for (let i = 0; i <= DEG; i++) for (let j = 0; j <= DEG - i; j++) terms.push([i, j]);
function basis(x, y) {
  return terms.map(([i, j]) => x ** i * y ** j);
}
function solve(A, b) {
  const n = b.length;
  const M = A.map((row, i) => [...row, b[i]]);
  for (let k = 0; k < n; k++) {
    let p = k;
    for (let r = k + 1; r < n; r++) if (Math.abs(M[r][k]) > Math.abs(M[p][k])) p = r;
    [M[k], M[p]] = [M[p], M[k]];
    for (let r = k + 1; r < n; r++) {
      const f = M[r][k] / M[k][k];
      for (let c2 = k; c2 <= n; c2++) M[r][c2] -= f * M[k][c2];
    }
  }
  const x = new Array(n).fill(0);
  for (let k = n - 1; k >= 0; k--) {
    let s = M[k][n];
    for (let c2 = k + 1; c2 < n; c2++) s -= M[k][c2] * x[c2];
    x[k] = s / M[k][k];
  }
  return x;
}
async function fitLight(o) {
  const sw = Math.round(o.w / 32), sh = Math.round(o.h / 32);
  const small = await sharp(o.data, { raw: { width: o.w, height: o.h, channels: o.c } }).resize(sw, sh, { fit: 'fill' }).raw().toBuffer();
  const coefs = [];
  for (let ch = 0; ch < 3; ch++) {
    const n = terms.length;
    const A = Array.from({ length: n }, () => new Array(n).fill(0));
    const b = new Array(n).fill(0);
    for (let y = 0; y < sh; y++) {
      for (let x = 0; x < sw; x++) {
        const phi = basis((2 * x + 1) / sw - 1, (2 * y + 1) / sh - 1);
        const v = Math.log(small[(y * sw + x) * o.c + ch] + 1);
        for (let r = 0; r < n; r++) {
          b[r] += phi[r] * v;
          for (let c2 = 0; c2 < n; c2++) A[r][c2] += phi[r] * phi[c2];
        }
      }
    }
    coefs.push(solve(A, b));
  }
  return coefs;
}

// Transfer the broad light and colour of `ref` onto `img`: img * exp(Pref - Pimg).
async function matchLowFreq(img, ref) {
  const ci = await fitLight(img), cr = await fitLight(ref);
  const out = Buffer.alloc(img.data.length);
  for (let y = 0; y < img.h; y++) {
    const yn = (2 * y + 1) / img.h - 1;
    for (let x = 0; x < img.w; x++) {
      const phi = basis((2 * x + 1) / img.w - 1, yn);
      for (let ch = 0; ch < 3; ch++) {
        let d = 0;
        for (let t = 0; t < phi.length; t++) d += (cr[ch][t] - ci[ch][t]) * phi[t];
        const i = (y * img.w + x) * img.c + ch;
        out[i] = Math.max(0, Math.min(255, Math.round((img.data[i] + 1) * Math.exp(d) - 1)));
      }
    }
  }
  return { ...img, data: out };
}

async function write(img, out, { width, height, extract, position = 'centre' }) {
  fs.mkdirSync(path.dirname(out), { recursive: true });
  let p = sharp(img.data, { raw: { width: img.w, height: img.h, channels: img.c } });
  if (extract) p = p.extract(extract);
  await p.resize(width, height, { fit: 'cover', position }).jpeg({ quality: 82, mozjpeg: true }).toFile(out);
  const m = await sharp(out).metadata();
  const bytes = fs.statSync(out).size;
  if (m.width !== width || m.height !== height) throw new Error(`${out}: got ${m.width}x${m.height}`);
  console.log(`${out}\t${m.width}x${m.height}\t${bytes}`);
}

const want = (o) => !filter || o.includes(filter);

// ---------- 1) raking-light test, 1200x1500 ----------
const RK = { width: 1200, height: 1500 };
if (want('public/images/raking')) {
  const r1 = await load('raking-r1-flat-nano-v1.png');
  const r2 = await load('raking-r2-raking-nano-v1.png');
  const r3 = await load('raking-r3-flat-nano-v1.png');
  // the "Capital" flat panel carried a faint hairline and a speck cluster: fill them
  inpaint(r3, [878, 930, 940, 1390], 13);
  inpaint(r3, [80, 1200, 175, 1280], 14);
  let r4 = await load('raking-r4-raking-nano-v1.png');
  // R4 kept two faint nail pops from R2: fill them from the surrounding smooth gradient
  inpaint(r4, [220, 1495, 350, 1615], 11);
  inpaint(r4, [840, 1480, 990, 1630], 12); // pop 2 casts a shadow out to x~955

  if (process.env.STILLS_DEBUG) {
    await sharp(r4.data, { raw: { width: r4.w, height: r4.h, channels: r4.c } }).png().toFile('assets-src/stills/work/debug-r4-inpainted.png');
  }
  // same light and colour as the partner panel (only the surface finish differs)
  r4 = await matchLowFreq(r4, r2);
  const r3m = await matchLowFreq(r3, r1);
  await write(r1, 'public/images/raking/rushed-flat.jpg', RK);
  await write(r2, 'public/images/raking/rushed-raking.jpg', RK);
  await write(r3m, 'public/images/raking/capital-flat.jpg', RK);
  await write(r4, 'public/images/raking/capital-raking.jpg', RK);
}

// ---------- 2) atmosphere stills, 1920x1080 + 1200x1500 ----------
const A16 = { width: 1920, height: 1080 };
const A45 = { width: 1200, height: 1500 };
const atmosphere = [
  { name: 'taping-knife', src: 'atm-taping-knife-16x9-gpt-v1.png', x45: 620 },
  { name: 'sanding-ceiling', src: 'atm-sanding-ceiling-16x9-nano-v1.png', x45: 950 },
  { name: 'paint-roller', src: 'atm-paint-roller-16x9-gpt-v1.png', x45: 820 },
  // right edge holds a dark out-of-focus shape that could read as a figure: crop it out of the 16:9
  { name: 'smooth-ceiling-pot-lights', src: 'atm-smooth-ceiling-pot-lights-16x9-nano-v2.png', x45: 760, ext16: { left: 0, top: 110, width: 2468, height: 1388 } },
  { name: 'bathroom-tile-shower', src: 'atm-bathroom-tile-shower-16x9-nano-v1.png', x45: 1450 },
  // soap-bottle label carried pseudo-text: blank it
  { name: 'kitchen-shaker-cabinets', src: 'atm-kitchen-shaker-cabinets-16x9-nano-v1.png', x45: 1150, retouch: [[2331, 1078, 2385, 1133]] },
];
for (const a of atmosphere) {
  const o16 = `public/images/atmosphere/${a.name}-16x9.jpg`, o45 = `public/images/atmosphere/${a.name}-4x5.jpg`;
  if (!want(o16) && !want(o45)) continue;
  const img = await load(a.src);
  (a.retouch || []).forEach((r, i) => inpaint(img, r, 20 + i));
  await write(img, o16, { ...A16, extract: a.ext16 });
  const w45 = Math.round(img.h * 0.8);
  await write(img, o45, { ...A45, extract: { left: a.x45, top: 0, width: Math.min(w45, img.w - a.x45), height: img.h } });
}

// ---------- 3) basement "What we build" tiles, 1200x1500 ----------
const tiles = [
  // TV bezel mark sits on the tilted bottom edge: clone clean bezel from 26px left, 3px lower
  { name: 'rec-room', src: 'tile-rec-room-nano-v2-clean.png', clone: [[[520, 1224, 546, 1242], -26, 3]] },
  { name: 'home-office', src: 'tile-home-office-nano-v2-clean.png', retouch: [[436, 1368, 478, 1387]] }, // laptop lid logo
  { name: 'guest-suite', src: 'tile-guest-suite-nano-v3-clean.png' },
  { name: 'gym-media-room', src: 'tile-gym-media-room-nano-v2-clean.png', retouch: [[1752, 1303, 1781, 1315]] }, // TV bezel logo
  { name: 'bathroom-wet-bar', src: 'tile-bathroom-wet-bar-nano-v2-clean.png' },
  { name: 'basement-refresh', src: 'tile-basement-refresh-nano-v2-clean.png' },
];
for (const t of tiles) {
  const out = `public/images/basement-tiles/${t.name}.jpg`;
  if (!want(out)) continue;
  const img = await load(t.src);
  (t.retouch || []).forEach((r, i) => inpaint(img, r, 40 + i));
  (t.clone || []).forEach(([r, dx, dy]) => clone(img, r, dx, dy));
  await write(img, out, { width: 1200, height: 1500 });
}

// ---------- 4) demo samples, 1600x1200 (after = edit of before, identical crop) ----------
const S = { width: 1600, height: 1200 };
const pairs = [
  ['drywall-hole-repair', 'sample-drywall-hole-repair-before-nano-v1.png', 'sample-drywall-hole-repair-after-nano-v1.png'],
  ['water-damaged-ceiling', 'sample-water-damaged-ceiling-before-nano-v1.png', 'sample-water-damaged-ceiling-after-nano-v1.png'],
  ['popcorn-ceiling', 'sample-popcorn-ceiling-before-nano-v1.png', 'sample-popcorn-ceiling-after-nano-v1.png'],
  ['basement-finish', 'sample-basement-finish-before-nano-v1.png', 'sample-basement-finish-after-nano-v2-duct.png'],
];
for (const [name, b, a] of pairs) {
  const ob = `public/images/samples/${name}-before.jpg`, oa = `public/images/samples/${name}-after.jpg`;
  if (!want(ob) && !want(oa)) continue;
  await write(await load(b), ob, S);
  await write(await load(a), oa, S);
}
const singles = [
  ['level-5-hallway', 'sample-level-5-hallway-nano-v1.png'],
  ['basement-drywall-taping', 'sample-basement-drywall-taping-nano-v2-clean.png'],
];
for (const [name, src] of singles) {
  const out = `public/images/samples/${name}.jpg`;
  if (!want(out)) continue;
  await write(await load(src), out, S);
}
