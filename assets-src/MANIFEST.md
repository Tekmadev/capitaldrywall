# Generated asset manifest: Capital Drywall & Renovation

Every image, frame and clip on the site that came out of a generative model is logged here with its
prompt, model, seed and post-processing. The Higgsfield API does not expose seeds for any model used, so
each entry gives the job id instead. Sections 4-6 are the group manifests, merged verbatim from
`assets-src/manifest/hero.md`, `basement.md` and `stills.md` (edit those, then re-run
`node scripts/assets/manifest-merge.mjs`). `node scripts/assets/verify-assets.mjs` checks every output
against its size, format and byte budget.

## 1. Method (brief §8)

1. **Stage 1 as a still.** The first stage of each sequence is generated from text (hero: four models
   tried; basement: two), and the best render is kept.
2. **Later stages edited from it.** Every later stage is an image edit with the stage prompt and the
   earlier still as the single reference image, so camera, framing and light stay locked (hero S2, S4 and
   S5 edit S1 and S3 edits S2; basement B2-B4 each edit the previous stage).
3. **Start + end keyframe interpolation.** Each consecutive pair becomes a 5 s clip from a video model
   with the earlier stage as the start frame and the later stage as the end frame (hero: `kling3_0`;
   basement: `minimax_h3`), rendered separately for 16:9 (desktop) and 9:16 (mobile). Clips are checked
   on contact strips plus SSIM (boundary frames against the keyframes, consecutive frames for jumps), and
   a clip is rejected if the room or wall stops being the same place.
4. **ffmpeg extraction.** The clips of one ratio are concatenated (the repeated boundary keyframe is
   dropped, H.264 CRF 12 master, no audio) and frames are extracted at the exact output size (Lanczos,
   cover crop), with the stage frames placed on the keyframes.
5. **sharp AVIF.** Frames are encoded with sharp (AVIF, effort 6, 4:2:0, quality lowered until the folder
   fits its budget) next to a `manifest.json` (`frames, width, height, ext, pad, stages, bytes`).
   Posters are exact sequence frames (mozjpeg JPEG, plus AVIF for the hero).

Stills are generated at 2k, cleaned of stray letters or logos by edit prompts or a deterministic
retouch, then cropped and resized with sharp to the exact size (mozjpeg). No faces, text or logos in any
asset; every kept file was checked on contact sheets and full-resolution crops.

## 2. Honesty

**Everything in this manifest is AI-generated** (Higgsfield: `nano_banana_pro`, `gpt_image_2_5`,
`flux_3_image`, `kling3_0`, `minimax_h3`). These are atmosphere images, concept visualizations
(hero wall, basement transformation, raking-light panels, basement tiles) and demo samples (before/after
pairs). **None of them shows a real client project, and none may be captioned or presented as completed
client work** (brief §3, §7.3, §8.4). The basement sequence keeps its "Concept visualization" label, and
the sample before/afters, prompted to look like jobsite photos, must always be labelled as samples.

## 3. Credit summary

Credits only throughout (`use_unlim: false`, no free generations, no credits bought, no preference changes).

| | Credits |
|---|---|
| Balance at the start of the project (2026-10-31, before the first job at 04:04 UTC) | 894.50 |
| Hero group (30 jobs) | -134.75 |
| Basement group before the interruption (18 jobs) | -85.50 |
| Stills group (40 jobs charged, 2 of them refunded; net) | -77.50 |
| **Balance before the finishing run** | **596.75** |
| Basement clips run 2 (5 x `minimax_h3`, 14:57 UTC): duplicate takes of the five run-1 clips, whose job ids had been lost in the interruption | -50.00 |
| **Final balance (2026-10-31, after the finishing run)** | **546.75** |
| **Project total** | **347.75** |

By model: `nano_banana_pro` 63 jobs, 122 net (126 charged, 4 refunded); `gpt_image_2_5` 7 jobs, 19.25;
`flux_3_image` 2 jobs, 6; `kling3_0` 9 jobs, 80.50; `minimax_h3` 12 jobs, 120. The per-group tallies are in
sections 4-6 and add up to the account history.

## Output index

| Output | Section |
|---|---|
| `public/sequences/hero-{desktop,mobile}/`, `public/images/hero/*`, `public/video/drywall-raking-loop.{mp4,webm}`, `assets/og/og-base.jpg`, `public/images/atmosphere/wall-stage-*` | 4 (hero) |
| `public/sequences/basement-{desktop,mobile}/`, `public/images/basement/*` | 5 (basement) |
| `public/images/raking/*`, `public/images/atmosphere/*` (other than wall-stage), `public/images/basement-tiles/*`, `public/images/samples/*` | 6 (stills) |

---

## 4. Hero group: generated asset manifest

Source: `assets-src/manifest/hero.md`.

Group: **hero** (home hero scroll sequence, posters, drywall-page loop, OG base).
Source of truth for prompts: `docs/CAPITAL_BUILD_BRIEF.md` §8.1, §8.4 (last bullet), §8.5.

**Honesty (brief §3):** every asset below is AI-generated *atmosphere / concept* imagery of a generic
wall. None of it shows, or may be captioned as, a completed client project.

Content checks on every kept image or clip: no people, no faces, no hands, no text, no letters,
no logos, no watermarks. Each kept still was opened and inspected at full resolution; each clip was
inspected as frame tiles plus consecutive-frame SSIM.

**Seeds:** the Higgsfield API does not expose seeds. Every entry lists the job id instead
(`not exposed / job <id>`). Jobs requested as `nano_banana_pro` are reported by the API with the
internal model name `nano_banana_2`.

**Billing:** credits only (`use_unlim:false` on every call, no free gens, no preference changes,
no projects created; `get_preferences` returned `auto_create_project:false`, so no folder_id).

---

### Credit tally

Reconstructed after the interruption from the Higgsfield credit transactions (2026-10-31 04:04-04:26 UTC)
and the generation history (job id, model, params, prompt and reference image of every job). Every hero
job is listed below; the sum matches the account history.

| Item | Model (requested id) | Jobs | Credits each | Credits |
|---|---|---|---|---|
| S1 model test, 16:9 + 9:16 (v1 and v2) | `nano_banana_pro` (2k) | 4 | 2 | 8 |
| S1 model test, 16:9 + 9:16 | `gpt_image_2_5` (2k) | 2 | 2.75 | 5.50 |
| S1 model test, 16:9 + 9:16 | `flux_3_image` (2k) | 2 | 3 | 6 |
| S2-S5 edits of S1, both ratios | `nano_banana_pro` (2k) | 8 | 2 | 16 |
| S3 re-made as an edit of S2, both ratios | `nano_banana_pro` (2k) | 2 | 2 | 4 |
| OG base candidates | `nano_banana_pro` + `gpt_image_2_5` | 2 | 2 / 2.75 | 4.75 |
| Interpolation test S1->S2 desktop | `minimax_h3` (5 s, 2K) | 1 | 10 | 10 |
| Interpolation clips S1->S5, both ratios | `kling3_0` (5 s, pro) | 8 | 8.75 | 70 |
| Drywall-page loop | `kling3_0` (6 s, pro) | 1 | 10.50 | 10.50 |
| **Hero group total** | | **30** | | **134.75** |

No failed or refunded jobs in this group.

---

### Stage style suffix (brief §8.1, verbatim, appended to every stage prompt)

`photorealistic, cinematic, dark interior room, a single low-angle warm work light (3200K) grazing the wall surface from the left, strong raking light revealing surface texture, fine dust particles drifting in the beam, shallow depth of field, 35mm lens, camera at chest height facing the wall, wall fills the frame, no people, no text, no logos`

Stage prompts = stage text from the §8.1 table + the suffix. For S2-S5 the table's "same framing, "
prefix is included because the stage is an edit of the stage-1 still.

| Stage | Prompt (before the suffix) |
|---|---|
| S1 | `a freshly hung bare gypsum drywall wall, visible board seams and screw heads in a neat grid, paper-faced board texture,` |
| S2 | `same framing, drywall seams covered with paper tape bedded in wet joint compound, screw heads spotted with compound, slight wet sheen,` |
| S3 | `same framing, joints feathered wide with three coats of off-white joint compound, broad smooth trowel strokes visible,` |
| S4 | `same framing, fully sanded uniform matte compound surface, seams invisible, a little fine sanding dust in the light beam,` |
| S5 | `same framing, flawless finished wall painted warm off-white, perfectly smooth under the raking light, no seams or ridges visible, calm and premium,` |

No prompt text was changed. One method change (not a prompt change): see S3 below.

Interpolation prompt (brief §8.1, verbatim, with `[stage A]`/`[stage B]` replaced):
`slow steady lateral camera dolly to the right along the wall, the wall surface gradually transforms from [stage A] to [stage B], continuous smooth motion, consistent lighting`

Short stage descriptions used for the replacements:
- S1: `bare freshly hung drywall with exposed seams and screw heads`
- S2: `seams covered with paper tape bedded in wet joint compound`
- S3: `joints feathered wide with three coats of joint compound`
- S4: `a fully sanded uniform matte compound surface`
- S5: `a flawless smooth wall painted warm off-white`

---

### How this section was reconstructed

The agent that produced the hero group was interrupted before writing this part. Everything below was
rebuilt from the files on disk (`assets-src/hero/raw`, `clips`, `frames-*`, the masters, `public/...`),
the scripts (`scripts/assets/hero-*.mjs`) and the Higgsfield generation history, which records for every
job the requested model, params, exact prompt and reference/start/end images. Which raw variant was kept
was verified by SSIM of each raw still against the sequence frame at its manifest stage index (kept
variant 0.97-0.99; rejected variants 0.47-0.81). Seed: not exposed by the API for any of these models.

---

### 1. Stage stills (keyframes)

