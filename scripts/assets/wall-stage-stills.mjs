// Wall-stage stills for the drywall page (brief 8.1 stage stills, re-exported as plain images).
//
// For every hero stage the scroll sequence was built from, picks the raw still variant that the
// sequence actually used (best SSIM against the sequence frame at the manifest stage index) and exports:
//   public/images/atmosphere/wall-stage-{1..5}-16x9.jpg   1920x1080, cover/centre, mozjpeg q82
//   public/images/atmosphere/wall-stage-{1,3,5}-4x5.jpg   1200x1500, centre 4:5 crop of the 9:16 still, mozjpeg q82
//
// usage: node scripts/assets/wall-stage-stills.mjs
import sharp from "sharp";
import fs from "node:fs/promises";
import path from "node:path";

const RAW = "assets-src/hero/raw";
const OUT = "public/images/atmosphere";

const SETS = [
  {
    ratio: "desktop",
    seq: "public/sequences/hero-desktop",
    stages: [1, 2, 3, 4, 5],
    out: (k) => `${OUT}/wall-stage-${k}-16x9.jpg`,
    size: [1920, 1080],
    crop: null, // cover/centre straight to 16:9
  },
  {
    ratio: "mobile",
    seq: "public/sequences/hero-mobile",
    stages: [1, 3, 5],
    out: (k) => `${OUT}/wall-stage-${k}-4x5.jpg`,
    size: [1200, 1500],
    crop: 4 / 5, // centre-crop the 9:16 still to 4:5 first
  },
];

// Greyscale SSIM on 8x8 blocks of a small cover-resized copy (same framing as the sequence frame).
const CMP_W = 288;
async function grey(input, w, h) {
  return sharp(input)
    .resize(w, h, { fit: "cover", position: "centre" })
    .greyscale()
    .raw()
    .toBuffer();
}
function ssim(a, b, w, h) {
  const C1 = (0.01 * 255) ** 2;
  const C2 = (0.03 * 255) ** 2;
  let sum = 0;
  let n = 0;
  for (let y = 0; y + 8 <= h; y += 4) {
    for (let x = 0; x + 8 <= w; x += 4) {
      let ma = 0, mb = 0;
      for (let j = 0; j < 8; j++) for (let i = 0; i < 8; i++) {
        ma += a[(y + j) * w + x + i];
        mb += b[(y + j) * w + x + i];
      }
      ma /= 64;
      mb /= 64;
      let va = 0, vb = 0, cov = 0;
      for (let j = 0; j < 8; j++) for (let i = 0; i < 8; i++) {
        const da = a[(y + j) * w + x + i] - ma;
        const db = b[(y + j) * w + x + i] - mb;
        va += da * da;
        vb += db * db;
        cov += da * db;
      }
      va /= 63;
      vb /= 63;
      cov /= 63;
      sum += ((2 * ma * mb + C1) * (2 * cov + C2)) / ((ma * ma + mb * mb + C1) * (va + vb + C2));
      n++;
    }
  }
  return sum / n;
}

const files = await fs.readdir(RAW);
const report = [];
for (const set of SETS) {
  const manifest = JSON.parse(await fs.readFile(path.join(set.seq, "manifest.json"), "utf8"));
  const [W, H] = [manifest.width, manifest.height];
  const cmpH = Math.round((CMP_W * H) / W);
  for (const k of set.stages) {
    const frameIdx = manifest.stages[k - 1];
    const frameFile = path.join(set.seq, `${String(frameIdx + 1).padStart(manifest.pad, "0")}.${manifest.ext}`);
    const ref = await grey(frameFile, CMP_W, cmpH);
    const candidates = files.filter((f) => f.startsWith(`s${k}-${set.ratio}-`) && f.endsWith(".png")).sort();
    const scored = [];
    for (const c of candidates) {
      scored.push({ file: c, ssim: Number(ssim(ref, await grey(path.join(RAW, c), CMP_W, cmpH), CMP_W, cmpH).toFixed(4)) });
    }
    scored.sort((a, b) => b.ssim - a.ssim);
    const best = scored[0];
    const src = path.join(RAW, best.file);

    let pipeline = sharp(src);
    if (set.crop) {
      const { width: w, height: h } = await sharp(src).metadata();
      let cw = w;
      let ch = Math.round(w / set.crop);
      if (ch > h) {
        ch = h;
        cw = Math.round(h * set.crop);
      }
      pipeline = pipeline.extract({ left: Math.round((w - cw) / 2), top: Math.round((h - ch) / 2), width: cw, height: ch });
    }
    const out = set.out(k);
    const info = await pipeline
      .resize(set.size[0], set.size[1], { fit: "cover", position: "centre", kernel: "lanczos3" })
      .jpeg({ quality: 82, mozjpeg: true })
      .toFile(out);
    report.push({ out, source: `${RAW}/${best.file}`, matchedFrame: frameFile, scores: scored, w: info.width, h: info.height, bytes: info.size });
  }
}
console.log(JSON.stringify(report, null, 2));
