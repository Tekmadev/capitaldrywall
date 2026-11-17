// Bathroom + kitchen transformation frame pipeline (one room and ratio per run). Same as
// basement-frames.mjs, plus the camera move: the clips hold a locked-off camera and a slow centred
// push-in (zoom 1.00 -> 1.15, linear in frame index) is applied here, so stage k lands on the same
// crop as the reduced-motion stills from rooms-keyframes.mjs (ZOOM = [1, 1.05, 1.10, 1.15]).
//
// usage: node scripts/assets/rooms-frames.mjs bathroom|kitchen desktop|mobile
import sharp from "sharp";
import { execFileSync } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";

const FFMPEG = "/opt/homebrew/bin/ffmpeg";
const FFPROBE = "/opt/homebrew/bin/ffprobe";

const ROOMS = { bathroom: "bath", kitchen: "kitch" };
const room = process.argv[2];
const name = process.argv[3];
const tag = ROOMS[room];
const CONFIG = {
  desktop: {
    clips: [1, 2, 3].map((k) => `${tag}-clip${k}-16x9.mp4`),
    frames: 96,
    minFrames: 96,
    width: 1920,
    height: 1080,
    budget: 3_800_000,
  },
  mobile: {
    clips: [1, 2, 3].map((k) => `${tag}-clip${k}-9x16.mp4`),
    frames: 48,
    minFrames: 48,
    width: 900,
    height: 1600,
    budget: 1_500_000,
  },
};
const cfg = CONFIG[name];
if (!tag || !cfg) {
  console.error("usage: rooms-frames.mjs bathroom|kitchen desktop|mobile");
  process.exit(1);
}
const ZOOM_END = 1.15;
const qStart = Number(process.env.Q_START ?? 52);
const qFloor = Number(process.env.Q_FLOOR ?? 34);

const ROOT = "assets-src/rooms";
const CLIPS = path.join(ROOT, "clips");
const PNG_DIR = path.join(ROOT, `frames-${room}-${name}`);
const OUT_DIR = `public/sequences/${room}-${name}`;
const POSTER = `public/images/${room}/${room}-poster-${name}.jpg`;
const MP4 = path.join(ROOT, `${room}-${name}.mp4`);

const run = (bin, args) => execFileSync(bin, args, { encoding: "utf8", maxBuffer: 1 << 26 });

function probe(file) {
  const out = run(FFPROBE, [
    "-v", "error", "-select_streams", "v:0", "-count_frames",
    "-show_entries", "stream=width,height,r_frame_rate,nb_read_frames",
    "-of", "json", file,
  ]);
  const s = JSON.parse(out).streams[0];
  const [a, b] = s.r_frame_rate.split("/").map(Number);
  return { width: s.width, height: s.height, fps: a / b, frames: Number(s.nb_read_frames) };
}

// 1. concat (re-encode, drop duplicated boundary frames)
const infos = cfg.clips.map((c) => ({ file: path.join(CLIPS, c), ...probe(path.join(CLIPS, c)) }));
console.log("clips", infos);
const W0 = infos[0].width;
const H0 = infos[0].height;
const fps = infos[0].fps;
const parts = infos
  .map((inf, i) => {
    const trim = i === 0 ? "" : "trim=start_frame=1,";
    return `[${i}:v]${trim}setpts=PTS-STARTPTS,scale=${W0}:${H0}:flags=lanczos,fps=${fps},format=yuv420p[v${i}]`;
  })
  .join(";");
const filter = `${parts};${infos.map((_, i) => `[v${i}]`).join("")}concat=n=${infos.length}:v=1:a=0[out]`;
run(FFMPEG, [
  "-v", "error", "-y",
  ...infos.flatMap((inf) => ["-i", inf.file]),
  "-filter_complex", filter, "-map", "[out]",
  "-c:v", "libx264", "-preset", "slow", "-crf", "12", "-pix_fmt", "yuv420p", "-an",
  MP4,
]);
const cat = probe(MP4);
console.log("concat", MP4, cat);

// boundaries in the concatenated stream: end keyframe of each clip
const b1 = infos[0].frames - 1;
const b2 = b1 + (infos[1].frames - 1);
const last = cat.frames - 1;

function pickIndices(n) {
  const s1 = Math.round(n / 3);
  const s2 = Math.round((2 * n) / 3);
  const segs = [
    [0, s1, 0, b1],
    [s1, s2, b1, b2],
    [s2, n - 1, b2, last],
  ];
  const idx = [];
  for (let i = 0; i < n; i++) {
    const [o0, o1, src0, src1] = segs.find(([o0, o1]) => i >= o0 && i <= o1);
    idx.push(Math.round(src0 + ((i - o0) * (src1 - src0)) / (o1 - o0)));
  }
  return { idx, stages: [0, s1, s2, n - 1] };
}