Method (brief §8 steps 1-2): S1 generated from text in four models; the kept S1 was then edited
(single reference image, the S1 still of the same ratio) into S2, S4 and S5. S3 is the one method change:
the first S3 (edit of S1) was not used; the kept S3 is an edit of **S2** of the same ratio (same prompt).
All stills: params `{resolution: "2k", aspect_ratio: "16:9" | "9:16"}`, 2 credits each (nano_banana_pro),
output 2752x1536 / 1536x2752 PNG.

#### S1 (text to image)
Prompt (exact, both ratios):
`a freshly hung bare gypsum drywall wall, visible board seams and screw heads in a neat grid, paper-faced board texture, photorealistic, cinematic, dark interior room, a single low-angle warm work light (3200K) grazing the wall surface from the left, strong raking light revealing surface texture, fine dust particles drifting in the beam, shallow depth of field, 35mm lens, camera at chest height facing the wall, wall fills the frame, no people, no text, no logos`

| Raw file | Model | Seed / job id | Status |
|---|---|---|---|
| `assets-src/hero/raw/s1-desktop-nbp-v2.png` | nano_banana_pro | not exposed / job `964d78c1-93af-437d-99c6-8b9691193518` | **kept** (desktop S1, start of the desktop sequence) |
| `assets-src/hero/raw/s1-mobile-nbp-v1.png` | nano_banana_pro | not exposed / job `ea443387-4655-46fd-b29f-98b053fef642` | **kept** (mobile S1, start of the mobile sequence) |
| `assets-src/hero/raw/s1-desktop-nbp-v1.png` | nano_banana_pro | not exposed / job `ed12dfe5-5a47-4223-8886-997be13e552b` | not used |
| `assets-src/hero/raw/s1-mobile-nbp-v2.png` | nano_banana_pro | not exposed / job `8a83b67b-2f13-44bf-a71c-ebc2af8229a4` | not used |
| `assets-src/hero/raw/s1-desktop-gpt-v1.png` | gpt_image_2_5 | not exposed / job `50a8f2ee-d259-42ec-a8d8-b3cc04248213` | not used (model test) |
| `assets-src/hero/raw/s1-mobile-gpt-v1.png` | gpt_image_2_5 | not exposed / job `aea0251e-4924-4ee2-a139-152b41c62d6a` | not used (model test) |
| `assets-src/hero/raw/s1-desktop-flux-v1.png` | flux_3_image | not exposed / job `b11a776e-559d-44d4-811a-303b577abab5` | not used (model test) |
| `assets-src/hero/raw/s1-mobile-flux-v1.png` | flux_3_image | not exposed / job `1694edcc-1591-4ebf-b02e-b1ef6c2b1f7f` | not used (model test) |

#### S2 (edit of S1)
Prompt (exact, both ratios):
`same framing, drywall seams covered with paper tape bedded in wet joint compound, screw heads spotted with compound, slight wet sheen, photorealistic, cinematic, dark interior room, a single low-angle warm work light (3200K) grazing the wall surface from the left, strong raking light revealing surface texture, fine dust particles drifting in the beam, shallow depth of field, 35mm lens, camera at chest height facing the wall, wall fills the frame, no people, no text, no logos`

| Raw file | Model | Seed / job id | Reference | Status |
|---|---|---|---|---|
| `assets-src/hero/raw/s2-desktop-nbp-v1.png` | nano_banana_pro | not exposed / job `577ae0ba-c470-4b05-81fc-803dfd22481a` | S1 desktop (`964d78c1`) | **kept** |
| `assets-src/hero/raw/s2-mobile-nbp-v1.png` | nano_banana_pro | not exposed / job `d7805a96-cde8-4ff7-bcfd-93c425233861` | S1 mobile (`ea443387`) | **kept** |

#### S3 (edit of S2: the method change)
Prompt (exact, both ratios, unchanged between v1 and v2):
`same framing, joints feathered wide with three coats of off-white joint compound, broad smooth trowel strokes visible, photorealistic, cinematic, dark interior room, a single low-angle warm work light (3200K) grazing the wall surface from the left, strong raking light revealing surface texture, fine dust particles drifting in the beam, shallow depth of field, 35mm lens, camera at chest height facing the wall, wall fills the frame, no people, no text, no logos`

| Raw file | Model | Seed / job id | Reference | Status |
|---|---|---|---|---|
| `assets-src/hero/raw/s3-desktop-nbp-v2.png` | nano_banana_pro | not exposed / job `cffc9480-c739-4fe9-81c1-ac1bef6d3996` | S2 desktop (`577ae0ba`) | **kept** |
| `assets-src/hero/raw/s3-mobile-nbp-v2.png` | nano_banana_pro | not exposed / job `c4d321cb-5aeb-4623-80b6-471165a71611` | S2 mobile (`d7805a96`) | **kept** |
| `assets-src/hero/raw/s3-desktop-nbp-v1.png` | nano_banana_pro | not exposed / job `e39e6d1e-95e3-4272-8693-e280e90cf969` | S1 desktop | not used |
| `assets-src/hero/raw/s3-mobile-nbp-v1.png` | nano_banana_pro | not exposed / job `973f9916-3977-4a94-a4c4-7899fb95108a` | S1 mobile | not used |

#### S4 (edit of S1)
Prompt (exact, both ratios):
`same framing, fully sanded uniform matte compound surface, seams invisible, a little fine sanding dust in the light beam, photorealistic, cinematic, dark interior room, a single low-angle warm work light (3200K) grazing the wall surface from the left, strong raking light revealing surface texture, fine dust particles drifting in the beam, shallow depth of field, 35mm lens, camera at chest height facing the wall, wall fills the frame, no people, no text, no logos`

| Raw file | Model | Seed / job id | Reference | Status |
|---|---|---|---|---|
| `assets-src/hero/raw/s4-desktop-nbp-v1.png` | nano_banana_pro | not exposed / job `b03391ca-fb97-4284-918d-9a2b9e3d29b1` | S1 desktop (`964d78c1`) | **kept** |
| `assets-src/hero/raw/s4-mobile-nbp-v1.png` | nano_banana_pro | not exposed / job `34b4de8b-3440-4110-a055-2ae8f0ad5948` | S1 mobile (`ea443387`) | **kept** |

#### S5 (edit of S1)
Prompt (exact, both ratios):
`same framing, flawless finished wall painted warm off-white, perfectly smooth under the raking light, no seams or ridges visible, calm and premium, photorealistic, cinematic, dark interior room, a single low-angle warm work light (3200K) grazing the wall surface from the left, strong raking light revealing surface texture, fine dust particles drifting in the beam, shallow depth of field, 35mm lens, camera at chest height facing the wall, wall fills the frame, no people, no text, no logos`

| Raw file | Model | Seed / job id | Reference | Status |
|---|---|---|---|---|
| `assets-src/hero/raw/s5-desktop-nbp-v1.png` | nano_banana_pro | not exposed / job `bd510dcd-be78-4a28-b670-64379d897dcd` | S1 desktop (`964d78c1`) | **kept** (also the loop keyframe) |
| `assets-src/hero/raw/s5-mobile-nbp-v1.png` | nano_banana_pro | not exposed / job `8a80f68f-6349-4ea3-ba88-e953162bfe1f` | S1 mobile (`ea443387`) | **kept** |

---

### 2. Interpolation clips (brief §8 step 3)

Start image = stage A still, end image = stage B still (the job ids above), same ratio. Prompt = the
§8.1 interpolation template with the short stage descriptions listed above, e.g. S1->S2:
`slow steady lateral camera dolly to the right along the wall, the wall surface gradually transforms from bare freshly hung drywall with exposed seams and screw heads to seams covered with paper tape bedded in wet joint compound, continuous smooth motion, consistent lighting`
(S2->S3, S3->S4 and S4->S5 are the same sentence with the next pair of descriptions; all four exact
prompts are identical for desktop and mobile.)

`kling3_0` params: `{duration: 5, aspect_ratio: "16:9" | "9:16", mode: "pro", cfg_scale: 0.5, sound: "off", enhance_prompt: false}`,
8.75 credits each; output 1928x1076 / 1076x1928, 24 fps, 121 frames, no audio track.

| Clip file | Model | Seed / job id | Start -> end image | Status |
|---|---|---|---|---|
| `assets-src/hero/clips/desktop-s1-s2-kling.mp4` | kling3_0 | not exposed / job `3c4e5dd2-0b5d-4d43-83b5-422dd2e0acd4` | `964d78c1` -> `577ae0ba` | **kept** |
| `assets-src/hero/clips/desktop-s2-s3-kling.mp4` | kling3_0 | not exposed / job `a21732c5-3dcd-46ef-b37e-04be306a0126` | `577ae0ba` -> `cffc9480` | **kept** |
| `assets-src/hero/clips/desktop-s3-s4-kling.mp4` | kling3_0 | not exposed / job `d687940d-8fba-4739-8961-07844817a097` | `cffc9480` -> `b03391ca` | **kept** |
| `assets-src/hero/clips/desktop-s4-s5-kling.mp4` | kling3_0 | not exposed / job `f3b05495-6c7c-4355-aaf5-a4c9aeee795c` | `b03391ca` -> `bd510dcd` | **kept** |
| `assets-src/hero/clips/mobile-s1-s2-kling.mp4` | kling3_0 | not exposed / job `201cffb4-eab6-4eac-8882-0dc3608b184e` | `ea443387` -> `d7805a96` | **kept** |
| `assets-src/hero/clips/mobile-s2-s3-kling.mp4` | kling3_0 | not exposed / job `33c63ca2-653f-4609-9ed1-781ea7e930b5` | `d7805a96` -> `c4d321cb` | **kept** |
| `assets-src/hero/clips/mobile-s3-s4-kling.mp4` | kling3_0 | not exposed / job `aa8dca10-51fc-49b4-a0a5-211dcecc86b7` | `c4d321cb` -> `34b4de8b` | **kept** |
| `assets-src/hero/clips/mobile-s4-s5-kling.mp4` | kling3_0 | not exposed / job `dca1c026-c93f-4434-92cf-faf6fd385630` | `34b4de8b` -> `8a80f68f` | **kept** |
| `assets-src/hero/clips/desktop-s1-s2-minimax.mp4` | minimax_h3 `{duration: 5, resolution: "2K"}` | not exposed / job `9aea57a8-1820-40c5-bc86-dd1bc84c367d` | `964d78c1` -> `577ae0ba` | not used (model test, 10 credits; the masters use the Kling clips only, reason not recorded) |

