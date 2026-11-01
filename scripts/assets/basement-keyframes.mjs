// Builds, from the retouched high-quality B1..B4 stills:
//  1. video keyframes for the start/end-frame clips (exact aspect, centred
//     progressive crop so the "slow push-in" is physically consistent and
//     continuous across the three clips), and
//  2. the reduced-motion / poster stage stills in public/images/basement,
//     cropped identically so they line up with the sequence stage frames.
//
// usage: node scripts/assets/basement-keyframes.mjs
import sharp from "sharp";
import fs from "node:fs/promises";

const SRC = "assets-src/basement/keyframes";
const PUB = "public/images/basement";
// Push-in per stage (B1..B4). Stage k is centre-cropped by 1/ZOOM[k].
export const ZOOM = [1.0, 1.05, 1.1, 1.15];

const SETS = [
  { tag: "16x9", aspect: 16 / 9, video: [2560, 1440], still: [1920, 1080], name: "desktop" },
  { tag: "9x16", aspect: 9 / 16, video: [1440, 2560], still: [900, 1600], name: "mobile" },
];

async function cropFor(file, aspect, zoom) {
  const { width: W, height: H } = await sharp(file).metadata();
  // largest centred rect of the target aspect
  let bw = W;
  let bh = Math.round(W / aspect);
  if (bh > H) {
    bh = H;
    bw = Math.round(H * aspect);
  }
  const cw = Math.round(bw / zoom);
  const ch = Math.round(cw / aspect);
  return {
    left: Math.round((W - cw) / 2),
    top: Math.round((H - ch) / 2),
    width: cw,
    height: ch,
  };
}

await fs.mkdir(PUB, { recursive: true });
const report = [];
for (const set of SETS) {
  for (let k = 1; k <= 4; k++) {
    const file = `${SRC}/b${k}-${set.tag}-retouched.png`;
    const rect = await cropFor(file, set.aspect, ZOOM[k - 1]);

    const vk = `${SRC}/vk-${set.tag}-b${k}.jpg`;
    await sharp(file)
      .extract(rect)
      .resize(set.video[0], set.video[1], { fit: "cover", position: "centre", kernel: "lanczos3" })
      .jpeg({ quality: 95, chromaSubsampling: "4:4:4", mozjpeg: true })
      .toFile(vk);

    const still = `${PUB}/basement-stage-${k}-${set.name}.jpg`;
    const info = await sharp(file)
      .extract(rect)
      .resize(set.still[0], set.still[1], { fit: "cover", position: "centre", kernel: "lanczos3" })
      .jpeg({ quality: 82, mozjpeg: true })
      .toFile(still);
    report.push({ still, crop: rect, zoom: ZOOM[k - 1], w: info.width, h: info.height, bytes: info.size, vk });
  }
}
console.log(JSON.stringify(report, null, 2));
