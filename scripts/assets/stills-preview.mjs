// stills group: make downsized JPEG previews of raw generations for visual review.
// Usage: node scripts/assets/stills-preview.mjs <file...>   (writes to assets-src/stills/work/preview/)
import sharp from 'sharp';
import path from 'node:path';
import fs from 'node:fs';

const outDir = path.resolve('assets-src/stills/work/preview');
fs.mkdirSync(outDir, { recursive: true });

const width = Number(process.env.PREVIEW_W || 1400);
for (const f of process.argv.slice(2)) {
  const base = path.basename(f).replace(/\.[^.]+$/, '');
  const out = path.join(outDir, `${base}.jpg`);
  await sharp(f).resize({ width, withoutEnlargement: true }).jpeg({ quality: 85, mozjpeg: true }).toFile(out);
  console.log(out);
}
