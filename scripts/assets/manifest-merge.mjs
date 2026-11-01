// Builds assets-src/MANIFEST.md (brief §8: "Log the prompt, model and seed for every asset") from the
// group manifests in assets-src/manifest/{hero,basement,stills}.md, which stay the source of truth.
// Headings of the group files are demoted one level so they nest under this file's sections.
//
// usage: node scripts/assets/manifest-merge.mjs
import fs from "node:fs";

const GROUPS = [
  ["hero", "assets-src/manifest/hero.md"],
  ["basement", "assets-src/manifest/basement.md"],
  ["stills", "assets-src/manifest/stills.md"],
];

const header = `# Generated asset manifest: Capital Drywall & Renovation

Every image, frame and clip on the site that came out of a generative model is logged here with its
prompt, model, seed and post-processing. The Higgsfield API does not expose seeds for any model used, so
each entry gives the job id instead. Sections 4-6 are the group manifests, merged verbatim from
\`assets-src/manifest/hero.md\`, \`basement.md\` and \`stills.md\` (edit those, then re-run
\`node scripts/assets/manifest-merge.mjs\`). \`node scripts/assets/verify-assets.mjs\` checks every output
against its size, format and byte budget.

## 1. Method (brief §8)

1. **Stage 1 as a still.** The first stage of each sequence is generated from text (hero: four models
   tried; basement: two), and the best render is kept.
2. **Later stages edited from it.** Every later stage is an image edit with the stage prompt and the
   earlier still as the single reference image, so camera, framing and light stay locked (hero S2, S4 and
   S5 edit S1 and S3 edits S2; basement B2-B4 each edit the previous stage).
3. **Start + end keyframe interpolation.** Each consecutive pair becomes a 5 s clip from a video model
   with the earlier stage as the start frame and the later stage as the end frame (hero: \`kling3_0\`;
   basement: \`minimax_h3\`), rendered separately for 16:9 (desktop) and 9:16 (mobile). Clips are checked
   on contact strips plus SSIM (boundary frames against the keyframes, consecutive frames for jumps), and
   a clip is rejected if the room or wall stops being the same place.
4. **ffmpeg extraction.** The clips of one ratio are concatenated (the repeated boundary keyframe is
   dropped, H.264 CRF 12 master, no audio) and frames are extracted at the exact output size (Lanczos,
   cover crop), with the stage frames placed on the keyframes.
5. **sharp AVIF.** Frames are encoded with sharp (AVIF, effort 6, 4:2:0, quality lowered until the folder
   fits its budget) next to a \`manifest.json\` (\`frames, width, height, ext, pad, stages, bytes\`).
   Posters are exact sequence frames (mozjpeg JPEG, plus AVIF for the hero).

Stills are generated at 2k, cleaned of stray letters or logos by edit prompts or a deterministic
retouch, then cropped and resized with sharp to the exact size (mozjpeg). No faces, text or logos in any
asset; every kept file was checked on contact sheets and full-resolution crops.

## 2. Honesty

**Everything in this manifest is AI-generated** (Higgsfield: \`nano_banana_pro\`, \`gpt_image_2_5\`,
\`flux_3_image\`, \`kling3_0\`, \`minimax_h3\`). These are atmosphere images, concept visualizations
(hero wall, basement transformation, raking-light panels, basement tiles) and demo samples (before/after
pairs). **None of them shows a real client project, and none may be captioned or presented as completed
client work** (brief §3, §7.3, §8.4). The basement sequence keeps its "Concept visualization" label, and
the sample before/afters, prompted to look like jobsite photos, must always be labelled as samples.

## 3. Credit summary

Credits only throughout (\`use_unlim: false\`, no free generations, no credits bought, no preference changes).

| | Credits |
|---|---|
| Balance at the start of the project (2026-10-31, before the first job at 04:04 UTC) | 894.50 |
| Hero group (30 jobs) | -134.75 |
| Basement group before the interruption (18 jobs) | -85.50 |
| Stills group (40 jobs charged, 2 of them refunded; net) | -77.50 |
| **Balance before the finishing run** | **596.75** |
| Basement clips run 2 (5 x \`minimax_h3\`, 14:57 UTC): duplicate takes of the five run-1 clips, whose job ids had been lost in the interruption | -50.00 |
| **Final balance (2026-10-31, after the finishing run)** | **546.75** |
| **Project total** | **347.75** |

By model: \`nano_banana_pro\` 63 jobs, 122 net (126 charged, 4 refunded); \`gpt_image_2_5\` 7 jobs, 19.25;
\`flux_3_image\` 2 jobs, 6; \`kling3_0\` 9 jobs, 80.50; \`minimax_h3\` 12 jobs, 120. The per-group tallies are in
sections 4-6 and add up to the account history.

## Output index

| Output | Section |
|---|---|
| \`public/sequences/hero-{desktop,mobile}/\`, \`public/images/hero/*\`, \`public/video/drywall-raking-loop.{mp4,webm}\`, \`assets/og/og-base.jpg\`, \`public/images/atmosphere/wall-stage-*\` | 4 (hero) |
| \`public/sequences/basement-{desktop,mobile}/\`, \`public/images/basement/*\` | 5 (basement) |
| \`public/images/raking/*\`, \`public/images/atmosphere/*\` (other than wall-stage), \`public/images/basement-tiles/*\`, \`public/images/samples/*\` | 6 (stills) |
`;

const demote = (md) =>
  md
    .split("\n")
    .map((line) => (/^#{1,5} /.test(line) ? `#${line}` : line))
    .join("\n")
    .trim();

let out = header;
GROUPS.forEach(([name, file], i) => {
  const body = fs.readFileSync(file, "utf8").trim();
  // The group file's own H1 becomes this section's H2; everything else moves down one level.
  const m = /^# (.+)\n/.exec(body);
  const title = m ? m[1] : `Group: ${name}`;
  const rest = m ? body.slice(m[0].length) : body;
  out += `\n---\n\n## ${4 + i}. ${title}\n\nSource: \`${file}\`.\n\n${demote(rest)}\n`;
});
fs.writeFileSync("assets-src/MANIFEST.md", out);
console.log(`wrote assets-src/MANIFEST.md (${out.length} chars, ${out.split("\n").length} lines)`);