### 3. Masters, frames and AVIF scroll sequences (brief §8 step 4)

- `scripts/assets/hero-frames.mjs`: concatenates the four clips per ratio, dropping each later clip's first
  frame when it repeats the previous clip's end keyframe (SSIM >= 0.97), and re-encodes a master
  (libx264 CRF 12, no audio): `assets-src/hero/hero-desktop.mp4` (1928x1076, 24 fps, 481 frames = 4 x 121 - 3)
  and `assets-src/hero/hero-mobile.mp4` (1076x1928, 481 frames).
- Evenly spaced frames including the first and last, cover-cropped with Lanczos to the exact size:
  `assets-src/hero/frames-desktop/0001-0150.png` (1920x1080) and `assets-src/hero/frames-mobile/0001-0072.png` (900x1600).
- `scripts/assets/hero-encode-sequence.mjs`: sharp AVIF, quality 45, effort 6, 4:2:0 (confirmed by a
  byte-identical re-encode of frame 0001); both totals fit the budget on the first pass, so no frames were dropped.

| Output | Frames | Size | Stages (frame index) | Bytes | Budget |
|---|---|---|---|---|---|
| `public/sequences/hero-desktop/0001-0150.avif` + `manifest.json` | 150 | 1920x1080 | `[0,38,75,112,149]` | 2,671,677 | <= 6 MB |
| `public/sequences/hero-mobile/0001-0072.avif` + `manifest.json` | 72 | 900x1600 | `[0,18,36,54,71]` | 1,114,643 | <= 2.5 MB |

### 4. Posters (= exact last frame of each sequence)

`scripts/assets/hero-posters.mjs` from the same PNG the last AVIF frame was encoded from (JPEG mozjpeg q84,
AVIF q55 effort 6; all four confirmed by a byte-identical re-encode):

| Output | Size | Bytes | Source frame |
|---|---|---|---|
| `public/images/hero/hero-poster-desktop.jpg` | 1920x1080 | 59,136 | `frames-desktop/0150.png` |
| `public/images/hero/hero-poster-desktop.avif` | 1920x1080 | 15,698 | `frames-desktop/0150.png` |
| `public/images/hero/hero-poster-mobile.jpg` | 900x1600 | 51,755 | `frames-mobile/0072.png` |
| `public/images/hero/hero-poster-mobile.avif` | 900x1600 | 14,594 | `frames-mobile/0072.png` |

### 5. Drywall-page raking-light loop (brief §8.4, last bullet)

Brief line (verbatim): `Short loop (≤ 1.5 MB, muted, poster) for the Drywall page hero: raking light slowly sweeping across a flawless wall`

- Model `kling3_0`, params `{duration: 6, aspect_ratio: "16:9", mode: "pro", cfg_scale: 0.5, sound: "off", enhance_prompt: false}`,
  10.50 credits, seed not exposed / job `427037df-b6cd-4074-96b8-8eabb3b78ad9`; start image = end image = S5 desktop (`bd510dcd`).
- Exact prompt: `the low warm work light slowly sweeps across the flawless smooth painted wall, static camera, faint dust drifting in the beam, no people, no text`
- Source: `assets-src/hero/clips/drywall-loop-kling.mp4` (1928x1076, 145 frames, 6.04 s).
- `scripts/assets/hero-loop.mjs` (repeated last frame dropped for a seamless loop, 1280x720, no audio):
  `public/video/drywall-raking-loop.mp4` (H.264, 144 frames, 6.0 s, 321,080 bytes),
  `public/video/drywall-raking-loop.webm` (VP9, 158,655 bytes),
  poster `public/images/hero/drywall-loop-poster.jpg` (first frame, 1280x720, mozjpeg q82, 27,260 bytes).

### 6. OG base (brief §8.5)

Brief line (verbatim): `Dark wall with an amber raking beam and negative space for text. Page titles are overlaid via next/og.`

Exact prompt (both candidates):
`Dark wall with an amber raking beam and negative space for text: photorealistic, cinematic view of a smooth dark painted interior wall in a dark room at night, a single warm amber work-light beam (3200K) enters from the right edge of the frame and rakes across the right half of the wall at a very low grazing angle, revealing faint fine surface texture, the light falls off softly toward the centre, the entire left half of the frame is calm, even, deep shadow with almost no detail, negative space for text, fine dust drifting in the beam, 35mm lens, no people, no text, no letters, no logos, no watermark`

| Raw file | Model | Seed / job id | Status |
|---|---|---|---|
| `assets-src/hero/raw/og-base-gpt-v1.png` (2688x1520) | gpt_image_2_5 (2k, 16:9) | not exposed / job `a5b9c085-7a66-4502-8b36-277f27dd7aaf` | **kept** -> `assets/og/og-base.jpg` (1200x630, 26,267 bytes, `scripts/assets/hero-og.mjs`, cover/centre, mozjpeg q84, confirmed by a byte-identical re-encode) |
| `assets-src/hero/raw/og-base-nbp-v1.png` (2752x1536) | nano_banana_pro (2k, 16:9) | not exposed / job `04533a00-3c6d-4130-af40-6aac05f9783f` | not used |

### 7. Wall-stage stills for the drywall page (re-export of the kept stage stills)

`scripts/assets/wall-stage-stills.mjs` (2026-10-31, finishing agent): for each stage it picks the raw
variant the sequence was built from (best SSIM against the sequence frame at the manifest stage index)
and exports it. 16:9: Lanczos cover resize to 1920x1080. 4:5: centre 4:5 crop of the 9:16 still
(1536x1920 of 1536x2752), Lanczos resize to 1200x1500. JPEG mozjpeg q82. No new generation (0 credits);
prompts, models and job ids are those of the source stills in section 1.

| Output | Size | Bytes | Source still | SSIM vs stage frame |
|---|---|---|---|---|
| `public/images/atmosphere/wall-stage-1-16x9.jpg` | 1920x1080 | 90,485 | `s1-desktop-nbp-v2.png` | 0.992 (frame 0001) |
| `public/images/atmosphere/wall-stage-2-16x9.jpg` | 1920x1080 | 89,642 | `s2-desktop-nbp-v1.png` | 0.992 (frame 0039) |
| `public/images/atmosphere/wall-stage-3-16x9.jpg` | 1920x1080 | 87,477 | `s3-desktop-nbp-v2.png` | 0.992 (frame 0076) |
| `public/images/atmosphere/wall-stage-4-16x9.jpg` | 1920x1080 | 64,589 | `s4-desktop-nbp-v1.png` | 0.993 (frame 0113) |
| `public/images/atmosphere/wall-stage-5-16x9.jpg` | 1920x1080 | 51,701 | `s5-desktop-nbp-v1.png` | 0.993 (frame 0150) |
| `public/images/atmosphere/wall-stage-1-4x5.jpg` | 1200x1500 | 86,449 | `s1-mobile-nbp-v1.png` | 0.968 (mobile frame 0001) |
| `public/images/atmosphere/wall-stage-3-4x5.jpg` | 1200x1500 | 87,355 | `s3-mobile-nbp-v2.png` | 0.972 (mobile frame 0037) |
| `public/images/atmosphere/wall-stage-5-4x5.jpg` | 1200x1500 | 55,953 | `s5-mobile-nbp-v1.png` | 0.980 (mobile frame 0072) |

Checked: contact sheet of all eight plus a full-resolution crop of the work light; no people, text or logos.

---

## 5. Basement transformation — asset manifest (group: basement)

Source: `assets-src/manifest/basement.md`.

Brief §7.3 / §8.2. Four-stage concept visualization of a typical Ottawa suburban basement:
unfinished concrete → framed + insulated → drywalled (taped and mudded) → finished rec room.

**Honesty:** every image and frame here is AI-generated atmosphere / concept visualization.
None of it shows a real client project. The UI must keep the "Concept visualization" corner label (§7.3).

Seeds: the Higgsfield API does not expose seeds for these models. Each entry lists the job id instead.
`nano_banana_pro` jobs are reported by the API as model `nano_banana_2` (same request id); the requested id was `nano_banana_pro`.

_Status: complete (stills, clips, frame sequences, posters). Clip, frame and credit sections added
2026-10-31 by the finishing agent after the interruption._

### Stage prompts (verbatim from brief §8.2)

Style suffix (appended to every stage):
`photorealistic wide-angle 24mm interior photograph of a typical Ottawa suburban house basement, eye-level, identical camera position, soft daylight from small basement windows plus warm practical lights, no people, no text`

