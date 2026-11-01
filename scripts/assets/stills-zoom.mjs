// stills group: crop zoomed regions for inspection. Coordinates are given in a 1000px-wide preview space.
// Usage: node scripts/assets/stills-zoom.mjs <file> <outName> x,y,w,h [previewWidth=1000] [outWidth=900]
import sharp from 'sharp';
import path from 'node:path';
const [file, outName, box, pw = '1000', ow = '900'] = process.argv.slice(2);
const meta = await sharp(file).metadata();
const s = meta.width / Number(pw);
const [x, y, w, h] = box.split(',').map(Number);
const left = Math.max(0, Math.round(x * s)), top = Math.max(0, Math.round(y * s));
const width = Math.min(meta.width - left, Math.round(w * s)), height = Math.min(meta.height - top, Math.round(h * s));
const out = path.resolve('assets-src/stills/work/preview', `zoom-${outName}.jpg`);
await sharp(file).extract({ left, top, width, height }).resize({ width: Number(ow) }).jpeg({ quality: 88 }).toFile(out);
console.log(out);