async function extract(n) {
  const { idx, stages } = pickIndices(n);
  await fs.rm(PNG_DIR, { recursive: true, force: true });
  await fs.mkdir(PNG_DIR, { recursive: true });
  const select = idx.map((k) => `eq(n\\,${k})`).join("+");
  // Native-resolution cover crop to the output aspect (the push-in needs the extra pixels).
  const aspect = cfg.width / cfg.height;
  const nw = Math.min(W0, Math.round(H0 * aspect)) & ~1;
  const nh = Math.round(nw / aspect) & ~1;
  const vf = `select='${select}',crop=${nw}:${nh}`;
  const RAWF = `${PNG_DIR}-native`;
  await fs.rm(RAWF, { recursive: true, force: true });
  await fs.mkdir(RAWF, { recursive: true });
  run(FFMPEG, ["-v", "error", "-y", "-i", MP4, "-vf", vf, "-fps_mode", "passthrough", path.join(RAWF, "%04d.png")]);
  const files = (await fs.readdir(RAWF)).filter((f) => f.endsWith(".png")).sort();
  if (files.length !== n) throw new Error(`expected ${n} frames, got ${files.length}`);
  for (let i = 0; i < n; i++) {
    const z = 1 + ((ZOOM_END - 1) * i) / (n - 1);
    const cw = Math.round(nw / z);
    const ch = Math.round(cw / aspect);
    await sharp(path.join(RAWF, files[i]))
      .extract({ left: Math.round((nw - cw) / 2), top: Math.round((nh - ch) / 2), width: cw, height: ch })
      .resize(cfg.width, cfg.height, { kernel: "lanczos3" })
      .png()
      .toFile(path.join(PNG_DIR, files[i]));
  }
  return { files, idx, stages };
}

const avifOpts = (q) => ({ quality: q, effort: 6, chromaSubsampling: "4:2:0" });

async function encodeAll(files, q) {
  await fs.rm(OUT_DIR, { recursive: true, force: true });
  await fs.mkdir(OUT_DIR, { recursive: true });
  let total = 0;
  const sizes = [];
  for (let i = 0; i < files.length; i += 6) {
    const batch = files.slice(i, i + 6);
    const res = await Promise.all(
      batch.map((f, j) =>
        sharp(path.join(PNG_DIR, f))
          .avif(avifOpts(q))
          .toFile(path.join(OUT_DIR, `${String(i + j + 1).padStart(4, "0")}.avif`))
      )
    );
    for (const r of res) {
      total += r.size;
      sizes.push(r.size);
    }
  }
  return { total, sizes };
}

async function estimate(files, q) {
  const sample = files.filter((_, i) => i % Math.max(1, Math.floor(files.length / 12)) === 0);
  const sizes = await Promise.all(
    sample.map((f) => sharp(path.join(PNG_DIR, f)).avif(avifOpts(q)).toBuffer().then((b) => b.length))
  );
  return (sizes.reduce((a, b) => a + b, 0) / sizes.length) * files.length;
}

// 2-4. quality first, then frames
let n = cfg.frames;
let chosen = null;
while (!chosen) {
  const ex = await extract(n);
  let q = qStart;
  while (q >= qFloor && (await estimate(ex.files, q)) > cfg.budget * 0.97) q -= 2;
  if (q >= qFloor) {
    let enc = await encodeAll(ex.files, q);
    while (enc.total > cfg.budget && q - 2 >= qFloor) {
      q -= 2;
      enc = await encodeAll(ex.files, q);
    }
    if (enc.total <= cfg.budget) chosen = { ...ex, q, ...enc, n };
  }
  if (!chosen) {
    if (n - 6 < cfg.minFrames) throw new Error(`cannot meet budget at quality floor ${qFloor} with ${n} frames (lower Q_FLOOR)`);
    n -= 6;
    console.log("over budget at quality floor, retrying with", n, "frames");
  }
}

// 5. manifest + poster (exact first frame)
const manifest = {
  frames: chosen.n,
  width: cfg.width,
  height: cfg.height,
  ext: "avif",
  pad: 4,
  stages: chosen.stages,
  bytes: chosen.total,
};
await fs.writeFile(path.join(OUT_DIR, "manifest.json"), JSON.stringify(manifest) + "\n");
const poster = await sharp(path.join(PNG_DIR, chosen.files[0]))
  .jpeg({ quality: 84, mozjpeg: true })
  .toFile(POSTER);

console.log(
  JSON.stringify(
    {
      name,
      quality: chosen.q,
      manifest,
      sourceIndices: chosen.idx,
      maxFrameBytes: Math.max(...chosen.sizes),
      minFrameBytes: Math.min(...chosen.sizes),
      poster: { file: POSTER, w: poster.width, h: poster.height, bytes: poster.size },
    },
    null,
    2
  )
);
