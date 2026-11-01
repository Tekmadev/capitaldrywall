// Review helper for the basement transformation stills.
// Builds a gridded contact sheet of stage stills plus 50/50 onion-skin blends
// of each image against the first one, so camera / window drift is easy to see.
//
// usage: node scripts/assets/basement-review.mjs <outPrefix> <img1> <img2> [img3 ...]
import sharp from "sharp";
import path from "node:path";
import fs from "node:fs/promises";

const [outPrefix, ...inputs] = process.argv.slice(2);
if (!outPrefix || inputs.length < 2) {
  console.error("usage: basement-review.mjs <outPrefix> <img1> <img2> [...]");
  process.exit(1);
}

const meta = await sharp(inputs[0]).metadata();
const landscape = meta.width >= meta.height;
const W = landscape ? 960 : 540;
const H = landscape ? 540 : 960;

const grid = Buffer.from(
  `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
    <g stroke="#00e5ff" stroke-width="1" opacity="0.75">
      ${[1, 2, 3, 4, 5].map((i) => `<line x1="${(W * i) / 6}" y1="0" x2="${(W * i) / 6}" y2="${H}"/>`).join("")}
      ${[1, 2, 3, 4, 5].map((i) => `<line x1="0" y1="${(H * i) / 6}" x2="${W}" y2="${(H * i) / 6}"/>`).join("")}
    </g>
  </svg>`
);

const tiles = await Promise.all(
  inputs.map((f) =>
    sharp(f)
      .resize(W, H, { fit: "cover", position: "centre" })
      .composite([{ input: grid }])
      .png()
      .toBuffer()
  )
);

const cols = landscape ? 2 : inputs.length;
const rows = Math.ceil(inputs.length / cols);
const gap = 8;
const sheet = sharp({
  create: {
    width: cols * W + (cols - 1) * gap,
    height: rows * H + (rows - 1) * gap,
    channels: 3,
    background: "#111111",
  },
}).composite(
  tiles.map((t, i) => ({
    input: t,
    left: (i % cols) * (W + gap),
    top: Math.floor(i / cols) * (H + gap),
  }))
);
await fs.mkdir(path.dirname(outPrefix), { recursive: true });
await sheet.png().toFile(`${outPrefix}-sheet.png`);

// Onion skins: every later image blended 50/50 over the first.
const base = await sharp(inputs[0]).resize(W * 2, H * 2, { fit: "cover" }).png().toBuffer();
for (let i = 1; i < inputs.length; i++) {
  const over = await sharp(inputs[i])
    .resize(W * 2, H * 2, { fit: "cover" })
    .ensureAlpha(0.5)
    .png()
    .toBuffer();
  await sharp(base)
    .composite([{ input: over, blend: "over" }])
    .png()
    .toFile(`${outPrefix}-onion-1-${i + 1}.png`);
}
console.log("wrote", `${outPrefix}-sheet.png`, "and", inputs.length - 1, "onion skins");
