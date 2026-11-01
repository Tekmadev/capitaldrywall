# Hero group: generated asset manifest

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

## Credit tally

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

## Stage style suffix (brief §8.1, verbatim, appended to every stage prompt)

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

## How this section was reconstructed

The agent that produced the hero group was interrupted before writing this part. Everything below was
rebuilt from the files on disk (`assets-src/hero/raw`, `clips`, `frames-*`, the masters, `public/...`),
the scripts (`scripts/assets/hero-*.mjs`) and the Higgsfield generation history, which records for every
job the requested model, params, exact prompt and reference/start/end images. Which raw variant was kept
was verified by SSIM of each raw still against the sequence frame at its manifest stage index (kept
variant 0.97-0.99; rejected variants 0.47-0.81). Seed: not exposed by the API for any of these models.

---

## 1. Stage stills (keyframes)

Method (brief §8 steps 1-2): S1 generated from text in four models; the kept S1 was then edited
(single reference image, the S1 still of the same ratio) into S2, S4 and S5. S3 is the one method change:
the first S3 (edit of S1) was not used; the kept S3 is an edit of **S2** of the same ratio (same prompt).
All stills: params `{resolution: "2k", aspect_ratio: "16:9" | "9:16"}`, 2 credits each (nano_banana_pro),
output 2752x1536 / 1536x2752 PNG.

### S1 (text to image)
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

### S2 (edit of S1)
Prompt (exact, both ratios):
`same framing, drywall seams covered with paper tape bedded in wet joint compound, screw heads spotted with compound, slight wet sheen, photorealistic, cinematic, dark interior room, a single low-angle warm work light (3200K) grazing the wall surface from the left, strong raking light revealing surface texture, fine dust particles drifting in the beam, shallow depth of field, 35mm lens, camera at chest height facing the wall, wall fills the frame, no people, no text, no logos`

| Raw file | Model | Seed / job id | Reference | Status |
|---|---|---|---|---|
| `assets-src/hero/raw/s2-desktop-nbp-v1.png` | nano_banana_pro | not exposed / job `577ae0ba-c470-4b05-81fc-803dfd22481a` | S1 desktop (`964d78c1`) | **kept** |
| `assets-src/hero/raw/s2-mobile-nbp-v1.png` | nano_banana_pro | not exposed / job `d7805a96-cde8-4ff7-bcfd-93c425233861` | S1 mobile (`ea443387`) | **kept** |

### S3 (edit of S2: the method change)
Prompt (exact, both ratios, unchanged between v1 and v2):
`same framing, joints feathered wide with three coats of off-white joint compound, broad smooth trowel strokes visible, photorealistic, cinematic, dark interior room, a single low-angle warm work light (3200K) grazing the wall surface from the left, strong raking light revealing surface texture, fine dust particles drifting in the beam, shallow depth of field, 35mm lens, camera at chest height facing the wall, wall fills the frame, no people, no text, no logos`

| Raw file | Model | Seed / job id | Reference | Status |
|---|---|---|---|---|
| `assets-src/hero/raw/s3-desktop-nbp-v2.png` | nano_banana_pro | not exposed / job `cffc9480-c739-4fe9-81c1-ac1bef6d3996` | S2 desktop (`577ae0ba`) | **kept** |
| `assets-src/hero/raw/s3-mobile-nbp-v2.png` | nano_banana_pro | not exposed / job `c4d321cb-5aeb-4623-80b6-471165a71611` | S2 mobile (`d7805a96`) | **kept** |
| `assets-src/hero/raw/s3-desktop-nbp-v1.png` | nano_banana_pro | not exposed / job `e39e6d1e-95e3-4272-8693-e280e90cf969` | S1 desktop | not used |
| `assets-src/hero/raw/s3-mobile-nbp-v1.png` | nano_banana_pro | not exposed / job `973f9916-3977-4a94-a4c4-7899fb95108a` | S1 mobile | not used |

### S4 (edit of S1)
Prompt (exact, both ratios):
`same framing, fully sanded uniform matte compound surface, seams invisible, a little fine sanding dust in the light beam, photorealistic, cinematic, dark interior room, a single low-angle warm work light (3200K) grazing the wall surface from the left, strong raking light revealing surface texture, fine dust particles drifting in the beam, shallow depth of field, 35mm lens, camera at chest height facing the wall, wall fills the frame, no people, no text, no logos`

| Raw file | Model | Seed / job id | Reference | Status |
|---|---|---|---|---|
| `assets-src/hero/raw/s4-desktop-nbp-v1.png` | nano_banana_pro | not exposed / job `b03391ca-fb97-4284-918d-9a2b9e3d29b1` | S1 desktop (`964d78c1`) | **kept** |
| `assets-src/hero/raw/s4-mobile-nbp-v1.png` | nano_banana_pro | not exposed / job `34b4de8b-3440-4110-a055-2ae8f0ad5948` | S1 mobile (`ea443387`) | **kept** |

