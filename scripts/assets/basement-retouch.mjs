// Tiny retouch for generated basement stills: removes stray letter-like marks
// (e.g. pencil scribbles on drywall) without regenerating the still.
//
// Two patch modes, both blended through a smooth feathered mask:
//   - "median": the target area is median-filtered in place (thin strokes vanish,
//     tone gradient is kept). Fields: x, y, w, h, size, feather.
//   - "clone":  a clean area offset by dx/dy is copied over the target.
//     Fields: x, y, w, h, dx, dy, feather.
//
// usage: node scripts/assets/basement-retouch.mjs <in> <out> '<json patches>'
import sharp from "sharp";

const [input, output, patchJson] = process.argv.slice(2);
const patches = JSON.parse(patchJson);

function featherMask(w, h, f) {
  const m = Buffer.alloc(w * h);
  const smooth = (t) => (t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t));
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const d = Math.min(x, y, w - 1 - x, h - 1 - y);
      m[y * w + x] = Math.round(255 * smooth(d / f));
    }
  }
  return m;
}

const composites = [];
for (const p of patches) {
  const f = p.feather ?? 10;
  let region;
  if (p.mode === "hrank") {
    // Row-wise rank filter inside the patch only (no bleeding past its edges):
    // a low percentile over a horizontal window erases light glyph strokes on
    // dark horizontal surfaces (book spines) and keeps horizontal edges intact.
    const n = p.size ?? 21;
    const q = p.q ?? 0.25;
    const raw = await sharp(input)
      .extract({ left: p.x, top: p.y, width: p.w, height: p.h })
      .removeAlpha()
      .raw()
      .toBuffer();
    const out = Buffer.alloc(raw.length);
    const half = (n - 1) / 2;
    const vertical = p.dir === "v"; // column-wise for vertical structures (pipes)
    for (let y = 0; y < p.h; y++) {
      for (let x = 0; x < p.w; x++) {
        const pos = vertical ? y : x;
        const len = vertical ? p.h : p.w;
        const a = Math.max(0, pos - half);
        const b = Math.min(len - 1, pos + half);
        for (let c = 0; c < 3; c++) {
          const vals = [];
          for (let k = a; k <= b; k++) {
            const idx = vertical ? (k * p.w + x) * 3 + c : (y * p.w + k) * 3 + c;
            vals.push(raw[idx]);
          }
          vals.sort((u, v) => u - v);
          out[(y * p.w + x) * 3 + c] = vals[Math.floor(q * (vals.length - 1))];
        }
      }
    }
    region = out;
  } else if (p.mode === "hblur") {
    // Horizontal-only box blur: removes glyphs on horizontal structures
    // (book spines, page edges) while keeping their top/bottom edges crisp.
    const n = p.size ?? 31;
    const meta = await sharp(input).metadata();
    const left = Math.max(0, p.x - n);
    const width = Math.min(meta.width - left, p.w + 2 * n);
    const kernel = new Array(n * 3).fill(0);
    for (let i = 0; i < n; i++) kernel[n + i] = 1;
    const blurred = await sharp(input)
      .extract({ left, top: p.y, width, height: p.h })
      .removeAlpha()
      .convolve({ width: n, height: 3, kernel })
      .png()
      .toBuffer();
    region = await sharp(blurred)
      .extract({ left: p.x - left, top: 0, width: p.w, height: p.h })
      .raw()
      .toBuffer();
  } else if ((p.mode ?? "median") === "median") {
    // Pad the extract so the median has real context at the edges.
    const pad = p.size ?? 9;
    const meta = await sharp(input).metadata();
    const left = Math.max(0, p.x - pad);
    const top = Math.max(0, p.y - pad);
    const width = Math.min(meta.width - left, p.w + 2 * pad);
    const height = Math.min(meta.height - top, p.h + 2 * pad);
    const filtered = await sharp(input)
      .extract({ left, top, width, height })
      .removeAlpha()
      .median(p.size ?? 9)
      .median(p.size ?? 9)
      .png()
      .toBuffer();
    region = await sharp(filtered)
      .extract({ left: p.x - left, top: p.y - top, width: p.w, height: p.h })
      .raw()
      .toBuffer();
  } else {
    region = await sharp(input)
      .extract({ left: p.x + p.dx, top: p.y + p.dy, width: p.w, height: p.h })
      .removeAlpha()
      .raw()
      .toBuffer();
  }
  const rgba = await sharp(region, { raw: { width: p.w, height: p.h, channels: 3 } })
    .joinChannel(featherMask(p.w, p.h, f), { raw: { width: p.w, height: p.h, channels: 1 } })
    .png()
    .toBuffer();
  composites.push({ input: rgba, left: p.x, top: p.y });
}
await sharp(input).composite(composites).png().toFile(output);
console.log("retouched", input, "->", output, `(${patches.length} patch)`);
