// Bathroom + kitchen transformation keyframes (same method as basement-keyframes.mjs):
//  1. deterministic retouch of stray pseudo-text (appliance displays, board print) on the kept raw stills,
//  2. video keyframes for the start/end clips (exact aspect, progressive centred push-in),
//  3. reduced-motion / poster stage stills in public/images/<room>/, cropped identically.
//
// usage: node scripts/assets/rooms-keyframes.mjs [bath|kitch] [16x9|9x16]
import sharp from "sharp";
import fs from "node:fs/promises";

const RAW = "assets-src/rooms/raw";
const KF = "assets-src/rooms/keyframes";
export const ZOOM = [1.0, 1.05, 1.1, 1.15];
/**
 * Video keyframes stay unzoomed (the clips hold a locked-off camera); the slow push-in is applied in
 * post across the whole extracted sequence (rooms-frames.mjs), so stage k lands on ZOOM[k] exactly
 * like these stills.
 */
const VK_ZOOM = [1, 1, 1, 1];
const ROOMS = { bath: "bathroom", kitch: "kitchen" };
const SETS = {
  "16x9": { aspect: 16 / 9, video: [2560, 1440], still: [1920, 1080], name: "desktop" },
  "9x16": { aspect: 9 / 16, video: [1440, 2560], still: [900, 1600], name: "mobile" },
};
/**
 * Kept raw still per room, stage and ratio (file stem in assets-src/rooms/raw). kitch-s4b-* are the
 * dishwasher-panel fixes; bath-s4c-9x16 is bath-s4-9x16 with the open door edge of bath-s3-9x16
 * composited back along the left edge (140 px strip, 22 px feather), keeping the doorway consistent.
 */
const SOURCES = {
  bath: { "16x9": ["bath-s1-16x9", "bath-s2-16x9", "bath-s3-16x9", "bath-s4-16x9"], "9x16": ["bath-s1-9x16", "bath-s2-9x16", "bath-s3-9x16", "bath-s4c-9x16"] },
  kitch: { "16x9": ["kitch-s1-16x9", "kitch-s2-16x9", "kitch-s3-16x9", "kitch-s4b-16x9"], "9x16": ["kitch-s1-9x16", "kitch-s2-9x16", "kitch-s3-9x16", "kitch-s4b-9x16"] },
};
/** Retouch rects in raw-still pixels: [left, top, width, height] (median filter over the rect). */
const RETOUCH = {
  "kitch-s1-16x9": [[930, 940, 80, 55], [1170, 760, 55, 40], [1010, 866, 44, 30], [1162, 860, 46, 24]], // range display digits; coffee-maker display; knife-block print; coffee-maker base badge
  "kitch-s4b-16x9": [[912, 930, 136, 62], [960, 1242, 38, 26]], // range display; oven-door badge
  "kitch-s1-9x16": [[256, 1386, 46, 34], [222, 1600, 48, 40], [153, 1510, 27, 24], [234, 1501, 52, 21]], // coffee-maker display; range display; knife-block print; coffee-maker badge
  "bath-s3-9x16": [[630, 1815, 210, 115], [350, 1940, 160, 145], [550, 2120, 100, 80], [730, 2280, 345, 340]], // cement-board print on the floor
  "bath-s3-16x9": [[1360, 488, 52, 54], [1175, 1172, 142, 76], [1315, 1228, 92, 58], [885, 1312, 192, 186]], // board print
};

async function retouched(stem) {
  let img = sharp(`${RAW}/${stem}.png`);
  const rects = RETOUCH[stem] ?? [];
  if (!rects.length) return img.png().toBuffer();
  const base = await img.png().toBuffer();
  const patches = [];
  for (const [left, top, width, height] of rects) {
    const patch = await sharp(base).extract({ left, top, width, height }).median(15).blur(2).png().toBuffer();
    patches.push({ input: patch, left, top });
  }
  return sharp(base).composite(patches).png().toBuffer();
}

async function cropFor(buf, aspect, zoom) {
  const { width: W, height: H } = await sharp(buf).metadata();
  let bw = W;
  let bh = Math.round(W / aspect);
  if (bh > H) {
    bh = H;
    bw = Math.round(H * aspect);
  }
  const cw = Math.round(bw / zoom);
  const ch = Math.round(cw / aspect);
  return { left: Math.round((W - cw) / 2), top: Math.round((H - ch) / 2), width: cw, height: ch };
}

const [onlyRoom, onlyTag] = process.argv.slice(2);
await fs.mkdir(KF, { recursive: true });
const report = [];
for (const room of Object.keys(ROOMS)) {
  if (onlyRoom && onlyRoom !== room) continue;
  const pub = `public/images/${ROOMS[room]}`;
  await fs.mkdir(pub, { recursive: true });
  for (const [tag, set] of Object.entries(SETS)) {
    if (onlyTag && onlyTag !== tag) continue;
    for (let k = 1; k <= 4; k++) {
      const stem = SOURCES[room][tag][k - 1];
      const buf = await retouched(stem);
      await fs.writeFile(`${KF}/${room}${k}-${tag}-retouched.png`, buf);
      const rect = await cropFor(buf, set.aspect, ZOOM[k - 1]);
      const vkRect = await cropFor(buf, set.aspect, VK_ZOOM[k - 1]);
      const vk = `${KF}/vk-${room}-${tag}-${k}.jpg`;
      await sharp(buf).extract(vkRect).resize(set.video[0], set.video[1], { fit: "cover", kernel: "lanczos3" })
        .jpeg({ quality: 95, chromaSubsampling: "4:4:4", mozjpeg: true }).toFile(vk);
      const still = `${pub}/${ROOMS[room]}-stage-${k}-${set.name}.jpg`;
      const info = await sharp(buf).extract(rect).resize(set.still[0], set.still[1], { fit: "cover", kernel: "lanczos3" })
        .jpeg({ quality: 82, mozjpeg: true }).toFile(still);
      report.push({ still, source: stem, zoom: ZOOM[k - 1], bytes: info.size, vk });
    }
  }
}
console.log(JSON.stringify(report, null, 1));