| Stage | Exact prompt sent |
|---|---|
| B1 | `unfinished basement, bare poured-concrete foundation walls, exposed wood floor joists and ductwork overhead, concrete floor, one bare bulb, a small hopper window, photorealistic wide-angle 24mm interior photograph of a typical Ottawa suburban house basement, eye-level, identical camera position, soft daylight from small basement windows plus warm practical lights, no people, no text` |
| B2 | `same, new wood stud walls framed, insulation and clear vapour barrier installed, electrical boxes roughed in, photorealistic wide-angle 24mm interior photograph of a typical Ottawa suburban house basement, eye-level, identical camera position, soft daylight from small basement windows plus warm practical lights, no people, no text` |
| B3 | `same, walls and ceiling covered in drywall, taped and mudded, recessed light cut-outs, concrete floor still exposed, photorealistic wide-angle 24mm interior photograph of a typical Ottawa suburban house basement, eye-level, identical camera position, soft daylight from small basement windows plus warm practical lights, no people, no text` |
| B4 | `same, fully finished modern family rec room, smooth warm-white walls, flat drywall ceiling with recessed pot lights, light oak luxury vinyl plank floor, white baseboards and trim, a low media console and neutral sofa, bright and cozy, photorealistic wide-angle 24mm interior photograph of a typical Ottawa suburban house basement, eye-level, identical camera position, soft daylight from small basement windows plus warm practical lights, no people, no text` |

The leading `same,` is the brief's own table wording for B2–B4. No clarifying clause was added to any stage prompt.

### Kept stills (B1–B4, two renders)

Method (brief §8 steps 1–2): B1 generated from text; each later stage generated by editing the
previous kept stage (single image reference, role `image_references`), so camera position, 24 mm
framing, window, joists, beam, bulkhead line and sump pit stay locked. Drift was checked on gridded
contact sheets and 50/50 onion skins (`assets-src/basement/review/`); no stage drifted.

All stills: model `nano_banana_pro`, params `{resolution: "2k"}`, 2 credits each, output 2752x1536 (16:9) / 1536x2752 (9:16).

| Stage | Ratio | Job id (seed not exposed) | Reference image | Raw file |
|---|---|---|---|---|
| B1 | 16:9 | `91526186-5bc9-434c-a7ef-8a888bf6c845` | none | `assets-src/basement/raw/b1-16x9-nano-v1.png` |
| B2 | 16:9 | `163696d8-f795-49a0-b35c-94e34428c4b1` | B1 16:9 | `raw/b2-16x9-nano-v1.png` |
| B3 | 16:9 | `6278170d-00d6-40e5-adfa-06a821b94ee0` | B2 16:9 | `raw/b3-16x9-nano-v1.png` |
| B4 | 16:9 | `a50ac5cb-a528-4752-909e-aec6ac05287b` | B3 16:9 | `raw/b4-16x9-nano-v1.png` |
| B1 | 9:16 | `0341c8d5-08f2-47a9-9ef3-72ca7fc6481b` | B1 16:9 (same room, recomposed vertically) | `raw/b1-9x16-nano-v2-ref.png` |
| B2 | 9:16 | `b2810275-b9cb-4054-ab27-086b0ca1e1b4` | B1 9:16 | `raw/b2-9x16-nano-v1.png` |
| B3 | 9:16 | `a62b02df-b7cb-43ba-b2d8-db9b974c945c` | B2 9:16 | `raw/b3-9x16-nano-v1.png` |
| B4 | 9:16 | `01c4c158-bb26-431c-bc71-3371515e80f9` | B3 9:16 | `raw/b4-9x16-nano-v1.png` |

Why these: the Nano Banana Pro B1 is a low-ceilinged, modest basement with one lit bare bulb, a small
slider/hopper window in a corrugated window well, form-tie concrete with efflorescence, rim-joist
batts, a galvanized supply trunk and a sump pit. It reads as a real Ottawa suburban basement and
already has amber practical light against cool window daylight. The GPT Image 2.5 variants read as
flat HDR real-estate listing photos of large new-build basements.

#### Retouch log (post-generation, deterministic, `scripts/assets/basement-retouch.mjs`)

Small letter-like or logo marks were removed so no frame carries text. Outputs: `assets-src/basement/keyframes/b{1-4}-{16x9,9x16}-retouched.png`.
Coordinates are in raw-still pixels.

- B1 16:9: PVC sump-pipe print column, vertical rank filter (x2238 y1066 24x148; x2236 y1270 22x76).
- B2 16:9: PVC pipe print (x2253 y1074 24x140; x2250 y1272 22x76).
- B3 16:9: pencil scribble on board, median (x592 y826 170x64); PVC pipe print (x2253 y1066 22x150; x2250 y1274 22x74).
- B4 16:9: coffee-table book-spine lettering, row rank filter (x1356 y1033 92x40); TV bezel logo, clone along bezel (x1046 y922 44x24); subwoofer logo, clone from grille (x812 y1188 38x24); candle label, median (x2112 y758 48x42).
- B1 9:16: carton print on two boxes, median (x756 y1628 58x64; x692 y1620 70x68; x528 y1688 44x54).
- B2 9:16: carton print, median (x716 y1668 90x50; x522 y1698 46x56).
- B3 9:16: carton print, median (x686 y1652 126x76; x506 y1776 34x28); pencil line on board (x236 y1578 126x42).
- B4 9:16: TV bezel logo, row rank (x488 y1516 64x16); book-spine lettering (x386 y1594 96x14 high percentile; x386 y1607 96x16 low percentile); candle label (x433 y1575 16x24); figurative print in the small console photo frame made abstract, median (x642 y1522 32x44); player display (x572 y1626 28x16).

#### Stage stills for reduced motion (from the retouched high-quality stills, not video frames)

`scripts/assets/basement-keyframes.mjs`: exact-aspect centre crop, then a progressive push-in crop
(B1 1.00, B2 1.05, B3 1.10, B4 1.15) so each still lines up with its stage frame in the sequence.
Lanczos resize, sharp mozjpeg q82.

| Output | Size | Bytes | Source (crop zoom) |
|---|---|---|---|
| `public/images/basement/basement-stage-1-desktop.jpg` | 1920x1080 | 200,059 | `b1-16x9-retouched.png` (1.00) |
| `public/images/basement/basement-stage-2-desktop.jpg` | 1920x1080 | 213,502 | `b2-16x9-retouched.png` (1.05) |
| `public/images/basement/basement-stage-3-desktop.jpg` | 1920x1080 | 102,364 | `b3-16x9-retouched.png` (1.10) |
| `public/images/basement/basement-stage-4-desktop.jpg` | 1920x1080 | 133,439 | `b4-16x9-retouched.png` (1.15) |
| `public/images/basement/basement-stage-1-mobile.jpg` | 900x1600 | 136,857 | `b1-9x16-retouched.png` (1.00) |
| `public/images/basement/basement-stage-2-mobile.jpg` | 900x1600 | 160,146 | `b2-9x16-retouched.png` (1.05) |
| `public/images/basement/basement-stage-3-mobile.jpg` | 900x1600 | 88,043 | `b3-9x16-retouched.png` (1.10) |
| `public/images/basement/basement-stage-4-mobile.jpg` | 900x1600 | 110,112 | `b4-9x16-retouched.png` (1.15) |

#### Stills generated but not kept

| Raw file | Model | Seed / job id |
|---|---|---|
| `raw/b1-16x9-gpt-v1.png` | gpt_image_2_5 (2k) | not exposed / job `f56df014-28dd-4fb9-9d65-d41a93bef27b` |
| `raw/b1-9x16-gpt-v1.png` | gpt_image_2_5 (2k) | not exposed / job `93554f9b-5d1f-48c7-a7b1-a94c8b785ac9` |
| `raw/b1-9x16-nano-v1.png` | nano_banana_pro (text only) | not exposed / job `7139b706-11a1-41f1-a230-b81d51012e78` |
| `raw/b1-9x16-nano-v3.png` | nano_banana_pro (text only) | not exposed / job `c9543661-0ef9-433f-b24d-1e67fa83c48e` |

Prompt of all four: the B1 prompt above (exact).

### Interpolation clips (brief §8 step 3)

Video keyframes: `assets-src/basement/keyframes/vk-{16x9,9x16}-b{1..4}.jpg` (`scripts/assets/basement-keyframes.mjs`,
same progressive centre push-in crop as the stage stills, 2560x1440 / 1440x2560, JPEG q95 4:4:4). Each clip
interpolates one consecutive pair of the same ratio: role `start_image` = stage A keyframe, role
`end_image` = stage B keyframe.

- Model `minimax_h3`, params `{duration: 5, resolution: "2K", aspect_ratio: "16:9" | "9:16"}`, nothing else,
  10 credits each (get_cost preflight), credits only (`use_unlim: false`). Seed: not exposed.
- Output: 2560x1440 / 1440x2560, 24 fps, 124 frames (5.17 s), H.264 plus an AAC track that the pipeline drops.
- Prompt template (brief §8.2, verbatim): `slow push-in camera move, the basement gradually transforms from [A] to [B]`

Two takes exist for the five clips after clip 1, because of the interruption:

- **Run 1** (04:30 and 04:37 UTC, the interrupted agent). Clip 1 16:9 was downloaded and reviewed; the other
  five were submitted seconds before the interruption, so their job ids never reached disk. They were found
  completed in the Higgsfield generation history afterwards. Short stage descriptions used:
  B1 `an unfinished basement with bare concrete walls`, B2 `framed stud walls with pink insulation and clear vapour barrier`,
  B3 `taped and mudded drywall on the walls and ceiling`, B4 `a finished, cozy family rec room`.
- **Run 2** (14:57 UTC, the finishing agent). The same five pairs were submitted again from re-uploaded copies
  of the same keyframes before run 1 was found in the history, so this run duplicates run 1 (50 credits).
  Short stage descriptions used: B1 `an unfinished basement with bare concrete walls and exposed joists`,
  B2 `new wood stud walls with insulation and clear vapour barrier`,
  B3 `walls and ceiling covered in drywall, taped and mudded, with recessed light cut-outs`,
  B4 `a fully finished modern family rec room with smooth warm-white walls, pot lights and a light oak floor`.

Example exact prompt (clip 1, run 1): `slow push-in camera move, the basement gradually transforms from an unfinished basement with bare concrete walls to framed stud walls with pink insulation and clear vapour barrier`.
Every other prompt is the template with that run's A and B descriptions.

