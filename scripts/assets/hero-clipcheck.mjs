// Hero group: QA a generated clip. Prints size/fps/frame count, consecutive-frame SSIM (min, mean, worst
// frames: low values reveal jumps or jitter) and writes a 4x3 tile of evenly spaced frames for viewing.
// Usage: node scripts/assets/hero-clipcheck.mjs <clip.mp4> <tile-out.jpg>
import { spawnSync } from "node:child_process";
import { readFileSync, mkdtempSync, rmSync } from "node:fs";
import path from "node:path";
import os from "node:os";

const FFMPEG = "/opt/homebrew/bin/ffmpeg";
const FFPROBE = "/opt/homebrew/bin/ffprobe";
const [, , clip, tile] = process.argv;
const run = (bin, a) => {
  const r = spawnSync(bin, a, { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
  if (r.status !== 0) throw new Error(r.stderr);
  return r;
};
const p = JSON.parse(
  run(FFPROBE, ["-v", "error", "-count_frames", "-show_entries", "stream=codec_type,width,height,r_frame_rate,nb_read_frames", "-of", "json", clip]).stdout,
);
const v = p.streams.find((s) => s.codec_type === "video");
const hasAudio = p.streams.some((s) => s.codec_type === "audio");
const n = Number(v.nb_read_frames);
const tmp = mkdtempSync(path.join(os.tmpdir(), "clipcheck-"));
const stats = path.join(tmp, "ssim.txt");
run(FFMPEG, [
  "-v", "error", "-i", clip,
  "-vf", `scale=640:-2,split[a][b];[b]trim=start_frame=1,setpts=PTS-STARTPTS[b1];[a][b1]ssim=stats_file=${stats}`,
  "-f", "null", "-",
]);
const vals = readFileSync(stats, "utf8")
  .trim()
  .split("\n")
  .map((l, i) => ({ i, v: Number((/All:([0-9.]+)/.exec(l) || [0, 0])[1]) }));
const sorted = [...vals].sort((a, b) => a.v - b.v);
const mean = vals.reduce((s, x) => s + x.v, 0) / vals.length;
const step = Math.max(1, Math.floor((n - 1) / 11));
const sel = Array.from({ length: 12 }, (_, k) => Math.min(n - 1, k * step));
sel[11] = n - 1;
run(FFMPEG, [
  "-v", "error", "-y", "-i", clip,
  "-vf", `select='${sel.map((s) => `eq(n\\,${s})`).join("+")}',scale=640:-2,tile=4x3:padding=4`,
  "-frames:v", "1", "-fps_mode", "vfr", tile,
]);
rmSync(tmp, { recursive: true, force: true });
console.log(
  JSON.stringify({
    clip: path.basename(clip),
    size: `${v.width}x${v.height}`,
    fps: v.r_frame_rate,
    frames: n,
    audio: hasAudio,
    ssimMean: Number(mean.toFixed(5)),
    ssimWorst: sorted.slice(0, 4).map((x) => `${x.i}->${x.i + 1}:${x.v.toFixed(4)}`),
    tileFrames: sel,
  }),
);
