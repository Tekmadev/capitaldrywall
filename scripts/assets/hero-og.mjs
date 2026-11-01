// Hero group: crop the generated 16:9 OG base to exactly 1200x630 and keep it under the size budget.
//
// Usage: node scripts/assets/hero-og.mjs <src.png> <out.jpg> [quality=84] [maxBytes=256000]
// The crop keeps the full width (16:9 -> 1.905:1 only trims a little height), centred vertically, so the
// calm dark left half reserved for the title is preserved. If the file is over budget the quality steps
// down until it fits.
import { stat } from "node:fs/promises";
import sharp from "sharp";

const [, , src, out, q = "84", max = "256000"] = process.argv;
if (!src || !out) {
  console.error("usage: hero-og.mjs <src.png> <out.jpg> [quality] [maxBytes]");
  process.exit(1);
}
let quality = Number(q);
const maxBytes = Number(max);

for (;;) {
  await sharp(src)
    .resize(1200, 630, { fit: "cover", position: "centre" })
    .jpeg({ quality, mozjpeg: true })
    .toFile(out);
  const bytes = (await stat(out)).size;
  const m = await sharp(out).metadata();
  console.log(`${out} ${m.width}x${m.height} q=${quality} ${bytes} bytes`);
  if (bytes <= maxBytes || quality <= 60) break;
  quality -= 4;
}