### S5 (edit of S1)
Prompt (exact, both ratios):
`same framing, flawless finished wall painted warm off-white, perfectly smooth under the raking light, no seams or ridges visible, calm and premium, photorealistic, cinematic, dark interior room, a single low-angle warm work light (3200K) grazing the wall surface from the left, strong raking light revealing surface texture, fine dust particles drifting in the beam, shallow depth of field, 35mm lens, camera at chest height facing the wall, wall fills the frame, no people, no text, no logos`

| Raw file | Model | Seed / job id | Reference | Status |
|---|---|---|---|---|
| `assets-src/hero/raw/s5-desktop-nbp-v1.png` | nano_banana_pro | not exposed / job `bd510dcd-be78-4a28-b670-64379d897dcd` | S1 desktop (`964d78c1`) | **kept** (also the loop keyframe) |
| `assets-src/hero/raw/s5-mobile-nbp-v1.png` | nano_banana_pro | not exposed / job `8a80f68f-6349-4ea3-ba88-e953162bfe1f` | S1 mobile (`ea443387`) | **kept** |

---

## 2. Interpolation clips (brief §8 step 3)

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

## 3. Masters, frames and AVIF scroll sequences (brief §8 step 4)

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

## 4. Posters (= exact last frame of each sequence)

`scripts/assets/hero-posters.mjs` from the same PNG the last AVIF frame was encoded from (JPEG mozjpeg q84,
AVIF q55 effort 6; all four confirmed by a byte-identical re-encode):

| Output | Size | Bytes | Source frame |
|---|---|---|---|
| `public/images/hero/hero-poster-desktop.jpg` | 1920x1080 | 59,136 | `frames-desktop/0150.png` |
| `public/images/hero/hero-poster-desktop.avif` | 1920x1080 | 15,698 | `frames-desktop/0150.png` |
| `public/images/hero/hero-poster-mobile.jpg` | 900x1600 | 51,755 | `frames-mobile/0072.png` |
| `public/images/hero/hero-poster-mobile.avif` | 900x1600 | 14,594 | `frames-mobile/0072.png` |

## 5. Drywall-page raking-light loop (brief §8.4, last bullet)

Brief line (verbatim): `Short loop (≤ 1.5 MB, muted, poster) for the Drywall page hero: raking light slowly sweeping across a flawless wall`

- Model `kling3_0`, params `{duration: 6, aspect_ratio: "16:9", mode: "pro", cfg_scale: 0.5, sound: "off", enhance_prompt: false}`,
  10.50 credits, seed not exposed / job `427037df-b6cd-4074-96b8-8eabb3b78ad9`; start image = end image = S5 desktop (`bd510dcd`).
- Exact prompt: `the low warm work light slowly sweeps across the flawless smooth painted wall, static camera, faint dust drifting in the beam, no people, no text`
- Source: `assets-src/hero/clips/drywall-loop-kling.mp4` (1928x1076, 145 frames, 6.04 s).
- `scripts/assets/hero-loop.mjs` (repeated last frame dropped for a seamless loop, 1280x720, no audio):
  `public/video/drywall-raking-loop.mp4` (H.264, 144 frames, 6.0 s, 321,080 bytes),
  `public/video/drywall-raking-loop.webm` (VP9, 158,655 bytes),
  poster `public/images/hero/drywall-loop-poster.jpg` (first frame, 1280x720, mozjpeg q82, 27,260 bytes).

## 6. OG base (brief §8.5)

Brief line (verbatim): `Dark wall with an amber raking beam and negative space for text. Page titles are overlaid via next/og.`

Exact prompt (both candidates):
`Dark wall with an amber raking beam and negative space for text: photorealistic, cinematic view of a smooth dark painted interior wall in a dark room at night, a single warm amber work-light beam (3200K) enters from the right edge of the frame and rakes across the right half of the wall at a very low grazing angle, revealing faint fine surface texture, the light falls off softly toward the centre, the entire left half of the frame is calm, even, deep shadow with almost no detail, negative space for text, fine dust drifting in the beam, 35mm lens, no people, no text, no letters, no logos, no watermark`

| Raw file | Model | Seed / job id | Status |
|---|---|---|---|
| `assets-src/hero/raw/og-base-gpt-v1.png` (2688x1520) | gpt_image_2_5 (2k, 16:9) | not exposed / job `a5b9c085-7a66-4502-8b36-277f27dd7aaf` | **kept** -> `assets/og/og-base.jpg` (1200x630, 26,267 bytes, `scripts/assets/hero-og.mjs`, cover/centre, mozjpeg q84, confirmed by a byte-identical re-encode) |
| `assets-src/hero/raw/og-base-nbp-v1.png` (2752x1536) | nano_banana_pro (2k, 16:9) | not exposed / job `04533a00-3c6d-4130-af40-6aac05f9783f` | not used |

## 7. Wall-stage stills for the drywall page (re-export of the kept stage stills)

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