QA, every take: 8-frame contact strip plus first/last frames (`assets-src/basement/review/<clip>-strip.png`,
`-first.png`, `-last.png`), SSIM of the first frame against the start keyframe and of the last frame against
the end keyframe (`scripts/assets/basement-clipcheck.mjs`), and consecutive-frame SSIM for jumps
(`scripts/assets/hero-clipcheck.mjs`). No take changed the room's identity: window positions, beam and
bulkhead line, corner and sump pit stay in place in all eleven, so none was rejected on identity. Of each
pair of takes, the smoother one (higher worst-case consecutive-frame SSIM) was kept and copied to the
pipeline name `clipN-<ratio>.mp4`; the other stays in `clips/` as an alternate.

| Take (file in `assets-src/basement/clips/`) | Pair | Seed / job id | SSIM first / last vs keyframes | Consecutive SSIM worst (mean) | Decision |
|---|---|---|---|---|---|
| `clip1-16x9.mp4` (run 1) | B1->B2 16:9 | not exposed / job `d2235ccb-1549-4c51-869b-a96f30eb8683` | 0.922 / 0.956 | 0.936 (0.975) | **kept** (only take) |
| `clip2-16x9-r1.mp4` | B2->B3 16:9 | not exposed / job `3e66772d-1009-492e-98f1-52383540cfe6` | 0.935 / 0.979 | 0.980 (0.996) | **kept** -> `clip2-16x9.mp4` |
| `clip2-16x9-r2.mp4` | B2->B3 16:9 | not exposed / job `4a8b3391-a308-4689-b504-48886954de9c` | 0.937 / 0.979 | 0.951 (0.992) | alternate |
| `clip3-16x9-r1.mp4` | B3->B4 16:9 | not exposed / job `5e90d2a8-9eb7-4a33-9474-ba3f14499ba6` | 0.980 / 0.972 | 0.944 (0.989) | alternate (furniture arrives in a quicker jump) |
| `clip3-16x9-r2.mp4` | B3->B4 16:9 | not exposed / job `05999b56-0589-4987-a350-c85df78cffa5` | 0.976 / 0.971 | 0.994 (0.997) | **kept** -> `clip3-16x9.mp4` |
| `clip1-9x16-r1.mp4` | B1->B2 9:16 | not exposed / job `55c49b5b-440f-468b-8c88-bbe3ec737545` | 0.935 / 0.950 | 0.975 (0.992) | **kept** -> `clip1-9x16.mp4` |
| `clip1-9x16-r2.mp4` | B1->B2 9:16 | not exposed / job `6c3583e5-0633-42ff-8852-f4355e016534` | 0.941 / 0.949 | 0.968 (0.989) | alternate (a vapour-barrier sheet flaps across the window) |
| `clip2-9x16-r1.mp4` | B2->B3 9:16 | not exposed / job `29e48e88-f512-486a-b3c4-acb9be90d067` | 0.940 / 0.976 | 0.968 (0.988) | alternate |
| `clip2-9x16-r2.mp4` | B2->B3 9:16 | not exposed / job `0d60c684-c224-4677-ab62-74b62e71369e` | 0.939 / 0.974 | 0.974 (0.991) | **kept** -> `clip2-9x16.mp4` |
| `clip3-9x16-r1.mp4` | B3->B4 9:16 | not exposed / job `79c8fb1f-10a5-4024-8494-3d463627b5d3` | 0.974 / 0.961 | 0.958 (0.986) | alternate |
| `clip3-9x16-r2.mp4` | B3->B4 9:16 | not exposed / job `d081d1e8-5a0b-4f00-a9d0-c4489a9cc0dd` | 0.976 / 0.961 | 0.982 (0.994) | **kept** -> `clip3-9x16.mp4` |

Media ids of the run 2 keyframe uploads and the submission log: `assets-src/basement/clips/jobs.log`.

### Frame sequences (brief §8 step 4)

`node scripts/assets/basement-frames.mjs desktop|mobile` (stage placement changed on 2026-10-31 to
`[0, N/3, 2N/3, N-1]`; the frame count is fixed by the contract):

