// stills group: tile several preview images into one contact sheet for review.
// Usage: node scripts/assets/stills-contact.mjs <out.jpg> <cellWidth> <cols> <img...>
import sharp from 'sharp';
const [out, cw, cols, ...files] = process.argv.slice(2);
const cellW = Number(cw), nCols = Number(cols);
const cells = [];
for (const f of files) {
  const buf = await sharp(f).resize({ width: cellW }).jpeg({ quality: 85 }).toBuffer({ resolveWithObject: true });
  cells.push(buf);
}
const rows = [];
for (let i = 0; i < cells.length; i += nCols) rows.push(cells.slice(i, i + nCols));
const rowHeights = rows.map((r) => Math.max(...r.map((c) => c.info.height)));
const gap = 8;
const W = nCols * cellW + (nCols - 1) * gap;
const H = rowHeights.reduce((a, b) => a + b, 0) + (rows.length - 1) * gap;
const composites = [];
let y = 0;
rows.forEach((r, ri) => {
  r.forEach((c, ci) => composites.push({ input: c.data, left: ci * (cellW + gap), top: y }));
  y += rowHeights[ri] + gap;
});
await sharp({ create: { width: W, height: H, channels: 3, background: '#202020' } }).composite(composites).jpeg({ quality: 85 }).toFile(out);
console.log(out, W, H);
