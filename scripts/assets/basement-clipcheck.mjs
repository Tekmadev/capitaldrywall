// Review helper for one interpolation clip:
//  - prints resolution / fps / frame count,
//  - SSIM of the clip's first frame vs the start keyframe and last frame vs the
//    end keyframe (checks start/end roles were honoured and boundary continuity),
//  - writes an 8-frame contact strip for visual review.
//
// usage: node scripts/assets/basement-clipcheck.mjs <clip.mp4> <startKey.jpg> <endKey.jpg> <outPrefix>
import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";

const FFMPEG = "/opt/homebrew/bin/ffmpeg";
const FFPROBE = "/opt/homebrew/bin/ffprobe";
const [clip, startKey, endKey, outPrefix] = process.argv.slice(2);
const run = (bin, args) => execFileSync(bin, args, { encoding: "utf8", maxBuffer: 1 << 26, stdio: ["ignore", "pipe", "pipe"] });

const meta = JSON.parse(
  run(FFPROBE, ["-v", "error", "-select_streams", "v:0", "-count_frames",
    "-show_entries", "stream=width,height,r_frame_rate,nb_read_frames,codec_name", "-of", "json", clip])
).streams[0];
const n = Number(meta.nb_read_frames);
await fs.mkdir(path.dirname(outPrefix), { recursive: true });

const first = `${outPrefix}-first.png`;
const lastF = `${outPrefix}-last.png`;
run(FFMPEG, ["-v", "error", "-y", "-i", clip, "-vf", "select=eq(n\\,0)", "-frames:v", "1", first]);
run(FFMPEG, ["-v", "error", "-y", "-i", clip, "-vf", `select=eq(n\\,${n - 1})`, "-frames:v", "1", lastF]);

function ssim(a, b) {
  const W = meta.width;
  const H = meta.height;
  // ffmpeg prints the SSIM summary on stderr
  const r = spawnSync(FFMPEG, ["-v", "info", "-i", a, "-i", b, "-lavfi",
    `[0:v]scale=${W}:${H}[x];[1:v]scale=${W}:${H}[y];[x][y]ssim`, "-f", "null", "-"],
    { encoding: "utf8" });
  return r.stderr;
}
let s1;
let s2;
try {
  s1 = ssim(first, startKey);
} catch (e) {
  s1 = e.stderr;
}
try {
  s2 = ssim(lastF, endKey);
} catch (e) {
  s2 = e.stderr;
}
const pick = (s) => (String(s).match(/All:([0-9.]+)/) || [])[1];

// 8 evenly spaced frames, tiled 4x2
const idx = Array.from({ length: 8 }, (_, i) => Math.round((i * (n - 1)) / 7));
const sel = idx.map((k) => `eq(n\\,${k})`).join("+");
const portrait = meta.height > meta.width;
const tileW = portrait ? 270 : 480;
run(FFMPEG, ["-v", "error", "-y", "-i", clip, "-vf",
  `select='${sel}',scale=${tileW}:-2,tile=${portrait ? "8x1" : "4x2"}:padding=4`, "-frames:v", "1", `${outPrefix}-strip.png`]);

console.log(JSON.stringify({
  clip, codec: meta.codec_name, width: meta.width, height: meta.height, fps: meta.r_frame_rate, frames: n,
  ssimFirstVsStart: pick(s1), ssimLastVsEnd: pick(s2), stripFrames: idx,
}, null, 2));