1. Concatenates the three kept clips per ratio, dropping the first frame of clips 2 and 3 (it repeats the
   previous clip's end keyframe), libx264 CRF 12, no audio: `assets-src/basement/basement-desktop.mp4`
   (2560x1440, 24 fps, 370 frames = 3 x 124 - 2) and `assets-src/basement/basement-mobile.mp4` (1440x2560, 370 frames).
2. Picks the frames with a piecewise-linear map so each stage frame is exactly a clip boundary
   (master frames 0, 123, 246, 369 = keyframes B1, B2, B3, B4).
3. Extracts them with ffmpeg (Lanczos, cover crop) to `assets-src/basement/frames-desktop/0001-0120.png`
   (1920x1080) and `assets-src/basement/frames-mobile/0001-0060.png` (900x1600).
4. Encodes AVIF with sharp (effort 6, 4:2:0), quality stepped down from 52 in steps of 2 until the folder fits the budget.
5. Writes `manifest.json` and the poster.

| Output | Frames | Size | Stages | AVIF quality | Bytes | Budget |
|---|---|---|---|---|---|---|
| `public/sequences/basement-desktop/0001-0120.avif` + `manifest.json` | 120 | 1920x1080 | `[0,40,80,119]` | 42 | 4,522,027 (frames 16.9-59.1 kB) | <= 5 MB |
| `public/sequences/basement-mobile/0001-0060.avif` + `manifest.json` | 60 | 900x1600 | `[0,20,40,59]` | 40 | 1,889,687 (frames 14.3-44.8 kB) | <= 2 MB |

Posters = the exact first frame of each sequence (encoded from the same PNG as `0001.avif`, mozjpeg q84):
`public/images/basement/basement-poster-desktop.jpg` (1920x1080, 219,827 bytes) and
`public/images/basement/basement-poster-mobile.jpg` (900x1600, 157,402 bytes).

Checked on contact sheets of both sequences (same room through all four stages) and full-resolution crops of
the poster (sump pipe, where the retouched pipe print was) and the final frames (TV, console, books): no
text, logos or people.

### Credit tally (basement group)

| Item | Model | Jobs | Credits each | Credits |
|---|---|---|---|---|
| B1 model test, 16:9 + 9:16 | `gpt_image_2_5` (2k) | 2 | 2.75 | 5.50 |
| B1 renders (16:9 v1; 9:16 v1, v2-ref, v3) | `nano_banana_pro` (2k) | 4 | 2 | 8 |
| B2-B4 edits, both ratios | `nano_banana_pro` (2k) | 6 | 2 | 12 |
| Clip 1 16:9 (run 1) | `minimax_h3` (5 s, 2K) | 1 | 10 | 10 |
| Clips 2-3 16:9 and 1-3 9:16, run 1 | `minimax_h3` (5 s, 2K) | 5 | 10 | 50 |
| Same five clips, run 2 (duplicate takes) | `minimax_h3` (5 s, 2K) | 5 | 10 | 50 |
| **Basement group total** | | **23** | | **135.50** |

---

## 6. Stills group: generated asset manifest

Source: `assets-src/manifest/stills.md`.

Group: **stills** (raking-light test, atmosphere stills, basement "What we build" tiles, demo samples).
Outputs: `public/images/{raking,atmosphere,basement-tiles,samples}` from `assets-src/stills/raw`.
The `public/images/atmosphere/wall-stage-*` files come from the hero stage stills and are logged in `hero.md` §7.

Brief lines are quoted verbatim from `docs/CAPITAL_BUILD_BRIEF.md` §8.3 and §8.4. The tile and sample
subjects are not in the brief; they follow the file names (the basement page's "What we build" tiles and
the before/after demo samples). Under each brief line is the **exact prompt sent**, taken from the
Higgsfield generation history. Job ids come from `assets-src/stills/work/jobs.log` (written at generation
time) and match the history.

**Honesty (brief §3, §8.4):** every image here is AI-generated. The atmosphere stills are atmosphere, the
raking panels are a concept demo, the tiles are concept rooms, and the samples are demo before/after
pairs. The sample prompts ask for a documentary "jobsite photograph" look, so those files must always be
labelled as samples or illustrations. **None of these images may be captioned or presented as a completed
client project.**

**Seeds:** not exposed by the API; every entry lists the job id. Jobs requested as `nano_banana_pro` are
reported by the API as `nano_banana_2`. All stills: `resolution: "2k"`.

**Billing:** credits only (`use_unlim: false`), no free gens, no preference changes, no projects created.

---

### Credit tally (stills group)

| Item | Model | Jobs charged | Credits each | Credits |
|---|---|---|---|---|
| Atmosphere 16:9 (six subjects + smooth-ceiling v2) | `nano_banana_pro` | 7 | 2 | 14 |
| Atmosphere 16:9 (taping knife, paint roller) | `gpt_image_2_5` | 2 | 2.75 | 5.50 |
| Raking R1-R4 incl. retries | `nano_banana_pro` | 6 (2 refunded) | 2 | 8 |
| Basement tiles | `nano_banana_pro` | 6 | 2 | 12 |
| Tile clean-up edits | `nano_banana_pro` | 7 | 2 | 14 |
| Demo samples (befores, hallway, taping) | `nano_banana_pro` | 6 | 2 | 12 |
| Sample edits (afters, clean-ups) | `nano_banana_pro` | 6 | 2 | 12 |
| **Stills group total** | | **40** | | **77.50** |

Refunds: job `af8ed9e3-9843-42eb-8c01-f148787c1962` (R1, backend failure, +2) and job
`3f214d35-e0fa-4d32-96aa-d6d7d46c9d9f` (R3 first attempt, false-positive NSFW flag, +2).
Rejected submissions with no job and no charge: `gpt_image_2_5` for sanding ceiling, smooth ceiling,
bathroom and kitchen (HTTP 429, smooth ceiling retried twice more), one `flux_3_image` raking attempt (429).

Processing for every output: `scripts/assets/stills-process.mjs` (load raw PNG, optional retouch
of small text, logo or defect patches by Coons-patch inpaint with matched grain or by clone, optional
low-frequency light/colour match to a partner panel, crop, Lanczos resize to the exact size, JPEG mozjpeg q82).
Before/after and flat/raking partners use identical crops so they stay pixel-aligned.

---

### 1. Raking-light test (brief §8.3), 1200x1500

Brief lines (verbatim):
- R1: `a painted white interior wall evenly lit by soft overhead light, looks plain and smooth, photorealistic close-up`
- R2: same wall, `lit by a single low-angle light from the left, revealing visible taped seams, ridges, trowel marks, sanding swirls and two nail pops`
- R3: a second wall, flat-lit like R1
- R4: R3 `lit by a single low-angle light from the left, revealing a perfectly flat, uniform surface with no visible seams or marks`

All four: `nano_banana_pro`, aspect 4:5, raw 1856x2304, cover/centre to 1200x1500.

| Output | Raw | Seed / job id | Reference | Exact prompt | Post-processing |
|---|---|---|---|---|---|
| `public/images/raking/rushed-flat.jpg` (41,964 B) | `raking-r1-flat-nano-v1.png` (R1) | not exposed / job `8536ffbc-f24a-4fa7-af18-cb523f8a304d` (retry of failed `af8ed9e3`) | none | `a painted white interior wall evenly lit by soft overhead light, looks plain and smooth, photorealistic close-up` | none |
| `public/images/raking/rushed-raking.jpg` (211,842 B) | `raking-r2-raking-nano-v1.png` (R2) | not exposed / job `ca0d7b52-21cd-421a-87fc-a8f646a88b47` | R1 (`8536ffbc`) | `same wall, lit by a single low-angle light from the left, revealing visible taped seams, ridges, trowel marks, sanding swirls and two nail pops` | none |
| `public/images/raking/capital-flat.jpg` (18,451 B) | `raking-r3-flat-nano-v1.png` (R3) | not exposed / job `89a6b458-b7ff-4db0-b89e-76141b125425` | R1 (`8536ffbc`) | `a second wall, flat-lit like R1: a painted white interior wall evenly lit by soft overhead light, looks plain and smooth, photorealistic close-up, same framing as the reference image, no marks` | inpaint a faint hairline (878,930)-(940,1390) and a speck cluster (80,1200)-(175,1280); broad light/colour matched to R1 |
| `public/images/raking/capital-raking.jpg` (22,276 B) | `raking-r4-raking-nano-v1.png` (R4) | not exposed / job `27c5f3d9-3deb-49ca-ae29-8662efddc84d` | R2 (`ca0d7b52`) | `same wall, lit by a single low-angle light from the left, revealing a perfectly flat, uniform surface with no visible seams or marks. Remove every seam, ridge, trowel mark, sanding swirl and nail pop; keep exactly the same light, framing and colour.` | inpaint two leftover nail pops (220,1495)-(350,1615) and (840,1480)-(990,1630); broad light/colour matched to R2 |

Method deviations from the brief, recorded honestly: R4 was made as an edit of R2 (same raking light,
defects removed) rather than as R3 relit, so the "Capital" raking panel shares R2's light exactly. The R3
first attempt (job `3f214d35`, prompt `a second wall, flat-lit like this one: the same painted white interior wall with the same framing, evenly lit by the same soft overhead light, looks plain and smooth, photorealistic close-up, with the faint trowel streaks removed`)
was blocked by a false-positive NSFW flag and refunded.

### 2. Atmosphere stills (brief §8.4), 1920x1080 and 1200x1500

All generated at 16:9 (`nano_banana_pro` raw 2752x1536, `gpt_image_2_5` raw 2688x1520). The 16:9 output
is a cover/centre resize unless noted; the 4:5 output is a full-height crop of width `round(height x 0.8)`
starting at the listed x, resized to 1200x1500.

Shared style tail of every atmosphere prompt (exact; the macro shot says `shot on a full-frame camera with a macro lens`,
and the hands shot leaves out `no people, no faces` because hands are in frame):
`editorial architectural photography, cinematic low-key light, warm amber 3200K practical light against cool blue-grey shadow, texture-forward, real materials with honest imperfections, muted restrained colour, natural film grain, shot on a full-frame camera, calm and premium, no people, no faces, no text, no letters, no logos, no watermark`

#### Taping knife
Brief: `Macro: taping knife spreading joint compound over a seam, warm light`
Exact prompt: `Macro: taping knife spreading joint compound over a seam, warm light. Extreme close-up at a low grazing angle along a drywall wall: the polished steel blade of a wide taping knife drawing a thin, creamy layer of off-white joint compound across a paper-taped seam, a soft bead of wet compound gathering at the blade edge, only the blade and the wall surface in frame, a single warm work light raking in from the left, the wall falling away into cool shadow, very shallow depth of field, editorial architectural photography, cinematic low-key light, warm amber 3200K practical light against cool blue-grey shadow, texture-forward, real materials with honest imperfections, muted restrained colour, natural film grain, shot on a full-frame camera with a macro lens, calm and premium, no people, no faces, no text, no letters, no logos, no watermark`
- Kept: `atm-taping-knife-16x9-gpt-v1.png`, `gpt_image_2_5`, seed not exposed / job `37a633c6-0bc6-4412-9b1a-aabcfd79495e`
- Outputs: `public/images/atmosphere/taping-knife-16x9.jpg` (126,709 B), `public/images/atmosphere/taping-knife-4x5.jpg` (163,370 B, crop x=620)
- Not kept: `atm-taping-knife-16x9-nano-v1.png`, `nano_banana_pro`, job `46c78692-b302-46d2-9982-29c6c8ea8536` (same prompt)

#### Sanding ceiling
Brief: `Sanding pole with a dust-extraction hose against a smooth ceiling`
Exact prompt: `Sanding pole with a dust-extraction hose against a smooth ceiling. Upward view in a dim, empty room: the rectangular head of a drywall pole sander pressed flat against a freshly skimmed, smooth white ceiling, a ribbed grey dust-extraction hose clipped to the sanding head and curving down out of frame, the pole running diagonally down out of frame, a faint haze of fine dust hanging in a single warm work light that grazes across the ceiling from a low angle, the far corner of the ceiling falling into cool shadow, editorial architectural photography, cinematic low-key light, warm amber 3200K practical light against cool blue-grey shadow, texture-forward, real materials with honest imperfections, muted restrained colour, natural film grain, shot on a full-frame camera, calm and premium, no people, no faces, no text, no letters, no logos, no watermark`
- Kept: `atm-sanding-ceiling-16x9-nano-v1.png`, `nano_banana_pro`, seed not exposed / job `abf34cad-ebe3-4442-8b65-55579dd5125b`
- Outputs: `public/images/atmosphere/sanding-ceiling-16x9.jpg` (81,461 B), `public/images/atmosphere/sanding-ceiling-4x5.jpg` (137,597 B, crop x=950)

#### Paint roller (hands only)
Brief: `Hands rolling warm-white paint on a smooth wall (hands only)`
Exact prompt: `Hands rolling warm-white paint on a smooth wall (hands only). Close side view along the wall: a hand gripping a paint roller, rolling a fresh band of warm-white paint over a smooth primed wall, the wet satin edge where new paint meets dry wall, a few tiny paint flecks on the knuckles, warm light raking across the wall from the left, the background in soft cool shadow, hands only, no face, nothing of the body beyond the forearm, editorial architectural photography, cinematic low-key light, warm amber 3200K practical light against cool blue-grey shadow, texture-forward, real materials with honest imperfections, muted restrained colour, natural film grain, shot on a full-frame camera, calm and premium, no text, no letters, no logos, no watermark`
- Kept: `atm-paint-roller-16x9-gpt-v1.png`, `gpt_image_2_5`, seed not exposed / job `025cbfee-2876-444c-b53c-ef319a49dfb4`
- Outputs: `public/images/atmosphere/paint-roller-16x9.jpg` (101,250 B), `public/images/atmosphere/paint-roller-4x5.jpg` (110,429 B, crop x=820)
- Not kept: `atm-paint-roller-16x9-nano-v1.png`, `nano_banana_pro`, job `542990dd-b0d5-44f0-b1d6-9dedeed4e058` (same prompt)

#### Smooth flat ceiling with pot lights (popcorn-removal section)
Brief: `Smooth flat ceiling with pot lights (popcorn-removal section)`
Exact prompt (v2, kept): `Smooth flat ceiling with pot lights. A modest living room in an Ottawa suburban home at dusk, camera low and tilted up so the flat horizontal ceiling fills the top two-thirds of the frame: a perfectly smooth, flat, matte white drywall ceiling with a neat row of slim recessed LED pot lights glowing warm, a soft band of window light grazing across the ceiling plane and showing no ridges, seams or texture, a crisp clean line where the ceiling meets a plain painted wall, an ordinary wall window below showing snowy blue dusk, cool shadow in the far corner, standard 8-foot ceiling, editorial architectural photography, cinematic low-key light, warm amber 3200K practical light against cool blue-grey shadow, texture-forward, real materials with honest imperfections, muted restrained colour, natural film grain, shot on a full-frame camera, calm and premium, no people, no faces, no text, no letters, no logos, no watermark`
- Kept: `atm-smooth-ceiling-pot-lights-16x9-nano-v2.png`, `nano_banana_pro`, seed not exposed / job `8e17b5be-079f-4fbf-91a7-080ce9943e5a`
- Outputs: `public/images/atmosphere/smooth-ceiling-pot-lights-16x9.jpg` (128,688 B; crop 2468x1388 at (0,110) first, to drop a dark out-of-focus shape at the right edge that could read as a figure), `public/images/atmosphere/smooth-ceiling-pot-lights-4x5.jpg` (134,050 B, crop x=760)
- Not kept: `atm-smooth-ceiling-pot-lights-16x9-nano-v1.png`, job `e972c741-ebb6-446a-bc7d-836afc5837ab`, v1 prompt: `Smooth flat ceiling with pot lights. Low upward view across the living-room ceiling of a modest Ottawa suburban home at dusk: a perfectly smooth, flat, matte white drywall ceiling with a neat grid of slim recessed LED pot lights glowing warm, soft light from a window grazing across the ceiling and revealing no ridges, seams or texture, a crisp clean line where ceiling meets wall, the top of a window showing snowy blue dusk outside, cool shadow in the far corner, standard 8-foot ceiling,` + the shared style tail

#### Bathroom
Brief: `Modern bathroom: large-format tile shower, floating vanity`
Exact prompt: `Modern bathroom: large-format tile shower, floating vanity. A modestly sized renovated bathroom in an Ottawa suburban home in the evening: a walk-in shower clad floor to ceiling in large-format matte warm-grey porcelain tiles with tight grout lines, a frameless clear glass panel, a floating white-oak vanity with a simple white basin and a plain brushed-nickel faucet, a mirror reflecting only the tiled wall, a warm sconce glowing beside the mirror, cool blue evening light through a small frosted window, standard 8-foot ceiling, editorial architectural photography, cinematic low-key light, warm amber 3200K practical light against cool blue-grey shadow, texture-forward, real materials with honest imperfections, muted restrained colour, natural film grain, shot on a full-frame camera, calm and premium, no people, no faces, no text, no letters, no logos, no watermark`
- Kept: `atm-bathroom-tile-shower-16x9-nano-v1.png`, `nano_banana_pro`, seed not exposed / job `fdbc84a4-5a11-4825-bb3a-0af409846ae1`
- Outputs: `public/images/atmosphere/bathroom-tile-shower-16x9.jpg` (151,534 B), `public/images/atmosphere/bathroom-tile-shower-4x5.jpg` (165,468 B, crop x=1450)

#### Kitchen
Brief: `Updated kitchen: painted shaker cabinets, white tile backsplash`
Exact prompt: `Updated kitchen: painted shaker cabinets, white tile backsplash. A modest updated kitchen in an Ottawa suburban home at dusk: soft putty-grey painted shaker cabinets with simple brass pulls, a white tile backsplash with slightly uneven handmade glaze, a pale quartz counter with a wooden board and a ceramic jug, warm under-cabinet lights washing down the tile, a window over the sink looking onto a snowy backyard fence in blue dusk, standard 8-foot ceiling, lived-in but tidy, editorial architectural photography, cinematic low-key light, warm amber 3200K practical light against cool blue-grey shadow, texture-forward, real materials with honest imperfections, muted restrained colour, natural film grain, shot on a full-frame camera, calm and premium, no people, no faces, no text, no letters, no logos, no watermark`
- Kept: `atm-kitchen-shaker-cabinets-16x9-nano-v1.png`, `nano_banana_pro`, seed not exposed / job `e0179ff8-4394-4c67-825c-b9437c335120`
- Retouch: soap-bottle label with pseudo-text inpainted, (2331,1078)-(2385,1133)
- Outputs: `public/images/atmosphere/kitchen-shaker-cabinets-16x9.jpg` (171,765 B), `public/images/atmosphere/kitchen-shaker-cabinets-4x5.jpg` (169,402 B, crop x=1150)

### 3. Basement "What we build" tiles, 1200x1500

Subjects from the file names: rec room, home office, guest suite, gym/media room, bathroom + wet bar,
basement refresh. Each was generated at 4:5 (raw 1856x2304), then edited (single reference, the previous
version) to remove anything with text, a logo or a face, and finally cover-resized to 1200x1500.

Shared tail of every tile prompt (exact):
`smooth warm-white walls, a flat drywall ceiling with recessed pot lights and a crisp drywall bulkhead boxing in the ductwork, light oak luxury vinyl plank floor, white baseboards and trim, low 8-foot ceiling, calm and premium, real lived-in details, editorial interior photography, natural film grain, no faces, no letters, no logos, no watermark, photorealistic wide-angle 24mm interior photograph of a typical Ottawa suburban house basement, eye-level, identical camera position, soft daylight from small basement windows plus warm practical lights, no people, no text`

| Output | Kept raw | Generation chain (seed not exposed / job ids) | Exact prompts (base + tail; then each edit) | Retouch |
|---|---|---|---|---|
| `public/images/basement-tiles/rec-room.jpg` (129,772 B) | `tile-rec-room-nano-v2-clean.png` | base `32e8f2d9-de10-45c9-a460-80a91da03450` -> edit `e8a65d4e-f052-4968-936f-dcfb8464d1ca` | base: `A finished basement family rec room: a deep low sectional sofa in oatmeal fabric facing a low media console and a wall-mounted TV that is switched off, a wool rug, a woven basket of kids' toys, a floor lamp glowing warm, a small basement window with snow in the window well,` + tail. Edit: `Edit this photo: replace the two framed family photos on the media console with small framed abstract landscape prints with no people, replace every book in the console shelves with plain linen storage boxes and folded blankets, and replace the teddy bear in the basket with plain wooden blocks, so there are no faces, book spines or printed text anywhere. Keep everything else exactly the same: same framing, furniture, light and colour.` | TV bezel mark cloned from 26 px left, 3 px lower, (520,1224)-(546,1242) |
| `public/images/basement-tiles/home-office.jpg` (133,324 B) | `tile-home-office-nano-v2-clean.png` | base `9a62dba9-1667-4941-86a6-3c6013bf24f6` -> edit `1b0d203e-6696-4a82-803a-2b5272bd9a56` | base: `A quiet, bright basement home office: a simple white-oak desk beside a small basement window with snow in the window well, an upholstered desk chair, a closed plain laptop and a ceramic mug, a brass desk lamp glowing warm, a tall leafy plant, a low wooden credenza,` + tail. Edit: `Edit this photo: remove the books from the desk and the stack of books from the floor, put a small ceramic vase and a woven tray on the desk instead, make the closed laptop a plain silver lid with no logo, and fill the slatted credenza with plain storage boxes, so there is no logo or printed text anywhere. Keep everything else exactly the same: same framing, furniture, plant, window, light and colour.` | laptop-lid logo inpainted (436,1368)-(478,1387) |
| `public/images/basement-tiles/guest-suite.jpg` (119,505 B) | `tile-guest-suite-nano-v3-clean.png` | base `ddcaa6e3-1cfc-4c34-9147-a015509f50f6` -> edit `bcc32de8-1d39-4e75-a3b9-e389738f679a` (v2, not kept) -> edit `fe32268c-3aef-4fda-be3e-2dce69bbb549` | base: `A basement guest bedroom with an egress window: a neatly made queen bed with white linen and a wool throw, two bedside lamps glowing warm, a large egress window set into the foundation wall with a deep window well showing snow and daylight above, a small upholstered bench at the foot of the bed,` + tail. Edit 1: `Edit this photo: on the ledge by the window replace the books, the framed card and the labelled candle with a small plain ceramic vase and a plain unlabelled candle, and on the nightstand replace the books with a folded linen cloth, so there is no printed text or picture of people anywhere. Keep everything else exactly the same: same framing, bed, bench, lamps, window, light and colour.` Edit 2: `Edit this photo: remove the two books from the lower shelf of the left nightstand, leaving the shelf empty, so there is no printed text anywhere. Keep everything else exactly the same: same framing, bed, bench, lamps, window, light and colour.` | none |
| `public/images/basement-tiles/gym-media-room.jpg` (137,575 B) | `tile-gym-media-room-nano-v2-clean.png` | base `dc25ad46-bca8-4212-b089-e8904bb57110` -> edit `6e6cbcf7-88d8-428f-ba15-789034d14e0d` | base: `A basement home gym and media room: black rubber gym mats over part of the floor with a plain squat rack, a padded bench and a few plain unmarked dumbbells, a feature wall of vertical oak slat acoustic panels behind a large wall-mounted TV that is switched off, a small basement window high on the wall,` + tail. Edit: `Edit this photo: replace the water bottle with a plain matte black bottle with no logo, and replace the books in the console shelves with plain woven storage baskets, so there is no logo or printed text anywhere. Keep everything else exactly the same: same framing, squat rack, bench, dumbbells, acoustic wall, TV, light and colour.` | TV bezel logo inpainted (1752,1303)-(1781,1315) |
| `public/images/basement-tiles/bathroom-wet-bar.jpg` (114,785 B) | `tile-bathroom-wet-bar-nano-v2-clean.png` | base `aa23103b-e0ee-4e3d-8710-0db7bd2b4d8d` -> edit `03742e58-8ce2-4603-b16b-3cba1fea4f69` | base: `A basement wet bar: a compact wet bar with painted shaker lower cabinets, a small bar sink with a slim faucet, a pale quartz counter, two open oak floating shelves holding plain glassware, warm under-shelf lighting, and beyond it a half-open door to a small tiled basement bathroom,` + tail. Edit: `Edit this photo: remove the three wine bottles from the counter, leaving the wooden board and the towel, and make sure nothing has a printed label or text anywhere, including in the bathroom beyond the door. Keep everything else exactly the same: same framing, cabinets, shelves, glassware, door, light and colour.` | none |
| `public/images/basement-tiles/basement-refresh.jpg` (109,735 B) | `tile-basement-refresh-nano-v2-clean.png` | base `18387c27-3abd-4aa8-b2db-7c6b7678da92` -> edit `e0fcba76-4caa-4831-91d5-01617812fac8` | base: `A bright refreshed basement family room with smooth new drywall and ceiling: freshly finished smooth drywall walls and a flat smooth ceiling with pot lights, a simple sofa and a low console, a carpeted staircase with a white-painted railing, low afternoon daylight from a small basement window grazing across the smooth wall,` + tail. Edit: `Edit this photo: replace the books in the low console with plain woven storage baskets and a few plain ceramic pieces, so there are no book spines or printed text anywhere. Keep everything else exactly the same: same framing, sofa, staircase, framed prints, window, light and colour.` | none |

The `tile-*-nano-v1.png` bases and `tile-guest-suite-nano-v2-clean.png` are the not-kept steps of these chains.

### 4. Demo samples, 1600x1200

Subjects from the file names. Generated at 4:3 (raw 2400x1792), cover/centre resize to 1600x1200. Each
"after" is an edit of its "before" (single reference), so both share the camera and are pixel-aligned.

Shared tail of every base sample prompt (exact; the hallway, hole, ceiling and popcorn shots say
`real lived-in Ottawa suburban home`, the two basement shots `real Ottawa suburban home`; the two
ceiling shots say `straightforward documentary framing` without `eye-level`; the hole and water-damage
shots say `natural daylight from a nearby window`):
`honest jobsite photograph taken by the contractor, natural daylight, real lived-in Ottawa suburban home, straightforward eye-level documentary framing, unretouched, true-to-life colour, slight natural sensor noise, no people, no faces, no text, no letters, no logos, no watermark`

| Output | Raw | Seed / job id | Reference | Exact prompt |
|---|---|---|---|---|
| `public/images/samples/drywall-hole-repair-before.jpg` (154,464 B) | `sample-drywall-hole-repair-before-nano-v1.png` | not exposed / job `1b30c8b8-beac-4c94-8116-14eee096197e` | none | `A doorknob-size hole punched through a painted drywall wall in a hallway, just behind the edge of an open white interior door, ragged broken gypsum edges and torn paper face, a few gypsum crumbs on the white baseboard below, soft greige eggshell paint, honest jobsite photograph taken by the contractor, natural daylight from a nearby window, real lived-in Ottawa suburban home, straightforward eye-level documentary framing, unretouched, true-to-life colour, slight natural sensor noise, no people, no faces, no text, no letters, no logos, no watermark` |
| `public/images/samples/drywall-hole-repair-after.jpg` (114,148 B) | `sample-drywall-hole-repair-after-nano-v1.png` | not exposed / job `da31802a-c459-4b56-ab29-3788073ed5d9` | before (`1b30c8b8`) | `Edit this photo: repair the hole in the wall so it is completely invisible. The drywall is patched, sanded smooth and repainted in exactly the same greige eggshell paint, with no visible patch outline, and the gypsum crumbs are gone from the baseboard and floor. Keep everything else exactly the same: same camera position and framing, same door, baseboard, floor, daylight and colour. No people, no text.` |
| `public/images/samples/water-damaged-ceiling-before.jpg` (99,070 B) | `sample-water-damaged-ceiling-before-nano-v1.png` | not exposed / job `c6fcf027-8aaa-4d25-b32c-02c0820cf38f` | none | `A water-damaged drywall ceiling in a bedroom, looking up toward the corner: a large brown tide-mark stain with darker rings, the drywall sagging in a soft bulge, cracked paint and a split taped joint along the stain, part of the wall and a window frame visible at the edge, honest jobsite photograph taken by the contractor, natural daylight from a nearby window, real lived-in Ottawa suburban home, straightforward documentary framing, unretouched, true-to-life colour, slight natural sensor noise, no people, no faces, no text, no letters, no logos, no watermark` |
| `public/images/samples/water-damaged-ceiling-after.jpg` (59,706 B) | `sample-water-damaged-ceiling-after-nano-v1.png` | not exposed / job `188d545c-081d-4e6c-940a-2b49d133ffd9` | before (`c6fcf027`) | `Edit this photo: the water-damaged ceiling has been professionally repaired. The stained and sagging section is replaced and finished perfectly flat and smooth, freshly painted flat white to match the rest of the ceiling, with no stain, no rings, no cracks and no visible seam. Keep everything else exactly the same: same camera position and framing, same window, curtain, walls, daylight and colour. No people, no text.` |
| `public/images/samples/popcorn-ceiling-before.jpg` (298,878 B) | `sample-popcorn-ceiling-before-nano-v1.png` | not exposed / job `daa4534a-e936-41a4-b251-8bb2eca4adc7` | none | `A dated popcorn stipple ceiling in a 1980s living room, the bumpy texture slightly yellowed with age, an old frosted-glass flush-mount light fixture in the middle, the top of the walls and a window visible, low daylight from the window grazing across the textured ceiling, honest jobsite photograph taken by the contractor, natural daylight, real lived-in Ottawa suburban home, straightforward documentary framing, unretouched, true-to-life colour, slight natural sensor noise, no people, no faces, no text, no letters, no logos, no watermark` |
| `public/images/samples/popcorn-ceiling-after.jpg` (39,305 B) | `sample-popcorn-ceiling-after-nano-v1.png` | not exposed / job `98c6cc53-3ba8-4754-8651-df844a9f2887` | before (`daa4534a`) | `Edit this photo: the popcorn texture has been removed and the ceiling skim-coated perfectly smooth and flat, freshly painted clean flat white, and the old flush-mount light fixture is replaced by four slim recessed LED pot lights. Keep everything else exactly the same: same camera position and framing, same walls, window, curtain rod, daylight and colour. No people, no text.` |
| `public/images/samples/basement-finish-before.jpg` (198,848 B) | `sample-basement-finish-before-nano-v1.png` | not exposed / job `ec690abf-4407-48ab-af5b-94e04f9b077f` | none | `An unfinished basement corner in an Ottawa house: bare poured-concrete foundation walls with form-tie marks, exposed wood floor joists, a metal heating duct and wiring overhead, a bare bulb in a porcelain socket, a cracked concrete floor, a small hopper window with daylight and snow in the window well, honest jobsite photograph taken by the contractor, natural daylight, real Ottawa suburban home, straightforward eye-level documentary framing, unretouched, true-to-life colour, slight natural sensor noise, no people, no faces, no text, no letters, no logos, no watermark` |
| `public/images/samples/basement-finish-after.jpg` (65,319 B) | `sample-basement-finish-after-nano-v2-duct.png` | not exposed / job `d855684c-bc1c-42df-ba82-b593870542c7` (edit 1, not kept) -> job `7373ebb2-9d84-450a-9dbf-f0caf23aa159` (edit 2, kept) | before (`ec690abf`), then edit 1 | Edit 1: `Edit this photo: the same basement corner, now fully finished. Smooth warm-white drywall walls, a flat drywall ceiling with recessed pot lights, a crisp drywall bulkhead boxing in the duct, light oak luxury vinyl plank floor, white baseboards, the same small window now with a clean white drywall return, and the clutter removed. Keep exactly the same camera position, lens and framing, with the window in the same place and the same daylight. No people, no text.` Edit 2: `Edit this photo: enclose the exposed metal duct and the remaining exposed joists in the top right corner inside a smooth, crisp white drywall bulkhead that meets the flat drywall ceiling, so no ducts, joists or wires are visible anywhere. Keep everything else exactly the same: same camera position and framing, walls, window, floor, pot lights, light and colour.` |
| `public/images/samples/level-5-hallway.jpg` (119,582 B) | `sample-level-5-hallway-nano-v1.png` | not exposed / job `752c6f3b-d079-42d4-8b5b-668a57c7a464` | none | `A long upstairs hallway in an Ottawa suburban home with a Level 5 smooth wall finish: low afternoon sunlight from a window at the end of the hall rakes along the full length of a freshly painted matte white wall, the surface perfectly flat and uniform with no seams, ridges or nail pops even under the side light, white baseboards and door casings, a light oak floor, honest jobsite photograph taken by the contractor, natural daylight, real lived-in Ottawa suburban home, straightforward eye-level documentary framing, unretouched, true-to-life colour, slight natural sensor noise, no people, no faces, no text, no letters, no logos, no watermark` |
| `public/images/samples/basement-drywall-taping.jpg` (113,404 B) | `sample-basement-drywall-taping-nano-v2-clean.png` | not exposed / job `3df1291c-97bd-40a0-b9fa-74b41a9bfd8c` (base, not kept) -> job `22aa5230-e1de-4107-905f-068d3e6a13fd` (clean-up edit, kept) | base | Base: `Basement walls taped and mudded mid-job, no people: new drywall with paper-taped seams and screw heads spotted with wet off-white joint compound, a mudded inside corner, a steel mud pan and a taping knife resting on an overturned plain unbranded bucket, a drop cloth on the concrete floor, a work light on a tripod stand, a small basement window, honest jobsite photograph taken by the contractor, natural daylight, real Ottawa suburban home, straightforward eye-level documentary framing, unretouched, true-to-life colour, slight natural sensor noise, no people, no faces, no text, no letters, no logos, no watermark` Edit: `Edit this photo: remove all printed labels, text and symbols from the blue bucket and remove the small sticker from the tripod leg, leaving plain scuffed blue plastic and a plain grey tripod leg. Keep everything else exactly the same: same framing, walls, tools, drop cloth, light and colour.` |

### 5. Intermediates (not published)

`assets-src/stills/work/`: `*-aligned.png` and `tmp-blend-*.png` are alignment experiments from
`scripts/assets/stills-align.mjs` and `stills-blend.mjs` (the final outputs use the raw "after" edits
directly), `debug-r4-inpainted.png` is a debug dump of the R4 inpaint, `preview/` holds review crops,
`jobs.log`, `process-run.log` and `final-inventory.txt` are the stills agent's own logs.
