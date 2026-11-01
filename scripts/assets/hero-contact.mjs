// Hero group: build a side-by-side contact sheet of stage stills or frames for visual QA.
// Usage: node scripts/assets/hero-contact.mjs <out.jpg> <tileWidth> <cols> <img1> <img2> ...
import sharp from "sharp";

const [, , out, tileWidthArg, colsArg, ...inputs] = process.argv;
if (!out || !inputs.length) {
  console.error("usage: hero-contact.mjs <out.jpg> <tileWidth> <cols> <images...>");
  process.exit(1);
}
const tileW = Number(tileWidthArg) || 640;
const cols = Number(colsArg) || inputs.length;
const gap = 6;

const tiles = await Promise.all(
  inputs.map(async (p) => {
    const buf = await sharp(p).resize({ width: tileW }).jpeg({ quality: 88 }).toBuffer();
    const meta = await sharp(buf).metadata();
    return { buf, w: meta.width, h: meta.height };
  }),
);
const tileH = Math.max(...tiles.map((t) => t.h));
const rows = Math.ceil(tiles.length / cols);
const width = cols * tileW + (cols - 1) * gap;
const height = rows * tileH + (rows - 1) * gap;

await sharp({ create: { width, height, channels: 3, background: { r: 255, g: 255, b: 255 } } })
  .composite(
    tiles.map((t, i) => ({
      input: t.buf,
      left: (i % cols) * (tileW + gap),
      top: Math.floor(i / cols) * (tileH + gap),
    })),
  )
  .jpeg({ quality: 86 })
  .toFile(out);
console.log(`wrote ${out} (${width}x${height})`);
