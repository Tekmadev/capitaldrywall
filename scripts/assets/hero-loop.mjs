// Hero group: encode the drywall-page raking-light loop (brief 8.4, last bullet).
//
// Usage: node scripts/assets/hero-loop.mjs <source.mp4>
// Outputs:
//   public/video/drywall-raking-loop.mp4   H.264 High, yuv420p, 1280x720, no audio, faststart, <= 1.5 MB
//   public/video/drywall-raking-loop.webm  VP9, no audio (kept only if smaller than the mp4)
//   public/images/hero/drywall-loop-poster.jpg  first frame, 1280x720, mozjpeg q82
// The clip is generated with the same still as start and end frame, so its last frame repeats the first;
// that duplicate is dropped (when SSIM says it repeats) so the loop does not stutter at the seam.
import { spawnSync } from "node:child_process";
import { statSync, rmSync, mkdtempSync } from "node:fs";
import path from "node:path";
import os from "node:os";
import sharp from "sharp";

const FFMPEG = "/opt/homebrew/bin/ffmpeg";
const FFPROBE = "/opt/homebrew/bin/ffprobe";
const src = process.argv[2];
if (!src) {
  console.error("usage: hero-loop.mjs <source.mp4>");
  process.exit(1);
}
const MP4 = "public/video/drywall-raking-loop.mp4";
const WEBM = "public/video/drywall-raking-loop.webm";
const POSTER = "public/images/hero/drywall-loop-poster.jpg";
const MAX = 1.5 * 1024 * 1024;
const VF = "scale=1280:720:force_original_aspect_ratio=increase:flags=lanczos,crop=1280:720,setsar=1,format=yuv420p";

function run(bin, args) {
  const r = spawnSync(bin, args, { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
  if (r.status !== 0) throw new Error(`${path.basename(bin)} failed: ${r.stderr}`);
  return r;
}
const frames = Number(
  run(FFPROBE, ["-v", "error", "-select_streams", "v:0", "-count_frames", "-show_entries", "stream=nb_read_frames", "-of", "csv=p=0", src]).stdout.trim(),
);

// Does the last frame repeat the first?
const tmp = mkdtempSync(path.join(os.tmpdir(), "hero-loop-"));
const first = path.join(tmp, "first.png");
const last = path.join(tmp, "last.png");
run(FFMPEG, ["-v", "error", "-y", "-i", src, "-vf", "select=eq(n\\,0)", "-fps_mode", "vfr", "-frames:v", "1", first]);
run(FFMPEG, ["-v", "error", "-y", "-i", src, "-vf", `select=eq(n\\,${frames - 1})`, "-fps_mode", "vfr", "-frames:v", "1", last]);
const ssimOut = run(FFMPEG, ["-hide_banner", "-i", first, "-i", last, "-lavfi", "ssim", "-f", "null", "-"]).stderr;
const seamSsim = Number((/All:([0-9.]+)/.exec(ssimOut) || [0, 0])[1]);
const keep = seamSsim >= 0.97 ? frames - 1 : frames;
console.log(`source frames=${frames} seam SSIM(first,last)=${seamSsim.toFixed(4)} -> encode ${keep} frames`);

function encodeMp4(crf) {
  run(FFMPEG, [
    "-v", "error", "-y", "-i", src, "-an", "-vf", `${VF}`, "-frames:v", String(keep),
    "-c:v", "libx264", "-preset", "veryslow", "-crf", String(crf), "-profile:v", "high", "-pix_fmt", "yuv420p",
    "-tune", "film", "-movflags", "+faststart", MP4,
  ]);
  return statSync(MP4).size;
}
let crf = 22;
let mp4Bytes = encodeMp4(crf);
while (mp4Bytes > MAX && crf < 34) {
  crf += 2;
  mp4Bytes = encodeMp4(crf);
}
console.log(`mp4 crf=${crf} bytes=${mp4Bytes}`);

// VP9 WebM: two-pass constrained quality; keep only if smaller than the MP4.
const passlog = path.join(tmp, "vp9");
const vp9 = (pass, out) =>
  run(FFMPEG, [
    "-v", "error", "-y", "-i", src, "-an", "-vf", VF, "-frames:v", String(keep),
    // CRF 28 keeps the wall's fine texture on par with the H.264 encode (CRF 31+ visibly smooths it).
    "-c:v", "libvpx-vp9", "-b:v", "0", "-crf", "28", "-row-mt", "1", "-deadline", "good", "-cpu-used", "1",
    "-pass", String(pass), "-passlogfile", passlog, "-f", "webm", out,
  ]);
vp9(1, "/dev/null");
vp9(2, WEBM);
const webmBytes = statSync(WEBM).size;
if (webmBytes >= mp4Bytes) {
  rmSync(WEBM);
  console.log(`webm ${webmBytes} bytes is not smaller than mp4 (${mp4Bytes}) -> removed`);
} else {
  console.log(`webm bytes=${webmBytes} (kept, smaller than mp4)`);
}

// Poster: first frame, same scale/crop, mozjpeg q82.
await sharp(first).resize(1280, 720, { fit: "cover", position: "centre" }).jpeg({ quality: 82, mozjpeg: true }).toFile(POSTER);
console.log(`poster ${POSTER} bytes=${statSync(POSTER).size}`);
rmSync(tmp, { recursive: true, force: true });
