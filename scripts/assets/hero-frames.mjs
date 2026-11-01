// Hero group: concatenate keyframe-interpolation clips and extract an evenly spaced PNG frame set.
//
// Usage:
//   node scripts/assets/hero-frames.mjs --out assets-src/hero/hero-desktop.mp4 \
//     --frames-dir assets-src/hero/frames-desktop --width 1920 --height 1080 --count 150 \
//     clip1.mp4 clip2.mp4 clip3.mp4 clip4.mp4
//
// 1. Probes every clip. Clips 2..n start on the same keyframe still that ended the previous clip, so
//    their first frame is compared (SSIM) with the previous clip's last frame and dropped when it repeats.
// 2. Re-encodes the trimmed clips into one high-quality H.264 master (no audio) at the clips' native size.
// 3. Picks `count` evenly spaced frames from the master, always including the very first and very last
//    frame (stage 1 and stage 5), and writes them as 0001.png... at exactly width x height (cover crop).
// 4. Prints JSON with the stage boundary positions (fractions of the master timeline) for the encoder.
import { spawnSync } from "node:child_process";
import { mkdirSync, rmSync, mkdtempSync } from "node:fs";
import path from "node:path";
import os from "node:os";

const FFMPEG = "/opt/homebrew/bin/ffmpeg";
const FFPROBE = "/opt/homebrew/bin/ffprobe";

const args = process.argv.slice(2);
function opt(name, fallback) {
  const i = args.indexOf(`--${name}`);
  if (i === -1) return fallback;
  const v = args[i + 1];
  args.splice(i, 2);
  return v;
}
const out = opt("out");
const framesDir = opt("frames-dir");
const W = Number(opt("width"));
const H = Number(opt("height"));
const count = Number(opt("count"));
const ssimThreshold = Number(opt("ssim", "0.97"));
const clips = args;
if (!out || !framesDir || !W || !H || !count || clips.length < 1) {
  console.error("usage: hero-frames.mjs --out <mp4> --frames-dir <dir> --width W --height H --count N clips...");
  process.exit(1);
}

function run(bin, a) {
  const r = spawnSync(bin, a, { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
  if (r.status !== 0) throw new Error(`${path.basename(bin)} failed: ${r.stderr}`);
  return r;
}

function probe(file) {
  const r = run(FFPROBE, [
    "-v", "error", "-select_streams", "v:0", "-count_frames",
    "-show_entries", "stream=width,height,r_frame_rate,nb_read_frames",
    "-of", "json", file,
  ]);
  const s = JSON.parse(r.stdout).streams[0];
  const [num, den] = s.r_frame_rate.split("/").map(Number);
  return { width: s.width, height: s.height, rate: s.r_frame_rate, fps: num / den, frames: Number(s.nb_read_frames) };
}

const tmp = mkdtempSync(path.join(os.tmpdir(), "hero-frames-"));
function grab(file, index, dst) {
  run(FFMPEG, ["-v", "error", "-y", "-i", file, "-vf", `select=eq(n\\,${index})`, "-fps_mode", "vfr", "-frames:v", "1", dst]);
}
function ssim(a, b) {
  const r = run(FFMPEG, ["-hide_banner", "-i", a, "-i", b, "-lavfi", "ssim", "-f", "null", "-"]);
  const m = /All:([0-9.]+)/.exec(r.stderr);
  return m ? Number(m[1]) : 0;
}

const info = clips.map((file) => ({ file, ...probe(file) }));
for (const c of info) {
  console.error(`${c.file}: ${c.width}x${c.height} @ ${c.rate} (${c.fps.toFixed(3)} fps), ${c.frames} frames`);
}
const rate = info[0].rate;
const srcW = info[0].width;
const srcH = info[0].height;

// Duplicate-boundary check.
const trimStart = info.map(() => 0);
const boundaries = [];
for (let k = 1; k < info.length; k++) {
  const a = path.join(tmp, `b${k}-last.png`);
  const b = path.join(tmp, `b${k}-first.png`);
  grab(info[k - 1].file, info[k - 1].frames - 1, a);
  grab(info[k].file, 0, b);
  const score = info[k - 1].width === info[k].width && info[k - 1].height === info[k].height ? ssim(a, b) : 0;
  if (score >= ssimThreshold) trimStart[k] = 1;
  boundaries.push({ boundary: k, ssim: Number(score.toFixed(4)), droppedFirstFrame: Boolean(trimStart[k]) });
  console.error(`boundary ${k}: SSIM(last of clip ${k}, first of clip ${k + 1}) = ${score.toFixed(4)} -> ${trimStart[k] ? "drop duplicate" : "keep"}`);
}

// Build the master: trim, normalise size/fps/pixel format, concatenate, encode without audio.
const inputs = info.flatMap((c) => ["-i", c.file]);
const chains = info.map(
  (c, k) =>
    `[${k}:v]trim=start_frame=${trimStart[k]},setpts=PTS-STARTPTS,` +
    `scale=${srcW}:${srcH}:force_original_aspect_ratio=increase,crop=${srcW}:${srcH},fps=${rate},format=yuv420p,setsar=1[v${k}]`,
);
const filter = `${chains.join(";")};${info.map((_, k) => `[v${k}]`).join("")}concat=n=${info.length}:v=1:a=0[outv]`;
run(FFMPEG, [
  "-v", "error", "-y", ...inputs,
  "-filter_complex", filter, "-map", "[outv]", "-an",
  "-c:v", "libx264", "-preset", "slow", "-crf", "12", "-profile:v", "high", "-pix_fmt", "yuv420p",
  "-movflags", "+faststart", out,
]);
const master = probe(out);
console.error(`master ${out}: ${master.width}x${master.height} @ ${master.rate}, ${master.frames} frames`);

// Stage boundaries (in master frame indices): start of each clip after trimming, plus the last frame.
const lengths = info.map((c, k) => c.frames - trimStart[k]);
const stageFrames = [0];
let acc = 0;
for (let k = 0; k < lengths.length; k++) {
  acc += lengths[k];
  stageFrames.push(acc - 1); // last frame of clip k == keyframe of stage k+2
}
const N = master.frames;
const stageTimes = stageFrames.map((f) => Number((f / (N - 1)).toFixed(6)));

// Evenly spaced selection including first and last.
const picks = [];
for (let i = 0; i < count; i++) picks.push(Math.round((i * (N - 1)) / (count - 1)));
const expr = [...new Set(picks)].map((n) => `eq(n\\,${n})`).join("+");
rmSync(framesDir, { recursive: true, force: true });
mkdirSync(framesDir, { recursive: true });
run(FFMPEG, [
  "-v", "error", "-y", "-i", out,
  "-vf", `select='${expr}',scale=${W}:${H}:force_original_aspect_ratio=increase:flags=lanczos,crop=${W}:${H},setsar=1`,
  "-fps_mode", "vfr", "-start_number", "1", path.join(framesDir, "%04d.png"),
]);
rmSync(tmp, { recursive: true, force: true });

console.log(
  JSON.stringify({
    master: out,
    masterFrames: N,
    rate: master.rate,
    clipFrames: info.map((c) => c.frames),
    boundaries,
    stageFrames,
    stageTimes,
    extracted: picks.length,
    framesDir,
  }),
);
